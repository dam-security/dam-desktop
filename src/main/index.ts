import { app, BrowserWindow, ipcMain, Menu, Tray, globalShortcut, nativeImage } from 'electron';
import * as path from 'path';
import { DatabaseService } from '../common/services/DatabaseService';
import { MonitoringService } from '../common/services/MonitoringService';
import { ConfigService } from '../common/services/ConfigService';
import { Logger } from '../common/utils/Logger';

// Extend app with custom property
declare global {
  namespace Electron {
    interface App {
      isQuiting?: boolean;
    }
  }
}

class DAMDesktopApp {
  private mainWindow: BrowserWindow | null = null;
  private tray: Tray | null = null;
  private databaseService: DatabaseService;
  private monitoringService: MonitoringService;
  private configService: ConfigService;
  private logger: Logger;

  constructor() {
    this.logger = Logger.getInstance();
    this.configService = ConfigService.getInstance();
    this.databaseService = DatabaseService.getInstance();
    this.monitoringService = MonitoringService.getInstance();
    
    this.initializeApp();
  }

  private initializeApp(): void {
    // Handle app ready
    app.whenReady().then(() => {
      this.createMainWindow();
      this.setupTray();
      this.setupGlobalShortcuts();
      this.setupIPC();
      this.startBackgroundServices();
    });

    // Handle window closed
    app.on('window-all-closed', () => {
      // On macOS, keep app running even when all windows are closed
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });

    // Handle app activation
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        this.createMainWindow();
      }
    });

    // Handle before quit
    app.on('before-quit', async () => {
      await this.cleanup();
    });

    // Handle uncaught exceptions gracefully
    process.on('uncaughtException', (error) => {
      this.logger.error('Uncaught exception:', error);
      // Don't exit the app, just log the error
    });

    process.on('unhandledRejection', (reason, promise) => {
      this.logger.error('Unhandled rejection at:', promise, 'reason:', reason);
      // Don't exit the app, just log the error
    });
  }

  private createMainWindow(): void {
    this.mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      minWidth: 800,
      minHeight: 600,
      show: false, // Will show after loading
      center: true,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, '../preload/preload.js'),
        sandbox: false,
        devTools: true
      },
      titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
      trafficLightPosition: { x: 20, y: 20 },
      icon: this.getAppIcon(),
      backgroundColor: '#f8fafc' // Prevent white flash
    });

    // Load the app
    const htmlPath = path.join(__dirname, '../renderer/index.html');
    this.logger.info(`Loading renderer from: ${htmlPath}`);
    
    // Check if file exists
    const fs = require('fs');
    if (fs.existsSync(htmlPath)) {
      this.logger.info('Renderer HTML file exists');
    } else {
      this.logger.error('Renderer HTML file does not exist!');
    }
    
    this.mainWindow.loadFile(htmlPath)
      .then(() => {
        this.logger.info('Renderer loaded successfully');
        // Show window after content is loaded
        this.mainWindow?.show();
        this.mainWindow?.focus();
        this.mainWindow?.center();
      })
      .catch((error) => {
        this.logger.error('Failed to load renderer:', error);
        // Still show window so user can see the error
        this.mainWindow?.show();
      });
    
    // Listen for renderer process console messages
    this.mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
      this.logger.info(`Renderer Console [${level}]: ${message} (${sourceId}:${line})`);
    });
    
    // Listen for renderer crashes
    this.mainWindow.webContents.on('render-process-gone', (event, details) => {
      this.logger.error('Renderer process crashed:', details);
    });
    
    // Listen for unresponsive renderer
    this.mainWindow.webContents.on('unresponsive', () => {
      this.logger.warn('Renderer process became unresponsive');
    });

    // Handle window events
    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });

    // For testing, don't hide the window on close
    this.mainWindow.on('close', (event) => {
      // During development, just close normally
      // if (!app.isQuiting) {
      //   event.preventDefault();
      //   this.mainWindow?.hide();
      // }
    });
  }

  private setupTray(): void {
    try {
      // Create a beaver face icon
      const trayIcon = this.createBeaverIcon();
      
      this.tray = new Tray(trayIcon);
      
      const contextMenu = Menu.buildFromTemplate([
        {
          label: 'Show DAM Desktop',
          click: () => {
            this.showMainWindow();
          }
        },
        {
          label: '🧪 Test Notification',
          click: () => {
            this.testNotification();
          }
        },
        {
          label: 'Usage Stats',
          click: () => {
            this.showUsageStats();
          }
        },
        { type: 'separator' },
        {
          label: 'Settings',
          click: () => {
            this.showSettings();
          }
        },
        { type: 'separator' },
        {
          label: 'Quit',
          click: () => {
            app.isQuiting = true;
            app.quit();
          }
        }
      ]);

      this.tray.setToolTip('DAM Desktop - AI Usage Intelligence');
      this.tray.setContextMenu(contextMenu);
      
      // Add both click and right-click handlers
      this.tray.on('click', () => {
        this.toggleMainWindow();
      });
      
      this.tray.on('right-click', () => {
        this.tray?.popUpContextMenu();
      });
      
      this.logger.info('System tray setup completed');
    } catch (error) {
      this.logger.error('Failed to setup system tray:', error);
    }
  }

  private setupGlobalShortcuts(): void {
    // Register global shortcut Ctrl/Cmd + Alt + P
    globalShortcut.register('CommandOrControl+Alt+P', () => {
      this.toggleMainWindow();
    });

    // Register quick stats shortcut
    globalShortcut.register('CommandOrControl+Alt+S', () => {
      this.showQuickStats();
    });

    // Register test notification shortcut for debugging
    globalShortcut.register('CommandOrControl+Alt+T', () => {
      this.testNotification();
    });
  }

  private setupIPC(): void {
    // Window control
    ipcMain.handle('window:minimize', () => {
      this.mainWindow?.minimize();
    });

    ipcMain.handle('window:maximize', () => {
      if (this.mainWindow?.isMaximized()) {
        this.mainWindow.unmaximize();
      } else {
        this.mainWindow?.maximize();
      }
    });

    ipcMain.handle('window:close', () => {
      this.mainWindow?.hide();
    });

    // App control
    ipcMain.handle('app:quit', () => {
      app.quit();
    });

    ipcMain.handle('app:version', () => {
      return app.getVersion();
    });

    // Database operations
    ipcMain.handle('db:query', async (event, query: string, params?: any[]) => {
      return await this.databaseService.query(query, params);
    });

    // Monitoring control
    ipcMain.handle('monitoring:start', () => {
      this.monitoringService.start();
    });

    ipcMain.handle('monitoring:stop', () => {
      this.monitoringService.stop();
    });

    ipcMain.handle('monitoring:status', () => {
      return this.monitoringService.getStatus();
    });
  }

  private async startBackgroundServices(): Promise<void> {
    try {
      await this.databaseService.initialize();
      await this.monitoringService.initialize();
      
      // Start monitoring automatically if enabled
      if (this.configService.get('monitoring.autoStart', true)) {
        this.monitoringService.start();
      }
      
      this.logger.info('Background services started successfully');
    } catch (error) {
      this.logger.error('Failed to start background services:', error);
    }
  }

  private showMainWindow(): void {
    if (this.mainWindow) {
      this.mainWindow.show();
      this.mainWindow.focus();
    } else {
      this.createMainWindow();
    }
  }

  private toggleMainWindow(): void {
    if (this.mainWindow?.isVisible()) {
      this.mainWindow.hide();
    } else {
      this.showMainWindow();
    }
  }

  private showUsageStats(): void {
    // TODO: Implement usage stats window
    this.showMainWindow();
  }

  private showSettings(): void {
    // TODO: Implement settings window
    this.showMainWindow();
  }

  private showQuickStats(): void {
    // TODO: Implement quick stats popup
    this.logger.info('Quick stats requested');
  }

  private async testNotification(): Promise<void> {
    this.logger.info('Test notification triggered');
    
    // Import the notification service directly to force a test notification
    const { NotificationService } = await import('../common/services/NotificationService');
    const notificationService = NotificationService.getInstance();
    
    // Force show a test notification
    await notificationService.showNotification({
      type: 'warning',
      title: '🚨 Test Security Alert',
      message: 'This is a test notification to verify DAM Desktop is working correctly.',
      suggestions: [
        {
          type: 'security',
          title: 'Test Suggestion',
          description: 'This is a test suggestion to demonstrate the notification system.',
          actionable: true,
          priority: 'high'
        }
      ],
      actions: [
        { label: 'Got It!', action: 'dismiss', primary: true },
        { label: 'Learn More', action: 'learn_more' }
      ],
      duration: 10000
    });
    
    this.logger.info('Test notification should now be visible');
  }

  private getAppIcon(): Electron.NativeImage {
    const iconPath = path.join(__dirname, '../../assets/icon.png');
    return nativeImage.createFromPath(iconPath);
  }

  private createBeaverIcon(): Electron.NativeImage {
    try {
      // Try to use canvas to create a beaver icon
      const canvas = require('canvas');
      const canvasEl = canvas.createCanvas(16, 16);
      const ctx = canvasEl.getContext('2d');
      
      // Brown background for beaver face
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(2, 2, 12, 12);
      
      // Eyes (black dots)
      ctx.fillStyle = '#000000';
      ctx.fillRect(4, 5, 2, 2);
      ctx.fillRect(10, 5, 2, 2);
      
      // Nose (darker brown)
      ctx.fillStyle = '#654321';
      ctx.fillRect(7, 8, 2, 1);
      
      // Teeth (white)
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(6, 10, 1, 2);
      ctx.fillRect(9, 10, 1, 2);
      
      // Convert canvas to buffer and create nativeImage
      const buffer = canvasEl.toBuffer('image/png');
      return nativeImage.createFromBuffer(buffer);
    } catch (error) {
      this.logger.warn('Failed to create canvas beaver icon, using fallback:', error);
      
      // Fallback: Create a simple colored square
      const image = nativeImage.createEmpty();
      const size = { width: 16, height: 16 };
      return image.resize(size);
    }
  }

  private async cleanup(): Promise<void> {
    try {
      globalShortcut.unregisterAll();
      await this.monitoringService.stop();
      await this.databaseService.close();
      this.logger.info('App cleanup completed');
    } catch (error) {
      this.logger.error('Error during cleanup:', error);
    }
  }
}

// Initialize the application
new DAMDesktopApp();