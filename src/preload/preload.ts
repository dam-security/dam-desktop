import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Environment variables (safely exposed)
  env: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
    CLAUDE_API_KEY: process.env.CLAUDE_API_KEY || '',
    LOG_LEVEL: process.env.LOG_LEVEL || 'info'
  },
  
  // Window controls
  minimizeWindow: () => ipcRenderer.invoke('window:minimize'),
  maximizeWindow: () => ipcRenderer.invoke('window:maximize'),
  closeWindow: () => ipcRenderer.invoke('window:close'),
  
  // App controls
  quitApp: () => ipcRenderer.invoke('app:quit'),
  getVersion: () => ipcRenderer.invoke('app:version'),
  
  // Database operations
  dbQuery: (query: string, params?: any[]) => ipcRenderer.invoke('db:query', query, params),
  
  // API Key management (secure storage)
  setAPIKey: (service: string, key: string) => ipcRenderer.invoke('apikey:set', service, key),
  getAPIKey: (service: string) => ipcRenderer.invoke('apikey:get', service),
  clearAPIKey: (service: string) => ipcRenderer.invoke('apikey:clear', service),
  
  // Monitoring controls
  startMonitoring: () => ipcRenderer.invoke('monitoring:start'),
  stopMonitoring: () => ipcRenderer.invoke('monitoring:stop'),
  getMonitoringStatus: () => ipcRenderer.invoke('monitoring:status'),
  
  // Event listeners
  onMonitoringUpdate: (callback: (data: any) => void) => {
    ipcRenderer.on('monitoring:update', (event, data) => callback(data));
  },
  
  onUsageAlert: (callback: (data: any) => void) => {
    ipcRenderer.on('usage:alert', (event, data) => callback(data));
  },
  
  onCostOptimization: (callback: (data: any) => void) => {
    ipcRenderer.on('cost:optimization', (event, data) => callback(data));
  },
  
  // Remove event listeners
  removeAllListeners: (channel: string) => {
    ipcRenderer.removeAllListeners(channel);
  }
});

// Define the API interface for TypeScript
declare global {
  interface Window {
    electronAPI: {
      env: {
        OPENAI_API_KEY: string;
        CLAUDE_API_KEY: string;
        LOG_LEVEL: string;
      };
      minimizeWindow: () => Promise<void>;
      maximizeWindow: () => Promise<void>;
      closeWindow: () => Promise<void>;
      quitApp: () => Promise<void>;
      getVersion: () => Promise<string>;
      dbQuery: (query: string, params?: any[]) => Promise<any>;
      setAPIKey: (service: string, key: string) => Promise<void>;
      getAPIKey: (service: string) => Promise<string>;
      clearAPIKey: (service: string) => Promise<void>;
      startMonitoring: () => Promise<void>;
      stopMonitoring: () => Promise<void>;
      getMonitoringStatus: () => Promise<any>;
      onMonitoringUpdate: (callback: (data: any) => void) => void;
      onUsageAlert: (callback: (data: any) => void) => void;
      onCostOptimization: (callback: (data: any) => void) => void;
      removeAllListeners: (channel: string) => void;
    };
  }
}