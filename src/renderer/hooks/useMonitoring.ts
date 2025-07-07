import { useState, useEffect } from 'react';

export const useMonitoring = () => {
  const [monitoringStatus, setMonitoringStatus] = useState(false);

  useEffect(() => {
    // Initialize monitoring status
    loadMonitoringStatus();
    
    // Listen for monitoring updates
    window.electronAPI.onMonitoringUpdate((data) => {
      setMonitoringStatus(data.active);
    });

    return () => {
      window.electronAPI.removeAllListeners('monitoring:update');
    };
  }, []);

  const loadMonitoringStatus = async () => {
    try {
      const status = await window.electronAPI.getMonitoringStatus();
      setMonitoringStatus(status.active);
    } catch (error) {
      console.error('Failed to load monitoring status:', error);
    }
  };

  const toggleMonitoring = async () => {
    try {
      if (monitoringStatus) {
        await window.electronAPI.stopMonitoring();
      } else {
        await window.electronAPI.startMonitoring();
      }
      // Status will be updated via the event listener
    } catch (error) {
      console.error('Failed to toggle monitoring:', error);
    }
  };

  return {
    monitoringStatus,
    toggleMonitoring
  };
};