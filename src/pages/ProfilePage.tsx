import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { User, Heart, Wrench, Trash2, RotateCcw, Moon, Sun } from 'lucide-react';

export default function ProfilePage() {
  const { theme, toggleTheme, favorites, history, recentlyUsed, clearHistory } = useApp();
  const isDark = theme === 'dark';
  const [name, setName] = useState(() => localStorage.getItem('ai-hub-name') || 'User');
  const [editing, setEditing] = useState(false);

  const handleSaveName = () => {
    localStorage.setItem('ai-hub-name', name);
    setEditing(false);
  };

  const handleResetPreferences = () => {
    localStorage.removeItem('ai-hub-favorites');
    localStorage.removeItem('ai-hub-recent');
    window.location.reload();
  };

  return (
    <div className="space-y-6 pb-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <User size={22} className="text-indigo-400" />
        Profile
      </h1>

      {/* Profile Card */}
      <div className={`rounded-2xl p-6 ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200 shadow-sm'}`}>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <span className="text-2xl font-bold text-white">{name.charAt(0).toUpperCase()}</span>
          </div>
          <div className="flex-1">
            {editing ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className={`px-3 py-1.5 rounded-lg text-sm outline-none ${isDark ? 'bg-white/10 border border-white/20 text-white' : 'bg-gray-50 border border-gray-200'}`}
                  autoFocus
                />
                <button onClick={handleSaveName} className="px-3 py-1.5 rounded-lg bg-indigo-500 text-white text-xs font-medium">
                  Save
                </button>
              </div>
            ) : (
              <div>
                <h2 className="text-lg font-bold">{name}</h2>
                <button onClick={() => setEditing(true)} className="text-xs text-indigo-400 hover:text-indigo-300">
                  Edit profile
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className={`text-center p-3 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
            <Heart size={16} className="text-red-400 mx-auto mb-1" />
            <p className="text-lg font-bold">{favorites.length}</p>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Favorites</p>
          </div>
          <div className={`text-center p-3 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
            <Wrench size={16} className="text-indigo-400 mx-auto mb-1" />
            <p className="text-lg font-bold">{history.length}</p>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Tools Used</p>
          </div>
          <div className={`text-center p-3 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
            <User size={16} className="text-purple-400 mx-auto mb-1" />
            <p className="text-lg font-bold">{recentlyUsed.length}</p>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Recent</p>
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className={`rounded-2xl p-6 ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200 shadow-sm'}`}>
        <h3 className="font-bold mb-4">Preferences</h3>
        
        {/* Theme */}
        <div className="flex items-center justify-between py-3 border-b border-white/5">
          <div className="flex items-center gap-3">
            {isDark ? <Moon size={16} className="text-indigo-400" /> : <Sun size={16} className="text-yellow-400" />}
            <span className="text-sm">Theme</span>
          </div>
          <button
            onClick={toggleTheme}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium ${isDark ? 'bg-white/10 hover:bg-white/15' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
          >
            {isDark ? 'Dark' : 'Light'}
          </button>
        </div>

        {/* Clear History */}
        <div className="flex items-center justify-between py-3 border-b border-white/5">
          <div className="flex items-center gap-3">
            <Trash2 size={16} className="text-red-400" />
            <span className="text-sm">Clear History</span>
          </div>
          <button
            onClick={clearHistory}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
          >
            Clear
          </button>
        </div>

        {/* Reset Preferences */}
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <RotateCcw size={16} className="text-yellow-400" />
            <span className="text-sm">Reset Preferences</span>
          </div>
          <button
            onClick={handleResetPreferences}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium ${isDark ? 'bg-white/10 hover:bg-white/15' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
          >
            Reset
          </button>
        </div>
      </div>

      {/* Info */}
      <div className={`rounded-2xl p-4 ${isDark ? 'bg-indigo-500/5 border border-indigo-500/10' : 'bg-indigo-50 border border-indigo-100'}`}>
        <p className={`text-xs ${isDark ? 'text-indigo-300/70' : 'text-indigo-600'}`}>
          💡 All data is stored locally on your device. No account needed. Your preferences, favorites, and history are private.
        </p>
      </div>
    </div>
  );
}
