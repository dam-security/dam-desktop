interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ClaudeResponse {
  content: Array<{
    type: 'text';
    text: string;
  }>;
  id: string;
  model: string;
  role: 'assistant';
  stop_reason: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

export class ClaudeAPIService {
  private static instance: ClaudeAPIService;
  private apiKey: string;
  private baseURL: string = 'https://api.anthropic.com/v1/messages';

  private constructor() {
    // Initialize with empty key - will be loaded when needed
    this.apiKey = '';
    this.loadAPIKey();
  }

  private async loadAPIKey() {
    try {
      console.log('Loading Claude API key...');
      
      // Check if electronAPI is available
      if (!(window as any).electronAPI) {
        console.error('electronAPI not available');
        return;
      }
      
      // Try to get stored API key first
      console.log('Attempting to get stored API key...');
      const storedKey = await (window as any).electronAPI.getAPIKey('claude');
      console.log('Stored key result:', storedKey ? `Found key (${storedKey.length} chars)` : 'No stored key');
      
      if (storedKey && storedKey.trim() && storedKey.length > 10) {
        this.apiKey = storedKey;
        console.log('Using stored API key:', this.apiKey.substring(0, 10) + '...');
        return;
      }
      
      // Fallback to environment variable
      console.log('Checking environment variable...');
      const envKey = (window as any).electronAPI?.env?.CLAUDE_API_KEY;
      console.log('Environment key result:', envKey ? 'Found env key' : 'No env key');
      
      if (envKey) {
        this.apiKey = envKey;
        console.log('Using environment API key');
        return;
      }
      
      console.warn('Claude API key not found. Please configure it in Settings.');
    } catch (error) {
      console.error('Failed to load Claude API key:', error);
    }
  }

  public static getInstance(): ClaudeAPIService {
    if (!ClaudeAPIService.instance) {
      ClaudeAPIService.instance = new ClaudeAPIService();
    }
    return ClaudeAPIService.instance;
  }

  public async refreshAPIKey(): Promise<void> {
    await this.loadAPIKey();
  }

  public async sendMessage(
    messages: ClaudeMessage[],
    systemPrompt?: string
  ): Promise<string> {
    try {
      // Ensure API key is loaded
      if (!this.apiKey) {
        console.log('API key not found, loading...');
        await this.loadAPIKey();
      }
      
      if (!this.apiKey) {
        console.error('Claude API key not configured after loading attempt');
        throw new Error('Claude API key not configured. Please add your API key in Settings.');
      }
      
      console.log('Sending message to Claude API with key:', this.apiKey.substring(0, 10) + '...');
      
      const requestBody = {
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        messages: messages,
        ...(systemPrompt && { system: systemPrompt })
      };

      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Claude API error:', errorText);
        throw new Error(`Claude API error: ${response.status} - ${errorText}`);
      }

      const data: ClaudeResponse = await response.json();
      console.log('Received response from Claude API');
      
      return data.content[0]?.text || 'I apologize, but I encountered an issue generating a response.';
      
    } catch (error) {
      console.error('Failed to send message to Claude:', error);
      throw error;
    }
  }

  public async generateDamResponse(
    userMessage: string,
    chatHistory: ClaudeMessage[] = [],
    userProfile?: any
  ): Promise<string> {
    const systemPrompt = `You are Dam, an AI assistant that helps users become more effective with AI tools. You are knowledgeable, helpful, and focused on practical AI productivity advice.

Key capabilities:
- Recommend the best AI tools for specific tasks
- Improve prompts to get better results
- Provide training on AI tool usage
- Help automate workflows with AI
- Explain AI concepts in simple terms

Your responses should be:
- Practical and actionable
- Focused on productivity and efficiency
- Friendly but professional
- Specific to the user's needs and role

${userProfile?.role ? `The user's role is: ${userProfile.role}` : ''}
${userProfile?.name ? `The user's name is: ${userProfile.name}` : ''}

Always format your responses with clear structure using markdown when appropriate for headers, lists, and emphasis.`;

    const messages: ClaudeMessage[] = [
      ...chatHistory,
      { role: 'user', content: userMessage }
    ];

    return await this.sendMessage(messages, systemPrompt);
  }
}