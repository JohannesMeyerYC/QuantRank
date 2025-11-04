import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import SwipeView from './components/SwipeView';
import FirmsList from './components/FirmsList';
import FirmDetail from './components/FirmDetail';

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

function AppContent() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur-lg border-b border-emerald-500/20 shadow-lg shadow-emerald-500/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link 
              to="/" 
              className="text-2xl sm:text-3xl font-black tracking-tight bg-gradient-to-r from-emerald-400 via-emerald-300 to-emerald-500 bg-clip-text text-transparent hover:scale-105 transition-transform duration-300">
              ⚡ QuantRank
            </Link>
            
            {/* Navigation */}
            <nav className="flex space-x-1 bg-gray-800/50 rounded-full p-1">
              <NavLink to="/" active={location.pathname === '/'}>
                Swipe
              </NavLink>
              <NavLink to="/firms" active={location.pathname === '/firms' || location.pathname.startsWith('/firm/')}>
                Firms
              </NavLink>
            </nav>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<SwipeView />} />
          <Route path="/firms" element={<FirmsList />} />
          <Route path="/firm/:id" element={<FirmDetail />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-gray-600 border-t border-gray-800">
        © {new Date().getFullYear()} QuantRank
      </footer>
    </div>
  );
}

const NavLink = ({ to, children, active }) => (
  <Link 
    to={to} 
    className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
      active 
        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/50' 
        : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
    }`}>
    {children}
  </Link>
);

export default App;