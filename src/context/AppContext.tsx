import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface HistoryItem {
  id: string;
  toolId: string;
  toolName: string;
  inputPreview: string;
  outputPreview: string;
  timestamp: number;
}

interface AppState {
  theme: 'dark' | 'light';
  favorites: string[];
  history: HistoryItem[];
  recentlyUsed: string[];
  searchOpen: boolean;
}

interface AppContextType extends AppState {
  toggleTheme: () => void;
  addFavorite: (toolId: string) => void;
  removeFavorite: (toolId: string) => void;
  toggleFavorite: (toolId: string) => void;
  isFavorite: (toolId: string) => boolean;
  addToHistory: (item: Omit<HistoryItem, 'id' | 'timestamp'>) => void;
  clearHistory: () => void;
  deleteHistoryItem: (id: string) => void;
  addToRecentlyUsed: (toolId: string) => void;
  addToRecent: (toolId: string) => void;
  setSearchOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | null>(null);

function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => loadFromStorage('ai-hub-theme', 'dark'));
  const [favorites, setFavorites] = useState<string[]>(() => loadFromStorage('ai-hub-favorites', []));
  const [history, setHistory] = useState<HistoryItem[]>(() => loadFromStorage('ai-hub-history', []));
  const [recentlyUsed, setRecentlyUsed] = useState<string[]>(() => loadFromStorage('ai-hub-recent', []));
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.remove('dark', 'light');
    document.documentElement.classList.add(theme);
    localStorage.setItem('ai-hub-theme', JSON.stringify(theme));
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('ai-hub-favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('ai-hub-history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('ai-hub-recent', JSON.stringify(recentlyUsed));
  }, [recentlyUsed]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  }, []);

  const addFavorite = useCallback((toolId: string) => {
    setFavorites(prev => prev.includes(toolId) ? prev : [...prev, toolId]);
  }, []);

  const removeFavorite = useCallback((toolId: string) => {
    setFavorites(prev => prev.filter(id => id !== toolId));
  }, []);

  const isFavorite = useCallback((toolId: string) => favorites.includes(toolId), [favorites]);

  const addToHistory = useCallback((item: Omit<HistoryItem, 'id' | 'timestamp'>) => {
    const newItem: HistoryItem = {
      ...item,
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      timestamp: Date.now(),
    };
    setHistory(prev => [newItem, ...prev].slice(0, 100));
  }, []);

  const clearHistory = useCallback(() => setHistory([]), []);

  const deleteHistoryItem = useCallback((id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  }, []);

  const addToRecentlyUsed = useCallback((toolId: string) => {
    setRecentlyUsed(prev => {
      const filtered = prev.filter(id => id !== toolId);
      return [toolId, ...filtered].slice(0, 10);
    });
  }, []);

  const toggleFavorite = useCallback((toolId: string) => {
    setFavorites(prev => prev.includes(toolId) ? prev.filter(id => id !== toolId) : [...prev, toolId]);
  }, []);

  const addToRecent = addToRecentlyUsed;

  return (
    <AppContext.Provider value={{
      theme, favorites, history, recentlyUsed, searchOpen,
      toggleTheme, addFavorite, removeFavorite, toggleFavorite, isFavorite,
      addToHistory, clearHistory, deleteHistoryItem,
      addToRecentlyUsed, addToRecent, setSearchOpen,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
