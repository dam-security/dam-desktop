import { Logger } from '../utils/Logger';

export interface AIWindowInfo {
  isAIWindow: boolean;
  platform?: string;
  url?: string;
  appName?: string;
}

export class AIWindowDetector {
  private static instance: AIWindowDetector;
  private logger: Logger;

  // AI platform URLs to monitor
  private aiPlatformUrls = [
    // OpenAI
    { pattern: /https?:\/\/(www\.)?chatgpt\.com/i, platform: 'ChatGPT' },
    { pattern: /https?:\/\/chat\.openai\.com/i, platform: 'ChatGPT' },
    
    // Claude
    { pattern: /https?:\/\/(www\.)?claude\.ai/i, platform: 'Claude' },
    { pattern: /https?:\/\/claude\.anthropic\.com/i, platform: 'Claude' },
    
    // Google
    { pattern: /https?:\/\/gemini\.google\.com/i, platform: 'Gemini' },
    { pattern: /https?:\/\/bard\.google\.com/i, platform: 'Gemini' },
    
    // Perplexity
    { pattern: /https?:\/\/(www\.)?perplexity\.ai/i, platform: 'Perplexity' }
  ];

  // Terminal and app patterns for AI usage
  private terminalAIPatterns = [
    { pattern: /claude\s+(-|--)?/i, platform: 'Claude CLI' },
    { pattern: /gemini\s+(-|--)?/i, platform: 'Gemini CLI' },
    { pattern: /openai\s+(-|--)?/i, platform: 'OpenAI CLI' },
    { pattern: /chatgpt\s+(-|--)?/i, platform: 'ChatGPT CLI' }
  ];

  // Desktop app window names
  private aiDesktopApps = [
    { pattern: /claude.*desktop|claude\s*app/i, platform: 'Claude Desktop' },
    { pattern: /chatgpt.*desktop|openai.*app/i, platform: 'ChatGPT Desktop' },
    { pattern: /gemini.*desktop|gemini\s*app/i, platform: 'Gemini Desktop' }
  ];

  private constructor() {
    this.logger = Logger.getInstance();
  }

  public static getInstance(): AIWindowDetector {
    if (!AIWindowDetector.instance) {
      AIWindowDetector.instance = new AIWindowDetector();
    }
    return AIWindowDetector.instance;
  }

  public detectAIWindow(windowTitle: string, extractedText: string): AIWindowInfo {
    // Check if it's a browser with AI platform
    const browserMatch = this.checkBrowserAIPlatform(windowTitle, extractedText);
    if (browserMatch.isAIWindow) {
      return browserMatch;
    }

    // Check if it's a terminal with AI command
    const terminalMatch = this.checkTerminalAI(windowTitle, extractedText);
    if (terminalMatch.isAIWindow) {
      return terminalMatch;
    }

    // Check if it's a desktop AI app
    const desktopMatch = this.checkDesktopAIApp(windowTitle);
    if (desktopMatch.isAIWindow) {
      return desktopMatch;
    }

    return { isAIWindow: false };
  }

  private checkBrowserAIPlatform(windowTitle: string, extractedText: string): AIWindowInfo {
    const windowTitleLower = windowTitle.toLowerCase();
    
    // Check if it's a browser window
    const isBrowser = windowTitleLower.includes('chrome') || 
                     windowTitleLower.includes('firefox') || 
                     windowTitleLower.includes('safari') || 
                     windowTitleLower.includes('edge') ||
                     windowTitleLower.includes('brave');

    if (!isBrowser) {
      return { isAIWindow: false };
    }

    // Look for URL patterns in window title or extracted text
    const combinedText = `${windowTitle} ${extractedText}`;
    
    for (const urlPattern of this.aiPlatformUrls) {
      if (urlPattern.pattern.test(combinedText)) {
        // Extract the actual URL if possible
        const urlMatch = combinedText.match(urlPattern.pattern);
        return {
          isAIWindow: true,
          platform: urlPattern.platform,
          url: urlMatch ? urlMatch[0] : undefined
        };
      }
    }

    // Also check for platform names in title (browser tabs often show site name)
    for (const platform of ['ChatGPT', 'Claude', 'Gemini', 'Perplexity']) {
      if (windowTitleLower.includes(platform.toLowerCase())) {
        return {
          isAIWindow: true,
          platform: platform
        };
      }
    }

    return { isAIWindow: false };
  }

  private checkTerminalAI(windowTitle: string, extractedText: string): AIWindowInfo {
    const windowTitleLower = windowTitle.toLowerCase();
    
    // Check if it's a terminal window
    const isTerminal = windowTitleLower.includes('terminal') || 
                      windowTitleLower.includes('iterm') || 
                      windowTitleLower.includes('console') ||
                      windowTitleLower.includes('powershell') ||
                      windowTitleLower.includes('cmd');

    if (!isTerminal) {
      return { isAIWindow: false };
    }

    // Look for AI CLI commands in extracted text
    for (const pattern of this.terminalAIPatterns) {
      if (pattern.pattern.test(extractedText)) {
        return {
          isAIWindow: true,
          platform: pattern.platform,
          appName: 'Terminal'
        };
      }
    }

    return { isAIWindow: false };
  }

  private checkDesktopAIApp(windowTitle: string): AIWindowInfo {
    const windowTitleLower = windowTitle.toLowerCase();
    
    for (const app of this.aiDesktopApps) {
      if (app.pattern.test(windowTitleLower)) {
        return {
          isAIWindow: true,
          platform: app.platform,
          appName: app.platform
        };
      }
    }

    return { isAIWindow: false };
  }

  public shouldShowNotification(
    aiWindowInfo: AIWindowInfo, 
    analysisResult: any
  ): boolean {
    // Only show notifications if we're in an AI window
    if (!aiWindowInfo.isAIWindow) {
      return false;
    }

    // Determine if notification is warranted based on analysis
    const { riskLevel, promptQuality, sensitiveDataDetected } = analysisResult;

    // Critical notifications - always show
    if (riskLevel === 'critical' || riskLevel === 'high') {
      return true;
    }

    // Sensitive data detected - always show
    if (sensitiveDataDetected) {
      return true;
    }

    // Poor prompt quality - show occasionally (not every time to avoid annoyance)
    if (promptQuality === 'poor') {
      // Use a simple throttle - only show 1 in 3 poor prompts
      return Math.random() < 0.33;
    }

    // Learning opportunities - show rarely
    if (analysisResult.learningOpportunity && promptQuality === 'fair') {
      // Only show 1 in 5 learning opportunities
      return Math.random() < 0.2;
    }

    // Default: don't show notification
    return false;
  }
}