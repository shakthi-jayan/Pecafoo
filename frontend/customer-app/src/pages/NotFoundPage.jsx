import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="page" style={{ padding: '24px 16px 120px' }}>
      <div className="card" style={{ textAlign: 'center', padding: 24 }}>
        <div style={{ fontSize: '3rem', marginBottom: 12 }}>404</div>
        <h1 style={{ fontSize: '1.5rem', marginBottom: 10 }}>Page not found</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 18 }}>
          We couldn’t find that customer page. Let’s get you back to food.
        </p>
        <Link to="/" className="btn btn-primary">Go Home</Link>
      </div>
    </div>
  );
}
