# ⚡ QuantRank

**The ultimate crowdsourced ranking platform for quantitative finance firms.**

Vote on head-to-head matchups between hedge funds, trading firms, and banks to discover which companies people prefer working at.

![QuantRank Demo](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![License](https://img.shields.io/badge/License-MIT-blue)

## Features

- **Head-to-Head Voting**: Swipe-style comparison between firms
- **Real-time Rankings**: Live win rates and statistics
- **Community Comments**: Share why you prefer certain firms
- **Detailed Firm Pages**: View stats, comments, and career links
- **Modern UI**: Dark mode, smooth animations, responsive design
- **Fully Dockerized**: One-command deployment

## Tech Stack

### Frontend
- **React 18** with Vite
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Modern ES6+** JavaScript

### Backend
- **Flask** (Python 3.11)
- **SQLite** database
- **Flask-CORS** for API access
- **Gunicorn** for production serving

## Quick Start

### Option 1: Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/yourusername/quantrank.git
cd quantrank

# Build and run with Docker Compose
docker-compose up -d

# Visit http://localhost:5000
```

### Option 2: Local Development

**Prerequisites:**
- Python 3.11+
- Node.js 18+
- npm or yarn

**Backend Setup:**
```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run backend
python app.py
```

**Frontend Setup:**
```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Visit:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api

## Docker Commands

```bash
# Build the image
docker build -t quantrank .

# Run container
docker run -p 5000:5000 -v quantrank-data:/app/data quantrank

# Using Docker Compose
docker-compose up -d          # Start in background
docker-compose logs -f        # View logs
docker-compose down           # Stop services
docker-compose down -v        # Stop and remove volumes
```

## Project Structure

```
quantrank/
├── src/                      # React frontend
│   ├── components/
│   │   ├── SwipeView.js     # Voting interface
│   │   ├── FirmsList.js     # All firms listing
│   │   └── FirmDetail.js    # Individual firm page
│   └── App.js               # Main router
├── public/                   # Static assets
├── app.py                    # Flask backend
├── firmslist.json           # Initial firm data
├── requirements.txt         # Python dependencies
├── package.json             # Node dependencies
├── Dockerfile               # Container configuration
├── docker-compose.yml       # Multi-container setup
└── README.md                # This file
```

## API Endpoints

### GET `/api/matchup`
Get random pair of firms for voting
```json
{
  "firms": [
    {"id": 1, "name": "Jane Street", "type": "Trading Firm"},
    {"id": 2, "name": "Citadel", "type": "Hedge Fund"}
  ]
}
```

### POST `/api/vote`
Submit a vote
```json
{
  "winner_id": 1,
  "loser_id": 2,
  "comment": "Better work-life balance"
}
```

### POST `/api/vote/:id/comment`
Add comment to existing vote
```json
{
  "comment": "Great culture and compensation"
}
```

### GET `/api/firms`
Get all firms with statistics

### GET `/api/firm/:id`
Get detailed firm information and comments

## Deployment

### Deploy to Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Create new project
railway init

# Deploy
railway up
```

### Deploy to Render

1. Create new Web Service
2. Connect your GitHub repo
3. Set build command: `docker build -t quantrank .`
4. Set start command: `docker run -p 10000:5000 quantrank`

### Deploy to Fly.io

```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Launch app
fly launch

# Deploy
fly deploy
```

## Environment Variables

```bash
# Production
FLASK_ENV=production
DATABASE=/app/data/quantrank.db
PORT=5000

# Development
FLASK_ENV=development
DATABASE=quantrank.db
PORT=5000
```

## Adding New Firms

Edit `firmslist.json`:

```json
{
  "name": "Your Firm",
  "type": "Hedge Fund"
}
```

Types: `Hedge Fund`, `Trading Firm`, `Global Bank`, `Bank`, `Asset Manager`, `FinTech`

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## License

MIT License - see [LICENSE](LICENSE) file

## Acknowledgments

- Inspired by the quantitative finance community
- Built with modern web technologies
- Designed for speed and simplicity

## Contact

Questions? Open an issue or reach out!