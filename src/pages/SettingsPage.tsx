import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getAIConfig, isDemoMode as currentDemoMode } from '../services/aiService';
import { Settings, Key, Globe, Cpu, Check, AlertCircle, ExternalLink, Trash2 } from 'lucide-react';

export default function SettingsPage() {
  const { theme } = useApp();
  const isDark = theme === 'dark';
  
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('ai-hub-api-key') || '');
  const [apiUrl, setApiUrl] = useState(() => localStorage.getItem('ai-hub-api-url') || 'https://api.openai.com/v1/chat/completions');
  const [model, setModel] = useState(() => localStorage.getItem('ai-hub-model') || 'gpt-4o-mini');
  const [saved, setSaved] = useState(false);
  const [showKey, setShowKey] = useState(false);

  // Check if env vars are set
  const envConfig = getAIConfig();
  const hasEnvKey = envConfig.hasApiKey;
  const effectiveDemoMode = !apiKey && !hasEnvKey;

  const handleSave = () => {
    if (apiKey) {
      localStorage.setItem('ai-hub-api-key', apiKey);
    } else {
      localStorage.removeItem('ai-hub-api-key');
    }
    if (apiUrl) {
      localStorage.setItem('ai-hub-api-url', apiUrl);
    } else {
      localStorage.removeItem('ai-hub-api-url');
    }
    if (model) {
      localStorage.setItem('ai-hub-model', model);
    } else {
      localStorage.removeItem('ai-hub-model');
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleClear = () => {
    localStorage.removeItem('ai-hub-api-key');
    localStorage.removeItem('ai-hub-api-url');
    localStorage.removeItem('ai-hub-model');
    setApiKey('');
    setApiUrl('https://api.openai.com/v1/chat/completions');
    setModel('gpt-4o-mini');
  };

  const presets = [
    { name: 'OpenAI', url: 'https://api.openai.com/v1/chat/completions', models: ['gpt-4o-mini', 'gpt-4o', 'gpt-3.5-turbo'] },
    { name: 'OpenRouter', url: 'https://openrouter.ai/api/v1/chat/completions', models: ['qwen/qwen-2.5-72b-instruct', 'meta-llama/llama-3-70b-instruct', 'anthropic/claude-3.5-sonnet'] },
    { name: 'Groq', url: 'https://api.groq.com/openai/v1/chat/completions', models: ['llama-3.1-70b-versatile', 'mixtral-8x7b-32768', 'gemma2-9b-it'] },
    { name: 'Qwen (DashScope)', url: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', models: ['qwen-turbo', 'qwen-plus', 'qwen-max'] },
  ];

  return (
    <div className="space-y-6 pb-8 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Settings size={22} className="text-indigo-400" />
          Settings
        </h1>
        <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          Configure your AI provider and preferences
        </p>
      </div>

      {/* Status Banner */}
      <div className={`flex items-center gap-3 p-4 rounded-xl ${
        effectiveDemoMode
          ? isDark ? 'bg-yellow-500/5 border border-yellow-500/20' : 'bg-yellow-50 border border-yellow-200'
          : isDark ? 'bg-green-500/5 border border-green-500/20' : 'bg-green-50 border border-green-200'
      }`}>
        {effectiveDemoMode ? (
          <>
            <AlertCircle size={18} className="text-yellow-400 flex-shrink-0" />
            <div>
              <p className={`text-sm font-medium ${isDark ? 'text-yellow-300' : 'text-yellow-700'}`}>Demo Mode Active</p>
              <p className={`text-xs ${isDark ? 'text-yellow-300/60' : 'text-yellow-600'}`}>Add an API key below to enable real AI responses.</p>
            </div>
          </>
        ) : (
          <>
            <Check size={18} className="text-green-400 flex-shrink-0" />
            <div>
              <p className={`text-sm font-medium ${isDark ? 'text-green-300' : 'text-green-700'}`}>AI Connected</p>
              <p className={`text-xs ${isDark ? 'text-green-300/60' : 'text-green-600'}`}>
                {hasEnvKey ? 'Using API key from environment variable.' : 'Using API key from local settings.'}
              </p>
            </div>
          </>
        )}
      </div>

      {/* API Configuration */}
      <div className={`rounded-2xl p-6 ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200 shadow-sm'}`}>
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <Key size={16} className="text-indigo-400" />
          AI API Configuration
        </h3>

        {hasEnvKey && (
          <div className={`p-3 rounded-lg mb-4 ${isDark ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-blue-50 border border-blue-200'}`}>
            <p className={`text-xs ${isDark ? 'text-blue-300' : 'text-blue-600'}`}>
              ℹ️ An API key is already configured via environment variable. Settings below will be used as fallback.
            </p>
          </div>
        )}

        <div className="space-y-4">
          {/* API Key */}
          <div>
            <label className={`text-xs font-medium mb-1.5 block ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              API Key
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder="sk-..."
                className={`w-full px-3 py-2.5 pr-20 rounded-lg text-sm outline-none font-mono ${isDark ? 'bg-white/5 border border-white/10 text-white placeholder-gray-500' : 'bg-gray-50 border border-gray-200 placeholder-gray-400'} focus:ring-2 focus:ring-indigo-500/50`}
              />
              <button
                onClick={() => setShowKey(!showKey)}
                className={`absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 rounded text-xs ${isDark ? 'bg-white/10 text-gray-300' : 'bg-gray-200 text-gray-600'}`}
              >
                {showKey ? 'Hide' : 'Show'}
              </button>
            </div>
            <p className={`text-[10px] mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              Your key is stored locally and never sent to our servers.
            </p>
          </div>

          {/* API URL */}
          <div>
            <label className={`text-xs font-medium mb-1.5 block ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              <Globe size={12} className="inline mr-1" />
              API Endpoint URL
            </label>
            <input
              type="url"
              value={apiUrl}
              onChange={e => setApiUrl(e.target.value)}
              placeholder="https://api.openai.com/v1/chat/completions"
              className={`w-full px-3 py-2.5 rounded-lg text-sm outline-none font-mono ${isDark ? 'bg-white/5 border border-white/10 text-white placeholder-gray-500' : 'bg-gray-50 border border-gray-200 placeholder-gray-400'} focus:ring-2 focus:ring-indigo-500/50`}
            />
          </div>

          {/* Model */}
          <div>
            <label className={`text-xs font-medium mb-1.5 block ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              <Cpu size={12} className="inline mr-1" />
              Model
            </label>
            <input
              type="text"
              value={model}
              onChange={e => setModel(e.target.value)}
              placeholder="gpt-4o-mini"
              className={`w-full px-3 py-2.5 rounded-lg text-sm outline-none font-mono ${isDark ? 'bg-white/5 border border-white/10 text-white placeholder-gray-500' : 'bg-gray-50 border border-gray-200 placeholder-gray-400'} focus:ring-2 focus:ring-indigo-500/50`}
            />
          </div>
        </div>

        {/* Presets */}
        <div className="mt-5">
          <p className={`text-xs font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Quick Presets</p>
          <div className="flex flex-wrap gap-2">
            {presets.map(preset => (
              <button
                key={preset.name}
                onClick={() => { setApiUrl(preset.url); setModel(preset.models[0]); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${isDark ? 'bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10' : 'bg-gray-100 hover:bg-gray-200 text-gray-600 border border-gray-200'}`}
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 mt-6">
          <button
            onClick={handleSave}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-medium hover:opacity-90 transition-opacity ${saved ? 'opacity-70' : ''}`}
          >
            {saved ? <><Check size={14} /> Saved!</> : 'Save Settings'}
          </button>
          <button
            onClick={handleClear}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium ${isDark ? 'bg-white/5 hover:bg-white/10 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'} transition-colors`}
          >
            <Trash2 size={14} />
            Clear
          </button>
        </div>
      </div>

      {/* Info */}
      <div className={`rounded-2xl p-5 ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200 shadow-sm'}`}>
        <h3 className="font-bold mb-3 text-sm">📖 How to get an API key</h3>
        <div className="space-y-3">
          <div className={`p-3 rounded-lg ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
            <p className="text-sm font-medium mb-1">OpenAI</p>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Visit{' '}
              <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1">
                platform.openai.com <ExternalLink size={10} />
              </a>
              {' '}to create an API key.
            </p>
          </div>
          <div className={`p-3 rounded-lg ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
            <p className="text-sm font-medium mb-1">OpenRouter (supports Qwen, Llama, etc.)</p>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Visit{' '}
              <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1">
                openrouter.ai <ExternalLink size={10} />
              </a>
              {' '}for access to many models.
            </p>
          </div>
          <div className={`p-3 rounded-lg ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
            <p className="text-sm font-medium mb-1">Groq (fast & free tier)</p>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Visit{' '}
              <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1">
                console.groq.com <ExternalLink size={10} />
              </a>
              {' '}for fast inference.
            </p>
          </div>
          <div className={`p-3 rounded-lg ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
            <p className="text-sm font-medium mb-1">Qwen (Alibaba Cloud)</p>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Visit{' '}
              <a href="https://dashscope.console.aliyun.com/" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1">
                dashscope.console.aliyun.com <ExternalLink size={10} />
              </a>
              {' '}for Qwen models.
            </p>
          </div>
        </div>
      </div>

      {/* Security Note */}
      <div className={`p-4 rounded-xl ${isDark ? 'bg-indigo-500/5 border border-indigo-500/10' : 'bg-indigo-50 border border-indigo-100'}`}>
        <p className={`text-xs ${isDark ? 'text-indigo-300/70' : 'text-indigo-600'}`}>
          🔒 <strong>Security:</strong> Your API key is stored only in your browser&apos;s local storage. It is never sent to any server other than the AI provider you configure. For production use, consider setting up a backend proxy.
        </p>
      </div>
    </div>
  );
}
