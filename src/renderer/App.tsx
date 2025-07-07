import React, { useState } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import { TitleBar } from './components/TitleBar';
import { Home } from './components/Home';
import { Dashboard } from './components/Dashboard';
import { Settings } from './components/Settings';
import { Sidebar } from './components/Sidebar';
import { useMonitoring } from './hooks/useMonitoring';
import { useAppVersion } from './hooks/useAppVersion';
import theme from './styles/theme';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'home' | 'dashboard' | 'settings'>('home');
  const { monitoringStatus } = useMonitoring();
  const version = useAppVersion();

  const renderCurrentView = () => {
    switch (currentView) {
      case 'home':
        return <Home />;
      case 'dashboard':
        return <Dashboard />;
      case 'settings':
        return <Settings />;
      default:
        return <Home />;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <TitleBar />
        <Box sx={{ display: 'flex', flexGrow: 1 }}>
          <Sidebar 
            currentView={currentView} 
            onViewChange={setCurrentView}
          />
          <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
            {renderCurrentView()}
          </Box>
        </Box>
        <Box sx={{ p: 1, textAlign: 'right', borderTop: '1px solid #ddd' }}>
          <span style={{ marginRight: '16px' }}>v{version}</span>
          <span>{monitoringStatus ? 'Monitoring Active' : 'Monitoring Inactive'}</span>
        </Box>
      </Box>
    </ThemeProvider>
  );
};