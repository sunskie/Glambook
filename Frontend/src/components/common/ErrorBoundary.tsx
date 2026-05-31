import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div style={{
          minHeight: '100vh',
          backgroundColor: '#0F0F1A',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontFamily: 'Montserrat, sans-serif',
          padding: '20px'
        }}>
          <div style={{ textAlign: 'center' as const, maxWidth: '500px' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>⚠️</div>
            <h2 style={{ margin: '0 0 16px', fontFamily: 'Syne, sans-serif', fontSize: '24px' }}>
              Something went wrong
            </h2>
            <p style={{ color: '#9CA3AF', margin: '0 0 24px', fontSize: '14px', lineHeight: 1.6 }}>
              An unexpected error occurred. Please try refreshing the page or contact support if the problem persists.
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '12px 24px',
                backgroundColor: '#E91E63',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'Montserrat, sans-serif',
                fontSize: '14px'
              }}
            >
              Refresh Page
            </button>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details style={{ marginTop: '24px', textAlign: 'left' as const }}>
                <summary style={{ cursor: 'pointer', color: '#E91E63', marginBottom: '8px' }}>
                  Error Details (Dev Mode)
                </summary>
                <pre style={{
                  backgroundColor: '#1F2937',
                  padding: '16px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  overflow: 'auto',
                  maxHeight: '200px',
                  color: '#F87171'
                }}>
                  {this.state.error.toString()}
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
