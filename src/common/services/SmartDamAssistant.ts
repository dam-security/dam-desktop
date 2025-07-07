interface PromptAnalysis {
  originalPrompt: string;
  analysis: {
    clarity: number;
    specificity: number;
    context: number;
    goalOrientation: number;
  };
  issues: string[];
  strengths: string[];
}

interface ToolRecommendation {
  tool: string;
  reason: string;
  useCases: string[];
  link: string;
  matchScore: number;
}

interface TrainingResource {
  title: string;
  link: string;
  duration: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  topics: string[];
}

export class SmartDamAssistant {
  private static instance: SmartDamAssistant;

  private aiTools = {
    'ChatGPT': {
      categories: ['general', 'writing', 'brainstorming', 'code'],
      strengths: ['conversational', 'creative writing', 'explanations'],
      link: 'https://chat.openai.com',
      pricing: 'Free / $20 per month'
    },
    'Claude': {
      categories: ['analysis', 'code', 'research', 'writing'],
      strengths: ['long context', 'technical analysis', 'code review'],
      link: 'https://claude.ai',
      pricing: 'Free / $20 per month'
    },
    'GitHub Copilot': {
      categories: ['code', 'development'],
      strengths: ['code completion', 'test generation', 'documentation'],
      link: 'https://github.com/features/copilot',
      pricing: '$10 per month'
    },
    'Perplexity': {
      categories: ['research', 'search', 'fact-checking'],
      strengths: ['web search', 'citations', 'current information'],
      link: 'https://perplexity.ai',
      pricing: 'Free / $20 per month'
    },
    'Midjourney': {
      categories: ['design', 'image', 'creative'],
      strengths: ['artistic images', 'concept art', 'visual design'],
      link: 'https://midjourney.com',
      pricing: '$10+ per month'
    },
    'DALL-E': {
      categories: ['design', 'image', 'creative'],
      strengths: ['photorealistic images', 'edits', 'variations'],
      link: 'https://openai.com/dall-e',
      pricing: 'Credits-based'
    },
    'Notion AI': {
      categories: ['writing', 'productivity', 'organization'],
      strengths: ['summaries', 'action items', 'content improvement'],
      link: 'https://notion.so/product/ai',
      pricing: '$10 per month'
    },
    'Grammarly': {
      categories: ['writing', 'editing'],
      strengths: ['grammar', 'tone', 'clarity'],
      link: 'https://grammarly.com',
      pricing: 'Free / $12 per month'
    }
  };

  private trainingResources = [
    {
      title: 'Prompt Engineering Fundamentals',
      link: 'https://learnprompting.org/docs/intro',
      duration: '2 hours',
      level: 'beginner' as const,
      topics: ['basics', 'structure', 'examples']
    },
    {
      title: 'Advanced Prompt Techniques',
      link: 'https://www.promptingguide.ai/',
      duration: '4 hours',
      level: 'advanced' as const,
      topics: ['chain-of-thought', 'few-shot', 'reasoning']
    },
    {
      title: 'AI Tools for Developers',
      link: 'https://github.com/microsoft/AI-For-Beginners',
      duration: '6 hours',
      level: 'intermediate' as const,
      topics: ['coding', 'debugging', 'documentation']
    },
    {
      title: 'ChatGPT Prompt Engineering',
      link: 'https://platform.openai.com/docs/guides/prompt-engineering',
      duration: '1 hour',
      level: 'intermediate' as const,
      topics: ['ChatGPT', 'best practices', 'examples']
    }
  ];

