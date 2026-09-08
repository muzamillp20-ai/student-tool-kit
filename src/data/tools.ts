export interface Tool {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  keywords: string[];
  isMVP?: boolean;
  comingSoon?: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export const categories: Category[] = [
  { id: 'writing', name: 'Writing', icon: '✍️', description: 'AI-powered writing tools' },
  { id: 'student', name: 'Student', icon: '🎓', description: 'Study & learning utilities' },
  { id: 'productivity', name: 'Productivity', icon: '💼', description: 'Boost your daily workflow' },
  { id: 'utilities', name: 'Smart Utilities', icon: '🧮', description: 'Calculators & converters' },
  { id: 'developer', name: 'Developer', icon: '💻', description: 'Code & development tools' },
  { id: 'assistants', name: 'AI Assistants', icon: '🧠', description: 'General AI assistants' },
];

export const tools: Tool[] = [
  // Writing
  { id: 'summarizer', name: 'AI Text Summarizer', description: 'Condense long text into clear, concise summaries', category: 'writing', icon: '📝', keywords: ['summarize', 'summary', 'shorten', 'condense', 'text'], isMVP: true },
  { id: 'rewriter', name: 'AI Text Rewriter', description: 'Rewrite text in different tones and styles', category: 'writing', icon: '✏️', keywords: ['rewrite', 'paraphrase', 'tone', 'style', 'rephrase'], isMVP: true },
  { id: 'grammar-fixer', name: 'Grammar Fixer', description: 'Fix grammar, spelling and punctuation errors', category: 'writing', icon: '✅', keywords: ['grammar', 'spelling', 'fix', 'correct', 'proofread'] },
  { id: 'email-generator', name: 'Email Generator', description: 'Generate professional emails for any occasion', category: 'writing', icon: '📧', keywords: ['email', 'mail', 'professional', 'compose', 'write'], isMVP: true },
  { id: 'caption-generator', name: 'Caption Generator', description: 'Create engaging captions for social media', category: 'writing', icon: '💬', keywords: ['caption', 'social', 'instagram', 'post', 'content'], isMVP: true },
  { id: 'bio-generator', name: 'Bio Generator', description: 'Generate creative bios for profiles', category: 'writing', icon: '👤', keywords: ['bio', 'profile', 'about', 'description'] },
  { id: 'paraphraser', name: 'Paraphraser', description: 'Rephrase text while keeping the meaning', category: 'writing', icon: '🔄', keywords: ['paraphrase', 'rephrase', 'rewrite', 'alternative'] },
  { id: 'text-expander', name: 'Text Expander', description: 'Expand short text into detailed content', category: 'writing', icon: '📖', keywords: ['expand', 'elaborate', 'detail', 'longer'] },
  { id: 'text-shortener', name: 'Text Shortener', description: 'Shorten text while keeping key information', category: 'writing', icon: '✂️', keywords: ['shorten', 'trim', 'reduce', 'concise'] },

  // Student
  { id: 'study-planner', name: 'Study Planner', description: 'Create personalized study schedules', category: 'student', icon: '📅', keywords: ['study', 'plan', 'schedule', 'calendar', 'organize'], isMVP: true },
  { id: 'quiz-generator', name: 'Quiz Generator', description: 'Generate quizzes from any topic', category: 'student', icon: '❓', keywords: ['quiz', 'test', 'exam', 'questions', 'assessment'], isMVP: true },
  { id: 'flashcard-generator', name: 'Flashcard Generator', description: 'Create flashcards for effective learning', category: 'student', icon: '🃏', keywords: ['flashcard', 'memory', 'learn', 'review', 'cards'] },
  { id: 'notes-summarizer', name: 'Notes Summarizer', description: 'Summarize study notes efficiently', category: 'student', icon: '📋', keywords: ['notes', 'summarize', 'study', 'review', 'key points'] },
  { id: 'assignment-helper', name: 'Assignment Helper', description: 'Get help with assignments and homework', category: 'student', icon: '📚', keywords: ['assignment', 'homework', 'help', 'task', 'school'] },
  { id: 'question-generator', name: 'Question Generator', description: 'Generate practice questions from topics', category: 'student', icon: '🤔', keywords: ['questions', 'practice', 'generate', 'quiz', 'test'] },
  { id: 'study-schedule', name: 'Study Schedule Generator', description: 'Create optimal study timetables', category: 'student', icon: '🗓️', keywords: ['schedule', 'timetable', 'plan', 'organize', 'time'] },

  // Productivity
  { id: 'todo-generator', name: 'To-Do Generator', description: 'Generate smart to-do lists', category: 'productivity', icon: '☑️', keywords: ['todo', 'tasks', 'list', 'organize', 'plan'] },
  { id: 'meeting-summarizer', name: 'Meeting Summarizer', description: 'Summarize meeting notes and action items', category: 'productivity', icon: '🤝', keywords: ['meeting', 'summarize', 'notes', 'action', 'minutes'] },
  { id: 'task-planner', name: 'Task Planner', description: 'Plan and organize your tasks efficiently', category: 'productivity', icon: '📌', keywords: ['task', 'plan', 'organize', 'priority', 'manage'] },
  { id: 'daily-planner', name: 'Daily Planner', description: 'Plan your perfect day', category: 'productivity', icon: '🌅', keywords: ['daily', 'plan', 'day', 'schedule', 'routine'] },
  { id: 'goal-generator', name: 'Goal Generator', description: 'Set and break down achievable goals', category: 'productivity', icon: '🎯', keywords: ['goal', 'target', 'achieve', 'plan', 'milestone'] },
  { id: 'decision-helper', name: 'Decision Helper', description: 'Make better decisions with AI analysis', category: 'productivity', icon: '⚖️', keywords: ['decision', 'choose', 'analyze', 'pros', 'cons'] },
  { id: 'time-planner', name: 'Time Planner', description: 'Optimize your time allocation', category: 'productivity', icon: '⏰', keywords: ['time', 'plan', 'allocate', 'schedule', 'optimize'] },

  // Smart Utilities
  { id: 'unit-converter', name: 'Unit Converter', description: 'Convert between different units', category: 'utilities', icon: '📐', keywords: ['unit', 'convert', 'measurement', 'length', 'weight'] },
  { id: 'percentage-calc', name: 'Percentage Calculator', description: 'Calculate percentages easily', category: 'utilities', icon: '📊', keywords: ['percentage', 'percent', 'calculate', 'math', 'ratio'] },
  { id: 'age-calculator', name: 'Age Calculator', description: 'Calculate age from date of birth', category: 'utilities', icon: '🎂', keywords: ['age', 'birthday', 'calculate', 'date', 'years'] },
  { id: 'bmi-calculator', name: 'BMI Calculator', description: 'Calculate Body Mass Index', category: 'utilities', icon: '⚖️', keywords: ['bmi', 'health', 'weight', 'body', 'mass'] },
  { id: 'currency-converter', name: 'Currency Converter', description: 'Convert between currencies', category: 'utilities', icon: '💱', keywords: ['currency', 'money', 'convert', 'exchange', 'rate'] },
  { id: 'date-calculator', name: 'Date Calculator', description: 'Calculate dates and durations', category: 'utilities', icon: '📆', keywords: ['date', 'calculate', 'days', 'duration', 'time'] },
  { id: 'timezone-converter', name: 'Time Zone Converter', description: 'Convert between time zones', category: 'utilities', icon: '🌍', keywords: ['timezone', 'time', 'zone', 'convert', 'world'] },

  // Developer
  { id: 'code-explainer', name: 'Code Explainer', description: 'Explain code in plain English', category: 'developer', icon: '🔍', keywords: ['code', 'explain', 'understand', 'read', 'documentation'], isMVP: true },
  { id: 'code-debugger', name: 'Code Debugger', description: 'Find and fix bugs in your code', category: 'developer', icon: '🐛', keywords: ['debug', 'bug', 'fix', 'error', 'code'] },
  { id: 'json-formatter', name: 'JSON Formatter', description: 'Format and validate JSON data', category: 'developer', icon: '📋', keywords: ['json', 'format', 'validate', 'data', 'api'] },
  { id: 'regex-helper', name: 'Regex Helper', description: 'Build and test regular expressions', category: 'developer', icon: '🔤', keywords: ['regex', 'pattern', 'match', 'search', 'validate'] },
  { id: 'sql-generator', name: 'SQL Generator', description: 'Generate SQL queries from descriptions', category: 'developer', icon: '🗄️', keywords: ['sql', 'query', 'database', 'generate', 'table'] },
  { id: 'api-generator', name: 'API Request Generator', description: 'Generate API request examples', category: 'developer', icon: '🔌', keywords: ['api', 'request', 'http', 'endpoint', 'fetch'] },
  { id: 'markdown-formatter', name: 'Markdown Formatter', description: 'Format and preview Markdown', category: 'developer', icon: '📄', keywords: ['markdown', 'format', 'preview', 'readme', 'documentation'] },

  // AI Assistants
  { id: 'ask-ai', name: 'Ask AI', description: 'Ask anything and get intelligent answers', category: 'assistants', icon: '💡', keywords: ['ask', 'ai', 'question', 'answer', 'help', 'chat'], isMVP: true },
  { id: 'brainstorming', name: 'Brainstorming Assistant', description: 'Generate creative ideas and solutions', category: 'assistants', icon: '🧩', keywords: ['brainstorm', 'ideas', 'creative', 'think', 'generate'] },
  { id: 'idea-generator', name: 'Idea Generator', description: 'Generate ideas for any topic', category: 'assistants', icon: '💭', keywords: ['idea', 'generate', 'creative', 'topic', 'inspiration'] },
  { id: 'decision-assistant', name: 'Decision Assistant', description: 'AI-powered decision making support', category: 'assistants', icon: '🎲', keywords: ['decision', 'choose', 'analyze', 'compare', 'evaluate'] },
  { id: 'research-assistant', name: 'Research Assistant', description: 'Help with research and analysis', category: 'assistants', icon: '🔬', keywords: ['research', 'analyze', 'study', 'investigate', 'find'] },
  { id: 'personal-assistant', name: 'Personal Assistant', description: 'Your AI-powered personal helper', category: 'assistants', icon: '🤖', keywords: ['personal', 'assistant', 'help', 'organize', 'remind'] },
];

export const getToolById = (id: string): Tool | undefined => tools.find(t => t.id === id);
export const getToolsByCategory = (categoryId: string): Tool[] => tools.filter(t => t.category === categoryId);
export const getMVPTools = (): Tool[] => tools.filter(t => t.isMVP);
export const searchTools = (query: string): Tool[] => {
  const q = query.toLowerCase();
  return tools.filter(t => 
    t.name.toLowerCase().includes(q) || 
    t.description.toLowerCase().includes(q) || 
    t.keywords.some(k => k.includes(q)) ||
    t.category.includes(q)
  );
};
