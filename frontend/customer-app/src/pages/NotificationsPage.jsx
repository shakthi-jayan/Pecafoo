import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Bell, BellOff, CheckCheck, Package, Clock, Star, Gift, Info } from 'lucide-react';
import { notificationsAPI } from '../services/api';
import toast from 'react-hot-toast';

const typeIcons = { order: Package, info: Info, promo: Gift, rating: Star, system: Bell };
const typeColors = { order: '#60a5fa', info: '#a78bfa', promo: '#f97316', rating: '#fbbf24', system: '#64748b' };

const NotificationsPage = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        notificationsAPI.getAll()
            .then(({ data }) => setNotifications(data.results || data || []))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const markRead = async (id) => {
        try {
            await notificationsAPI.markRead(id);
            setNotifications((prev) => prev.map((notification) => (
                notification.id === id ? { ...notification, is_read: true } : notification
            )));
        } catch { }
    };

    const markAllRead = async () => {
        try {
            await notificationsAPI.markAllRead();
            setNotifications((prev) => prev.map((notification) => ({ ...notification, is_read: true })));
            toast.success('All marked as read');
        } catch { }
    };

    const unreadCount = notifications.filter((notification) => !notification.is_read).length;

    const timeAgo = (date) => {
        const diff = Date.now() - new Date(date).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins}m ago`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    };

    return (
        <div className="page" style={{ paddingBottom: 100 }}>
            <div className="page-header">
                <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}><ArrowLeft size={22} /></button>
                <h1 className="page-title">Notifications</h1>
                {unreadCount > 0 && <button onClick={markAllRead} className="btn btn-secondary btn-sm"><CheckCheck size={14} /> Read All</button>}
            </div>

            <div
                className="card"
                style={{
                    marginBottom: 16,
                    padding: 18,
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.98), rgba(242,247,255,0.95))',
                    display: 'grid',
                    gap: 14,
                }}
            >
                <div>
                    <p style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b', fontWeight: 800 }}>
                        Inbox
                    </p>
                    <h2 style={{ marginTop: 6, fontSize: '1.3rem', lineHeight: 1.12, fontWeight: 800 }}>
                        Updates about your orders, promos, and account
                    </h2>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
                    <div style={{ padding: 12, borderRadius: 16, background: 'rgba(100, 116, 139, 0.08)' }}>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontWeight: 700 }}>Total</div>
                        <div style={{ marginTop: 4, fontSize: '1.2rem', fontWeight: 800 }}>{notifications.length}</div>
                    </div>
                    <div style={{ padding: 12, borderRadius: 16, background: 'rgba(96, 165, 250, 0.12)' }}>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontWeight: 700 }}>Unread</div>
                        <div style={{ marginTop: 4, fontSize: '1.2rem', fontWeight: 800 }}>{unreadCount}</div>
                    </div>
                </div>
            </div>

            {loading ? [1, 2, 3, 4].map((i) => <div key={i} className="skeleton" style={{ height: 82, marginBottom: 10 }} />) :
                notifications.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {notifications.map((notification, index) => {
                            const TypeIcon = typeIcons[notification.notification_type] || Bell;
                            const typeColor = typeColors[notification.notification_type] || '#64748b';
                            return (
                                <motion.div
                                    key={notification.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.03 }}
                                    onClick={() => !notification.is_read && markRead(notification.id)}
                                    style={{
                                        display: 'flex',
                                        gap: 12,
                                        padding: '16px',
                                        borderRadius: 18,
                                        background: notification.is_read ? 'var(--bg-card)' : `${typeColor}08`,
                                        border: `1px solid ${notification.is_read ? 'var(--border)' : `${typeColor}30`}`,
                                        cursor: notification.is_read ? 'default' : 'pointer',
                                        transition: 'all 0.2s',
                                        boxShadow: notification.is_read ? 'var(--shadow-sm)' : '0 14px 26px rgba(148, 163, 184, 0.1)',
                                    }}
                                >
                                    <div style={{ width: 40, height: 40, borderRadius: 12, background: `${typeColor}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <TypeIcon size={18} color={typeColor} />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ fontWeight: notification.is_read ? 600 : 800, fontSize: '0.92rem', marginBottom: 4 }}>{notification.title}</p>
                                        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{notification.message}</p>
                                        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={10} /> {timeAgo(notification.created_at)}</p>
                                    </div>
                                    {!notification.is_read && <div style={{ width: 8, height: 8, borderRadius: 4, background: typeColor, marginTop: 6, flexShrink: 0 }} />}
                                </motion.div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="card" style={{ marginTop: 40 }}><div className="empty-state"><BellOff /><h3>No Notifications</h3><p>You're all caught up!</p></div></div>
                )}
        </div>
    );
};

export default NotificationsPage;
