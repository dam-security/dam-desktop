import { BrowserWindow, Notification, screen, ipcMain } from 'electron';
import { Logger } from '../utils/Logger';
import { Suggestion, LearningOpportunity } from './AIContentAnalyzer';
import * as path from 'path';

export interface NotificationOptions {
  type: 'warning' | 'tip' | 'success' | 'error';
  title: string;
  message: string;
  suggestions?: Suggestion[];
  learningOpportunity?: LearningOpportunity;
  actions?: NotificationAction[];
  position?: 'top-right' | 'bottom-right' | 'center';
  duration?: number;
}

export interface NotificationAction {
  label: string;
  action: string;
  primary?: boolean;
  data?: any;
}

export class NotificationService {
  private static instance: NotificationService;
  private logger: Logger;
  private notificationWindow: BrowserWindow | null = null;
  private notificationQueue: NotificationOptions[] = [];
  private isShowingNotification = false;

  private constructor() {
    this.logger = Logger.getInstance();
    this.setupIPC();
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private setupIPC(): void {
    ipcMain.handle('notification:action', async (event, action: string) => {
      this.handleNotificationAction(action);
    });

    ipcMain.handle('notification:dismiss', async () => {
      this.dismissCurrentNotification();
    });
    
    ipcMain.handle('notification:copy', async (event, text: string) => {
      await this.copyToClipboard(text);
    });
    
    ipcMain.handle('notification:open-link', async (event, url: string) => {
      this.openExternalLink(url);
    });
  }

  public async showNotification(options: NotificationOptions): Promise<void> {
    this.logger.info(`Showing notification: ${options.type} - ${options.title}`);
    
    // Add to queue
    this.notificationQueue.push(options);
    
    // Process queue if not already showing
    if (!this.isShowingNotification) {
      await this.processNotificationQueue();
    }
  }

  private async processNotificationQueue(): Promise<void> {
    if (this.notificationQueue.length === 0) {
      this.isShowingNotification = false;
      return;
    }

    this.isShowingNotification = true;
    const notification = this.notificationQueue.shift()!;
    
    await this.createNotificationWindow(notification);
  }

  private async createNotificationWindow(options: NotificationOptions): Promise<void> {
    // Close existing notification window if any
    if (this.notificationWindow) {
      this.notificationWindow.close();
      this.notificationWindow = null;
    }

    const display = screen.getPrimaryDisplay();
    const { width: screenWidth, height: screenHeight } = display.workAreaSize;
    
    // Fixed window size with scrollable content
    const windowWidth = 480;
    const windowHeight = 600; // Fixed height, content will scroll
    
    // Calculate position
    let x = screenWidth - windowWidth - 20;
    let y = 20;
    
    if (options.position === 'bottom-right') {
      y = screenHeight - windowHeight - 20;
    } else if (options.position === 'center') {
      x = (screenWidth - windowWidth) / 2;
      y = (screenHeight - windowHeight) / 2;
    }

    this.notificationWindow = new BrowserWindow({
      width: windowWidth,
      height: windowHeight,
      x,
      y,
      frame: false,
      transparent: true,
      alwaysOnTop: true,
      skipTaskbar: true,
      resizable: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, '../preload/notification-preload.js')
      }
    });

