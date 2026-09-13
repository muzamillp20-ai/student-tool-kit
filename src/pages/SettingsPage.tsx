import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { getAIConfig } from '../services/aiService';
import { Settings, Key, Globe, Cpu, CheckCircle, AlertCircle, Save, RotateCcw, Eye, EyeOff, ExternalLink } from 'lucide-react';

const presets = [
  {
    name: 'Google Gemini',
    apiUrl: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
    model: 'gemini-2.5-flash',
    keyPrefix: '',
    getStartedUrl: 'https://aistudio.google.com/app/apikey',
  },
  {
    name: 'OpenAI',
    apiUrl: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-4o-mini',
    keyPrefix: 'sk-',
    getStartedUrl: 'https://platform.openai.com/api-keys',
  },
  {
    name: 'OpenRouter',
    apiUrl: 'https://openrouter.ai/api/v1/chat/completions',
    model: 'openai/gpt-4o-mini',
    keyPrefix: 'sk-or-',
    getStartedUrl: 'https://openrouter.ai/keys',
  },
  {
    name: 'Groq',
    apiUrl: 'https://api.groq.com/openai/v1/chat/completions',
    model: 'llama-3.3-70b-versatile',
    keyPrefix: 'gsk_',
    getStartedUrl: 'https://console.groq.com/keys',
  },
  {
    name: 'Together AI',
    apiUrl: 'https://api.together.xyz/v1/chat/completions',
    model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo',
    keyPrefix: '',
    getStartedUrl: 'https://api.together.ai/settings/api-keys',
  },
  {
    name: 'Custom',
    apiUrl: '',
    model: '',
    keyPrefix: '',
    getStartedUrl: '',
  },
];

