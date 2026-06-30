import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="page-shell">
      <div className="card" style={{ textAlign: 'center', padding: 24 }}>
        <div style={{ fontSize: '3rem', marginBottom: 12 }}>404</div>
        <h1 style={{ fontSize: '1.5rem', marginBottom: 10 }}>Page not found</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 18 }}>
          The admin console couldn’t find that route.
        </p>
        <Link to="/" className="btn btn-primary">Back to Dashboard</Link>
      </div>
    </div>
  );
}
