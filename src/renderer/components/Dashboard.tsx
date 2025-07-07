import React from 'react';
import {
  Container,
  Typography,
  Box,
} from '@mui/material';
import { MetricCard } from './MetricCard';
import { UsageChart } from './UsageChart';
import { AlertList } from './AlertList';
import { AIToolsCatalog } from './AIToolsCatalog';

const placeholderDashboardData = {
  costSavings: 1234,
  totalPrompts: 847,
  streak: 7,
  favoriteAITool: 'ChatGPT',
  weeklyActivity: [
    { name: 'Mon', prompts: 30 },
    { name: 'Tue', prompts: 45 },
    { name: 'Wed', prompts: 22 },
    { name: 'Thu', prompts: 50 },
    { name: 'Fri', prompts: 35 },
    { name: 'Sat', prompts: 15 },
    { name: 'Sun', prompts: 8 },
  ],
  alerts: [
    { id: 1, type: 'update', message: 'New version of Claude 3 is available.', severity: 'info' as const },
    { id: 2, type: 'warning', message: 'Your API key for OpenAI is expiring soon.', severity: 'warning' as const },
  ],
};

export const Dashboard: React.FC = () => {
  const data = placeholderDashboardData;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Your AI Dashboard
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(4, 1fr)',
          },
          gap: 3,
          mb: 4,
        }}
      >
        <MetricCard
          title="Cost Savings"
          value={`${data.costSavings}`}
          trend="+8%"
          trendDirection="up"
        />
        <MetricCard
          title="Total Prompts"
          value={data.totalPrompts}
          trend="+15%"
          trendDirection="up"
        />
        <MetricCard
          title="Productivity Streak"
          value={`${data.streak} days`}
          trend="-2 days"
          trendDirection="down"
        />
        <MetricCard
          title="Favorite AI Tool"
          value={data.favoriteAITool}
        />
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            md: '2fr 1fr',
          },
          gap: 3,
          mb: 4,
        }}
      >
        <UsageChart data={data.weeklyActivity} />
        <AlertList alerts={data.alerts} />
      </Box>

      <Box>
        <AIToolsCatalog />
      </Box>
    </Container>
  );
};
