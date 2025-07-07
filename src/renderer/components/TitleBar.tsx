import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

export const TitleBar: React.FC = () => {
  return (
    <AppBar position="static" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, '--webkit-app-region': 'drag' }}>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          DAM Desktop
        </Typography>
      </Toolbar>
    </AppBar>
  );
};