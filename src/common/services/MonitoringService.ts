import { BrowserWindow, desktopCapturer } from 'electron';
import { Logger } from '../utils/Logger';
import { DatabaseService } from './DatabaseService';
import { AIDetectionService } from './AIDetectionService';
import { ScreenCaptureService } from './ScreenCaptureService';
import { OCRService } from './OCRService';
import { AIContentAnalyzer } from './AIContentAnalyzer';
import { NotificationService } from './NotificationService';
import { AIWindowDetector } from './AIWindowDetector';
import { NotificationSettings } from './NotificationSettings';

export class MonitoringService {
  private static instance: MonitoringService;
  private isActive = false;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private logger: Logger;
  private databaseService: DatabaseService;
  private aiDetectionService: AIDetectionService;
  private screenCaptureService: ScreenCaptureService;
  private ocrService: OCRService;
  private contentAnalyzer: AIContentAnalyzer;
  private notificationService: NotificationService;
  private aiWindowDetector: AIWindowDetector;
  private notificationSettings: NotificationSettings;
  private currentSessionId: number | null = null;
  private lastAnalysisTime = 0;
  private analysisThrottleMs = 3000; // Analyze at most every 3 seconds to reduce annoyance
  private lastNotificationTime = 0;
  private notificationThrottleMs = 30000; // At least 30 seconds between notifications

  private constructor() {
    this.logger = Logger.getInstance();
    this.databaseService = DatabaseService.getInstance();
    this.aiDetectionService = AIDetectionService.getInstance();
    this.screenCaptureService = ScreenCaptureService.getInstance();
    this.ocrService = OCRService.getInstance();
    this.contentAnalyzer = AIContentAnalyzer.getInstance();
    this.notificationService = NotificationService.getInstance();
    this.aiWindowDetector = AIWindowDetector.getInstance();
    this.notificationSettings = NotificationSettings.getInstance();
  }

