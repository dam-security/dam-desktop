import React, { useState } from 'react';

// Core working Dam Desktop App
export const WorkingApp: React.FC = () => {
  const [currentView, setCurrentView] = useState<'home' | 'dashboard' | 'settings'>('home');
  
  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <HomeView />;
      case 'dashboard':
        return <DashboardView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <HomeView />;
    }
  };
  
  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      background: '#f8fafc'
    }}>
      {/* Sidebar */}
      <div style={{
        width: '250px',
        background: 'rgba(255, 255, 255, 0.9)',
        borderRight: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Logo */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid #e2e8f0'
        }}>
          <h2 style={{ 
            margin: 0, 
            color: '#1e293b', 
            fontSize: '24px', 
            fontWeight: '700' 
          }}>
            Dam
          </h2>
        </div>
        
        {/* Navigation */}
        <nav style={{ flex: 1, padding: '20px 0' }}>
          {[
            { id: 'home', label: 'Home', icon: '🏠' },
            { id: 'dashboard', label: 'Dashboard', icon: '📊' },
            { id: 'settings', label: 'Settings', icon: '⚙️' }
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id as any)}
              style={{
                width: '100%',
                padding: '12px 20px',
                border: 'none',
                background: currentView === item.id ? '#3b82f6' : 'transparent',
                color: currentView === item.id ? 'white' : '#64748b',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
      </div>
      
      {/* Main Content */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Title Bar */}
        <div style={{
          height: '60px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 20px',
          color: 'white'
        }}>
          <h1 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
            DAM Desktop - AI Usage Intelligence
          </h1>
        </div>
        
        {/* Content Area */}
        <div style={{
          flex: 1,
          padding: '20px',
          overflow: 'auto'
        }}>
          {renderView()}
        </div>
      </div>
    </div>
  );
};

const HomeView: React.FC = () => {
  const [userInput, setUserInput] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  
  const handleSubmit = () => {
    if (!userInput.trim()) return;
    
    // Simple response logic
    const input = userInput.toLowerCase();
    let reply = '';
    
    if (input.includes('prompt') || input.includes('improve')) {
      reply = "Here are 3 ways to improve your prompts:\n\n1. Be specific about what you want\n2. Provide context and examples\n3. Specify the output format you need";
    } else if (input.includes('tool') || input.includes('recommend')) {
      reply = "Popular AI tools for different tasks:\n\n• ChatGPT - General conversation and writing\n• Claude - Analysis and long conversations\n• GitHub Copilot - Code completion";
    } else {
      reply = "I can help you with:\n\n• Improving your AI prompts\n• Recommending the right AI tools\n• Teaching prompt engineering techniques";
    }
    
    setResponse(reply);
  };
  
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{
        background: 'white',
        padding: '40px',
        borderRadius: '16px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
        marginBottom: '20px'
      }}>
        <h2 style={{ color: '#1e293b', marginBottom: '20px' }}>
          How can Dam help you today?
        </h2>
        
        <div style={{ marginBottom: '20px' }}>
          <textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Ask me about AI tools, prompt writing, or skill development..."
            style={{
              width: '100%',
              height: '120px',
              padding: '16px',
              border: '2px solid #e2e8f0',
              borderRadius: '12px',
              fontSize: '14px',
              fontFamily: 'inherit',
              resize: 'vertical'
            }}
          />
        </div>
        
        <button
          onClick={handleSubmit}
          style={{
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600'
          }}
        >
          Ask Dam
        </button>
        
        {response && (
          <div style={{
            marginTop: '24px',
            padding: '20px',
            background: '#f8fafc',
            borderRadius: '8px',
            border: '1px solid #e2e8f0'
          }}>
            <h4 style={{ color: '#1e293b', marginBottom: '12px' }}>Dam Response:</h4>
            <pre style={{ 
              whiteSpace: 'pre-wrap', 
              fontFamily: 'inherit',
              color: '#475569',
              margin: 0 
            }}>
              {response}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

const DashboardView: React.FC = () => (
  <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
    <div style={{
      background: 'white',
      padding: '40px',
      borderRadius: '16px',
      boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{ color: '#1e293b', marginBottom: '30px' }}>Dashboard</h2>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        {[
          { title: 'Cost Savings', value: '$892', trend: '+8%' },
          { title: 'Total Prompts', value: '1,247', trend: '+12%' },
          { title: 'AI Tools', value: '8', trend: 'stable' }
        ].map((metric, i) => (
          <div key={i} style={{
            padding: '20px',
            background: '#f8fafc',
            borderRadius: '8px',
            border: '1px solid #e2e8f0'
          }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#64748b' }}>
              {metric.title}
            </h3>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b' }}>
              {metric.value}
            </div>
            <div style={{ fontSize: '12px', color: '#10b981' }}>
              {metric.trend}
            </div>
          </div>
        ))}
      </div>
      
      <div style={{
        background: '#ecfdf5',
        border: '1px solid #d1fae5',
        padding: '20px',
        borderRadius: '8px'
      }}>
        <h3 style={{ color: '#065f46', marginBottom: '12px' }}>💡 Insights</h3>
        <p style={{ color: '#047857', margin: '8px 0' }}>
          ⏰ You've saved an estimated 47 hours using AI this month
        </p>
        <p style={{ color: '#047857', margin: '8px 0' }}>
          🎯 Your prompts are 23% more effective than last month
        </p>
      </div>
    </div>
  </div>
);

const SettingsView: React.FC = () => (
  <div style={{ maxWidth: '600px', margin: '0 auto' }}>
    <div style={{
      background: 'white',
      padding: '40px',
      borderRadius: '16px',
      boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{ color: '#1e293b', marginBottom: '30px' }}>Settings</h2>
      
      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ color: '#1e293b', marginBottom: '16px', fontSize: '16px' }}>
          Monitoring Status
        </h3>
        <div style={{
          padding: '16px',
          background: '#f0f9ff',
          border: '1px solid #bae6fd',
          borderRadius: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '12px',
              height: '12px',
              background: '#10b981',
              borderRadius: '50%'
            }} />
            <span style={{ color: '#065f46', fontWeight: '600' }}>
              AI usage monitoring is active
            </span>
          </div>
          <p style={{ 
            color: '#075985', 
            fontSize: '14px', 
            margin: '8px 0 0 24px' 
          }}>
            Dam continuously monitors your AI tool usage to provide personalized suggestions and security warnings.
          </p>
        </div>
      </div>
      
      <div>
        <h3 style={{ color: '#1e293b', marginBottom: '16px', fontSize: '16px' }}>
          About
        </h3>
        <div style={{
          padding: '16px',
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '8px'
        }}>
          <p style={{ margin: '0 0 8px 0', fontWeight: '600' }}>Dam Desktop</p>
          <p style={{ margin: '0 0 8px 0', color: '#64748b' }}>
            Your AI assistant for better prompts, tool recommendations, and skill development.
          </p>
          <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
            Version 1.0.0
          </p>
        </div>
      </div>
    </div>
  </div>
);