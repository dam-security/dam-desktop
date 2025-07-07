import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  dismissNotification: () => ipcRenderer.invoke('notification:dismiss'),
  handleAction: (action: string) => ipcRenderer.invoke('notification:action', action),
  copyToClipboard: (text: string) => ipcRenderer.invoke('notification:copy', text),
  openExternalLink: (url: string) => ipcRenderer.invoke('notification:open-link', url)
});

declare global {
  interface Window {
    electronAPI: {
      dismissNotification: () => Promise<void>;
      handleAction: (action: string) => Promise<void>;
      copyToClipboard: (text: string) => Promise<void>;
      openExternalLink: (url: string) => Promise<void>;
    };
  }
}