export default function SettingsPage() {
  const { theme } = useApp();
  const isDark = theme === 'dark';

  const [apiKey, setApiKey] = useState(() => localStorage.getItem('ai-hub-api-key') || '');
  const [apiUrl, setApiUrl] = useState(() => localStorage.getItem('ai-hub-api-url') || presets[0].apiUrl);
  const [model, setModel] = useState(() => localStorage.getItem('ai-hub-model') || presets[0].model);
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState(0);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  const [testing, setTesting] = useState(false);

  const config = getAIConfig();

  const handlePresetChange = (index: number) => {
    setSelectedPreset(index);
    const preset = presets[index];
    if (preset.name !== 'Custom') {
      setApiUrl(preset.apiUrl);
      setModel(preset.model);
    }
  };

  const handleSave = () => {
    if (apiKey) localStorage.setItem('ai-hub-api-key', apiKey);
    else localStorage.removeItem('ai-hub-api-key');
    
    if (apiUrl) localStorage.setItem('ai-hub-api-url', apiUrl);
    else localStorage.removeItem('ai-hub-api-url');
    
    if (model) localStorage.setItem('ai-hub-model', model);
    else localStorage.removeItem('ai-hub-model');
    
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const key = apiKey || localStorage.getItem('ai-hub-api-key') || '';
      const url = apiUrl || localStorage.getItem('ai-hub-api-url') || '';
      
      if (!key) {
        setTestResult('error');
        setTesting(false);
        return;
      }

      const isGemini = url.includes('generativelanguage.googleapis.com');
      let response;

      if (isGemini) {
        response = await fetch(`${url}?key=${key}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: 'Say "Connection successful!" in one sentence.' }] }],
            generationConfig: { maxOutputTokens: 50 },
          }),
        });
      } else {
        response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${key}`,
          },
          body: JSON.stringify({
            model: model || 'gpt-4o-mini',
            messages: [{ role: 'user', content: 'Say "Connection successful!" in one sentence.' }],
            max_tokens: 50,
          }),
        });
      }

      if (response.ok) {
        setTestResult('success');
      } else {
        setTestResult('error');
      }
    } catch {
      setTestResult('error');
    } finally {
      setTesting(false);
    }
  };

  const handleReset = () => {
    localStorage.removeItem('ai-hub-api-key');
    localStorage.removeItem('ai-hub-api-url');
    localStorage.removeItem('ai-hub-model');
    setApiKey('');
    setApiUrl(presets[0].apiUrl);
    setModel(presets[0].model);
    setSelectedPreset(0);
  };

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

      {/* Status */}
      <div className={`flex items-center gap-3 p-4 rounded-xl ${
        config.hasApiKey 
          ? isDark ? 'bg-green-500/10 border border-green-500/20' : 'bg-green-50 border border-green-200'
          : isDark ? 'bg-yellow-500/10 border border-yellow-500/20' : 'bg-yellow-50 border border-yellow-200'
      }`}>
        {config.hasApiKey ? (
          <>
            <CheckCircle size={18} className="text-green-400" />
            <div>
              <p className={`text-sm font-medium ${isDark ? 'text-green-300' : 'text-green-700'}`}>AI Connected</p>
              <p className={`text-xs ${isDark ? 'text-green-400/70' : 'text-green-600'}`}>Real AI responses are enabled</p>
            </div>
          </>
        ) : (
          <>
            <AlertCircle size={18} className="text-yellow-400" />
            <div>
              <p className={`text-sm font-medium ${isDark ? 'text-yellow-300' : 'text-yellow-700'}`}>Demo Mode</p>
              <p className={`text-xs ${isDark ? 'text-yellow-400/70' : 'text-yellow-600'}`}>Add an API key below to enable real AI responses</p>
            </div>
          </>
        )}
      </div>

      {/* API Provider Preset */}
      <div className={`rounded-2xl p-6 ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200 shadow-sm'}`}>
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <Globe size={16} className="text-indigo-400" />
          AI Provider
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
          {presets.map((preset, i) => (
            <button
              key={preset.name}
              onClick={() => handlePresetChange(i)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedPreset === i
                  ? 'bg-indigo-500 text-white'
                  : isDark ? 'bg-white/5 hover:bg-white/10 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              }`}
            >
              {preset.name}
            </button>
          ))}
        </div>
        {presets[selectedPreset].getStartedUrl && (
          <a
            href={presets[selectedPreset].getStartedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-1.5 text-xs ${isDark ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-500 hover:text-indigo-600'} transition-colors`}
          >
            <ExternalLink size={12} />
            Get API key from {presets[selectedPreset].name}
          </a>
        )}
      </div>

      {/* API Key */}
      <div className={`rounded-2xl p-6 ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200 shadow-sm'}`}>
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <Key size={16} className="text-indigo-400" />
          API Key
        </h3>
        <div className="space-y-4">
          <div>
            <label className={`text-xs font-medium mb-1.5 block ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              API Key
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder="Enter your API key..."
                className={`w-full px-4 py-2.5 pr-10 rounded-xl text-sm outline-none ${isDark ? 'bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-indigo-500' : 'bg-gray-50 border border-gray-200 placeholder-gray-400 focus:border-indigo-500'} transition-colors`}
              />
              <button
                onClick={() => setShowKey(!showKey)}
                className={`absolute right-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-400 hover:text-gray-600'} transition-colors`}
              >
                {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* API URL */}
          <div>
            <label className={`text-xs font-medium mb-1.5 block ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              API Endpoint URL
            </label>
            <input
              type="text"
              value={apiUrl}
              onChange={e => setApiUrl(e.target.value)}
              placeholder="https://api.openai.com/v1/chat/completions"
              className={`w-full px-4 py-2.5 rounded-xl text-sm outline-none ${isDark ? 'bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-indigo-500' : 'bg-gray-50 border border-gray-200 placeholder-gray-400 focus:border-indigo-500'} transition-colors`}
            />
          </div>

          {/* Model */}
          <div>
            <label className={`text-xs font-medium mb-1.5 block ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              <Cpu size={12} className="inline mr-1" />
              Model
            </label>
            <input
              type="text"
              value={model}
              onChange={e => setModel(e.target.value)}
              placeholder="gpt-4o-mini"
              className={`w-full px-4 py-2.5 rounded-xl text-sm outline-none ${isDark ? 'bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-indigo-500' : 'bg-gray-50 border border-gray-200 placeholder-gray-400 focus:border-indigo-500'} transition-colors`}
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium text-sm hover:opacity-90 transition-opacity"
        >
          <Save size={14} />
          {saved ? 'Saved!' : 'Save Settings'}
        </button>
        <button
          onClick={handleTest}
          disabled={testing || !apiKey}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-colors ${
            testing || !apiKey
              ? isDark ? 'bg-white/5 text-gray-500 cursor-not-allowed' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : isDark ? 'bg-white/10 hover:bg-white/15 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }`}
        >
          {testing ? 'Testing...' : 'Test Connection'}
        </button>
        <button
          onClick={handleReset}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-colors ${isDark ? 'bg-white/5 hover:bg-white/10 text-gray-400' : 'bg-gray-100 hover:bg-gray-200 text-gray-500'}`}
        >
          <RotateCcw size={14} />
          Reset
        </button>
      </div>

      {/* Test Result */}
      {testResult && (
        <div className={`flex items-center gap-3 p-4 rounded-xl ${
          testResult === 'success'
            ? isDark ? 'bg-green-500/10 border border-green-500/20' : 'bg-green-50 border border-green-200'
            : isDark ? 'bg-red-500/10 border border-red-500/20' : 'bg-red-50 border border-red-200'
        }`}>
          {testResult === 'success' ? (
            <>
              <CheckCircle size={18} className="text-green-400" />
              <p className={`text-sm ${isDark ? 'text-green-300' : 'text-green-700'}`}>Connection successful! Your API key is working.</p>
            </>
          ) : (
            <>
              <AlertCircle size={18} className="text-red-400" />
              <p className={`text-sm ${isDark ? 'text-red-300' : 'text-red-700'}`}>Connection failed. Please check your API key and endpoint.</p>
            </>
          )}
        </div>
      )}

      {/* Security Note */}
      <div className={`rounded-2xl p-4 ${isDark ? 'bg-blue-500/5 border border-blue-500/10' : 'bg-blue-50 border border-blue-100'}`}>
        <p className={`text-xs ${isDark ? 'text-blue-300/70' : 'text-blue-600'}`}>
          🔒 <strong>Security:</strong> Your API key is stored locally in your browser. It is never sent to our servers. Only direct API calls are made to the provider you configure.
        </p>
      </div>

      {/* Supported Providers */}
      <div className={`rounded-2xl p-6 ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200 shadow-sm'}`}>
        <h3 className="font-bold mb-3">Supported Providers</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { name: 'Google Gemini', desc: 'gemini-2.5-flash, gemini-1.5-pro' },
            { name: 'OpenAI', desc: 'gpt-4o, gpt-4o-mini, gpt-3.5-turbo' },
            { name: 'OpenRouter', desc: '200+ models available' },
            { name: 'Groq', desc: 'Llama, Mixtral models' },
            { name: 'Together AI', desc: 'Open-source models' },
            { name: 'Any OpenAI-compatible', desc: 'Custom endpoints' },
          ].map(provider => (
            <div key={provider.name} className={`p-3 rounded-lg ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
              <p className="text-sm font-medium">{provider.name}</p>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{provider.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
