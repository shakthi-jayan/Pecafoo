import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, Bike, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

const icons = {
    order: CheckCircle,
    driver: Bike,
    promo: Bell
};

const colors = {
    order: 'var(--success)',
    driver: 'var(--accent)',
    promo: 'var(--warning)'
};

const NotificationToast = ({ id, message, type = 'promo', onClose }) => {
    const Icon = icons[type] || Bell;
    const color = colors[type] || 'var(--info)';

    
    useEffect(() => {
        const timer = setTimeout(() => onClose(id), 5000);
        return () => clearTimeout(timer);
    }, [id, onClose]);

    return (
        <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
            className="toast"
            style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 16,
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                boxShadow: 'var(--shadow-lg)',
                marginBottom: 8,
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: color }} />
            <div style={{ width: 32, height: 32, borderRadius: 8, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>
                <Icon size={16} />
            </div>
            <div style={{ flex: 1 }}>
                <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{message}</p>
            </div>
            <button onClick={() => onClose(id)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={16} />
            </button>
        </motion.div>
    );
};

export const ToastContainer = ({ toasts, removeToast }) => (
    <div style={{ position: 'fixed', top: 12, right: 12, left: 12, zIndex: 9999, display: 'flex', flexDirection: 'column', width: 'min(100%, 360px)', marginLeft: 'auto' }}>
        <AnimatePresence>
            {toasts.map(t => (
                <NotificationToast key={t.id} {...t} onClose={removeToast} />
            ))}
        </AnimatePresence>
    </div>
);

export default NotificationToast;
