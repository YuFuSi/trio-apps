import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogOut, Home } from 'lucide-react';

export default function Navigation({ user, onLogout }) {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-slate-900/50 backdrop-blur-xl border-b border-purple-500/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 text-white font-bold text-xl hover:text-purple-400 transition">
              <Home className="w-6 h-6" />
              Trio Apps
            </Link>

            <div className="flex gap-6">
              <Link
                to="/"
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  isActive('/')
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                💭 Günlük Söz
              </Link>

              <Link
                to="/meme"
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  isActive('/meme')
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                😄 Meme
              </Link>

              <Link
                to="/habits"
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  isActive('/habits')
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                ✅ Alışkanlık
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {user && (
              <span className="text-gray-300 text-sm">
                Hoş geldiniz, <span className="font-semibold text-purple-400">{user.username}</span>
              </span>
            )}
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition"
            >
              <LogOut className="w-5 h-5" />
              Çıkış
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}