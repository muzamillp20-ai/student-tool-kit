import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Sparkles, Zap, Layers, Shield, Rocket, Heart } from 'lucide-react';

export default function AboutPage() {
  const { theme } = useApp();
  const isDark = theme === 'dark';

  return (
    <div className="space-y-10 pb-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
          <Sparkles size={28} className="text-white" />
        </div>
        <h1 className="text-3xl font-bold mb-2">
          <span className="gradient-text">AI Utility Hub</span>
        </h1>
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Your everyday AI toolbox</p>
      </div>

      {/* Mission */}
      <section className={`rounded-2xl p-6 ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200 shadow-sm'}`}>
        <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
          <Heart size={18} className="text-indigo-400" />
          Our Mission
        </h2>
        <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          AI Utility Hub is designed to make useful AI tools accessible from one simple workspace. 
          We believe that powerful AI utilities shouldn&apos;t require visiting dozens of different websites. 
          Our goal is to bring everything you need — writing, studying, productivity, coding, and smart utilities — 
          into one clean, fast, and easy-to-use platform.
        </p>
      </section>

      {/* Features */}
      <section>
        <h2 className="text-lg font-bold mb-4">Features</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { icon: <Zap size={20} className="text-yellow-400" />, title: 'Fast & Lightweight', desc: 'Quick access to tools without heavy downloads or sign-ups.' },
            { icon: <Layers size={20} className="text-indigo-400" />, title: 'All-in-One Platform', desc: 'Writing, studying, productivity, coding and utilities in one place.' },
            { icon: <Shield size={20} className="text-green-400" />, title: 'Privacy First', desc: 'Your data stays on your device. No tracking, no ads.' },
            { icon: <Sparkles size={20} className="text-purple-400" />, title: 'AI-Powered', desc: 'Smart responses powered by advanced AI models.' },
          ].map((item, i) => (
            <div key={i} className={`p-4 rounded-xl ${isDark ? 'bg-white/5 border border-white/5' : 'bg-white border border-gray-100 shadow-sm'}`}>
              <div className="mb-2">{item.icon}</div>
              <h3 className="font-semibold text-sm mb-1">{item.title}</h3>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories Overview */}
      <section>
        <h2 className="text-lg font-bold mb-4">Tool Categories</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { icon: '✍️', name: 'Writing', count: 9 },
            { icon: '🎓', name: 'Student', count: 7 },
            { icon: '💼', name: 'Productivity', count: 7 },
            { icon: '🧮', name: 'Smart Utilities', count: 7 },
            { icon: '💻', name: 'Developer', count: 7 },
            { icon: '🧠', name: 'AI Assistants', count: 6 },
          ].map((cat, i) => (
            <Link
              key={i}
              to="/tools"
              className={`p-4 rounded-xl text-center card-hover ${isDark ? 'bg-white/5 border border-white/5' : 'bg-white border border-gray-100 shadow-sm'}`}
            >
              <span className="text-2xl mb-1 block">{cat.icon}</span>
              <p className="text-sm font-medium">{cat.name}</p>
              <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{cat.count} tools</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Roadmap */}
      <section>
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Rocket size={18} className="text-indigo-400" />
          Future Roadmap
        </h2>
        <div className={`rounded-2xl p-6 ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200 shadow-sm'}`}>
          <div className="space-y-4">
            {[
              { name: 'PDF AI Tools', status: 'Planned' },
              { name: 'Image AI Tools', status: 'Planned' },
              { name: 'Voice AI Tools', status: 'Planned' },
              { name: 'Document Analyzer', status: 'Planned' },
              { name: 'AI Web Research', status: 'Planned' },
              { name: 'Browser AI Assistant', status: 'Planned' },
              { name: 'AI Automation', status: 'Planned' },
              { name: 'Custom AI Agents', status: 'Planned' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-sm">{item.name}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${isDark ? 'bg-indigo-500/10 text-indigo-300' : 'bg-indigo-50 text-indigo-600'}`}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <div className={`text-center pt-6 border-t ${isDark ? 'border-white/5' : 'border-gray-200'}`}>
        <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
          Made with ❤️ for productivity enthusiasts
        </p>
      </div>
    </div>
  );
}
