import React from 'react';
import ReactDOM from 'react-dom/client';
import { EnhancedApp } from './EnhancedApp';

// Simple error boundary
class ErrorBoundary extends React.Component {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('React Error:', error, errorInfo);
  }

  render() {
    if ((this.state as any).hasError) {
      return (
        <div style={{ 
          padding: '20px', 
          color: 'red', 
          fontFamily: 'monospace',
          backgroundColor: '#fff',
          height: '100vh'
        }}>
          <h1>Something went wrong.</h1>
          <p>Check the console for more details.</p>
        </div>
      );
    }

    return (this.props as any).children;
  }
}

console.log('Dam Desktop - Starting React app...');

const rootElement = document.getElementById('root');
console.log('Root element:', rootElement);

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <EnhancedApp />
      </ErrorBoundary>
    </React.StrictMode>
  );
  
  console.log('Dam Desktop - React app rendered');
} else {
  console.error('Dam Desktop - Root element not found!');
}