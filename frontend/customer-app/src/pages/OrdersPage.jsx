
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardList, ChevronRight, Check, RotateCcw, Clock, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ordersAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

const statusColors = {
    placed: '#6366f1', confirmed: '#3b82f6', preparing: '#f59e0b',
    ready: '#06b6d4', picked_up: '#8b5cf6', on_the_way: '#8b5cf6',
    delivered: '#22c55e', cancelled: '#ef4444',
};

const statusLabels = {
    placed: 'Placed', confirmed: 'Confirmed', preparing: 'Preparing',
    ready: 'Ready', picked_up: 'Picked Up', on_the_way: 'On the Way',
    delivered: 'Delivered', cancelled: 'Cancelled',
};

const OrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('active');
    const [reorderingId, setReorderingId] = useState(null);
    const navigate = useNavigate();
    const { addToCart, clearCart } = useCart();

    useEffect(() => { fetchOrders(); }, []);

    
    useEffect(() => {
        const activeOrders = orders.filter(o => !['delivered', 'cancelled'].includes(o.status));
        if (activeOrders.length > 0) {
            const interval = setInterval(fetchOrders, 20000);
            return () => clearInterval(interval);
        }
    }, [orders]);

    const fetchOrders = async () => {
        try {
            const { data } = await ordersAPI.getMyOrders();
            setOrders(data.results || data || []);
        } catch { setOrders([]); }
        finally { setLoading(false); }
    };

    const activeOrders = orders.filter(o => !['delivered', 'cancelled'].includes(o.status));
    const pastOrders = orders.filter(o => ['delivered', 'cancelled'].includes(o.status));
    const currentOrders = activeTab === 'active' ? activeOrders : pastOrders;

    const handleReorder = async (order) => {
        if (!order.items || order.items.length === 0) {
            toast.error('No items found in this order');
            return;
        }

        setReorderingId(order.id);
        try {
            
            clearCart();

            const restaurantInfo = {
                id: order.restaurant,
                name: order.restaurant_name,
                slug: order.restaurant_slug,
                delivery_fee: order.delivery_fee || 0,
            };

            
            for (const item of order.items) {
                const cartItem = {
                    id: item.menu_item,
                    name: item.item_name,
                    price: item.item_price,
                    discount_price: null,
                    image: null,
                    food_type: 'non_veg',
                    quantity: 1,
                };

                
                for (let i = 0; i < item.quantity; i++) {
                    addToCart(cartItem, restaurantInfo);
                }
            }

            toast.success('Items added to cart! 🛒');

            
            if (order.restaurant_slug) {
                navigate(`/restaurant/${order.restaurant_slug}`);
            } else {
                navigate('/cart');
            }
        } catch (err) {
            toast.error('Failed to reorder');
        } finally {
            setReorderingId(null);
        }
    };

    return (
        <div className="page" style={{ paddingBottom: 100 }}>
            <div className="page-header">
                <h1 className="page-title">My Orders</h1>
            </div>

            {}
            <div style={{
                display: 'flex', gap: 0, marginBottom: 20,
                background: 'var(--bg-elevated)', borderRadius: 14, padding: 4,
                border: '1px solid var(--border)'
            }}>
                {[
                    { key: 'active', label: 'Active', count: activeOrders.length },
                    { key: 'past', label: 'Past Orders', count: pastOrders.length },
                ].map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        style={{
                            flex: 1, padding: '12px 0', borderRadius: 10, border: 'none',
                            background: activeTab === tab.key
                                ? 'var(--gradient-primary)' : 'transparent',
                            color: activeTab === tab.key ? 'white' : 'var(--text-muted)',
                            fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
                            transition: 'all 0.2s ease',
                        }}
                    >
                        {tab.label} ({tab.count})
                    </button>
                ))}
            </div>

            {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 140, borderRadius: 16 }} />)}
                </div>
            ) : currentOrders.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <AnimatePresence>
                        {currentOrders.map((order, i) => {
                            const color = statusColors[order.status] || 'var(--text-muted)';
                            const isActive = !['delivered', 'cancelled'].includes(order.status);
                            const timeAgo = order.placed_at
                                ? formatDistanceToNow(new Date(order.placed_at), { addSuffix: true })
                                : '';

                            return (
                                <motion.div
                                    key={order.id}
                                    className="card"
                                    style={{
                                        padding: 0, overflow: 'hidden',
                                        borderLeft: `4px solid ${color}`,
                                    }}
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                >
                                    {}
                                    <div
                                        onClick={() => navigate(`/orders/${order.id}`)}
                                        style={{ padding: 16, cursor: 'pointer' }}
                                    >
                                        {}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                                            <div>
                                                <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 2 }}>
                                                    {order.restaurant_name}
                                                </h3>
                                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                    #{order.order_number}
                                                </p>
                                            </div>
                                            <span style={{
                                                padding: '4px 12px', borderRadius: 20, fontSize: '0.7rem', fontWeight: 700,
                                                background: `${color}15`, color,
                                                display: 'flex', alignItems: 'center', gap: 4,
                                            }}>
                                                {isActive && <div style={{
                                                    width: 6, height: 6, borderRadius: '50%',
                                                    background: color, animation: 'pulse 1.5s infinite',
                                                }} />}
                                                {order.status === 'delivered' && <Check size={12} />}
                                                {statusLabels[order.status] || order.status}
                                            </span>
                                        </div>

                                        {}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                                                <Package size={13} />
                                                {order.items?.length || 0} items
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                                                <Clock size={13} />
                                                {timeAgo}
                                            </div>
                                        </div>

                                        {}
                                        {order.items && order.items.length > 0 && (
                                            <p style={{
                                                fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 10,
                                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                            }}>
                                                {order.items.map(item => `${item.quantity}× ${item.item_name}`).join(', ')}
                                            </p>
                                        )}

                                        {}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTop: '1px solid var(--border)' }}>
                                            <span style={{ fontWeight: 800, fontSize: '1.05rem' }}>₹{order.total}</span>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--accent)', fontSize: '0.8rem', fontWeight: 600 }}>
                                                View Details <ChevronRight size={16} />
                                            </div>
                                        </div>
                                    </div>

                                    {}
                                    {order.status === 'delivered' && (
                                        <div style={{ padding: '0 16px 16px', }}>
                                            <motion.button
                                                whileTap={{ scale: 0.97 }}
                                                onClick={(e) => { e.stopPropagation(); handleReorder(order); }}
                                                disabled={reorderingId === order.id}
                                                style={{
                                                    width: '100%', padding: '12px 0', borderRadius: 12,
                                                    border: '2px solid var(--accent)',
                                                    background: 'transparent',
                                                    color: 'var(--accent)',
                                                    fontWeight: 700, fontSize: '0.9rem',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                                    cursor: reorderingId === order.id ? 'wait' : 'pointer',
                                                    opacity: reorderingId === order.id ? 0.6 : 1,
                                                }}
                                            >
                                                <RotateCcw size={16} className={reorderingId === order.id ? 'spin' : ''} />
                                                {reorderingId === order.id ? 'Adding to Cart...' : 'Reorder'}
                                            </motion.button>
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            ) : (
                <div className="empty-state" style={{ marginTop: 'var(--space-2xl)', padding: 48 }}>
                    <ClipboardList size={48} style={{ color: 'var(--text-muted)', opacity: 0.3, marginBottom: 16 }} />
                    <h3 style={{ fontWeight: 700, marginBottom: 4 }}>
                        {activeTab === 'active' ? 'No active orders' : 'No past orders'}
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        {activeTab === 'active'
                            ? 'Your active orders will appear here'
                            : 'Your order history will appear here'}
                    </p>
                    {activeTab === 'active' && (
                        <button
                            className="btn btn-primary"
                            style={{ marginTop: 16 }}
                            onClick={() => navigate('/')}
                        >
                            Browse Restaurants
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default OrdersPage;
