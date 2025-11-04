import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const API_URL = "/api";

// Define a color map for each firm type
const FIRM_COLOR_MAP = {
  "Hedge Fund": "bg-blue-500/20 text-blue-300 border-blue-400/30",
  "Trading Firm": "bg-red-500/20 text-red-300 border-red-400/30",
  "Global Bank": "bg-yellow-500/20 text-yellow-300 border-yellow-400/30",
  Bank: "bg-amber-500/20 text-amber-300 border-amber-400/30",
  "Asset Manager": "bg-cyan-500/20 text-cyan-300 border-cyan-400/30",
  FinTech: "bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-400/30",
};

const SpinnerIcon = (props) => (
  <svg
    className="animate-spin w-10 h-10 text-emerald-400"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    {...props}
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    ></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    ></path>
  </svg>
);

const SearchIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="64"
    height="64"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-gray-600 mb-6 mx-auto"
    {...props}
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

function FirmsList() {
  const [firms, setFirms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchFirms();
  }, []);

  const fetchFirms = async () => {
    try {
      const response = await fetch(`${API_URL}/firms`);
      const data = await response.json();
      setFirms(data.firms);
    } catch (error) {
      console.error("Error fetching firms:", error);
    }
    setLoading(false);
  };

  const filteredFirms = firms.filter((firm) => {
    if (filter === "all") return true;
    return firm.type === filter;
  });

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center">
          <SpinnerIcon className="w-12 h-12 mx-auto mb-6" />
          <p className="text-gray-300 text-xl font-semibold">
            Loading firms...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        {/* CHANGED: Reduced margin on mobile */}
        <div className="mb-8 sm:mb-12 pt-4">
          {/* CHANGED: Reduced text size on mobile */}
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black mb-4 tracking-tight bg-gradient-to-r from-emerald-400 via-emerald-300 to-emerald-500 bg-clip-text text-transparent">
            All Firms
          </h1>
          {/* CHANGED: Reduced text size on mobile */}
          <p className="text-gray-400 text-lg sm:text-xl">
            Compare quant firms and trading houses
          </p>
        </div>

        {/* Filter Tabs */}
        {/* CHANGED: Reduced gap, margin, and padding on mobile */}
        <div className="flex gap-2 sm:gap-4 mb-10 sm:mb-12 p-2 sm:p-3 bg-gray-800/60 backdrop-blur-md rounded-2xl border border-gray-700/50 shadow-lg overflow-x-auto whitespace-nowrap w-full">
          {[
            "all",
            "Hedge Fund",
            "Trading Firm",
            "Global Bank",
            "Bank",
            "Asset Manager",
            "FinTech",
          ].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              // CHANGED: Reduced padding on mobile
              className={`flex-shrink-0 px-4 py-2 sm:px-5 sm:py-2.5 text-sm font-semibold rounded-xl
                transition-all duration-300 transform-gpu active:scale-95
                ${
                  filter === type
                    ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30 scale-[1.03]"
                    : "text-gray-400 hover:text-white hover:bg-gray-700/60"
                }`}
            >
              {type === "all" ? "All" : type}
            </button>
          ))}
        </div>

        {/* Firms Grid */}
        {filteredFirms.length > 0 ? (
          // CHANGED: Reduced gap on mobile
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
            {filteredFirms.map((firm) => (
              <Link
                key={firm.id}
                to={`/firm/${firm.id}`}
                // CHANGED: Reduced padding on mobile
                className="group relative block w-full bg-gradient-to-br from-gray-800/70 to-gray-900/90 
              rounded-3xl p-6 sm:p-7 border-2 border-gray-700/60 
              transition-all duration-300 transform-gpu hover:border-emerald-500/60 
              hover:shadow-2xl hover:shadow-emerald-500/10 hover:scale-[1.01] active:scale-[0.99]"
              >
                {/* Decorative overlays */}
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-3xl blur-md opacity-0 group-hover:opacity-10 pointer-events-none"></div>
                {firm.win_rate > 50 && (
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl opacity-0 group-hover:opacity-50 pointer-events-none"></div>
                )}

                {/* Card content */}
                <div className="relative z-10 flex flex-col">
                  <div className="flex items-start justify-between mb-5">
                    {/* CHANGED: Reduced text size on mobile */}
                    <h2 className="text-lg sm:text-xl font-black text-white group-hover:text-emerald-300 transition-colors duration-300 pr-2 leading-snug">
                      {firm.name}
                    </h2>
                    <span
                      className={`flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full whitespace-nowrap border ${
                        FIRM_COLOR_MAP[firm.type] ||
                        "bg-gray-500/20 text-gray-300 border-gray-400/30"
                      }`}
                    >
                      {firm.type}
                    </span>
                  </div>

                  {firm.total > 0 ? (
                    <div className="mt-5 pt-5 border-t border-gray-700/60">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm text-gray-400 font-medium uppercase tracking-wider">
                          Win Rate
                        </span>
                        <span
                          // CHANGED: Reduced text size on mobile
                          className={`text-2xl sm:text-3xl font-black ${
                            firm.win_rate >= 60
                              ? "text-emerald-400"
                              : firm.win_rate >= 40
                              ? "text-yellow-400"
                              : "text-red-400"
                          }`}
                        >
                          {firm.win_rate}%
                        </span>
                      </div>

                      <div className="h-2.5 bg-gray-700 rounded-full overflow-hidden mb-4 shadow-inner">
                        <div
                          className={`h-full transition-all duration-700 ease-out rounded-full ${
                            firm.win_rate >= 60
                              ? "bg-gradient-to-r from-emerald-500 to-emerald-400"
                              : firm.win_rate >= 40
                              ? "bg-gradient-to-r from-yellow-500 to-yellow-400"
                              : "bg-gradient-to-r from-red-500 to-red-400"
                          }`}
                          style={{ width: `${firm.win_rate}%` }}
                        ></div>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 font-medium">
                          Total Votes
                        </span>
                        {/* CHANGED: Reduced text size on mobile */}
                        <span className="text-gray-200 font-bold text-base sm:text-lg">
                          {firm.total}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-gray-500 text-base font-semibold">
                        No data available
                      </p>
                      <p className="text-gray-600 text-sm mt-2">
                        Be the first to vote!
                      </p>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          // CHANGED: Reduced padding on mobile
          <div className="text-center py-16 sm:py-20 bg-gray-800/50 rounded-2xl border border-gray-700/50">
            <SearchIcon />
            {/* CHANGED: Reduced text size on mobile */}
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-300 mb-3">
              No firms found
            </h3>
            {/* CHANGED: Reduced text size on mobile */}
            <p className="text-gray-500 text-base sm:text-lg">Try adjusting your filter</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default FirmsList;