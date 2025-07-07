import { desktopCapturer, screen, BrowserWindow } from 'electron';
import { Logger } from '../utils/Logger';
import * as path from 'path';
import * as fs from 'fs';

export interface ScreenCaptureResult {
  timestamp: number;
  imageData: string;
  activeWindow: string;
  screenId: string;
}

export class ScreenCaptureService {
  private static instance: ScreenCaptureService;
  private logger: Logger;
  private captureInterval: NodeJS.Timeout | null = null;
  private isCapturing = false;
  private captureCallback: ((capture: ScreenCaptureResult) => void) | null = null;

  private constructor() {
    this.logger = Logger.getInstance();
  }

  public static getInstance(): ScreenCaptureService {
    if (!ScreenCaptureService.instance) {
      ScreenCaptureService.instance = new ScreenCaptureService();
    }
    return ScreenCaptureService.instance;
  }

  public async startCapture(intervalMs: number = 5000, callback: (capture: ScreenCaptureResult) => void): Promise<void> {
    if (this.isCapturing) {
      this.logger.warn('Screen capture already in progress');
      return;
    }

    this.isCapturing = true;
    this.captureCallback = callback;

    // Initial capture
    await this.captureScreen();

    // Set up interval for continuous capture
    this.captureInterval = setInterval(async () => {
      await this.captureScreen();
    }, intervalMs);

    this.logger.info(`Screen capture started with ${intervalMs}ms interval`);
  }

  public stopCapture(): void {
    if (!this.isCapturing) {
      return;
    }

    if (this.captureInterval) {
      clearInterval(this.captureInterval);
      this.captureInterval = null;
    }

    this.isCapturing = false;
    this.captureCallback = null;
    this.logger.info('Screen capture stopped');
  }

  private async captureScreen(): Promise<void> {
    try {
      const sources = await desktopCapturer.getSources({
        types: ['screen'],
        thumbnailSize: { width: 1920, height: 1080 }
      });

      if (sources.length === 0) {
        this.logger.error('No screen sources available');
        return;
      }

      // Capture the primary display
      const primaryDisplay = screen.getPrimaryDisplay();
      const source = sources[0];

      // Get active window information
      const activeWindow = await this.getActiveWindowInfo();

      const captureResult: ScreenCaptureResult = {
        timestamp: Date.now(),
        imageData: source.thumbnail.toDataURL(),
        activeWindow: activeWindow.name,
        screenId: source.id
      };

      // Trigger callback with capture result
      if (this.captureCallback) {
        this.captureCallback(captureResult);
      }

    } catch (error) {
      this.logger.error('Error capturing screen:', error);
    }
  }

  private async getActiveWindowInfo(): Promise<{ name: string; bounds: any }> {
    try {
      const sources = await desktopCapturer.getSources({
        types: ['window'],
        thumbnailSize: { width: 150, height: 150 }
      });

      // Find the focused window (heuristic: usually the first in the list)
      if (sources.length > 0) {
        return {
          name: sources[0].name,
          bounds: null // Electron doesn't provide window bounds directly
        };
      }

      return { name: 'Unknown', bounds: null };
    } catch (error) {
      this.logger.error('Error getting active window info:', error);
      return { name: 'Unknown', bounds: null };
    }
  }

  public async captureSpecificWindow(windowName: string): Promise<ScreenCaptureResult | null> {
    try {
      const sources = await desktopCapturer.getSources({
        types: ['window'],
        thumbnailSize: { width: 1920, height: 1080 }
      });

      const targetWindow = sources.find(source => 
        source.name.toLowerCase().includes(windowName.toLowerCase())
      );

      if (!targetWindow) {
        this.logger.warn(`Window "${windowName}" not found`);
        return null;
      }

      return {
        timestamp: Date.now(),
        imageData: targetWindow.thumbnail.toDataURL(),
        activeWindow: targetWindow.name,
        screenId: targetWindow.id
      };
    } catch (error) {
      this.logger.error('Error capturing specific window:', error);
      return null;
    }
  }

  public async saveCapture(capture: ScreenCaptureResult, outputPath: string): Promise<void> {
    try {
      const base64Data = capture.imageData.replace(/^data:image\/png;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      
      await fs.promises.writeFile(outputPath, buffer);
      this.logger.info(`Screen capture saved to ${outputPath}`);
    } catch (error) {
      this.logger.error('Error saving capture:', error);
      throw error;
    }
  }
}