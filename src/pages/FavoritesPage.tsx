import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getToolById, categories } from '../data/tools';
import { Heart, Star, Clock, ArrowRight } from 'lucide-react';

export default function FavoritesPage() {
  const { theme, favorites, recentlyUsed, addToRecentlyUsed } = useApp();
  const isDark = theme === 'dark';
  const favoriteTools = favorites.map(id => getToolById(id)).filter(Boolean);
  const recentTools = recentlyUsed.slice(0, 6).map(id => getToolById(id)).filter(Boolean);

  return (
    <div className="space-y-8 pb-8">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Heart size={22} className="text-red-400" />
          Favorites
        </h1>
        <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          Your saved tools for quick access
        </p>
      </div>

      {favoriteTools.length === 0 ? (
        <div className={`text-center py-16 rounded-2xl ${isDark ? 'bg-white/5 border border-white/5' : 'bg-white border border-gray-100'}`}>
          <span className="text-5xl mb-4 block">⭐</span>
          <h3 className="font-bold text-lg mb-2">No favorite tools yet</h3>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} mb-4`}>
            Save your most-used tools here for quick access.
          </p>
          <Link
            to="/tools"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500 text-white text-sm font-medium hover:bg-indigo-600 transition-colors"
          >
            Browse Tools <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {favoriteTools.map(tool => tool && (
            <Link
              key={tool.id}
              to={`/tool/${tool.id}`}
              onClick={() => addToRecentlyUsed(tool.id)}
              className={`group p-5 rounded-xl card-hover ${isDark ? 'bg-white/5 border border-white/5 hover:border-indigo-500/30' : 'bg-white border border-gray-100 hover:border-indigo-200 shadow-sm'}`}
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-3xl">{tool.icon}</span>
                <Star size={16} className="text-red-400" fill="currentColor" />
              </div>
              <h3 className="font-semibold text-sm mb-1">{tool.name}</h3>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'} line-clamp-2`}>{tool.description}</p>
              <div className="mt-3">
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${isDark ? 'bg-indigo-500/10 text-indigo-300' : 'bg-indigo-50 text-indigo-600'}`}>
                  {categories.find(c => c.id === tool.category)?.name}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Recently Used */}
      {recentTools.length > 0 && (
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
            <Clock size={18} className="text-indigo-400" />
            Recently Used
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentTools.map(tool => tool && (
              <Link
                key={tool.id}
                to={`/tool/${tool.id}`}
                onClick={() => addToRecentlyUsed(tool.id)}
                className={`flex items-center gap-3 p-4 rounded-xl transition-colors ${isDark ? 'bg-white/5 hover:bg-white/10 border border-white/5' : 'bg-white hover:bg-gray-50 border border-gray-100 shadow-sm'}`}
              >
                <span className="text-2xl">{tool.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{tool.name}</p>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'} truncate`}>{tool.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
