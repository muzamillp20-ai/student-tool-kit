import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { tools, categories, getToolById, getMVPTools, searchTools } from '../data/tools';
import { Search, ArrowRight, Sparkles, Zap, Shield, Layers, Dice5, Star, Clock, TrendingUp } from 'lucide-react';

export default function HomePage() {
  const { theme, favorites, recentlyUsed } = useApp();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showRandom, setShowRandom] = useState(false);
  const [randomTool, setRandomTool] = useState(tools[0]);

  const mvpTools = getMVPTools();
  const toolOfDay = tools[new Date().getDate() % tools.length];
  const recentTools = recentlyUsed.slice(0, 6).map(id => getToolById(id)).filter(Boolean);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/tools?search=${encodeURIComponent(searchQuery)}`);
  };

  const handleRandom = () => {
    const random = tools[Math.floor(Math.random() * tools.length)];
    setRandomTool(random);
    setShowRandom(true);
  };

  const searchResults = searchQuery.length > 1 ? searchTools(searchQuery).slice(0, 5) : [];

  return (
    <div className="space-y-12 pb-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl">
        <div className={`relative ${isDark ? 'bg-gradient-to-br from-indigo-900/40 via-purple-900/30 to-[#0f0f14]' : 'bg-gradient-to-br from-indigo-50 via-purple-50 to-white'} p-8 md:p-12 lg:p-16`}>
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
          </div>
          <div className="relative z-10 max-w-3xl">
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-6 ${isDark ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20' : 'bg-indigo-100 text-indigo-700'}`}>
              <Sparkles size={12} />
              Your everyday AI toolbox
            </div>
            <h1 className={`text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Everything you need from AI,{' '}
              <span className="gradient-text">in one place.</span>
            </h1>
            <p className={`text-base md:text-lg mb-8 max-w-2xl ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Write, summarize, calculate, convert, plan, analyze and create with a collection of practical AI-powered utilities.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/tools"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium text-sm hover:opacity-90 transition-opacity shadow-lg shadow-indigo-500/25"
              >
                Explore AI Tools
                <ArrowRight size={16} />
              </Link>
              <button
                onClick={handleRandom}
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm transition-colors ${isDark ? 'bg-white/10 hover:bg-white/15 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
              >
                <Dice5 size={16} />
                Try Random Tool
              </button>
            </div>
          </div>
          {/* Decorative element */}
          <div className="hidden lg:block absolute right-12 top-1/2 -translate-y-1/2">
            <div className="relative w-64 h-64">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-3xl rotate-12 animate-float" />
              <div className="absolute inset-4 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-2xl -rotate-6" style={{ animationDelay: '0.5s' }}>
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-6xl animate-float">🤖</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Random Tool Modal */}
      {showRandom && randomTool && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowRandom(false)} />
          <div className={`relative w-full max-w-md rounded-2xl p-6 ${isDark ? 'bg-[#1a1a2e] border border-white/10' : 'bg-white border border-gray-200'} shadow-2xl`}>
            <p className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>🎲 You might like this tool...</p>
            <div className="flex items-center gap-4 mb-4">
              <span className="text-4xl">{randomTool.icon}</span>
              <div>
                <h3 className="font-bold text-lg">{randomTool.name}</h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{randomTool.description}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link
                to={`/tool/${randomTool.id}`}
                onClick={() => setShowRandom(false)}
                className="flex-1 text-center px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium text-sm"
              >
                Open Tool
              </Link>
              <button
                onClick={() => setShowRandom(false)}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium ${isDark ? 'bg-white/10 hover:bg-white/15' : 'bg-gray-100 hover:bg-gray-200'}`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search Section */}
      <section>
        <form onSubmit={handleSearch} className="relative">
          <div className={`flex items-center gap-3 px-5 py-4 rounded-2xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200 shadow-sm'}`}>
            <Search size={20} className="opacity-50" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search for AI tools..."
              className="flex-1 bg-transparent outline-none text-sm"
            />
            <button type="submit" className="px-4 py-2 rounded-lg bg-indigo-500 text-white text-sm font-medium hover:bg-indigo-600 transition-colors">
              Search
            </button>
          </div>
          {searchResults.length > 0 && (
            <div className={`absolute top-full left-0 right-0 mt-2 rounded-xl ${isDark ? 'bg-[#1a1a2e] border border-white/10' : 'bg-white border border-gray-200'} shadow-xl overflow-hidden z-20`}>
              {searchResults.map(tool => (
                <Link
                  key={tool.id}
                  to={`/tool/${tool.id}`}
                  className={`flex items-center gap-3 px-4 py-3 ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'} transition-colors`}
                >
                  <span className="text-lg">{tool.icon}</span>
                  <div>
                    <p className="text-sm font-medium">{tool.name}</p>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{tool.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </form>
      </section>

      {/* Popular Tools */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <TrendingUp size={20} className="text-indigo-400" />
              Popular Tools
            </h2>
            <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Most used AI utilities</p>
          </div>
          <Link to="/tools" className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
            View all <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {mvpTools.slice(0, 8).map(tool => (
            <ToolCard key={tool.id} tool={tool} isDark={isDark} isFavorite={favorites.includes(tool.id)} onToggleFavorite={() => {}} />
          ))}
        </div>
      </section>

      {/* Categories */}
      <section>
        <h2 className="text-xl font-bold mb-6">📂 Categories</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {categories.map(cat => (
            <Link
              key={cat.id}
              to={`/tools?category=${cat.id}`}
              className={`p-4 rounded-xl text-center card-hover ${isDark ? 'bg-white/5 hover:bg-white/10 border border-white/5' : 'bg-white hover:bg-gray-50 border border-gray-100 shadow-sm'}`}
            >
              <span className="text-2xl mb-2 block">{cat.icon}</span>
              <p className="text-sm font-medium">{cat.name}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Tool of the Day */}
      <section>
        <div className={`rounded-2xl p-6 md:p-8 ${isDark ? 'bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20' : 'bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100'}`}>
          <div className="flex items-center gap-2 mb-4">
            <Star size={16} className="text-yellow-400" />
            <span className="text-sm font-semibold text-indigo-400">Today&apos;s Tool</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex items-center gap-4 flex-1">
              <span className="text-5xl">{toolOfDay.icon}</span>
              <div>
                <h3 className="text-xl font-bold">{toolOfDay.name}</h3>
                <p className={`text-sm mt-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{toolOfDay.description}</p>
                <p className={`text-xs mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  ✨ Great for quick tasks • Easy to use • AI-powered
                </p>
              </div>
            </div>
            <Link
              to={`/tool/${toolOfDay.id}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium text-sm hover:opacity-90 transition-opacity whitespace-nowrap"
            >
              Try Now <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* Recently Used */}
      {recentTools.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Clock size={20} className="text-indigo-400" />
              Recently Used
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentTools.map(tool => tool && (
              <ToolCard key={tool.id} tool={tool} isDark={isDark} isFavorite={favorites.includes(tool.id)} onToggleFavorite={() => {}} />
            ))}
          </div>
        </section>
      )}

      {/* Why AI Utility Hub */}
      <section>
        <h2 className="text-xl font-bold mb-6 text-center">Why AI Utility Hub?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: <Zap className="text-yellow-400" size={24} />, title: 'Fast', desc: 'Access useful tools without switching between multiple websites.' },
            { icon: <Layers className="text-indigo-400" size={24} />, title: 'All-in-One', desc: 'Writing, studying, productivity, coding and smart utilities in one place.' },
            { icon: <Shield className="text-green-400" size={24} />, title: 'Simple', desc: 'Clean interface with easy-to-understand tools for everyone.' },
          ].map((item, i) => (
            <div key={i} className={`p-6 rounded-2xl text-center card-hover ${isDark ? 'bg-white/5 border border-white/5' : 'bg-white border border-gray-100 shadow-sm'}`}>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 flex items-center justify-center mx-auto mb-4">
                {item.icon}
              </div>
              <h3 className="font-bold text-lg mb-2">{item.title}</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Coming Soon */}
      <section>
        <h2 className="text-xl font-bold mb-6">🚀 Coming Soon</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { name: 'PDF AI Tools', icon: '📄' },
            { name: 'Image AI Tools', icon: '🖼️' },
            { name: 'Voice AI Tools', icon: '🎙️' },
            { name: 'Document Analyzer', icon: '📊' },
            { name: 'AI Web Research', icon: '🌐' },
            { name: 'Browser AI Assistant', icon: '🔍' },
            { name: 'AI Automation', icon: '⚙️' },
            { name: 'Custom AI Agents', icon: '🤖' },
          ].map((item, i) => (
            <div key={i} className={`p-4 rounded-xl text-center opacity-60 ${isDark ? 'bg-white/5 border border-white/5' : 'bg-gray-50 border border-gray-100'}`}>
              <span className="text-2xl mb-2 block">{item.icon}</span>
              <p className="text-xs font-medium">{item.name}</p>
              <span className="text-[10px] text-indigo-400 font-semibold mt-1 block">Coming Soon</span>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className={`pt-8 border-t ${isDark ? 'border-white/5' : 'border-gray-200'}`}>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Sparkles size={12} className="text-white" />
            </div>
            <span className="text-sm font-semibold gradient-text">AI Utility Hub</span>
          </div>
          <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            © 2025 AI Utility Hub. Your everyday AI toolbox.
          </p>
          <div className="flex gap-4">
            <Link to="/about" className={`text-xs ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}>About</Link>
            <Link to="/tools" className={`text-xs ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}>Tools</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Tool Card Component
function ToolCard({ tool, isDark, isFavorite }: { tool: any; isDark: boolean; isFavorite: boolean; onToggleFavorite?: () => void }) {
  const { addFavorite, removeFavorite, addToRecentlyUsed } = useApp();
  
  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isFavorite) removeFavorite(tool.id);
    else addFavorite(tool.id);
  };

  return (
    <Link
      to={`/tool/${tool.id}`}
      onClick={() => addToRecentlyUsed(tool.id)}
      className={`group p-4 rounded-xl card-hover ${isDark ? 'bg-white/5 border border-white/5 hover:border-indigo-500/30' : 'bg-white border border-gray-100 hover:border-indigo-200 shadow-sm'}`}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-2xl">{tool.icon}</span>
        <button
          onClick={handleFavorite}
          className={`p-1.5 rounded-lg transition-colors ${isFavorite ? 'text-red-400' : isDark ? 'text-gray-500 hover:text-red-400' : 'text-gray-300 hover:text-red-400'}`}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Star size={14} fill={isFavorite ? 'currentColor' : 'none'} />
        </button>
      </div>
      <h3 className="font-semibold text-sm mb-1">{tool.name}</h3>
      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'} line-clamp-2`}>{tool.description}</p>
      <div className="mt-3 flex items-center justify-between">
        <span className={`text-[10px] px-2 py-0.5 rounded-full ${isDark ? 'bg-indigo-500/10 text-indigo-300' : 'bg-indigo-50 text-indigo-600'}`}>
          {categories.find(c => c.id === tool.category)?.name || tool.category}
        </span>
        <span className={`text-xs opacity-0 group-hover:opacity-100 transition-opacity ${isDark ? 'text-indigo-400' : 'text-indigo-500'}`}>
          Open →
        </span>
      </div>
    </Link>
  );
}
