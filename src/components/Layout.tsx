import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { searchTools } from '../data/tools';
import {
  Home, Wrench, Heart, Clock, User, Info, Search,
  Moon, Sun, Menu, X, Sparkles, GraduationCap, BarChart3,
  MessageSquare, ChevronRight, Zap, Settings, LogOut, Check
} from 'lucide-react';

const navItems = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/tools', label: 'AI Tools', icon: Wrench },
  { path: '/ask-ai', label: 'Ask AI', icon: MessageSquare },
  { path: '/student', label: 'Student', icon: GraduationCap },
  { path: '/productivity', label: 'Productivity', icon: BarChart3 },
  { path: '/favorites', label: 'Favorites', icon: Heart },
  { path: '/history', label: 'History', icon: Clock },
  { path: '/settings', label: 'Settings', icon: Settings },
  { path: '/profile', label: 'Profile', icon: User },
  { path: '/about', label: 'About', icon: Info },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { theme, toggleTheme, searchOpen, setSearchOpen } = useApp();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isDark = theme === 'dark';

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setUserMenuOpen(false);
    if (userMenuOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [userMenuOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === 'Escape') setSearchOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setSearchOpen]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location]);

  return (
    <div className={`min-h-screen transition-theme ${isDark ? 'bg-[#0f0f14] text-white' : 'bg-[#f8f9fc] text-gray-900'}`}>
      {/* Top Navbar */}
      <header className={`fixed top-0 left-0 right-0 z-50 h-16 ${isDark ? 'bg-[#0f0f14]/80 border-white/5' : 'bg-white/80 border-gray-200'} backdrop-blur-xl border-b`}>
        <div className="h-full flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`lg:hidden p-2 rounded-lg ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'} transition-colors`}
              aria-label="Toggle menu"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Sparkles size={16} className="text-white" />
              </div>
              <span className="font-bold text-lg hidden sm:block">
                <span className="gradient-text">AI Utility Hub</span>
              </span>
            </Link>
          </div>

          <div className="hidden md:flex flex-1 max-w-md mx-6">
            <button
              onClick={() => setSearchOpen(true)}
              className={`w-full flex items-center gap-2 px-4 py-2 rounded-xl ${isDark ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-gray-100 border-gray-200 hover:bg-gray-200'} border transition-colors`}
            >
              <Search size={16} className="opacity-50" />
              <span className="opacity-50 text-sm">Search tools... (Ctrl+K)</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSearchOpen(true)}
              className={`md:hidden p-2 rounded-lg ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'} transition-colors`}
              aria-label="Search"
            >
              <Search size={18} />
            </button>
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'} transition-colors`}
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            {/* User Menu */}
            {user && (
              <div className="relative">
                <button
                  onClick={(e) => { e.stopPropagation(); setUserMenuOpen(!userMenuOpen); }}
                  className={`flex items-center gap-2 p-1.5 pr-3 rounded-xl ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'} transition-colors`}
                >
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    <span className="text-xs font-bold text-white">{getInitials(user.name)}</span>
                  </div>
                  <span className={`hidden sm:block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {user.name.split(' ')[0]}
                  </span>
                </button>
                
                {userMenuOpen && (
                  <div className={`absolute right-0 top-full mt-2 w-64 rounded-xl ${isDark ? 'bg-[#1a1a2e] border-white/10' : 'bg-white border-gray-200'} border shadow-2xl overflow-hidden z-50`}>
                    {/* User Info */}
                    <div className={`p-4 ${isDark ? 'border-white/10' : 'border-gray-100'} border-b`}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                          <span className="text-sm font-bold text-white">{getInitials(user.name)}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate">{user.name}</p>
                          <p className={`text-xs truncate ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{user.email}</p>
                        </div>
                        {user.emailVerified && (
                          <Check size={14} className="text-green-400 flex-shrink-0" />
                        )}
                      </div>
                    </div>
                    
                    {/* Menu Items */}
                    <div className="p-2">
                      <Link
                        to="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg ${isDark ? 'hover:bg-white/5 text-gray-300' : 'hover:bg-gray-50 text-gray-700'} transition-colors`}
                      >
                        <User size={16} />
                        <span className="text-sm">My Profile</span>
                      </Link>
                      <Link
                        to="/settings"
                        onClick={() => setUserMenuOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg ${isDark ? 'hover:bg-white/5 text-gray-300' : 'hover:bg-gray-50 text-gray-700'} transition-colors`}
                      >
                        <Settings size={16} />
                        <span className="text-sm">Settings</span>
                      </Link>
                      <Link
                        to="/favorites"
                        onClick={() => setUserMenuOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg ${isDark ? 'hover:bg-white/5 text-gray-300' : 'hover:bg-gray-50 text-gray-700'} transition-colors`}
                      >
                        <Heart size={16} />
                        <span className="text-sm">Favorites</span>
                      </Link>
                    </div>
                    
                    {/* Logout */}
                    <div className={`p-2 ${isDark ? 'border-white/10' : 'border-gray-100'} border-t`}>
                      <button
                        onClick={handleLogout}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg w-full ${isDark ? 'hover:bg-red-500/10 text-red-400' : 'hover:bg-red-50 text-red-500'} transition-colors`}
                      >
                        <LogOut size={16} />
                        <span className="text-sm">Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Sidebar - Desktop */}
      <aside className={`hidden lg:flex fixed left-0 top-16 bottom-0 w-64 flex-col ${isDark ? 'bg-[#0f0f14] border-white/5' : 'bg-white border-gray-200'} border-r z-40`}>
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 transition-all ${
                  isActive
                    ? isDark ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-600'
                    : isDark ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Icon size={18} />
                <span className="text-sm font-medium">{item.label}</span>
                {isActive && <ChevronRight size={14} className="ml-auto" />}
              </Link>
            );
          })}
        </nav>
        <div className={`p-4 mx-3 mb-3 rounded-xl ${isDark ? 'bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20' : 'bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100'}`}>
          <div className="flex items-center gap-2 mb-2">
            <Zap size={14} className="text-indigo-400" />
            <span className="text-xs font-semibold text-indigo-400">Demo Mode</span>
          </div>
          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            AI responses are simulated. Connect an API for real results.
          </p>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className={`absolute left-0 top-16 bottom-0 w-72 ${isDark ? 'bg-[#0f0f14]' : 'bg-white'} shadow-2xl`}>
            <nav className="overflow-y-auto py-4 px-3">
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-3 rounded-xl mb-1 transition-all ${
                      isActive
                        ? isDark ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-600'
                        : isDark ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon size={18} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </aside>
        </div>
      )}

      {/* Search Modal */}
      {searchOpen && (
        <SearchModal query={searchQuery} setQuery={setSearchQuery} onClose={() => { setSearchOpen(false); setSearchQuery(''); }} isDark={isDark} />
      )}

      {/* Main Content */}
      <main className="pt-16 lg:pl-64 min-h-screen pb-20 lg:pb-0">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 animate-fade-in" key={location.pathname}>
          {children}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className={`lg:hidden fixed bottom-0 left-0 right-0 ${isDark ? 'bg-[#0f0f14]/90 border-white/10' : 'bg-white/90 border-gray-200'} backdrop-blur-xl border-t z-40`}>
        <div className="flex items-center justify-around py-2">
          {[
            { path: '/', icon: Home, label: 'Home' },
            { path: '/tools', icon: Wrench, label: 'Tools' },
            { path: '/ask-ai', icon: MessageSquare, label: 'Ask AI' },
            { path: '/favorites', icon: Heart, label: 'Favorites' },
            { path: '/profile', icon: User, label: 'Profile', isAvatar: true },
          ].map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg ${
                  isActive ? 'text-indigo-400' : isDark ? 'text-gray-500' : 'text-gray-400'
                }`}
              >
                {(item as any).isAvatar && user ? (
                  <div className="w-5 h-5 rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    <span className="text-[8px] font-bold text-white">{getInitials(user.name)}</span>
                  </div>
                ) : (
                  <Icon size={18} />
                )}
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

function SearchModal({ query, setQuery, onClose, isDark }: { query: string; setQuery: (q: string) => void; onClose: () => void; isDark: boolean }) {
  const { setSearchOpen } = useApp();
  const [results, setResults] = useState<ReturnType<typeof searchTools>>([]);

  useEffect(() => {
    if (query.length > 0) {
      setResults(searchTools(query).slice(0, 8));
    } else {
      setResults([]);
    }
  }, [query]);

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full max-w-lg rounded-2xl ${isDark ? 'bg-[#1a1a2e] border-white/10' : 'bg-white border-gray-200'} border shadow-2xl overflow-hidden`}>
        <div className={`flex items-center gap-3 px-4 py-3 ${isDark ? 'border-white/10' : 'border-gray-200'} border-b`}>
          <Search size={18} className="opacity-50" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search AI tools..."
            className="flex-1 bg-transparent outline-none text-sm"
            autoFocus
          />
          <kbd className={`hidden sm:inline text-xs px-2 py-0.5 rounded ${isDark ? 'bg-white/10' : 'bg-gray-100'}`}>ESC</kbd>
        </div>
        {results.length > 0 && (
          <div className="max-h-80 overflow-y-auto py-2">
            {results.map((tool) => (
              <Link
                key={tool.id}
                to={`/tool/${tool.id}`}
                onClick={() => { onClose(); setSearchOpen(false); }}
                className={`flex items-center gap-3 px-4 py-3 ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'} transition-colors`}
              >
                <span className="text-xl">{tool.icon}</span>
                <div>
                  <p className="text-sm font-medium">{tool.name}</p>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{tool.description}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
        {query.length > 0 && results.length === 0 && (
          <div className="py-8 text-center">
            <p className="text-sm opacity-50">No tools found for &quot;{query}&quot;</p>
          </div>
        )}
        {query.length === 0 && (
          <div className="py-6 px-4">
            <p className={`text-xs font-medium mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Quick suggestions</p>
            <div className="flex flex-wrap gap-2">
              {['Summarizer', 'Email', 'Quiz', 'Code', 'Study'].map(tag => (
                <button
                  key={tag}
                  onClick={() => setQuery(tag)}
                  className={`text-xs px-3 py-1.5 rounded-full ${isDark ? 'bg-white/5 hover:bg-white/10 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'} transition-colors`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
