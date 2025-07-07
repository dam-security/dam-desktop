import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import StarIcon from '@mui/icons-material/Star';
import BarChartIcon from '@mui/icons-material/BarChart';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import LightbulbIcon from '@mui/icons-material/Lightbulb';

interface PersonalStatsData {
  totalPrompts: number;
  favoriteAITool: string;
  mostProductiveDay: string;
  averagePromptsPerDay: number;
  topCategories: { name: string; count: number; percentage: number }[];
  weeklyActivity: { day: string; prompts: number }[];
  skillLevel: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  streak: number;
}

interface PersonalStatsProps {
  data: PersonalStatsData;
}

export const PersonalStats: React.FC<PersonalStatsProps> = ({ data }) => {
  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case 'Expert':
        return 'success';
      case 'Advanced':
        return 'primary';
      case 'Intermediate':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h2" gutterBottom>
        Your AI Journey
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Personal insights and achievements
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <RocketLaunchIcon color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h5">{data.totalPrompts.toLocaleString()}</Typography>
                  <Typography color="text.secondary">Total Prompts</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        {/* ... other stat cards ... */}
      </Grid>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top Use Cases
              </Typography>
              <List>
                {data.topCategories.slice(0, 5).map((category, index) => (
                  <ListItem key={category.name} disablePadding>
                    <Box sx={{ width: '100%' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">{category.name}</Typography>
                        <Typography variant="body2"
                          color="text.secondary">{category.count}</Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={category.percentage}
                        sx={{ mt: 0.5 }}
                      />
                    </Box>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Insights
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <LightbulbIcon />
                  </ListItemIcon>
                  <ListItemText primary="You've saved an estimated 47 hours using AI this month" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <LightbulbIcon />
                  </ListItemIcon>
                  <ListItemText primary="Your prompts are 23% more effective than last month" />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};