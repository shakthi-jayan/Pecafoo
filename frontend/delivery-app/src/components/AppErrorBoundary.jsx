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
    console.error('Delivery app error boundary caught an error.', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="page" style={{ display: 'grid', placeItems: 'center', padding: '32px 20px' }}>
          <div className="card" style={{ maxWidth: 420, width: '100%', textAlign: 'center', padding: 24 }}>
            <div style={{ fontSize: '2rem', marginBottom: 12 }}>Pecafoo</div>
            <h1 style={{ fontSize: '1.5rem', marginBottom: 10 }}>Delivery app crashed</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>
              Something unexpected happened. Reload to continue delivering.
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
