import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getToolById, categories } from '../data/tools';
import { generateAIResponse } from '../services/aiService';
import { ArrowLeft, Star, Copy, Download, RefreshCw, Share2, Loader2, Check } from 'lucide-react';

export default function ToolDetailPage() {
  const { id } = useParams();
  const { theme, isFavorite, addFavorite, removeFavorite, addToHistory, addToRecentlyUsed } = useApp();
  const isDark = theme === 'dark';
  const tool = getToolById(id || '');

  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [options, setOptions] = useState<Record<string, string>>({});

  if (!tool) {
    return (
      <div className="text-center py-20">
        <span className="text-5xl mb-4 block">🔍</span>
        <h2 className="text-xl font-bold mb-2">Tool not found</h2>
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} mb-4`}>The tool you&apos;re looking for doesn&apos;t exist.</p>
        <Link to="/tools" className="text-indigo-400 hover:text-indigo-300 text-sm">← Back to tools</Link>
      </div>
    );
  }

  const category = categories.find(c => c.id === tool.category);
  const fav = isFavorite(tool.id);

  const toolOptions = getToolOptions(tool.id);
  const inputLabel = getInputLabel(tool.id);
  const inputPlaceholder = getInputPlaceholder(tool.id);

  const handleGenerate = async () => {
    if (!input.trim()) {
      setError('Please enter some text first.');
      return;
    }
    setError('');
    setLoading(true);
    setOutput('');
    try {
      const result = await generateAIResponse({ tool: tool.id, input, options });
      setOutput(result);
      addToHistory({
        toolId: tool.id,
        toolName: tool.name,
        inputPreview: input.slice(0, 100),
        outputPreview: result.slice(0, 100),
      });
      addToRecentlyUsed(tool.id);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${tool.name.replace(/\s+/g, '-').toLowerCase()}-output.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setError('');
  };

  const wordCount = input.trim() ? input.trim().split(/\s+/).length : 0;
  const charCount = input.length;

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/tools" className={`p-2 rounded-lg ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'} transition-colors`}>
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{tool.icon}</span>
            <div>
              <h1 className="text-xl font-bold">{tool.name}</h1>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{category?.name}</p>
            </div>
          </div>
        </div>
        <button
          onClick={() => fav ? removeFavorite(tool.id) : addFavorite(tool.id)}
          className={`p-2 rounded-lg transition-colors ${fav ? 'text-red-400' : isDark ? 'text-gray-400 hover:text-red-400 hover:bg-white/10' : 'text-gray-300 hover:text-red-400 hover:bg-gray-100'}`}
          aria-label={fav ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Star size={20} fill={fav ? 'currentColor' : 'none'} />
        </button>
      </div>

      <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{tool.description}</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Panel */}
        <div className={`rounded-2xl p-5 ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200 shadow-sm'}`}>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-semibold">{inputLabel}</label>
            <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              {wordCount} words · {charCount} chars
            </span>
          </div>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={inputPlaceholder}
            rows={8}
            className={`w-full rounded-xl p-4 text-sm resize-none outline-none ${isDark ? 'bg-white/5 border border-white/10 focus:border-indigo-500/50 text-white placeholder-gray-500' : 'bg-gray-50 border border-gray-200 focus:border-indigo-300 text-gray-900 placeholder-gray-400'} transition-colors`}
          />

          {/* Options */}
          {toolOptions.length > 0 && (
            <div className="mt-4 space-y-3">
              {toolOptions.map(opt => (
                <div key={opt.key}>
                  <label className={`text-xs font-medium mb-1.5 block ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{opt.label}</label>
                  <select
                    value={options[opt.key] || opt.default}
                    onChange={e => setOptions(prev => ({ ...prev, [opt.key]: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-lg text-sm outline-none ${isDark ? 'bg-white/5 border border-white/10 text-white' : 'bg-gray-50 border border-gray-200 text-gray-900'}`}
                  >
                    {opt.choices.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  AI is thinking...
                </>
              ) : (
                'Generate'
              )}
            </button>
            <button
              onClick={handleClear}
              className={`px-4 py-3 rounded-xl text-sm font-medium ${isDark ? 'bg-white/10 hover:bg-white/15' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
            >
              Clear
            </button>
          </div>

          {error && (
            <div className="mt-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
              {error}
            </div>
          )}
        </div>

        {/* Output Panel */}
        <div className={`rounded-2xl p-5 ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200 shadow-sm'}`}>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-semibold">Output</label>
            {output && (
              <div className="flex items-center gap-1">
                <button onClick={handleCopy} className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'} transition-colors`} title="Copy">
                  {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                </button>
                <button onClick={handleDownload} className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'} transition-colors`} title="Download">
                  <Download size={14} />
                </button>
                <button onClick={handleGenerate} disabled={loading} className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'} transition-colors`} title="Regenerate">
                  <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                </button>
                <button className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'} transition-colors`} title="Share">
                  <Share2 size={14} />
                </button>
              </div>
            )}
          </div>
          <div className={`min-h-[200px] rounded-xl p-4 text-sm whitespace-pre-wrap ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
            {loading ? (
              <div className="flex items-center gap-2 text-indigo-400">
                <Loader2 size={16} className="animate-spin" />
                <span className="text-sm">AI is thinking...</span>
              </div>
            ) : output ? (
              <div className={`${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {renderMarkdown(output)}
              </div>
            ) : (
              <p className={`${isDark ? 'text-gray-500' : 'text-gray-400'} italic`}>
                Your generated result will appear here...
              </p>
            )}
          </div>
          {output && (
            <div className={`mt-3 flex items-center justify-between text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              <span>{output.split(/\s+/).length} words · {output.length} chars</span>
              <span className="text-indigo-400">Demo Mode</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function getToolOptions(toolId: string): { key: string; label: string; choices: string[]; default: string }[] {
  const optionMap: Record<string, { key: string; label: string; choices: string[]; default: string }[]> = {
    summarizer: [
      { key: 'length', label: 'Summary Length', choices: ['Short', 'Medium', 'Detailed'], default: 'Medium' },
      { key: 'tone', label: 'Tone', choices: ['Neutral', 'Professional', 'Casual', 'Academic'], default: 'Neutral' },
    ],
    rewriter: [
      { key: 'tone', label: 'Tone', choices: ['Professional', 'Casual', 'Friendly', 'Academic', 'Creative'], default: 'Professional' },
    ],
    'email-generator': [
      { key: 'purpose', label: 'Purpose', choices: ['General', 'Meeting', 'Follow-up', 'Request', 'Apology', 'Thank you'], default: 'General' },
      { key: 'tone', label: 'Tone', choices: ['Professional', 'Friendly', 'Formal', 'Casual'], default: 'Professional' },
    ],
    'caption-generator': [
      { key: 'platform', label: 'Platform', choices: ['Instagram', 'Twitter', 'LinkedIn', 'Facebook', 'TikTok'], default: 'Instagram' },
      { key: 'tone', label: 'Tone', choices: ['Fun', 'Professional', 'Inspirational', 'Witty', 'Casual'], default: 'Fun' },
    ],
    'study-planner': [
      { key: 'duration', label: 'Duration', choices: ['1 week', '2 weeks', '1 month', '3 months'], default: '1 week' },
    ],
    'quiz-generator': [
      { key: 'difficulty', label: 'Difficulty', choices: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
      { key: 'questions', label: 'Number of Questions', choices: ['5', '10', '15', '20'], default: '5' },
    ],
    'code-explainer': [
      { key: 'level', label: 'Explanation Level', choices: ['Beginner', 'Intermediate', 'Advanced'], default: 'Intermediate' },
    ],
  };
  return optionMap[toolId] || [];
}

function getInputLabel(toolId: string): string {
  const labels: Record<string, string> = {
    'email-generator': 'Context / Key Points',
    'caption-generator': 'Topic / Description',
    'study-planner': 'Subject / Topic',
    'quiz-generator': 'Topic',
    'code-explainer': 'Code',
  };
  return labels[toolId] || 'Input Text';
}

function getInputPlaceholder(toolId: string): string {
  const placeholders: Record<string, string> = {
    summarizer: 'Paste your text here to summarize...',
    rewriter: 'Enter text to rewrite...',
    'email-generator': 'Describe what the email should be about...',
    'caption-generator': 'What is your post about?',
    'study-planner': 'What subject do you want to study?',
    'quiz-generator': 'Enter a topic to generate questions about...',
    'code-explainer': 'Paste your code here...',
    'ask-ai': 'Ask me anything...',
  };
  return placeholders[toolId] || 'Enter your text here...';
}

function renderMarkdown(text: string): React.ReactNode {
  return text.split('\n').map((line, i) => {
    if (line.startsWith('**') && line.endsWith('**')) {
      return <p key={i} className="font-bold my-1">{line.replace(/\*\*/g, '')}</p>;
    }
    if (line.startsWith('• ') || line.startsWith('- ')) {
      return <p key={i} className="ml-4 my-0.5">• {line.slice(2)}</p>;
    }
    if (line.startsWith('---')) {
      return <hr key={i} className="my-3 border-white/10" />;
    }
    if (line.startsWith('```')) {
      return null;
    }
    if (line.match(/^\*\*.*\*\*$/)) {
      return <p key={i} className="font-bold my-1">{line.replace(/\*\*/g, '')}</p>;
    }
    // Handle inline bold
    const parts = line.split(/(\*\*.*?\*\*)/g);
    return (
      <p key={i} className="my-0.5">
        {parts.map((part, j) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={j}>{part.slice(2, -2)}</strong>;
          }
          if (part.startsWith('*') && part.endsWith('*')) {
            return <em key={j}>{part.slice(1, -1)}</em>;
          }
          return <span key={j}>{part}</span>;
        })}
      </p>
    );
  });
}
