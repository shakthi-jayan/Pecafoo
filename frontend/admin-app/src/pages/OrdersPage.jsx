
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, Search, Eye, Filter } from 'lucide-react';
import { ordersAPI } from '../services/api';
import toast from 'react-hot-toast';
import { PageHero, GlassCard, EmptyState, Button, FloatingInput } from '../../../shared-ui/PremiumUI';

const statusColors = { placed: '#60a5fa', confirmed: '#a78bfa', preparing: '#fbbf24', ready: '#34d399', picked_up: '#f97316', delivered: '#10b981', cancelled: '#ef4444' };

const OrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedOrder, setSelectedOrder] = useState(null);

    useEffect(() => {
        ordersAPI.getAll()
            .then(({ data }) => setOrders(data.results || data || []))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const filtered = orders.filter(o => {
        const matchSearch = !search || o.order_number?.toLowerCase().includes(search.toLowerCase()) || o.restaurant_name?.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === 'all' || o.status === statusFilter;
        return matchSearch && matchStatus;
    });

    const statusCounts = orders.reduce((acc, o) => { acc[o.status] = (acc[o.status] || 0) + 1; return acc; }, {});

    const updateStatus = async (id, status) => {
        try {
            await ordersAPI.updateStatus(id, { status });
            toast.success('Status updated');
            setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
            if (selectedOrder?.id === id) setSelectedOrder({ ...selectedOrder, status });
        } catch { toast.error('Failed to update'); }
    };

    return (
        <div className="page-shell">
            <PageHero eyebrow="Operations" title="Orders" description={`Monitor and manage ${orders.length} active and past orders.`} compact />

            {}
            <div className="chip-row" style={{ marginBottom: 16 }}>
                <button onClick={() => setStatusFilter('all')} className={`btn btn-sm ${statusFilter === 'all' ? 'btn-primary' : 'btn-secondary'}`}>All ({orders.length})</button>
                {Object.entries(statusCounts).map(([status, count]) => (
                    <button key={status} onClick={() => setStatusFilter(statusFilter === status ? 'all' : status)}
                        className={`btn btn-sm`} style={{
                            background: statusFilter === status ? `${statusColors[status]}20` : 'var(--bg-elevated)',
                            color: statusFilter === status ? statusColors[status] : 'var(--text-secondary)',
                            border: `1px solid ${statusFilter === status ? statusColors[status] : 'var(--border)'}`,
                            textTransform: 'capitalize',
                        }}>
                        {status.replace(/_/g, ' ')} ({count})
                    </button>
                ))}
            </div>

            {}
            <div style={{ marginBottom: 16 }}>
                <div style={{ position: 'relative' }}>
                    <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                    <input className="input" placeholder="Search by order # or restaurant..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 36, background: 'var(--color-bg-base)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }} />
                </div>
            </div>

            {}
            <GlassCard padding="var(--space-5)">
                {loading ? [1, 2, 3, 4, 5].map(i => <div key={i} className="skeleton" style={{ height: 48, marginBottom: 8 }} />) :
                    filtered.length > 0 ? (
                        <div style={{ overflowX: 'auto' }}>
                            <table>
                                <thead>
                                    <tr><th>Order #</th><th>Restaurant</th><th>Total</th><th>Status</th><th>Date</th><th>Actions</th></tr>
                                </thead>
                                <tbody>
                                    {filtered.map(o => (
                                        <tr key={o.id}>
                                            <td style={{ fontWeight: 600 }}>#{o.order_number}</td>
                                            <td>{o.restaurant_name || '—'}</td>
                                            <td style={{ fontWeight: 600 }}>₹{o.total}</td>
                                            <td>
                                                <span style={{ padding: '3px 10px', borderRadius: 20, background: `${statusColors[o.status] || '#64748b'}15`, color: statusColors[o.status] || '#64748b', fontSize: '0.75rem', fontWeight: 600, textTransform: 'capitalize' }}>
                                                    {o.status?.replace(/_/g, ' ')}
                                                </span>
                                            </td>
                                            <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{new Date(o.created_at).toLocaleDateString()}</td>
                                            <td>
                                                <button onClick={() => setSelectedOrder(o)} className="btn btn-secondary btn-sm"><Eye size={14} /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <EmptyState icon={ClipboardList} title="No orders found" description="Try adjusting your filters or search." />
                    )}
            </GlassCard>

            {}
            {selectedOrder && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }} onClick={() => setSelectedOrder(null)}>
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 520 }}>
                        <GlassCard padding="var(--space-5)" style={{ maxHeight: '80vh', overflow: 'auto' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                <h2 style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>Order #{selectedOrder.order_number}</h2>
                                <span style={{ padding: '4px 12px', borderRadius: 20, background: `${statusColors[selectedOrder.status]}15`, color: statusColors[selectedOrder.status], fontWeight: 600, fontSize: '0.8rem', textTransform: 'capitalize' }}>
                                    {selectedOrder.status?.replace(/_/g, ' ')}
                                </span>
                            </div>

                            <div style={{ marginBottom: 16 }}>
                                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: 4 }}>Restaurant: <strong style={{ color: 'var(--color-text-primary)' }}>{selectedOrder.restaurant_name}</strong></p>
                                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: 4 }}>Customer: <strong style={{ color: 'var(--color-text-primary)' }}>{selectedOrder.customer_name || selectedOrder.customer_email || '—'}</strong></p>
                                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Address: {selectedOrder.delivery_address}</p>
                            </div>

                            {}
                            <div style={{ marginBottom: 16 }}>
                                <h4 style={{ fontWeight: 600, marginBottom: 8, color: 'var(--color-text-primary)' }}>Items</h4>
                                {(selectedOrder.items || []).map((item, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--color-border)', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                                        <span>{item.quantity}x {item.item_name}</span><span>₹{item.total_price}</span>
                                    </div>
                                ))}
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontWeight: 700, marginTop: 4, color: 'var(--color-text-primary)' }}>
                                    <span>Total</span><span style={{ color: 'var(--brand-delivery)' }}>₹{selectedOrder.total}</span>
                                </div>
                            </div>

                            {}
                            {!['delivered', 'cancelled'].includes(selectedOrder.status) && (
                                <div>
                                    <h4 style={{ fontWeight: 600, marginBottom: 8, color: 'var(--color-text-primary)' }}>Update Status</h4>
                                    <div className="chip-row">
                                        {['confirmed', 'preparing', 'ready', 'picked_up', 'delivered', 'cancelled'].map(s => (
                                            <button key={s} onClick={() => updateStatus(selectedOrder.id, s)}
                                                className="btn btn-sm" style={{ background: `${statusColors[s]}15`, color: statusColors[s], border: `1px solid ${statusColors[s]}30`, textTransform: 'capitalize', fontSize: '0.75rem' }}>
                                                {s.replace(/_/g, ' ')}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <Button onClick={() => setSelectedOrder(null)} variant="secondary" size="large" style={{ width: '100%', marginTop: 16 }}>Close</Button>
                        </GlassCard>
                    </motion.div>
                </div>
            )}
        </div>
    );
};
export default OrdersPage;
