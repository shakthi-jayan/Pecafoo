
import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowLeft, Star, Phone, MapPin, MessageSquare,
    Bike, Clock, Check, User, Navigation, Copy, Package, RotateCcw, TriangleAlert, X
} from 'lucide-react';
import { ordersAPI } from '../services/api';
import { useWebSocket } from '../context/WebSocketProvider';
import LiveOrderTracker from '../components/shared/LiveOrderTracker';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';
import { format, formatDistanceToNow } from 'date-fns';

const statusColors = {
    placed: '#6366f1',
    confirmed: '#3b82f6',
    preparing: '#f59e0b',
    ready: '#06b6d4',
    picked_up: '#8b5cf6',
    on_the_way: '#8b5cf6',
    delivered: '#22c55e',
    cancelled: '#ef4444',
};

const currency = (value) => `Rs ${Number(value || 0).toFixed(2)}`;

const SectionHeader = ({ icon, title, subtitle }) => (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
        <div style={{
            width: 40,
            height: 40,
            borderRadius: 14,
            background: 'var(--bg-elevated)',
            color: 'var(--accent-strong)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
        }}>
            {icon}
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
            <p style={{ fontWeight: 800, fontSize: '0.95rem', lineHeight: 1.2 }}>{title}</p>
            {subtitle ? (
                <p style={{ marginTop: 4, fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>{subtitle}</p>
            ) : null}
        </div>
    </div>
);

const OrderDetailPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { messages } = useWebSocket();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [rating, setRating] = useState(0);
    const [review, setReview] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [showRating, setShowRating] = useState(false);
    const [reordering, setReordering] = useState(false);
    const [cancelling, setCancelling] = useState(false);
    const [showCancelAlert, setShowCancelAlert] = useState(false);
    const { addToCart, clearCart } = useCart();

    const fetchOrder = useCallback(async () => {
        try {
            const { data } = await ordersAPI.getOrder(id);
            setOrder(data);
            if (data.rating) {
                setRating(data.rating);
                setReview(data.review || '');
            }
        } catch (err) {
            console.error('Failed to fetch order:', err);
            toast.error('Failed to load order details');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => { fetchOrder(); }, [fetchOrder]);

    
    useEffect(() => {
        if (messages.length > 0) {
            const latest = messages[0];
            if (latest.type === 'order_update' && latest.data?.id === id) {
                setOrder(prev => ({ ...prev, ...latest.data }));
            }
            if (latest.type === 'delivery_location' && order) {
                setOrder(prev => ({
                    ...prev,
                    delivery_partner_latitude: latest.data?.latitude,
                    delivery_partner_longitude: latest.data?.longitude,
                }));
            }
        }
    }, [messages, id, order]);

    
    useEffect(() => {
        if (order && !['delivered', 'cancelled'].includes(order.status)) {
            const interval = setInterval(fetchOrder, 15000);
            return () => clearInterval(interval);
        }
    }, [order, fetchOrder]);

    const handleSubmitRating = async () => {
        if (rating === 0) {
            toast.error('Please select a rating');
            return;
        }
        setSubmitting(true);
        try {
            await ordersAPI.rateOrder(id, { rating, review });
            toast.success('Thank you for your review! ⭐');
            setShowRating(false);
            fetchOrder();
        } catch (err) {
            toast.error('Failed to submit review');
        } finally {
            setSubmitting(false);
        }
    };

    const copyOrderNumber = () => {
        navigator.clipboard.writeText(order.order_number);
        toast.success('Order number copied!');
    };

    const isActive = order && !['delivered', 'cancelled'].includes(order.status);
    const hasFloatingAction = ['placed', 'confirmed', 'delivered'].includes(order?.status);

    const handleCancel = async () => {
        setCancelling(true);
        try {
            await ordersAPI.cancelOrder(id);
            toast.success('Order cancelled successfully.');
            setShowCancelAlert(false);
            fetchOrder();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to cancel order.');
        } finally {
            setCancelling(false);
        }
    };

    const handleReorder = () => {
        if (!order?.items?.length) {
            toast.error('No items found in this order');
            return;
        }
        setReordering(true);
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
                };
                for (let q = 0; q < item.quantity; q++) {
                    addToCart(cartItem, restaurantInfo);
                }
            }
            toast.success('Items added to cart! 🛒');
            if (order.restaurant_slug) {
                navigate(`/restaurant/${order.restaurant_slug}`);
            } else {
                navigate('/cart');
            }
        } catch {
            toast.error('Failed to reorder');
        } finally {
            setReordering(false);
        }
    };

    if (loading) {
        return (
            <div className="page" style={{ paddingBottom: 100 }}>
                <div className="page-header">
                    <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}>
                        <ArrowLeft size={22} />
                    </button>
                    <h1 className="page-title">Order Details</h1>
                    <div style={{ width: 22 }} />
                </div>
                <div className="skeleton" style={{ height: 200, borderRadius: 16, marginBottom: 16 }} />
                <div className="skeleton" style={{ height: 120, borderRadius: 12, marginBottom: 12 }} />
                <div className="skeleton" style={{ height: 160, borderRadius: 12 }} />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="page">
                <div className="empty-state">
                    <Package size={40} />
                    <h3>Order Not Found</h3>
                    <button className="btn btn-primary" onClick={() => navigate('/orders')}>Go to Orders</button>
                </div>
            </div>
        );
    }

    return (
        <div
            className="page page-shell stack-safe"
            style={{
                paddingBottom: hasFloatingAction
                    ? 'calc(var(--customer-bottom-nav-offset) + 132px)'
                    : 'calc(var(--customer-bottom-nav-offset) + 40px)',
            }}
        >
            {}
            <div className="page-header">
                <button onClick={() => navigate(-1)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}>
                    <ArrowLeft size={22} />
                </button>
                <h1 className="page-title">Order #{order.order_number}</h1>
                <button onClick={copyOrderNumber}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}>
                    <Copy size={18} />
                </button>
            </div>

            {}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    background: `${statusColors[order.status]}15`,
                    color: statusColors[order.status],
                    padding: '8px 16px', borderRadius: 'var(--radius-full)',
                    fontWeight: 700, fontSize: '0.85rem', marginBottom: 'var(--space-lg)',
                    border: `1px solid ${statusColors[order.status]}30`,
                }}
            >
                <div style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: statusColors[order.status],
                    animation: isActive ? 'pulse 1.5s infinite' : 'none',
                }} />
                {order.status.replace(/_/g, ' ').toUpperCase()}
            </motion.div>

            <motion.div
                className="card"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.06 }}
                style={{
                    padding: 18,
                    display: 'grid',
                    gap: 16,
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.98), rgba(252,245,255,0.96))',
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                    <div style={{ minWidth: 0, flex: 1 }}>
                        <p style={{ fontSize: '0.76rem', color: 'var(--accent-strong)', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                            Order overview
                        </p>
                        <h2 style={{ marginTop: 6, fontSize: '1.22rem', lineHeight: 1.15, fontWeight: 800 }}>
                            {order.restaurant_name}
                        </h2>
                        <p style={{ marginTop: 6, fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                            Placed {order.placed_at ? formatDistanceToNow(new Date(order.placed_at), { addSuffix: true }) : 'recently'}
                        </p>
                    </div>
                    <div style={{
                        padding: '10px 14px',
                        borderRadius: 16,
                        background: 'rgba(217, 70, 239, 0.08)',
                        color: 'var(--accent-strong)',
                        fontWeight: 800,
                        fontSize: '1rem',
                    }}>
                        {currency(order.total)}
                    </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 10 }}>
                    <div style={{ padding: 12, borderRadius: 16, background: 'rgba(255,255,255,0.88)', border: '1px solid var(--border)' }}>
                        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>Items</p>
                        <p style={{ marginTop: 4, fontSize: '1rem', fontWeight: 800 }}>{order.items?.length || 0}</p>
                    </div>
                    <div style={{ padding: 12, borderRadius: 16, background: 'rgba(255,255,255,0.88)', border: '1px solid var(--border)' }}>
                        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>Payment</p>
                        <p style={{ marginTop: 4, fontSize: '0.9rem', fontWeight: 800, overflowWrap: 'anywhere' }}>{order.payment_method?.toUpperCase() || 'COD'}</p>
                    </div>
                    <div style={{ padding: 12, borderRadius: 16, background: 'rgba(255,255,255,0.88)', border: '1px solid var(--border)' }}>
                        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>Status</p>
                        <p style={{ marginTop: 4, fontSize: '0.9rem', fontWeight: 800, textTransform: 'capitalize', overflowWrap: 'anywhere' }}>
                            {order.status.replace(/_/g, ' ')}
                        </p>
                    </div>
                </div>
            </motion.div>

            {}
            {isActive && (
                <motion.div
                    className="card"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <SectionHeader
                        icon={<Clock size={18} />}
                        title="Order progress"
                        subtitle="Track each step from confirmation to delivery."
                    />
                    <LiveOrderTracker currentStatus={order.status} />
                </motion.div>
            )}

            {isActive && order.delivery_otp && ['picked_up', 'on_the_way'].includes(order.status) && (
                <motion.div
                    className="card"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.12 }}
                    style={{
                        background: 'linear-gradient(135deg, rgba(255, 90, 31, 0.08), rgba(255, 90, 31, 0.03))',
                        border: '1px solid rgba(255, 90, 31, 0.18)',
                        overflow: 'hidden',
                    }}
                >
                    <SectionHeader
                        icon={<Copy size={18} />}
                        title="Delivery OTP"
                        subtitle="Share this code only when the rider reaches your delivery location."
                    />
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: 12,
                            padding: '12px 16px',
                            borderRadius: 16,
                            background: 'white',
                            border: '1px dashed rgba(255, 90, 31, 0.32)',
                        }}
                    >
                        <span style={{ fontSize: '1.6rem', fontWeight: 900, letterSpacing: '0.35rem', color: 'var(--accent)' }}>
                            {order.delivery_otp}
                        </span>
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(order.delivery_otp);
                                toast.success('Delivery OTP copied');
                            }}
                            className="btn btn-ghost btn-sm"
                            style={{ color: 'var(--accent)' }}
                        >
                            <Copy size={16} /> Copy
                        </button>
                    </div>
                </motion.div>
            )}

            {}
            {order.delivery_partner && (
                <motion.div
                    className="card"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    style={{
                        background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-elevated) 100%)',
                        border: '1px solid var(--accent)20',
                    }}
                >
                    <p style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 12 }}>
                        🚴 Delivery Partner
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                        <div style={{
                            width: 48, height: 48, borderRadius: '50%',
                            background: 'var(--gradient-primary)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <Bike size={22} color="white" />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 2 }}>
                                {order.delivery_partner_name || 'Delivery Partner'}
                            </p>
                            {order.delivery_partner_vehicle && (
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                    🏍️ {order.delivery_partner_vehicle}
                                </p>
                            )}
                        </div>

                        {}
                        {order.delivery_partner_phone && (
                            <a
                                href={`tel:${order.delivery_partner_phone}`}
                                style={{
                                    background: 'var(--accent)', width: 40, height: 40,
                                    borderRadius: '50%', display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', textDecoration: 'none',
                                }}
                            >
                                <Phone size={18} color="white" />
                            </a>
                        )}
                    </div>

                    {}
                    {isActive && order.delivery_partner_latitude && (
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            marginTop: 14, padding: '8px 12px',
                            background: 'var(--bg-elevated)', borderRadius: 10,
                        }}>
                            <Navigation size={14} color="var(--accent)" />
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                Live tracking active — partner is on the move
                            </span>
                            <div style={{
                                width: 6, height: 6, borderRadius: '50%',
                                background: '#22c55e', marginLeft: 'auto',
                                animation: 'pulse 1.5s infinite',
                            }} />
                        </div>
                    )}
                </motion.div>
            )}

            {}
            {isActive && order.status === 'ready' && !order.delivery_partner && (
                <motion.div
                    className="card"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    style={{
                        background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.08), rgba(245, 158, 11, 0.04))',
                        border: '1px solid rgba(251, 191, 36, 0.3)',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{
                            width: 48, height: 48, borderRadius: '50%',
                            background: 'rgba(251, 191, 36, 0.15)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            animation: 'pulse 2s infinite',
                        }}>
                            <Bike size={22} color="#f59e0b" />
                        </div>
                        <div>
                            <p style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 2 }}>
                                Looking for Delivery Partner...
                            </p>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                Your food is ready! Assigning a nearby driver.
                            </p>
                        </div>
                    </div>
                </motion.div>
            )}

            {}
            <motion.div
                className="card"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <SectionHeader
                    icon={<Package size={18} />}
                    title="Restaurant"
                    subtitle="Quick access back to the restaurant menu."
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <div style={{
                        width: 44, height: 44, borderRadius: 12,
                        background: 'var(--bg-elevated)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.3rem',
                    }}>
                        🏪
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 2 }}>
                            {order.restaurant_name}
                        </p>
                        {order.restaurant_cuisine && (
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                {order.restaurant_cuisine}
                            </p>
                        )}
                    </div>
                    {order.restaurant_slug && (
                        <button
                            onClick={() => navigate(`/restaurant/${order.restaurant_slug}`)}
                            className="btn btn-ghost btn-sm"
                            style={{ fontSize: '0.75rem', color: 'var(--accent)' }}
                        >
                            View Menu
                        </button>
                    )}
                </div>
            </motion.div>

            {}
            <motion.div
                className="card"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
            >
                <SectionHeader
                    icon={<Package size={18} />}
                    title="Order items"
                    subtitle={`${order.items?.length || 0} item${(order.items?.length || 0) === 1 ? '' : 's'} in this order.`}
                />
                {(order.items || []).map((item, idx) => (
                    <div key={idx} style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                        gap: 12, padding: '12px 0',
                        borderBottom: idx < order.items.length - 1 ? '1px dashed var(--border)' : 'none',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, minWidth: 0, flex: 1 }}>
                            <span style={{
                                background: 'rgba(217, 70, 239, 0.12)', color: 'var(--accent)',
                                fontWeight: 800, minWidth: 30, height: 30, borderRadius: 10,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '0.75rem',
                            }}>
                                {item.quantity}x
                            </span>
                            <div style={{ minWidth: 0 }}>
                                <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 0 }}>
                                    {item.item_name}
                                </p>
                                {item.special_note && (
                                    <p style={{
                                        fontSize: '0.75rem', color: 'var(--warning)',
                                        background: 'var(--warning-bg)', padding: '2px 8px',
                                        borderRadius: 4, display: 'inline-block', marginTop: 4,
                                    }}>
                                        Note: {item.special_note}
                                    </p>
                                )}
                            </div>
                        </div>
                        <span style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
                            {currency(item.total_price || (item.item_price * item.quantity))}
                        </span>
                    </div>
                ))}
            </motion.div>

            {}
            <motion.div
                className="card"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <SectionHeader
                    icon={<MapPin size={18} />}
                    title="Delivery address"
                    subtitle="This is the location your rider is heading to."
                />
                <div style={{ display: 'flex', gap: 10, fontSize: '0.9rem', color: 'var(--text-primary)', minWidth: 0 }}>
                    <MapPin size={16} color="var(--accent)" style={{ flexShrink: 0, marginTop: 2 }} />
                    <span style={{ lineHeight: 1.55, overflowWrap: 'anywhere' }}>{order.delivery_address}</span>
                </div>
            </motion.div>

            {}
            <motion.div
                className="card"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
            >
                <SectionHeader
                    icon={<Star size={18} />}
                    title="Bill summary"
                    subtitle="Charges and payment status for this order."
                />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.9rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Subtotal</span>
                        <span>{currency(order.subtotal)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Delivery Fee</span>
                        <span>{currency(order.delivery_fee || 0)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Tax</span>
                        <span>{currency(order.tax)}</span>
                    </div>
                    {parseFloat(order.discount || 0) > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#22c55e' }}>
                            <span>Discount</span>
                            <span>-{currency(order.discount)}</span>
                        </div>
                    )}
                    <div style={{
                        display: 'flex', justifyContent: 'space-between',
                        fontWeight: 800, fontSize: '1.1rem',
                        borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 4,
                    }}>
                        <span>Total</span>
                        <span>{currency(order.total)}</span>
                    </div>
                </div>
                <div style={{
                    marginTop: 12, padding: '8px 12px',
                    background: 'var(--bg-elevated)', borderRadius: 8,
                    fontSize: '0.8rem', color: 'var(--text-muted)',
                    display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap',
                }}>
                    <span>Payment: {order.payment_method?.toUpperCase()}</span>
                    <span style={{
                        color: order.payment_status === 'paid' ? '#22c55e' : 'var(--warning)',
                        fontWeight: 600,
                    }}>
                        {order.payment_status?.toUpperCase()}
                    </span>
                </div>
            </motion.div>

            {}
            <motion.div
                className="card"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <SectionHeader
                    icon={<Clock size={18} />}
                    title="Timeline"
                    subtitle="A full history of how the order moved through each stage."
                />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                    {[
                        { label: 'Order Placed', time: order.placed_at, icon: Clock },
                        { label: 'Confirmed', time: order.confirmed_at, icon: Check },
                        { label: 'Preparing', time: order.prepared_at, icon: Package },
                        { label: 'Picked Up', time: order.picked_up_at, icon: Bike },
                        { label: 'Delivered', time: order.delivered_at, icon: Check },
                    ].filter(s => s.time).map((step, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: 12, position: 'relative' }}>
                            {}
                            {idx > 0 && (
                                <div style={{
                                    position: 'absolute', top: -10, left: 11.5,
                                    width: 2, height: 12, background: 'var(--accent)',
                                }} />
                            )}
                            <div style={{
                                width: 24, height: 24, borderRadius: '50%',
                                background: 'var(--accent)', display: 'flex',
                                alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0, zIndex: 1,
                            }}>
                                <step.icon size={12} color="white" />
                            </div>
                            <div style={{ paddingBottom: 16, flex: 1 }}>
                                <p style={{ fontWeight: 700, fontSize: '0.88rem', marginBottom: 2 }}>{step.label}</p>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                    {format(new Date(step.time), 'MMM dd, hh:mm a')}
                                </p>
                            </div>
                        </div>
                    ))}
                    {order.cancelled_at && (
                        <div style={{ display: 'flex', gap: 12 }}>
                            <div style={{
                                width: 24, height: 24, borderRadius: '50%',
                                background: '#ef4444', display: 'flex',
                                alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0,
                            }}>
                                <Star size={12} color="white" />
                            </div>
                            <div>
                                <p style={{ fontWeight: 600, fontSize: '0.85rem', color: '#ef4444', marginBottom: 2 }}>Cancelled</p>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                    {format(new Date(order.cancelled_at), 'MMM dd, hh:mm a')}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>

            {}
            {order.status === 'delivered' && (
                <motion.div
                    className="card"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45 }}
                    style={{
                        border: order.rating ? '1px solid #22c55e30' : '1px solid var(--accent)30',
                        background: order.rating
                            ? 'linear-gradient(135deg, var(--bg-card) 0%, #22c55e08 100%)'
                            : 'linear-gradient(135deg, var(--bg-card) 0%, var(--accent-bg) 100%)',
                    }}
                >
                    <p style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
                        {order.rating ? '✅ Your Review' : '⭐ Rate Your Order'}
                    </p>

                    {order.rating && !showRating ? (
                        <div>
                            <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
                                {[1, 2, 3, 4, 5].map(i => (
                                    <Star key={i} size={24}
                                        fill={i <= order.rating ? '#fbbf24' : 'transparent'}
                                        color={i <= order.rating ? '#fbbf24' : 'var(--text-muted)'}
                                    />
                                ))}
                            </div>
                            {order.review && (
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontStyle: 'italic' }}>
                                    "{order.review}"
                                </p>
                            )}
                        </div>
                    ) : (
                        <>
                            {}
                            <div style={{ display: 'flex', gap: 8, marginBottom: 16, justifyContent: 'center' }}>
                                {[1, 2, 3, 4, 5].map(i => (
                                    <motion.button
                                        key={i}
                                        whileHover={{ scale: 1.2 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => { setRating(i); setShowRating(true); }}
                                        style={{
                                            background: 'none', border: 'none', cursor: 'pointer', padding: 4,
                                        }}
                                    >
                                        <Star size={32}
                                            fill={i <= rating ? '#fbbf24' : 'transparent'}
                                            color={i <= rating ? '#fbbf24' : 'var(--text-muted)'}
                                        />
                                    </motion.button>
                                ))}
                            </div>

                            {showRating && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                >
                                    <textarea
                                        className="input"
                                        placeholder="Share your experience (optional)"
                                        value={review}
                                        onChange={e => setReview(e.target.value)}
                                        rows={3}
                                        style={{ resize: 'none', marginBottom: 12 }}
                                    />
                                    <button
                                        className="btn btn-primary"
                                        onClick={handleSubmitRating}
                                        disabled={submitting}
                                        style={{ width: '100%' }}
                                    >
                                        {submitting ? 'Submitting...' : 'Submit Review'}
                                    </button>
                                </motion.div>
                            )}
                        </>
                    )}
                </motion.div>
            )}
            
            {}
            {['placed', 'confirmed'].includes(order.status) && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        position: 'fixed',
                        bottom: 'calc(var(--customer-bottom-nav-offset) + 14px)',
                        left: 12,
                        right: 12,
                        width: 'min(calc(100% - 24px), 406px)',
                        margin: '0 auto',
                        padding: 0,
                        background: 'transparent',
                        zIndex: 100,
                        display: 'grid',
                        gap: 10,
                    }}
                >
                    {showCancelAlert && (
                        <motion.div
                            initial={{ opacity: 0, y: 14 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 14 }}
                            className="card"
                            style={{
                                padding: 14,
                                border: '1px solid rgba(239, 68, 68, 0.2)',
                                background: 'linear-gradient(135deg, rgba(255,255,255,0.97), rgba(254,242,242,0.98))',
                                boxShadow: '0 18px 38px rgba(239, 68, 68, 0.12)',
                            }}
                        >
                            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                                <div style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 14,
                                    background: 'rgba(239, 68, 68, 0.12)',
                                    color: '#ef4444',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                }}>
                                    <TriangleAlert size={18} />
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ fontWeight: 800, color: '#991b1b', fontSize: '0.95rem' }}>
                                        Cancel this order?
                                    </p>
                                    <p style={{
                                        marginTop: 4,
                                        color: 'var(--text-secondary)',
                                        fontSize: '0.82rem',
                                        lineHeight: 1.5,
                                    }}>
                                        This will stop the current order before restaurant preparation continues.
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowCancelAlert(false)}
                                    style={{ color: 'var(--text-muted)', padding: 2 }}
                                    aria-label="Dismiss cancel alert"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                                gap: 10,
                                marginTop: 14,
                            }}>
                                <button
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => setShowCancelAlert(false)}
                                >
                                    Keep Order
                                </button>
                                <button
                                    className="btn btn-sm"
                                    onClick={handleCancel}
                                    disabled={cancelling}
                                    style={{
                                        background: '#ef4444',
                                        color: 'white',
                                        boxShadow: '0 14px 28px rgba(239, 68, 68, 0.24)',
                                    }}
                                >
                                    {cancelling ? 'Cancelling...' : 'Yes, Cancel'}
                                </button>
                            </div>
                        </motion.div>
                    )}

                    <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setShowCancelAlert((value) => !value)}
                        disabled={cancelling}
                        style={{
                            width: '100%', padding: '14px 0', borderRadius: 18,
                            border: '1px solid #ef4444',
                            background: showCancelAlert ? '#ef4444' : '#ef444415',
                            color: showCancelAlert ? 'white' : '#ef4444',
                            fontWeight: 700, fontSize: '1rem',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                            cursor: cancelling ? 'wait' : 'pointer',
                            opacity: cancelling ? 0.7 : 1,
                            boxShadow: 'var(--shadow-sm)',
                            backdropFilter: 'blur(16px)',
                        }}
                    >
                        <TriangleAlert size={18} />
                        {showCancelAlert ? 'Close Cancel Alert' : 'Cancel Order'}
                    </motion.button>
                </motion.div>
            )}
            {}
            {order.status === 'delivered' && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        position: 'fixed',
                        bottom: 'calc(var(--customer-bottom-nav-offset) + 14px)',
                        left: 12,
                        right: 12,
                        width: 'min(calc(100% - 24px), 406px)',
                        margin: '0 auto',
                        padding: 0,
                        background: 'transparent',
                        zIndex: 100,
                    }}
                >
                    <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={handleReorder}
                        disabled={reordering}
                        style={{
                            width: '100%', padding: '14px 0', borderRadius: 18,
                            border: 'none',
                            background: 'var(--gradient-primary)',
                            color: 'white', fontWeight: 700, fontSize: '1rem',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                            cursor: reordering ? 'wait' : 'pointer',
                            opacity: reordering ? 0.7 : 1,
                            boxShadow: 'var(--shadow-accent)',
                        }}
                    >
                        <RotateCcw size={18} />
                        {reordering ? 'Adding to Cart...' : 'Reorder This Meal'}
                    </motion.button>
                </motion.div>
            )}
        </div>
    );
};

export default OrderDetailPage;
