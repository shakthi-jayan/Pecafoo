import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardList, Navigation, Phone, MessageSquare, MapPin, Clock, CheckCircle, Package, ChevronRight, ExternalLink } from 'lucide-react';
import { ordersAPI, locationsAPI } from '../services/api';
import toast from 'react-hot-toast';
import MapView from '../components/shared/MapView';
import LiveOrderTracker from '../components/shared/LiveOrderTracker';
import { GlassCard, PageHero, EmptyState, Button } from '../shared-ui/PremiumUI';

const amount = (value) => `Rs ${Number(value || 0).toFixed(2)}`;

const DetailHeader = ({ title, subtitle }) => (
    <div style={{ marginBottom: 14 }}>
        <p style={{ fontWeight: 800, fontSize: '0.94rem', lineHeight: 1.2 }}>{title}</p>
        {subtitle ? (
            <p style={{ marginTop: 4, fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>{subtitle}</p>
        ) : null}
    </div>
);


function openNavigation(order) {
    const lat = order.delivery_latitude;
    const lng = order.delivery_longitude;
    const address = typeof order.delivery_address === 'object'
        ? order.delivery_address?.full_address || ''
        : order.delivery_address || '';

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

    let url;
    if (lat && lng) {
        // Use coordinates when available — more accurate
        url = isIOS
            ? `maps://maps.apple.com/?daddr=${lat},${lng}&dirflg=d`
            : `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
    } else if (address) {
        // Fallback to address string
        const encoded = encodeURIComponent(address);
        url = isIOS
            ? `maps://maps.apple.com/?daddr=${encoded}&dirflg=d`
            : `https://www.google.com/maps/dir/?api=1&destination=${encoded}&travelmode=driving`;
    } else {
        toast.error('No delivery address available');
        return;
    }

    window.open(url, '_blank');
}

export default function DeliveriesPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('active');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [routeData, setRouteData] = useState(null);
    const [deliveryOtp, setDeliveryOtp] = useState('');
    const [updatingOrderId, setUpdatingOrderId] = useState(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = useCallback(() => {
        setLoading(true);
        ordersAPI.getDeliveryOrders()
            .then(({ data }) => setOrders(data.results || data || []))
            .catch(() => toast.error('Failed to load deliveries'))
            .finally(() => setLoading(false));
    }, []);

    const updateStatus = async (id, newStatus, extraPayload = {}) => {
        const previousOrders = orders;
        const previousSelectedOrder = selectedOrder;
        setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
        if (selectedOrder?.id === id) {
            setSelectedOrder(prev => ({ ...prev, status: newStatus }));
        }

        try {
            setUpdatingOrderId(id);
            const { data } = await ordersAPI.updateStatus(id, { status: newStatus, ...extraPayload });
            
            if (data) {
                setOrders(prev => prev.map(o => o.id === id ? data : o));
                if (selectedOrder?.id === id) setSelectedOrder(data);
            }
            toast.success(`Status updated to ${newStatus.replace(/_/g, ' ')}`);
            return true;
        } catch {
            
            setOrders(previousOrders);
            setSelectedOrder(previousSelectedOrder);
            toast.error('Failed to update status');
            return false;
        } finally {
            setUpdatingOrderId(current => current === id ? null : current);
        }
    };

    
    const getMapData = (order) => {
        const markers = [];
        let center = null;

        
        if (order.restaurant_latitude && order.restaurant_longitude) {
            const pos = [parseFloat(order.restaurant_latitude), parseFloat(order.restaurant_longitude)];
            markers.push({ position: pos, popup: `🏪 ${order.restaurant_name || 'Pickup'}` });
            center = pos;
        }

        
        if (order.delivery_latitude && order.delivery_longitude) {
            const pos = [parseFloat(order.delivery_latitude), parseFloat(order.delivery_longitude)];
            markers.push({ position: pos, popup: '📍 Drop-off' });
            if (!center) center = pos;
        }

        return { center, markers };
    };

    
    useEffect(() => {
        if (selectedOrder) {
            setDeliveryOtp('');
            setRouteData(null);
            locationsAPI.getOrderRoute(selectedOrder.id)
                .then(({ data }) => setRouteData(data))
                .catch(() => setRouteData(null));
        }
    }, [selectedOrder?.id]);

    const activeOrders = orders.filter(o =>
        !['delivered', 'cancelled'].includes(o.status)
    );
    const completedOrders = orders.filter(o =>
        ['delivered', 'cancelled'].includes(o.status)
    );

    const getStatusColor = (status) => {
        const colors = {
            placed: 'var(--info)',
            confirmed: 'var(--info)',
            preparing: 'var(--warning)',
            ready: 'var(--accent)',
            picked_up: 'var(--primary)',
            on_the_way: 'var(--primary)',
            delivered: 'var(--success)',
            cancelled: 'var(--danger)',
        };
        return colors[status] || 'var(--text-muted)';
    };

    const getNextAction = (status) => {
        switch (status) {
            case 'ready': return { label: 'Pick Up', nextStatus: 'picked_up', icon: Package, navigate: false };
            case 'picked_up': return { label: 'Start Delivery', nextStatus: 'on_the_way', icon: Navigation, navigate: true };
            case 'on_the_way': return { label: 'Mark Delivered', nextStatus: 'delivered', icon: CheckCircle, navigate: false };
            default: return null;
        }
    };

    const handleActionClick = async (order, action) => {
        if (updatingOrderId === order.id) {
            return;
        }

        if (action.nextStatus === 'delivered') {
            if (!deliveryOtp.trim()) {
                toast.error('Enter the customer OTP before marking this order delivered');
                return;
            }
            if (order.delivery_otp && deliveryOtp.trim() !== String(order.delivery_otp).trim()) {
                toast.error('The entered OTP does not match the customer OTP for this order');
                return;
            }
        }

        
        const didUpdate = await updateStatus(
            order.id,
            action.nextStatus,
            action.nextStatus === 'delivered' ? { delivery_otp: deliveryOtp.trim() } : {},
        );
        if (!didUpdate) {
            return;
        }
        
        if (action.navigate) {
            openNavigation(order);
        }
        if (action.nextStatus === 'delivered') {
            setDeliveryOtp('');
        }
    };

    return (
        <div className="page page-shell stack-safe" style={{ paddingBottom: 132 }}>
            <PageHero eyebrow="Deliveries" title="Your Orders" description={`${activeOrders.length} active • ${completedOrders.length} completed`} compact />

            <GlassCard padding="var(--space-4)" style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.98), rgba(241,246,255,0.94))',
                display: 'grid',
                gap: 14,
                marginBottom: 'var(--space-4)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                    <div style={{ minWidth: 0, flex: 1 }}>
                        <p style={{ fontSize: '0.76rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--brand-delivery)', fontWeight: 800 }}>
                            Shift Snapshot
                        </p>
                        <h2 style={{ marginTop: 6, fontSize: '1.32rem', lineHeight: 1.12, fontWeight: 800 }}>
                            Stay on top of active drop-offs and route actions
                        </h2>
                    </div>
                    <div style={{ width: 42, height: 42, borderRadius: 16, background: 'rgba(16, 185, 129, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-delivery)', flexShrink: 0 }}>
                        <Navigation size={20} />
                    </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(92px, 1fr))', gap: 10 }}>
                    <div style={{ padding: 12, borderRadius: 16, background: 'rgba(16, 185, 129, 0.08)' }}>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 700 }}>Active</div>
                        <div style={{ marginTop: 4, fontSize: '1.15rem', fontWeight: 800 }}>{activeOrders.length}</div>
                    </div>
                    <div style={{ padding: 12, borderRadius: 16, background: 'rgba(34, 197, 94, 0.08)' }}>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 700 }}>Done</div>
                        <div style={{ marginTop: 4, fontSize: '1.15rem', fontWeight: 800 }}>
                            {completedOrders.filter((order) => order.status === 'delivered').length}
                        </div>
                    </div>
                    <div style={{ padding: 12, borderRadius: 16, background: 'rgba(244, 114, 182, 0.08)' }}>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 700 }}>Value</div>
                        <div style={{ marginTop: 4, fontSize: '1.15rem', fontWeight: 800 }}>
                            Rs {activeOrders.reduce((sum, order) => sum + Number(order.total || 0), 0).toFixed(0)}
                        </div>
                    </div>
                </div>
            </GlassCard>

            {}
            <div className="deliveries-tabs" style={{
                display: 'flex', gap: 0, marginBottom: 20,
                background: 'var(--bg-elevated)', borderRadius: 14, padding: 4,
                border: '1px solid var(--border)'
            }}>
                {['active', 'completed'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => { setActiveTab(tab); setSelectedOrder(null); }}
                        className="deliveries-tab-button"
                        style={{
                            flex: 1, padding: '12px 0', borderRadius: 10, border: 'none',
                            background: activeTab === tab ? 'var(--gradient-primary)' : 'transparent',
                            color: activeTab === tab ? 'white' : 'var(--text-muted)',
                            fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
                            transition: 'all 0.2s ease', textTransform: 'capitalize'
                        }}
                    >
                        {tab} ({tab === 'active' ? activeOrders.length : completedOrders.length})
                    </button>
                ))}
            </div>

            {}
            <AnimatePresence>
                {selectedOrder && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        style={{ marginBottom: 20, overflow: 'hidden' }}
                    >
                        <GlassCard padding="0" style={{ overflow: 'hidden' }}>
                            {}
                            {(() => {
                                const mapData = getMapData(selectedOrder);
                                const hasRoute = routeData?.route_polyline;
                                const finalCenter = hasRoute && routeData.pickup_location
                                    ? [routeData.pickup_location.lat, routeData.pickup_location.lng]
                                    : mapData.center;
                                const finalMarkers = hasRoute
                                    ? [
                                        routeData.pickup_location && { position: [routeData.pickup_location.lat, routeData.pickup_location.lng], popup: '🏪 Pickup' },
                                        routeData.dropoff_location && { position: [routeData.dropoff_location.lat, routeData.dropoff_location.lng], popup: '📍 Drop-off' },
                                    ].filter(Boolean)
                                    : mapData.markers;

                                return finalCenter ? (
                                    <div style={{ height: 200, background: 'var(--bg-elevated)' }}>
                                        <MapView
                                            center={finalCenter}
                                            markers={finalMarkers}
                                            route={hasRoute ? routeData.route_polyline : null}
                                            style={{ height: 200, width: '100%' }}
                                        />
                                    </div>
                                ) : (
                                    <div style={{ height: 120, background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                        <MapPin size={18} style={{ marginRight: 8 }} /> No location data available
                                    </div>
                                );
                            })()}

                            {}
                            <div style={{ padding: 20, display: 'grid', gap: 14 }}>
                                <div className="delivery-detail-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 0, flexWrap: 'wrap' }}>
                                    <div className="delivery-detail-header-copy" style={{ minWidth: 0, flex: 1 }}>
                                        <h3 style={{ fontWeight: 800, fontSize: '1.25rem' }}>#{selectedOrder.order_number}</h3>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{selectedOrder.restaurant_name}</p>
                                    </div>
                                    <span style={{
                                        padding: '6px 14px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700,
                                        background: `${getStatusColor(selectedOrder.status)}20`,
                                        color: getStatusColor(selectedOrder.status),
                                        textTransform: 'capitalize'
                                    }}>
                                        {selectedOrder.status.replace(/_/g, ' ')}
                                    </span>
                                </div>

                                <DetailHeader
                                    title="Delivery progress"
                                    subtitle="Update the order status as you move from pickup to drop-off."
                                />
                                <LiveOrderTracker currentStatus={selectedOrder.status} />

                                {}
                                <div style={{
                                    display: 'flex', alignItems: 'flex-start', gap: 10,
                                    padding: '12px 0', borderTop: '1px solid var(--border)', marginTop: 12
                                }}>
                                    <MapPin size={16} color="var(--accent)" style={{ marginTop: 2, flexShrink: 0 }} />
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, overflowWrap: 'anywhere' }}>
                                        {selectedOrder.delivery_address}
                                    </p>
                                </div>

                                {['picked_up', 'on_the_way'].includes(selectedOrder.status) && (
                                    <div
                                        style={{
                                            marginTop: 10,
                                            padding: 14,
                                            borderRadius: 16,
                                            background: 'rgba(255, 90, 31, 0.08)',
                                            border: '1px solid rgba(255, 90, 31, 0.18)',
                                        }}
                                    >
                                        <p style={{ fontWeight: 800, fontSize: '0.9rem', marginBottom: 4 }}>
                                            Delivery OTP required
                                        </p>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 10 }}>
                                            Ask the customer for the 4-digit OTP from their order screen before completing delivery.
                                        </p>
                                        <input
                                            className="input"
                                            inputMode="numeric"
                                            maxLength={6}
                                            placeholder="Enter customer OTP"
                                            value={deliveryOtp}
                                            onChange={(event) => setDeliveryOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
                                        />
                                    </div>
                                )}

                                {/* Action buttons */}
                                <div className="delivery-detail-actions" style={{ display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
                                    <button
                                        onClick={() => window.open(`tel:+91${selectedOrder.customer_phone || '0000000000'}`)}
                                        style={{ width: 48, height: 48, borderRadius: 14, border: '1px solid var(--border)', background: 'var(--bg-elevated)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                    >
                                        <Phone size={20} />
                                    </button>
                                    <button
                                        onClick={() => window.open(`sms:+91${selectedOrder.customer_phone || '0000000000'}`)}
                                        style={{ width: 48, height: 48, borderRadius: 14, border: '1px solid var(--border)', background: 'var(--bg-elevated)', color: 'var(--info)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                    >
                                        <MessageSquare size={20} />
                                    </button>
                                    <button
                                        onClick={() => openNavigation(selectedOrder)}
                                        title="Open in Maps"
                                        style={{ width: 48, height: 48, borderRadius: 14, border: '1px solid var(--border)', background: 'var(--bg-elevated)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                    >
                                        <ExternalLink size={20} />
                                    </button>
                                    {(() => {
                                        const action = getNextAction(selectedOrder.status);
                                        if (!action) return null;
                                        const { label, nextStatus, icon: Icon, navigate } = action;
                                        return (
                                            <motion.button
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => handleActionClick(selectedOrder, action)}
                                                disabled={updatingOrderId === selectedOrder.id}
                                                style={{
                                                    flex: '1 1 220px', minWidth: 0, padding: '0 20px', height: 48, borderRadius: 14,
                                                    border: 'none', background: nextStatus === 'delivered'
                                                        ? 'linear-gradient(135deg, #00c853, #00e676)'
                                                        : navigate
                                                            ? 'linear-gradient(135deg, #3b82f6, #60a5fa)'
                                                            : 'var(--gradient-primary)',
                                                    color: 'white', fontWeight: 700, fontSize: '0.95rem',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                                    cursor: updatingOrderId === selectedOrder.id ? 'not-allowed' : 'pointer',
                                                    opacity: updatingOrderId === selectedOrder.id ? 0.7 : 1,
                                                    boxShadow: navigate ? '0 6px 20px rgba(59, 130, 246, 0.3)' : undefined,
                                                }}
                                            >
                                                <Icon size={18} /> {updatingOrderId === selectedOrder.id ? 'Updating...' : label}
                                                {navigate && <ExternalLink size={14} style={{ opacity: 0.7 }} />}
                                            </motion.button>
                                        );
                                    })()}
                                </div>

                                {}
                                {selectedOrder.status === 'on_the_way' && (
                                    <motion.button
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => openNavigation(selectedOrder)}
                                        style={{
                                            width: '100%', marginTop: 10, padding: '12px 0', borderRadius: 14,
                                            border: 'none',
                                            background: 'linear-gradient(135deg, #3b82f6, #60a5fa)',
                                            color: 'white', fontWeight: 700, fontSize: '0.9rem',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                            cursor: 'pointer',
                                            boxShadow: '0 6px 20px rgba(59, 130, 246, 0.3)',
                                        }}
                                    >
                                        <Navigation size={18} /> Open in Maps <ExternalLink size={14} style={{ opacity: 0.7 }} />
                                    </motion.button>
                                )}

                                <button
                                    onClick={() => setSelectedOrder(null)}
                                    style={{
                                        width: '100%', marginTop: 12, padding: '10px 0', borderRadius: 12,
                                        border: '1px solid var(--border)', background: 'transparent',
                                        color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer'
                                    }}
                                >
                                    Close Details
                                </button>
                            </div>
                        </GlassCard>
                    </motion.div>
                )}
            </AnimatePresence>

            {}
            {loading ? (
                [1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 110, marginBottom: 12, borderRadius: 20 }} />)
            ) : (
                <>
                    {activeTab === 'active' && (
                        activeOrders.length > 0 ? (
                            activeOrders.map((o, i) => (
                                <motion.div
                                    key={o.id}
                                    className="card"
                                    onClick={() => setSelectedOrder(o)}
                                    style={{
                                        marginBottom: 12, padding: '18px 16px', borderRadius: 20,
                                        borderLeft: `4px solid ${getStatusColor(o.status)}`,
                                        cursor: 'pointer', transition: 'transform 0.15s ease',
                                        boxShadow: 'var(--shadow-sm)',
                                    }}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.99 }}
                                >
                                    <div className="delivery-card-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
                                        <div className="delivery-card-copy" style={{ minWidth: 0, flex: 1 }}>
                                            <h3 style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: 2 }}>#{o.order_number}</h3>
                                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{o.restaurant_name}</p>
                                        </div>
                                        <span style={{
                                            padding: '4px 12px', borderRadius: 20, fontSize: '0.7rem', fontWeight: 700,
                                            background: `${getStatusColor(o.status)}15`,
                                            color: getStatusColor(o.status), textTransform: 'capitalize'
                                        }}>
                                            {o.status.replace(/_/g, ' ')}
                                        </span>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginBottom: 12 }}>
                                        <MapPin size={14} color="var(--text-muted)" />
                                        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.45, overflowWrap: 'anywhere' }}>
                                            {o.delivery_address}
                                        </p>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 8, marginBottom: 12 }}>
                                        <div style={{ padding: 10, borderRadius: 14, background: 'rgba(255,255,255,0.72)', border: '1px solid var(--border)' }}>
                                            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>Amount</p>
                                            <p style={{ marginTop: 4, fontWeight: 800, color: 'var(--accent-strong)' }}>{amount(o.total)}</p>
                                        </div>
                                        <div style={{ padding: 10, borderRadius: 14, background: 'rgba(255,255,255,0.72)', border: '1px solid var(--border)' }}>
                                            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>Stage</p>
                                            <p style={{ marginTop: 4, fontWeight: 800, textTransform: 'capitalize' }}>{o.status.replace(/_/g, ' ')}</p>
                                        </div>
                                    </div>

                                    <div className="delivery-card-footer" style={{
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap',
                                        paddingTop: 10, borderTop: '1px solid var(--border)'
                                    }}>
                                        <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--accent)' }}>{amount(o.total)}</span>
                                        <div className="delivery-card-actions" style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', width: '100%', justifyContent: 'space-between' }}>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); openNavigation(o); }}
                                                className="delivery-inline-button"
                                                style={{
                                                    padding: '6px 12px', borderRadius: 10,
                                                    border: 'none',
                                                    background: 'linear-gradient(135deg, #3b82f6, #60a5fa)',
                                                    color: 'white', fontWeight: 700, fontSize: '0.72rem',
                                                    display: 'flex', alignItems: 'center', gap: 4,
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                <Navigation size={12} /> Navigate
                                            </button>
                                            <div className="delivery-inline-details" style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                                Details <ChevronRight size={16} />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <GlassCard padding="0">
                                <EmptyState icon={Navigation} title="No active deliveries" description="New orders will appear here when assigned" />
                            </GlassCard>
                        )
                    )}

                    {activeTab === 'completed' && (
                        completedOrders.length > 0 ? (
                            completedOrders.map((o, i) => (
                                <motion.div
                                    key={o.id}
                                    className="card"
                                    style={{
                                        marginBottom: 10, padding: '16px', borderRadius: 18,
                                        opacity: 0.7, borderLeft: `4px solid ${getStatusColor(o.status)}`
                                    }}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 0.7 }}
                                    transition={{ delay: i * 0.03 }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <h3 style={{ fontWeight: 700, fontSize: '1rem' }}>#{o.order_number}</h3>
                                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>
                                                {o.restaurant_name} • {amount(o.total)}
                                            </p>
                                        </div>
                                        <span style={{
                                            padding: '4px 12px', borderRadius: 20, fontSize: '0.7rem', fontWeight: 700,
                                            background: o.status === 'delivered' ? 'rgba(52, 211, 153, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                            color: o.status === 'delivered' ? 'var(--success)' : 'var(--danger)'
                                        }}>
                                            {o.status === 'delivered' ? '✓ Delivered' : '✕ Cancelled'}
                                        </span>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <GlassCard padding="0">
                                <EmptyState icon={ClipboardList} title="No completed deliveries" description="Your delivery history will appear here" />
                            </GlassCard>
                        )
                    )}
                </>
            )}
        </div>
    );
}
