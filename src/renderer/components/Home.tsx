import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  Box,
  CircularProgress,
} from '@mui/material';
import { PersonalizedSuggestionEngine, UserContext } from '../../common/services/PersonalizedSuggestionEngine';
import { List, ListItem, ListItemText } from '@mui/material';

interface UserProfile {
  name?: string;
  email?: string;
  role?: string;
}

interface AIResponse {
  response: string;
  suggestions?: string[];
  resources?: Array<{ title: string; url: string }>;
}

export const Home: React.FC = () => {
  const [userInput, setUserInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [response, setResponse] = useState<AIResponse | null>(null);
  const [userProfile] = useState<UserProfile>({ name: 'User' });
  
  const suggestedPrompts = [
    'What\'s the best AI tool for code generation?',
    'Help me improve this prompt: "help me with code"',
    'What AI tools should a product manager use?'
  ];
  
  const handleSubmit = async (input: string) => {
    if (!input.trim()) return;
    setIsProcessing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setResponse({
        response: `Here's my analysis of "${input}"...`,
        suggestions: ['Try being more specific', 'Consider your use case'],
        resources: [{ title: 'Learn More', url: 'https://example.com' }]
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleChallengeLink = (url: string) => {
    console.log('Opening challenge:', url);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          How can Dam help you today{userProfile?.name ? `, ${userProfile.name}` : ''}?
        </Typography>
      </Box>

      {/* ... (user stats and gamification panel can be refactored with Material-UI components as well) */}

      <Card sx={{ mt: 4 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                multiline
                rows={4}
                variant="outlined"
                placeholder="Ask me anything about AI tools, prompt writing, or skill development..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(userInput);
                  }
                }}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Button
                variant="contained"
                onClick={() => handleSubmit(userInput)}
                disabled={isProcessing}
                startIcon={isProcessing ? <CircularProgress size={20} /> : null}
              >
                {isProcessing ? 'Processing...' : 'Ask Dam'}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {response && (
        <Card sx={{ mt: 4 }}>
          <CardContent>
            <Typography variant="h5" component="h2" gutterBottom>
              Dam Response
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
              {response.response}
            </Typography>

            {response.suggestions && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6">Suggestions:</Typography>
                <List>
                  {response.suggestions.map((suggestion, index) => (
                    <ListItem key={index}>
                      <ListItemText primary={suggestion} />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            {response.resources && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6">Learn More:</Typography>
                <List>
                  {response.resources.map((resource, index) => (
                    <ListItem key={index}>
                      <Button
                        variant="text"
                        component={resource.url.startsWith('#') ? 'button' : 'a'}
                        href={resource.url.startsWith('#') ? undefined : resource.url}
                        onClick={() => resource.url.startsWith('#challenge') && handleChallengeLink(resource.url)}
                        {...(resource.url.startsWith('http') && {
                          target: '_blank',
                          rel: 'noopener noreferrer'
                        })}
                      >
                        {resource.title}
                      </Button>
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Try asking Dam:
        </Typography>
        <Grid container spacing={1}>
          {suggestedPrompts.map((prompt, index) => (
            <Grid key={index}>
              <Chip label={prompt} onClick={() => handleSubmit(prompt)} />
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};