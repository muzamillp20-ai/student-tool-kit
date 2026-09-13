import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getToolById } from '../data/tools';
import { generateAIResponse, getIsDemoMode } from '../services/aiService';
import {
  ArrowLeft, Heart, Copy, Download, RefreshCw, Share2,
  Sparkles, Loader2, AlertCircle, Check, ChevronDown
} from 'lucide-react';

export default function ToolDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { theme, favorites, toggleFavorite, addToHistory, addToRecent } = useApp();
  const isDark = theme === 'dark';
  const isDemo = getIsDemoMode();

  const tool = id ? getToolById(id) : null;

  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [options, setOptions] = useState<Record<string, string>>({});
  const [showOptions, setShowOptions] = useState(false);

  useEffect(() => {
    if (tool) {
      // Redirect media-generator to its dedicated page
      if (tool.id === 'media-generator') {
        navigate('/media-generator', { replace: true });
        return;
      }
      
      setInput('');
      setOutput('');
      setError('');
      setOptions({});
      addToRecent(tool.id);
    }
  }, [tool?.id]);

  if (!tool) {
    return (
      <div className="text-center py-20">
        <span className="text-5xl mb-4 block">🔍</span>
        <h2 className="text-xl font-bold mb-2">Tool not found</h2>
        <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          The tool you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link to="/tools" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500 text-white text-sm font-medium hover:bg-indigo-600 transition-colors">
          <ArrowLeft size={14} /> Back to Tools
        </Link>
      </div>
    );
  }

  const isFavorite = favorites.includes(tool.id);

  // Tool-specific options
  const toolOptions: Record<string, { key: string; label: string; type: 'select' | 'input'; choices?: string[]; placeholder?: string }[]> = {
    summarizer: [
      { key: 'length', label: 'Summary Length', type: 'select', choices: ['Short', 'Medium', 'Detailed', 'Bullet points'] },
      { key: 'tone', label: 'Tone', type: 'select', choices: ['Neutral', 'Professional', 'Casual', 'Academic'] },
    ],
    rewriter: [
      { key: 'tone', label: 'Tone', type: 'select', choices: ['Professional', 'Casual', 'Friendly', 'Academic', 'Creative'] },
    ],
    'email-generator': [
      { key: 'purpose', label: 'Purpose', type: 'input', placeholder: 'e.g., Meeting request, Follow-up' },
      { key: 'tone', label: 'Tone', type: 'select', choices: ['Professional', 'Friendly', 'Formal', 'Casual'] },
      { key: 'recipient', label: 'Recipient', type: 'input', placeholder: 'e.g., Manager, Client, Team' },
    ],
    'caption-generator': [
      { key: 'platform', label: 'Platform', type: 'select', choices: ['Instagram', 'Twitter/X', 'LinkedIn', 'Facebook', 'TikTok'] },
      { key: 'tone', label: 'Tone', type: 'select', choices: ['Fun', 'Professional', 'Inspirational', 'Witty', 'Casual'] },
      { key: 'style', label: 'Style', type: 'select', choices: ['Short', 'Long', 'With hashtags', 'With emojis'] },
    ],
    'study-planner': [
      { key: 'duration', label: 'Duration', type: 'select', choices: ['1 week', '2 weeks', '1 month', '3 months'] },
      { key: 'hours', label: 'Hours per day', type: 'select', choices: ['1 hour', '2 hours', '3 hours', '4+ hours'] },
    ],
    'quiz-generator': [
      { key: 'questions', label: 'Number of Questions', type: 'select', choices: ['5', '10', '15', '20'] },
      { key: 'difficulty', label: 'Difficulty', type: 'select', choices: ['Easy', 'Medium', 'Hard', 'Mixed'] },
    ],
    'code-explainer': [
      { key: 'language', label: 'Programming Language', type: 'select', choices: ['Auto-detect', 'JavaScript', 'Python', 'TypeScript', 'Java', 'C++'] },
      { key: 'detail', label: 'Detail Level', type: 'select', choices: ['Brief', 'Standard', 'Detailed'] },
    ],
  };

  const currentOptions = toolOptions[tool.id] || [];

  const handleGenerate = async () => {
    if (!input.trim()) {
      setError('Please enter some text to process.');
      return;
    }
    setError('');
    setLoading(true);
    setOutput('');

    try {
      const result = await generateAIResponse({
        tool: tool.id,
        input: input.trim(),
        options,
      });
      setOutput(result);
      addToHistory({
        toolId: tool.id,
        toolName: tool.name,
        inputPreview: input.trim().slice(0, 100),
        outputPreview: result.slice(0, 100),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = output;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${tool.name.replace(/\s+/g, '-').toLowerCase()}-output.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${tool.name} - AI Utility Hub`,
          text: output,
        });
      } catch {
        // User cancelled
      }
    } else {
      handleCopy();
    }
  };

  const handleRegenerate = () => {
    handleGenerate();
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setError('');
  };

  const wordCount = input.trim() ? input.trim().split(/\s+/).length : 0;
  const charCount = input.length;

  // Get input label based on tool
  const getInputLabel = () => {
    const labels: Record<string, string> = {
      summarizer: 'Paste your text here...',
      rewriter: 'Enter text to rewrite...',
      'email-generator': 'Describe the email context...',
      'caption-generator': 'What is the topic or describe the image...',
      'study-planner': 'What subject or topic to study?',
      'quiz-generator': 'Enter the topic for the quiz...',
      'code-explainer': 'Paste your code here...',
      'grammar-fixer': 'Enter text to check grammar...',
      'paraphraser': 'Enter text to paraphrase...',
      'text-expander': 'Enter short text to expand...',
      'text-shortener': 'Enter text to shorten...',
      'bio-generator': 'Describe yourself or the person...',
      'flashcard-generator': 'Enter the topic or content...',
      'notes-summarizer': 'Paste your notes here...',
      'assignment-helper': 'Describe your assignment...',
      'question-generator': 'Enter the topic for questions...',
      'meeting-summarizer': 'Paste meeting notes here...',
      'decision-helper': 'Describe the decision you need to make...',
      'json-formatter': 'Paste your JSON here...',
      'regex-helper': 'Describe the pattern you need...',
      'sql-generator': 'Describe what data you need...',
      'idea-generator': 'What topic do you need ideas for?',
      'brainstorming-assistant': 'What are you brainstorming about?',
      'research-assistant': 'What do you need help researching?',
      'personal-assistant': 'How can I help you today?',
      'todo-generator': 'What do you need to accomplish?',
      'task-planner': 'Describe your tasks...',
      'daily-planner': 'What do you want to accomplish today?',
      'goal-generator': 'What area do you want to set goals for?',
      'time-planner': 'What tasks need scheduling?',
      'markdown-formatter': 'Paste your markdown content...',
      'api-request-generator': 'Describe the API request you need...',
    };
    return labels[tool.id] || 'Enter your input...';
  };

  return (
    <div className="space-y-6 pb-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className={`p-2 rounded-lg ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'} transition-colors`}
            aria-label="Go back"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{tool.icon}</span>
            <div>
              <h1 className="text-xl font-bold">{tool.name}</h1>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{tool.category}</p>
            </div>
          </div>
        </div>
        <button
          onClick={() => toggleFavorite(tool.id)}
          className={`p-2.5 rounded-xl transition-all ${
            isFavorite
              ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
              : isDark ? 'bg-white/5 hover:bg-white/10 text-gray-400' : 'bg-gray-100 hover:bg-gray-200 text-gray-500'
          }`}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Demo Mode Indicator */}
      {isDemo && (
        <div className={`flex items-center gap-2 p-3 rounded-xl ${isDark ? 'bg-yellow-500/5 border border-yellow-500/20' : 'bg-yellow-50 border border-yellow-200'}`}>
          <Sparkles size={14} className="text-yellow-400" />
          <p className={`text-xs ${isDark ? 'text-yellow-300/80' : 'text-yellow-700'}`}>
            <strong>Demo Mode</strong> — Responses are simulated. Add <code className={`px-1 py-0.5 rounded text-[10px] ${isDark ? 'bg-yellow-500/10' : 'bg-yellow-100'}`}>VITE_AI_API_KEY</code> to enable real AI.
          </p>
        </div>
      )}

      {/* Options */}
      {currentOptions.length > 0 && (
        <div className={`rounded-xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200 shadow-sm'}`}>
          <button
            onClick={() => setShowOptions(!showOptions)}
            className={`w-full flex items-center justify-between p-4 ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'} transition-colors rounded-xl`}
          >
            <span className="text-sm font-medium">⚙️ Options</span>
            <ChevronDown size={16} className={`transition-transform ${showOptions ? 'rotate-180' : ''}`} />
          </button>
          {showOptions && (
            <div className={`px-4 pb-4 grid grid-cols-1 sm:grid-cols-2 gap-3 ${isDark ? 'border-t border-white/5' : 'border-t border-gray-100'} pt-3`}>
              {currentOptions.map(opt => (
                <div key={opt.key}>
                  <label className={`text-xs font-medium mb-1.5 block ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {opt.label}
                  </label>
                  {opt.type === 'select' ? (
                    <select
                      value={options[opt.key] || opt.choices?.[0] || ''}
                      onChange={e => setOptions(prev => ({ ...prev, [opt.key]: e.target.value }))}
                      className={`w-full px-3 py-2 rounded-lg text-sm outline-none ${isDark ? 'bg-white/5 border border-white/10 text-white' : 'bg-gray-50 border border-gray-200'} focus:ring-2 focus:ring-indigo-500/50`}
                    >
                      {opt.choices?.map(c => (
                        <option key={c} value={c.toLowerCase()}>{c}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={options[opt.key] || ''}
                      onChange={e => setOptions(prev => ({ ...prev, [opt.key]: e.target.value }))}
                      placeholder={opt.placeholder}
                      className={`w-full px-3 py-2 rounded-lg text-sm outline-none ${isDark ? 'bg-white/5 border border-white/10 text-white placeholder-gray-500' : 'bg-gray-50 border border-gray-200 placeholder-gray-400'} focus:ring-2 focus:ring-indigo-500/50`}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Input Panel */}
      <div className={`rounded-xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200 shadow-sm'}`}>
        <div className={`flex items-center justify-between px-4 py-2.5 ${isDark ? 'border-b border-white/5' : 'border-b border-gray-100'}`}>
          <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Input</span>
          <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            {charCount} chars · {wordCount} words
          </span>
        </div>
        <textarea
          value={input}
          onChange={e => { setInput(e.target.value); setError(''); }}
          placeholder={getInputLabel()}
          rows={6}
          className={`w-full px-4 py-3 bg-transparent outline-none text-sm resize-none ${isDark ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-400'}`}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleGenerate}
          disabled={loading || !input.trim()}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium text-sm hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              AI is thinking...
            </>
          ) : (
            <>
              <Sparkles size={16} />
              Generate
            </>
          )}
        </button>
        <button
          onClick={handleClear}
          className={`px-4 py-2.5 rounded-xl text-sm font-medium ${isDark ? 'bg-white/5 hover:bg-white/10 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'} transition-colors`}
        >
          Clear
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className={`flex items-center gap-2 p-3 rounded-xl ${isDark ? 'bg-red-500/10 border border-red-500/20' : 'bg-red-50 border border-red-200'}`}>
          <AlertCircle size={14} className="text-red-400 flex-shrink-0" />
          <p className={`text-xs ${isDark ? 'text-red-300' : 'text-red-600'}`}>{error}</p>
        </div>
      )}

      {/* Output Panel */}
      {output && (
        <div className={`rounded-xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200 shadow-sm'}`}>
          <div className={`flex items-center justify-between px-4 py-2.5 ${isDark ? 'border-b border-white/5' : 'border-b border-gray-100'}`}>
            <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Output</span>
            <div className="flex items-center gap-1">
              <button
                onClick={handleCopy}
                className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-500'} transition-colors`}
                title="Copy"
              >
                {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
              </button>
              <button
                onClick={handleDownload}
                className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-500'} transition-colors`}
                title="Download"
              >
                <Download size={14} />
              </button>
              <button
                onClick={handleRegenerate}
                className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-500'} transition-colors`}
                title="Regenerate"
              >
                <RefreshCw size={14} />
              </button>
              <button
                onClick={handleShare}
                className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-500'} transition-colors`}
                title="Share"
              >
                <Share2 size={14} />
              </button>
            </div>
          </div>
          <div className="p-4">
            <div className={`text-sm whitespace-pre-wrap leading-relaxed ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {output.split('\n').map((line, i) => {
                // Simple markdown-like rendering
                if (line.startsWith('**') && line.endsWith('**')) {
                  return <p key={i} className="font-bold mt-2">{line.replace(/\*\*/g, '')}</p>;
                }
                if (line.startsWith('---')) {
                  return <hr key={i} className={`my-3 ${isDark ? 'border-white/10' : 'border-gray-200'}`} />;
                }
                if (line.startsWith('•') || line.startsWith('-')) {
                  return <p key={i} className="ml-4 my-0.5">{line}</p>;
                }
                if (line.startsWith('*') && line.endsWith('*')) {
                  return <p key={i} className={`italic text-xs mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{line.replace(/\*/g, '')}</p>;
                }
                if (line.startsWith('```')) {
                  return null;
                }
                if (line.trim() === '') {
                  return <br key={i} />;
                }
                // Handle inline bold
                const parts = line.split(/(\*\*[^*]+\*\*)/g);
                return (
                  <p key={i} className="my-0.5">
                    {parts.map((part, j) => {
                      if (part.startsWith('**') && part.endsWith('**')) {
                        return <strong key={j}>{part.replace(/\*\*/g, '')}</strong>;
                      }
                      if (part.startsWith('*') && part.endsWith('*') && !part.startsWith('**')) {
                        return <em key={j}>{part.replace(/\*/g, '')}</em>;
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
        </div>
      )}

      {/* Loading State */}
      {loading && !output && (
        <div className={`flex items-center justify-center gap-3 p-8 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
          <Loader2 size={20} className="animate-spin text-indigo-400" />
          <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>AI is thinking...</span>
        </div>
      )}
    </div>
  );
}
