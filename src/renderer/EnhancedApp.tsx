import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ClaudeAPIService } from '../common/services/ClaudeAPIService';
import { OpenAIService } from '../common/services/OpenAIService';

interface UserProfile {
  name: string;
  email: string;
  enterpriseUrl: string;
  role: string;
}

interface Theme {
  bg: string;
  surface: string;
  surfaceHover: string;
  text: string;
  textSecondary: string;
  border: string;
  accent: string;
  accentHover: string;
  input: string;
  inputBorder: string;
}

export const EnhancedApp: React.FC = () => {
  const [currentView, setCurrentView] = useState<'home' | 'dashboard' | 'training' | 'catalog' | 'settings'>('home');
  const [darkMode, setDarkMode] = useState(false);
  const [prePopulatedMessage, setPrePopulatedMessage] = useState<string>('');
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: '',
    email: '',
    enterpriseUrl: '',
    role: ''
  });

  // const damAssistant = SmartDamAssistant.getInstance();

  useEffect(() => {
    // Load user profile from localStorage
    const saved = localStorage.getItem('damUserProfile');
    if (saved) {
      setUserProfile(JSON.parse(saved));
    }
    // Load theme preference
    const savedTheme = localStorage.getItem('damTheme');
    if (savedTheme === 'dark') {
      setDarkMode(true);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !darkMode;
    setDarkMode(newTheme);
    localStorage.setItem('damTheme', newTheme ? 'dark' : 'light');
  };

  const saveProfile = (profile: UserProfile) => {
    setUserProfile(profile);
    localStorage.setItem('damUserProfile', JSON.stringify(profile));
  };

  const handleRecommendationClick = (recommendation: string) => {
    setPrePopulatedMessage(recommendation);
    setCurrentView('home');
  };

  const theme: Theme = {
    bg: darkMode ? '#0a0a0a' : '#ffffff',
    surface: darkMode ? '#1a1a1a' : '#f8f9fa',
    surfaceHover: darkMode ? '#262626' : '#e9ecef',
    text: darkMode ? '#ffffff' : '#212529',
    textSecondary: darkMode ? '#a0a0a0' : '#6c757d',
    border: darkMode ? '#333333' : '#dee2e6',
    accent: '#6366f1',
    accentHover: '#4f46e5',
    input: darkMode ? '#262626' : '#ffffff',
    inputBorder: darkMode ? '#404040' : '#ced4da'
  };

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <HomeView userProfile={userProfile} theme={theme} prePopulatedMessage={prePopulatedMessage} setPrePopulatedMessage={setPrePopulatedMessage} />;
      case 'dashboard':
        return <DashboardView theme={theme} setCurrentView={setCurrentView} onRecommendationClick={handleRecommendationClick} />;
      case 'training':
        return <TrainingView theme={theme} />;
      case 'catalog':
        return <CatalogView theme={theme} />;
      case 'settings':
        return <SettingsView 
          userProfile={userProfile} 
          onSave={saveProfile} 
          theme={theme} 
          darkMode={darkMode} 
          toggleTheme={toggleTheme} 
        />;
      default:
        return <HomeView userProfile={userProfile} theme={theme} />;
    }
  };

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: theme.bg,
      display: 'flex',
      position: 'relative',
      color: theme.text,
      transition: 'background 0.3s ease',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Window Controls Spacer */}
      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: '100px',
        height: '40px',
        zIndex: 1000,
        pointerEvents: 'none'
      }} />

      {/* Sidebar Navigation */}
      <div style={{
        width: '260px',
        padding: '24px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        background: theme.surface,
        borderRight: `1px solid ${theme.border}`
      }}>
        <div style={{
          padding: '16px',
          textAlign: 'center',
          marginBottom: '8px'
        }}>
          <h1 style={{ 
            margin: 0, 
            fontSize: '26px', 
            fontWeight: '700',
            letterSpacing: '-0.5px',
            background: 'linear-gradient(45deg, #6366f1, #ec4899)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Dam
          </h1>
          <p style={{ 
            margin: '8px 0 0',
            fontSize: '13px',
            color: theme.textSecondary,
            letterSpacing: '0.5px'
          }}>
          </p>
        </div>

        {/* Navigation Items */}
        {[
          { id: 'home', label: 'Home' },
          { id: 'dashboard', label: 'Dashboard' },
          { id: 'training', label: 'Training' },
          { id: 'catalog', label: 'AI Catalog' },
          { id: 'settings', label: 'Settings' }
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id as any)}
            style={{
              padding: '12px 16px',
              background: currentView === item.id ? theme.accent : 'transparent',
              color: currentView === item.id ? 'white' : theme.text,
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              transition: 'all 0.2s ease',
              textAlign: 'left'
            }}
            onMouseOver={(e) => {
              if (currentView !== item.id) {
                e.currentTarget.style.background = theme.surfaceHover;
              }
            }}
            onMouseOut={(e) => {
              if (currentView !== item.id) {
                e.currentTarget.style.background = 'transparent';
              }
            }}
          >
            {item.label}
          </button>
        ))}

        <div style={{
          paddingTop: '16px',
          borderTop: `1px solid ${theme.border}`
        }}>
          <button
            onClick={toggleTheme}
            style={{
              padding: '12px 16px',
              background: 'transparent',
              color: theme.text,
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              transition: 'all 0.2s ease',
              textAlign: 'left',
              width: '100%'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = theme.surfaceHover;
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{
        flex: 1,
        padding: '40px',
        paddingTop: '60px',
        overflow: 'auto',
        background: theme.bg
      }}>
        {renderView()}
      </div>
    </div>
  );
};

