import { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { tools, categories, searchTools } from '../data/tools';
import { Search, SlidersHorizontal, Star, Grid3X3, List } from 'lucide-react';

export default function ToolsPage() {
  const { theme, favorites, addFavorite, removeFavorite, addToRecentlyUsed } = useApp();
  const isDark = theme === 'dark';
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || 'all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'category'>('name');

  const filteredTools = useMemo(() => {
    let result = tools;
    if (search) result = searchTools(search);
    if (activeCategory !== 'all') result = result.filter(t => t.category === activeCategory);
    if (sortBy === 'name') result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    return result;
  }, [search, activeCategory, sortBy]);

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">AI Tools</h1>
        <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          Browse {tools.length} AI-powered utilities
        </p>
      </div>

      {/* Search & Filters */}
      <div className="space-y-4">
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200 shadow-sm'}`}>
          <Search size={18} className="opacity-50" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search tools by name, description, or keyword..."
            className="flex-1 bg-transparent outline-none text-sm"
          />
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className={`text-xs px-2 py-1.5 rounded-lg outline-none ${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              <option value="name">Sort: Name</option>
              <option value="category">Sort: Category</option>
            </select>
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
            >
              {viewMode === 'grid' ? <List size={16} /> : <Grid3X3 size={16} />}
            </button>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setActiveCategory('all')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              activeCategory === 'all'
                ? 'bg-indigo-500 text-white'
                : isDark ? 'bg-white/5 text-gray-300 hover:bg-white/10' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <SlidersHorizontal size={12} />
            All ({tools.length})
          </button>
          {categories.map(cat => {
            const count = tools.filter(t => t.category === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  activeCategory === cat.id
                    ? 'bg-indigo-500 text-white'
                    : isDark ? 'bg-white/5 text-gray-300 hover:bg-white/10' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span>{cat.icon}</span>
                {cat.name} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Results count */}
      <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
        Showing {filteredTools.length} tool{filteredTools.length !== 1 ? 's' : ''}
        {search && ` for "${search}"`}
      </p>

      {/* Tools Grid */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredTools.map(tool => (
            <Link
              key={tool.id}
              to={`/tool/${tool.id}`}
              onClick={() => addToRecentlyUsed(tool.id)}
              className={`group p-5 rounded-xl card-hover ${isDark ? 'bg-white/5 border border-white/5 hover:border-indigo-500/30' : 'bg-white border border-gray-100 hover:border-indigo-200 shadow-sm'}`}
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-3xl">{tool.icon}</span>
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); favorites.includes(tool.id) ? removeFavorite(tool.id) : addFavorite(tool.id); }}
                  className={`p-1.5 rounded-lg transition-colors ${favorites.includes(tool.id) ? 'text-red-400' : isDark ? 'text-gray-500 hover:text-red-400' : 'text-gray-300 hover:text-red-400'}`}
                >
                  <Star size={14} fill={favorites.includes(tool.id) ? 'currentColor' : 'none'} />
                </button>
              </div>
              <h3 className="font-semibold text-sm mb-1">{tool.name}</h3>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'} line-clamp-2 mb-3`}>{tool.description}</p>
              <div className="flex items-center justify-between">
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${isDark ? 'bg-indigo-500/10 text-indigo-300' : 'bg-indigo-50 text-indigo-600'}`}>
                  {categories.find(c => c.id === tool.category)?.name}
                </span>
                <span className={`text-xs opacity-0 group-hover:opacity-100 transition-opacity ${isDark ? 'text-indigo-400' : 'text-indigo-500'}`}>
                  Open →
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredTools.map(tool => (
            <Link
              key={tool.id}
              to={`/tool/${tool.id}`}
              onClick={() => addToRecentlyUsed(tool.id)}
              className={`flex items-center gap-4 p-4 rounded-xl transition-colors ${isDark ? 'bg-white/5 hover:bg-white/10 border border-white/5' : 'bg-white hover:bg-gray-50 border border-gray-100 shadow-sm'}`}
            >
              <span className="text-2xl">{tool.icon}</span>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm">{tool.name}</h3>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'} truncate`}>{tool.description}</p>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap ${isDark ? 'bg-indigo-500/10 text-indigo-300' : 'bg-indigo-50 text-indigo-600'}`}>
                {categories.find(c => c.id === tool.category)?.name}
              </span>
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); favorites.includes(tool.id) ? removeFavorite(tool.id) : addFavorite(tool.id); }}
                className={`p-1.5 rounded-lg ${favorites.includes(tool.id) ? 'text-red-400' : isDark ? 'text-gray-500' : 'text-gray-300'}`}
              >
                <Star size={14} fill={favorites.includes(tool.id) ? 'currentColor' : 'none'} />
              </button>
            </Link>
          ))}
        </div>
      )}

      {filteredTools.length === 0 && (
        <div className="text-center py-16">
          <span className="text-4xl mb-4 block">🔍</span>
          <p className="font-medium">No tools found</p>
          <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Try a different search or category</p>
        </div>
      )}
    </div>
  );
}
