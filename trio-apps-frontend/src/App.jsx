import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import Navigation from './components/Navigation';
import QuoteDaily from './pages/QuoteDaily';
import MemeRoulette from './pages/MemeRoulette';
import HabitTracker from './pages/HabitTracker';
import Auth from './pages/Auth';
import './App.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  const handleLogin = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('token', authToken);
    axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  };

  if (!token) {
    return <Auth onLogin={handleLogin} apiUrl={API_BASE_URL} />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Navigation user={user} onLogout={handleLogout} />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<QuoteDaily apiUrl={API_BASE_URL} user={user} />} />
            <Route path="/meme" element={<MemeRoulette apiUrl={API_BASE_URL} user={user} />} />
            <Route path="/habits" element={<HabitTracker apiUrl={API_BASE_URL} user={user} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;