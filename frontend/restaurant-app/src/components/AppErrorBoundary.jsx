import { Component } from 'react';

class AppErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Restaurant app error boundary caught an error.', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="page" style={{ display: 'grid', placeItems: 'center', padding: '32px 20px' }}>
          <div className="card" style={{ maxWidth: 420, width: '100%', textAlign: 'center', padding: 24 }}>
            <div className="sidebar-brand" style={{ justifyContent: 'center', marginBottom: 12 }}>
              <span className="sidebar-brand-mark">P</span>
              <span>Pecafoo</span>
            </div>
            <h1 style={{ fontSize: '1.5rem', marginBottom: 10 }}>Dashboard unavailable</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>
              The restaurant app hit an unexpected error. Refresh the page to recover.
            </p>
            <button className="btn btn-primary" onClick={() => window.location.reload()}>
              Reload App
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default AppErrorBoundary;
