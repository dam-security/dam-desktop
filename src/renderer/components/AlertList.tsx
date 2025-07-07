import React from 'react';
import {
  Alert,
  AlertTitle,
  Box,
  Typography
} from '@mui/material';

interface AlertItem {
  id?: number;
  type: string;
  message: string;
  severity: 'info' | 'warning' | 'error';
}

interface AlertListProps {
  alerts: AlertItem[];
}

export const AlertList: React.FC<AlertListProps> = ({ alerts }) => {
  if (alerts.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', p: 2 }}>
        <Typography variant="h6">✅</Typography>
        <Typography>No alerts at this time</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {alerts.map((alert, index) => (
        <Alert key={index} severity={alert.severity} sx={{ mb: 2 }}>
          <AlertTitle>{alert.type}</AlertTitle>
          {alert.message}
        </Alert>
      ))}
    </Box>
  );
};