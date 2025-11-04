from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import sqlite3
import os
from datetime import datetime
import json

app = Flask(__name__, static_folder='static')
CORS(app)

DATABASE = os.environ.get('DATABASE', 'quantrank.db')
FIRMS_FILE = 'firmslist.json'

# --- DATABASE UTILITIES ---

def get_db():
    # Connects to the database path defined above
    db = sqlite3.connect(DATABASE)
    db.row_factory = sqlite3.Row
    return db

def init_db():
    # Check if the database file already exists. 
    # This check is crucial for persistence.
    db_exists = os.path.exists(DATABASE)
    db = get_db()
    
    # 1. Always ensure tables exist using 'CREATE TABLE IF NOT EXISTS'
    db.execute('''
        CREATE TABLE IF NOT EXISTS firms (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            type TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    db.execute('''
        CREATE TABLE IF NOT EXISTS votes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            winner_id INTEGER NOT NULL,
            loser_id INTEGER NOT NULL,
            comment TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (winner_id) REFERENCES firms (id),
            FOREIGN KEY (loser_id) REFERENCES firms (id)
        )
    ''')
    
    # 2. Populate initial data ONLY if the database file did not exist before this run.
    if not db_exists:
        print(f"INFO: Database file {DATABASE} is new. Initializing with firms data...")
        try:
            with open(FIRMS_FILE, 'r', encoding='utf-8') as f:
                firms_data = json.load(f)
        except FileNotFoundError:
            print(f"WARNING: {FIRMS_FILE} not found. Skipping initial firm population.")
            db.close()
            return
        except json.JSONDecodeError:
            print(f"ERROR: Could not decode JSON from {FIRMS_FILE}. Skipping initial firm population.")
            db.close()
            return

        # Filter out invalid entries
        firms_to_insert = [firm for firm in firms_data if firm.get('name') and firm.get('type')]

        for firm in firms_to_insert:
            name = firm['name']
            firm_type = firm['type']
            # Using INSERT OR IGNORE protects against duplicate entries 
            # if the firms table somehow gets truncated or re-run
            try:
                db.execute('INSERT OR IGNORE INTO firms (name, type) VALUES (?, ?)', (name, firm_type))
            except Exception as e:
                print(f"Error inserting firm {name}: {e}")

        print(f"INFO: Successfully inserted {len(firms_to_insert)} unique firms.")
    else:
        print(f"INFO: Database file {DATABASE} already exists. Skipping initial firm population.")
    
    db.commit()
    db.close()


@app.route('/api/matchup', methods=['GET'])
def get_matchup():
    db = get_db()
    firms = db.execute('SELECT id, name, type FROM firms ORDER BY RANDOM() LIMIT 2').fetchall()
    db.close()
    
    if len(firms) < 2:
        return jsonify({'error': 'Not enough firms'}), 400
    
    return jsonify({
        'firms': [
            {'id': f['id'], 'name': f['name'], 'type': f['type']}
            for f in firms
        ]
    })

@app.route('/api/vote', methods=['POST'])
def submit_vote():
    data = request.get_json(silent=True) 

    if data is None:
        print("DEBUG: Vote request received with missing or invalid JSON body.")
        return jsonify({'error': 'Invalid or missing JSON data in request body.'}), 400

    winner_id = data.get('winner_id')
    loser_id = data.get('loser_id')
    comment = (data.get('comment') or '').strip()

    if not winner_id or not loser_id:
        return jsonify({'error': 'Missing winner or loser ID'}), 400
    
    db_comment = comment if comment else None 
    
    db = get_db()
    cursor = db.execute(
        'INSERT INTO votes (winner_id, loser_id, comment) VALUES (?, ?, ?)',
        (winner_id, loser_id, db_comment)
    )
    vote_id = cursor.lastrowid
    db.commit()
    db.close()
    
    return jsonify({'success': True, 'vote_id': vote_id})

@app.route('/api/vote/<int:vote_id>/comment', methods=['POST'])
def add_comment_to_vote(vote_id):
    data = request.get_json(silent=True)
    
    if data is None:
        return jsonify({'error': 'Invalid or missing JSON data'}), 400
    
    comment = (data.get('comment') or '').strip()
    
    if not comment:
        return jsonify({'error': 'Comment cannot be empty'}), 400
    
    db = get_db()
    
    vote = db.execute('SELECT id FROM votes WHERE id = ?', (vote_id,)).fetchone()
    if not vote:
        db.close()
        return jsonify({'error': 'Vote not found'}), 404
    
    db.execute('UPDATE votes SET comment = ? WHERE id = ?', (comment, vote_id))
    db.commit()
    db.close()
    
    return jsonify({'success': True, 'message': 'Comment added successfully'})

@app.route('/api/firms', methods=['GET'])
def get_firms():
    db = get_db()
    
    firms = db.execute('''
        SELECT 
            f.id,
            f.name,
            f.type,
            COUNT(DISTINCT CASE WHEN v.winner_id = f.id THEN v.id END) as wins,
            COUNT(DISTINCT CASE WHEN v.loser_id = f.id THEN v.id END) as losses
        FROM firms f
        LEFT JOIN votes v ON f.id = v.winner_id OR f.id = v.loser_id
        GROUP BY f.id
        ORDER BY wins DESC, f.name ASC
    ''').fetchall()
    
    result = []
    for firm in firms:
        total = firm['wins'] + firm['losses']
        win_rate = (firm['wins'] / total * 100) if total > 0 else 0
        result.append({
            'id': firm['id'],
            'name': firm['name'],
            'type': firm['type'],
            'wins': firm['wins'],
            'losses': firm['losses'],
            'total': total,
            'win_rate': round(win_rate, 1)
        })
    
    db.close()
    return jsonify({'firms': result})

@app.route('/api/firm/<int:firm_id>', methods=['GET'])
def get_firm_details(firm_id):
    db = get_db()
    
    firm = db.execute('SELECT id, name, type FROM firms WHERE id = ?', (firm_id,)).fetchone()
    if not firm:
        db.close()
        return jsonify({'error': 'Firm not found'}), 404
    
    stats = db.execute('''
        SELECT 
            COUNT(CASE WHEN winner_id = ? THEN 1 END) as wins,
            COUNT(CASE WHEN loser_id = ? THEN 1 END) as losses
        FROM votes
        WHERE winner_id = ? OR loser_id = ?
    ''', (firm_id, firm_id, firm_id, firm_id)).fetchone()
    
    comments = db.execute('''
        SELECT 
            v.comment,
            v.created_at,
            CASE 
                WHEN v.winner_id = ? THEN 'picked'
                ELSE 'passed'
            END as sentiment,
            CASE 
                WHEN v.winner_id = ? THEN f2.name
                ELSE f2.name
            END as other_firm
        FROM votes v
        LEFT JOIN firms f2 ON (
            CASE 
                WHEN v.winner_id = ? THEN v.loser_id
                ELSE v.winner_id
            END = f2.id
        )
        WHERE (v.winner_id = ? OR v.loser_id = ?)
        AND v.comment IS NOT NULL
        ORDER BY v.created_at DESC
        LIMIT 20
    ''', (firm_id, firm_id, firm_id, firm_id, firm_id)).fetchall()
    
    total = stats['wins'] + stats['losses']
    win_rate = (stats['wins'] / total * 100) if total > 0 else 0
    
    db.close()
    
    return jsonify({
        'firm': {
            'id': firm['id'],
            'name': firm['name'],
            'type': firm['type'],
            'wins': stats['wins'],
            'losses': stats['losses'],
            'total': total,
            'win_rate': round(win_rate, 1)
        },
        'comments': [
            {
                'text': c['comment'],
                'sentiment': c['sentiment'],
                'other_firm': c['other_firm'],
                'created_at': c['created_at']
            }
            for c in comments
        ]
    })

# Serve React app for production
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    init_db()
    # Use environment variables for production
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV', 'production') == 'development'
    app.run(host='0.0.0.0', port=port, debug=debug)