    // Load notification HTML
    const notificationHTML = this.generateNotificationHTML(options);
    await this.notificationWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(notificationHTML)}`);

    // Auto-dismiss after duration
    if (options.duration !== -1) {
      setTimeout(() => {
        this.dismissCurrentNotification();
      }, options.duration || 10000);
    }

    this.notificationWindow.on('closed', () => {
      this.notificationWindow = null;
      // Process next notification in queue
      setTimeout(() => {
        this.processNotificationQueue();
      }, 500);
    });
  }

  private generateNotificationHTML(options: NotificationOptions): string {
    const typeColors = {
      warning: '#f59e0b',
      tip: '#3b82f6',
      success: '#10b981',
      error: '#ef4444'
    };

    const typeIcons = {
      warning: 'WARNING',
      tip: 'TIP',
      success: 'SUCCESS',
      error: 'ERROR'
    };

    return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: rgba(255, 255, 255, 0.85);
      backdrop-filter: blur(25px);
      -webkit-backdrop-filter: blur(25px);
      border-radius: 16px;
      border: 1px solid rgba(255, 255, 255, 0.4);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.2);
      overflow: hidden;
      height: 100vh;
      display: flex;
      flex-direction: column;
    }
    
    .notification {
      padding: 20px;
      animation: slideIn 0.3s ease-out;
      overflow-y: auto;
      flex: 1;
      max-height: calc(100vh - 40px);
    }
    
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    
    .header {
      display: flex;
      align-items: center;
      margin-bottom: 12px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.2);
      padding-bottom: 12px;
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
    }
    
    .icon {
      font-size: 24px;
      margin-right: 12px;
    }
    
    .title {
      flex: 1;
      font-size: 16px;
      font-weight: 600;
      color: #1e293b;
      text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
    }
    
    .close {
      cursor: pointer;
      font-size: 20px;
      color: rgba(100, 116, 139, 0.8);
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 6px;
      padding: 6px 8px;
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      transition: all 0.2s ease;
    }
    
    .close:hover {
      color: rgba(51, 65, 85, 0.9);
      background: rgba(255, 255, 255, 0.2);
      transform: scale(1.05);
    }
    
    .message {
      color: #475569;
      font-size: 14px;
      line-height: 1.5;
      margin-bottom: 16px;
      word-wrap: break-word;
      text-shadow: 0 1px 2px rgba(255, 255, 255, 0.6);
    }
    
    .suggestions {
      margin-bottom: 16px;
      max-height: 300px;
      overflow-y: auto;
    }
    
    .suggestion {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 12px;
      font-size: 13px;
      color: rgba(51, 65, 85, 0.9);
      border-left: 3px solid ${typeColors[options.type]};
      word-wrap: break-word;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    }
    
    .improved-prompt {
      margin-top: 12px;
      padding: 12px;
      background: rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border-radius: 6px;
      border: 1px solid rgba(255, 255, 255, 0.3);
    }
    
    .improved-prompt-label {
      font-weight: 600;
      color: rgba(30, 41, 59, 0.9);
      margin-bottom: 8px;
      font-size: 12px;
      text-shadow: 0 1px 2px rgba(255, 255, 255, 0.5);
    }
    
    .improved-prompt-text {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      padding: 8px;
      border-radius: 4px;
      font-family: 'SF Mono', Monaco, monospace;
      font-size: 12px;
      line-height: 1.4;
      color: rgba(51, 65, 85, 0.9);
      white-space: pre-wrap;
      word-wrap: break-word;
      margin-bottom: 8px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      max-height: 150px;
      overflow-y: auto;
    }
    
    .prompt-actions {
      display: flex;
      gap: 6px;
    }
    
    .button-small {
      padding: 4px 8px;
      font-size: 11px;
    }
    
    .learning-opportunity {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 16px;
      word-wrap: break-word;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    }
    
    .learning-title {
      font-weight: 600;
      color: rgba(30, 41, 59, 0.9);
      margin-bottom: 4px;
      font-size: 14px;
      text-shadow: 0 1px 2px rgba(255, 255, 255, 0.5);
    }
    
    .learning-description {
      color: rgba(71, 85, 105, 0.9);
      font-size: 13px;
      line-height: 1.4;
      text-shadow: 0 1px 2px rgba(255, 255, 255, 0.3);
    }
    
    .actions {
      display: flex;
      gap: 8px;
      justify-content: flex-end;
    }
    
    .button {
      padding: 8px 16px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 6px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
    }
    
    .button-primary {
      background: rgba(${typeColors[options.type] === '#f59e0b' ? '245, 158, 11' : typeColors[options.type] === '#3b82f6' ? '59, 130, 246' : typeColors[options.type] === '#10b981' ? '16, 185, 129' : '239, 68, 68'}, 0.8);
      color: white;
      border-color: rgba(255, 255, 255, 0.3);
    }
    
    .button-primary:hover {
      background: rgba(${typeColors[options.type] === '#f59e0b' ? '245, 158, 11' : typeColors[options.type] === '#3b82f6' ? '59, 130, 246' : typeColors[options.type] === '#10b981' ? '16, 185, 129' : '239, 68, 68'}, 0.9);
      transform: scale(1.02);
    }
    
    .button-secondary {
      background: rgba(255, 255, 255, 0.1);
      color: rgba(71, 85, 105, 0.9);
      border-color: rgba(255, 255, 255, 0.2);
    }
    
    .button-secondary:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: scale(1.02);
    }
    
    /* Custom scrollbar with glass effect */
    .notification::-webkit-scrollbar {
      width: 6px;
    }
    
    .notification::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 3px;
    }
    
    .notification::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.3);
      border-radius: 3px;
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
    }
    
    .notification::-webkit-scrollbar-thumb:hover {
      background: rgba(255, 255, 255, 0.5);
    }
    
    .suggestions::-webkit-scrollbar {
      width: 4px;
    }
    
    .suggestions::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 2px;
    }
    
    .suggestions::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.2);
      border-radius: 2px;
    }
    
    .improved-prompt-text::-webkit-scrollbar {
      width: 4px;
    }
    
    .improved-prompt-text::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 2px;
    }
    
    .improved-prompt-text::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.2);
      border-radius: 2px;
    }
  </style>
  <script>
    function dismissNotification() {
      try {
        if (window.electronAPI && window.electronAPI.dismissNotification) {
          window.electronAPI.dismissNotification();
        } else {
          // Fallback: close the window directly
          window.close();
        }
      } catch (error) {
        console.error('Error dismissing notification:', error);
        window.close();
      }
    }
    
    function handleAction(action) {
      try {
        if (window.electronAPI && window.electronAPI.handleAction) {
          window.electronAPI.handleAction(action);
        } else {
          console.warn('electronAPI not available for action:', action);
        }
      } catch (error) {
        console.error('Error handling action:', error);
      }
    }
    
    function copyImprovedPrompt(index) {
      try {
        const promptElement = document.getElementById('improved-prompt-' + index);
        const text = promptElement.textContent;
        
        if (window.electronAPI && window.electronAPI.copyToClipboard) {
          window.electronAPI.copyToClipboard(text);
        } else {
          // Fallback: use browser clipboard API
          navigator.clipboard.writeText(text).catch(() => {
            // Fallback: select and copy
            const selection = window.getSelection();
            const range = document.createRange();
            range.selectNodeContents(promptElement);
            selection.removeAllRanges();
            selection.addRange(range);
            document.execCommand('copy');
            selection.removeAllRanges();
          });
        }
        
        // Show feedback
        const originalText = promptElement.innerHTML;
        promptElement.innerHTML = 'Copied to clipboard!';
        setTimeout(() => {
          promptElement.innerHTML = originalText;
        }, 2000);
      } catch (error) {
        console.error('Error copying prompt:', error);
      }
    }
    
    function openLearningResource(url) {
      try {
        if (window.electronAPI && window.electronAPI.openExternalLink) {
          window.electronAPI.openExternalLink(url);
        } else {
          // Fallback: open in current window
          window.open(url, '_blank');
        }
      } catch (error) {
        console.error('Error opening learning resource:', error);
        window.open(url, '_blank');
      }
    }
  </script>
</head>
<body>
  <div class="notification">
    <div class="header">
      <span class="icon">${typeIcons[options.type]}</span>
      <h3 class="title">${options.title}</h3>
      <button class="close" onclick="dismissNotification()">×</button>
    </div>
    
    <div class="message">${options.message}</div>
    
    ${options.suggestions ? `
      <div class="suggestions">
        ${options.suggestions.map((s, index) => `
          <div class="suggestion">
            <strong>${s.title}:</strong> ${s.description}
            ${s.improvedPrompt ? `
              <div class="improved-prompt">
                <div class="improved-prompt-label">DAM suggests:</div>
                <div class="improved-prompt-text" id="improved-prompt-${index}">${s.improvedPrompt}</div>
                <div class="prompt-actions">
                  <button class="button button-small button-primary" onclick="copyImprovedPrompt(${index})">Copy</button>
                  <button class="button button-small button-secondary" onclick="openLearningResource('${s.learningResource}')">Learn More</button>
                </div>
              </div>
            ` : ''}
          </div>
        `).join('')}
      </div>
    ` : ''}
    
    ${options.learningOpportunity ? `
      <div class="learning-opportunity">
        <div class="learning-title">${options.learningOpportunity.title}</div>
        <div class="learning-description">${options.learningOpportunity.description}</div>
      </div>
    ` : ''}
    
    ${options.actions ? `
      <div class="actions">
        ${options.actions.map(action => `
          <button 
            class="button ${action.primary ? 'button-primary' : 'button-secondary'}"
            onclick="handleAction('${action.action}')"
          >
            ${action.label}
          </button>
        `).join('')}
      </div>
    ` : ''}
  </div>
</body>
</html>
    `;
  }

  private handleNotificationAction(action: string, data?: any): void {
    this.logger.info(`Notification action triggered: ${action}`, data);
    
    // Handle different actions
    switch (action) {
      case 'dismiss':
        this.dismissCurrentNotification();
        break;
        
      case 'copy_improved':
        if (data) {
          this.copyToClipboard(data);
          // Show brief success feedback
          setTimeout(() => {
            this.showNotification({
              type: 'success',
              title: 'Copied!',
              message: 'Improved prompt copied to clipboard',
              duration: 2000,
              position: 'bottom-right'
            });
          }, 500);
        }
        this.dismissCurrentNotification();
        break;
        
      case 'learn_more':
        this.openExternalLink('https://learnprompting.org/docs/intro');
        this.dismissCurrentNotification();
        break;
        
      case 'open_training':
        // Navigate to training section in main window
        const mainWindow = BrowserWindow.getAllWindows().find(w => !w.isDestroyed() && w.webContents);
        if (mainWindow) {
          mainWindow.webContents.send('navigate-to-training');
        }
        this.dismissCurrentNotification();
        break;
        
      case 'view_details':
        // Open security details in main window
        const detailsWindow = BrowserWindow.getAllWindows().find(w => !w.isDestroyed() && w.webContents);
        if (detailsWindow) {
          detailsWindow.webContents.send('show-security-details');
        }
        this.dismissCurrentNotification();
        break;
        
      case 'remove_sensitive':
        // Send message to main window to handle sensitive data removal
        const window = BrowserWindow.getAllWindows().find(w => !w.isDestroyed() && w.webContents);
        if (window) {
          window.webContents.send('remove-sensitive-data');
        }
        this.dismissCurrentNotification();
        break;
        
      // Legacy actions for backwards compatibility
      case 'copy_improved_prompt':
        this.copyToClipboard(data?.text || '');
        break;
      case 'open_learning_resource':
        this.openExternalLink(data?.url || '');
        break;
      case 'remove_sensitive_data':
        // Already handled above
        break;
      case 'improve_prompt':
        // Already handled above
        break;
      case 'publish_to_library':
        // TODO: Open DAM app library
        break;
        
      default:
        this.logger.warn(`Unknown notification action: ${action}`);
        this.dismissCurrentNotification();
    }
  }
  
  private async copyToClipboard(text: string): Promise<void> {
    try {
      const { clipboard } = require('electron');
      clipboard.writeText(text);
      this.logger.info('Text copied to clipboard');
    } catch (error) {
      this.logger.error('Failed to copy to clipboard:', error);
    }
  }
  
  private openExternalLink(url: string): void {
    try {
      const { shell } = require('electron');
      shell.openExternal(url);
      this.logger.info(`Opened external link: ${url}`);
    } catch (error) {
      this.logger.error('Failed to open external link:', error);
    }
  }

  private dismissCurrentNotification(): void {
    if (this.notificationWindow) {
      this.notificationWindow.close();
      this.notificationWindow = null;
    }
  }

  public async showQuickTip(title: string, message: string): Promise<void> {
    await this.showNotification({
      type: 'tip',
      title,
      message,
      duration: 5000
    });
  }

  public async showWarning(title: string, message: string, suggestions?: Suggestion[]): Promise<void> {
    await this.showNotification({
      type: 'warning',
      title,
      message,
      suggestions,
      actions: [
        { label: 'Fix Now', action: 'fix', primary: true },
        { label: 'Ignore', action: 'ignore' }
      ]
    });
  }

  public async showLearningOpportunity(opportunity: LearningOpportunity): Promise<void> {
    await this.showNotification({
      type: 'tip',
      title: 'Learning Opportunity',
      message: 'DAM noticed something that could help you use AI more effectively!',
      learningOpportunity: opportunity,
      actions: [
        { label: 'Learn More', action: 'learn_more', primary: true },
        { label: 'Not Now', action: 'dismiss' }
      ]
    });
  }
  
  public async showPromptImprovement(
    originalPrompt: string, 
    suggestions: Suggestion[], 
    aiTool: string
  ): Promise<void> {
    await this.showNotification({
      type: 'tip',
      title: 'DAM Can Improve Your Prompt',
      message: `Your prompt "${originalPrompt.substring(0, 30)}..." could be more effective. DAM has suggestions to help you get better results from ${aiTool}.`,
      suggestions,
      duration: -1, // Don't auto-dismiss
      actions: [
        { label: 'Apply Suggestions', action: 'improve_prompt', primary: true },
        { label: 'Keep Original', action: 'dismiss' }
      ]
    });
  }
}