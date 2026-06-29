import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardList, ChevronRight, Check, RotateCcw, Clock, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ordersAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

import {
    PageContainer,
    SegmentedControl,
    EmptyState,
    Button,
    GlassCard
} from '../../../shared-ui/index';

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
        const activeOrdersList = orders.filter(o => !['delivered', 'cancelled'].includes(o.status));
        if (activeOrdersList.length > 0) {
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

            toast.success('Items added to cart!');

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
        <PageContainer padding="0">
            <div style={{ position: 'sticky', top: 0, zIndex: 10, backgroundColor: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)', padding: 'var(--space-4)', borderBottom: '1px solid var(--color-border)' }}>
                <h1 style={{ margin: 0, fontSize: 'var(--text-h2)' }}>My Orders</h1>
            </div>

            <div style={{ padding: 'var(--space-4)' }}>
                <div style={{ marginBottom: 'var(--space-5)' }}>
                    <SegmentedControl 
                        options={[
                            { label: `Active (${activeOrders.length})`, value: 'active' },
                            { label: `Past Orders (${pastOrders.length})`, value: 'past' }
                        ]}
                        value={activeTab}
                        onChange={setActiveTab}
                        brandColor="var(--brand-customer)"
                    />
                </div>

                {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                        {[1, 2, 3].map(i => <div key={i} style={{ height: 160, backgroundColor: 'var(--color-divider)', borderRadius: 'var(--radius-card)' }} />)}
                    </div>
                ) : currentOrders.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                        <AnimatePresence>
                            {currentOrders.map((order, i) => {
                                const color = statusColors[order.status] || 'var(--color-text-secondary)';
                                const isActive = !['delivered', 'cancelled'].includes(order.status);
                                const timeAgo = order.placed_at
                                    ? formatDistanceToNow(new Date(order.placed_at), { addSuffix: true })
                                    : '';

                                return (
                                    <motion.div
                                        key={order.id}
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                    >
                                        <GlassCard 
                                            padding="0"
                                            style={{ 
                                                borderLeft: `4px solid ${color}`,
                                                overflow: 'hidden'
                                            }}
                                        >
                                            <div 
                                                onClick={() => navigate(`/orders/${order.id}`)}
                                                style={{ padding: 'var(--space-4)', cursor: 'pointer' }}
                                            >
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-3)' }}>
                                                    <div>
                                                        <h3 style={{ margin: '0 0 2px 0', fontSize: 'var(--text-body)', fontWeight: 700 }}>{order.restaurant_name}</h3>
                                                        <p style={{ margin: 0, fontSize: 'var(--text-caption)', color: 'var(--color-text-tertiary)' }}>#{order.order_number}</p>
                                                    </div>
                                                    <div style={{
                                                        padding: '4px 10px', borderRadius: '100px', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase',
                                                        backgroundColor: `${color}15`, color, display: 'flex', alignItems: 'center', gap: '4px'
                                                    }}>
                                                        {isActive && <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: color }} />}
                                                        {order.status === 'delivered' && <Check size={12} />}
                                                        {statusLabels[order.status] || order.status}
                                                    </div>
                                                </div>

                                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: 'var(--text-caption)', color: 'var(--color-text-secondary)' }}>
                                                        <Package size={14} /> {order.items?.length || 0} items
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: 'var(--text-caption)', color: 'var(--color-text-secondary)' }}>
                                                        <Clock size={14} /> {timeAgo}
                                                    </div>
                                                </div>

                                                {order.items && order.items.length > 0 && (
                                                    <p style={{ margin: '0 0 var(--space-3) 0', fontSize: 'var(--text-caption)', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                        {order.items.map(item => `${item.quantity}× ${item.item_name}`).join(', ')}
                                                    </p>
                                                )}

                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--color-border)' }}>
                                                    <span style={{ fontSize: 'var(--text-body)', fontWeight: 800 }}>₹{order.total}</span>
                                                    <span style={{ fontSize: 'var(--text-caption)', color: 'var(--brand-customer)', fontWeight: 700, display: 'flex', alignItems: 'center' }}>
                                                        View Details <ChevronRight size={14} style={{ marginLeft: 2 }}/>
                                                    </span>
                                                </div>
                                            </div>

                                            {order.status === 'delivered' && (
                                                <div style={{ padding: '0 var(--space-4) var(--space-4) var(--space-4)' }}>
                                                    <Button 
                                                        variant="secondary" 
                                                        fullWidth 
                                                        onClick={(e) => { e.stopPropagation(); handleReorder(order); }}
                                                        disabled={reorderingId === order.id}
                                                        icon={RotateCcw}
                                                    >
                                                        {reorderingId === order.id ? 'Adding to Cart...' : 'Reorder'}
                                                    </Button>
                                                </div>
                                            )}
                                        </GlassCard>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                ) : (
                    <EmptyState
                        icon={ClipboardList}
                        title={activeTab === 'active' ? 'No active orders' : 'No past orders'}
                        description={activeTab === 'active' ? 'Your active orders will appear here' : 'Your order history will appear here'}
                        action={activeTab === 'active' && <Button onClick={() => navigate('/')}>Browse Restaurants</Button>}
                    />
                )}
            </div>
        </PageContainer>
    );
};

export default OrdersPage;

