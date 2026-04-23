
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, Check, X } from 'lucide-react';
import { ordersAPI } from '../services/api';
import toast from 'react-hot-toast';

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
        <div>
            <div className="page-header">
                <h1 className="page-title">Orders</h1>
                <div className="chip-row">
                    {['all', 'placed', 'confirmed', 'preparing', 'ready', 'delivered'].map(f => (
                        <button key={f} onClick={() => setFilter(f)} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`}>
                            {f === 'all' ? 'All' : f.replace(/\b\w/g, c => c.toUpperCase())}
                        </button>
                    ))}
                </div>
            </div>
            {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>{[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 100 }} />)}</div>
            ) : filtered.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {filtered.map((order, i) => (
                        <motion.div key={order.id} className="card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                            <div className="order-card-header">
                                <div>
                                    <h3 style={{ fontWeight: 700, marginBottom: 2 }}>#{order.order_number}</h3>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{order.items?.length || 0} items • ₹{order.total}</p>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>{new Date(order.placed_at).toLocaleString()}</p>
                                </div>
                                <div className="order-card-actions">
                                    <span className={`badge badge-${['placed', 'confirmed', 'preparing'].includes(order.status) ? 'warning' : order.status === 'delivered' ? 'success' : 'accent'}`}>{order.status.replace(/_/g, ' ')}</span>
                                    {statusFlow[order.status] && (
                                        <button onClick={() => updateStatus(order.id, statusFlow[order.status])} className="btn btn-primary btn-sm">
                                            <Check size={14} /> {statusFlow[order.status].replace(/_/g, ' ')}
                                        </button>
                                    )}
                                    {order.status === 'placed' && (
                                        <button onClick={() => updateStatus(order.id, 'cancelled')} className="btn btn-danger btn-sm"><X size={14} /></button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="card"><div className="empty-state"><ClipboardList /><h3>No orders found</h3><p>No orders match the selected filter</p></div></div>
            )}
        </div>
    );
};
export default OrdersPage;
