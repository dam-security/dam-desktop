import { ConfigService } from './ConfigService';

export interface NotificationPreferences {
  enabled: boolean;
  criticalAlerts: boolean;
  securityWarnings: boolean;
  promptSuggestions: boolean;
  learningTips: boolean;
  frequency: 'all' | 'occasional' | 'minimal';
  soundEnabled: boolean;
  position: 'top-right' | 'bottom-right' | 'center';
}

export class NotificationSettings {
  private static instance: NotificationSettings;
  private configService: ConfigService;
  private defaultSettings: NotificationPreferences = {
    enabled: true,
    criticalAlerts: true,
    securityWarnings: true,
    promptSuggestions: false,
    learningTips: false,
    frequency: 'minimal',
    soundEnabled: false,
    position: 'bottom-right'
  };

  private constructor() {
    this.configService = ConfigService.getInstance();
  }

  public static getInstance(): NotificationSettings {
    if (!NotificationSettings.instance) {
      NotificationSettings.instance = new NotificationSettings();
    }
    return NotificationSettings.instance;
  }

  public getPreferences(): NotificationPreferences {
    const saved = this.configService.get('notificationPreferences', null);
    if (saved && typeof saved === 'object') {
      return { ...this.defaultSettings, ...(saved as Partial<NotificationPreferences>) };
    }
    return this.defaultSettings;
  }

  public savePreferences(preferences: Partial<NotificationPreferences>): void {
    const current = this.getPreferences();
    const updated = { ...current, ...preferences };
    this.configService.set('notificationPreferences', updated);
  }

  public shouldShowNotificationType(type: string): boolean {
    const prefs = this.getPreferences();
    
    if (!prefs.enabled) return false;

    switch (type) {
      case 'critical':
      case 'security':
        return prefs.criticalAlerts || prefs.securityWarnings;
      case 'prompt':
        return prefs.promptSuggestions;
      case 'learning':
        return prefs.learningTips;
      default:
        return false;
    }
  }

  public getFrequencyMultiplier(): number {
    const prefs = this.getPreferences();
    
    switch (prefs.frequency) {
      case 'all':
        return 1.0;
      case 'occasional':
        return 0.3;
      case 'minimal':
        return 0.1;
      default:
        return 0.1;
    }
  }
}