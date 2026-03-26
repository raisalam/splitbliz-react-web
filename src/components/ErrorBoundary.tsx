import { Component, ErrorInfo, ReactNode } from 'react';

interface Props { children: ReactNode; }
interface State { hasError: boolean; error: Error | null; }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // TODO Phase 3: send to error reporting service (Sentry etc.)
    console.error('[ErrorBoundary]', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-center" style={{ padding: '80px 24px' }}>
          <h2>Something went wrong.</h2>
          <p style={{ color: '#9490b8' }}>{this.state.error?.message}</p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="bg-transparent border-0 cursor-pointer"
            style={{ color: '#6c5ce7' }}
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
