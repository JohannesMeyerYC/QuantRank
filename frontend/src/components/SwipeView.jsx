import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const API_URL = "/api";

const CustomStyles = () => (
  <style>
    {`
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes scaleIn {
        from { opacity: 0; transform: scale(0.8); }
        to { opacity: 1; transform: scale(1); }
      }
      @keyframes pulseShadow {
        0%, 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
        50% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
      }
      .animate-pulse-shadow {
        animation: pulseShadow 2s infinite;
      }
    `}
  </style>
);

function SwipeView() {
  const [matchup, setMatchup] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [comment, setComment] = useState("");
  const [showComment, setShowComment] = useState(false);
  const [hasCommented, setHasCommented] = useState(false);

  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [resultData, setResultData] = useState(null);
  const [voteId, setVoteId] = useState(null); // Store vote ID for later comment submission

  useEffect(() => {
    document.body.style.backgroundColor = '#0f172a';
    document.body.style.color = 'white';
    document.body.style.fontFamily = 'Inter, sans-serif';
    return () => {
      document.body.style.backgroundColor = '';
      document.body.style.color = '';
      document.body.style.fontFamily = '';
    }
  }, []);

  const fetchMatchup = async () => {
    setLoading(true);
    setComment("");
    setShowComment(false);
    setHasCommented(false);
    setResult(null);
    setResultData(null);
    setVoteId(null);

    try {
      const response = await fetch(`${API_URL}/matchup`);
      const data = await response.json();
      setMatchup(data);
    } catch (error) {
      console.error("Error fetching matchup:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMatchup();
  }, []);

  const handleVote = async (winnerId, loserId) => {
    const winner = matchup.firms.find((f) => f.id === winnerId);
    const loser = matchup.firms.find((f) => f.id === loserId);

    setSubmitting(true);

    try {
      // Submit vote WITHOUT comment initially
      const voteResponse = await fetch(`${API_URL}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          winner_id: winnerId,
          loser_id: loserId,
          comment: null, // No comment on initial vote
        }),
      });

      const voteData = await voteResponse.json();
      setVoteId(voteData.vote_id); // Store the vote ID

      // Fetch stats for the winner
      const statsResponse = await fetch(`${API_URL}/firm/${winnerId}`);
      const statsData = await statsResponse.json();

      setResult({ winner: winner.name, loser: loser.name });
      setResultData({
        firm: statsData.firm,
        comments: statsData.comments.slice(0, 3),
      });
    } catch (error) {
      console.error("Error submitting vote:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePostVoteComment = async () => {
    if (!comment.trim() || !voteId) return;
    
    try {
      const response = await fetch(`${API_URL}/vote/${voteId}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          comment: comment.trim(),
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setHasCommented(true);
        setShowComment(false);
        setComment("");
      } else {
        console.error("Failed to submit comment:", data.error);
      }
    } catch (error) {
      console.error("Error submitting comment:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <CustomStyles />
        <div className="text-center">
          {/* CHANGED: Removed spinning border animation, replaced with pulsing icon */}
          <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse-shadow">
            <svg className="w-10 h-10 text-emerald-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <p className="text-gray-300 text-xl font-semibold animate-pulse">
            Loading next financial showdown...
          </p>
        </div>
      </div>
    );
  }

  if (!matchup || !matchup.firms || matchup.firms.length < 2) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <CustomStyles />
        <div className="text-center bg-gray-800/60 backdrop-blur-lg rounded-3xl p-10 border border-red-500/40 shadow-2xl">
          <div className="text-7xl mb-6">⚠️</div>
          <h2 className="text-3xl font-bold text-red-400 mb-6">
            Not enough firms to compare!
          </h2>
          <button
            onClick={fetchMatchup}
            className="px-8 py-4 bg-emerald-500 text-white font-bold text-lg rounded-xl hover:bg-emerald-600 transition-all duration-300 shadow-lg hover:shadow-emerald-500/50 hover:scale-105"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (result && resultData) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 overflow-y-auto">
        <CustomStyles />
        <div className="w-full max-w-3xl py-8">
          {/* CHANGED: Reduced padding for mobile (p-6) */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 backdrop-blur-lg rounded-3xl p-6 sm:p-10 border border-emerald-500/40 shadow-2xl shadow-emerald-500/20 animate-[fadeIn_0.5s_ease-out]">
            
            {/* CHANGED: Reduced icon size for mobile */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-[scaleIn_0.6s_ease-out] animate-pulse-shadow">
              <svg className="w-16 h-16 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>

            {/* CHANGED: Reduced text size for mobile */}
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4 text-center">
              Vote Recorded!
            </h2>
            {/* CHANGED: Reduced text size for mobile */}
            <p className="text-lg sm:text-2xl text-gray-300 mb-8 leading-relaxed text-center">
              You picked{" "}
              <span className="text-emerald-400 font-black">{result.winner}</span>
              {" "}over{" "}
              <span className="text-gray-500 font-semibold">{result.loser}</span>
            </p>

            {/* Stats Section */}
            {/* CHANGED: Reduced padding for mobile (p-4) */}
            <div className="bg-gray-800/60 rounded-2xl p-4 sm:p-6 mb-6 border border-gray-700/50">
              {/* CHANGED: Stacked flex column on mobile (flex-col) to prevent cropping */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                {/* CHANGED: Reduced text size, centered on mobile */}
                <span className="text-gray-400 font-semibold text-base sm:text-lg text-center sm:text-left mb-2 sm:mb-0">
                  {result.winner}'s Community Pick Rate
                </span>
                {/* CHANGED: Reduced text size, centered on mobile */}
                <span className="text-2xl sm:text-3xl font-black text-emerald-400 text-center sm:text-left">
                  {resultData.firm.win_rate}%
                </span>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between text-sm text-gray-500 font-medium mb-2">
                  <span>Passed</span>
                  <span>Picked</span>
                </div>
                <div className="h-4 bg-gray-700 rounded-full overflow-hidden relative shadow-inner">
                  <div
                    className={`h-full transition-all duration-1000 ${
                      resultData.firm.win_rate >= 60
                        ? "bg-gradient-to-r from-emerald-500 to-emerald-400"
                        : resultData.firm.win_rate >= 40
                        ? "bg-gradient-to-r from-yellow-500 to-yellow-400"
                        : "bg-gradient-to-r from-red-500 to-red-400"
                    }`}
                    style={{ width: `${resultData.firm.win_rate}%` }}
                  ></div>
                </div>
              </div>

              <div className="text-center text-gray-400 text-sm">
                <span className="font-semibold text-white">{resultData.firm.total}</span>
                {" "}people voted on {result.winner}
              </div>
            </div>

            {/* POST-VOTE COMMENT SECTION */}
            {!hasCommented ? (
              // CHANGED: Reduced padding for mobile (p-4)
              <div className="bg-gray-800/60 rounded-2xl p-4 sm:p-6 mb-6 border border-emerald-700/50">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <span className="text-2xl mr-3"></span> Add your reason (Optional)
                </h3>
                {showComment ? (
                  <div className="space-y-4">
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder={`Explain why you chose ${result.winner}`}
                      rows="3"
                      className="w-full p-4 bg-gray-900/80 text-gray-100 placeholder-gray-500 border border-emerald-500/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none transition-all duration-300"
                    />
                    <button
                      onClick={handlePostVoteComment}
                      disabled={!comment.trim()}
                      className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Submit Comment
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowComment(true)}
                    className="w-full py-3 px-6 text-blue-400 font-semibold bg-gray-900 rounded-xl hover:bg-gray-700 transition-all duration-300 border border-blue-400/30"
                  >
                    Click to add a comment now
                  </button>
                )}
              </div>
            ) : (
              <div className="bg-emerald-800/30 rounded-2xl p-4 mb-6 border border-emerald-500/40 text-center">
                <p className="text-emerald-400 font-semibold">
                  Thanks! Your comment has been saved to the database.
                </p>
              </div>
            )}

            {/* Recent Comments */}
            {resultData.comments.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-4">
                  What others are saying
                </h3>
                <div className="space-y-3">
                  {resultData.comments.map((comment, index) => (
                    <div
                      key={index}
                      className={`bg-gray-800/60 rounded-xl p-4 border-l-4 ${
                        comment.sentiment === "picked"
                          ? "border-emerald-500"
                          : "border-red-500"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`inline-flex items-center px-2 py-1 text-xs font-bold rounded-full ${
                            comment.sentiment === "picked"
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : "bg-red-500/20 text-red-400 border border-red-500/30"
                          }`}
                        >
                          {comment.sentiment === "picked" ? "✓" : "✗"}
                        </span>
                        <span className="text-xs text-gray-500">
                          vs {comment.other_firm}
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        "{comment.text}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              {/* CHANGED: Reduced padding and text size for mobile */}
              <button
                onClick={fetchMatchup}
                className="w-full px-8 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-black text-lg sm:text-xl rounded-2xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 shadow-xl shadow-emerald-500/40 hover:shadow-emerald-500/60 hover:scale-105 active:scale-95"
              >
                Next Matchup →
              </button>

              {/* CHANGED: Reduced text size for mobile */}
              <Link
                to={`/firm/${resultData.firm.id}`}
                className="block w-full px-8 py-4 bg-gray-700/60 text-white font-bold text-base sm:text-lg rounded-2xl hover:bg-gray-700 transition-all duration-300 text-center border border-gray-600/50 hover:border-gray-500"
              >
                View {result.winner} Details
              </Link>

              <CareerPageButton firmName={result.winner} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const [firmA, firmB] = matchup.firms;

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      <CustomStyles />
      <div className="w-full max-w-7xl">
        {/* CHANGED: Reduced text size and margin for mobile */}
        <h1 className="text-3xl sm:text-4xl lg:text-6xl xl:text-7xl font-black text-center mb-6 sm:mb-10 bg-gradient-to-r from-white via-emerald-200 to-emerald-400 bg-clip-text text-transparent px-4 leading-tight">
          Which would you rather work at?
        </h1>

        {/* CHANGED: Reduced gaps and margins for mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr,auto,1fr] gap-4 sm:gap-8 lg:gap-12 items-stretch mb-6 sm:mb-10">
          <FirmCard firm={firmA} otherFirm={firmB} onVote={handleVote} disabled={submitting} />

          <div className="flex justify-center items-center">
            {/* CHANGED: Reduced size and text size for mobile */}
            <div className="w-16 h-16 sm:w-20 sm:h-24 lg:w-28 lg:h-28 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center shadow-2xl shadow-emerald-500/40 transform hover:rotate-180 hover:scale-110 transition-all duration-700">
              <span className="text-white font-black text-xl sm:text-2xl lg:text-4xl">VS</span>
            </div>
          </div>

          <FirmCard firm={firmB} otherFirm={firmA} onVote={handleVote} disabled={submitting} />
        </div>

        <div className="text-center">
          <button
            onClick={fetchMatchup}
            className="text-gray-500 hover:text-gray-300 text-base font-medium transition-colors duration-300 hover:underline underline-offset-4 decoration-2"
          >
            Skip this matchup
          </button>
        </div>
      </div>
    </div>
  );
}
//test
const FirmCard = ({ firm, otherFirm, onVote, disabled }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      // CHANGED: Reduced padding and min-height for mobile
      className="group relative bg-gradient-to-br from-gray-800 to-gray-900 backdrop-blur-lg rounded-3xl p-6 sm:p-8 lg:p-12 border-2 border-gray-700/60 hover:border-emerald-500/60 transition-all duration-500 shadow-2xl hover:shadow-emerald-500/20 overflow-hidden min-h-[300px] sm:min-h-[350px] flex flex-col"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 via-emerald-500/5 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
      <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-3xl blur-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-700 pointer-events-none"></div>

      <div className="relative z-10 flex flex-col items-center text-center flex-1 justify-between">
        <span
          className={`inline-block px-4 py-2 rounded-full text-sm font-bold mb-6 transition-all duration-300 ${
            firm.type === "Hedge Fund"
              ? "bg-blue-500/25 text-blue-300 border-2 border-blue-400/40"
              : "bg-purple-500/25 text-purple-300 border-2 border-purple-400/40"
          }`}
        >
          {firm.type}
        </span>

        <div className="flex-1 flex items-center justify-center">
          {/* CHANGED: Reduced text size for mobile */}
          <h2
            className={`text-2xl sm:text-3xl lg:text-5xl font-black mb-8 bg-gradient-to-br from-white via-gray-200 to-gray-300 bg-clip-text text-transparent transition-all duration-300 leading-tight ${
              isHovered ? "scale-110" : ""
            }`}
          >
            {firm.name}
          </h2>
        </div>

        {/* CHANGED: Reduced padding and text size for mobile */}
        <button
          onClick={() => onVote(firm.id, otherFirm.id)}
          disabled={disabled}
          className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-black text-lg sm:text-xl rounded-2xl shadow-xl shadow-emerald-500/40 hover:from-emerald-600 hover:to-emerald-700 hover:shadow-emerald-500/60 hover:scale-105 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {disabled ? "Submitting..." : "Pick"}
        </button>
      </div>
    </div>
  );
};

const CareerPageButton = ({ firmName }) => {
  const careerPages = {
    // Elite Prop Shops & Hedge Funds
    "Jane Street": "https://www.janestreet.com/join-jane-street/",
    "Citadel": "https://www.citadel.com/careers/",
    "Two Sigma": "https://www.twosigma.com/careers/",
    "D.E. Shaw Group": "https://www.deshaw.com/careers",
    "Jump Trading": "https://www.jumptrading.com/careers/",
    "Hudson River Trading": "https://www.hudsonrivertrading.com/careers/",
    "Optiver": "https://www.optiver.com/working-at-optiver/career-opportunities/",
    "Renaissance Technologies": "https://www.rentec.com/Careers.action",
    "AQR Capital Management": "https://careers.aqr.com/",
    "Millennium": "https://www.mlp.com/careers/",
    "Point72": "https://point72.com/students-early-career/",
    "Bridgewater": "https://www.bridgewater.com/careers",
    "Virtu Financial": "https://www.virtu.com/careers/",
    "Tower Research Capital": "https://www.tower-research.com/careers",
    "IMC Trading": "https://careers.imc.com/",
    "DRW": "https://drw.com/careers/",
    "Headlands Technologies": "https://www.headlandstech.com/#careers",
    "WorldQuant": "https://www.worldquant.com/careers/",
    "Schonfeld Strategic Advisors": "https://www.schonfeld.com/careers/",
    "Verition Fund Management": "https://www.verition.com/careers/",
    "Susquehanna International Group": "https://sig.com/careers/",
    "Akuna Capital": "https://akunacapital.com/careers",
    "XTX Markets": "https://www.xtxmarkets.com/careers/",
    "Flow Traders": "https://www.flowtraders.com/careers",
    "Belvedere Trading": "https://www.belvederetrading.com/careers/",
    "G-Research": "https://www.gresearch.co.uk/join-us/",
    "Squarepoint": "https://www.squarepoint-capital.com/careers",
    "Tibra Capital": "https://www.tibra.com/careers/",
    "Da Vinci": "https://davincitrading.com/careers/",
    "Wolverine Trading": "https://www.wolve.com/careers",
    "3Red Partners": "https://www.3redpartners.com/careers/",
    "Geneva Trading": "https://www.genevatrading.com/careers/",
    "Old Mission Capital": "https://www.oldmissioncapital.com/careers/",
    "Tradebot": "https://www.tradebot.com/careers",
    "Maven Securities": "https://www.mavensecurities.com/careers/",
    "Quantlab Financial": "https://www.quantlab.com/careers/",
    "TransMarket Group": "https://www.transmarketgroup.com/careers/",
    "XR Trading": "https://www.xrtrading.com/benefits",
    "FNY Capital": "https://www.fnycapital.com/careers/",
    "DV Trading": "https://dvtrading.co/join-dv/",
    "Radix Trading": "https://radixtrading.co/#careers",
    
    // Quantitative Asset Managers
    "Winton": "https://www.winton.com/opportunities",
    "Arrowstreet Capital": "https://www.arrowstreetcapital.com/professional-careers/",
    
    // Global Investment Banks
    "Goldman Sachs": "https://www.goldmansachs.com/careers/",
    "Morgan Stanley": "https://www.morganstanley.com/people-opportunities",
    "JPMorgan Chase": "https://careers.jpmorgan.com/",
    "Bank of America": "https://campus.bankofamerica.com/",
    "Citi": "https://jobs.citi.com/",
    "Barclays": "https://home.barclays/careers/",
    "Deutsche Bank": "https://careers.db.com/",
    "HSBC": "https://home.barclays/careers/",
    
    // India - Prop Shops & Trading Firms
    "Graviton Research Capital": "https://www.gravitontrading.com/careers.html",
    "WorldQuant India": "https://www.worldquant.com/careers/",
    "Tower Research Capital India": "https://www.tower-research.com/careers",
    "AlphaGrep Securities": "https://www.alpha-grep.com/career/",
    "Futures First": "https://www.futuresfirst.com/career/",
    
    // Indian Banks & Asset Managers
    "Edelweiss Group": "https://www.edelweissfin.com/careers",
    "HDFC Asset Management": "https://www.hdfcfund.com/about-us/careers",
    "Kotak Mahindra AMC": "https://www.kotakmf.com/careers",
    "State Bank of India": "https://bank.sbi/careers",

    // India - FinTech & Retail Brokers
    "Zerodha": "https://zerodha.com/careers/",
    "Upstox": "https://upstox.com/careers",
    "Groww": "https://groww.in/careers",
    "Angel One": "https://www.angelone.in/careers/",
    
    // South Africa - Banks & Asset Managers
    "RMB": "https://www.rmb.co.za/careers/",
    "Allan Gray": "https://www.allangray.co.za/careers/",
    "Coronation Fund Managers": "https://www.coronation.com/careers/",
    "Futuregrowth Asset Management": "https://www.futuregrowth.co.za/careers/",
    "Sygnia": "https://www.sygnia.co.za/careers/",
    "Old Mutual": "https://www.oldmutual.com/careers",
    "PSG": "https://www.psg.co.za/careers/",
    "Absa Group": "https://www.absa.africa/absaafrica/careers/",
    "Standard Bank Group": "https://www.standardbank.com/sbg/standard-bank-group/careers",
    "Discovery Limited": "https://www.discovery.co.za/corporate/careers",
    "Capitec": "https://www.capitecbank.co.za/about-us/careers/",
    "African Bank": "https://www.africanbank.co.za/en/home/about-us/careers/",
    "Sasfin": "https://www.sasfin.com/careers/"
  };

  const careerUrl = careerPages[firmName];
  if (!careerUrl) return null;

  return (
    // CHANGED: Reduced text size for mobile
    <a
      href={careerUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="block w-full px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold text-base sm:text-lg rounded-2xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 text-center shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105 active:scale-95"
    >
      🚀 View {firmName} Careers
    </a>
  );
};

export default SwipeView;