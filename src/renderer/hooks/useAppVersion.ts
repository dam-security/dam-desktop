import { useState, useEffect } from 'react';

export const useAppVersion = () => {
  const [version, setVersion] = useState('1.0.0');

  useEffect(() => {
    loadVersion();
  }, []);

  const loadVersion = async () => {
    try {
      const appVersion = await window.electronAPI.getVersion();
      setVersion(appVersion);
    } catch (error) {
      console.error('Failed to load app version:', error);
    }
  };

  return version;
};