  private roleTemplates: Record<string, {
    commonTasks: string[];
    recommendedTools: string[];
    promptTemplate: string;
  }> = {
    'developer': {
      commonTasks: ['code review', 'debugging', 'documentation', 'testing'],
      recommendedTools: ['Claude', 'GitHub Copilot', 'ChatGPT'],
      promptTemplate: 'Act as a senior software engineer with expertise in [LANGUAGE]. Help me [TASK] by [APPROACH]. Consider [CONSTRAINTS].'
    },
    'designer': {
      commonTasks: ['concept creation', 'mockups', 'user research', 'prototyping'],
      recommendedTools: ['Midjourney', 'DALL-E', 'ChatGPT'],
      promptTemplate: 'Act as a UX/UI designer. Create [DELIVERABLE] for [AUDIENCE] that [GOAL]. Style should be [STYLE].'
    },
    'manager': {
      commonTasks: ['planning', 'reporting', 'communication', 'analysis'],
      recommendedTools: ['ChatGPT', 'Claude', 'Notion AI'],
      promptTemplate: 'Act as a [TYPE] manager. Help me [TASK] for [CONTEXT]. Focus on [PRIORITIES].'
    },
    'writer': {
      commonTasks: ['content creation', 'editing', 'research', 'outlining'],
      recommendedTools: ['Claude', 'ChatGPT', 'Grammarly', 'Perplexity'],
      promptTemplate: 'Act as a professional writer. Create [CONTENT TYPE] about [TOPIC] for [AUDIENCE]. Tone should be [TONE].'
    },
    'researcher': {
      commonTasks: ['literature review', 'data analysis', 'hypothesis testing', 'reporting'],
      recommendedTools: ['Perplexity', 'Claude', 'ChatGPT'],
      promptTemplate: 'Act as a research analyst. Help me [RESEARCH TASK] about [TOPIC]. Use [METHODOLOGY] and provide [DELIVERABLES].'
    }
  };

  static getInstance(): SmartDamAssistant {
    if (!SmartDamAssistant.instance) {
      SmartDamAssistant.instance = new SmartDamAssistant();
    }
    return SmartDamAssistant.instance;
  }

  analyzePrompt(prompt: string): PromptAnalysis {
    const analysis = {
      clarity: this.assessClarity(prompt),
      specificity: this.assessSpecificity(prompt),
      context: this.assessContext(prompt),
      goalOrientation: this.assessGoalOrientation(prompt)
    };

    const issues: string[] = [];
    const strengths: string[] = [];

    // Identify issues
    if (analysis.clarity < 0.5) issues.push('Prompt is vague or unclear');
    if (analysis.specificity < 0.5) issues.push('Lacks specific details or requirements');
    if (analysis.context < 0.5) issues.push('Missing important context or background');
    if (analysis.goalOrientation < 0.5) issues.push('Goal or desired outcome is unclear');
    if (prompt.length < 20) issues.push('Prompt is too short');
    if (!prompt.includes(' ')) issues.push('Single word prompts are rarely effective');

    // Identify strengths
    if (analysis.clarity > 0.7) strengths.push('Clear and well-structured');
    if (analysis.specificity > 0.7) strengths.push('Contains specific requirements');
    if (analysis.context > 0.7) strengths.push('Good context provided');
    if (analysis.goalOrientation > 0.7) strengths.push('Clear goal defined');

    return { originalPrompt: prompt, analysis, issues, strengths };
  }

  improvePrompt(prompt: string, userRole?: string, context?: string): string {
    const analysis = this.analyzePrompt(prompt);
    let improved = prompt;

    // Get role template if available
    const roleTemplate = userRole ? this.roleTemplates[userRole.toLowerCase()] : null;

    // Apply improvements based on analysis
    if (analysis.analysis.clarity < 0.5) {
      improved = this.addClarity(improved);
    }

    if (analysis.analysis.specificity < 0.5) {
      improved = this.addSpecificity(improved, context);
    }

    if (analysis.analysis.context < 0.5) {
      improved = this.addContext(improved, userRole, context);
    }

    if (analysis.analysis.goalOrientation < 0.5) {
      improved = this.addGoalOrientation(improved);
    }

    // Apply role template if available
    if (roleTemplate && improved.length < 50) {
      improved = this.applyRoleTemplate(improved, roleTemplate.promptTemplate);
    }

    return improved;
  }

