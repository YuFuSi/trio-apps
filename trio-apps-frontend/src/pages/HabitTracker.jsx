import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Check, Flame, Trophy, X } from 'lucide-react';

export default function HabitTracker({ apiUrl, user }) {
  const [habits, setHabits] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [newHabitName, setNewHabitName] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHabits();
    fetchLeaderboard();
  }, []);

  const fetchHabits = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${apiUrl}/api/user/habits`);
      setHabits(response.data);
    } catch (error) {
      console.error('Alışkanlıkları yükleyemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/leaderboard`);
      setLeaderboard(response.data);
    } catch (error) {
      console.error('Leaderboard yükleyemedi:', error);
    }
  };

  const handleAddHabit = async (e) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;

    try {
      await axios.post(`${apiUrl}/api/habit`, {
        name: newHabitName,
        description: '',
        category: 'Genel',
      });
      setNewHabitName('');
      setShowForm(false);
      fetchHabits();
    } catch (error) {
      console.error('Alışkanlık ekleyemedi:', error);
    }
  };

  const handleCheckIn = async (habitId) => {
    try {
      const response = await axios.post(`${apiUrl}/api/habit/checkin`, {
        habitId,
      });
      
      setHabits(habits.map(h =>
        h.id === habitId ? { ...h, streak: response.data.streak } : h
      ));

      fetchLeaderboard();
    } catch (error) {
      if (error.response?.data?.error === 'Already checked in today') {
        alert('Bugün zaten check-in yaptınız!');
      } else {
        console.error('Check-in yapamadı:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin">
          <Flame className="w-8 h-8 text-purple-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Alışkanlık Takip</h1>
          <p className="text-gray-400">Her gün yapılan işlerinizi takip edin ve streak'inizi arttırın!</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold py-3 rounded-lg hover:from-purple-700 hover:to-purple-800 transition flex items-center justify-center gap-2 mb-8"
              >
                <Plus className="w-5 h-5" />
                Yeni Alışkanlık Ekle
              </button>
            )}

            {showForm && (
              <form onSubmit={handleAddHabit} className="bg-slate-800/50 rounded-xl p-6 mb-8 border border-purple-500/20">
                <input
                  type="text"
                  value={newHabitName}
                  onChange={(e) => setNewHabitName(e.target.value)}
                  placeholder="Alışkanlığın adı (örn: Kitap oku, Spor yap)"
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 mb-4"
                  autoFocus
                />
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 bg-green-600 text-white font-semibold py-2 rounded-lg hover:bg-green-700 transition"
                  >
                    Ekle
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 bg-slate-700 text-gray-300 font-semibold py-2 rounded-lg hover:bg-slate-600 transition"
                  >
                    İptal
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-4">
              {habits.length === 0 ? (
                <div className="bg-slate-800/50 rounded-xl p-8 text-center border border-slate-700">
                  <p className="text-gray-400">Henüz alışkanlık eklemediniz.</p>
                  <button
                    onClick={() => setShowForm(true)}
                    className="mt-4 text-purple-400 hover:text-purple-300 font-semibold"
                  >
                    İlk alışkanlığınızı ekleyin →
                  </button>
                </div>
              ) : (
                habits.map((habit) => (
                  <div
                    key={habit.id}
                    className="bg-gradient-to-r from-slate-800 to-slate-800 rounded-xl p-6 border border-purple-500/20 hover:border-purple-500/40 transition"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-2">
                          {habit.name}
                        </h3>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Flame className="w-5 h-5 text-orange-400" />
                            <span className="text-white font-semibold">
                              {habit.streak} gün streak
                            </span>
                          </div>
                          <span className="text-sm text-gray-400">
                            Oluşturma: {new Date(habit.created_at).toLocaleDateString('tr-TR')}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleCheckIn(habit.id)}
                        className="bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold px-6 py-3 rounded-lg hover:from-green-700 hover:to-green-800 transition flex items-center gap-2"
                      >
                        <Check className="w-5 h-5" />
                        Check-in
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-purple-500/20 sticky top-8">
              <div className="flex items-center gap-2 mb-6">
                <Trophy className="w-6 h-6 text-yellow-400" />
                <h2 className="text-2xl font-bold text-white">Leaderboard</h2>
              </div>

              {leaderboard.length === 0 ? (
                <p className="text-gray-400 text-sm">Leaderboard boş. İlk olun!</p>
              ) : (
                <div className="space-y-3">
                  {leaderboard.slice(0, 10).map((entry, index) => (
                    <div
                      key={entry.user_id}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        index < 3
                          ? 'bg-yellow-500/10 border border-yellow-500/30'
                          : 'bg-slate-700/50 border border-slate-600/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-lg text-gray-400 w-6">
                          {index + 1}
                        </span>
                        <div>
                          <p className="text-white font-semibold">
                            {entry.users?.username || 'Kullanıcı'}
                          </p>
                          <p className="text-xs text-gray-400">
                            {entry.streak || 0} gün streak
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-orange-400">
                          {entry.streak || 0}
                        </p>
                        <p className="text-xs text-gray-400">toplam</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}