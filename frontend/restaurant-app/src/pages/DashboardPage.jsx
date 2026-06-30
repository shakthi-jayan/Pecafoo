
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { IndianRupee, ShoppingBag, TrendingUp, Clock } from 'lucide-react';
import { ordersAPI, restaurantsAPI } from '../services/api';
import { MetricCard, PageHero, SectionHeader, PageContainer, GlassCard, EmptyState } from '../shared-ui/PremiumUI';

const DashboardPage = () => {
    const [stats, setStats] = useState({ orders: 0, revenue: 0, pending: 0 });
    const [recentOrders, setRecentOrders] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const { data } = await ordersAPI.getRestaurantOrders();
            const orders = data.results || data || [];
            setRecentOrders(orders.slice(0, 5));
            setStats({
                orders: orders.length,
                revenue: orders.filter(o => o.status === 'delivered').reduce((s, o) => s + parseFloat(o.total || 0), 0),
                pending: orders.filter(o => ['placed', 'confirmed', 'preparing'].includes(o.status)).length,
            });
        } catch { }
    };

    const statCards = [
        { icon: ShoppingBag, label: 'Total Orders', value: stats.orders, color: '#6366f1' },
        { icon: IndianRupee, label: 'Revenue', value: `₹${stats.revenue.toFixed(0)}`, color: '#34d399' },
        { icon: Clock, label: 'Pending Orders', value: stats.pending, color: '#fbbf24' },
        { icon: TrendingUp, label: 'Completion Rate', value: stats.orders > 0 ? `${Math.round(((stats.orders - stats.pending) / stats.orders) * 100)}%` : '0%', color: '#f87171' },
    ];

    return (
        <PageContainer padding="0">
            <div style={{ padding: 'var(--space-4)' }}>
                <PageHero eyebrow="Restaurant overview" title="Service, at a glance." description="Stay on top of today's orders, kitchen flow, and restaurant performance.">
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: 'var(--color-bg-card)', borderRadius: '100px', border: '1px solid var(--color-border)', fontSize: 'var(--text-caption)' }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: stats.pending > 0 ? 'var(--color-warning)' : 'var(--color-success)', animation: stats.pending > 0 ? 'pulse 2s infinite' : 'none' }} />
                        <span style={{ color: 'var(--color-text-secondary)' }}>Kitchen status:</span>
                        <strong style={{ fontWeight: 700 }}>{stats.pending > 0 ? `${stats.pending} orders moving` : 'Ready for orders'}</strong>
                    </div>
                </PageHero>
            </div>
            
            <div style={{ padding: '0 var(--space-4) var(--space-4) var(--space-4)' }}>
                <SectionHeader eyebrow="Performance" title="Today’s essentials" description="The numbers your team needs before the next order arrives." />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
                {statCards.map(({ icon: Icon, label, value, color }, i) => (
                    <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                        <MetricCard icon={Icon} label={label} value={value} tone={color} detail="Today" />
                    </motion.div>
                ))}
                </div>
                
                <SectionHeader eyebrow="Live queue" title="Recent orders" description="The latest tickets entering your restaurant workflow." />
                <GlassCard padding="0">
                    {recentOrders.length > 0 ? (
                        <div style={{ overflowX: 'auto' }}>
                        <table>
                            <thead><tr><th>Order #</th><th>Customer</th><th>Total</th><th>Status</th></tr></thead>
                            <tbody>
                                {recentOrders.map(o => (
                                    <tr key={o.id}>
                                            <td style={{ padding: '16px', fontWeight: 600, borderBottom: '1px solid var(--color-border)' }}>#{o.order_number}</td>
                                            <td style={{ padding: '16px', borderBottom: '1px solid var(--color-border)' }}>{o.customer_name || 'Customer'}</td>
                                            <td style={{ padding: '16px', borderBottom: '1px solid var(--color-border)', fontWeight: 700 }}>₹{o.total}</td>
                                            <td style={{ padding: '16px', borderBottom: '1px solid var(--color-border)' }}>
                                                <div style={{ 
                                                    display: 'inline-flex', padding: '4px 10px', borderRadius: '100px', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase',
                                                    backgroundColor: ['placed', 'confirmed', 'preparing'].includes(o.status) ? 'rgba(245, 158, 11, 0.1)' : o.status === 'delivered' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(139, 92, 246, 0.1)',
                                                    color: ['placed', 'confirmed', 'preparing'].includes(o.status) ? '#f59e0b' : o.status === 'delivered' ? '#22c55e' : '#8b5cf6'
                                                }}>
                                                    {o.status.replace(/_/g, ' ')}
                                                </div>
                                            </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        </div>
                    ) : (
                        <EmptyState icon={ShoppingBag} title="No orders yet" description="Orders will appear here when customers place them" />
                    )}
                </GlassCard>
            </div>
        </PageContainer>
    );
};
export default DashboardPage;