  recommendTools(task: string, userRole?: string): ToolRecommendation[] {
    const recommendations: ToolRecommendation[] = [];
    const taskLower = task.toLowerCase();
    
    // Get role-based recommendations
    const roleRecommendations = userRole ? 
      this.roleTemplates[userRole.toLowerCase()]?.recommendedTools || [] : [];

    // Analyze task and match tools
    Object.entries(this.aiTools).forEach(([toolName, toolInfo]) => {
      let matchScore = 0;
      const reasons: string[] = [];
      const useCases: string[] = [];

      // Check role match
      if (roleRecommendations.includes(toolName)) {
        matchScore += 0.3;
        reasons.push(`Recommended for ${userRole}s`);
      }

      // Check category match
      toolInfo.categories.forEach(category => {
        if (taskLower.includes(category)) {
          matchScore += 0.2;
          reasons.push(`Excellent for ${category} tasks`);
        }
      });

      // Check specific keywords
      if (taskLower.includes('code') && toolInfo.categories.includes('code')) {
        matchScore += 0.3;
        useCases.push('Code generation', 'Debugging', 'Refactoring');
      }

      if (taskLower.includes('write') && toolInfo.categories.includes('writing')) {
        matchScore += 0.3;
        useCases.push('Content creation', 'Editing', 'Brainstorming');
      }

      if (taskLower.includes('image') && toolInfo.categories.includes('image')) {
        matchScore += 0.4;
        useCases.push('Image generation', 'Visual concepts', 'Design mockups');
      }

      if (taskLower.includes('research') && toolInfo.categories.includes('research')) {
        matchScore += 0.4;
        useCases.push('Information gathering', 'Fact checking', 'Analysis');
      }

      if (matchScore > 0) {
        recommendations.push({
          tool: toolName,
          reason: reasons.join('. '),
          useCases: useCases.length > 0 ? useCases : toolInfo.strengths,
          link: toolInfo.link,
          matchScore
        });
      }
    });

    // Sort by match score
    return recommendations.sort((a, b) => b.matchScore - a.matchScore).slice(0, 3);
  }

  getTrainingResources(skillLevel: string, topics: string[]): TrainingResource[] {
    return this.trainingResources.filter(resource => {
      // Match skill level
      if (skillLevel && resource.level !== skillLevel && skillLevel !== 'all') {
        return false;
      }

      // Match topics
      if (topics.length > 0) {
        const hasMatchingTopic = topics.some(topic => 
          resource.topics.some(rTopic => 
            rTopic.toLowerCase().includes(topic.toLowerCase())
          )
        );
        if (!hasMatchingTopic) return false;
      }

      return true;
    });
  }

  generateResponse(input: string, userProfile?: any): {
    improvedPrompt?: string;
    tools: ToolRecommendation[];
    training: TrainingResource[];
    tips: string[];
  } {
    const inputLower = input.toLowerCase();
    const tips: string[] = [];

    // Analyze what the user is asking for
    const isAskingForTools = inputLower.includes('tool') || inputLower.includes('recommend') || inputLower.includes('which ai');
    const isAskingForPromptHelp = inputLower.includes('prompt') || inputLower.includes('improve') || inputLower.includes('rewrite');
    const isAskingForTraining = inputLower.includes('learn') || inputLower.includes('training') || inputLower.includes('course');

    let improvedPrompt: string | undefined;
    let tools: ToolRecommendation[] = [];
    let training: TrainingResource[] = [];

    if (isAskingForPromptHelp) {
      // Extract the prompt they want to improve
      const promptMatch = input.match(/["']([^"']+)["']/) || input.match(/:\s*(.+)$/);
      if (promptMatch) {
        improvedPrompt = this.improvePrompt(promptMatch[1], userProfile?.role);
        tips.push('Structure your prompts with: Role, Task, Context, and Expected Output');
        tips.push('Use specific examples to guide the AI');
        tips.push('Break complex tasks into steps');
      }
    }

    if (isAskingForTools || !isAskingForPromptHelp) {
      tools = this.recommendTools(input, userProfile?.role);
      if (tools.length > 0) {
        tips.push(`Consider ${tools[0].tool} for this task - it excels at ${tools[0].useCases[0]}`);
      }
    }

    if (isAskingForTraining) {
      const skillLevel = inputLower.includes('beginner') ? 'beginner' : 
                       inputLower.includes('advanced') ? 'advanced' : 'intermediate';
      training = this.getTrainingResources(skillLevel, []);
      tips.push('Practice with real projects to improve faster');
      tips.push('Join AI communities to learn from others');
    }

    // Default tips if nothing specific
    if (tips.length === 0) {
      tips.push('Be specific about what you want to achieve');
      tips.push('Provide context and constraints in your prompts');
      tips.push('Iterate on prompts to get better results');
    }

    return { improvedPrompt, tools, training, tips };
  }

  private assessClarity(prompt: string): number {
    const hasQuestionWords = /\b(what|how|why|when|where|who|which)\b/i.test(prompt);
    const hasActionVerbs = /\b(create|write|explain|analyze|help|make|build|design)\b/i.test(prompt);
    const sentenceStructure = prompt.includes(' ') && prompt.length > 10;
    
    let score = 0;
    if (hasQuestionWords) score += 0.3;
    if (hasActionVerbs) score += 0.4;
    if (sentenceStructure) score += 0.3;
    
    return Math.min(score, 1);
  }

