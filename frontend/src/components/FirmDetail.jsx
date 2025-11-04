import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";

const API_URL = "/api";

function FirmDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFirmDetail();
  }, [id]);

  const fetchFirmDetail = async () => {
    try {
      const response = await fetch(`${API_URL}/firm/${id}`);
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Error fetching firm details:", error);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-gray-300 text-xl font-semibold">
            Loading firm details...
          </p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        {/* CHANGED: Reduced padding on mobile */}
        <div className="text-center bg-gray-800/60 backdrop-blur-lg rounded-3xl p-6 sm:p-10 border border-red-500/40 shadow-2xl">
          {/* CHANGED: Reduced text size on mobile */}
          <div className="text-6xl sm:text-7xl mb-6">⚠️</div>
          <h2 className="text-2xl sm:text-3xl font-bold text-red-400 mb-6">
            Firm not found
          </h2>
          <Link
            to="/firms"
            // CHANGED: Reduced text size and padding on mobile
            className="inline-block px-6 py-3 sm:px-8 sm:py-4 bg-emerald-500 text-white font-bold text-base sm:text-lg rounded-xl hover:bg-emerald-600 transition-all duration-300 shadow-lg hover:shadow-emerald-500/50 hover:scale-105"
          >
            ← Back to firms
          </Link>
        </div>
      </div>
    );
  }

  const { firm, comments } = data;

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-10">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <Link
          to="/firms"
          // CHANGED: Reduced margin on mobile
          className="inline-flex items-center text-emerald-400 hover:text-emerald-300 font-semibold text-lg mb-6 sm:mb-8 group transition-colors duration-300"
        >
          <svg
            className="w-6 h-6 mr-2 transform group-hover:-translate-x-2 transition-transform duration-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            ></path>
          </svg>
          Back to firms
        </Link>

        {/* Header */}
        {/* CHANGED: Reduced padding and margin on mobile */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 backdrop-blur-lg rounded-3xl p-6 sm:p-10 lg:p-12 border-2 border-gray-700/60 shadow-2xl mb-8 sm:mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-6 sm:mb-8">
            <div>
              {/* CHANGED: Reduced text size on mobile */}
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black bg-gradient-to-r from-emerald-400 via-emerald-300 to-emerald-500 bg-clip-text text-transparent mb-4 leading-tight">
                {firm.name}
              </h1>
              <span
                className={`inline-block px-5 py-2 rounded-full text-base font-bold ${
                  firm.type === "Hedge Fund"
                    ? "bg-blue-500/25 text-blue-300 border-2 border-blue-400/40"
                    : "bg-purple-500/25 text-purple-300 border-2 border-purple-400/40"
                }`}
              >
                {firm.type}
              </span>
            </div>
          </div>

          {/* Stats Grid */}
          {/* CHANGED: Reduced gap and margin on mobile */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <StatCard
              label="Win Rate"
              value={`${firm.win_rate}%`}
              highlight={firm.win_rate >= 60}
              gradient
            />
            <StatCard label="Wins" value={firm.wins} />
            <StatCard label="Losses" value={firm.losses} />
            <StatCard label="Total Votes" value={firm.total} />
          </div>

          {/* Win Rate Bar */}
          {firm.total > 0 && (
            <div className="mt-8">
              <div className="flex items-center justify-between text-base text-gray-400 font-medium mb-3">
                <span>Losses</span>
                <span>Wins</span>
              </div>
              <div className="h-5 bg-gray-700 rounded-full overflow-hidden relative shadow-inner">
                <div
                  className={`h-full transition-all duration-1000 ${
                    firm.win_rate >= 60
                      ? "bg-gradient-to-r from-emerald-500 to-emerald-400"
                      : firm.win_rate >= 40
                      ? "bg-gradient-to-r from-yellow-500 to-yellow-400"
                      : "bg-gradient-to-r from-red-500 to-red-400"
                  }`}
                  style={{ width: `${firm.win_rate}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Comments Section */}
        {comments.length > 0 && (
          <div>
            {/* CHANGED: Reduced text size and margin on mobile */}
            <h2 className="text-3xl sm:text-4xl font-black mb-6 sm:mb-8 text-white">
              Recent Comments
            </h2>

            <div className="space-y-5">
              {comments.map((comment, index) => (
                <div
                  key={index}
                  // CHANGED: Reduced padding on mobile
                  className={`bg-gradient-to-br from-gray-800 to-gray-900 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border-l-4 ${
                    comment.sentiment === "picked"
                      ? "border-emerald-500 hover:border-emerald-400"
                      : "border-red-500 hover:border-red-400"
                  } transition-all duration-300 hover:shadow-2xl shadow-lg`}
                >
                  {/* CHANGED: Reduced gap on mobile */}
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-4">
                    <span
                      // CHANGED: Reduced padding on mobile
                      className={`inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-black rounded-full ${
                        comment.sentiment === "picked"
                          ? "bg-emerald-500/25 text-emerald-300 border-2 border-emerald-400/40"
                          : "bg-red-500/25 text-red-300 border-2 border-red-400/40"
                      }`}
                    >
                      {comment.sentiment === "picked" ? "✓ PICKED" : "✗ PASSED"}
                    </span>
                    <span className="text-base text-gray-400">
                      over{" "}
                      <span className="text-gray-200 font-bold">
                        {comment.other_firm}
                      </span>
                    </span>
                  </div>

                  {/* CHANGED: Reduced text size on mobile */}
                  <p className="text-gray-200 leading-relaxed text-base sm:text-lg font-medium">
                    "{comment.text}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {comments.length === 0 && (
          // CHANGED: Reduced padding on mobile
          <div className="text-center py-16 sm:py-20">
            {/* CHANGED: Reduced text size and margin on mobile */}
            <div className="text-7xl sm:text-8xl mb-4 sm:mb-6">🗣️</div>
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-300 mb-3">
              No comments yet
            </h3>
            {/* CHANGED: Reduced text size on mobile */}
            <p className="text-gray-500 text-base sm:text-lg">
              Be the first to share your thoughts on {firm.name}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

const StatCard = ({ label, value, highlight = false, gradient = false }) => (
  // CHANGED: Reduced padding on mobile
  <div className="bg-gray-800/60 backdrop-blur-sm rounded-2xl p-5 sm:p-6 border-2 border-gray-700/60 hover:border-emerald-500/40 transition-all duration-500 hover:shadow-xl hover:shadow-emerald-500/20 group">
    <div
      // CHANGED: Reduced text size on mobile
      className={`text-3xl sm:text-4xl lg:text-5xl font-black mb-3 ${
        gradient
          ? "bg-gradient-to-r from-emerald-400 to-emerald-300 bg-clip-text text-transparent"
          : highlight
          ? "text-emerald-400"
          : "text-white"
      } group-hover:scale-110 transition-transform duration-300`}
    >
      {value}
    </div>
    <div className="text-sm font-bold text-gray-400 uppercase tracking-wider">
      {label}
    </div>
  </div>
);

export default FirmDetail;

//test