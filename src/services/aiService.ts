// AI Service Layer - Supports OpenAI-compatible APIs (Qwen, OpenRouter, Groq, etc.)
// Set VITE_AI_API_KEY in your environment to enable real AI responses
// Set VITE_AI_API_URL to change the API endpoint (defaults to OpenAI)
// Set VITE_AI_MODEL to change the model (defaults to gpt-4o-mini)

const env = (import.meta as any).env || {};

// Get API config - priority: env vars > localStorage
function getConfig() {
  const apiKey = env.VITE_AI_API_KEY || localStorage.getItem('ai-hub-api-key') || '';
  const apiUrl = env.VITE_AI_API_URL || localStorage.getItem('ai-hub-api-url') || 'https://api.openai.com/v1/chat/completions';
  const model = env.VITE_AI_MODEL || localStorage.getItem('ai-hub-model') || 'gpt-4o-mini';
  return { apiKey, apiUrl, model };
}

export const isDemoMode = !getConfig().apiKey;

interface AIRequest {
  tool: string;
  input: string;
  options?: Record<string, string>;
}

// System prompts for each tool
const systemPrompts: Record<string, string> = {
  summarizer: 'You are an expert text summarizer. Provide clear, concise summaries that capture the key points. Use markdown formatting.',
  rewriter: 'You are a professional writer who rewrites text in different tones and styles. Preserve the original meaning while adapting the tone.',
  'email-generator': 'You are an expert email writer. Generate professional, well-structured emails based on the given context.',
  'caption-generator': 'You are a social media expert. Generate engaging, creative captions for various platforms.',
  'study-planner': 'You are an expert academic planner. Create detailed, realistic study plans with specific time allocations.',
  'quiz-generator': 'You are an expert educator. Generate well-structured quizzes with clear questions, multiple choice options, and correct answers marked.',
  'code-explainer': 'You are a senior software engineer. Explain code clearly, breaking down logic, purpose, and suggesting improvements.',
  'ask-ai': 'You are a helpful, knowledgeable AI assistant. Provide clear, accurate, and well-structured responses.',
  'grammar-fixer': 'You are an expert grammar checker. Fix grammatical errors while preserving the original meaning and tone.',
  'paraphraser': 'You are an expert at rephrasing text. Rewrite content in different words while keeping the same meaning.',
  'text-expander': 'You are a writing assistant. Expand short text into more detailed, comprehensive content.',
  'text-shortener': 'You are a writing assistant. Condense text while preserving key information.',
  'bio-generator': 'You are a personal branding expert. Generate compelling bios for various purposes.',
  'flashcard-generator': 'You are an expert educator. Create effective flashcards with clear questions and concise answers.',
  'notes-summarizer': 'You are a note-taking expert. Summarize study notes into clear, organized key points.',
  'assignment-helper': 'You are an academic assistant. Help with assignments by providing guidance, structure, and explanations.',
  'question-generator': 'You are an expert educator. Generate thoughtful questions for study and review.',
  'meeting-summarizer': 'You are a business professional. Summarize meeting notes into clear action items and key decisions.',
  'decision-helper': 'You are a decision-making advisor. Help analyze options with pros, cons, and recommendations.',
  'json-formatter': 'You are a developer tool. Format and validate JSON, explaining any errors found.',
  'regex-helper': 'You are a regex expert. Help create, explain, and debug regular expressions.',
  'sql-generator': 'You are a database expert. Generate SQL queries based on natural language descriptions.',
  'idea-generator': 'You are a creative brainstorming partner. Generate diverse, innovative ideas.',
  'brainstorming-assistant': 'You are a creative thinking partner. Help explore ideas from multiple angles.',
  'research-assistant': 'You are a research assistant. Help organize and analyze information.',
  'personal-assistant': 'You are a helpful personal assistant. Help with planning, organization, and daily tasks.',
  'todo-generator': 'You are a productivity expert. Generate smart, actionable to-do lists.',
  'task-planner': 'You are a project management expert. Help plan and organize tasks effectively.',
  'daily-planner': 'You are a productivity coach. Help plan productive days with balanced activities.',
  'goal-generator': 'You are a goal-setting expert. Help create SMART goals with actionable steps.',
  'time-planner': 'You are a time management expert. Help allocate time effectively across tasks.',
  'markdown-formatter': 'You are a documentation expert. Format and improve markdown content.',
  'api-request-generator': 'You are an API expert. Generate API request examples with proper formatting.',
};

