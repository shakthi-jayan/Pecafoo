import { ShieldAlert, ShieldCheck, Shield } from 'lucide-react';

const FraudRiskBadge = ({ score, riskLevel }) => {
    let color = 'var(--success)';
    let bg = 'var(--success-bg)';
    let Icon = ShieldCheck;

    if (riskLevel === 'High') {
        color = 'var(--danger)';
        bg = 'var(--danger-bg)';
        Icon = ShieldAlert;
    } else if (riskLevel === 'Medium') {
        color = 'var(--warning)';
        bg = 'var(--warning-bg)';
        Icon = Shield;
    }

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div
                className="badge"
                style={{
                    background: bg,
                    color: color,
                    fontSize: '0.75rem',
                    padding: '4px 8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4
                }}
            >
                <Icon size={12} />
                Risk: {riskLevel}
            </div>
            {score !== undefined && (
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>Score: {score}</span>
            )}
        </div>
    );
};

export default FraudRiskBadge;
