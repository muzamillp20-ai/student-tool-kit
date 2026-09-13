import { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { generateChatResponse, getIsDemoMode } from '../services/aiService';
import { Send, Loader2, Copy, RefreshCw, Trash2, Plus, Check, Sparkles, AlertCircle } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

const suggestions = [
  'Explain quantum computing simply',
  'Help me plan my day',
  'Give me project ideas',
  'Summarize this concept',
  'Help me debug my code',
  'Write a short story',
];

export default function AskAIPage() {
  const { theme, addToHistory, addToRecentlyUsed } = useApp();
  const isDark = theme === 'dark';
  const isDemo = getIsDemoMode();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!loading) {
      inputRef.current?.focus();
    }
  }, [loading]);

  const handleSend = async (text?: string) => {
    const message = text || input.trim();
    if (!message || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setError('');

    try {
      // Build conversation history for the API
      const conversationHistory = [...messages, userMsg].map(m => ({
        role: m.role,
        content: m.content,
      }));

      const response = await generateChatResponse(conversationHistory);
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, aiMsg]);
      addToHistory({
        toolId: 'ask-ai',
        toolName: 'Ask AI',
        inputPreview: message.slice(0, 100),
        outputPreview: response.slice(0, 100),
      });
      addToRecentlyUsed('ask-ai');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '⚠️ Something went wrong. Please try again.',
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (msg: Message) => {
    try {
      await navigator.clipboard.writeText(msg.content);
      setCopiedId(msg.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = msg.content;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedId(msg.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleRegenerate = async () => {
    if (loading || messages.length === 0) return;
    
    // Find the last user message
    const lastUserIndex = messages.map(m => m.role).lastIndexOf('user');
    if (lastUserIndex === -1) return;
    
    const userMsg = messages[lastUserIndex];
    
    // Remove messages after the last user message
    setMessages(prev => prev.slice(0, lastUserIndex + 1));
    setLoading(true);
    setError('');

    try {
      const conversationHistory = messages.slice(0, lastUserIndex + 1).map(m => ({
        role: m.role,
        content: m.content,
      }));

      const response = await generateChatResponse(conversationHistory);
      const aiMsg: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: response,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to regenerate.');
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setError('');
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const lastAssistantIndex = messages.map(m => m.role).lastIndexOf('assistant');

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] lg:h-[calc(100vh-6rem)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <Sparkles size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Ask AI</h1>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {isDemo ? 'Demo Mode — Simulated responses' : 'Connected to AI API'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <>
              <button
                onClick={handleRegenerate}
                disabled={loading}
                className={`p-2 rounded-lg ${isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-500'} transition-colors disabled:opacity-50`}
                title="Regenerate last response"
              >
                <RefreshCw size={16} />
              </button>
              <button
                onClick={handleNewChat}
                className={`p-2 rounded-lg ${isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-500'} transition-colors`}
                title="New conversation"
              >
                <Plus size={16} />
              </button>
              <button
                onClick={() => { setMessages([]); setError(''); }}
                className={`p-2 rounded-lg ${isDark ? 'hover:bg-red-500/10 text-gray-400 hover:text-red-400' : 'hover:bg-red-50 text-gray-400 hover:text-red-500'} transition-colors`}
                title="Clear conversation"
              >
                <Trash2 size={16} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Demo Mode Banner */}
      {isDemo && messages.length === 0 && (
        <div className={`flex items-center gap-2 p-3 rounded-xl mb-4 ${isDark ? 'bg-yellow-500/5 border border-yellow-500/20' : 'bg-yellow-50 border border-yellow-200'}`}>
          <Sparkles size={14} className="text-yellow-400 flex-shrink-0" />
          <p className={`text-xs ${isDark ? 'text-yellow-300/80' : 'text-yellow-700'}`}>
            <strong>Demo Mode</strong> — Responses are simulated. Add <code className={`px-1 py-0.5 rounded text-[10px] ${isDark ? 'bg-yellow-500/10' : 'bg-yellow-100'}`}>VITE_AI_API_KEY</code> to enable real AI.
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className={`flex items-center gap-2 p-3 rounded-xl mb-4 ${isDark ? 'bg-red-500/10 border border-red-500/20' : 'bg-red-50 border border-red-200'}`}>
          <AlertCircle size={14} className="text-red-400 flex-shrink-0" />
          <p className={`text-xs ${isDark ? 'text-red-300' : 'text-red-600'}`}>{error}</p>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center mb-4">
              <Sparkles size={24} className="text-indigo-400" />
            </div>
            <h2 className="text-lg font-bold mb-2">How can I help you today?</h2>
            <p className={`text-sm mb-6 max-w-md ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Ask me anything — I can help with writing, coding, planning, learning, and more.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg w-full">
              {suggestions.map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(suggestion)}
                  className={`text-left p-3 rounded-xl text-sm ${isDark ? 'bg-white/5 hover:bg-white/10 border border-white/5 text-gray-300' : 'bg-white hover:bg-gray-50 border border-gray-200 text-gray-600 shadow-sm'} transition-colors`}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] sm:max-w-[75%] ${msg.role === 'user' ? 'order-2' : ''}`}>
                <div
                  className={`rounded-2xl px-4 py-3 ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
                      : isDark
                        ? 'bg-white/5 border border-white/10 text-gray-200'
                        : 'bg-white border border-gray-200 text-gray-700 shadow-sm'
                  }`}
                >
                  <div className="text-sm whitespace-pre-wrap leading-relaxed">
                    {msg.content.split('\n').map((line, i) => {
                      if (line.startsWith('**') && line.endsWith('**')) {
                        return <p key={i} className="font-bold mt-1">{line.replace(/\*\*/g, '')}</p>;
                      }
                      if (line.startsWith('---')) {
                        return <hr key={i} className={`my-2 ${isDark ? 'border-white/10' : 'border-gray-200'}`} />;
                      }
                      if (line.startsWith('•') || line.startsWith('-')) {
                        return <p key={i} className="ml-3 my-0.5">{line}</p>;
                      }
                      if (line.startsWith('*') && line.endsWith('*') && !line.startsWith('**')) {
                        return <p key={i} className={`italic text-xs mt-1 ${msg.role === 'user' ? 'text-white/60' : isDark ? 'text-gray-400' : 'text-gray-500'}`}>{line.replace(/\*/g, '')}</p>;
                      }
                      if (line.trim() === '') return <br key={i} />;
                      // Handle inline formatting
                      const parts = line.split(/(\*\*[^*]+\*\*)/g);
                      return (
                        <p key={i} className="my-0.5">
                          {parts.map((part, j) => {
                            if (part.startsWith('**') && part.endsWith('**')) {
                              return <strong key={j}>{part.replace(/\*\*/g, '')}</strong>;
                            }
                            if (part.startsWith('`') && part.endsWith('`')) {
                              return <code key={j} className={`px-1 py-0.5 rounded text-xs ${isDark ? 'bg-white/10' : 'bg-gray-100'}`}>{part.replace(/`/g, '')}</code>;
                            }
                            return <span key={j}>{part}</span>;
                          })}
                        </p>
                      );
                    })}
                  </div>
                </div>
                {msg.role === 'assistant' && (
                  <div className="flex items-center gap-1 mt-1.5 ml-1">
                    <button
                      onClick={() => handleCopy(msg)}
                      className={`p-1 rounded ${isDark ? 'hover:bg-white/10 text-gray-500' : 'hover:bg-gray-100 text-gray-400'} transition-colors`}
                      title="Copy"
                    >
                      {copiedId === msg.id ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex justify-start">
            <div className={`rounded-2xl px-4 py-3 ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200 shadow-sm'}`}>
              <div className="flex items-center gap-2">
                <Loader2 size={14} className="animate-spin text-indigo-400" />
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>AI is thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className={`flex-shrink-0 rounded-2xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200 shadow-sm'}`}>
        <div className="flex items-end gap-2 p-3">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            rows={1}
            className={`flex-1 bg-transparent outline-none text-sm resize-none max-h-32 ${isDark ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-400'}`}
            style={{ minHeight: '24px' }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = Math.min(target.scrollHeight, 128) + 'px';
            }}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="p-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            aria-label="Send message"
          >
            <Send size={16} />
          </button>
        </div>
        <div className={`px-3 pb-2 flex items-center justify-between ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
          <span className="text-[10px]">Press Enter to send, Shift+Enter for new line</span>
          {messages.length > 0 && (
            <button
              onClick={handleNewChat}
              className="text-[10px] hover:text-indigo-400 transition-colors"
            >
              + New Chat
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