// Demo responses for when no API key is available
const demoResponses: Record<string, (input: string, options?: Record<string, string>) => string> = {
  summarizer: (input) => {
    const sentences = input.split(/[.!?]+/).filter(s => s.trim().length > 0);
    if (sentences.length <= 2) return `**Summary:**\n\n${input.trim()}\n\n*This text is already concise.*`;
    const keySentences = sentences.slice(0, Math.min(3, Math.ceil(sentences.length / 3)));
    return `**Summary:**\n\n${keySentences.map(s => s.trim()).join('. ')}.\n\n---\n*Key points extracted from ${sentences.length} sentences.*`;
  },
  rewriter: (input, options) => {
    const tone = options?.tone || 'professional';
    const toneMap: Record<string, string> = {
      professional: `Here is your text rewritten in a professional tone:\n\n"${input.trim()}"\n\n*Refined for clarity and formality.*`,
      casual: `Here's a more casual version:\n\n"${input.trim()}"\n\n*Made more relaxed and conversational.*`,
      friendly: `Here's a friendlier version:\n\n"${input.trim()}"\n\n*Warmed up with a welcoming tone.*`,
      academic: `Here's an academic rewrite:\n\n"${input.trim()}"\n\n*Adapted for scholarly communication.*`,
      creative: `Here's a creative reinterpretation:\n\n"${input.trim()}"\n\n*Enhanced with vivid language and expression.*`,
    };
    return toneMap[tone] || toneMap.professional;
  },
  'email-generator': (input, options) => {
    const purpose = options?.purpose || 'general';
    const tone = options?.tone || 'professional';
    return `**Subject:** Regarding ${purpose}\n\nDear [Recipient],\n\nI hope this message finds you well. I am writing to you regarding ${input || purpose}.\n\n${purpose === 'meeting' ? 'I would like to schedule a meeting to discuss this matter further. Please let me know your availability.' : 'I wanted to bring this to your attention and would appreciate your feedback.'}\n\nPlease don't hesitate to reach out if you have any questions.\n\nBest regards,\n[Your Name]\n\n---\n*Tone: ${tone} | Generated for: ${purpose}*`;
  },
  'caption-generator': (input, options) => {
    const platform = options?.platform || 'instagram';
    const topic = input || 'your amazing moment';
    return `Here are some caption suggestions for **${platform}**:\n\n1. ✨ "${topic} — living my best life"\n\n2. 🌟 "When ${topic} hits different"\n\n3. 💫 "${topic} vibes only"\n\n4. 🔥 "POV: You discovered ${topic}"\n\n5. 🌈 "Chapter: ${topic}"\n\n---\n*Platform: ${platform} | Style: Engaging & Trendy*`;
  },
  'study-planner': (input, options) => {
    const subject = input || 'General Studies';
    const duration = options?.duration || '1 week';
    return `**📅 Study Plan for: ${subject}**\n*Duration: ${duration}*\n\n**Day 1-2: Foundation**\n• Review core concepts (2 hrs)\n• Read textbook chapters 1-3\n• Take notes on key terms\n\n**Day 3-4: Deep Dive**\n• Practice problems (1.5 hrs)\n• Watch supplementary videos\n• Create flashcards for difficult topics\n\n**Day 5-6: Application**\n• Work through past papers\n• Group study session (1 hr)\n• Self-assessment quiz\n\n**Day 7: Review**\n• Review weak areas\n• Final practice test\n• Rest & light review\n\n---\n*💡 Tip: Use the Pomodoro technique — 25 min study, 5 min break*`;
  },
  'quiz-generator': (input) => {
    const topic = input || 'General Knowledge';
    return `**📝 Quiz: ${topic}**\n\n**Q1.** Which of the following is most closely related to ${topic}?\nA) Option Alpha\nB) Option Beta ✓\nC) Option Gamma\nD) Option Delta\n\n**Q2.** What is the primary characteristic of ${topic}?\nA) Speed\nB) Complexity\nC) Adaptability ✓\nD) Simplicity\n\n**Q3.** When was ${topic} first introduced?\nA) 2015\nB) 2018\nC) 2020 ✓\nD) 2022\n\n**Q4.** Which field does ${topic} primarily belong to?\nA) Arts\nB) Science ✓\nC) Commerce\nD) Sports\n\n**Q5.** What is the main benefit of understanding ${topic}?\nA) Entertainment value\nB) Practical application ✓\nC) Social status\nD) Historical knowledge\n\n---\n*Answers: 1-B, 2-C, 3-C, 4-B, 5-B*\n*Score: ___/5*`;
  },
  'code-explainer': (input) => {
    const code = input.trim();
    if (!code) return 'Please provide some code to explain.';
    return `**🔍 Code Explanation:**\n\n\`\`\`\n${code.slice(0, 200)}${code.length > 200 ? '...' : ''}\n\`\`\`\n\n**What this code does:**\n\n1. **Purpose:** This code performs a specific operation based on its structure\n2. **Flow:** The execution follows a logical sequence of steps\n3. **Key Components:**\n   • Input handling and validation\n   • Core logic processing\n   • Output generation\n\n**Line-by-line breakdown:**\n• The code initializes necessary variables\n• It processes data through the main logic\n• Results are computed and returned\n\n**Suggestions:**\n• Consider adding error handling\n• Variable names could be more descriptive\n• Adding comments would improve readability\n\n---\n*💡 This is a demo explanation. Connect an AI API for detailed analysis.*`;
  },
  'ask-ai': (input) => {
    const responses = [
      `That's a great question! Here's what I can tell you:\n\n**About "${input.slice(0, 50)}..."**\n\nThis is a topic that involves multiple aspects. Let me break it down:\n\n1. **Key Point 1:** The fundamental concept relates to understanding the core principles\n2. **Key Point 2:** There are practical applications in everyday scenarios\n3. **Key Point 3:** Recent developments have expanded our understanding\n\n**In summary:** This is a multifaceted topic worth exploring further. I'd recommend looking into specific aspects that interest you most.\n\n---\n*💡 This is a demo response. Connect an AI API for personalized answers.*`,
      `Great question! Let me help you with that.\n\nBased on "${input.slice(0, 50)}...", here's my analysis:\n\n**Overview:**\nThis involves understanding several interconnected concepts.\n\n**Key Insights:**\n• The main idea centers around practical application\n• There are multiple approaches to consider\n• Context matters significantly\n\n**Recommendation:**\nStart with the basics and build up gradually. Practice and real-world application will deepen your understanding.\n\n---\n*💡 Demo mode active. Connect AI API for detailed responses.*`,
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  },
};

// Default demo response for tools without specific handlers
function getDefaultDemoResponse(tool: string, input: string, options?: Record<string, string>): string {
  const optionsText = options ? Object.entries(options).map(([k, v]) => `${k}: ${v}`).join(', ') : '';
  return `**AI Response for ${tool}:**\n\nBased on your input: "${input.slice(0, 100)}..."\n\n${optionsText ? `Options: ${optionsText}\n\n` : ''}Here is a demo response showing how this tool would work with an AI API connected.\n\n---\n*Demo Mode: Connect an AI API key for real responses.*`;
}

// Call real AI API
async function callRealAPI(request: AIRequest): Promise<string> {
  const { apiKey, apiUrl, model } = getConfig();
  const systemPrompt = systemPrompts[request.tool] || 'You are a helpful AI assistant. Provide clear, well-structured responses using markdown formatting.';
  
  const userMessage = request.options && Object.keys(request.options).length > 0
    ? `Input: ${request.input}\n\nOptions: ${JSON.stringify(request.options)}`
    : request.input;

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const errorMessage = errorData?.error?.message || `API request failed (${response.status})`;
    throw new Error(errorMessage);
  }

  const data = await response.json();
  
  // Handle OpenAI-compatible response format
  if (data.choices && data.choices[0]?.message?.content) {
    return data.choices[0].message.content;
  }
  
  // Handle other response formats
  if (data.result) return data.result;
  if (data.output) return data.output;
  if (data.text) return data.text;
  if (data.response) return data.response;
  
  throw new Error('Unexpected API response format');
}

