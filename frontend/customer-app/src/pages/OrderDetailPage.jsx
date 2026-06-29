import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, Star, Phone, MapPin,
    Bike, Clock, Check, Navigation, Copy, Package, RotateCcw, TriangleAlert, X
} from 'lucide-react';
import { ordersAPI } from '../services/api';
import { useWebSocket } from '../context/WebSocketProvider';
import LiveOrderTracker from '../components/shared/LiveOrderTracker';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';
import { format, formatDistanceToNow } from 'date-fns';

import {
    PageContainer,
    Button,
    IconButton,
    SectionHeader,
    GlassCard,
    EmptyState
} from '../../../shared-ui/PremiumUI';

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

const currency = (value) => `₹${Number(value || 0).toFixed(2)}`;

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
            toast.success('Items added to cart!');
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
            <PageContainer padding="0">
                <div style={{ padding: 'var(--space-4)', display: 'flex', alignItems: 'center' }}>
                    <IconButton icon={ArrowLeft} onClick={() => navigate(-1)} />
                    <div style={{ flex: 1 }} />
                </div>
                <div style={{ padding: '0 var(--space-4)' }}>
                    <div style={{ height: 200, backgroundColor: 'var(--color-divider)', borderRadius: 'var(--radius-card)', marginBottom: 'var(--space-4)' }} />
                    <div style={{ height: 120, backgroundColor: 'var(--color-divider)', borderRadius: 'var(--radius-card)', marginBottom: 'var(--space-3)' }} />
                    <div style={{ height: 160, backgroundColor: 'var(--color-divider)', borderRadius: 'var(--radius-card)' }} />
                </div>
            </PageContainer>
        );
    }

    if (!order) {
        return (
            <PageContainer>
                <div style={{ marginTop: 'var(--space-8)' }}>
                    <EmptyState
                        icon={Package}
                        title="Order Not Found"
                        action={<Button onClick={() => navigate('/orders')}>Go to Orders</Button>}
                    />
                </div>
            </PageContainer>
        );
    }

    return (
        <PageContainer padding="0">
            <div style={{ position: 'sticky', top: 0, zIndex: 10, backgroundColor: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)', padding: 'var(--space-4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <IconButton icon={ArrowLeft} onClick={() => navigate(-1)} />
                    <h1 style={{ margin: 0, fontSize: 'var(--text-h3)' }}>Order #{order.order_number}</h1>
                </div>
                <IconButton icon={Copy} onClick={copyOrderNumber} variant="ghost" />
            </div>

            <div style={{ padding: 'var(--space-4)', paddingBottom: '120px' }}>
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        display: 'inline-flex', alignItems: 'center', gap: 8,
                        background: `${statusColors[order.status]}15`,
                        color: statusColors[order.status],
                        padding: '6px 12px', borderRadius: '100px',
                        fontWeight: 800, fontSize: '12px', marginBottom: 'var(--space-5)',
                        border: `1px solid ${statusColors[order.status]}30`,
                        textTransform: 'uppercase'
                    }}
                >
                    <div style={{
                        width: 8, height: 8, borderRadius: '50%',
                        background: statusColors[order.status],
                        animation: isActive ? 'pulse 1.5s infinite' : 'none',
                    }} />
                    {order.status.replace(/_/g, ' ')}
                </motion.div>

                <GlassCard padding="var(--space-5)" style={{ marginBottom: 'var(--space-5)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-4)' }}>
                        <div>
                            <p style={{ fontSize: '10px', color: 'var(--brand-customer)', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 4px 0' }}>
                                Order Overview
                            </p>
                            <h2 style={{ margin: 0, fontSize: 'var(--text-h2)', fontWeight: 800 }}>
                                {order.restaurant_name}
                            </h2>
                            <p style={{ margin: '4px 0 0 0', fontSize: 'var(--text-caption)', color: 'var(--color-text-secondary)' }}>
                                Placed {order.placed_at ? formatDistanceToNow(new Date(order.placed_at), { addSuffix: true }) : 'recently'}
                            </p>
                        </div>
                        <div style={{
                            padding: '8px 12px', borderRadius: '12px', background: 'rgba(217, 70, 239, 0.1)',
                            color: 'var(--brand-customer)', fontWeight: 800, fontSize: 'var(--text-body)',
                        }}>
                            {currency(order.total)}
                        </div>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-3)' }}>
                        <div style={{ padding: 'var(--space-3)', borderRadius: '12px', backgroundColor: 'var(--color-bg-base)', border: '1px solid var(--color-border)' }}>
                            <p style={{ margin: 0, fontSize: '10px', color: 'var(--color-text-tertiary)', fontWeight: 700, textTransform: 'uppercase' }}>Items</p>
                            <p style={{ margin: '4px 0 0 0', fontSize: 'var(--text-body)', fontWeight: 800 }}>{order.items?.length || 0}</p>
                        </div>
                        <div style={{ padding: 'var(--space-3)', borderRadius: '12px', backgroundColor: 'var(--color-bg-base)', border: '1px solid var(--color-border)' }}>
                            <p style={{ margin: 0, fontSize: '10px', color: 'var(--color-text-tertiary)', fontWeight: 700, textTransform: 'uppercase' }}>Payment</p>
                            <p style={{ margin: '4px 0 0 0', fontSize: 'var(--text-body)', fontWeight: 800 }}>{order.payment_method?.toUpperCase() || 'COD'}</p>
                        </div>
                        <div style={{ padding: 'var(--space-3)', borderRadius: '12px', backgroundColor: 'var(--color-bg-base)', border: '1px solid var(--color-border)' }}>
                            <p style={{ margin: 0, fontSize: '10px', color: 'var(--color-text-tertiary)', fontWeight: 700, textTransform: 'uppercase' }}>Status</p>
                            <p style={{ margin: '4px 0 0 0', fontSize: 'var(--text-body)', fontWeight: 800, textTransform: 'capitalize' }}>
                                {order.status.replace(/_/g, ' ')}
                            </p>
                        </div>
                    </div>
                </GlassCard>

                {isActive && (
                    <div style={{ marginBottom: 'var(--space-5)' }}>
                        <SectionHeader title="Order Progress" style={{ marginBottom: 'var(--space-4)' }} />
                        <GlassCard padding="var(--space-4)">
                            <LiveOrderTracker currentStatus={order.status} />
                        </GlassCard>
                    </div>
                )}

                {isActive && order.delivery_otp && ['picked_up', 'on_the_way'].includes(order.status) && (
                    <GlassCard padding="var(--space-4)" style={{ marginBottom: 'var(--space-5)', border: '2px dashed var(--brand-customer)', backgroundColor: 'rgba(217, 70, 239, 0.05)' }}>
                        <p style={{ margin: '0 0 var(--space-2) 0', fontSize: 'var(--text-caption)', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Delivery OTP</p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '8px', color: 'var(--brand-customer)' }}>
                                {order.delivery_otp}
                            </span>
                            <Button variant="secondary" size="small" icon={Copy} onClick={() => { navigator.clipboard.writeText(order.delivery_otp); toast.success('Delivery OTP copied'); }}>Copy</Button>
                        </div>
                    </GlassCard>
                )}

                {order.delivery_partner && (
                    <GlassCard padding="var(--space-4)" style={{ marginBottom: 'var(--space-5)' }}>
                        <p style={{ margin: '0 0 var(--space-3) 0', fontSize: '10px', fontWeight: 700, color: 'var(--color-text-tertiary)', textTransform: 'uppercase' }}>Delivery Partner</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                            <div style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: 'var(--brand-customer)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Bike size={24} color="white" />
                            </div>
                            <div style={{ flex: 1 }}>
                                <p style={{ margin: 0, fontWeight: 800, fontSize: 'var(--text-body)' }}>{order.delivery_partner_name || 'Delivery Partner'}</p>
                                {order.delivery_partner_vehicle && (
                                    <p style={{ margin: '2px 0 0 0', fontSize: 'var(--text-caption)', color: 'var(--color-text-secondary)' }}>🏍️ {order.delivery_partner_vehicle}</p>
                                )}
                            </div>
                            {order.delivery_partner_phone && (
                                <a href={`tel:${order.delivery_partner_phone}`} style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: 'var(--color-bg-base)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-primary)' }}>
                                    <Phone size={18} />
                                </a>
                            )}
                        </div>
                        {isActive && order.delivery_partner_latitude && (
                            <div style={{ marginTop: 'var(--space-3)', padding: '8px 12px', backgroundColor: 'rgba(34, 197, 94, 0.1)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Navigation size={14} color="#22c55e" />
                                <span style={{ fontSize: '11px', color: '#15803d', fontWeight: 700 }}>Live tracking active</span>
                                <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#22c55e', marginLeft: 'auto', animation: 'pulse 1.5s infinite' }} />
                            </div>
                        )}
                    </GlassCard>
                )}

                <SectionHeader title="Order Items" style={{ marginBottom: 'var(--space-4)' }} />
                <GlassCard padding="var(--space-4)" style={{ marginBottom: 'var(--space-5)' }}>
                    {(order.items || []).map((item, idx) => (
                        <div key={idx} style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                            gap: 12, padding: '12px 0',
                            borderBottom: idx < order.items.length - 1 ? '1px dashed var(--color-border)' : 'none',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)', flex: 1 }}>
                                <span style={{
                                    backgroundColor: 'var(--color-divider)', color: 'var(--color-text-primary)',
                                    fontWeight: 800, width: 28, height: 28, borderRadius: 8,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px',
                                }}>
                                    {item.quantity}x
                                </span>
                                <div>
                                    <p style={{ fontWeight: 700, fontSize: 'var(--text-body)', margin: '0 0 2px 0' }}>{item.item_name}</p>
                                    {item.special_note && (
                                        <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', margin: 0, fontStyle: 'italic' }}>
                                            Note: {item.special_note}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <span style={{ fontWeight: 800 }}>
                                {currency(item.total_price || (item.item_price * item.quantity))}
                            </span>
                        </div>
                    ))}
                </GlassCard>

                <SectionHeader title="Delivery Address" style={{ marginBottom: 'var(--space-4)' }} />
                <GlassCard padding="var(--space-4)" style={{ marginBottom: 'var(--space-5)' }}>
                    <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start' }}>
                        <MapPin size={20} color="var(--brand-customer)" style={{ flexShrink: 0 }} />
                        <p style={{ margin: 0, fontSize: 'var(--text-body)', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                            {order.delivery_address}
                        </p>
                    </div>
                </GlassCard>

                <SectionHeader title="Bill Summary" style={{ marginBottom: 'var(--space-4)' }} />
                <GlassCard padding="var(--space-4)" style={{ marginBottom: 'var(--space-5)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-body)' }}>
                            <span style={{ color: 'var(--color-text-secondary)' }}>Subtotal</span>
                            <span>{currency(order.subtotal)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-body)' }}>
                            <span style={{ color: 'var(--color-text-secondary)' }}>Delivery Fee</span>
                            <span>{currency(order.delivery_fee || 0)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-body)' }}>
                            <span style={{ color: 'var(--color-text-secondary)' }}>Tax</span>
                            <span>{currency(order.tax)}</span>
                        </div>
                        {parseFloat(order.discount || 0) > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-body)', color: '#22c55e', fontWeight: 700 }}>
                                <span>Discount</span>
                                <span>-{currency(order.discount)}</span>
                            </div>
                        )}
                        <div style={{ width: '100%', height: '1px', backgroundColor: 'var(--color-border)', margin: '8px 0' }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-h3)', fontWeight: 800 }}>
                            <span>Total</span>
                            <span style={{ color: 'var(--brand-customer)' }}>{currency(order.total)}</span>
                        </div>
                    </div>
                </GlassCard>

                <SectionHeader title="Timeline" style={{ marginBottom: 'var(--space-4)' }} />
                <GlassCard padding="var(--space-4)" style={{ marginBottom: 'var(--space-5)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {[
                            { label: 'Order Placed', time: order.placed_at, icon: Clock },
                            { label: 'Confirmed', time: order.confirmed_at, icon: Check },
                            { label: 'Preparing', time: order.prepared_at, icon: Package },
                            { label: 'Picked Up', time: order.picked_up_at, icon: Bike },
                            { label: 'Delivered', time: order.delivered_at, icon: Check },
                        ].filter(s => s.time).map((step, idx) => (
                            <div key={idx} style={{ display: 'flex', gap: 'var(--space-3)', position: 'relative' }}>
                                {idx > 0 && (
                                    <div style={{ position: 'absolute', top: -14, left: 11.5, width: 2, height: 14, backgroundColor: 'var(--brand-customer)' }} />
                                )}
                                <div style={{ width: 24, height: 24, borderRadius: '50%', backgroundColor: 'var(--brand-customer)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, zIndex: 1 }}>
                                    <step.icon size={12} color="white" />
                                </div>
                                <div style={{ paddingBottom: 'var(--space-4)', flex: 1 }}>
                                    <p style={{ margin: '0 0 2px 0', fontWeight: 700, fontSize: 'var(--text-body)' }}>{step.label}</p>
                                    <p style={{ margin: 0, fontSize: 'var(--text-caption)', color: 'var(--color-text-tertiary)' }}>{format(new Date(step.time), 'MMM dd, hh:mm a')}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </GlassCard>

                {order.status === 'delivered' && (
                    <GlassCard padding="var(--space-4)" style={{ marginBottom: 'var(--space-5)', backgroundColor: order.rating ? 'rgba(34, 197, 94, 0.05)' : 'var(--color-bg-card)', border: order.rating ? '1px solid rgba(34, 197, 94, 0.2)' : '1px solid var(--color-border)' }}>
                        <p style={{ margin: '0 0 var(--space-3) 0', fontSize: '10px', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
                            {order.rating ? 'Your Review' : 'Rate Your Order'}
                        </p>

                        {order.rating && !showRating ? (
                            <div>
                                <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <Star key={i} size={24} fill={i <= order.rating ? '#fbbf24' : 'transparent'} color={i <= order.rating ? '#fbbf24' : 'var(--color-divider)'} />
                                    ))}
                                </div>
                                {order.review && (
                                    <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 'var(--text-body)', fontStyle: 'italic' }}>"{order.review}"</p>
                                )}
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                                <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <button key={i} onClick={() => { setRating(i); setShowRating(true); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                                            <Star size={32} fill={i <= rating ? '#fbbf24' : 'transparent'} color={i <= rating ? '#fbbf24' : 'var(--color-divider)'} />
                                        </button>
                                    ))}
                                </div>

                                <AnimatePresence>
                                    {showRating && (
                                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                                            <textarea
                                                value={review}
                                                onChange={e => setReview(e.target.value)}
                                                placeholder="Share your experience (optional)"
                                                rows={3}
                                                style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-base)', marginBottom: '12px', outline: 'none', fontFamily: 'inherit', resize: 'none' }}
                                            />
                                            <Button variant="primary" fullWidth onClick={handleSubmitRating} disabled={submitting}>
                                                {submitting ? 'Submitting...' : 'Submit Review'}
                                            </Button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}
                    </GlassCard>
                )}
            </div>

            {/* Sticky Actions */}
            <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: 'var(--space-4)', background: 'linear-gradient(to top, rgba(255,255,255,1) 0%, rgba(255,255,255,0.9) 70%, rgba(255,255,255,0) 100%)', zIndex: 100, display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {['placed', 'confirmed'].includes(order.status) && (
                    <>
                        <AnimatePresence>
                            {showCancelAlert && (
                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} style={{ backgroundColor: 'white', borderRadius: '16px', padding: 'var(--space-4)', boxShadow: 'var(--shadow-soft)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                                    <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start' }}>
                                        <div style={{ width: 40, height: 40, borderRadius: '12px', backgroundColor: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <TriangleAlert size={20} color="#ef4444" />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <p style={{ margin: '0 0 4px 0', fontWeight: 800, color: '#ef4444' }}>Cancel this order?</p>
                                            <p style={{ margin: 0, fontSize: 'var(--text-caption)', color: 'var(--color-text-secondary)' }}>This will stop the current order before restaurant preparation continues.</p>
                                        </div>
                                        <button onClick={() => setShowCancelAlert(false)} style={{ background: 'none', border: 'none', color: 'var(--color-text-tertiary)' }}><X size={16}/></button>
                                    </div>
                                    <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
                                        <Button variant="secondary" fullWidth onClick={() => setShowCancelAlert(false)}>Keep Order</Button>
                                        <Button variant="primary" fullWidth onClick={handleCancel} disabled={cancelling} style={{ backgroundColor: '#ef4444' }}>
                                            {cancelling ? 'Cancelling...' : 'Yes, Cancel'}
                                        </Button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                        {!showCancelAlert && (
                            <Button fullWidth onClick={() => setShowCancelAlert(true)} icon={TriangleAlert} style={{ backgroundColor: '#ef4444', color: 'white' }}>
                                Cancel Order
                            </Button>
                        )}
                    </>
                )}
                {order.status === 'delivered' && (
                    <Button variant="primary" fullWidth size="large" onClick={handleReorder} disabled={reordering} icon={RotateCcw}>
                        {reordering ? 'Adding to Cart...' : 'Reorder This Meal'}
                    </Button>
                )}
            </div>
        </PageContainer>
    );
};

export default OrderDetailPage;
