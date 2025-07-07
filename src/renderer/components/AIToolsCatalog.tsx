import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Button,
  Tabs,
  Tab,
  CardActions,
  Rating,
  Paper,
} from '@mui/material';
import CodeIcon from '@mui/icons-material/Code';
import BrushIcon from '@mui/icons-material/Brush';
import ScienceIcon from '@mui/icons-material/Science';
import WidgetsIcon from '@mui/icons-material/Widgets';

interface AITool {
  id: string;
  name: string;
  description: string;
  category: string;
  rating: number;
  usageCount: number;
  tags: string[];
  url: string;
}

const aiTools: AITool[] = [
  {
    id: '1',
    name: 'ChatGPT',
    description: 'Advanced conversational AI for various tasks.',
    category: 'general',
    rating: 4.8,
    usageCount: 12345,
    tags: ['Recommended', 'Popular'],
    url: 'https://chat.openai.com',
  },
  {
    id: '2',
    name: 'GitHub Copilot',
    description: 'AI pair programmer for code completion and suggestions.',
    category: 'coding',
    rating: 4.5,
    usageCount: 8765,
    tags: ['Recommended', 'For Developers'],
    url: 'https://copilot.github.com/',
  },
  {
    id: '3',
    name: 'Midjourney',
    description: 'Generate high-quality images from textual descriptions.',
    category: 'creative',
    rating: 4.7,
    usageCount: 6543,
    tags: ['New', 'For Designers'],
    url: 'https://www.midjourney.com/',
  },
  {
    id: '4',
    name: 'Claude 3',
    description: 'A family of large language models for various use cases.',
    category: 'general',
    rating: 4.6,
    usageCount: 7890,
    tags: ['New'],
    url: 'https://www.anthropic.com/claude',
  },
  {
    id: '5',
    name: 'RunwayML',
    description: 'AI-powered video editing and generation tools.',
    category: 'creative',
    rating: 4.4,
    usageCount: 4321,
    tags: ['For Video'],
    url: 'https://runwayml.com/',
  },
  {
    id: '6',
    name: 'Replit',
    description: 'An online IDE with AI-powered code generation and assistance.',
    category: 'coding',
    rating: 4.3,
    usageCount: 5678,
    tags: ['For Developers'],
    url: 'https://replit.com/',
  },
];

const categories = [
  { id: 'all', name: 'All Tools', icon: <WidgetsIcon /> },
  { id: 'general', name: 'General AI', icon: <ScienceIcon /> },
  { id: 'coding', name: 'Coding', icon: <CodeIcon /> },
  { id: 'creative', name: 'Creative', icon: <BrushIcon /> },
];

const getTagColor = (tag: string) => {
  switch (tag) {
    case 'Recommended':
      return 'primary';
    case 'New':
      return 'success';
    case 'Popular':
      return 'secondary';
    default:
      return 'default';
  }
};

export const AIToolsCatalog: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredTools =
    selectedCategory === 'all'
      ? aiTools
      : aiTools.filter((tool) => tool.category === selectedCategory);

  const handleCategoryChange = (event: React.SyntheticEvent, newValue: string) => {
    setSelectedCategory(newValue);
  };

  return (
    <Paper elevation={3} sx={{ p: 2 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        AI Tools Catalog
      </Typography>
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        Discover and manage your AI toolkit
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={selectedCategory}
          onChange={handleCategoryChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          {categories.map((category) => (
            <Tab
              key={category.id}
              value={category.id}
              label={category.name}
              icon={category.icon}
              iconPosition="start"
            />
          ))}
        </Tabs>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
          },
          gap: 3,
        }}
      >
        {filteredTools.map((tool) => (
          <Card key={tool.id} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography variant="h6" component="div">
                {tool.name}
              </Typography>
              <Box sx={{ my: 1 }}>
                {tool.tags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    size="small"
                    color={getTagColor(tag)}
                    sx={{ mr: 1, mb: 1 }}
                  />
                ))}
              </Box>
              <Typography sx={{ mb: 1.5 }} color="text.secondary" variant="body2">
                {tool.description}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Rating value={tool.rating} precision={0.1} readOnly size="small" />
                <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                  ({tool.usageCount} users)
                </Typography>
              </Box>
            </CardContent>
            <CardActions>
              <Button size="small" variant="outlined" href={tool.url} target="_blank">
                Log In
              </Button>
              <Button size="small" href={tool.url} target="_blank">
                Learn More
              </Button>
            </CardActions>
          </Card>
        ))}
      </Box>
    </Paper>
  );
};