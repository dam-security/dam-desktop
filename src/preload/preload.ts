import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Window controls
  minimizeWindow: () => ipcRenderer.invoke('window:minimize'),
  maximizeWindow: () => ipcRenderer.invoke('window:maximize'),
  closeWindow: () => ipcRenderer.invoke('window:close'),
  
  // App controls
  quitApp: () => ipcRenderer.invoke('app:quit'),
  getVersion: () => ipcRenderer.invoke('app:version'),
  
  // Database operations
  dbQuery: (query: string, params?: any[]) => ipcRenderer.invoke('db:query', query, params),
  
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
      minimizeWindow: () => Promise<void>;
      maximizeWindow: () => Promise<void>;
      closeWindow: () => Promise<void>;
      quitApp: () => Promise<void>;
      getVersion: () => Promise<string>;
      dbQuery: (query: string, params?: any[]) => Promise<any>;
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