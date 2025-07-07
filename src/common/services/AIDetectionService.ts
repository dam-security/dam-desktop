import { Logger } from '../utils/Logger';
import * as crypto from 'crypto';

export class AIDetectionService {
  private static instance: AIDetectionService;
  private logger: Logger;
  private knownAITools: Set<string>;

  private constructor() {
    this.logger = Logger.getInstance();
    this.knownAITools = new Set([
      'chatgpt',
      'claude',
      'copilot',
      'gemini',
      'bard',
      'midjourney',
      'dall-e',
      'stable diffusion',
      'character.ai',
      'perplexity',
      'jasper',
      'writesonic',
      'copy.ai'
    ]);
  }

  public static getInstance(): AIDetectionService {
    if (!AIDetectionService.instance) {
      AIDetectionService.instance = new AIDetectionService();
    }
    return AIDetectionService.instance;
  }

  public async initialize(): Promise<void> {
    try {
      this.logger.info('AI Detection service initialized');
    } catch (error) {
      this.logger.error('Failed to initialize AI detection service:', error);
      throw error;
    }
  }

  public async detectAIToolUsage(windowInfo: any): Promise<any[]> {
    const detectedUsage: any[] = [];

    try {
      // Analyze active windows for AI tool usage
      for (const window of windowInfo.activeWindows) {
        const detection = await this.analyzeWindow(window);
        if (detection) {
          detectedUsage.push(detection);
        }
      }

      return detectedUsage;
    } catch (error) {
      this.logger.error('Error detecting AI tool usage:', error);
      return [];
    }
  }

  private async analyzeWindow(window: any): Promise<any | null> {
    try {
      const windowName = window.name.toLowerCase();
      
      // Check if window contains known AI tools
      const detectedTool = this.identifyAITool(windowName);
      if (!detectedTool) {
        return null;
      }

      // Analyze window content (if available)
      const contentAnalysis = await this.analyzeWindowContent(window);
      
      return {
        tool: detectedTool,
        type: this.determineUsageType(windowName, contentAnalysis),
        contentHash: this.generateContentHash(contentAnalysis.content),
        tokensUsed: this.estimateTokens(contentAnalysis.content),
        costEstimate: this.estimateCost(detectedTool, contentAnalysis.content),
        hasPII: this.detectPII(contentAnalysis.content),
        metadata: {
          windowName: window.name,
          timestamp: Date.now(),
          confidence: contentAnalysis.confidence
        }
      };
    } catch (error) {
      this.logger.error('Error analyzing window:', error);
      return null;
    }
  }

  private identifyAITool(windowName: string): string | null {
    for (const tool of this.knownAITools) {
      if (windowName.includes(tool)) {
        return tool;
      }
    }

    // Check for common AI-related URLs or patterns
    const aiPatterns = [
      'openai.com',
      'chat.openai.com',
      'claude.ai',
      'bard.google.com',
      'github.com/features/copilot',
      'midjourney.com',
      'beta.character.ai'
    ];

    for (const pattern of aiPatterns) {
      if (windowName.includes(pattern)) {
        return this.mapUrlToTool(pattern);
      }
    }

    return null;
  }

  private mapUrlToTool(url: string): string {
    const mapping: { [key: string]: string } = {
      'openai.com': 'chatgpt',
      'chat.openai.com': 'chatgpt',
      'claude.ai': 'claude',
      'bard.google.com': 'bard',
      'copilot': 'copilot',
      'midjourney.com': 'midjourney',
      'character.ai': 'character.ai'
    };

    for (const [pattern, tool] of Object.entries(mapping)) {
      if (url.includes(pattern)) {
        return tool;
      }
    }

    return 'unknown';
  }

  private async analyzeWindowContent(window: any): Promise<any> {
    // In a real implementation, this would use OCR or accessibility APIs
    // to extract text content from the window
    
    // For now, return mock analysis
    return {
      content: '', // Would contain extracted text
      confidence: 0.8,
      hasUserInput: false,
      hasAIResponse: false
    };
  }

  private determineUsageType(windowName: string, contentAnalysis: any): string {
    // Determine the type of AI usage based on context
    if (windowName.includes('code') || windowName.includes('github')) {
      return 'code_assistance';
    }
    
    if (windowName.includes('write') || windowName.includes('document')) {
      return 'writing_assistance';
    }
    
    if (windowName.includes('image') || windowName.includes('art')) {
      return 'image_generation';
    }
    
    if (contentAnalysis.hasUserInput && contentAnalysis.hasAIResponse) {
      return 'conversation';
    }
    
    return 'general';
  }

  private generateContentHash(content: string): string {
    if (!content) return '';
    
    // Generate a hash of the content for tracking without storing sensitive data
    return crypto.createHash('sha256').update(content).digest('hex').substring(0, 16);
  }

  private estimateTokens(content: string): number {
    if (!content) return 0;
    
    // Rough estimation: ~4 characters per token
    return Math.ceil(content.length / 4);
  }

  private estimateCost(tool: string, content: string): number {
    const tokens = this.estimateTokens(content);
    
    // Rough cost estimates per 1000 tokens (in USD)
    const costPer1000Tokens: { [key: string]: number } = {
      'chatgpt': 0.002,
      'claude': 0.008,
      'copilot': 0.001,
      'gemini': 0.0005,
      'bard': 0.0005
    };

    const rate = costPer1000Tokens[tool] || 0.002;
    return (tokens / 1000) * rate;
  }

  private detectPII(content: string): boolean {
    if (!content) return false;
    
    // Simple PII detection patterns
    const piiPatterns = [
      /\b\d{3}-\d{2}-\d{4}\b/, // SSN
      /\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/, // Credit card
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Email
      /\b\d{3}-\d{3}-\d{4}\b/, // Phone number
    ];

    return piiPatterns.some(pattern => pattern.test(content));
  }
}