import { Link } from 'react-router-dom';
import { GlassCard, EmptyState, Button } from '../shared-ui/PremiumUI';
import { AlertTriangle } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="page-shell">
      <GlassCard padding="var(--space-5)" style={{ textAlign: 'center' }}>
        <EmptyState icon={AlertTriangle} title="404 - Page not found" description="The admin console couldn’t find that route." />
        <div style={{ marginTop: 'var(--space-4)', display: 'flex', justifyContent: 'center' }}>
          <Link to="/">
            <Button variant="primary">Back to Dashboard</Button>
          </Link>
        </div>
      </GlassCard>
    </div>
  );
}