  private assessSpecificity(prompt: string): number {
    const hasNumbers = /\d/.test(prompt);
    const hasSpecificNouns = /\b(code|function|design|report|email|article|image)\b/i.test(prompt);
    const hasConstraints = /\b(must|should|need|require|limit|max|min)\b/i.test(prompt);
    const wordCount = prompt.split(' ').length;
    
    let score = 0;
    if (hasNumbers) score += 0.2;
    if (hasSpecificNouns) score += 0.3;
    if (hasConstraints) score += 0.3;
    if (wordCount > 10) score += 0.2;
    
    return Math.min(score, 1);
  }

  private assessContext(prompt: string): number {
    const hasBackground = /\b(for|about|regarding|concerning|related to)\b/i.test(prompt);
    const hasAudience = /\b(user|customer|team|client|audience|reader)\b/i.test(prompt);
    const hasPurpose = /\b(to|in order to|so that|because)\b/i.test(prompt);
    
    let score = 0;
    if (hasBackground) score += 0.35;
    if (hasAudience) score += 0.35;
    if (hasPurpose) score += 0.3;
    
    return Math.min(score, 1);
  }

  private assessGoalOrientation(prompt: string): number {
    const hasGoalWords = /\b(want|need|goal|objective|outcome|result|achieve)\b/i.test(prompt);
    const hasDeliverables = /\b(provide|give|create|generate|produce|output)\b/i.test(prompt);
    const hasFormat = /\b(format|structure|style|tone|length)\b/i.test(prompt);
    
    let score = 0;
    if (hasGoalWords) score += 0.4;
    if (hasDeliverables) score += 0.3;
    if (hasFormat) score += 0.3;
    
    return Math.min(score, 1);
  }

  private addClarity(prompt: string): string {
    if (!prompt.includes('help') && !prompt.includes('?')) {
      return `Help me ${prompt}`;
    }
    return prompt;
  }

  private addSpecificity(prompt: string, context?: string): string {
    const additions: string[] = [];
    
    if (!prompt.match(/\d/)) {
      additions.push('specific requirements');
    }
    
    if (context) {
      additions.push(`in the context of ${context}`);
    }
    
    if (additions.length > 0) {
      return `${prompt} with ${additions.join(' and ')}`;
    }
    
    return prompt;
  }

  private addContext(prompt: string, role?: string, context?: string): string {
    const contextParts: string[] = [];
    
    if (role) {
      contextParts.push(`I'm a ${role}`);
    }
    
    if (context) {
      contextParts.push(`working on ${context}`);
    }
    
    if (contextParts.length > 0) {
      return `${contextParts.join(' ')}. ${prompt}`;
    }
    
    return prompt;
  }

  private addGoalOrientation(prompt: string): string {
    if (!prompt.includes('to') && !prompt.includes('for')) {
      return `${prompt} to achieve the best results`;
    }
    return prompt;
  }

  private applyRoleTemplate(prompt: string, template: string): string {
    // Extract key information from the original prompt
    const task = prompt;
    const language = prompt.match(/\b(javascript|python|java|typescript|react|node)\b/i)?.[0] || 'the relevant technology';
    const approach = 'providing clear explanations and best practices';
    const constraints = 'production-ready code with error handling';
    
    return template
      .replace('[LANGUAGE]', language)
      .replace('[TASK]', task)
      .replace('[APPROACH]', approach)
      .replace('[CONSTRAINTS]', constraints)
      .replace('[TYPE]', 'project')
      .replace('[CONTEXT]', 'our team')
      .replace('[PRIORITIES]', 'clarity and efficiency')
      .replace('[CONTENT TYPE]', 'content')
      .replace('[TOPIC]', task)
      .replace('[AUDIENCE]', 'professional audience')
      .replace('[TONE]', 'professional and clear')
      .replace('[DELIVERABLE]', 'solution')
      .replace('[GOAL]', 'solves the problem effectively')
      .replace('[STYLE]', 'modern and clean')
      .replace('[RESEARCH TASK]', task)
      .replace('[METHODOLOGY]', 'systematic analysis')
      .replace('[DELIVERABLES]', 'actionable insights');
  }
}