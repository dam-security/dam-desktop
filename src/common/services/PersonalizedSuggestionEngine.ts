import { Logger } from '../utils/Logger';

export interface UserContext {
  role: string;
  skillLevel: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  favoriteTools: string[];
  recentActivity: string[];
  completedChallenges: string[];
  totalPrompts: number;
  riskScore: number;
  topCategories: { name: string; count: number; percentage: number }[];
}

export interface PersonalizedSuggestion {
  type: 'prompt_improvement' | 'tool_recommendation' | 'skill_practice' | 'security_tip' | 'efficiency_tip';
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high';
  actionable: boolean;
  challenge?: string;
  xpReward?: number;
}

export class PersonalizedSuggestionEngine {
  private static instance: PersonalizedSuggestionEngine;
  private logger: Logger;
  private userContext: UserContext | null = null;

  private constructor() {
    this.logger = Logger.getInstance();
  }

  public static getInstance(): PersonalizedSuggestionEngine {
    if (!PersonalizedSuggestionEngine.instance) {
      PersonalizedSuggestionEngine.instance = new PersonalizedSuggestionEngine();
    }
    return PersonalizedSuggestionEngine.instance;
  }

  public updateUserContext(context: UserContext): void {
    this.userContext = context;
    this.logger.info('User context updated for personalized suggestions');
  }

  public generateSuggestions(query?: string): PersonalizedSuggestion[] {
    if (!this.userContext) {
      return this.getDefaultSuggestions();
    }

    const suggestions: PersonalizedSuggestion[] = [];

    // Analyze query for intent and context
    if (query) {
      suggestions.push(...this.getQueryBasedSuggestions(query));
    }

    // Add skill-level appropriate suggestions
    suggestions.push(...this.getSkillBasedSuggestions());

    // Add role-specific suggestions
    suggestions.push(...this.getRoleBasedSuggestions());

    // Add behavioral suggestions based on usage patterns
    suggestions.push(...this.getBehavioralSuggestions());

    // Sort by priority and return top 3
    return suggestions
      .sort((a, b) => this.getPriorityScore(b) - this.getPriorityScore(a))
      .slice(0, 3);
  }

  private getQueryBasedSuggestions(query: string): PersonalizedSuggestion[] {
    const suggestions: PersonalizedSuggestion[] = [];
    const queryLower = query.toLowerCase();

    // Detect query complexity and suggest improvements
    if (queryLower.length < 20) {
      suggestions.push({
        type: 'prompt_improvement',
        title: 'Make your prompt more specific',
        content: `Try adding more context like your role (${this.userContext?.role}) and desired output format`,
        priority: 'high',
        actionable: true,
        challenge: 'prompt-improvement',
        xpReward: 25
      });
    }

    // Detect if user is asking for tools without specifying use case
    if (queryLower.includes('tool') && !this.hasSpecificUseCase(queryLower)) {
      suggestions.push({
        type: 'tool_recommendation',
        title: 'Specify your use case for better tool suggestions',
        content: `Based on your role as ${this.userContext?.role}, I can suggest more targeted tools if you specify what you want to accomplish`,
        priority: 'medium',
        actionable: true
      });
    }

    // Detect security-sensitive content
    if (this.containsSensitiveContent(queryLower)) {
      suggestions.push({
        type: 'security_tip',
        title: 'Security reminder',
        content: 'Consider using placeholder data instead of real sensitive information in AI conversations',
        priority: 'high',
        actionable: true,
        challenge: 'security-awareness',
        xpReward: 40
      });
    }

    return suggestions;
  }

  private getSkillBasedSuggestions(): PersonalizedSuggestion[] {
    const suggestions: PersonalizedSuggestion[] = [];
    const skillLevel = this.userContext?.skillLevel || 'Beginner';

    switch (skillLevel) {
      case 'Beginner':
        suggestions.push({
          type: 'skill_practice',
          title: 'Learn prompt structure fundamentals',
          content: 'Master the basics: Context + Task + Format = Better Results',
          priority: 'high',
          actionable: true,
          challenge: 'prompt-improvement',
          xpReward: 50
        });
        break;

      case 'Intermediate':
        suggestions.push({
          type: 'skill_practice',
          title: 'Practice advanced prompting techniques',
          content: 'Try chain-of-thought prompting and role-based instructions for complex tasks',
          priority: 'medium',
          actionable: true,
          challenge: 'advanced-prompting',
          xpReward: 75
        });
        break;

      case 'Advanced':
        suggestions.push({
          type: 'efficiency_tip',
          title: 'Optimize your AI workflow',
          content: 'Create prompt templates for recurring tasks to save time and improve consistency',
          priority: 'medium',
          actionable: true
        });
        break;

      case 'Expert':
        suggestions.push({
          type: 'skill_practice',
          title: 'Share your expertise',
          content: 'Help others by sharing your best prompting strategies and techniques',
          priority: 'low',
          actionable: true
        });
        break;
    }

    return suggestions;
  }

