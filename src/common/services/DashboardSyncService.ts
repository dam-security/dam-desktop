import { Logger } from '../utils/Logger';

export interface UsageEvent {
  id: string;
  timestamp: number;
  userId: string;
  userEmail: string;
  userRole: string;
  aiTool: string;
  action: 'prompt' | 'completion' | 'conversation';
  category: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  contentType: 'code' | 'text' | 'data' | 'image' | 'other';
  promptLength?: number;
  responseLength?: number;
  sensitiveDataDetected: boolean;
  apiKeyExposed: boolean;
  complianceFlags: string[];
  metadata?: Record<string, any>;
}

export interface SecurityAlert {
  id: string;
  timestamp: number;
  userId: string;
  userEmail: string;
  alertType: 'api_key_exposure' | 'sensitive_data' | 'policy_violation' | 'unusual_activity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  aiTool: string;
  content: string;
  actionTaken: string;
  resolved: boolean;
}

export interface UserAnalytics {
  userId: string;
  userEmail: string;
  userRole: string;
  totalPrompts: number;
  totalTokens: number;
  favoriteAITool: string;
  riskScore: number;
  complianceScore: number;
  lastActivity: number;
  weeklyActivity: { date: string; prompts: number }[];
  categoryBreakdown: { category: string; count: number; percentage: number }[];
}

export interface EnterpriseSettings {
  enabled: boolean;
  dashboardUrl: string;
  organizationId: string;
  apiKey: string;
}

export class DashboardSyncService {
  private static instance: DashboardSyncService;
  private logger: Logger;
  private syncQueue: UsageEvent[] = [];
  private alertQueue: SecurityAlert[] = [];
  private syncInterval: NodeJS.Timeout | null = null;
  private lastSyncTime = 0;

  private constructor() {
    this.logger = Logger.getInstance();
    this.startSyncScheduler();
  }

  public static getInstance(): DashboardSyncService {
    if (!DashboardSyncService.instance) {
      DashboardSyncService.instance = new DashboardSyncService();
    }
    return DashboardSyncService.instance;
  }

  private getEnterpriseSettings(): EnterpriseSettings | null {
    try {
      const settings = localStorage.getItem('damEnterpriseSettings');
      if (!settings) return null;
      
      const enterpriseSettings = JSON.parse(settings) as EnterpriseSettings;
      if (!enterpriseSettings.enabled || !enterpriseSettings.dashboardUrl || !enterpriseSettings.apiKey) {
        return null;
      }
      
      return enterpriseSettings;
    } catch (error) {
      this.logger.error('Failed to load enterprise settings:', error);
      return null;
    }
  }

  public recordUsageEvent(event: Omit<UsageEvent, 'id' | 'timestamp'>): void {
    const settings = this.getEnterpriseSettings();
    if (!settings) return;

    const fullEvent: UsageEvent = {
      id: this.generateId(),
      timestamp: Date.now(),
      ...event
    };

    this.syncQueue.push(fullEvent);
    this.logger.info('Usage event queued for sync:', fullEvent.id);

    // Immediate sync for high-risk events
    if (fullEvent.riskLevel === 'high' || fullEvent.sensitiveDataDetected || fullEvent.apiKeyExposed) {
      this.syncImmediately();
    }
  }

  public recordSecurityAlert(alert: Omit<SecurityAlert, 'id' | 'timestamp'>): void {
    const settings = this.getEnterpriseSettings();
    if (!settings) return;

    const fullAlert: SecurityAlert = {
      id: this.generateId(),
      timestamp: Date.now(),
      ...alert
    };

    this.alertQueue.push(fullAlert);
    this.logger.warn('Security alert queued for sync:', fullAlert.id);

    // Immediate sync for critical alerts
    if (fullAlert.severity === 'critical' || fullAlert.severity === 'high') {
      this.syncImmediately();
    }
  }

  private async syncImmediately(): Promise<void> {
    if (this.syncQueue.length === 0 && this.alertQueue.length === 0) return;

    await this.performSync();
  }

