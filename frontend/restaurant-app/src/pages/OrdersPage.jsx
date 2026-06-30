
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, Check, X } from 'lucide-react';
import { ordersAPI } from '../services/api';
import toast from 'react-hot-toast';
import { PageHero, SectionHeader, PageContainer, GlassCard, EmptyState, Skeleton, Button } from '../shared-ui/PremiumUI';

const statusFlow = { placed: 'confirmed', confirmed: 'preparing', preparing: 'ready', ready: 'picked_up' };

const OrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => { fetchOrders(); }, []);

    const fetchOrders = async () => {
        try { const { data } = await ordersAPI.getRestaurantOrders(); setOrders(data.results || data || []); }
        catch { } finally { setLoading(false); }
    };

    const updateStatus = async (orderId, newStatus) => {
        try {
            await ordersAPI.updateStatus(orderId, { status: newStatus });
            toast.success(`Order status updated to ${newStatus.replace(/_/g, ' ')}`);
            fetchOrders();
        } catch { toast.error('Failed to update status'); }
    };

    const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

    return (
        <PageContainer padding="0">
            <div style={{ padding: 'var(--space-4)' }}>
                <PageHero eyebrow="Kitchen queue" title="Orders in motion." description="Move each ticket through a clear service timeline, from placement to pickup." compact>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, padding: '12px 20px', background: 'var(--color-bg-card)', borderRadius: '100px', border: '1px solid var(--color-border)', color: 'var(--brand-restaurant)' }}><ClipboardList size={24} /><span style={{ fontSize: '1.2rem', fontWeight: 800 }}>{filtered.length}</span><small style={{ color: 'var(--color-text-secondary)' }}>in this view</small></div>
                </PageHero>
            </div>
            
            <div style={{ padding: '0 var(--space-4) var(--space-4) var(--space-4)' }}>
                <SectionHeader eyebrow="Filter" title="Service stages" action={
                    <div style={{ display: 'flex', gap: 'var(--space-2)', overflowX: 'auto', paddingBottom: 'var(--space-2)' }}>
                        {['all', 'placed', 'confirmed', 'preparing', 'ready', 'delivered'].map(f => (
                            <button key={f} onClick={() => setFilter(f)} style={{ 
                                padding: '6px 16px', borderRadius: '100px', fontSize: 'var(--text-caption)', fontWeight: 600, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
                                backgroundColor: filter === f ? 'var(--brand-restaurant)' : 'var(--color-bg-card)', 
                                color: filter === f ? '#fff' : 'var(--color-text-secondary)',
                                boxShadow: filter === f ? 'var(--shadow-sm)' : 'none'
                            }}>
                                {f === 'all' ? 'All' : f.replace(/\b\w/g, c => c.toUpperCase())}
                            </button>
                        ))}
                    </div>
                } />
                {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>{[1, 2, 3].map(i => <Skeleton key={i} height={120} radius="var(--radius-md)" />)}</div>
            ) : filtered.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                    {filtered.map((order, i) => (
                        <motion.article key={order.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                            <GlassCard padding="var(--space-4)" style={{ display: 'flex', gap: 'var(--space-4)', position: 'relative', overflow: 'hidden' }}>
                                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', backgroundColor: order.status === 'delivered' ? 'var(--color-success)' : 'var(--color-warning)' }} />
                                
                                <div style={{ flex: 1, paddingLeft: 'var(--space-2)' }}>
                                    <h3 style={{ fontWeight: 800, fontSize: 'var(--text-h3)', marginBottom: 'var(--space-1)' }}>#{order.order_number}</h3>
                                    <p style={{ fontSize: 'var(--text-body)', color: 'var(--color-text-secondary)' }}>{order.items?.length || 0} items • <strong style={{ color: 'var(--color-text-primary)' }}>₹{order.total}</strong></p>
                                    <p style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-tertiary)', marginTop: 'var(--space-2)' }}>{new Date(order.placed_at).toLocaleString()}</p>
                                </div>
                                
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 'var(--space-2)' }}>
                                    <div style={{ 
                                        display: 'inline-flex', padding: '4px 12px', borderRadius: '100px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase',
                                        backgroundColor: ['placed', 'confirmed', 'preparing'].includes(order.status) ? 'rgba(245, 158, 11, 0.1)' : order.status === 'delivered' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(139, 92, 246, 0.1)',
                                        color: ['placed', 'confirmed', 'preparing'].includes(order.status) ? '#f59e0b' : order.status === 'delivered' ? '#22c55e' : '#8b5cf6'
                                    }}>
                                        {order.status.replace(/_/g, ' ')}
                                    </div>
                                    
                                    <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'auto' }}>
                                        {statusFlow[order.status] && (
                                            <Button onClick={() => updateStatus(order.id, statusFlow[order.status])} variant="primary" size="small" icon={Check}>
                                                {statusFlow[order.status].replace(/_/g, ' ')}
                                            </Button>
                                        )}
                                        {order.status === 'placed' && (
                                            <Button onClick={() => updateStatus(order.id, 'cancelled')} variant="outline" size="small">
                                                <X size={16} />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </GlassCard>
                        </motion.article>
                    ))}
                </div>
            ) : (
                <EmptyState icon={ClipboardList} title="No orders found" description="No orders match the selected filter" />
            )}
            </div>
        </PageContainer>
    );
};
export default OrdersPage;
