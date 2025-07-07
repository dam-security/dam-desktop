import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
} from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';

interface MetricCardProps {
  title: string;
  value: number | string;
  unit?: string;
  trend?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  trend,
  trendDirection,
}) => {
  const getTrendIcon = () => {
    if (!trendDirection) return null;

    switch (trendDirection) {
      case 'up':
        return <ArrowUpwardIcon color="success" />;
      case 'down':
        return <ArrowDownwardIcon color="error" />;
      default:
        return <TrendingFlatIcon />;
    }
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" component="h3" gutterBottom>
          {title}
        </Typography>
        <Typography variant="h4" component="p">
          {value} {unit}
        </Typography>
        {trend && (
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            {getTrendIcon()}
            <Typography variant="body2" sx={{ ml: 0.5 }}>
              {trend}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
