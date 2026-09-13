import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getToolById } from '../data/tools';
import { GraduationCap, BookOpen, Target, Calendar, CheckCircle } from 'lucide-react';

export default function StudentPage() {
  const { theme, favorites, recentlyUsed } = useApp();
  const isDark = theme === 'dark';

  const studentTools = [
    { id: 'study-planner', icon: '📅', name: 'Study Planner', desc: 'Create personalized study schedules' },
    { id: 'quiz-generator', icon: '❓', name: 'Quiz Generator', desc: 'Generate quizzes from any topic' },
    { id: 'flashcard-generator', icon: '🃏', name: 'Flashcard Generator', desc: 'Create flashcards for effective learning' },
    { id: 'notes-summarizer', icon: '📋', name: 'Notes Summarizer', desc: 'Summarize study notes efficiently' },
    { id: 'assignment-helper', icon: '📚', name: 'Assignment Helper', desc: 'Get help with assignments' },
    { id: 'question-generator', icon: '🤔', name: 'Question Generator', desc: 'Generate practice questions' },
    { id: 'study-schedule', icon: '🗓️', name: 'Study Schedule', desc: 'Create optimal timetables' },
    { id: 'media-generator', icon: '🎨', name: 'AI Media Generator', desc: 'Generate AI images and videos', isSpecial: true },
  ];

  const recentStudentTools = recentlyUsed
    .filter(id => studentTools.some(t => t.id === id))
    .slice(0, 3)
    .map(id => getToolById(id))
    .filter(Boolean);

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <GraduationCap size={24} className="text-indigo-400" />
          Student Toolkit
        </h1>
        <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          AI-powered tools for students
        </p>
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: <CheckCircle size={18} className="text-green-400" />, label: "Today's Tasks", value: '3', color: 'green' },
          { icon: <BookOpen size={18} className="text-blue-400" />, label: 'Study Progress', value: '65%', color: 'blue' },
          { icon: <Calendar size={18} className="text-yellow-400" />, label: 'Upcoming Exams', value: '2', color: 'yellow' },
          { icon: <Target size={18} className="text-purple-400" />, label: 'Study Streak', value: '5 days', color: 'purple' },
        ].map((card, i) => (
          <div key={i} className={`p-4 rounded-xl ${isDark ? 'bg-white/5 border border-white/5' : 'bg-white border border-gray-100 shadow-sm'}`}>
            <div className="mb-2">{card.icon}</div>
            <p className="text-lg font-bold">{card.value}</p>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{card.label}</p>
          </div>
        ))}
      </div>

      {/* Tools Grid */}
      <div>
        <h2 className="text-lg font-bold mb-4">📚 Study Tools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {studentTools.map(tool => (
            <Link
              key={tool.id}
              to={(tool as any).isSpecial ? `/${tool.id}` : `/tool/${tool.id}`}
              className={`group p-5 rounded-xl card-hover ${isDark ? 'bg-white/5 border border-white/5 hover:border-indigo-500/30' : 'bg-white border border-gray-100 hover:border-indigo-200 shadow-sm'}`}
            >
              <span className="text-3xl mb-3 block">{tool.icon}</span>
              <h3 className="font-semibold text-sm mb-1">{tool.name}</h3>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{tool.desc}</p>
              <span className={`text-xs mt-3 inline-block opacity-0 group-hover:opacity-100 transition-opacity ${isDark ? 'text-indigo-400' : 'text-indigo-500'}`}>
                Open Tool →
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className={`rounded-2xl p-6 ${isDark ? 'bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20' : 'bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100'}`}>
        <h3 className="font-bold mb-4">⚡ Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link to="/tool/study-planner" className={`p-3 rounded-xl text-center text-sm font-medium ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-white hover:bg-gray-50'} transition-colors`}>
            📅 Plan Study
          </Link>
          <Link to="/tool/quiz-generator" className={`p-3 rounded-xl text-center text-sm font-medium ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-white hover:bg-gray-50'} transition-colors`}>
            ❓ Take Quiz
          </Link>
          <Link to="/ask-ai" className={`p-3 rounded-xl text-center text-sm font-medium ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-white hover:bg-gray-50'} transition-colors`}>
            💡 Ask AI
          </Link>
          <Link to="/tool/flashcard-generator" className={`p-3 rounded-xl text-center text-sm font-medium ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-white hover:bg-gray-50'} transition-colors`}>
            🃏 Flashcards
          </Link>
        </div>
      </div>

      {/* Recently Used */}
      {recentStudentTools.length > 0 && (
        <div>
          <h2 className="text-lg font-bold mb-4">🕐 Recently Used</h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {recentStudentTools.map(tool => tool && (
              <Link
                key={tool.id}
                to={`/tool/${tool.id}`}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl whitespace-nowrap ${isDark ? 'bg-white/5 hover:bg-white/10 border border-white/5' : 'bg-white hover:bg-gray-50 border border-gray-100 shadow-sm'} transition-colors`}
              >
                <span className="text-xl">{tool.icon}</span>
                <span className="text-sm font-medium">{tool.name}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
