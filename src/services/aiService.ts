// AI Service Layer - Designed for easy provider integration
// Currently operates in Demo Mode with realistic responses

const isDemoMode = !(import.meta as any).env?.VITE_AI_API_KEY;

interface AIRequest {
  tool: string;
  input: string;
  options?: Record<string, string>;
}

// Demo responses for different tools
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

export async function generateAIResponse(request: AIRequest): Promise<string> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));

  if (isDemoMode) {
    const handler = demoResponses[request.tool];
    if (handler) {
      return handler(request.input, request.options);
    }
    return `**AI Response for ${request.tool}:**\n\nBased on your input: "${request.input.slice(0, 100)}..."\n\nHere is a demo response showing how this tool would work with an AI API connected.\n\n---\n*Demo Mode: Connect an AI API key for real responses.*`;
  }

  // Real API integration point
  try {
    const response = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!response.ok) throw new Error('API request failed');
    const data = await response.json();
    return data.result;
  } catch {
    throw new Error('Failed to get AI response. Please try again.');
  }
}

export function getIsDemoMode(): boolean {
  return isDemoMode;
}
