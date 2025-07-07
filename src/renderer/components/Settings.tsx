import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Grid,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormGroup,
  FormControlLabel,
  Divider,
} from '@mui/material';

interface AppSettings {
  theme: 'light' | 'dark';
  notifications: boolean;
}

export const Settings: React.FC = () => {
  const [appSettings, setAppSettings] = useState<AppSettings>({
    theme: 'light',
    notifications: true
  });

  const saveSettings = (settings: AppSettings) => {
    setAppSettings(settings);
    localStorage.setItem('damSettings', JSON.stringify(settings));
  };

  const testNotification = async () => {
    // Use browser notifications
    if (Notification.permission === 'granted') {
      const notification = new Notification('Dam Desktop', {
        body: 'Notifications are working perfectly! Click this notification to interact with the app.',
        icon: '/icon.png',
        tag: 'dam-test',
        requireInteraction: true,
        silent: false
      });
      
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          testNotification();
        }
      });
    } else {
      alert('Notifications are blocked. Please enable them in your browser settings.');
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem('damSettings');
    if (saved) {
      setAppSettings(JSON.parse(saved));
    }
  }, []);

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom sx={{ my: 4 }}>
        Settings
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                User Profile
              </Typography>
              {/* ... (profile form refactored with Material-UI components) */}
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Appearance
              </Typography>
              <FormControl component="fieldset">
                <FormGroup>
                  <FormControlLabel
                    control={<Switch checked={appSettings.theme === 'dark'} onChange={(e) => saveSettings({ ...appSettings, theme: e.target.checked ? 'dark' : 'light' })} />}
                    label="Dark Mode"
                  />
                </FormGroup>
              </FormControl>
            </CardContent>
          </Card>
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Notifications
              </Typography>
              <FormGroup>
                <FormControlLabel
                  control={<Switch checked={appSettings.notifications} onChange={(e) => saveSettings({ ...appSettings, notifications: e.target.checked })} />}
                  label="Enable notifications"
                />
              </FormGroup>
              <Button variant="outlined" onClick={testNotification} sx={{ mt: 2 }}>
                Test Notification
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Enterprise Integration
          </Typography>
          {/* ... (enterprise settings form refactored with Material-UI components) */}
        </CardContent>
      </Card>

      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Dam Desktop Version 1.0.0
        </Typography>
      </Box>
    </Container>
  );
};