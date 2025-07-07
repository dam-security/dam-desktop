import Store from 'electron-store';
import { Logger } from '../utils/Logger';

interface ConfigSchema {
  monitoring: {
    autoStart: boolean;
    interval: number;
    enableScreenCapture: boolean;
    enableNetworkMonitoring: boolean;
  };
  ui: {
    theme: 'light' | 'dark' | 'system';
    minimizeToTray: boolean;
    showNotifications: boolean;
  };
  privacy: {
    storeContent: boolean;
    anonymizeData: boolean;
    dataRetentionDays: number;
  };
  enterprise: {
    organizationId: string | null;
    apiEndpoint: string | null;
    syncInterval: number;
  };
  alerts: {
    costThreshold: number;
    piiDetection: boolean;
    unusualUsage: boolean;
  };
}

export class ConfigService {
  private static instance: ConfigService;
  private store: Store<ConfigSchema>;
  private logger: Logger;

  private constructor() {
    this.logger = Logger.getInstance();
    this.store = new Store<ConfigSchema>({
      name: 'dam-desktop-config',
      defaults: {
        monitoring: {
          autoStart: true,
          interval: 30000, // 30 seconds
          enableScreenCapture: true,
          enableNetworkMonitoring: true
        },
        ui: {
          theme: 'system',
          minimizeToTray: true,
          showNotifications: true
        },
        privacy: {
          storeContent: false,
          anonymizeData: true,
          dataRetentionDays: 30
        },
        enterprise: {
          organizationId: null,
          apiEndpoint: null,
          syncInterval: 300000 // 5 minutes
        },
        alerts: {
          costThreshold: 10.0,
          piiDetection: true,
          unusualUsage: true
        }
      }
    });
  }

  public static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }

  public get<T>(key: string, defaultValue?: T): T {
    try {
      return this.store.get(key as any, defaultValue);
    } catch (error) {
      this.logger.error(`Failed to get config value for key: ${key}`, error);
      return defaultValue as T;
    }
  }

  public set(key: string, value: any): void {
    try {
      this.store.set(key as any, value);
      this.logger.info(`Config updated: ${key}`);
    } catch (error) {
      this.logger.error(`Failed to set config value for key: ${key}`, error);
    }
  }

  public delete(key: string): void {
    try {
      this.store.delete(key as any);
      this.logger.info(`Config deleted: ${key}`);
    } catch (error) {
      this.logger.error(`Failed to delete config value for key: ${key}`, error);
    }
  }

  public clear(): void {
    try {
      this.store.clear();
      this.logger.info('Config cleared');
    } catch (error) {
      this.logger.error('Failed to clear config', error);
    }
  }

  public getAll(): ConfigSchema {
    try {
      return this.store.store;
    } catch (error) {
      this.logger.error('Failed to get all config values', error);
      return this.store.store;
    }
  }

  public has(key: string): boolean {
    try {
      return this.store.has(key as any);
    } catch (error) {
      this.logger.error(`Failed to check config key: ${key}`, error);
      return false;
    }
  }

  public onDidChange(key: string, callback: (newValue: any, oldValue: any) => void): () => void {
    return this.store.onDidChange(key as any, callback);
  }

  public onDidAnyChange(callback: (newValue: any, oldValue: any) => void): () => void {
    return this.store.onDidAnyChange(callback);
  }

  public reset(): void {
    try {
      this.store.clear();
      this.logger.info('Config reset to defaults');
    } catch (error) {
      this.logger.error('Failed to reset config', error);
    }
  }

  public exportConfig(): string {
    try {
      return JSON.stringify(this.store.store, null, 2);
    } catch (error) {
      this.logger.error('Failed to export config', error);
      return '{}';
    }
  }

  public importConfig(configJson: string): void {
    try {
      const config = JSON.parse(configJson);
      this.store.store = config;
      this.logger.info('Config imported successfully');
    } catch (error) {
      this.logger.error('Failed to import config', error);
      throw new Error('Invalid config format');
    }
  }

  public validateConfig(): boolean {
    try {
      const config = this.store.store;
      
      // Basic validation
      if (!config.monitoring || typeof config.monitoring.autoStart !== 'boolean') {
        return false;
      }
      
      if (!config.ui || !['light', 'dark', 'system'].includes(config.ui.theme)) {
        return false;
      }
      
      if (!config.privacy || typeof config.privacy.dataRetentionDays !== 'number') {
        return false;
      }
      
      return true;
    } catch (error) {
      this.logger.error('Config validation failed', error);
      return false;
    }
  }
}