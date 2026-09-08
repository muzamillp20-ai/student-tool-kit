import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { BarChart3, Play, Pause, RotateCcw, Plus, CheckCircle, Circle, Trash2 } from 'lucide-react';

interface Task {
  id: string;
  text: string;
  done: boolean;
}

export default function ProductivityPage() {
  const { theme, history } = useApp();
  const isDark = theme === 'dark';
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const stored = localStorage.getItem('ai-hub-tasks');
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });
  const [newTask, setNewTask] = useState('');
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerMode, setTimerMode] = useState<'work' | 'break'>('work');

  useEffect(() => {
    localStorage.setItem('ai-hub-tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    let interval: number | undefined;
    if (timerRunning && timerSeconds > 0) {
      interval = window.setInterval(() => {
        setTimerSeconds(prev => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setTimerRunning(false);
      if (timerMode === 'work') {
        setTimerMode('break');
        setTimerSeconds(5 * 60);
      } else {
        setTimerMode('work');
        setTimerSeconds(25 * 60);
      }
    }
    return () => clearInterval(interval);
  }, [timerRunning, timerSeconds, timerMode]);

  const addTask = () => {
    if (!newTask.trim()) return;
    setTasks(prev => [...prev, { id: Date.now().toString(), text: newTask.trim(), done: false }]);
    setNewTask('');
  };

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const resetTimer = () => {
    setTimerRunning(false);
    setTimerSeconds(timerMode === 'work' ? 25 * 60 : 5 * 60);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const completedTasks = tasks.filter(t => t.done).length;
  const totalTasks = tasks.length;
  const productivityScore = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 size={24} className="text-indigo-400" />
          Productivity Dashboard
        </h1>
        <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          Stay organized and productive
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Completed', value: completedTasks, color: 'text-green-400' },
          { label: 'Remaining', value: totalTasks - completedTasks, color: 'text-yellow-400' },
          { label: 'Tools Used', value: history.length, color: 'text-blue-400' },
          { label: 'Score', value: `${productivityScore}%`, color: 'text-purple-400' },
        ].map((card, i) => (
          <div key={i} className={`p-4 rounded-xl ${isDark ? 'bg-white/5 border border-white/5' : 'bg-white border border-gray-100 shadow-sm'}`}>
            <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
            <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tasks */}
        <div className={`rounded-2xl p-5 ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200 shadow-sm'}`}>
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <CheckCircle size={16} className="text-indigo-400" />
            Today&apos;s Tasks
          </h3>
          
          {/* Add Task */}
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newTask}
              onChange={e => setNewTask(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addTask()}
              placeholder="Add a task..."
              className={`flex-1 px-3 py-2 rounded-lg text-sm outline-none ${isDark ? 'bg-white/5 border border-white/10 text-white placeholder-gray-500' : 'bg-gray-50 border border-gray-200 placeholder-gray-400'}`}
            />
            <button
              onClick={addTask}
              className="p-2 rounded-lg bg-indigo-500 text-white hover:bg-indigo-600 transition-colors"
            >
              <Plus size={16} />
            </button>
          </div>

          {/* Task List */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {tasks.length === 0 ? (
              <p className={`text-sm text-center py-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                No tasks yet. Add one above!
              </p>
            ) : (
              tasks.map(task => (
                <div key={task.id} className={`flex items-center gap-3 p-3 rounded-lg ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                  <button onClick={() => toggleTask(task.id)} className="flex-shrink-0">
                    {task.done ? (
                      <CheckCircle size={18} className="text-green-400" />
                    ) : (
                      <Circle size={18} className={isDark ? 'text-gray-500' : 'text-gray-300'} />
                    )}
                  </button>
                  <span className={`flex-1 text-sm ${task.done ? 'line-through opacity-50' : ''}`}>
                    {task.text}
                  </span>
                  <button onClick={() => deleteTask(task.id)} className="text-gray-400 hover:text-red-400 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pomodoro Timer */}
        <div className={`rounded-2xl p-5 ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200 shadow-sm'}`}>
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <span className="text-lg">🍅</span>
            Pomodoro Timer
          </h3>

          <div className="text-center py-6">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-4 ${
              timerMode === 'work'
                ? isDark ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-500'
                : isDark ? 'bg-green-500/10 text-green-400' : 'bg-green-50 text-green-500'
            }`}>
              {timerMode === 'work' ? '🔥 Focus Time' : '☕ Break Time'}
            </div>
            <p className="text-5xl font-bold font-mono mb-6">{formatTime(timerSeconds)}</p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setTimerRunning(!timerRunning)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium text-sm hover:opacity-90 transition-opacity"
              >
                {timerRunning ? <><Pause size={14} /> Pause</> : <><Play size={14} /> Start</>}
              </button>
              <button
                onClick={resetTimer}
                className={`p-2.5 rounded-xl ${isDark ? 'bg-white/10 hover:bg-white/15' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
              >
                <RotateCcw size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className={`rounded-2xl p-6 ${isDark ? 'bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20' : 'bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100'}`}>
        <h3 className="font-bold mb-4">⚡ Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <Link to="/tool/todo-generator" className={`p-3 rounded-xl text-center text-sm font-medium ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-white hover:bg-gray-50'} transition-colors`}>
            ☑️ Add Task
          </Link>
          <Link to="/tool/daily-planner" className={`p-3 rounded-xl text-center text-sm font-medium ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-white hover:bg-gray-50'} transition-colors`}>
            📋 Plan Day
          </Link>
          <Link to="/ask-ai" className={`p-3 rounded-xl text-center text-sm font-medium ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-white hover:bg-gray-50'} transition-colors`}>
            💡 Ask AI
          </Link>
          <Link to="/tool/goal-generator" className={`p-3 rounded-xl text-center text-sm font-medium ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-white hover:bg-gray-50'} transition-colors`}>
            🎯 Set Goals
          </Link>
          <Link to="/tool/decision-helper" className={`p-3 rounded-xl text-center text-sm font-medium ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-white hover:bg-gray-50'} transition-colors`}>
            ⚖️ Decide
          </Link>
        </div>
      </div>

      {/* Productivity Tools */}
      <div>
        <h2 className="text-lg font-bold mb-4">💼 Productivity Tools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { id: 'todo-generator', icon: '☑️', name: 'To-Do Generator', desc: 'Generate smart to-do lists' },
            { id: 'meeting-summarizer', icon: '🤝', name: 'Meeting Summarizer', desc: 'Summarize meeting notes' },
            { id: 'task-planner', icon: '📌', name: 'Task Planner', desc: 'Plan and organize tasks' },
            { id: 'daily-planner', icon: '🌅', name: 'Daily Planner', desc: 'Plan your perfect day' },
            { id: 'goal-generator', icon: '🎯', name: 'Goal Generator', desc: 'Set achievable goals' },
            { id: 'decision-helper', icon: '⚖️', name: 'Decision Helper', desc: 'Make better decisions' },
          ].map(tool => (
            <Link
              key={tool.id}
              to={`/tool/${tool.id}`}
              className={`group p-4 rounded-xl card-hover ${isDark ? 'bg-white/5 border border-white/5 hover:border-indigo-500/30' : 'bg-white border border-gray-100 hover:border-indigo-200 shadow-sm'}`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{tool.icon}</span>
                <div>
                  <h3 className="font-semibold text-sm">{tool.name}</h3>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{tool.desc}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
