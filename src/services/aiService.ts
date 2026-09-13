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
  'grammar-fixer': (input) => {
    return `**✅ Grammar Check Results:**\n\n**Original Text:**\n"${input}"\n\n**Corrected Version:**\n"${input.replace(/\bi\b/g, 'I').replace(/\s+/g, ' ').trim()}"\n\n**Corrections Made:**\n• Capitalized proper nouns and sentence beginnings\n• Fixed spacing issues\n• Ensured proper punctuation\n\n**Additional Suggestions:**\n• Consider using more varied sentence structures\n• Check for consistent tense usage\n• Verify subject-verb agreement throughout\n\n---\n*💡 Demo mode: Connect AI API for comprehensive grammar analysis.*`;
  },
  'bio-generator': (input, options) => {
    const tone = options?.tone || 'professional';
    return `**👤 Generated Bio:**\n\n**${tone.charAt(0).toUpperCase() + tone.slice(1)} Version:**\n\n"${input || 'A passionate individual'} with a strong commitment to excellence and continuous learning. Known for bringing creativity and dedication to every project, with a focus on making meaningful contributions to the field.\n\nDriven by curiosity and a desire to grow, always seeking new challenges and opportunities to expand knowledge and skills.\n\nWhen not working, enjoys exploring new ideas, connecting with like-minded people, and staying updated with the latest trends and developments."\n\n**Alternative Short Version:**\n"Dedicated professional passionate about innovation and growth. Committed to excellence and continuous learning."\n\n---\n*💡 Demo mode: Connect AI API for personalized bio generation.*`;
  },
  'paraphraser': (input, options) => {
    const style = options?.style || 'standard';
    return `**🔄 Paraphrased Text:**\n\n**Original:**\n"${input}"\n\n**Paraphrased (${style}):**\n"${input.split(' ').reverse().join(' ').replace(/\./g, '!')}"\n\n**Alternative Versions:**\n\n1. **Simplified:** "${input.toLowerCase()}"\n\n2. **Formal:** "${input.toUpperCase()}"\n\n3. **Creative:** "${input.split('').sort(() => Math.random() - 0.5).join('')}"\n\n**Key Changes:**\n• Restructured sentence patterns\n• Used synonyms where appropriate\n• Maintained original meaning\n• Adjusted tone to match requested style\n\n---\n*💡 Demo mode: Connect AI API for intelligent paraphrasing.*`;
  },
  'text-expander': (input) => {
    return `**📖 Expanded Text:**\n\n**Original:**\n"${input}"\n\n**Expanded Version:**\n\n"${input}\n\nTo elaborate further, this concept encompasses several important aspects that deserve careful consideration. The fundamental principles underlying this topic have been developed over time through extensive research and practical application.\n\nWhen we examine this more closely, we can identify multiple layers of meaning and significance. Each component contributes to a comprehensive understanding of the subject matter.\n\nFurthermore, the implications of this extend beyond the immediate context, influencing related areas and creating opportunities for deeper exploration. The interconnected nature of these ideas demonstrates the complexity and richness of the topic.\n\nIn practical terms, this knowledge can be applied in various scenarios, providing valuable insights and guiding decision-making processes. The versatility of these concepts makes them applicable across different domains and situations."\n\n**Expansion Details:**\n• Added contextual background\n• Included supporting details\n• Provided practical applications\n• Enhanced depth and clarity\n\n---\n*💡 Demo mode: Connect AI API for intelligent text expansion.*`;
  },
  'text-shortener': (input) => {
    const words = input.split(/\s+/);
    const shortened = words.slice(0, Math.ceil(words.length * 0.5)).join(' ');
    return `**✂️ Shortened Text:**\n\n**Original (${words.length} words):**\n"${input}"\n\n**Shortened (${Math.ceil(words.length * 0.5)} words):**\n"${shortened}..."\n\n**Ultra-Short Version:**\n"${words.slice(0, Math.ceil(words.length * 0.25)).join(' ')}..."\n\n**Key Points Retained:**\n• Main topic and subject\n• Core message\n• Essential context\n\n**Removed:**\n• Redundant phrases\n• Repetitive information\n• Non-essential details\n\n---\n*💡 Demo mode: Connect AI API for intelligent summarization.*`;
  },
  'flashcard-generator': (input) => {
    const topic = input || 'General Knowledge';
    return `**🃏 Flashcards: ${topic}**\n\n**Card 1:**\nQ: What is the fundamental concept of ${topic}?\nA: The basic principle that forms the foundation of understanding.\n\n**Card 2:**\nQ: Why is ${topic} important?\nA: It provides essential knowledge for practical application.\n\n**Card 3:**\nQ: How does ${topic} work?\nA: Through a systematic process of interaction and response.\n\n**Card 4:**\nQ: What are the key components of ${topic}?\nA: Multiple elements that work together to create the whole.\n\n**Card 5:**\nQ: When should you apply ${topic}?\nA: In situations requiring this specific knowledge or skill.\n\n**Card 6:**\nQ: What are common mistakes with ${topic}?\nA: Misunderstanding the basics or skipping foundational steps.\n\n**Card 7:**\nQ: How can you master ${topic}?\nA: Through consistent practice and application.\n\n**Card 8:**\nQ: What resources help learn ${topic}?\nA: Textbooks, practice exercises, and real-world application.\n\n---\n*💡 Demo mode: Connect AI API for topic-specific flashcards.*`;
  },
  'notes-summarizer': (input) => {
    return `**📋 Study Notes Summary:**\n\n**Main Topic:** ${input.slice(0, 50)}...\n\n**Key Concepts:**\n• Fundamental principles and definitions\n• Core theories and frameworks\n• Important relationships and connections\n\n**Essential Points:**\n1. Primary concept and its significance\n2. Supporting evidence and examples\n3. Practical applications\n4. Common misconceptions to avoid\n\n**Important Terms:**\n• Term 1: Brief definition\n• Term 2: Brief definition\n• Term 3: Brief definition\n\n**Formulas/Equations:**\n• Key formula 1\n• Key formula 2\n\n**Examples:**\n• Example 1: Brief description\n• Example 2: Brief description\n\n**Study Tips:**\n• Focus on understanding core concepts first\n• Practice with examples\n• Review regularly using spaced repetition\n\n---\n*💡 Demo mode: Connect AI API for intelligent note summarization.*`;
  },
  'assignment-helper': (input) => {
    return `**📚 Assignment Guidance:**\n\n**Understanding the Task:**\n"${input.slice(0, 100)}..."\n\n**Step-by-Step Approach:**\n\n**Step 1: Analyze Requirements**\n• Identify the main objectives\n• Note any specific constraints or guidelines\n• Determine the expected format and length\n\n**Step 2: Research Phase**\n• Gather relevant information from credible sources\n• Take organized notes\n• Identify key arguments or points\n\n**Step 3: Outline Creation**\n• Structure your main ideas\n• Organize supporting evidence\n• Plan the flow of your assignment\n\n**Step 4: Draft Writing**\n• Start with introduction\n• Develop body paragraphs\n• Write conclusion\n\n**Step 5: Review and Revise**\n• Check for clarity and coherence\n• Verify all requirements are met\n• Proofread for errors\n\n**Tips for Success:**\n• Start early to allow time for revisions\n• Use academic sources when appropriate\n• Follow the required citation style\n• Ask for clarification if needed\n\n---\n*💡 Demo mode: Connect AI API for personalized assignment help.*`;
  },
  'question-generator': (input) => {
    const topic = input || 'the topic';
    return `**🤔 Practice Questions: ${topic}**\n\n**Basic Level:**\n1. What is the definition of ${topic}?\n2. Who are the key figures associated with ${topic}?\n3. When was ${topic} first introduced?\n\n**Intermediate Level:**\n4. How does ${topic} relate to other concepts?\n5. What are the main components of ${topic}?\n6. Why is ${topic} significant in its field?\n\n**Advanced Level:**\n7. Analyze the impact of ${topic} on modern society.\n8. Compare and contrast different approaches to ${topic}.\n9. Evaluate the strengths and limitations of ${topic}.\n\n**Application Questions:**\n10. How would you apply ${topic} in a real-world scenario?\n11. Create an example demonstrating ${topic} in action.\n12. Design a solution using principles of ${topic}.\n\n**Answer Key:**\n1-3: Refer to basic definitions and historical context\n4-6: Focus on relationships and significance\n7-9: Require critical thinking and analysis\n10-12: Application and synthesis of knowledge\n\n---\n*💡 Demo mode: Connect AI API for topic-specific questions.*`;
  },
  'study-schedule': (input, options) => {
    const hours = options?.hours || '2 hours';
    return `**🗓️ Study Schedule:**\n\n**Subject:** ${input || 'General Studies'}\n**Daily Commitment:** ${hours}\n\n**Monday:**\n• 9:00-10:00: Review previous material\n• 10:00-11:00: Learn new concepts\n• 11:00-11:15: Break\n• 11:15-12:00: Practice exercises\n\n**Tuesday:**\n• 9:00-10:30: Deep dive into complex topics\n• 10:30-10:45: Break\n• 10:45-12:00: Problem-solving practice\n\n**Wednesday:**\n• 9:00-10:00: Review and consolidation\n• 10:00-11:30: Advanced concepts\n• 11:30-12:00: Self-assessment quiz\n\n**Thursday:**\n• 9:00-10:30: Application exercises\n• 10:30-10:45: Break\n• 10:45-12:00: Group study/collaboration\n\n**Friday:**\n• 9:00-10:00: Weekly review\n• 10:00-11:00: Address weak areas\n• 11:00-12:00: Practice test\n\n**Weekend:**\n• Saturday: Light review (1 hour)\n• Sunday: Rest or catch-up as needed\n\n**Study Techniques:**\n• Pomodoro: 25 min study, 5 min break\n• Active recall: Test yourself regularly\n• Spaced repetition: Review at increasing intervals\n\n---\n*💡 Demo mode: Connect AI API for personalized schedules.*`;
  },
  'todo-generator': (input) => {
    return `**☑️ Smart To-Do List:**\n\n**Project:** ${input || 'Daily Tasks'}\n\n**High Priority:**\n□ Complete main assignment\n□ Review important materials\n□ Submit required documents\n\n**Medium Priority:**\n□ Organize study notes\n□ Practice problem sets\n□ Read assigned chapters\n\n**Low Priority:**\n□ Update study schedule\n□ Clean workspace\n□ Backup important files\n\n**Time Estimates:**\n• High priority tasks: 2-3 hours\n• Medium priority tasks: 1-2 hours\n• Low priority tasks: 30-60 minutes\n\n**Dependencies:**\n• Task 2 depends on Task 1 completion\n• Task 5 requires Task 3 to be finished first\n\n**Completed:**\n✓ Plan the day\n✓ Gather necessary materials\n\n**Notes:**\n• Focus on high-priority items first\n• Take breaks between tasks\n• Review progress at end of day\n\n---\n*💡 Demo mode: Connect AI API for intelligent task generation.*`;
  },
  'meeting-summarizer': (input) => {
    return `**🤝 Meeting Summary:**\n\n**Meeting Topic:** ${input.slice(0, 50)}...\n\n**Key Decisions:**\n1. Decision 1: Approved the proposed timeline\n2. Decision 2: Allocated resources for Phase 2\n3. Decision 3: Scheduled follow-up meeting\n\n**Action Items:**\n• [Person A] - Complete report by Friday\n• [Person B] - Contact vendor for quotes\n• [Person C] - Update project documentation\n• [Team] - Review and provide feedback by EOW\n\n**Discussion Points:**\n• Project status and progress update\n• Budget considerations and constraints\n• Timeline adjustments and milestones\n• Risk assessment and mitigation strategies\n\n**Unresolved Issues:**\n• Final budget approval pending\n• Resource allocation needs clarification\n• Timeline for Phase 3 to be determined\n\n**Next Meeting:**\n• Date: To be scheduled\n• Focus: Address unresolved items\n• Required attendees: All team members\n\n**Key Takeaways:**\n• Project is on track with minor adjustments\n• Team alignment on priorities\n• Clear action items with owners and deadlines\n\n---\n*💡 Demo mode: Connect AI API for intelligent meeting summaries.*`;
  },
  'task-planner': (input) => {
    return `**📌 Task Plan:**\n\n**Project:** ${input || 'Project Plan'}\n\n**Phase 1: Planning (Week 1)**\n□ Define project scope and objectives\n□ Identify stakeholders and requirements\n□ Create initial timeline\n□ Allocate resources\n\n**Phase 2: Execution (Weeks 2-4)**\n□ Complete task 1: Research and analysis\n□ Complete task 2: Design and planning\n□ Complete task 3: Implementation\n□ Weekly progress reviews\n\n**Phase 3: Testing (Week 5)**\n□ Conduct quality assurance\n□ User acceptance testing\n□ Bug fixes and adjustments\n□ Documentation updates\n\n**Phase 4: Deployment (Week 6)**\n□ Final review and approval\n□ Launch/deployment\n□ Post-launch monitoring\n□ Project retrospective\n\n**Milestones:**\n• Week 1: Planning complete\n• Week 4: Execution complete\n• Week 5: Testing complete\n• Week 6: Project delivered\n\n**Dependencies:**\n• Task 2 requires Task 1 completion\n• Testing cannot start until execution is done\n• Deployment requires all testing to pass\n\n**Risk Mitigation:**\n• Buffer time built into schedule\n• Regular check-ins to catch issues early\n• Contingency plan for delays\n\n---\n*💡 Demo mode: Connect AI API for detailed task planning.*`;
  },
  'daily-planner': (input) => {
    return `**🌅 Daily Plan:**\n\n**Date:** Today\n**Focus:** ${input || 'Productive Day'}\n\n**Morning (6:00 AM - 12:00 PM):**\n• 6:00-6:30: Wake up routine\n• 6:30-7:00: Exercise/meditation\n• 7:00-8:00: Breakfast and prep\n• 8:00-10:00: Deep work session 1\n• 10:00-10:15: Break\n• 10:15-12:00: Deep work session 2\n\n**Afternoon (12:00 PM - 6:00 PM):**\n• 12:00-1:00: Lunch break\n• 1:00-3:00: Meetings/collaboration\n• 3:00-3:15: Break\n• 3:15-5:00: Focused work\n• 5:00-6:00: Admin tasks and planning\n\n**Evening (6:00 PM - 10:00 PM):**\n• 6:00-7:00: Dinner\n• 7:00-8:30: Personal time/hobbies\n• 8:30-9:30: Light review/reading\n• 9:30-10:00: Wind down routine\n\n**Top 3 Priorities:**\n1. Complete most important task\n2. Attend key meetings\n3. Review and plan for tomorrow\n\n**Self-Care:**\n• Stay hydrated\n• Take regular breaks\n• Get 7-8 hours of sleep\n\n---\n*💡 Demo mode: Connect AI API for personalized daily plans.*`;
  },
  'goal-generator': (input) => {
    return `**🎯 SMART Goals:**\n\n**Goal Area:** ${input || 'Personal Development'}\n\n**Goal 1: Specific**\n• What: Improve skills in [specific area]\n• Why: To advance career and personal growth\n• How: Through structured learning and practice\n\n**Goal 2: Measurable**\n• Metric: Complete 3 courses/certifications\n• Tracking: Weekly progress reviews\n• Target: 80% completion rate\n\n**Goal 3: Achievable**\n• Resources needed: Time, materials, support\n• Current capabilities: Foundation knowledge\n• Stretch factor: Challenging but realistic\n\n**Goal 4: Relevant**\n• Alignment: Matches long-term objectives\n• Impact: Contributes to overall growth\n• Priority: High importance\n\n**Goal 5: Time-bound**\n• Deadline: 3 months from start\n• Milestones: Monthly checkpoints\n• Review: Weekly progress assessment\n\n**Action Steps:**\n1. Research and select appropriate courses\n2. Create study schedule\n3. Set up tracking system\n4. Begin first module\n5. Review and adjust as needed\n\n**Success Criteria:**\n• All courses completed\n• Skills demonstrated in practice\n• Positive feedback received\n• Personal satisfaction achieved\n\n---\n*💡 Demo mode: Connect AI API for personalized goal setting.*`;
  },
  'decision-helper': (input) => {
    return `**⚖️ Decision Analysis:**\n\n**Decision:** ${input.slice(0, 100)}...\n\n**Option A:**\n✅ Pros:\n• Lower risk\n• Proven approach\n• Immediate results\n\n❌ Cons:\n• Limited growth potential\n• May not be innovative\n• Could miss opportunities\n\n**Option B:**\n✅ Pros:\n• Higher potential reward\n• Innovative approach\n• Long-term benefits\n\n❌ Cons:\n• Higher risk\n• Requires more resources\n• Longer timeline\n\n**Key Factors to Consider:**\n1. Risk tolerance\n2. Available resources\n3. Time constraints\n4. Long-term impact\n5. Stakeholder expectations\n\n**Recommendation Framework:**\n• If risk-averse → Choose Option A\n• If growth-focused → Choose Option B\n• If balanced → Consider hybrid approach\n\n**Questions to Ask:**\n• What's the worst-case scenario?\n• How reversible is the decision?\n• What do stakeholders prefer?\n• What does data suggest?\n\n**Next Steps:**\n1. Gather more information if needed\n2. Consult with key stakeholders\n3. Make decision within timeline\n4. Plan for implementation\n5. Set up review checkpoints\n\n---\n*💡 Demo mode: Connect AI API for detailed decision analysis.*`;
  },
  'time-planner': (input) => {
    return `**⏰ Time Allocation Plan:**\n\n**Tasks:** ${input || 'Daily Tasks'}\n\n**Time Distribution:**\n\n**High-Priority Tasks (50% of time):**\n• Task 1: 2 hours\n• Task 2: 1.5 hours\n• Task 3: 1 hour\n\n**Medium-Priority Tasks (30% of time):**\n• Task 4: 1 hour\n• Task 5: 45 minutes\n• Task 6: 45 minutes\n\n**Low-Priority Tasks (20% of time):**\n• Task 7: 30 minutes\n• Task 8: 30 minutes\n• Task 9: 30 minutes\n\n**Buffer Time:**\n• 15 minutes between major tasks\n• 30 minutes for unexpected issues\n• Total buffer: 1 hour\n\n**Optimization Tips:**\n• Tackle hardest tasks when energy is highest\n• Group similar tasks together\n• Use time blocks for focused work\n• Schedule breaks strategically\n\n**Time-Saving Strategies:**\n• Batch similar tasks\n• Eliminate distractions during focus time\n• Use templates for repetitive work\n• Delegate when possible\n\n**Daily Schedule:**\n• Morning: High-priority tasks\n• Afternoon: Medium-priority tasks\n• Evening: Low-priority tasks and planning\n\n---\n*💡 Demo mode: Connect AI API for intelligent time planning.*`;
  },
  'unit-converter': (input) => {
    return `**📐 Unit Conversion:**\n\n**Input:** ${input}\n\n**Common Conversions:**\n\n**Length:**\n• 1 meter = 3.281 feet\n• 1 kilometer = 0.621 miles\n• 1 inch = 2.54 centimeters\n\n**Weight:**\n• 1 kilogram = 2.205 pounds\n• 1 gram = 0.035 ounces\n• 1 ton = 2000 pounds\n\n**Volume:**\n• 1 liter = 0.264 gallons\n• 1 milliliter = 0.034 fluid ounces\n• 1 cup = 236.588 milliliters\n\n**Temperature:**\n• °C to °F: (°C × 9/5) + 32\n• °F to °C: (°F - 32) × 5/9\n\n**Area:**\n• 1 square meter = 10.764 square feet\n• 1 acre = 43,560 square feet\n\n**Speed:**\n• 1 m/s = 2.237 mph\n• 1 km/h = 0.621 mph\n\n**Formula Used:**\nBased on standard conversion factors\n\n---\n*💡 Demo mode: Connect AI API for precise conversions.*`;
  },
  'percentage-calc': (input) => {
    return `**📊 Percentage Calculation:**\n\n**Input:** ${input}\n\n**Common Calculations:**\n\n**Finding Percentage:**\n• Formula: (Part ÷ Whole) × 100\n• Example: (25 ÷ 100) × 100 = 25%\n\n**Finding Part:**\n• Formula: (Percentage ÷ 100) × Whole\n• Example: (25 ÷ 100) × 200 = 50\n\n**Finding Whole:**\n• Formula: Part ÷ (Percentage ÷ 100)\n• Example: 50 ÷ (25 ÷ 100) = 200\n\n**Percentage Change:**\n• Formula: ((New - Old) ÷ Old) × 100\n• Example: ((150 - 100) ÷ 100) × 100 = 50% increase\n\n**Percentage of Percentage:**\n• Formula: (P1 ÷ 100) × (P2 ÷ 100) × 100\n• Example: 20% of 50% = 10%\n\n**Real-World Examples:**\n• Discount: 20% off $100 = $20 savings\n• Tax: 8% of $50 = $4 tax\n• Tip: 15% of $40 = $6 tip\n\n---\n*💡 Demo mode: Connect AI API for complex calculations.*`;
  },
  'age-calculator': (input) => {
    const today = new Date();
    return `**🎂 Age Calculation:**\n\n**Input:** ${input}\n\n**Calculation:**\nBased on the provided date of birth\n\n**Results:**\n• Age in years: [Calculated based on input]\n• Age in months: [Years × 12]\n• Age in weeks: [Years × 52]\n• Age in days: [Years × 365]\n\n**Next Birthday:**\n• Days until next birthday: [Calculated]\n• Day of week: [Calculated]\n\n**Fun Facts:**\n• You've lived approximately [X] weekends\n• You've experienced [X] leap years\n• Your birthday falls on [day] this year\n\n**Zodiac Sign:**\nBased on birth date\n\n**Generation:**\nBased on birth year\n\n**Calculation Method:**\nSubtract birth date from current date\nAccount for leap years\nCalculate precise age\n\n---\n*💡 Demo mode: Enter a date for accurate calculation.*`;
  },
  'bmi-calculator': (input) => {
    return `**⚖️ BMI Calculation:**\n\n**Input:** ${input}\n\n**Formula:**\nBMI = weight (kg) ÷ height² (m²)\n\n**BMI Categories:**\n• Underweight: BMI < 18.5\n• Normal weight: BMI 18.5-24.9\n• Overweight: BMI 25-29.9\n• Obese: BMI ≥ 30\n\n**Example Calculation:**\n• Weight: 70 kg\n• Height: 1.75 m\n• BMI: 70 ÷ (1.75)² = 22.86\n• Category: Normal weight\n\n**Health Context:**\nBMI is a screening tool, not a diagnostic tool. It provides a general indication of body composition but doesn't account for:\n• Muscle mass\n• Bone density\n• Age and gender differences\n• Ethnic variations\n\n**Recommendations:**\n• Consult healthcare professionals for comprehensive assessment\n• Consider other health metrics\n• Focus on overall wellness, not just numbers\n\n**Note:**\nThis is a general guideline. Individual health varies.\n\n---\n*💡 Demo mode: Enter weight and height for calculation.*`;
  },
  'currency-converter': (input) => {
    return `**💱 Currency Information:**\n\n**Input:** ${input}\n\n**Note:** Exchange rates fluctuate constantly. The rates shown are examples and may not reflect current market rates.\n\n**Common Currency Pairs:**\n• USD to EUR: ~0.85 (example rate)\n• USD to GBP: ~0.73 (example rate)\n• USD to JPY: ~110 (example rate)\n• EUR to GBP: ~0.86 (example rate)\n\n**Major Currencies:**\n• USD - US Dollar\n• EUR - Euro\n• GBP - British Pound\n• JPY - Japanese Yen\n• CNY - Chinese Yuan\n• INR - Indian Rupee\n\n**For Accurate Rates:**\n• Check financial websites (XE, OANDA)\n• Use your bank's exchange rates\n• Consider transaction fees\n• Rates change throughout the day\n\n**Tips:**\n• Compare rates from multiple sources\n• Be aware of conversion fees\n• Consider timing for large conversions\n• Use official rates for business transactions\n\n---\n*💡 Demo mode: Connect to live exchange rate API for real-time conversion.*`;
  },
  'date-calculator': (input) => {
    const today = new Date();
    return `**📆 Date Calculation:**\n\n**Input:** ${input}\n\n**Today's Date:** ${today.toLocaleDateString()}\n\n**Common Calculations:**\n\n**Days Between Dates:**\n• Enter start and end dates\n• Calculate exact number of days\n• Account for leap years\n\n**Add/Subtract Days:**\n• Add X days to a date\n• Subtract X days from a date\n• Calculate future/past dates\n\n**Business Days:**\n• Exclude weekends\n• Exclude holidays (if specified)\n• Calculate working days only\n\n**Example:**\n• Start: January 1, 2024\n• Add: 30 days\n• Result: January 31, 2024\n\n**Time Periods:**\n• Weeks: Divide days by 7\n• Months: Approximate (30.44 days)\n• Years: Approximate (365.25 days)\n\n**Day of Week:**\nCalculate what day any date falls on\n\n---\n*💡 Demo mode: Enter specific dates for accurate calculation.*`;
  },
  'timezone-converter': (input) => {
    return `**🌍 Time Zone Conversion:**\n\n**Input:** ${input}\n\n**Common Time Zones:**\n• UTC/GMT: Coordinated Universal Time\n• EST: Eastern Standard Time (UTC-5)\n• PST: Pacific Standard Time (UTC-8)\n• CST: Central Standard Time (UTC-6)\n• CET: Central European Time (UTC+1)\n• IST: Indian Standard Time (UTC+5:30)\n• JST: Japan Standard Time (UTC+9)\n• AEST: Australian Eastern Time (UTC+10)\n\n**Conversion Examples:**\n• 12:00 PM EST = 5:00 PM GMT\n• 9:00 AM PST = 12:00 PM EST\n• 3:00 PM CET = 9:00 AM EST\n\n**Daylight Saving Time:**\n• Many regions observe DST\n• Clocks spring forward 1 hour in spring\n• Clocks fall back 1 hour in fall\n• Not all regions observe DST\n\n**Tips for Scheduling:**\n• Use online converters for accuracy\n• Consider business hours in both zones\n• Be mindful of date changes\n• Confirm time zone abbreviations\n\n**Tools:**\n• World Clock apps\n• Online timezone converters\n• Calendar apps with timezone support\n\n---\n*💡 Demo mode: Enter specific times for conversion.*`;
  },
  'code-debugger': (input) => {
    return `**🐛 Code Debugging Analysis:**\n\n**Code:**\n\`\`\`\n${input.slice(0, 200)}${input.length > 200 ? '...' : ''}\n\`\`\`\n\n**Potential Issues:**\n\n1. **Syntax Errors:**\n   • Check for missing semicolons\n   • Verify matching brackets/parentheses\n   • Ensure proper string quotes\n\n2. **Logic Errors:**\n   • Review conditional statements\n   • Check loop boundaries\n   • Verify variable assignments\n\n3. **Runtime Errors:**\n   • Check for null/undefined values\n   • Verify array bounds\n   • Ensure proper type handling\n\n4. **Common Mistakes:**\n   • Off-by-one errors in loops\n   • Incorrect comparison operators\n   • Missing return statements\n   • Uninitialized variables\n\n**Debugging Steps:**\n1. Read error messages carefully\n2. Check the line number indicated\n3. Add console.log statements\n4. Use debugger/breakpoints\n5. Test with different inputs\n\n**Suggestions:**\n• Break complex logic into smaller functions\n• Add error handling\n• Use meaningful variable names\n• Write tests for edge cases\n\n---\n*💡 Demo mode: Connect AI API for detailed code analysis.*`;
  },
  'json-formatter': (input) => {
    try {
      const parsed = JSON.parse(input);
      const formatted = JSON.stringify(parsed, null, 2);
      return `**📋 JSON Formatter:**\n\n**Formatted JSON:**\n\`\`\`json\n${formatted}\n\`\`\`\n\n**Validation:** ✅ Valid JSON\n\n**Structure:**\n• Type: ${Array.isArray(parsed) ? 'Array' : typeof parsed}\n• ${Array.isArray(parsed) ? `Items: ${parsed.length}` : `Keys: ${Object.keys(parsed).length}`}\n\n**Tips:**\n• Use consistent indentation\n• Validate before parsing\n• Handle errors gracefully\n• Consider using JSON linters\n\n---\n*💡 Demo mode: Shows basic formatting. Connect AI API for validation and optimization.*`;
    } catch (e) {
      return `**📋 JSON Formatter:**\n\n**Error:** Invalid JSON format\n\n**Issue:** ${e instanceof Error ? e.message : 'Unknown error'}\n\n**Common Issues:**\n• Missing quotes around keys\n• Trailing commas\n• Single quotes instead of double quotes\n• Unescaped characters\n\n**Tips:**\n• Use a JSON validator\n• Check for syntax errors\n• Ensure proper escaping\n\n---\n*💡 Demo mode: Connect AI API for detailed JSON analysis.*`;
    }
  },
  'regex-helper': (input) => {
    return `**🔤 Regex Helper:**\n\n**Pattern Request:** ${input}\n\n**Suggested Regex:**\n\`\`\`\n/[a-zA-Z0-9]+/g\n\`\`\`\n\n**Explanation:**\n• [a-zA-Z0-9] - Match alphanumeric characters\n• + - One or more occurrences\n• g - Global flag (find all matches)\n\n**Common Patterns:**\n\n**Email:**\n\`/^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$/\`\n\n**Phone:**\n\`/\\(?\\d{3}\\)?[-.\\s]?\\d{3}[-.\\s]?\\d{4}/\`\n\n**URL:**\n\`/https?:\\/\\/[\\w\\-]+(\\.[\\w\\-]+)+[\\w\\-.,@?^=%&:/~+#]*$/\`\n\n**Testing:**\n• Use regex101.com for testing\n• Check edge cases\n• Consider performance\n• Test with various inputs\n\n**Tips:**\n• Start simple, then add complexity\n• Use character classes\n• Escape special characters\n• Comment complex patterns\n\n---\n*💡 Demo mode: Connect AI API for pattern-specific regex.*`;
  },
  'sql-generator': (input) => {
    return `**🗄️ SQL Query:**\n\n**Request:** ${input}\n\n**Generated SQL:**\n\`\`\`sql\nSELECT * \nFROM table_name\nWHERE condition = 'value'\nORDER BY column_name ASC\nLIMIT 10;\n\`\`\`\n\n**Query Breakdown:**\n• SELECT - Columns to retrieve\n• FROM - Table to query\n• WHERE - Filter conditions\n• ORDER BY - Sort results\n• LIMIT - Restrict number of rows\n\n**Common Queries:**\n\n**Insert:**\n\`INSERT INTO table (col1, col2) VALUES ('val1', 'val2');\`\n\n**Update:**\n\`UPDATE table SET col1 = 'val1' WHERE id = 1;\`\n\n**Delete:**\n\`DELETE FROM table WHERE id = 1;\`\n\n**Best Practices:**\n• Use specific column names instead of *\n• Index frequently queried columns\n• Use parameterized queries\n• Test with EXPLAIN for performance\n\n---\n*💡 Demo mode: Connect AI API for complex query generation.*`;
  },
  'api-generator': (input) => {
    return `**🔌 API Request Example:**\n\n**Request:** ${input}\n\n**cURL:**\n\`\`\`bash\ncurl -X GET 'https://api.example.com/endpoint' \\\n  -H 'Content-Type: application/json' \\\n  -H 'Authorization: Bearer YOUR_TOKEN'\n\`\`\`\n\n**JavaScript (Fetch):**\n\`\`\`javascript\nconst response = await fetch('https://api.example.com/endpoint', {\n  method: 'GET',\n  headers: {\n    'Content-Type': 'application/json',\n    'Authorization': 'Bearer YOUR_TOKEN'\n  }\n});\nconst data = await response.json();\n\`\`\`\n\n**Python (Requests):**\n\`\`\`python\nimport requests\n\nresponse = requests.get(\n    'https://api.example.com/endpoint',\n    headers={\n        'Content-Type': 'application/json',\n        'Authorization': 'Bearer YOUR_TOKEN'\n    }\n)\ndata = response.json()\n\`\`\`\n\n**Common HTTP Methods:**\n• GET - Retrieve data\n• POST - Create new resource\n• PUT - Update existing resource\n• DELETE - Remove resource\n\n**Best Practices:**\n• Handle errors appropriately\n• Use authentication\n• Validate responses\n• Implement retry logic\n\n---\n*💡 Demo mode: Connect AI API for endpoint-specific requests.*`;
  },
  'markdown-formatter': (input) => {
    return `**📄 Markdown Formatter:**\n\n**Formatted Output:**\n\n${input}\n\n**Markdown Syntax Used:**\n• Headers: # H1, ## H2, ### H3\n• Bold: **text**\n• Italic: *text*\n• Lists: - item or 1. item\n• Links: [text](url)\n• Code: \`code\` or \`\`\`code block\`\`\`\n• Images: ![alt](url)\n\n**Preview:**\nThe above shows how your markdown will render\n\n**Tips:**\n• Use consistent heading levels\n• Add blank lines between elements\n• Escape special characters with \\\n• Use code blocks for multi-line code\n\n**Common Patterns:**\n• README files\n• Documentation\n• Blog posts\n• Notes\n\n---\n*💡 Demo mode: Shows basic formatting. Connect AI API for advanced markdown optimization.*`;
  },
  'brainstorming': (input, options) => {
    const topic = input || 'the topic';
    return `**🧩 Brainstorming Session:**\n\n**Topic:** ${topic}\n\n**Idea Cluster 1: Core Concepts**\n💡 Idea 1: Fundamental approach to ${topic}\n💡 Idea 2: Alternative perspective on ${topic}\n💡 Idea 3: Innovative twist on traditional methods\n\n**Idea Cluster 2: Applications**\n💡 Idea 4: Practical application in daily life\n💡 Idea 5: Educational use case\n💡 Idea 6: Professional/business application\n\n**Idea Cluster 3: Creative Variations**\n💡 Idea 7: Gamified version of ${topic}\n💡 Idea 8: Visual/interactive approach\n💡 Idea 9: Collaborative/social element\n\n**Idea Cluster 4: Future Possibilities**\n💡 Idea 10: Technology-enhanced version\n💡 Idea 11: AI-powered adaptation\n💡 Idea 12: Scalable solution\n\n**Mind Map Connections:**\n• ${topic} → Learning → Engagement\n• ${topic} → Practice → Mastery\n• ${topic} → Innovation → Growth\n\n**Next Steps:**\n1. Evaluate feasibility of each idea\n2. Identify resources needed\n3. Prioritize based on impact\n4. Create action plan\n\n---\n*💡 Demo mode: Connect AI API for topic-specific brainstorming.*`;
  },
  'idea-generator': (input, options) => {
    const topic = input || 'general';
    const category = options?.category || 'creative';
    return `**💭 Idea Generation:**\n\n**Topic:** ${topic}\n**Category:** ${category}\n\n**Top 10 Ideas:**\n\n1. **Innovative Approach:** A fresh take on ${topic} that combines traditional methods with modern technology\n\n2. **Community-Focused:** Build a community around ${topic} with shared goals and collaborative learning\n\n3. **Gamification:** Turn ${topic} into an engaging game with points, levels, and achievements\n\n4. **Visual Learning:** Create infographics, videos, or interactive diagrams for ${topic}\n\n5. **Peer Teaching:** Develop a system where learners teach each other about ${topic}\n\n6. **Real-World Application:** Connect ${topic} to practical, everyday scenarios\n\n7. **Micro-Learning:** Break ${topic} into bite-sized, digestible chunks\n\n8. **Storytelling:** Use narratives and case studies to illustrate ${topic}\n\n9. **Challenge-Based:** Create progressive challenges that build mastery of ${topic}\n\n10. **Cross-Disciplinary:** Connect ${topic} to other fields for broader understanding\n\n**Evaluation Criteria:**\n• Feasibility: Can it be implemented?\n• Impact: How much value does it create?\n• Resources: What's needed to execute?\n• Timeline: How long to implement?\n\n**Recommended Next Steps:**\n1. Select top 3 ideas\n2. Create detailed plans\n3. Identify potential obstacles\n4. Set measurable goals\n\n---\n*💡 Demo mode: Connect AI API for tailored idea generation.*`;
  },
  'decision-assistant': (input) => {
    return `**🎲 Decision Support:**\n\n**Decision:** ${input.slice(0, 100)}...\n\n**Structured Analysis:**\n\n**Step 1: Define the Decision**\n• What exactly needs to be decided?\n• What are the constraints?\n• What's the timeline?\n\n**Step 2: Identify Options**\n• Option A: [First alternative]\n• Option B: [Second alternative]\n• Option C: [Third alternative]\n\n**Step 3: Evaluate Each Option**\n\n**Option A:**\n✓ Advantages: [List pros]\n✗ Disadvantages: [List cons]\n⚠ Risks: [Potential issues]\n\n**Option B:**\n✓ Advantages: [List pros]\n✗ Disadvantages: [List cons]\n⚠ Risks: [Potential issues]\n\n**Option C:**\n✓ Advantages: [List pros]\n✗ Disadvantages: [List cons]\n⚠ Risks: [Potential issues]\n\n**Step 4: Decision Matrix**\n| Criteria | Option A | Option B | Option C |\n|----------|----------|----------|----------|\n| Cost     |    ?     |    ?     |    ?     |\n| Time     |    ?     |    ?     |    ?     |\n| Impact   |    ?     |    ?     |    ?     |\n\n**Step 5: Recommendation**\nBased on the analysis, consider:\n• Which option aligns with your goals?\n• Which has the best risk/reward ratio?\n• Which is most feasible given constraints?\n\n**Decision Framework:**\n1. Gather all relevant information\n2. Consult stakeholders if needed\n3. Make the decision\n4. Create implementation plan\n5. Set review checkpoints\n\n---\n*💡 Demo mode: Connect AI API for detailed decision analysis.*`;
  },
  'research-assistant': (input) => {
    return `**🔬 Research Guidance:**\n\n**Research Topic:** ${input}\n\n**Research Questions:**\n1. What is the current understanding of ${input}?\n2. What are the key debates or controversies?\n3. What gaps exist in current knowledge?\n4. What methodologies are most appropriate?\n5. What are the practical implications?\n\n**Source Types to Consider:**\n• Academic journals (peer-reviewed)\n• Books and monographs\n• Conference proceedings\n• Government reports\n• Industry publications\n• Reputable websites\n\n**Research Strategy:**\n\n**Phase 1: Exploration**\n• Start with overview sources\n• Identify key terms and concepts\n• Map the landscape of the topic\n\n**Phase 2: Deep Dive**\n• Read primary sources\n• Analyze different perspectives\n• Take detailed notes\n\n**Phase 3: Synthesis**\n• Identify patterns and themes\n• Compare different viewpoints\n• Form your own analysis\n\n**Evaluation Criteria:**\n• Authority: Who is the author?\n• Accuracy: Is information verified?\n• Currency: How recent is it?\n• Relevance: Does it address your question?\n• Purpose: What's the author's intent?\n\n**Organization Tips:**\n• Use citation management tools\n• Keep detailed notes with sources\n• Create an outline early\n• Track your research process\n\n**Next Steps:**\n1. Refine research questions\n2. Create source list\n3. Begin systematic reading\n4. Take organized notes\n5. Start drafting\n\n---\n*💡 Demo mode: Connect AI API for topic-specific research guidance.*`;
  },
  'personal-assistant': (input) => {
    return `**🤖 Personal Assistant:**\n\n**Request:** ${input}\n\n**Here's how I can help:**\n\n**Organization:**\n• Create structured to-do lists\n• Prioritize tasks by importance\n• Set reminders and deadlines\n• Organize files and documents\n\n**Planning:**\n• Break down large projects\n• Create timelines and schedules\n• Identify dependencies\n• Set milestones\n\n**Productivity:**\n• Suggest time management techniques\n• Recommend focus strategies\n• Help eliminate distractions\n• Track progress\n\n**Communication:**\n• Draft emails and messages\n• Prepare for meetings\n• Create presentations\n• Organize information\n\n**Learning:**\n• Create study plans\n• Generate practice questions\n• Summarize information\n• Track learning progress\n\n**Specific to Your Request:**\nBased on "${input.slice(0, 100)}...", I recommend:\n\n1. **Immediate Action:** [First step]\n2. **Short-term Goal:** [Next milestone]\n3. **Long-term Vision:** [Overall objective]\n\n**Tips:**\n• Start with the most important task\n• Break complex tasks into smaller steps\n• Review and adjust regularly\n• Celebrate progress\n\n**Would you like me to:**\n• Create a detailed plan?\n• Set up a schedule?\n• Generate a checklist?\n• Provide more specific guidance?\n\n---\n*💡 Demo mode: Connect AI API for personalized assistance.*`;
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
