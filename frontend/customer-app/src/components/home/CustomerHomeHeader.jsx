import { motion } from 'framer-motion';
import { Bell } from 'lucide-react';
import HeaderCartButton from './HeaderCartButton';
import HeaderSavedItemsButton from './HeaderSavedItemsButton';

export default function CustomerHomeHeader({ greeting, firstName, onNotifications }) {
    return (
        <motion.div
            className="page-header"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
        >
            <div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 700 }}>
                    {greeting}
                </p>
                <h1 className="page-title" style={{ fontSize: '1.6rem', marginTop: 2 }}>
                    {firstName || 'Foodie'}
                </h1>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <HeaderSavedItemsButton />
                <HeaderCartButton />
                <button className="btn-icon" onClick={onNotifications} id="notifications-btn">
                    <Bell size={20} />
                </button>
            </div>
        </motion.div>
    );
}
