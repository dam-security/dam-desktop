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
    // Get API key from exposed environment variables
    this.apiKey = (window as any).electronAPI?.env?.CLAUDE_API_KEY || '';
    if (!this.apiKey) {
      console.warn('Claude API key not found. Please set CLAUDE_API_KEY environment variable.');
    }
  }

  public static getInstance(): ClaudeAPIService {
    if (!ClaudeAPIService.instance) {
      ClaudeAPIService.instance = new ClaudeAPIService();
    }
    return ClaudeAPIService.instance;
  }

  public async sendMessage(
    messages: ClaudeMessage[],
    systemPrompt?: string
  ): Promise<string> {
    try {
      console.log('Sending message to Claude API');
      
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