  private getRoleBasedSuggestions(): PersonalizedSuggestion[] {
    const suggestions: PersonalizedSuggestion[] = [];
    const role = this.userContext?.role || '';

    const roleSuggestions: Record<string, PersonalizedSuggestion> = {
      'Software Developer': {
        type: 'tool_recommendation',
        title: 'Enhance your coding workflow',
        content: 'Try using Claude for code reviews and GitHub Copilot for completion - they complement each other well',
        priority: 'medium',
        actionable: true
      },
      'Data Scientist': {
        type: 'prompt_improvement',
        title: 'Improve data analysis prompts',
        content: 'Always specify your data format, analysis goal, and required statistical significance when asking for help',
        priority: 'medium',
        actionable: true,
        challenge: 'data-analysis-prompting',
        xpReward: 60
      },
      'Product Manager': {
        type: 'efficiency_tip',
        title: 'Streamline stakeholder communication',
        content: 'Use AI to create different versions of the same update for technical vs. business audiences',
        priority: 'medium',
        actionable: true
      },
      'Designer': {
        type: 'tool_recommendation',
        title: 'Expand your creative toolkit',
        content: 'Combine Midjourney for concepts with Figma AI for practical design implementation',
        priority: 'medium',
        actionable: true
      },
      'Marketing Manager': {
        type: 'prompt_improvement',
        title: 'Create more targeted campaigns',
        content: 'Include specific audience demographics and campaign goals in your prompts for better results',
        priority: 'medium',
        actionable: true
      }
    };

    if (roleSuggestions[role]) {
      suggestions.push(roleSuggestions[role]);
    }

    return suggestions;
  }

  private getBehavioralSuggestions(): PersonalizedSuggestion[] {
    const suggestions: PersonalizedSuggestion[] = [];
    
    if (!this.userContext) return suggestions;

    // High usage, suggest efficiency improvements
    if (this.userContext.totalPrompts > 500) {
      suggestions.push({
        type: 'efficiency_tip',
        title: 'Create prompt templates',
        content: 'With your high usage, creating reusable templates could save you significant time',
        priority: 'medium',
        actionable: true
      });
    }

    // High risk score, suggest security improvements
    if (this.userContext.riskScore > 70) {
      suggestions.push({
        type: 'security_tip',
        title: 'Review your AI security practices',
        content: 'Your risk score suggests reviewing what information you share with AI tools',
        priority: 'high',
        actionable: true,
        challenge: 'security-awareness',
        xpReward: 40
      });
    }

    // Suggest exploring new categories if user is focused on one area
    const topCategory = this.userContext.topCategories[0];
    if (topCategory && topCategory.percentage > 60) {
      suggestions.push({
        type: 'skill_practice',
        title: 'Expand your AI usage',
        content: `You're great at ${topCategory.name.toLowerCase()}! Try exploring other areas like creative tasks or analysis`,
        priority: 'low',
        actionable: true
      });
    }

    return suggestions;
  }

  private getDefaultSuggestions(): PersonalizedSuggestion[] {
    return [
      {
        type: 'prompt_improvement',
        title: 'Start with the basics',
        content: 'Be specific about what you want, provide context, and specify the output format',
        priority: 'high',
        actionable: true,
        challenge: 'prompt-improvement',
        xpReward: 50
      },
      {
        type: 'tool_recommendation',
        title: 'Explore AI tools',
        content: 'Different tools excel at different tasks - try ChatGPT for general help and Claude for analysis',
        priority: 'medium',
        actionable: true
      },
      {
        type: 'security_tip',
        title: 'Stay secure with AI',
        content: 'Never share passwords, API keys, or sensitive personal information with AI tools',
        priority: 'high',
        actionable: true
      }
    ];
  }

  private hasSpecificUseCase(query: string): boolean {
    const useCaseKeywords = [
      'writing', 'coding', 'analysis', 'design', 'research', 'marketing',
      'content', 'presentation', 'email', 'documentation', 'planning'
    ];
    return useCaseKeywords.some(keyword => query.includes(keyword));
  }

  private containsSensitiveContent(query: string): boolean {
    const sensitiveKeywords = [
      'password', 'api key', 'token', 'credential', 'secret', 'private',
      'ssn', 'social security', 'credit card', 'bank account', 'personal'
    ];
    return sensitiveKeywords.some(keyword => query.includes(keyword));
  }

  private getPriorityScore(suggestion: PersonalizedSuggestion): number {
    const priorityScores = { high: 3, medium: 2, low: 1 };
    return priorityScores[suggestion.priority];
  }
}