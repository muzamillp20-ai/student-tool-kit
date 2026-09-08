import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Clock, Trash2, ArrowRight, AlertCircle } from 'lucide-react';

export default function HistoryPage() {
  const { theme, history, clearHistory, deleteHistoryItem } = useApp();
  const isDark = theme === 'dark';

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Clock size={22} className="text-indigo-400" />
            History
          </h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Your recent tool usage
          </p>
        </div>
        {history.length > 0 && (
          <button
            onClick={clearHistory}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium ${isDark ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' : 'bg-red-50 text-red-500 hover:bg-red-100'} transition-colors`}
          >
            <Trash2 size={12} />
            Clear All
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className={`text-center py-16 rounded-2xl ${isDark ? 'bg-white/5 border border-white/5' : 'bg-white border border-gray-100'}`}>
          <span className="text-5xl mb-4 block">📋</span>
          <h3 className="font-bold text-lg mb-2">No history yet</h3>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} mb-4`}>
            You haven&apos;t used any tools yet. Try one of our AI utilities.
          </p>
          <Link
            to="/tools"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500 text-white text-sm font-medium hover:bg-indigo-600 transition-colors"
          >
            Explore Tools <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map(item => (
            <div
              key={item.id}
              className={`flex items-center gap-4 p-4 rounded-xl ${isDark ? 'bg-white/5 border border-white/5' : 'bg-white border border-gray-100 shadow-sm'}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-indigo-500/10' : 'bg-indigo-50'}`}>
                <Clock size={16} className="text-indigo-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold">{item.toolName}</h3>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${isDark ? 'bg-white/10 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
                    {formatDate(item.timestamp)}
                  </span>
                </div>
                <p className={`text-xs mt-0.5 truncate ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Input: {item.inputPreview}
                </p>
                <p className={`text-xs truncate ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  Output: {item.outputPreview}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  to={`/tool/${item.toolId}`}
                  className={`p-2 rounded-lg ${isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-500'} transition-colors`}
                  title="Reopen tool"
                >
                  <ArrowRight size={14} />
                </Link>
                <button
                  onClick={() => deleteHistoryItem(item.id)}
                  className={`p-2 rounded-lg ${isDark ? 'hover:bg-red-500/10 text-gray-400 hover:text-red-400' : 'hover:bg-red-50 text-gray-400 hover:text-red-500'} transition-colors`}
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {history.length > 0 && (
        <div className={`flex items-center gap-2 p-3 rounded-xl ${isDark ? 'bg-yellow-500/5 border border-yellow-500/10' : 'bg-yellow-50 border border-yellow-100'}`}>
          <AlertCircle size={14} className="text-yellow-400" />
          <p className={`text-xs ${isDark ? 'text-yellow-300/70' : 'text-yellow-600'}`}>
            History is stored locally on your device. Clear browser data to remove all history.
          </p>
        </div>
      )}
    </div>
  );
}
