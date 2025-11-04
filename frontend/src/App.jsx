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
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur-xl border-b border-emerald-500/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link 
              to="/" 
              className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-emerald-400 to-emerald-300 bg-clip-text text-transparent hover:scale-105 transition-transform duration-300">
              QuantRank
            </Link>
            
            {/* Navigation */}
            <nav className="flex space-x-1 bg-gray-800/60 rounded-full p-1 backdrop-blur-sm">
              <NavLink to="/" active={location.pathname === '/'}>
                Swipe
              </NavLink>
              <NavLink to="/firms" 
              active={location.pathname.startsWith('/firm')|| location.pathname.startsWith('/firm/')}>
                Firms
              </NavLink>
            </nav>
          </div>
        </div>
      </header>
      
      {/* Main Content - Full height minus header */}
      <main className="flex-1 flex flex-col">
        <Routes>
          <Route path="/" element={<SwipeView />} />
          <Route path="/firms" element={<FirmsList />} />
          <Route path="/firm/:id" element={<FirmDetail />} />
        </Routes>
      </main>
    </div>
  );
}

const NavLink = ({ to, children, active }) => (
  <Link 
    to={to} 
    className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
      active 
        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/40' 
        : 'text-gray-400 hover:text-white hover:bg-gray-700/60'
    }`}>
    {children}
  </Link>
);

export default App;