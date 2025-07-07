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

export {};