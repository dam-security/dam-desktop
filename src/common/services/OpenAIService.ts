interface OpenAIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface OpenAIResponse {
  choices: Array<{
    message: {
      role: 'assistant';
      content: string;
    };
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class OpenAIService {
  private static instance: OpenAIService;
  private apiKey: string;
  private baseURL: string = 'https://api.openai.com/v1/chat/completions';

  private constructor() {
    // Initialize with empty key - will be loaded when needed
    this.apiKey = '';
    this.loadAPIKey();
  }

  private async loadAPIKey() {
    try {
      console.log('Loading OpenAI API key...');
      
      // Check if electronAPI is available
      if (!(window as any).electronAPI) {
        console.error('electronAPI not available');
        return;
      }
      
      // Try to get stored API key first
      console.log('Attempting to get stored OpenAI API key...');
      const storedKey = await (window as any).electronAPI.getAPIKey('openai');
      console.log('Stored OpenAI key result:', storedKey ? `Found key (${storedKey.length} chars)` : 'No stored key');
      
      if (storedKey && storedKey.trim() && storedKey.length > 10) {
        this.apiKey = storedKey;
        console.log('Using stored OpenAI API key:', this.apiKey.substring(0, 10) + '...');
        return;
      }
      
      // Fallback to environment variable
      console.log('Checking OpenAI environment variable...');
      const envKey = (window as any).electronAPI?.env?.OPENAI_API_KEY;
      console.log('Environment OpenAI key result:', envKey ? 'Found env key' : 'No env key');
      
      if (envKey) {
        this.apiKey = envKey;
        console.log('Using environment OpenAI API key');
        return;
      }
      
      console.warn('OpenAI API key not found. Please configure it in Settings.');
    } catch (error) {
      console.error('Failed to load OpenAI API key:', error);
    }
  }

  public static getInstance(): OpenAIService {
    if (!OpenAIService.instance) {
      OpenAIService.instance = new OpenAIService();
    }
    return OpenAIService.instance;
  }

  public async refreshAPIKey(): Promise<void> {
    await this.loadAPIKey();
  }

  public async sendMessage(
    messages: OpenAIMessage[],
    model: string = 'gpt-3.5-turbo',
    maxTokens: number = 2000
  ): Promise<string> {
    try {
      // Ensure API key is loaded
      if (!this.apiKey) {
        await this.loadAPIKey();
      }
      
      if (!this.apiKey) {
        throw new Error('OpenAI API key not configured. Please add your API key in Settings.');
      }
      
      console.log('Sending message to OpenAI API');
      
      const requestBody = {
        model: model,
        messages: messages,
        max_tokens: maxTokens,
        temperature: 0.7
      };

      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenAI API error:', errorText);
        throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
      }

      const data: OpenAIResponse = await response.json();
      console.log('Received response from OpenAI API');
      
      return data.choices[0]?.message?.content || 'I apologize, but I encountered an issue generating a response.';
      
    } catch (error) {
      console.error('Failed to send message to OpenAI:', error);
      throw error;
    }
  }

  public async generateTrainingContent(
    topic: string,
    userProfile?: any
  ): Promise<string> {
    const systemPrompt = `You are a friendly, conversational AI trainer who makes learning fun and relevant. Create training content that feels like a helpful colleague is teaching you, not a textbook.

Your training content should be:
- Conversational and friendly in tone (use "you" and "we")
- Tailored specifically to the user's role and daily work
- Include relatable scenarios and examples from their field
- Break down complex concepts into digestible pieces
- Add encouragement and acknowledge common challenges
- Include practical tips they can use immediately

Format your response with clear sections using markdown:
- Use ## for main sections
- Use ### for subsections  
- Use bullet points for key takeaways
- Include real-world examples specific to their role
- Add "Try This Now" exercises throughout
- End with "Your Next Steps" action items

${userProfile?.role ? `The user works as a ${userProfile.role}, so tailor all examples and scenarios to their specific role and daily challenges.` : ''}
${userProfile?.name ? `Address the user by name occasionally (${userProfile.name}) to make it more personal.` : ''}`;

    const messages: OpenAIMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Create an engaging, conversational training module on: ${topic}. Make it feel like a friendly colleague is teaching me, with practical examples I can relate to and try immediately in my daily work.` }
    ];

    return await this.sendMessage(messages, 'gpt-3.5-turbo', 3000);
  }

  public async generatePersonalizedRecommendations(
    userProfile?: any,
    usageData?: any
  ): Promise<string> {
    const systemPrompt = `You are an AI productivity analyst creating personalized recommendations like Spotify Wrapped. Create engaging, data-driven insights and recommendations for AI tool usage.

Your response should be:
- Personalized and specific to the user
- Include interesting statistics and insights
- Provide actionable recommendations
- Be engaging and motivational
- Use specific numbers and percentages where possible

Format as markdown with sections for:
- Your AI Year in Review
- Top Achievements
- Usage Patterns
- Personalized Recommendations
- Goals for Next Period

${userProfile?.role ? `The user's role is: ${userProfile.role}` : ''}
${userProfile?.name ? `The user's name is: ${userProfile.name}` : ''}`;

    const messages: OpenAIMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Create a personalized AI usage report and recommendations based on: Role: ${userProfile?.role || 'General User'}, Experience Level: Intermediate, Primary Focus Areas: Productivity, Content Creation, Analysis` }
    ];

    return await this.sendMessage(messages, 'gpt-3.5-turbo', 3000);
  }

  public async generateAIToolCatalog(): Promise<any[]> {
    const systemPrompt = `You are an AI tools expert. Generate a comprehensive catalog of popular AI tools with detailed information.

For each tool provide:
- name: Tool name
- category: Primary category (e.g., "Writing", "Design", "Code", "Analytics", etc.)
- description: Brief description of what it does
- features: Array of key features
- pricing: Pricing model (e.g., "Free", "Freemium", "$20/month", etc.)
- url: Website URL
- tags: Array of tags like ["Recommended", "New", "Popular", "Free", "Enterprise"]
- useCase: Primary use case description

Return as a valid JSON array of objects.`;

    const messages: OpenAIMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: 'Generate a catalog of 20-25 popular AI tools across different categories including writing, design, coding, analytics, and productivity tools. Include a mix of free and paid tools with appropriate tags.' }
    ];

    try {
      const response = await this.sendMessage(messages, 'gpt-3.5-turbo', 4000);
      // Try to parse as JSON, fallback to predefined list if parsing fails
      try {
        return JSON.parse(response);
      } catch {
        // Fallback to predefined catalog if JSON parsing fails
        return this.getFallbackCatalog();
      }
    } catch (error) {
      console.error('Failed to generate AI tool catalog:', error);
      return this.getFallbackCatalog();
    }
  }

  private getFallbackCatalog(): any[] {
    return [
      {
        name: "ChatGPT",
        category: "Writing",
        description: "Advanced conversational AI for writing, coding, and analysis",
        features: ["Text generation", "Code assistance", "Analysis", "Creative writing"],
        pricing: "Freemium",
        url: "https://chat.openai.com",
        tags: ["Recommended", "Popular"],
        useCase: "General AI assistance and content creation"
      },
      {
        name: "Claude",
        category: "Writing",
        description: "AI assistant focused on helpful, harmless, and honest interactions",
        features: ["Long-form writing", "Analysis", "Code review", "Research"],
        pricing: "Freemium",
        url: "https://claude.ai",
        tags: ["Recommended", "New"],
        useCase: "In-depth analysis and professional writing"
      },
      {
        name: "Midjourney",
        category: "Design",
        description: "AI image generation for creative and artistic purposes",
        features: ["Image generation", "Artistic styles", "High quality", "Community"],
        pricing: "$10/month",
        url: "https://midjourney.com",
        tags: ["Popular", "Creative"],
        useCase: "Digital art and creative image generation"
      },
      {
        name: "GitHub Copilot",
        category: "Code",
        description: "AI pair programmer that helps you write code faster",
        features: ["Code completion", "Function generation", "Code explanation", "Multi-language"],
        pricing: "$10/month",
        url: "https://github.com/features/copilot",
        tags: ["Recommended", "Developer"],
        useCase: "Code assistance and development productivity"
      },
      {
        name: "Notion AI",
        category: "Productivity",
        description: "AI-powered writing and productivity features in Notion",
        features: ["Writing assistance", "Summarization", "Action items", "Brainstorming"],
        pricing: "$10/month",
        url: "https://notion.so/product/ai",
        tags: ["Productivity", "Integration"],
        useCase: "Enhanced note-taking and document creation"
      }
    ];
  }
}