// Simple markdown formatter
const formatMarkdown = (text: string, theme: Theme): React.ReactNode => {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Headers
    if (line.startsWith('###')) {
      elements.push(
        <h3 key={i} style={{ color: theme.text, fontWeight: '600', margin: '16px 0 8px 0', fontSize: '16px' }}>
          {line.replace('###', '').trim()}
        </h3>
      );
    } else if (line.startsWith('##')) {
      elements.push(
        <h2 key={i} style={{ color: theme.text, fontWeight: '600', margin: '16px 0 8px 0', fontSize: '18px' }}>
          {line.replace('##', '').trim()}
        </h2>
      );
    } else if (line.startsWith('#')) {
      elements.push(
        <h1 key={i} style={{ color: theme.text, fontWeight: '600', margin: '16px 0 8px 0', fontSize: '20px' }}>
          {line.replace('#', '').trim()}
        </h1>
      );
    }
    // Lists
    else if (line.startsWith('- ') || line.startsWith('* ')) {
      elements.push(
        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', margin: '4px 0' }}>
          <span style={{ color: theme.accent, marginRight: '8px', marginTop: '2px' }}>•</span>
          <span style={{ color: theme.text }}>{line.replace(/^[-*]\s/, '')}</span>
        </div>
      );
    }
    // Numbered lists
    else if (/^\d+\.\s/.test(line)) {
      const match = line.match(/^(\d+)\.\s(.*)$/);
      if (match) {
        elements.push(
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', margin: '4px 0' }}>
            <span style={{ color: theme.accent, marginRight: '8px', marginTop: '2px', fontWeight: '600' }}>
              {match[1]}.
            </span>
            <span style={{ color: theme.text }}>{match[2]}</span>
          </div>
        );
      }
    }
    // Code blocks (simple)
    else if (line.startsWith('```')) {
      // Find the end of code block
      let codeContent = '';
      let j = i + 1;
      while (j < lines.length && !lines[j].startsWith('```')) {
        codeContent += lines[j] + '\n';
        j++;
      }
      elements.push(
        <div key={i} style={{
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          borderRadius: '6px',
          padding: '12px',
          margin: '8px 0',
          fontFamily: 'monospace',
          fontSize: '13px',
          color: theme.text,
          overflow: 'auto'
        }}>
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{codeContent.trim()}</pre>
        </div>
      );
      i = j; // Skip to end of code block
    }
    // Inline code
    else if (line.includes('`')) {
      const parts = line.split('`');
      const formattedParts = parts.map((part, index) => 
        index % 2 === 1 ? (
          <code key={index} style={{
            background: theme.surface,
            padding: '2px 4px',
            borderRadius: '3px',
            fontFamily: 'monospace',
            fontSize: '12px'
          }}>
            {part}
          </code>
        ) : part
      );
      elements.push(
        <p key={i} style={{ color: theme.text, margin: '8px 0', lineHeight: '1.6' }}>
          {formattedParts}
        </p>
      );
    }
    // Bold text
    else if (line.includes('**')) {
      const parts = line.split('**');
      const formattedParts = parts.map((part, index) => 
        index % 2 === 1 ? <strong key={index}>{part}</strong> : part
      );
      elements.push(
        <p key={i} style={{ color: theme.text, margin: '8px 0', lineHeight: '1.6' }}>
          {formattedParts}
        </p>
      );
    }
    // Regular paragraphs
    else if (line.trim()) {
      elements.push(
        <p key={i} style={{ color: theme.text, margin: '8px 0', lineHeight: '1.6' }}>
          {line}
        </p>
      );
    }
    // Empty lines
    else {
      elements.push(<br key={i} />);
    }
  }
  
  return <div>{elements}</div>;
};

// Copy to clipboard function
const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
  } catch (err) {
    console.error('Failed to copy text: ', err);
  }
};