  public static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService();
    }
    return MonitoringService.instance;
  }

  public async initialize(): Promise<void> {
    try {
      await this.aiDetectionService.initialize();
      await this.ocrService.initialize();
      this.logger.info('Monitoring service initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize monitoring service:', error);
      throw error;
    }
  }

  public async start(): Promise<void> {
    if (this.isActive) {
      this.logger.warn('Monitoring service is already active');
      return;
    }

    try {
      this.isActive = true;
      await this.startMonitoringSession();
      this.startScreenCapture();
      
      this.logger.info('Monitoring service started');
      this.notifyStatusChange();
    } catch (error) {
      this.logger.error('Failed to start monitoring service:', error);
      this.isActive = false;
      throw error;
    }
  }

  public async stop(): Promise<void> {
    if (!this.isActive) {
      this.logger.warn('Monitoring service is not active');
      return;
    }

    try {
      this.isActive = false;
      
      this.screenCaptureService.stopCapture();
      await this.endMonitoringSession();
      
      this.logger.info('Monitoring service stopped');
      this.notifyStatusChange();
    } catch (error) {
      this.logger.error('Failed to stop monitoring service:', error);
      throw error;
    }
  }

  public getStatus(): { active: boolean; sessionId: number | null } {
    return {
      active: this.isActive,
      sessionId: this.currentSessionId
    };
  }

  public async triggerAnalysis(): Promise<void> {
    this.logger.info('Manual analysis triggered');
    try {
      // Capture current screen
      const capture = await this.screenCaptureService.captureSpecificWindow('');
      if (capture) {
        await this.analyzeScreenCapture(capture);
      } else {
        this.logger.warn('No screen capture available for manual analysis');
      }
    } catch (error) {
      this.logger.error('Error during manual analysis:', error);
    }
  }

  private async startMonitoringSession(): Promise<void> {
    try {
      const result = await this.databaseService.run(
        'INSERT INTO monitoring_sessions (user_id, start_time) VALUES (?, ?)',
        [1, new Date().toISOString()] // TODO: Use actual user ID
      );
      
      this.currentSessionId = result.lastID;
      this.logger.info(`Started monitoring session ${this.currentSessionId}`);
    } catch (error) {
      this.logger.error('Failed to start monitoring session:', error);
      throw error;
    }
  }

  private async endMonitoringSession(): Promise<void> {
    if (!this.currentSessionId) return;

    try {
      await this.databaseService.run(
        'UPDATE monitoring_sessions SET end_time = ? WHERE id = ?',
        [new Date().toISOString(), this.currentSessionId]
      );
      
      this.logger.info(`Ended monitoring session ${this.currentSessionId}`);
      this.currentSessionId = null;
    } catch (error) {
      this.logger.error('Failed to end monitoring session:', error);
    }
  }

  private startScreenCapture(): void {
    // Start screen capture with analysis callback
    this.screenCaptureService.startCapture(5000, async (capture) => {
      await this.analyzeScreenCapture(capture);
    });
  }

  private async analyzeScreenCapture(capture: any): Promise<void> {
    try {
      // Throttle analysis to avoid overwhelming the system
      const now = Date.now();
      if (now - this.lastAnalysisTime < this.analysisThrottleMs) {
        return;
      }
      this.lastAnalysisTime = now;

      // First check if this is an AI window we should monitor
      const aiWindowInfo = this.aiWindowDetector.detectAIWindow(capture.activeWindow, '');
      
      if (!aiWindowInfo.isAIWindow) {
        this.logger.info(`Not an AI window, skipping analysis: ${capture.activeWindow}`);
        return;
      }

      this.logger.info(`Analyzing AI window: ${aiWindowInfo.platform} - ${capture.activeWindow}`);

      // Extract text from screen capture using OCR
      const ocrResult = await this.ocrService.extractText(capture);
      
      this.logger.info(`OCR extracted ${ocrResult.text.length} characters of text`);
      
      // Skip analysis if no text extracted
      if (!ocrResult.text || ocrResult.text.trim().length === 0) {
        this.logger.info('No text extracted, skipping analysis');
        return;
      }

      // Analyze content for risks and opportunities
      const analysis = await this.contentAnalyzer.analyzeContent(capture, ocrResult.text);
      
      this.logger.info(`Analysis complete - Risk: ${analysis.riskLevel}, AI Tool: ${analysis.aiToolDetected}, Prompt Quality: ${analysis.promptQuality}`);
      
      // Record the analysis
      await this.recordAnalysis(analysis, ocrResult);
      
      // Check if we should show a notification
      const shouldNotify = this.aiWindowDetector.shouldShowNotification(aiWindowInfo, analysis);
      
      if (shouldNotify && this.canShowNotification()) {
        await this.handleAnalysisResults(analysis);
      }
      
    } catch (error) {
      this.logger.error('Error during screen analysis:', error);
    }
  }

  private async getActiveWindowInfo(): Promise<any> {
    try {
      // Get screen sources to identify active applications
      const sources = await desktopCapturer.getSources({
        types: ['window'],
        thumbnailSize: { width: 150, height: 150 }
      });

      // Filter for relevant windows (browsers, AI tools, etc.)
      const relevantWindows = sources.filter(source => {
        const name = source.name.toLowerCase();
        return name.includes('chrome') || 
               name.includes('firefox') || 
               name.includes('safari') || 
               name.includes('edge') ||
               name.includes('chatgpt') ||
               name.includes('claude') ||
               name.includes('copilot');
      });

      return {
        timestamp: Date.now(),
        activeWindows: relevantWindows.map(source => ({
          id: source.id,
          name: source.name,
          thumbnail: source.thumbnail.toDataURL()
        }))
      };
    } catch (error) {
      this.logger.error('Failed to get active window info:', error);
      return { timestamp: Date.now(), activeWindows: [] };
    }
  }

  private async recordAIUsage(usageData: any[]): Promise<void> {
    try {
      for (const usage of usageData) {
        await this.databaseService.run(
          `INSERT INTO ai_usage (user_id, ai_tool, usage_type, content_hash, tokens_used, cost_estimate, metadata) 
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            1, // TODO: Use actual user ID
            usage.tool,
            usage.type,
            usage.contentHash,
            usage.tokensUsed || 0,
            usage.costEstimate || 0,
            JSON.stringify(usage.metadata || {})
          ]
        );
      }
      
      this.logger.info(`Recorded ${usageData.length} AI usage events`);
    } catch (error) {
      this.logger.error('Failed to record AI usage:', error);
    }
  }

  private async checkPolicyCompliance(usageData: any[]): Promise<void> {
    try {
      // TODO: Implement policy compliance checking
      // This would check against organization policies and trigger alerts
      
      for (const usage of usageData) {
        if (usage.hasPII) {
          await this.createAlert('compliance', 'error', 'PII detected in AI conversation');
        }
        
        if (usage.costEstimate > 10) {
          await this.createAlert('cost', 'warning', 'High cost AI usage detected');
        }
      }
    } catch (error) {
      this.logger.error('Failed to check policy compliance:', error);
    }
  }

  private async recordAnalysis(analysis: any, ocrResult: any): Promise<void> {
    try {
      // Record AI usage if detected
      if (analysis.aiToolDetected) {
        await this.databaseService.run(
          `INSERT INTO ai_usage (user_id, ai_tool, usage_type, content_hash, metadata) 
           VALUES (?, ?, ?, ?, ?)`,
          [
            1, // TODO: Use actual user ID
            analysis.aiToolDetected,
            'screen_detected',
            this.generateContentHash(ocrResult.text),
            JSON.stringify({
              riskLevel: analysis.riskLevel,
              promptQuality: analysis.promptQuality,
              timestamp: analysis.timestamp
            })
          ]
        );
      }

      // Create alerts for high/critical risks
      if (analysis.riskLevel === 'high' || analysis.riskLevel === 'critical') {
        await this.createAlert(
          'security_risk',
          analysis.riskLevel,
          `${analysis.riskLevel.toUpperCase()} risk detected: ${analysis.sensitiveDataTypes.join(', ')}`
        );
      }
      
    } catch (error) {
      this.logger.error('Failed to record analysis:', error);
    }
  }

  private async handleAnalysisResults(analysis: any): Promise<void> {
    try {
      const prefs = this.notificationSettings.getPreferences();
      const frequencyMultiplier = this.notificationSettings.getFrequencyMultiplier();
      
      // Update last notification time
      this.lastNotificationTime = Date.now();

      // Critical alerts - always show if enabled
      if (analysis.riskLevel === 'critical' && prefs.criticalAlerts) {
        await this.notificationService.showNotification({
          type: 'error',
          title: '🚨 Critical Security Risk',
          message: `You're about to share sensitive data (${analysis.sensitiveDataTypes.join(', ')}) with an AI service. This could violate privacy policies.`,
          suggestions: analysis.suggestions,
          position: prefs.position,
          duration: -1, // Don't auto-dismiss critical alerts
          actions: [
            { label: 'Remove Sensitive Data', action: 'remove_sensitive', primary: true },
            { label: 'I Understand the Risk', action: 'dismiss' }
          ]
        });
        return;
      }

      // High risk warnings
      if (analysis.riskLevel === 'high' && prefs.securityWarnings) {
        await this.notificationService.showNotification({
          type: 'warning',
          title: 'Security Risk Detected',
          message: 'Sensitive information detected in your AI conversation.',
          suggestions: analysis.suggestions,
          position: prefs.position,
          actions: [
            { label: 'View Details', action: 'view_details', primary: true },
            { label: 'Dismiss', action: 'dismiss' }
          ]
        });
        return;
      }

      // Prompt suggestions - only if enabled and passes frequency check
      if (prefs.promptSuggestions && analysis.promptQuality === 'poor' && Math.random() < frequencyMultiplier) {
        const promptSuggestions = analysis.suggestions.filter((s: any) => s.type === 'quality');
        if (promptSuggestions.length > 0 && promptSuggestions[0].improvedPrompt) {
          await this.notificationService.showNotification({
            type: 'tip',
            title: 'Improve Your Prompt',
            message: 'Dam can help make your prompt more effective.',
            suggestions: promptSuggestions,
            position: prefs.position,
            duration: 10000,
            actions: [
              { label: 'Copy Improved Prompt', action: 'copy_improved', primary: true, data: promptSuggestions[0].improvedPrompt },
              { label: 'Learn More', action: 'learn_more' },
              { label: 'Dismiss', action: 'dismiss' }
            ]
          });
          return;
        }
      }

      // Learning tips - only if enabled and rarely
      if (prefs.learningTips && analysis.learningOpportunity && Math.random() < frequencyMultiplier * 0.5) {
        await this.notificationService.showNotification({
          type: 'tip',
          title: analysis.learningOpportunity.title,
          message: analysis.learningOpportunity.description,
          learningOpportunity: analysis.learningOpportunity,
          position: prefs.position,
          duration: 8000,
          actions: [
            { label: 'Learn More', action: 'open_training', primary: true },
            { label: 'Not Now', action: 'dismiss' }
          ]
        });
      }

    } catch (error) {
      this.logger.error('Failed to handle analysis results:', error);
    }
  }

  private isLibraryWorthy(analysis: any): boolean {
    // Simple heuristics for detecting potentially shareable AI-generated content
    const keywords = ['app', 'function', 'script', 'tool', 'solution', 'feature', 'algorithm'];
    const text = analysis.extractedText?.toLowerCase() || '';
    
    return keywords.some(keyword => text.includes(keyword)) &&
           analysis.aiToolDetected &&
           analysis.promptQuality !== 'poor';
  }

  private generateContentHash(content: string): string {
    // Simple hash function for content tracking
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  private canShowNotification(): boolean {
    const now = Date.now();
    const timeSinceLastNotification = now - this.lastNotificationTime;
    
    // Check throttle time
    if (timeSinceLastNotification < this.notificationThrottleMs) {
      return false;
    }
    
    // Check notification settings
    const prefs = this.notificationSettings.getPreferences();
    return prefs.enabled;
  }

  private async createAlert(type: string, severity: string, message: string): Promise<void> {
    try {
      await this.databaseService.run(
        'INSERT INTO alerts (user_id, type, severity, message) VALUES (?, ?, ?, ?)',
        [1, type, severity, message] // TODO: Use actual user ID
      );
      
      this.logger.info(`Created alert: ${type} - ${message}`);
    } catch (error) {
      this.logger.error('Failed to create alert:', error);
    }
  }

  private notifyStatusChange(): void {
    // Send status update to all renderer processes
    const allWindows = BrowserWindow.getAllWindows();
    allWindows.forEach(window => {
      window.webContents.send('monitoring:update', this.getStatus());
    });
  }
}