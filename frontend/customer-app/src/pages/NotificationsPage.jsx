import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Bell, BellOff, CheckCheck, Package, Clock, Star, Gift, Info } from 'lucide-react';
import { notificationsAPI } from '../services/api';
import toast from 'react-hot-toast';

import {
    PageContainer,
    IconButton,
    Button,
    GlassCard,
    EmptyState
} from '../../../shared-ui/index';

const typeIcons = { order: Package, info: Info, promo: Gift, rating: Star, system: Bell };
const typeColors = { order: '#3b82f6', info: '#8b5cf6', promo: '#f97316', rating: '#fbbf24', system: '#64748b' };

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
        <PageContainer padding="0">
            <div style={{ position: 'sticky', top: 0, zIndex: 10, backgroundColor: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)', padding: 'var(--space-4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <IconButton icon={ArrowLeft} onClick={() => navigate(-1)} />
                    <h1 style={{ margin: 0, fontSize: 'var(--text-h3)' }}>Notifications</h1>
                </div>
                {unreadCount > 0 && (
                    <Button variant="secondary" size="small" onClick={markAllRead} icon={CheckCheck}>
                        Read All
                    </Button>
                )}
            </div>

            <div style={{ padding: 'var(--space-4)', paddingBottom: '120px' }}>
                <GlassCard padding="var(--space-4)" style={{ marginBottom: 'var(--space-5)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                        <div style={{ width: 48, height: 48, borderRadius: '16px', backgroundColor: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Bell size={24} color="#3b82f6" />
                        </div>
                        <div>
                            <h2 style={{ margin: 0, fontSize: 'var(--text-body)', fontWeight: 800 }}>Inbox</h2>
                            <p style={{ margin: '4px 0 0 0', fontSize: 'var(--text-caption)', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>Updates about your orders, promos, and account</p>
                        </div>
                    </div>
                </GlassCard>

                {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                        {[1, 2, 3, 4].map((i) => <div key={i} style={{ height: 80, backgroundColor: 'var(--color-divider)', borderRadius: 'var(--radius-card)' }} />)}
                    </div>
                ) : notifications.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
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
                                >
                                    <GlassCard 
                                        padding="var(--space-4)" 
                                        style={{ 
                                            display: 'flex', 
                                            alignItems: 'flex-start', 
                                            gap: 'var(--space-3)',
                                            backgroundColor: notification.is_read ? 'var(--color-bg-base)' : `${typeColor}08`,
                                            border: `1px solid ${notification.is_read ? 'var(--color-border)' : `${typeColor}30`}`,
                                            cursor: notification.is_read ? 'default' : 'pointer'
                                        }}
                                    >
                                        <div style={{ width: 40, height: 40, borderRadius: '12px', background: `${typeColor}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <TypeIcon size={20} color={typeColor} />
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                                                <p style={{ margin: 0, fontWeight: notification.is_read ? 600 : 800, fontSize: 'var(--text-body)' }}>{notification.title}</p>
                                                {!notification.is_read && <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: typeColor, flexShrink: 0, marginTop: 4 }} />}
                                            </div>
                                            <p style={{ margin: 0, fontSize: 'var(--text-caption)', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>{notification.message}</p>
                                            <p style={{ margin: '6px 0 0 0', fontSize: '11px', color: 'var(--color-text-tertiary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                                <Clock size={12} /> {timeAgo(notification.created_at)}
                                            </p>
                                        </div>
                                    </GlassCard>
                                </motion.div>
                            );
                        })}
                    </div>
                ) : (
                    <div style={{ marginTop: 'var(--space-8)' }}>
                        <EmptyState 
                            icon={BellOff} 
                            title="No Notifications" 
                            description="You're all caught up! When you get updates, they'll show up here."
                        />
                    </div>
                )}
            </div>
        </PageContainer>
    );
};

export default NotificationsPage;

