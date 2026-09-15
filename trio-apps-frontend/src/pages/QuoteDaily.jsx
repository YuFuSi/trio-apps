import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Heart, Share2, RefreshCw } from 'lucide-react';

export default function QuoteDaily({ apiUrl, user }) {
  const [quote, setQuote] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    fetchQuote();
    fetchFavorites();
  }, []);

  const fetchQuote = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${apiUrl}/api/quote/daily`);
      setQuote(response.data);
      checkIsFavorite(response.data.id);
    } catch (error) {
      console.error('Sözü yükleyemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/user/favorites`);
      setFavorites(response.data);
    } catch (error) {
      console.error('Favorileri yükleyemedi:', error);
    }
  };

  const checkIsFavorite = (quoteId) => {
    setIsFavorite(favorites.some(fav => fav.id === quoteId));
  };

  const handleFavorite = async () => {
    if (!quote) return;

    try {
      await axios.post(`${apiUrl}/api/quote/favorite`, {
        quoteId: quote.id
      });
      setIsFavorite(!isFavorite);
      fetchFavorites();
    } catch (error) {
      console.error('Favorilerine ekleyemedi:', error);
    }
  };

  const handleShare = () => {
    const text = `"${quote.text}" - ${quote.author}`;
    if (navigator.share) {
      navigator.share({
        title: 'Günün Sözü',
        text: text,
      });
    } else {
      navigator.clipboard.writeText(text);
      alert('Söz kopyalandı!');
    }
  };

  if (loading || !quote) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin">
          <RefreshCw className="w-8 h-8 text-purple-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-2xl">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl shadow-2xl p-12 border border-purple-500/20">
          <div className="text-center">
            <div className="text-6xl mb-8">💭</div>
            
            <p className="text-3xl md:text-4xl font-bold text-white mb-6 leading-relaxed">
              "{quote.text}"
            </p>

            <p className="text-xl text-purple-300 mb-12">
              — {quote.author}
            </p>

            <div className="flex justify-center gap-4">
              <button
                onClick={handleFavorite}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition ${
                  isFavorite
                    ? 'bg-red-600 text-white'
                    : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                }`}
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                Favorilerime Ekle
              </button>

              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold bg-slate-700 text-gray-300 hover:bg-slate-600 transition"
              >
                <Share2 className="w-5 h-5" />
                Paylaş
              </button>

              <button
                onClick={fetchQuote}
                className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 transition"
              >
                <RefreshCw className="w-5 h-5" />
                Yeni Söz
              </button>
            </div>
          </div>
        </div>

        {favorites.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-white mb-6">Favorilerim</h2>
            <div className="grid gap-4">
              {favorites.slice(0, 5).map((fav) => (
                <div
                  key={fav.id}
                  className="bg-slate-800/50 rounded-xl p-6 border border-purple-500/10 hover:border-purple-500/30 transition"
                >
                  <p className="text-gray-300 mb-2">"{fav.text}"</p>
                  <p className="text-purple-400 text-sm">— {fav.author}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}