export async function generateAIResponse(request: AIRequest): Promise<string> {
  const { apiKey } = getConfig();
  
  // Simulate API delay for demo mode
  if (!apiKey) {
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));
    const handler = demoResponses[request.tool];
    if (handler) {
      return handler(request.input, request.options);
    }
    return getDefaultDemoResponse(request.tool, request.input, request.options);
  }

  // Real API call
  return callRealAPI(request);
}

// Chat-specific function for Ask AI page
export async function generateChatResponse(
  messages: { role: string; content: string }[]
): Promise<string> {
  const { apiKey, apiUrl, model } = getConfig();
  if (!apiKey) {
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));
    const lastUserMsg = messages.filter(m => m.role === 'user').pop();
    const input = lastUserMsg?.content || '';
    return demoResponses['ask-ai'](input);
  }

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model,
      messages: [
        { role: 'system', content: 'You are a helpful, knowledgeable AI assistant. Provide clear, accurate, and well-structured responses using markdown formatting when appropriate.' },
        ...messages,
      ],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const errorMessage = errorData?.error?.message || `API request failed (${response.status})`;
    throw new Error(errorMessage);
  }

  const data = await response.json();
  
  if (data.choices && data.choices[0]?.message?.content) {
    return data.choices[0].message.content;
  }
  
  throw new Error('Unexpected API response format');
}

export function getIsDemoMode(): boolean {
  return !getConfig().apiKey;
}

export function getAIConfig() {
  const { apiKey, apiUrl, model } = getConfig();
  return {
    hasApiKey: !!apiKey,
    apiUrl: apiUrl,
    model: model,
    isDemoMode: !apiKey,
  };
}
