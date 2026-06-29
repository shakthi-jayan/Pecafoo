import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';

const SurgeBadge = ({ multiplier }) => {
    if (!multiplier || multiplier <= 1.0) return null;

    let color = 'var(--warning)';
    let bg = 'var(--warning-bg)';

    if (multiplier >= 1.5) {
        color = 'var(--danger)';
        bg = 'var(--danger-bg)';
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="badge"
            style={{
                background: bg,
                color: color,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '4px 8px',
                borderRadius: 'full',
                fontSize: '0.75rem',
                fontWeight: 700
            }}
        >
            <TrendingUp size={12} />
            {multiplier.toFixed(1)}x Surge
        </motion.div>
    );
};

export default SurgeBadge;