// Simplified Home View Component
const HomeView: React.FC<{ 
  userProfile: UserProfile; 
  theme: Theme;
  prePopulatedMessage?: string;
  setPrePopulatedMessage?: (message: string) => void;
}> = ({ 
  userProfile, 
  theme,
  prePopulatedMessage,
  setPrePopulatedMessage
}) => {
  const [userInput, setUserInput] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [chatStarted, setChatStarted] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const claudeAPI = ClaudeAPIService.getInstance();

  // Handle pre-populated message
  useEffect(() => {
    if (prePopulatedMessage && prePopulatedMessage.trim()) {
      setUserInput(prePopulatedMessage);
      setPrePopulatedMessage && setPrePopulatedMessage(''); // Clear the pre-populated message
    }
  }, [prePopulatedMessage, setPrePopulatedMessage]);

  const handleSendMessage = async () => {
    if (!userInput.trim() || isLoading) return;

    const newMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: userInput,
      timestamp: new Date()
    };

    setChatHistory(prev => [...prev, newMessage]);
    setUserInput('');
    setIsLoading(true);
    setChatStarted(true);

    try {
      const response = await claudeAPI.generateDamResponse(
        userInput,
        chatHistory.map(msg => ({ role: msg.role, content: msg.content })),
        userProfile
      );

      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        content: response,
        timestamp: new Date()
      };

      setChatHistory(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Failed to get response:', error);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        content: 'I apologize, but I encountered an issue processing your request. Please try again.',
        timestamp: new Date()
      };
      setChatHistory(prev => [...prev, errorMessage]);
    }

    setIsLoading(false);
  };

  const handleQuickAction = async (action: string) => {
    const messages = {
      capabilities: "What can you help me with?",
      planning: "Help me create a plan for using AI more effectively",
      efficiency: "Show me ways to save time with AI tools",
      research: "I need help researching a topic"
    };
    
    setUserInput(messages[action as keyof typeof messages] || messages.capabilities);
    await handleSendMessage();
  };

  return (
    <div style={{ 
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      maxWidth: '800px', 
      margin: '0 auto',
      position: 'relative'
    }}>
      {!chatStarted && (
        <div style={{ 
          textAlign: 'center', 
          padding: '80px 20px 48px',
          flex: '0 0 auto'
        }}>
          <h1 style={{
            fontSize: '48px',
            fontWeight: '800',
            margin: '0 0 16px',
            background: 'linear-gradient(45deg, #6366f1, #ec4899)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            {userProfile.name ? `Hello, ${userProfile.name}` : 'Hello, User'}
          </h1>
          
          {/* Quick Action Buttons */}
          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'center',
            marginBottom: '32px',
            flexWrap: 'wrap'
          }}>
            {[
              { text: 'Tell me what you can do', action: 'capabilities' },
              { text: 'Help me plan', action: 'planning' },
              { text: 'Save me time', action: 'efficiency' },
              { text: 'Research a topic', action: 'research' }
            ].map((button, index) => (
              <button
                key={index}
                onClick={() => handleQuickAction(button.action)}
                style={{
                  padding: '12px 24px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: `1px solid ${theme.border}`,
                  borderRadius: '24px',
                  color: theme.text,
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  backdropFilter: 'blur(10px)'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                  e.currentTarget.style.borderColor = theme.accent;
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.borderColor = theme.border;
                }}
              >
                {button.text}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat Messages */}
      {chatStarted && (
        <div 
          ref={chatContainerRef}
          style={{
            flex: '1 1 auto',
            overflowY: 'auto',
            padding: '20px',
            paddingBottom: '120px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}
        >
          {chatHistory.map((message) => (
            <div key={message.id} style={{
              marginBottom: '16px'
            }}>
              <div style={{
                fontSize: '13px',
                color: theme.textSecondary,
                marginBottom: '6px'
              }}>
                {message.role === 'user' ? 'You' : 'Dam Assistant'} • {message.timestamp.toLocaleTimeString()}
              </div>
              <div style={{
                position: 'relative',
                background: message.role === 'user' ? theme.surface : theme.surface,
                borderRadius: '12px',
                border: `1px solid ${theme.border}`,
                color: theme.text,
                lineHeight: '1.6',
                wordWrap: 'break-word'
              }}>
                <div style={{ padding: '16px', paddingRight: '50px' }}>
                  {message.role === 'assistant' ? formatMarkdown(message.content, theme) : message.content}
                </div>
                {message.role === 'assistant' && (
                  <button
                    onClick={() => copyToClipboard(message.content)}
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      background: 'transparent',
                      border: `1px solid ${theme.border}`,
                      borderRadius: '4px',
                      padding: '6px',
                      cursor: 'pointer',
                      color: theme.textSecondary,
                      fontSize: '12px',
                      opacity: 0.7,
                      transition: 'opacity 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.opacity = '1'}
                    onMouseOut={(e) => e.currentTarget.style.opacity = '0.7'}
                    title="Copy message"
                  >
                    Copy
                  </button>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div style={{
              marginBottom: '16px'
            }}>
              <div style={{
                fontSize: '13px',
                color: theme.textSecondary,
                marginBottom: '6px'
              }}>
                Dam Assistant • {new Date().toLocaleTimeString()}
              </div>
              <div style={{
                padding: '16px',
                background: theme.surface,
                borderRadius: '12px',
                border: `1px solid ${theme.border}`,
                color: theme.textSecondary
              }}>
                Thinking...
              </div>
            </div>
          )}
        </div>
      )}

      {/* Input Area */}
      <div style={{
        position: chatStarted ? 'fixed' : 'relative',
        bottom: chatStarted ? '20px' : 'auto',
        left: chatStarted ? '280px' : 'auto', // 260px sidebar + 20px margin
        right: chatStarted ? '20px' : 'auto',
        width: chatStarted ? 'auto' : '100%',
        maxWidth: chatStarted ? '800px' : '100%',
        margin: chatStarted ? '0 auto' : '0',
        zIndex: 1000,
        background: chatStarted ? theme.bg : 'transparent',
        padding: chatStarted ? '16px' : '0',
        borderRadius: chatStarted ? '24px' : '0',
        border: chatStarted ? `1px solid ${theme.border}` : 'none',
        boxShadow: chatStarted ? '0 8px 32px rgba(0,0,0,0.1)' : 'none'
      }}>
        <div style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'center'
        }}>
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask me anything about AI tools and productivity..."
            style={{
              flex: 1,
              padding: '16px 20px',
              border: `1px solid ${theme.inputBorder}`,
              borderRadius: '24px',
              background: theme.input,
              color: theme.text,
              fontSize: '14px',
              outline: 'none'
            }}
          />
          <button
            onClick={handleSendMessage}
            disabled={!userInput.trim() || isLoading}
            style={{
              padding: '16px 24px',
              background: theme.accent,
              color: 'white',
              border: 'none',
              borderRadius: '24px',
              cursor: userInput.trim() && !isLoading ? 'pointer' : 'not-allowed',
              fontSize: '14px',
              fontWeight: '600',
              opacity: userInput.trim() && !isLoading ? 1 : 0.6,
              transition: 'all 0.2s ease'
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

// Rich Dashboard Component
const DashboardView: React.FC<{ 
  theme: Theme; 
  setCurrentView: (view: 'home' | 'dashboard' | 'training' | 'catalog' | 'settings') => void;
  onRecommendationClick: (recommendation: string) => void;
}> = ({ theme, setCurrentView, onRecommendationClick }) => {
  const [dashboardData, setDashboardData] = useState<{
    recommendations: string[];
    usageByCategory: { category: string; percentage: number; hours: number }[];
    totalHoursSaved: number;
    productivityIncrease: number;
    toolsMastered: number;
    promptsOptimized: number;
  }>({
    recommendations: [],
    usageByCategory: [],
    totalHoursSaved: 156,
    productivityIncrease: 89,
    toolsMastered: 12,
    promptsOptimized: 2847
  });
  const [isLoading, setIsLoading] = useState(true);
  const openAI = OpenAIService.getInstance();

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem('damUserProfile') || '{}');
        // For now, using static data until we implement proper analytics
        setDashboardData({
          recommendations: [
            "Explore Advanced Prompt Engineering - You're ready for complex multi-step prompts",
            "Try chain-of-thought prompting techniques to improve accuracy",
            "Automate Your Workflow - Set up Claude for regular content reviews",
            "Create template prompts for your most common tasks",
            "Expand to New Categories - Try AI-powered data visualization tools",
            "Explore voice AI for meeting transcriptions and summaries"
          ],
          usageByCategory: [
            { category: "Writing & Content", percentage: 42, hours: 65 },
            { category: "Code Generation", percentage: 28, hours: 44 },
            { category: "Data Analysis", percentage: 18, hours: 28 },
            { category: "Research", percentage: 8, hours: 12 },
            { category: "Other", percentage: 4, hours: 7 }
          ],
          totalHoursSaved: 156,
          productivityIncrease: 89,
          toolsMastered: 12,
          promptsOptimized: 2847
        });
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const getUsageCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Writing & Content': '#10b981',
      'Code Generation': '#3b82f6',
      'Data Analysis': '#f59e0b',
      'Research': '#8b5cf6',
      'Other': '#6b7280'
    };
    return colors[category] || theme.accent;
  };

  if (isLoading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2 style={{ color: theme.text, marginBottom: '16px' }}>Loading Your AI Insights...</h2>
        <div style={{ 
          width: '40px', 
          height: '40px', 
          border: `3px solid ${theme.border}`,
          borderTop: `3px solid ${theme.accent}`,
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto'
        }} />
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px' }}>
      {/* Dashboard Header */}
      <h1 style={{
        fontSize: '32px',
        fontWeight: '700',
        color: theme.text,
        marginBottom: '32px'
      }}>
        Your AI Dashboard
      </h1>

      {/* Main Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '20px',
        marginBottom: '32px'
      }}>
        {[
          { label: 'Hours Saved', value: dashboardData.totalHoursSaved, icon: '⏱️', color: '#10b981' },
          { label: 'Productivity Increase', value: `${dashboardData.productivityIncrease}%`, icon: '📈', color: '#3b82f6' },
          { label: 'Tools Mastered', value: dashboardData.toolsMastered, icon: '🔧', color: '#f59e0b' },
          { label: 'Prompts Optimized', value: dashboardData.promptsOptimized.toLocaleString(), icon: '✨', color: '#8b5cf6' }
        ].map((stat, i) => (
            <div key={i} style={{
              padding: '24px',
              background: theme.surface,
              borderRadius: '12px',
              border: `1px solid ${theme.border}`,
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              transition: 'transform 0.2s ease',
              cursor: 'pointer'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}>
              <div style={{
                fontSize: '32px',
                width: '60px',
                height: '60px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: `${stat.color}20`,
                borderRadius: '12px'
              }}>
                {stat.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: '32px',
                  fontWeight: '700',
                  color: stat.color,
                  marginBottom: '4px'
                }}>
                  {stat.value}
                </div>
                <div style={{
                  fontSize: '14px',
                  color: theme.text,
                  fontWeight: '500'
                }}>
                  {stat.label}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Two Column Layout */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px',
          marginBottom: '32px'
        }}>
          {/* AI Usage by Category Widget */}
          <div style={{
            background: theme.surface,
            borderRadius: '12px',
            border: `1px solid ${theme.border}`,
            padding: '24px'
          }}>
            <h2 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: theme.text,
              marginBottom: '20px'
            }}>
              AI Usage by Category
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {dashboardData.usageByCategory.map((category, i) => (
                <div key={i}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '4px'
                  }}>
                    <span style={{ fontSize: '14px', color: theme.text }}>
                      {category.category}
                    </span>
                    <span style={{ fontSize: '14px', color: theme.textSecondary }}>
                      {category.percentage}% • {category.hours}h
                    </span>
                  </div>
                  <div style={{
                    height: '8px',
                    background: theme.bg,
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${category.percentage}%`,
                      background: getUsageCategoryColor(category.category),
                      borderRadius: '4px',
                      transition: 'width 0.5s ease'
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Personalized Recommendations Widget */}
          <div style={{
            background: theme.surface,
            borderRadius: '12px',
            border: `1px solid ${theme.border}`,
            padding: '24px'
          }}>
            <h2 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: theme.text,
              marginBottom: '20px'
            }}>
              Personalized Recommendations
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {dashboardData.recommendations.slice(0, 4).map((rec, i) => (
                <div key={i} style={{
                  padding: '12px',
                  background: theme.bg,
                  borderRadius: '8px',
                  border: `1px solid ${theme.border}`,
                  fontSize: '14px',
                  color: theme.text,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => onRecommendationClick(rec)}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = theme.accent;
                  e.currentTarget.style.background = theme.surfaceHover;
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = theme.border;
                  e.currentTarget.style.background = theme.bg;
                }}>
                  <span style={{ color: theme.accent }}>→</span>
                  {rec}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Achievement Badges Widget */}
        <div style={{
          background: theme.surface,
          borderRadius: '16px',
          border: `1px solid ${theme.border}`,
          padding: '24px',
          marginTop: '32px'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: theme.text,
            marginBottom: '20px'
          }}>
            Your Achievement Badges
          </h2>
          <div style={{
            display: 'flex',
            gap: '16px',
            flexWrap: 'wrap'
          }}>
            {[
              { emoji: '🚀', name: 'AI Pioneer', description: 'Started your AI journey' },
              { emoji: '⚡', name: 'Speed Learner', description: 'Completed 3 courses in a week' },
              { emoji: '🏆', name: 'Prompt Master', description: 'Optimized 1000+ prompts' },
              { emoji: '🌟', name: 'Power User', description: 'Used 10+ different AI tools' },
              { emoji: '📚', name: 'Knowledge Seeker', description: 'Completed all beginner courses' },
              { emoji: '💡', name: 'Innovation Expert', description: 'Created custom AI workflows' }
            ].map((badge, i) => (
              <div key={i} style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '16px',
                background: theme.bg,
                borderRadius: '12px',
                border: `1px solid ${theme.border}`,
                minWidth: '120px',
                transition: 'all 0.2s ease',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.borderColor = theme.accent;
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.borderColor = theme.border;
              }}
              title={badge.description}>
                <div style={{
                  fontSize: '36px',
                  marginBottom: '8px'
                }}>
                  {badge.emoji}
                </div>
                <div style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: theme.text,
                  textAlign: 'center'
                }}>
                  {badge.name}
                </div>
              </div>
            ))}
          </div>
        </div>

    </div>
  );
};

// Comprehensive Training View
const TrainingView: React.FC<{ theme: Theme }> = ({ theme }) => {
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [courseContent, setCourseContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const openAI = OpenAIService.getInstance();

  const trainingCourses = [
    {
      id: 'prompt-engineering',
      title: 'Advanced Prompt Engineering',
      description: 'Master the art of crafting effective prompts for any AI model',
      duration: '45 min',
      level: 'Intermediate',
      topics: ['Chain-of-thought prompting', 'Few-shot learning', 'Prompt optimization', 'Best practices']
    },
    {
      id: 'ai-productivity',
      title: 'AI-Powered Productivity Workflows',
      description: 'Build automated workflows that save hours every week',
      duration: '60 min', 
      level: 'Beginner',
      topics: ['Workflow automation', 'Task delegation to AI', 'Time management', 'Tool integration']
    },
    {
      id: 'claude-mastery',
      title: 'Claude Advanced Techniques',
      description: 'Unlock Claude\'s full potential for complex tasks',
      duration: '35 min',
      level: 'Advanced',
      topics: ['Long-form analysis', 'Code review', 'Research assistance', 'Creative collaboration']
    },
    {
      id: 'chatgpt-pro',
      title: 'ChatGPT Professional Usage',
      description: 'Professional strategies for business and technical work',
      duration: '50 min',
      level: 'Intermediate',
      topics: ['Business writing', 'Data analysis', 'Problem solving', 'Custom instructions']
    },
    {
      id: 'ai-ethics',
      title: 'Responsible AI Usage',
      description: 'Understanding ethics, bias, and best practices',
      duration: '30 min',
      level: 'Beginner',
      topics: ['AI limitations', 'Bias recognition', 'Fact checking', 'Privacy considerations']
    },
    {
      id: 'multimodal-ai',
      title: 'Working with Images & Code',
      description: 'Using AI for visual and programming tasks',
      duration: '55 min',
      level: 'Advanced',
      topics: ['Image analysis', 'Code generation', 'Visual content creation', 'Technical documentation']
    }
  ];

  const startCourse = async (courseId: string, title: string) => {
    setSelectedCourse(courseId);
    setIsLoading(true);
    
    try {
      const userData = JSON.parse(localStorage.getItem('damUserProfile') || '{}');
      const content = await openAI.generateTrainingContent(title, userData);
      setCourseContent(content);
      
      // Open in new window
      const courseWindow = window.open('', '_blank', 'width=1200,height=800');
      if (courseWindow) {
        courseWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>${title} - Dam Training</title>
              <style>
                body { 
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
                  margin: 0;
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  min-height: 100vh;
                  color: #333;
                }
                .container {
                  max-width: 900px;
                  margin: 0 auto;
                  padding: 40px 20px;
                  background: white;
                  margin-top: 40px;
                  margin-bottom: 40px;
                  border-radius: 16px;
                  box-shadow: 0 20px 60px rgba(0,0,0,0.1);
                }
                .header { 
                  text-align: center; 
                  margin-bottom: 40px; 
                  padding-bottom: 20px;
                  border-bottom: 2px solid #6366f1;
                }
                .header h1 {
                  color: #6366f1;
                  margin: 0;
                  font-size: 2.5em;
                  font-weight: 700;
                }
                .content {
                  line-height: 1.7;
                  font-size: 16px;
                }
                .content h1, .content h2, .content h3 {
                  color: #333;
                  margin-top: 30px;
                  margin-bottom: 15px;
                }
                .content h1 { font-size: 1.8em; }
                .content h2 { font-size: 1.5em; }
                .content h3 { font-size: 1.3em; }
                .content p { margin-bottom: 16px; }
                .content ul, .content ol { 
                  margin-bottom: 16px;
                  padding-left: 24px;
                }
                .content li { margin-bottom: 8px; }
                .content code {
                  background: #f4f4f4;
                  padding: 2px 6px;
                  border-radius: 4px;
                  font-family: 'SF Mono', Monaco, monospace;
                  font-size: 14px;
                }
                .content pre {
                  background: #f8f9fa;
                  border: 1px solid #e9ecef;
                  border-radius: 8px;
                  padding: 16px;
                  overflow-x: auto;
                  font-family: 'SF Mono', Monaco, monospace;
                  font-size: 14px;
                }
                .completion-badge {
                  background: linear-gradient(45deg, #10b981, #3b82f6);
                  color: white;
                  padding: 8px 16px;
                  border-radius: 20px;
                  font-weight: 600;
                  font-size: 14px;
                  display: inline-block;
                  margin-top: 30px;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>${title}</h1>
                  <p style="color: #6b7280; font-size: 1.1em; margin: 16px 0 0 0;">Master AI tools and techniques with hands-on training</p>
                </div>
                <div class="content">
                  ${content.split('\n').map(line => {
                    if (line.startsWith('# ')) {
                      return `<h1>${line.replace('# ', '')}</h1>`;
                    } else if (line.startsWith('## ')) {
                      return `<h2>${line.replace('## ', '')}</h2>`;
                    } else if (line.startsWith('### ')) {
                      return `<h3>${line.replace('### ', '')}</h3>`;
                    } else if (line.startsWith('- ')) {
                      return `<li>${line.replace('- ', '')}</li>`;
                    } else if (line.trim()) {
                      return `<p>${line}</p>`;
                    }
                    return '<br>';
                  }).join('')}
                </div>
                <div class="completion-badge">✓ Course Completed - Well Done!</div>
              </div>
            </body>
          </html>
        `);
        courseWindow.document.close();
      }
    } catch (error) {
      console.error('Failed to generate course content:', error);
      // Fallback to basic course content
      const basicContent = `# ${title}\n\nThis course covers essential concepts and practical applications.\n\n## Course Objectives\n- Master key concepts\n- Apply techniques in real scenarios\n- Build practical skills\n\n## Course Content\nDetailed training content will be loaded here...`;
      setCourseContent(basicContent);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ 
          color: theme.text, 
          fontSize: '36px', 
          fontWeight: '700',
          margin: '0 0 16px',
          background: 'linear-gradient(45deg, #6366f1, #ec4899)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Training
        </h1>
        <p style={{ color: theme.textSecondary, fontSize: '18px', maxWidth: '600px', margin: '0 auto' }}>
          Master AI tools and techniques with our comprehensive training courses
        </p>
      </div>


      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '24px'
      }}>
        {trainingCourses.map((course) => (
          <div key={course.id} style={{
            background: theme.surface,
            borderRadius: '16px',
            border: `1px solid ${theme.border}`,
            padding: '24px',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            cursor: 'pointer'
          }}
          onClick={() => startCourse(course.id, course.title)}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.1)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '16px'
            }}>
              <h3 style={{
                color: theme.text,
                fontSize: '20px',
                fontWeight: '600',
                margin: 0,
                flex: 1
              }}>
                {course.title}
              </h3>
              <div style={{
                background: course.level === 'Beginner' ? '#10b981' : 
                           course.level === 'Intermediate' ? '#f59e0b' : '#ef4444',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: '600',
                marginLeft: '12px'
              }}>
                {course.level}
              </div>
            </div>
            
            <p style={{
              color: theme.textSecondary,
              fontSize: '14px',
              lineHeight: '1.6',
              marginBottom: '16px'
            }}>
              {course.description}
            </p>

            <div style={{
              display: 'flex',
              gap: '16px',
              marginBottom: '16px',
              fontSize: '13px',
              color: theme.textSecondary
            }}>
              <span>⏱️ {course.duration}</span>
              <span>📚 {course.topics.length} topics</span>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <div style={{
                fontSize: '13px',
                color: theme.text,
                fontWeight: '600',
                marginBottom: '8px'
              }}>
                What you'll learn:
              </div>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '6px'
              }}>
                {course.topics.slice(0, 3).map((topic, i) => (
                  <span key={i} style={{
                    background: theme.accent + '20',
                    color: theme.accent,
                    padding: '4px 8px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}>
                    {topic}
                  </span>
                ))}
                {course.topics.length > 3 && (
                  <span style={{
                    color: theme.textSecondary,
                    fontSize: '12px',
                    padding: '4px 8px'
                  }}>
                    +{course.topics.length - 3} more
                  </span>
                )}
              </div>
            </div>

            <button
              disabled={isLoading && selectedCourse === course.id}
              style={{
                width: '100%',
                padding: '12px',
                background: isLoading && selectedCourse === course.id ? theme.textSecondary : theme.accent,
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: isLoading && selectedCourse === course.id ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'background 0.2s'
              }}
            >
              {isLoading && selectedCourse === course.id ? 'Loading Course...' : 'Start Course'}
            </button>
          </div>
        ))}
      </div>

      {/* Learning Progress Section */}
      <div style={{
        marginTop: '48px',
        padding: '32px',
        background: theme.surface,
        borderRadius: '16px',
        border: `1px solid ${theme.border}`
      }}>
        <h3 style={{ color: theme.text, marginBottom: '20px', fontSize: '24px', fontWeight: '600' }}>
          Your Learning Journey
        </h3>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px'
        }}>
          {[
            { label: 'Courses Completed', value: '3', detail: 'out of 6 available' },
            { label: 'Learning Streak', value: '12', detail: 'days in a row' },
            { label: 'Skills Unlocked', value: '8', detail: 'advanced techniques' },
            { label: 'Next Milestone', value: '2', detail: 'courses remaining' }
          ].map((stat, i) => (
            <div key={i} style={{
              textAlign: 'center',
              padding: '20px'
            }}>
              <div style={{
                fontSize: '32px',
                fontWeight: '700',
                color: theme.accent,
                marginBottom: '8px'
              }}>
                {stat.value}
              </div>
              <div style={{
                fontSize: '14px',
                color: theme.text,
                fontWeight: '500',
                marginBottom: '4px'
              }}>
                {stat.label}
              </div>
              <div style={{
                fontSize: '12px',
                color: theme.textSecondary
              }}>
                {stat.detail}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// AI Catalog Component
const CatalogView: React.FC<{ theme: Theme }> = ({ theme }) => {
  const [tools, setTools] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'name' | 'category' | 'date'>('name');
  const [searchQuery, setSearchQuery] = useState('');
  const openAI = OpenAIService.getInstance();

  useEffect(() => {
    const loadCatalog = async () => {
      // Load fallback catalog immediately for fast initial load
      setTools(getFallbackCatalog());
      setIsLoading(false);

      // Try to load from cache first
      try {
        const cachedCatalog = localStorage.getItem('aiToolsCatalog');
        const cacheTimestamp = localStorage.getItem('aiToolsCatalogTimestamp');
        const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds
        
        if (cachedCatalog && cacheTimestamp) {
          const isStale = Date.now() - parseInt(cacheTimestamp) > oneHour;
          if (!isStale) {
            // Use cached data if it's fresh
            setTools(JSON.parse(cachedCatalog));
            return;
          }
        }

        // Fetch fresh data in the background if cache is stale or missing
        const catalog = await openAI.generateAIToolCatalog();
        setTools(catalog);
        
        // Cache the fresh data
        localStorage.setItem('aiToolsCatalog', JSON.stringify(catalog));
        localStorage.setItem('aiToolsCatalogTimestamp', Date.now().toString());
      } catch (error) {
        console.error('Failed to load AI catalog:', error);
        // Keep using fallback catalog if API fails
      }
    };

    loadCatalog();
  }, []);

  const getFallbackCatalog = () => [
    {
      name: "ChatGPT",
      category: "Writing",
      description: "Advanced conversational AI for writing, coding, and analysis",
      features: ["Text generation", "Code assistance", "Analysis", "Creative writing"],
      pricing: "Freemium",
      url: "https://chat.openai.com",
      tags: ["Recommended", "Popular"],
      useCase: "General AI assistance and content creation"
    },
    {
      name: "Claude",
      category: "Writing", 
      description: "AI assistant focused on helpful, harmless, and honest interactions",
      features: ["Long-form writing", "Analysis", "Code review", "Research"],
      pricing: "Freemium",
      url: "https://claude.ai",
      tags: ["Recommended", "New"],
      useCase: "In-depth analysis and professional writing"
    },
    {
      name: "Midjourney",
      category: "Design",
      description: "AI image generation for creative and artistic purposes",
      features: ["Image generation", "Artistic styles", "High quality", "Community"],
      pricing: "$10/month",
      url: "https://midjourney.com",
      tags: ["Popular", "Creative"],
      useCase: "Digital art and creative image generation"
    },
    {
      name: "GitHub Copilot",
      category: "Code",
      description: "AI pair programmer that helps you write code faster",
      features: ["Code completion", "Function generation", "Code explanation", "Multi-language"],
      pricing: "$10/month",
      url: "https://github.com/features/copilot",
      tags: ["Recommended", "Developer"],
      useCase: "Code assistance and development productivity"
    },
    {
      name: "Notion AI",
      category: "Productivity",
      description: "AI-powered writing and productivity features in Notion",
      features: ["Writing assistance", "Summarization", "Action items", "Brainstorming"],
      pricing: "$10/month",
      url: "https://notion.so/product/ai",
      tags: ["Productivity", "Integration"],
      useCase: "Enhanced note-taking and document creation"
    },
    {
      name: "Runway ML",
      category: "Video",
      description: "AI-powered video editing and generation tools",
      features: ["Video generation", "Background removal", "Style transfer", "Text-to-video"],
      pricing: "$15/month",
      url: "https://runwayml.com",
      tags: ["Creative", "New"],
      useCase: "AI-powered video creation and editing"
    },
    {
      name: "Jasper AI",
      category: "Marketing",
      description: "AI writing assistant for marketing and business content",
      features: ["Marketing copy", "Blog posts", "Social media", "Email campaigns"],
      pricing: "$29/month",
      url: "https://jasper.ai",
      tags: ["Business", "Marketing"],
      useCase: "Professional marketing content creation"
    },
    {
      name: "Copy.ai",
      category: "Marketing",
      description: "AI copywriting tool for marketing and sales",
      features: ["Ad copy", "Product descriptions", "Email templates", "Social posts"],
      pricing: "Freemium",
      url: "https://copy.ai",
      tags: ["Free", "Marketing"],
      useCase: "Quick marketing copy generation"
    },
    {
      name: "Grammarly",
      category: "Writing",
      description: "AI-powered writing assistant for grammar and style",
      features: ["Grammar check", "Style suggestions", "Tone detection", "Plagiarism check"],
      pricing: "Freemium",
      url: "https://grammarly.com",
      tags: ["Popular", "Free"],
      useCase: "Writing improvement and error correction"
    },
    {
      name: "Canva AI",
      category: "Design",
      description: "AI design features in Canva for quick graphics",
      features: ["Magic Design", "Background remover", "Text effects", "Auto-resize"],
      pricing: "Freemium",
      url: "https://canva.com/ai",
      tags: ["Popular", "Free"],
      useCase: "Quick graphic design and visual content"
    },
    {
      name: "Perplexity AI",
      category: "Research",
      description: "AI-powered search and research assistant",
      features: ["Web search", "Source citations", "Research summaries", "Follow-up questions"],
      pricing: "Freemium",
      url: "https://perplexity.ai",
      tags: ["Recommended", "Research"],
      useCase: "AI-powered research and fact-finding"
    },
    {
      name: "Loom AI",
      category: "Video",
      description: "AI features for video recording and editing",
      features: ["Auto-summaries", "Transcription", "Filler word removal", "Auto-titles"],
      pricing: "Freemium",
      url: "https://loom.com",
      tags: ["Productivity", "Video"],
      useCase: "Enhanced video communication and documentation"
    },
    {
      name: "DALL-E 3",
      category: "Design",
      description: "OpenAI's advanced image generation model",
      features: ["Text-to-image", "High quality", "Detailed control", "API access"],
      pricing: "Pay-per-use",
      url: "https://openai.com/dall-e-3",
      tags: ["Recommended", "Creative"],
      useCase: "Professional image generation and design"
    },
    {
      name: "Otter.ai",
      category: "Productivity",
      description: "AI meeting transcription and note-taking",
      features: ["Real-time transcription", "Meeting summaries", "Action items", "Integration"],
      pricing: "Freemium",
      url: "https://otter.ai",
      tags: ["Popular", "Productivity"],
      useCase: "Meeting transcription and collaboration"
    },
    {
      name: "Synthesia",
      category: "Video",
      description: "AI video generation with virtual avatars",
      features: ["AI avatars", "Multi-language", "Text-to-video", "Custom branding"],
      pricing: "$30/month",
      url: "https://synthesia.io",
      tags: ["Enterprise", "Video"],
      useCase: "Training videos and presentations"
    },
    {
      name: "Cursor",
      category: "Code",
      description: "AI-powered code editor built for pair programming with AI",
      features: ["AI chat", "Code generation", "Refactoring", "Debugging"],
      pricing: "$20/month",
      url: "https://cursor.sh",
      tags: ["New", "Developer"],
      useCase: "AI-enhanced software development"
    },
    {
      name: "Fireflies.ai",
      category: "Productivity",
      description: "AI meeting assistant that records and analyzes conversations",
      features: ["Meeting recording", "Transcription", "Analytics", "CRM integration"],
      pricing: "Freemium",
      url: "https://fireflies.ai",
      tags: ["Business", "Integration"],
      useCase: "Sales and meeting intelligence"
    },
    {
      name: "Stable Diffusion",
      category: "Design",
      description: "Open-source AI image generation model",
      features: ["Open-source", "Customizable", "Local hosting", "Fine-tuning"],
      pricing: "Free",
      url: "https://stability.ai",
      tags: ["Free", "Open Source"],
      useCase: "Custom AI image generation"
    },
    {
      name: "Descript",
      category: "Video",
      description: "AI-powered audio and video editing platform",
      features: ["Transcription editing", "Overdub", "Screen recording", "Collaboration"],
      pricing: "$12/month",
      url: "https://descript.com",
      tags: ["Creative", "Productivity"],
      useCase: "Podcast and video content creation"
    },
    {
      name: "Replit AI",
      category: "Code",
      description: "AI coding assistant integrated in Replit IDE",
      features: ["Code completion", "Debugging", "Explain code", "Cloud IDE"],
      pricing: "Freemium",
      url: "https://replit.com",
      tags: ["Free", "Developer"],
      useCase: "Cloud-based AI development"
    },
    {
      name: "Beautiful.ai",
      category: "Productivity",
      description: "AI-powered presentation design tool",
      features: ["Smart templates", "Auto-design", "Brand consistency", "Collaboration"],
      pricing: "$12/month",
      url: "https://beautiful.ai",
      tags: ["Business", "Design"],
      useCase: "Professional presentation creation"
    },
    {
      name: "Tome",
      category: "Productivity",
      description: "AI-native presentation and storytelling platform",
      features: ["AI generation", "Interactive content", "Analytics", "Templates"],
      pricing: "Freemium",
      url: "https://tome.app",
      tags: ["New", "Creative"],
      useCase: "Modern presentation and pitch decks"
    }
  ];

  const categories = useMemo(() => 
    ['All', ...Array.from(new Set(tools.map(tool => tool.category)))], 
    [tools]
  );
  
  // Memoized filtering and sorting for better performance
  const filteredTools = useMemo(() => {
    let result = tools;
    
    // Category filter
    if (selectedCategory !== 'All') {
      result = result.filter(tool => tool.category === selectedCategory);
    }
    
    // Search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      result = result.filter(tool => 
        tool.name.toLowerCase().includes(searchLower) ||
        tool.description.toLowerCase().includes(searchLower) ||
        tool.tags.some((tag: string) => tag.toLowerCase().includes(searchLower))
      );
    }
    
    // Sorting
    return [...result].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'category':
          return a.category.localeCompare(b.category);
        case 'date':
          // Since we don't have actual dates, we'll use the order as a proxy
          return tools.indexOf(a) - tools.indexOf(b);
        default:
          return 0;
      }
    });
  }, [tools, selectedCategory, searchQuery, sortBy]);

  const getTagColor = (tag: string) => {
    switch (tag.toLowerCase()) {
      case 'recommended': return '#10b981';
      case 'new': return '#3b82f6';
      case 'popular': return '#f59e0b';
      case 'free': return '#8b5cf6';
      case 'enterprise': return '#ef4444';
      default: return theme.textSecondary;
    }
  };

  if (isLoading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2 style={{ color: theme.text, marginBottom: '16px' }}>Loading AI Catalog...</h2>
        <div style={{ 
          width: '40px', 
          height: '40px', 
          border: `3px solid ${theme.border}`,
          borderTop: `3px solid ${theme.accent}`,
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto'
        }} />
      </div>
    );
  }

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ 
          color: theme.text, 
          fontSize: '36px', 
          fontWeight: '700',
          margin: '0 0 16px',
          background: 'linear-gradient(45deg, #6366f1, #ec4899)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          AI Catalog
        </h1>
        <p style={{ color: theme.textSecondary, fontSize: '18px', maxWidth: '600px', margin: '0 auto' }}>
          Discover and access the best AI tools for productivity, creativity, and innovation
        </p>
      </div>

      {/* Search and Sort Controls */}
      <div style={{
        display: 'flex',
        gap: '16px',
        marginBottom: '24px',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <input
          type="text"
          placeholder="Search AI tools..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            padding: '10px 16px',
            borderRadius: '8px',
            border: `1px solid ${theme.border}`,
            background: theme.input,
            color: theme.text,
            fontSize: '14px',
            width: '300px',
            outline: 'none'
          }}
        />
        
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'name' | 'category' | 'date')}
          style={{
            padding: '10px 16px',
            borderRadius: '8px',
            border: `1px solid ${theme.border}`,
            background: theme.input,
            color: theme.text,
            fontSize: '14px',
            cursor: 'pointer',
            outline: 'none'
          }}
        >
          <option value="name">Sort by Name</option>
          <option value="category">Sort by Category</option>
          <option value="date">Sort by Date Added</option>
        </select>
      </div>

      {/* Category Filter */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '32px',
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            style={{
              padding: '8px 16px',
              background: selectedCategory === category ? theme.accent : 'transparent',
              color: selectedCategory === category ? 'white' : theme.text,
              border: `1px solid ${selectedCategory === category ? theme.accent : theme.border}`,
              borderRadius: '20px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s'
            }}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Results Count */}
      <div style={{
        textAlign: 'center',
        marginBottom: '16px',
        color: theme.textSecondary,
        fontSize: '14px'
      }}>
        Showing {filteredTools.length} of {tools.length} tools
      </div>

      {/* Tools Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
        gap: '24px',
        marginBottom: '40px'
      }}>
        {filteredTools.map((tool, index) => (
          <div key={index} style={{
            background: theme.surface,
            borderRadius: '16px',
            border: `1px solid ${theme.border}`,
            padding: '24px',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            cursor: 'pointer'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.1)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}>
            {/* Header with Tags */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '16px'
            }}>
              <h3 style={{
                color: theme.text,
                fontSize: '20px',
                fontWeight: '600',
                margin: 0,
                flex: 1
              }}>
                {tool.name}
              </h3>
              <div style={{
                display: 'flex',
                gap: '4px',
                flexWrap: 'wrap',
                marginLeft: '12px'
              }}>
                {tool.tags?.map((tag: string, i: number) => (
                  <span key={i} style={{
                    background: getTagColor(tag),
                    color: 'white',
                    padding: '2px 6px',
                    borderRadius: '8px',
                    fontSize: '10px',
                    fontWeight: '600',
                    textTransform: 'uppercase'
                  }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Category Badge */}
            <div style={{
              display: 'inline-block',
              background: theme.accent + '20',
              color: theme.accent,
              padding: '4px 8px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: '600',
              marginBottom: '12px'
            }}>
              {tool.category}
            </div>

            {/* Description */}
            <p style={{
              color: theme.textSecondary,
              fontSize: '14px',
              lineHeight: '1.6',
              marginBottom: '16px'
            }}>
              {tool.description}
            </p>

            {/* Features */}
            <div style={{
              marginBottom: '16px'
            }}>
              <div style={{
                fontSize: '13px',
                color: theme.text,
                fontWeight: '600',
                marginBottom: '8px'
              }}>
                Key Features:
              </div>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '6px'
              }}>
                {tool.features?.slice(0, 4).map((feature: string, i: number) => (
                  <span key={i} style={{
                    background: theme.bg,
                    color: theme.textSecondary,
                    padding: '4px 8px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    border: `1px solid ${theme.border}`
                  }}>
                    {feature}
                  </span>
                ))}
              </div>
            </div>

            {/* Pricing and Action */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: 'auto'
            }}>
              <div style={{
                fontSize: '14px',
                fontWeight: '600',
                color: tool.pricing === 'Free' || tool.pricing === 'Freemium' ? '#10b981' : theme.text
              }}>
                {tool.pricing}
              </div>
              <button
                onClick={() => window.open(tool.url, '_blank')}
                style={{
                  padding: '8px 16px',
                  background: theme.accent,
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '600',
                  transition: 'background 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = theme.accentHover}
                onMouseOut={(e) => e.currentTarget.style.background = theme.accent}
              >
                Try Now
              </button>
            </div>

            {/* Use Case */}
            <div style={{
              marginTop: '12px',
              padding: '8px',
              background: theme.bg,
              borderRadius: '6px',
              fontSize: '12px',
              color: theme.textSecondary,
              fontStyle: 'italic'
            }}>
              💡 {tool.useCase}
            </div>
          </div>
        ))}
      </div>

      {/* Request New Tool Button */}
      <div style={{ textAlign: 'center', marginTop: '40px' }}>
        <button
          disabled
          style={{
            padding: '12px 24px',
            background: '#666',
            color: '#ccc',
            border: 'none',
            borderRadius: '8px',
            cursor: 'not-allowed',
            fontSize: '14px',
            fontWeight: '600',
            opacity: 0.6
          }}
        >
          Request New Tool
        </button>
        <p style={{
          color: theme.textSecondary,
          fontSize: '12px',
          marginTop: '8px'
        }}>
          Can't find what you need? Tool requests are currently disabled.
        </p>
      </div>

      {/* Stats Footer */}
      <div style={{
        marginTop: '48px',
        padding: '24px',
        background: theme.surface,
        borderRadius: '12px',
        border: `1px solid ${theme.border}`,
        textAlign: 'center'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '20px'
        }}>
          <div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: theme.accent }}>
              {tools.length}
            </div>
            <div style={{ fontSize: '14px', color: theme.textSecondary }}>
              AI Tools
            </div>
          </div>
          <div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: theme.accent }}>
              {categories.length - 1}
            </div>
            <div style={{ fontSize: '14px', color: theme.textSecondary }}>
              Categories
            </div>
          </div>
          <div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: theme.accent }}>
              {tools.filter(t => t.pricing === 'Free' || t.pricing === 'Freemium').length}
            </div>
            <div style={{ fontSize: '14px', color: theme.textSecondary }}>
              Free Tools
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SettingsView: React.FC<{ 
  userProfile: UserProfile; 
  onSave: (profile: UserProfile) => void; 
  theme: Theme; 
  darkMode: boolean; 
  toggleTheme: () => void; 
}> = ({ userProfile, onSave, theme, darkMode, toggleTheme }) => {
  const [profile, setProfile] = useState(userProfile);

  const handleSave = () => {
    onSave(profile);
  };

  return (
    <div style={{ padding: '40px', maxWidth: '600px' }}>
      <h2 style={{ color: theme.text, marginBottom: '32px' }}>Settings</h2>
      
      <div style={{ marginBottom: '24px' }}>
        <label style={{ display: 'block', color: theme.text, marginBottom: '8px', fontWeight: '500' }}>
          Name
        </label>
        <input
          type="text"
          value={profile.name}
          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
          style={{
            width: '100%',
            padding: '12px',
            border: `1px solid ${theme.inputBorder}`,
            borderRadius: '8px',
            background: theme.input,
            color: theme.text,
            fontSize: '14px'
          }}
        />
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label style={{ display: 'block', color: theme.text, marginBottom: '8px', fontWeight: '500' }}>
          Email
        </label>
        <input
          type="email"
          value={profile.email}
          onChange={(e) => setProfile({ ...profile, email: e.target.value })}
          style={{
            width: '100%',
            padding: '12px',
            border: `1px solid ${theme.inputBorder}`,
            borderRadius: '8px',
            background: theme.input,
            color: theme.text,
            fontSize: '14px'
          }}
        />
      </div>

      <div style={{ marginBottom: '32px' }}>
        <label style={{ display: 'block', color: theme.text, marginBottom: '8px', fontWeight: '500' }}>
          Role
        </label>
        <input
          type="text"
          value={profile.role}
          onChange={(e) => setProfile({ ...profile, role: e.target.value })}
          style={{
            width: '100%',
            padding: '12px',
            border: `1px solid ${theme.inputBorder}`,
            borderRadius: '8px',
            background: theme.input,
            color: theme.text,
            fontSize: '14px'
          }}
        />
      </div>

      <button
        onClick={handleSave}
        style={{
          padding: '12px 24px',
          background: theme.accent,
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '600',
          marginRight: '12px'
        }}
      >
        Save Changes
      </button>

      <button
        onClick={toggleTheme}
        style={{
          padding: '12px 24px',
          background: 'transparent',
          color: theme.text,
          border: `1px solid ${theme.border}`,
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '600'
        }}
      >
        {darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      </button>
    </div>
  );
};