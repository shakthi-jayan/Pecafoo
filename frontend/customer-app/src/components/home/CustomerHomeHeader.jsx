import { motion } from 'framer-motion';
import { Bell } from 'lucide-react';
import HeaderCartButton from './HeaderCartButton';
import HeaderSavedItemsButton from './HeaderSavedItemsButton';

export default function CustomerHomeHeader({ greeting, firstName, onNotifications }) {
    return (
        <motion.div
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-2) 0' }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
        >
            <div>
                <p style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {greeting}
                </p>
                <h1 style={{ fontSize: 'var(--text-h2)', fontWeight: 700, letterSpacing: '-0.02em', marginTop: 'var(--space-1)' }}>
                    {firstName || 'Foodie'}
                </h1>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <HeaderSavedItemsButton />
                <HeaderCartButton />
                <button 
                    onClick={onNotifications} 
                    id="notifications-btn"
                    style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--color-bg-card)',
                        border: '1px solid var(--color-border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: 'var(--color-text-primary)',
                        boxShadow: 'var(--shadow-sm)',
                        transition: 'all 0.2s ease'
                    }}
                >
                    <Bell size={20} />
                </button>
            </div>
        </motion.div>
    );
}
