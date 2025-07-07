import { Logger } from '../utils/Logger';
import { ScreenCaptureResult } from './ScreenCaptureService';
import { DashboardSyncService } from './DashboardSyncService';

export interface AnalysisResult {
  timestamp: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  sensitiveDataDetected: boolean;
  sensitiveDataTypes: string[];
  aiToolDetected: string | null;
  promptQuality: 'poor' | 'fair' | 'good' | 'excellent';
  suggestions: Suggestion[];
  learningOpportunity: LearningOpportunity | null;
}

export interface Suggestion {
  type: 'security' | 'efficiency' | 'quality' | 'alternative';
  title: string;
  description: string;
  actionable: boolean;
  priority: 'low' | 'medium' | 'high';
  improvedPrompt?: string;
  learningResource?: string;
  canRewrite?: boolean;
}

export interface LearningOpportunity {
  type: 'prompt_improvement' | 'tool_suggestion' | 'security_risk' | 'efficiency_tip';
  title: string;
  description: string;
  example?: string;
  resources?: string[];
}

export class AIContentAnalyzer {
  private static instance: AIContentAnalyzer;
  private logger: Logger;
  private dashboardSync: DashboardSyncService;
  
  // Patterns for detecting sensitive information
  private sensitivePatterns = {
    ssn: /\b\d{3}-\d{2}-\d{4}\b/,
    creditCard: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/,
    email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/,
    phone: /\b(\+\d{1,3}[- ]?)?\(?\d{3}\)?[- ]?\d{3}[- ]?\d{4}\b/,
    // Enhanced API key detection - catches OpenAI, AWS, etc.
    apiKey: /\b(sk-[a-zA-Z0-9]{48,}|AKIA[0-9A-Z]{16}|ya29\.[a-zA-Z0-9_-]+|AIza[0-9A-Za-z_-]{35}|xoxb-[0-9]+-[0-9A-Za-z-]+|ghp_[a-zA-Z0-9]{36}|gho_[a-zA-Z0-9]{36}|github_pat_[a-zA-Z0-9_]+|Bearer\s+[a-zA-Z0-9_-]+)\b/gi,
    // Alternative API key patterns
    apiKeyGeneral: /\b(api[_-]?key|apikey|api[_-]?secret|access[_-]?token|bearer)[:\s=]*['"]?[a-zA-Z0-9_-]{16,}['"]?\b/i,
    // OpenAI specific
    openaiKey: /\bsk-[a-zA-Z0-9]{20,}\b/g,
    // AWS keys
    awsKey: /\b(AKIA[0-9A-Z]{16}|[A-Z0-9]{20})\b/g,
    password: /\b(password|passwd|pwd)[:\s=]*['"]?[^\s'"]{8,}['"]?\b/i,
    financialData: /\$[\d,]+\.?\d*|USD\s*[\d,]+|revenue|profit|salary|income/i,
    customerData: /customer|client|user|account.*name|billing.*address/i
  };

  // AI tool detection patterns
  private aiToolPatterns = {
    chatgpt: /chat\.openai\.com|chatgpt/i,
    claude: /claude\.ai|anthropic/i,
    gemini: /gemini\.google|bard/i,
    copilot: /github.*copilot|copilot/i,
    midjourney: /midjourney/i,
    perplexity: /perplexity\.ai/i
  };

  // Prompt quality indicators
  private promptQualityIndicators = {
    poor: [
      /^(help|fix|do|make|create)$/i,
      /^.{0,10}$/,
      /^(what|how|why|when|where)$/i
    ],
    good: [
      /context|background|specifically|example|format|style/i,
      /step.?by.?step|detailed|comprehensive/i,
      /please.*explain|can.*you.*help.*with/i
    ],
    excellent: [
      /role.*play|act.*as|perspective|persona/i,
      /constraints|requirements|specifications/i,
      /format.*as|structure.*like|output.*should/i,
      /avoid|don't|exclude|without/i
    ]
  };

  private constructor() {
    this.logger = Logger.getInstance();
    this.dashboardSync = DashboardSyncService.getInstance();
  }

  public static getInstance(): AIContentAnalyzer {
    if (!AIContentAnalyzer.instance) {
      AIContentAnalyzer.instance = new AIContentAnalyzer();
    }
    return AIContentAnalyzer.instance;
  }

  public async analyzeContent(
    screenCapture: ScreenCaptureResult,
    extractedText: string
  ): Promise<AnalysisResult> {
    const timestamp = Date.now();
    
    // Detect AI tool
    const aiToolDetected = this.detectAITool(screenCapture.activeWindow, extractedText);
    
    // Analyze for sensitive data
    const sensitiveDataAnalysis = this.analyzeSensitiveData(extractedText);
    
    // Analyze prompt quality if AI tool is detected
    const promptQuality = aiToolDetected ? 
      this.analyzePromptQuality(extractedText) : 'good';
    
    // Determine risk level
    const riskLevel = this.calculateRiskLevel(
      sensitiveDataAnalysis.detected,
      sensitiveDataAnalysis.types,
      aiToolDetected
    );
    
    // Generate suggestions
    const suggestions = this.generateSuggestions(
      aiToolDetected,
      sensitiveDataAnalysis,
      promptQuality,
      extractedText
    );
    
    // Identify learning opportunities
    const learningOpportunity = this.identifyLearningOpportunity(
      aiToolDetected,
      promptQuality,
      sensitiveDataAnalysis,
      extractedText
    );

    const result = {
      timestamp,
      riskLevel,
      sensitiveDataDetected: sensitiveDataAnalysis.detected,
      sensitiveDataTypes: sensitiveDataAnalysis.types,
      aiToolDetected,
      promptQuality,
      suggestions,
      learningOpportunity
    };

    // Sync usage data to enterprise dashboard
    this.syncToEnterpriseDashboard(result, extractedText);

    return result;
  }

  private detectAITool(windowName: string, content: string): string | null {
    const combinedText = `${windowName} ${content}`.toLowerCase();
    
    for (const [tool, pattern] of Object.entries(this.aiToolPatterns)) {
      if (pattern.test(combinedText)) {
        return tool;
      }
    }
    
    return null;
  }

  private analyzeSensitiveData(text: string): { detected: boolean; types: string[] } {
    const detectedTypes: string[] = [];
    
    for (const [type, pattern] of Object.entries(this.sensitivePatterns)) {
      if (pattern.test(text)) {
        detectedTypes.push(type);
      }
    }
    
    return {
      detected: detectedTypes.length > 0,
      types: detectedTypes
    };
  }

  private analyzePromptQuality(text: string): 'poor' | 'fair' | 'good' | 'excellent' {
    // Check for excellent indicators
    for (const pattern of this.promptQualityIndicators.excellent) {
      if (pattern.test(text)) {
        return 'excellent';
      }
    }
    
    // Check for good indicators
    let goodIndicators = 0;
    for (const pattern of this.promptQualityIndicators.good) {
      if (pattern.test(text)) {
        goodIndicators++;
      }
    }
    if (goodIndicators >= 2) return 'good';
    if (goodIndicators === 1) return 'fair';
    
    // Check for poor indicators
    for (const pattern of this.promptQualityIndicators.poor) {
      if (pattern.test(text)) {
        return 'poor';
      }
    }
    
    // Default to fair if text is reasonable length
    return text.length > 50 ? 'fair' : 'poor';
  }

  private calculateRiskLevel(
    hasSensitiveData: boolean,
    sensitiveTypes: string[],
    aiToolDetected: string | null
  ): 'low' | 'medium' | 'high' | 'critical' {
    if (!aiToolDetected) return 'low';
    
    if (hasSensitiveData) {
      // Critical if API keys, passwords, or SSN
      if (sensitiveTypes.some(type => 
        ['apiKey', 'password', 'ssn'].includes(type)
      )) {
        return 'critical';
      }
      
      // High if financial or customer data
      if (sensitiveTypes.some(type => 
        ['financialData', 'customerData', 'creditCard'].includes(type)
      )) {
        return 'high';
      }
      
      // Medium for other sensitive data
      return 'medium';
    }
    
    return 'low';
  }

  private generateSuggestions(
    aiTool: string | null,
    sensitiveData: { detected: boolean; types: string[] },
    promptQuality: string,
    content: string
  ): Suggestion[] {
    const suggestions: Suggestion[] = [];
    
    // Security suggestions
    if (sensitiveData.detected && aiTool) {
      suggestions.push({
        type: 'security',
        title: 'Sensitive Data Detected',
        description: `You're about to share ${sensitiveData.types.join(', ')} with ${aiTool}. Consider removing or masking this information before proceeding.`,
        actionable: true,
        priority: 'high'
      });
      
      suggestions.push({
        type: 'alternative',
        title: 'Use Local AI Alternative',
        description: 'For sensitive data analysis, consider using a local AI model or enterprise-approved tools that don\'t send data to external servers.',
        actionable: true,
        priority: 'medium'
      });
    }
    
    // Enhanced prompt quality suggestions with specific feedback
    if (promptQuality === 'poor') {
      const specificFeedback = this.getSpecificPromptFeedback(content, aiTool);
      suggestions.push({
        type: 'quality',
        title: 'Your Prompt Needs Improvement',
        description: specificFeedback.description,
        actionable: true,
        priority: 'high',
        improvedPrompt: specificFeedback.improvedPrompt,
        learningResource: specificFeedback.learningResource,
        canRewrite: true
      });
    } else if (promptQuality === 'fair') {
      const specificFeedback = this.getSpecificPromptFeedback(content, aiTool);
      suggestions.push({
        type: 'quality',
        title: 'DAM Can Make Your Prompt More Effective',
        description: specificFeedback.description,
        actionable: true,
        priority: 'medium',
        improvedPrompt: specificFeedback.improvedPrompt,
        learningResource: specificFeedback.learningResource,
        canRewrite: true
      });
    }
    
    // Efficiency suggestions
    if (content.toLowerCase().includes('spreadsheet') || 
        content.toLowerCase().includes('excel') ||
        content.toLowerCase().includes('csv')) {
      suggestions.push({
        type: 'efficiency',
        title: 'Use Specialized Tools',
        description: 'For spreadsheet analysis, consider using Excel\'s built-in AI features or specialized data analysis tools for better performance.',
        actionable: true,
        priority: 'low'
      });
    }
    
    return suggestions;
  }

  private identifyLearningOpportunity(
    aiTool: string | null,
    promptQuality: string,
    sensitiveData: { detected: boolean; types: string[] },
    content: string
  ): LearningOpportunity | null {
    // Security learning opportunity
    if (sensitiveData.detected && aiTool) {
      return {
        type: 'security_risk',
        title: 'Data Privacy Best Practices',
        description: 'Learn how to safely use AI tools with sensitive information',
        example: 'Instead of: "Analyze this customer list: [actual data]"\nTry: "Analyze a customer list with columns: name, email, purchase_amount"',
        resources: [
          'https://dam.ai/learn/data-privacy',
          'https://dam.ai/learn/ai-security'
        ]
      };
    }
    
    // Prompt improvement opportunity
    if (promptQuality === 'poor') {
      return {
        type: 'prompt_improvement',
        title: 'Write Better AI Prompts',
        description: 'Your prompt is too vague. Learn prompt engineering techniques to get better results',
        example: `Instead of: "${content.substring(0, 20)}..."\nTry: "[Be specific about what you want, provide context, specify format, include examples]"`,
        resources: [
          'https://dam.ai/learn/prompt-engineering',
          'https://dam.ai/learn/ai-communication'
        ]
      };
    } else if (promptQuality === 'fair') {
      return {
        type: 'prompt_improvement',
        title: 'Write Better AI Prompts',
        description: 'Learn prompt engineering techniques to get better results',
        example: 'Instead of: "Fix this"\nTry: "Review this Python function for bugs and suggest improvements. Focus on error handling and performance."',
        resources: [
          'https://dam.ai/learn/prompt-engineering',
          'https://dam.ai/learn/ai-communication'
        ]
      };
    }
    
    // Tool suggestion opportunity
    if (content.toLowerCase().includes('code') && aiTool === 'chatgpt') {
      return {
        type: 'tool_suggestion',
        title: 'Try GitHub Copilot for Coding',
        description: 'For code-related tasks, specialized tools like GitHub Copilot might provide better results with IDE integration.',
        resources: [
          'https://dam.ai/learn/coding-ai-tools'
        ]
      };
    }
    
    return null;
  }

  private getSpecificPromptFeedback(content: string, aiTool: string | null): {
    description: string;
    improvedPrompt: string;
    learningResource: string;
  } {
    const trimmedContent = content.trim().toLowerCase();
    const cleanContent = content.replace(/(claude\.ai|chatgpt|openai|anthropic)/gi, '').trim();
    
    // Determine AI tool for resource selection
    const detectedTool = aiTool || this.detectAIToolFromContent(content);
    
    // Get AI-specific learning resource
    const learningResource = this.getAISpecificResource(detectedTool);
    
    // Analyze specific issues and provide targeted feedback
    if (trimmedContent.match(/^(help|fix|do|make|create|what|why|how|when|where)$/)) {
      return {
        description: `"${cleanContent}" is too vague. DAM suggests adding: WHAT you want help with, WHY you need it, and HOW you want the response formatted.`,
        improvedPrompt: this.generateImprovedPrompt(cleanContent, 'one-word'),
        learningResource
      };
    }
    
    if (trimmedContent.length < 10) {
      return {
        description: `"${cleanContent}" is too short. DAM recommends adding context about your situation, specific requirements, and desired outcome.`,
        improvedPrompt: this.generateImprovedPrompt(cleanContent, 'too-short'),
        learningResource
      };
    }
    
    if (trimmedContent.match(/^(help me|fix this|do this|make it)$/)) {
      return {
        description: `"${cleanContent}" lacks specifics. DAM suggests clarifying: What exactly needs help? What's the current problem? What's your goal?`,
        improvedPrompt: this.generateImprovedPrompt(cleanContent, 'vague-request'),
        learningResource
      };
    }
    
    if (trimmedContent.includes('code') && trimmedContent.length < 20) {
      return {
        description: `For coding help, DAM recommends specifying: the programming language, what the code should do, any error messages, and your current code snippet.`,
        improvedPrompt: this.generateImprovedPrompt(cleanContent, 'code-help'),
        learningResource
      };
    }
    
    // Default feedback for other poor prompts
    return {
      description: `"${cleanContent}" needs more detail. DAM suggests adding context, specifying your goal, mentioning constraints, and describing the desired output format.`,
      improvedPrompt: this.generateImprovedPrompt(cleanContent, 'generic'),
      learningResource
    };
  }
  
  private detectAIToolFromContent(content: string): string {
    const contentLower = content.toLowerCase();
    if (contentLower.includes('claude') || contentLower.includes('anthropic')) return 'claude';
    if (contentLower.includes('chatgpt') || contentLower.includes('openai')) return 'chatgpt';
    if (contentLower.includes('gemini') || contentLower.includes('bard')) return 'gemini';
    if (contentLower.includes('copilot')) return 'copilot';
    return 'general';
  }
  
  private getAISpecificResource(tool: string): string {
    switch (tool) {
      case 'claude':
        return 'https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview';
      case 'chatgpt':
        return 'https://platform.openai.com/docs/guides/prompt-engineering';
      case 'gemini':
        return 'https://ai.google.dev/gemini-api/docs/prompting-strategies';
      case 'copilot':
        return 'https://docs.github.com/en/copilot/using-github-copilot/prompt-engineering-for-github-copilot';
      default:
        return 'https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview';
    }
  }
  
  private generateImprovedPrompt(originalPrompt: string, issueType: string): string {
    const original = originalPrompt.replace(/(claude\.ai|chatgpt|openai|anthropic)/gi, '').trim();
    
    switch (issueType) {
      case 'one-word':
        if (original.toLowerCase() === 'help') {
          return 'I need help with [specific topic/task]. My current situation is [context]. I want to achieve [goal]. Please provide [step-by-step instructions/explanation/code example] in [format preference].';
        }
        if (original.toLowerCase() === 'fix') {
          return 'I have a problem with [specific issue]. Here\'s what I\'ve tried: [previous attempts]. The error/issue is: [detailed description]. Please help me fix this by [desired solution approach].';
        }
        return `Instead of "${original}", try: "I need help with [specific topic]. My goal is [what you want to achieve]. Please provide [type of response you want]."`;;
        
      case 'too-short':
        return `Expand "${original}" to include: **Context**: What you're working on, **Goal**: What you want to achieve, **Constraints**: Any limitations, **Format**: How you want the response structured.`;
        
      case 'vague-request':
        if (original.toLowerCase().includes('fix')) {
          return 'I\'m having trouble with [specific problem]. Here\'s my current code/situation: [paste code/details]. The issue is: [error message or unwanted behavior]. I want to achieve: [desired outcome]. Please help me fix this.';
        }
        return `Be specific about "${original}": What exactly do you need? What\'s your current situation? What\'s your desired outcome? Any constraints or preferences?`;
        
      case 'code-help':
        return 'I\'m working on [project/task] in [programming language]. I need help with [specific functionality]. Here\'s my current code: [code snippet]. The issue is: [error/problem]. Expected behavior: [what should happen]. Please provide a solution with explanation.';
        
      default:
        return `Improve "${original}" by adding: 1) Specific context about your situation, 2) Clear goal/objective, 3) Any constraints or requirements, 4) Preferred response format, 5) Examples if applicable.`;
    }
  }

  private syncToEnterpriseDashboard(result: AnalysisResult, extractedText: string): void {
    try {
      // Get user profile for context
      const userProfile = this.getUserProfile();
      
      // Record usage event
      this.dashboardSync.recordUsageEvent({
        userId: userProfile?.email || 'unknown',
        userEmail: userProfile?.email || 'unknown',
        userRole: userProfile?.role || 'unknown',
        aiTool: result.aiToolDetected || 'unknown',
        action: 'prompt',
        category: this.categorizeContent(extractedText),
        riskLevel: result.riskLevel,
        contentType: this.determineContentType(extractedText),
        promptLength: extractedText.length,
        sensitiveDataDetected: result.sensitiveDataDetected,
        apiKeyExposed: result.sensitiveDataTypes.includes('apiKey') || result.sensitiveDataTypes.includes('openaiKey'),
        complianceFlags: result.sensitiveDataTypes,
        metadata: {
          promptQuality: result.promptQuality,
          suggestionsCount: result.suggestions.length,
          hasLearningOpportunity: !!result.learningOpportunity,
          windowTitle: result.aiToolDetected || 'unknown'
        }
      });

      // Record security alerts for high-risk activities
      if (result.riskLevel === 'high' || result.riskLevel === 'critical' || result.sensitiveDataDetected) {
        this.dashboardSync.recordSecurityAlert({
          userId: userProfile?.email || 'unknown',
          userEmail: userProfile?.email || 'unknown',
          alertType: result.sensitiveDataTypes.includes('apiKey') ? 'api_key_exposure' : 'sensitive_data',
          severity: result.riskLevel === 'critical' ? 'critical' : result.riskLevel,
          description: this.generateAlertDescription(result),
          aiTool: result.aiToolDetected || 'unknown',
          content: this.sanitizeContentForAlert(extractedText),
          actionTaken: result.suggestions.length > 0 ? 'suggestions_provided' : 'user_notified',
          resolved: false
        });
      }
    } catch (error) {
      this.logger.error('Failed to sync to enterprise dashboard:', error);
    }
  }

  private getUserProfile(): any {
    try {
      const profile = localStorage.getItem('damUserProfile');
      return profile ? JSON.parse(profile) : null;
    } catch {
      return null;
    }
  }

  private categorizeContent(content: string): string {
    const text = content.toLowerCase();
    
    if (text.includes('code') || text.includes('function') || text.includes('class') || text.includes('debug')) {
      return 'code_generation';
    }
    if (text.includes('write') || text.includes('email') || text.includes('document') || text.includes('content')) {
      return 'writing_editing';
    }
    if (text.includes('analyze') || text.includes('research') || text.includes('data') || text.includes('study')) {
      return 'analysis_research';
    }
    if (text.includes('problem') || text.includes('solve') || text.includes('help') || text.includes('fix')) {
      return 'problem_solving';
    }
    if (text.includes('design') || text.includes('creative') || text.includes('art') || text.includes('image')) {
      return 'creative_tasks';
    }
    
    return 'other';
  }

  private determineContentType(content: string): 'code' | 'text' | 'data' | 'image' | 'other' {
    if (content.includes('function') || content.includes('class') || content.includes('{') || content.includes('import')) {
      return 'code';
    }
    if (content.includes('data') || content.includes('csv') || content.includes('json') || content.includes('table')) {
      return 'data';
    }
    if (content.includes('image') || content.includes('picture') || content.includes('photo') || content.includes('visual')) {
      return 'image';
    }
    
    return 'text';
  }

  private generateAlertDescription(result: AnalysisResult): string {
    const descriptions = [];
    
    if (result.sensitiveDataTypes.includes('apiKey')) {
      descriptions.push('API key detected in prompt');
    }
    if (result.sensitiveDataTypes.includes('ssn')) {
      descriptions.push('Social Security Number detected');
    }
    if (result.sensitiveDataTypes.includes('creditCard')) {
      descriptions.push('Credit card number detected');
    }
    if (result.sensitiveDataTypes.includes('email')) {
      descriptions.push('Email address detected');
    }
    if (result.sensitiveDataTypes.includes('password')) {
      descriptions.push('Password detected');
    }
    
    return descriptions.length > 0 
      ? descriptions.join(', ') 
      : `${result.riskLevel} risk activity detected in AI interaction`;
  }

  private sanitizeContentForAlert(content: string): string {
    // Remove actual sensitive data but keep context for security team
    let sanitized = content;
    
    // Replace API keys with placeholder
    sanitized = sanitized.replace(this.sensitivePatterns.apiKey, '[API_KEY_REDACTED]');
    sanitized = sanitized.replace(this.sensitivePatterns.openaiKey, '[OPENAI_KEY_REDACTED]');
    
    // Replace SSN with placeholder
    sanitized = sanitized.replace(this.sensitivePatterns.ssn, '[SSN_REDACTED]');
    
    // Replace credit card with placeholder
    sanitized = sanitized.replace(this.sensitivePatterns.creditCard, '[CREDIT_CARD_REDACTED]');
    
    // Truncate if too long
    if (sanitized.length > 500) {
      sanitized = sanitized.substring(0, 500) + '... [TRUNCATED]';
    }
    
    return sanitized;
  }
}