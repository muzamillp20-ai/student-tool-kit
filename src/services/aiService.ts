// AI Service Layer - Supports Google Gemini and OpenAI-compatible APIs
// Configured for gemini-2.5-flash with student-focused prompts

const env = (import.meta as any).env || {};

// Get API config - priority: env vars > localStorage
function getConfig() {
  const apiKey = env.VITE_AI_API_KEY || localStorage.getItem('ai-hub-api-key') || '';
  const apiUrl = env.VITE_AI_API_URL || localStorage.getItem('ai-hub-api-url') || 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
  const model = env.VITE_AI_MODEL || localStorage.getItem('ai-hub-model') || 'gemini-2.5-flash';
  return { apiKey, apiUrl, model };
}

export const isDemoMode = !getConfig().apiKey;

interface AIRequest {
  tool: string;
  input: string;
  options?: Record<string, string>;
}

// Enhanced system prompts for student utilities
const systemPrompts: Record<string, string> = {
  // Writing Tools
  summarizer: `You are an expert academic summarizer helping students. Your task is to:
- Identify the most important points and key concepts
- Remove unnecessary information and filler text
- Keep important definitions, formulas, facts, and concepts
- Use clear headings and bullet points for structure
- Make the summary concise but comprehensive enough for exam revision
- Preserve technical terms and their meanings

Format your response with clear sections and bullet points where appropriate.`,

  rewriter: `You are a skilled academic writer who helps students improve their writing. Adapt the text to the specified tone while:
- Maintaining the original meaning and key information
- Improving clarity and readability
- Using appropriate vocabulary for the target tone
- Keeping the structure logical and coherent
- Ensuring proper grammar and academic conventions

Common tones:
- Professional: Formal, clear, objective language
- Casual: Conversational but still informative
- Friendly: Warm, approachable, encouraging
- Academic: Scholarly, precise, well-referenced style
- Creative: Engaging, vivid, expressive language`,

  'email-generator': `You are a professional communication expert helping students write effective emails. Create emails that are:
- Clear and concise
- Appropriately formal for the context
- Well-structured with proper greeting and closing
- Include all necessary information
- Professional yet personable
- Free of grammatical errors

Consider the recipient and purpose to set the right tone.`,

  'caption-generator': `You are a social media expert creating engaging captions. Generate captions that are:
- Attention-grabbing and trendy
- Appropriate for the specified platform
- Include relevant emojis when suitable
- Match the requested tone and style
- Engage the target audience
- Include calls-to-action when appropriate`,

  // Student Tools
  'study-planner': `You are an expert educational consultant creating personalized study plans. Your plans should:
- Be realistic and achievable within the given timeframe
- Include specific topics and activities for each study session
- Balance different types of learning (reading, practice, review)
- Incorporate active learning techniques
- Include breaks and review periods
- Prioritize difficult topics
- Suggest specific study methods (Pomodoro, spaced repetition, etc.)
- Be motivating and encouraging

Format as a clear day-by-day or session-by-session plan.`,

  'quiz-generator': `You are an experienced educator creating academic quizzes. Generate questions that:
- Are directly related to the provided topic/text
- Test understanding, not just memorization
- Include a mix of difficulty levels (easy, medium, hard)
- Cover different aspects of the topic
- Have clear, unambiguous answers
- Include various question types (multiple choice, short answer, etc.)
- Provide answer keys with explanations

Do NOT invent information unrelated to the topic. Base questions only on the provided content or well-established facts about the topic.`,

  'flashcard-generator': `You are a learning specialist creating effective flashcards. Each flashcard should:
- Have a clear, concise question on one side
- Provide a complete but brief answer on the other
- Focus on key concepts, definitions, and facts
- Use simple language for easy memorization
- Include examples where helpful
- Be suitable for spaced repetition learning

Format as Question/Answer pairs.`,

  'notes-summarizer': `You are an expert at creating study notes. Transform the input into structured notes that:
- Include clear definitions of key terms
- Highlight important concepts and principles
- List key points in bullet format
- Include formulas, examples, or diagrams where relevant
- Use headings and subheadings for organization
- Make connections between related concepts
- Are easy to review before exams
- Preserve all essential information while removing redundancy`,

  'assignment-helper': `You are a helpful academic tutor assisting with assignments. Provide guidance that:
- Explains concepts clearly step-by-step
- Shows the reasoning process, not just answers
- Uses examples to illustrate points
- Encourages understanding over memorization
- Suggests resources for further learning
- Breaks complex problems into manageable parts
- Is appropriate for the student's level

Do NOT just give the final answer - help the student learn.`,

  'question-generator': `You are an educator creating practice questions. Generate questions that:
- Are directly relevant to the topic
- Progress from basic to advanced
- Test different cognitive levels (recall, understanding, application, analysis)
- Include various question formats
- Have clear, correct answers
- Help identify areas needing more study
- Are exam-style when appropriate

Provide answer keys with brief explanations.`,

  'study-schedule': `You are a time management expert creating study schedules. Create schedules that:
- Are realistic and sustainable
- Account for energy levels throughout the day
- Include specific time blocks for each subject
- Balance study with breaks and rest
- Prioritize based on difficulty and importance
- Include review sessions
- Are flexible enough to adjust
- Use evidence-based study techniques`,

  // Productivity Tools
  'todo-generator': `You are a productivity expert creating actionable to-do lists. Generate lists that:
- Break large tasks into smaller, manageable items
- Are specific and actionable
- Include priorities when relevant
- Have clear completion criteria
- Are organized logically
- Include time estimates when helpful`,

  'meeting-summarizer': `You are an expert at capturing meeting insights. Create summaries that:
- Highlight key decisions made
- List action items with owners and deadlines
- Summarize main discussion points
- Note any unresolved issues
- Are concise but comprehensive
- Use clear formatting for easy reference`,

  'task-planner': `You are a project management expert. Create task plans that:
- Break projects into phases and milestones
- Identify dependencies between tasks
- Include time estimates
- Suggest resource allocation
- Highlight critical path items
- Are realistic and achievable`,

  'daily-planner': `You are a productivity coach creating daily plans. Design plans that:
- Balance work, study, and personal time
- Prioritize high-impact activities
- Include breaks and self-care
- Are realistic for one day
- Include specific time blocks
- Build in flexibility`,

  'goal-generator': `You are a goal-setting expert. Help create goals that:
- Follow SMART criteria (Specific, Measurable, Achievable, Relevant, Time-bound)
- Are broken into actionable steps
- Include milestones for tracking
- Are motivating and meaningful
- Have clear success criteria`,

  'decision-helper': `You are a decision-making advisor. Help analyze decisions by:
- Listing pros and cons clearly
- Identifying key factors to consider
- Suggesting questions to ask
- Highlighting potential risks and benefits
- Providing a framework for evaluation
- Being objective and balanced`,

  // Smart Utilities
  'unit-converter': `You are helpful with unit conversions. Provide:
- The converted value clearly
- The conversion formula used
- Context about when this conversion is useful
- Common related conversions if relevant`,

  'percentage-calculator': `You are helpful with percentage calculations. Provide:
- Clear step-by-step calculations
- The formula used
- Real-world examples when helpful
- Related percentage concepts if relevant`,

  'age-calculator': `You are helpful with age and date calculations. Provide:
- Clear, accurate results
- The calculation method
- Related information (days, weeks, months, etc.)
- Fun facts about the time period when appropriate`,

  'bmi-calculator': `You are helpful with health calculations. Provide:
- The BMI result clearly
- The category (underweight, normal, overweight, obese)
- Brief health context
- A note to consult healthcare professionals for medical advice`,

  'currency-converter': `You are helpful with currency information. Provide:
- Clear conversion results
- Note that exchange rates fluctuate
- Suggest checking current rates for accuracy
- Context about the currencies when helpful`,

  'date-calculator': `You are helpful with date calculations. Provide:
- Clear, accurate date results
- The calculation method
- Related time periods (days, weeks, months)
- Day of the week information`,

  'timezone-converter': `You are helpful with timezone conversions. Provide:
- Clear time conversions
- The timezone difference
- Tips for scheduling across timezones
- Common timezone abbreviations`,

  // Developer Tools
  'code-explainer': `You are a senior developer explaining code to students. Provide explanations that:
- Break down the code step-by-step
- Explain what each part does
- Identify the programming language and concepts used
- Highlight best practices or potential improvements
- Use simple language appropriate for the skill level
- Include examples of how the code works
- Suggest learning resources for related concepts`,

  'code-debugger': `You are an expert debugger helping students fix code. Provide:
- Identification of the error or issue
- Clear explanation of why it's happening
- Step-by-step solution
- Corrected code with comments
- Tips to avoid similar issues
- Related debugging strategies`,

  'json-formatter': `You are helpful with JSON formatting. Provide:
- Properly formatted JSON
- Explanation of the structure
- Validation notes if there are issues
- Tips for working with JSON`,

  'regex-helper': `You are a regex expert. Provide:
- The regex pattern clearly
- Explanation of each part
- Examples of what it matches
- Testing suggestions
- Common variations`,

  'sql-generator': `You are a database expert. Generate SQL that:
- Is syntactically correct
- Follows best practices
- Includes comments explaining the logic
- Is optimized for performance
- Handles edge cases appropriately`,

  'api-request-generator': `You are an API expert. Generate requests that:
- Use correct syntax and format
- Include necessary headers
- Have proper authentication placeholders
- Include example responses
- Follow REST best practices`,

  'markdown-formatter': `You are helpful with Markdown formatting. Provide:
- Properly formatted Markdown
- Explanation of the syntax used
- Preview of how it will render
- Tips for effective Markdown usage`,

  // AI Assistants
  'ask-ai': `You are a helpful, knowledgeable AI assistant for students. Provide responses that are:
- Clear and well-structured
- Accurate and factually correct
- Appropriate for the student's level
- Include examples when helpful
- Use markdown formatting for clarity
- If the question is ambiguous, ask for clarification rather than guessing
- Admit when you don't know something
- Encourage critical thinking and learning`,

  'brainstorming-assistant': `You are a creative thinking partner. Help brainstorm by:
- Generating diverse ideas
- Building on existing concepts
- Suggesting different perspectives
- Asking thought-provoking questions
- Organizing ideas logically
- Identifying promising directions`,

  'idea-generator': `You are an innovation expert. Generate ideas that are:
- Creative and original
- Relevant to the topic
- Feasible and practical
- Varied in approach
- Well-explained with context`,

  'decision-assistant': `You are a decision-making coach. Help with decisions by:
- Clarifying the decision to be made
- Identifying key factors
- Suggesting evaluation criteria
- Highlighting pros and cons
- Recommending a structured approach
- Being objective and balanced`,

  'research-assistant': `You are a research guide. Help with research by:
- Suggesting research questions
- Identifying key sources and types of information
- Recommending research methods
- Organizing findings logically
- Suggesting how to evaluate sources
- Providing research tips`,

  'personal-assistant': `You are a helpful personal assistant. Provide assistance that is:
- Practical and actionable
- Personalized to the request
- Well-organized and clear
- Includes relevant tips and suggestions
- Encouraging and supportive`,
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

function getDefaultDemoResponse(tool: string, input: string, options?: Record<string, string>): string {
  return `**AI Response for ${tool}:**\n\nBased on your input: "${input.slice(0, 100)}..."\n\nHere is a demo response showing how this tool would work with an AI API connected.\n\n---\n*Demo Mode: Connect an AI API key for real responses.*`;
}

// Detect if using Google Gemini API
function isGeminiAPI(apiUrl: string): boolean {
  return apiUrl.includes('generativelanguage.googleapis.com');
}

// Call Google Gemini API
async function callGeminiAPI(request: AIRequest): Promise<string> {
  const { apiKey, apiUrl } = getConfig();
  const systemPrompt = systemPrompts[request.tool] || 'You are a helpful AI assistant. Provide clear, well-structured responses using markdown formatting.';
  
  // Build the user message with options if provided
  let userContent = request.input;
  if (request.options && Object.keys(request.options).length > 0) {
    const optionsText = Object.entries(request.options)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');
    userContent = `${request.input}\n\nAdditional instructions: ${optionsText}`;
  }

  // Gemini API format
  const requestBody = {
    contents: [
      {
        role: 'user',
        parts: [{ text: userContent }]
      }
    ],
    systemInstruction: {
      parts: [{ text: systemPrompt }]
    },
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 2048,
    }
  };

  const response = await fetch(`${apiUrl}?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.error?.message || `API request failed with status ${response.status}`;
    
    // Provide user-friendly error messages
    if (response.status === 400) {
      throw new Error(`Invalid request: ${errorMessage}. Please check your input and try again.`);
    } else if (response.status === 401 || response.status === 403) {
      throw new Error('Authentication failed. Please check your API key in Settings.');
    } else if (response.status === 404) {
      throw new Error('Model not found. Please check your API configuration in Settings.');
    } else if (response.status === 429) {
      throw new Error('Rate limit exceeded. Please wait a moment and try again.');
    } else if (response.status >= 500) {
      throw new Error('Server error. Please try again in a few moments.');
    }
    
    throw new Error(errorMessage);
  }

  const data = await response.json();
  
  // Extract response text from Gemini format
  if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
    return data.candidates[0].content.parts[0].text;
  }
  
  throw new Error('Invalid response format from API');
}

// Call OpenAI-compatible API
async function callOpenAIAPI(request: AIRequest): Promise<string> {
  const { apiKey, apiUrl, model } = getConfig();
  const systemPrompt = systemPrompts[request.tool] || 'You are a helpful AI assistant. Provide clear, well-structured responses using markdown formatting.';
  
  const userMessage = request.options && Object.keys(request.options).length > 0
    ? `${request.input}\n\nAdditional instructions: ${Object.entries(request.options).map(([k, v]) => `${k}: ${v}`).join(', ')}`
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
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.error?.message || `API request failed with status ${response.status}`;
    
    if (response.status === 401) {
      throw new Error('Authentication failed. Please check your API key in Settings.');
    } else if (response.status === 429) {
      throw new Error('Rate limit exceeded. Please wait a moment and try again.');
    } else if (response.status >= 500) {
      throw new Error('Server error. Please try again in a few moments.');
    }
    
    throw new Error(errorMessage);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || 'No response generated';
}

// Main AI response function
export async function generateAIResponse(request: AIRequest): Promise<string> {
  const { apiKey, apiUrl } = getConfig();
  
  // Demo mode if no API key
  if (!apiKey) {
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));
    const handler = demoResponses[request.tool];
    if (handler) {
      return handler(request.input, request.options);
    }
    return getDefaultDemoResponse(request.tool, request.input, request.options);
  }

  try {
    // Route to appropriate API based on URL
    if (isGeminiAPI(apiUrl)) {
      return await callGeminiAPI(request);
    } else {
      return await callOpenAIAPI(request);
    }
  } catch (error) {
    // Re-throw with user-friendly message
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred. Please try again.');
  }
}

// Chat-specific function for Ask AI page
export async function generateChatResponse(
  messages: { role: string; content: string }[]
): Promise<string> {
  const { apiKey, apiUrl } = getConfig();
  
  if (!apiKey) {
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));
    const lastUserMsg = messages.filter(m => m.role === 'user').pop();
    const input = lastUserMsg?.content || '';
    return demoResponses['ask-ai'](input);
  }

  try {
    if (isGeminiAPI(apiUrl)) {
      // Convert to Gemini format
      const geminiMessages = messages.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }));

      const response = await fetch(`${apiUrl}?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: geminiMessages,
          systemInstruction: {
            parts: [{ text: systemPrompts['ask-ai'] }]
          },
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || 'API request failed');
      }

      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated';
    } else {
      // OpenAI format
      const { model } = getConfig();
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: 'system', content: systemPrompts['ask-ai'] },
            ...messages,
          ],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || 'API request failed');
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content || 'No response generated';
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred. Please try again.');
  }
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