  private startSyncScheduler(): void {
    // Sync every 5 minutes
    this.syncInterval = setInterval(() => {
      this.performSync();
    }, 5 * 60 * 1000);
  }

  private async performSync(): Promise<void> {
    const settings = this.getEnterpriseSettings();
    if (!settings) return;

    if (this.syncQueue.length === 0 && this.alertQueue.length === 0) return;

    try {
      const userProfile = this.getUserProfile();
      
      const syncData = {
        organizationId: settings.organizationId,
        userId: userProfile?.email || 'unknown',
        usageEvents: [...this.syncQueue],
        securityAlerts: [...this.alertQueue],
        userAnalytics: this.generateUserAnalytics(),
        lastSyncTime: this.lastSyncTime,
        clientVersion: '1.0.0',
        deviceInfo: {
          platform: process.platform,
          arch: process.arch,
          nodeVersion: process.version
        }
      };

      const response = await fetch(`${settings.dashboardUrl}/api/desktop-sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${settings.apiKey}`,
          'X-Dam-Client': 'desktop',
          'X-Dam-Version': '1.0.0'
        },
        body: JSON.stringify(syncData)
      });

      if (response.ok) {
        const result = await response.json();
        this.logger.info(`Sync successful: ${this.syncQueue.length} events, ${this.alertQueue.length} alerts`);
        
        // Clear synced items
        this.syncQueue = [];
        this.alertQueue = [];
        this.lastSyncTime = Date.now();

        // Process any policies or updates from dashboard
        if (result.policies) {
          this.processPolicyUpdates(result.policies);
        }
      } else {
        throw new Error(`Sync failed with status: ${response.status}`);
      }
    } catch (error) {
      this.logger.error('Dashboard sync failed:', error);
      
      // Limit queue size to prevent memory issues
      if (this.syncQueue.length > 1000) {
        this.syncQueue = this.syncQueue.slice(-500);
      }
      if (this.alertQueue.length > 100) {
        this.alertQueue = this.alertQueue.slice(-50);
      }
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

  private generateUserAnalytics(): UserAnalytics | null {
    const userProfile = this.getUserProfile();
    if (!userProfile) return null;

    // This would be enhanced with actual analytics from the monitoring service
    return {
      userId: userProfile.email || 'unknown',
      userEmail: userProfile.email || 'unknown',
      userRole: userProfile.role || 'unknown',
      totalPrompts: userProfile.xp || 0,
      totalTokens: 0, // Would be tracked from actual usage
      favoriteAITool: 'ChatGPT', // Would be calculated from usage patterns
      riskScore: 75, // Would be calculated from security events
      complianceScore: 90, // Would be calculated from compliance checks
      lastActivity: Date.now(),
      weeklyActivity: [], // Would be populated from actual data
      categoryBreakdown: [] // Would be populated from usage categories
    };
  }

  private processPolicyUpdates(policies: any[]): void {
    this.logger.info('Processing policy updates from dashboard:', policies.length);
    
    // Store policies for the monitoring service to use
    localStorage.setItem('damEnterprisePolicies', JSON.stringify(policies));
    
    // Notify other services about policy updates
    window.dispatchEvent(new CustomEvent('dam:policiesUpdated', { detail: policies }));
  }

  private generateId(): string {
    return `dam_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  public async testConnection(): Promise<boolean> {
    const settings = this.getEnterpriseSettings();
    if (!settings) return false;

    try {
      const response = await fetch(`${settings.dashboardUrl}/api/test-connection`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${settings.apiKey}`
        },
        body: JSON.stringify({
          organizationId: settings.organizationId,
          clientType: 'desktop'
        })
      });

      return response.ok;
    } catch (error) {
      this.logger.error('Dashboard connection test failed:', error);
      return false;
    }
  }

  public getQueueStatus(): { events: number; alerts: number; lastSync: number } {
    return {
      events: this.syncQueue.length,
      alerts: this.alertQueue.length,
      lastSync: this.lastSyncTime
    };
  }

  public destroy(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }
}