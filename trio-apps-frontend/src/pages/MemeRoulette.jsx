import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ThumbsUp, ThumbsDown, RefreshCw, Share2 } from 'lucide-react';

export default function MemeRoulette({ apiUrl, user }) {
  const [meme, setMeme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trending, setTrending] = useState([]);
  const [voted, setVoted] = useState(null);

  useEffect(() => {
    fetchMeme();
    fetchTrending();
  }, []);

  const fetchMeme = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${apiUrl}/api/meme/random`);
      setMeme(response.data);
      setVoted(null);
    } catch (error) {
      console.error('Meme yükleyemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrending = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/meme/trending`);
      setTrending(response.data.slice(0, 5));
    } catch (error) {
      console.error('Trending meme\'leri yükleyemedi:', error);
    }
  };

  const handleVote = async (voteType) => {
    if (!meme) return;

    try {
      await axios.post(
        `${apiUrl}/api/meme/vote`,
        { memeId: meme.id, voteType }
      );
      setVoted(voteType);
      setMeme({
        ...meme,
        upvotes: voteType === 'up' ? (meme.upvotes || 0) + 1 : meme.upvotes || 0,
        downvotes: voteType === 'down' ? (meme.downvotes || 0) + 1 : meme.downvotes || 0,
      });
      setTimeout(fetchMeme, 500);
    } catch (error) {
      console.error('Oy veremedi:', error);
    }
  };

  const handleShare = () => {
    if (!meme) return;
    const text = `"${meme.title}" - Meme Ruleti'nde buldum!`;
    if (navigator.share) {
      navigator.share({
        title: 'Meme Ruleti',
        text: text,
      });
    } else {
      navigator.clipboard.writeText(text);
      alert('Meme kopyalandı!');
    }
  };

  if (loading || !meme) {
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
      <div className="w-full max-w-3xl">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-purple-500/20">
          {/* Meme Image */}
          <div className="relative h-96 md:h-96 overflow-hidden bg-slate-700">
            <img
              src={meme.image_url}
              alt={meme.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/400x300?text=Meme';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent" />
          </div>

          {/* Content */}
          <div className="p-8">
            <h2 className="text-3xl font-bold text-white mb-2">{meme.title}</h2>
            {meme.description && (
              <p className="text-gray-400 mb-6">{meme.description}</p>
            )}

            {/* Vote Stats */}
            <div className="flex gap-8 mb-8 py-4 border-t border-b border-slate-700">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  {meme.upvotes || 0}
                </div>
                <p className="text-gray-400 text-sm">Beğeni</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400">
                  {meme.downvotes || 0}
                </div>
                <p className="text-gray-400 text-sm">Beğenmeme</p>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 flex-wrap">
              <button
                onClick={() => handleVote('up')}
                disabled={voted === 'up'}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition ${
                  voted === 'up'
                    ? 'bg-green-600 text-white'
                    : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                }`}
              >
                <ThumbsUp className="w-5 h-5" />
                Beğendim
              </button>

              <button
                onClick={() => handleVote('down')}
                disabled={voted === 'down'}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition ${
                  voted === 'down'
                    ? 'bg-red-600 text-white'
                    : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                }`}
              >
                <ThumbsDown className="w-5 h-5" />
                Beğenmedim
              </button>

              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold bg-slate-700 text-gray-300 hover:bg-slate-600 transition"
              >
                <Share2 className="w-5 h-5" />
                Paylaş
              </button>

              <button
                onClick={fetchMeme}
                className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 transition ml-auto"
              >
                <RefreshCw className="w-5 h-5" />
                Sonraki Meme
              </button>
            </div>
          </div>
        </div>

        {/* Trending Memes */}
        {trending.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-white mb-6">🔥 Trend Olanlar</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {trending.map((trendMeme) => (
                <div
                  key={trendMeme.id}
                  className="bg-slate-800/50 rounded-xl overflow-hidden border border-purple-500/10 hover:border-purple-500/30 transition cursor-pointer"
                  onClick={() => setMeme(trendMeme)}
                >
                  <div className="h-40 overflow-hidden bg-slate-700">
                    <img
                      src={trendMeme.image_url}
                      alt={trendMeme.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/200x150?text=Meme';
                      }}
                    />
                  </div>
                  <div className="p-3">
                    <p className="text-white font-semibold text-sm mb-2">
                      {trendMeme.title}
                    </p>
                    <div className="flex gap-4 text-xs text-gray-400">
                      <span className="text-green-400">👍 {trendMeme.upvotes || 0}</span>
                      <span className="text-red-400">👎 {trendMeme.downvotes || 0}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}