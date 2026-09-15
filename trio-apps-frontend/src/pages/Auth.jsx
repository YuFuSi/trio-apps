import React, { useState } from 'react';
import axios from 'axios';
import { LogIn } from 'lucide-react';

export default function Auth({ onLogin, apiUrl }) {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = isSignup ? '/api/auth/signup' : '/api/auth/login';
      const payload = isSignup
        ? { email, password, username }
        : { email, password };

      const response = await axios.post(`${apiUrl}${endpoint}`, payload);
      onLogin(response.data.user, response.data.token);
    } catch (err) {
      setError(err.response?.data?.error || 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-purple-500/20">
          <div className="flex items-center justify-center mb-8">
            <LogIn className="w-10 h-10 text-purple-400" />
            <h1 className="text-3xl font-bold text-white ml-3">Trio Apps</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignup && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Kullanıcı Adı
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                  placeholder="kullanıcı adı"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                placeholder="email@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Şifre
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold py-2 rounded-lg hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 transition"
            >
              {loading ? 'Yükleniyor...' : isSignup ? 'Kayıt Ol' : 'Giriş Yap'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              {isSignup ? 'Zaten hesabın var mı?' : 'Hesabın yok mu?'}
              <button
                type="button"
                onClick={() => setIsSignup(!isSignup)}
                className="ml-2 text-purple-400 hover:text-purple-300 font-semibold"
              >
                {isSignup ? 'Giriş Yap' : 'Kayıt Ol'}
              </button>
            </p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-3 gap-4">
          <div className="bg-slate-800/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">💭</div>
            <p className="text-gray-400 text-xs mt-2">Günlük Sözler</p>
          </div>
          <div className="bg-slate-800/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">😄</div>
            <p className="text-gray-400 text-xs mt-2">Meme Ruleti</p>
          </div>
          <div className="bg-slate-800/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">✅</div>
            <p className="text-gray-400 text-xs mt-2">Alışkanlık</p>
          </div>
        </div>
      </div>
    </div>
  );
}