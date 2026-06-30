import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Power, Crosshair, MapPin, Phone, Navigation, Clock, IndianRupee, AlertTriangle, CheckCircle } from 'lucide-react';
import { deliveryAPI, analyticsAPI, ordersAPI } from '../services/api';
import toast from 'react-hot-toast';
import MapView from '../components/shared/MapView';
import SurgeBadge from '../components/shared/SurgeBadge';
import { useAuth } from '../App';
import { MetricCard, PageHero, SectionHeader, GlassCard } from '../shared-ui/PremiumUI';

const INCOMING_POLL_INTERVAL = 8000; 
const ACCEPT_TIMEOUT = 15; 

export default function HomePage() {
    const { user } = useAuth();
    const [available, setAvailable] = useState(false);
    const [summary, setSummary] = useState({});
    const [currentLocation, setCurrentLocation] = useState(null);
    const [suggestedZone, setSuggestedZone] = useState(null);
    const [surgeMultiplier, setSurgeMultiplier] = useState(1.0);
    const [loading, setLoading] = useState(true);

    
    const [incomingOrder, setIncomingOrder] = useState(null);
    const [acceptTimer, setAcceptTimer] = useState(ACCEPT_TIMEOUT);
    const timerRef = useRef(null);
    const pollRef = useRef(null);

    
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [profileRes, summaryRes, surgeRes] = await Promise.allSettled([
                    deliveryAPI.getProfile(),
                    deliveryAPI.getEarningsSummary(),
                    analyticsAPI.getSurgePricing(),
                ]);
                if (profileRes.status === 'fulfilled') setAvailable(profileRes.value.data.is_available);
                if (summaryRes.status === 'fulfilled') setSummary(summaryRes.value.data);
                if (surgeRes.status === 'fulfilled') setSurgeMultiplier(surgeRes.value.data.surge_multiplier);
            } catch { } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    
    useEffect(() => {
        if (!navigator.geolocation) {
            setCurrentLocation([12.9716, 77.5946]);
            return;
        }
        const watchId = navigator.geolocation.watchPosition(
            (position) => {
                const loc = [position.coords.latitude, position.coords.longitude];
                setCurrentLocation(loc);
                if (available) {
                    deliveryAPI.updateLocation({ latitude: loc[0], longitude: loc[1] }).catch(() => { });
                }
            },
            () => setCurrentLocation([12.9716, 77.5946]),
            { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 }
        );
        return () => navigator.geolocation.clearWatch(watchId);
    }, [available]);

    
    useEffect(() => {
        if (available && currentLocation) {
            analyticsAPI.getSuggestedZone()
                .then(({ data }) => setSuggestedZone(data))
                .catch(() => { });
        } else {
            setSuggestedZone(null);
        }
    }, [available, currentLocation]);

    
    useEffect(() => {
        if (!available) {
            if (pollRef.current) clearInterval(pollRef.current);
            return;
        }
        const checkIncoming = async () => {
            try {
                
                const { data } = await ordersAPI.getAvailableOrders();
                const orders = data.results || data || [];
                
                const readyOrder = orders.find(o => ['ready', 'confirmed'].includes(o.status));
                if (readyOrder && (!incomingOrder || incomingOrder.id !== readyOrder.id)) {
                    setIncomingOrder(readyOrder);
                    setAcceptTimer(ACCEPT_TIMEOUT);
                }
            } catch { }
        };
        checkIncoming();
        pollRef.current = setInterval(checkIncoming, INCOMING_POLL_INTERVAL);
        return () => { if (pollRef.current) clearInterval(pollRef.current); };
    }, [available]);

    
    useEffect(() => {
        if (!incomingOrder) return;
        if (acceptTimer <= 0) {
            handleDecline();
            return;
        }
        timerRef.current = setTimeout(() => setAcceptTimer(t => t - 1), 1000);
        return () => clearTimeout(timerRef.current);
    }, [incomingOrder, acceptTimer]);

    
    const toggle = async () => {
        try {
            const { data } = await deliveryAPI.toggleAvailability({ is_available: !available });
            setAvailable(data.is_available);
            toast.success(data.message);
            if (!data.is_available) {
                setIncomingOrder(null);
            }
        } catch {
            toast.error('Failed to change status');
        }
    };

    const handleAccept = async () => {
        if (!incomingOrder) return;
        try {
            
            await deliveryAPI.acceptOrder(incomingOrder.id);
            toast.success(`✅ Accepted order #${incomingOrder.order_number}!`);
            setIncomingOrder(null);
            setAcceptTimer(ACCEPT_TIMEOUT);
            
            deliveryAPI.getEarningsSummary().then(({ data }) => setSummary(data)).catch(() => { });
        } catch (err) {
            const msg = err.response?.data?.error || 'Failed to accept order';
            toast.error(msg);
        }
    };

    const handleDecline = useCallback(async () => {
        if (incomingOrder) {
            try {
                await deliveryAPI.declineOrder(incomingOrder.id);
            } catch {  }
        }
        setIncomingOrder(null);
        setAcceptTimer(ACCEPT_TIMEOUT);
    }, [incomingOrder]);

    
    const markers = currentLocation ? [{ position: currentLocation, popup: 'You are here 📍' }] : [];
    let hotspotZone = null;
    if (suggestedZone?.center) {
        markers.push({ position: [suggestedZone.center.lat, suggestedZone.center.lng], popup: 'Demand Hotspot 🔥' });
        if (suggestedZone.boundary_polygon) hotspotZone = suggestedZone.boundary_polygon;
    }

    const timerProgress = (acceptTimer / ACCEPT_TIMEOUT) * 100;

    return (
        <div className="page page-shell stack-safe" style={{ paddingBottom: 132 }}>
            <PageHero eyebrow="Partner dashboard" title={`Ready when you are${user?.first_name ? `, ${user.first_name}` : ''}.`} description={available ? 'You’re online and visible for nearby delivery requests.' : 'Review your day, then go online when you’re ready to move.'} compact>
                <div className={`delivery-status-orbit ${available ? 'is-online' : ''}`}><span /><strong>{available ? 'Live' : 'Paused'}</strong><small>Partner status</small></div>
            </PageHero>
            <SectionHeader eyebrow="Your area" title="Live delivery map" description="Your position, nearby demand, and suggested zones in one view." />
            <GlassCard padding="0" style={{ position: 'relative', overflow: 'hidden', marginBottom: 'var(--space-4)' }}>
                {currentLocation ? (
                    <MapView center={currentLocation} markers={markers} zone={hotspotZone} style={{ height: 300, width: '100%' }} />
                ) : (
                    <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div className="skeleton" style={{ width: '100%', height: '100%', borderRadius: 0 }} />
                    </div>
                )}

                <div style={{ position: 'absolute', top: 20, right: 20, zIndex: 1000, display: 'flex', gap: 8 }}>
                    {surgeMultiplier > 1 && <SurgeBadge multiplier={surgeMultiplier} />}
                </div>

                <div style={{ position: 'absolute', bottom: 20, left: 20, right: 20, zIndex: 1000 }}>
                    <motion.button
                        onClick={toggle}
                        whileTap={{ scale: 0.95 }}
                        style={{
                            width: '100%', padding: '16px', borderRadius: 'var(--radius-lg)', border: 'none',
                            background: available
                                ? 'var(--color-success)'
                                : 'var(--color-bg-elevated)',
                            color: available ? 'white' : 'var(--color-text-primary)',
                            fontSize: '1.2rem', fontWeight: 800,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                            boxShadow: available
                                ? '0 8px 32px rgba(16, 185, 129, 0.35)'
                                : 'var(--shadow-elevation)',
                            cursor: 'pointer', transition: 'all 0.3s ease'
                        }}
                    >
                        <Power size={24} /> {available ? '🟢 You are Online' : '⭕ You are Offline'}
                    </motion.button>
                </div>
            </GlassCard>

            {}
            <AnimatePresence>
                {incomingOrder && (
                    <motion.div
                        initial={{ opacity: 0, y: -30, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -30, scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                        style={{ marginBottom: 'var(--space-4)' }}
                    >
                        <GlassCard padding="var(--space-4)" style={{
                            background: 'var(--color-warning-bg)',
                            border: '1px solid var(--color-warning)',
                            boxShadow: '0 8px 32px rgba(245, 158, 11, 0.2)'
                        }}>
                            <div style={{
                                height: 4, background: 'rgba(245, 158, 11, 0.2)',
                                borderRadius: 2, marginBottom: 'var(--space-3)', overflow: 'hidden'
                            }}>
                                <motion.div
                                    initial={{ width: '100%' }}
                                    animate={{ width: `${timerProgress}%` }}
                                    style={{
                                        height: '100%', borderRadius: 2,
                                        background: acceptTimer <= 5
                                            ? 'var(--color-danger)'
                                            : 'var(--color-warning)',
                                        transition: 'background 0.3s ease'
                                    }}
                                />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-3)' }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                        <AlertTriangle size={18} color="var(--color-warning)" />
                                        <span style={{ fontWeight: 800, fontSize: 'var(--text-body)', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--color-warning)' }}>
                                            New Order Request
                                        </span>
                                    </div>
                                    <h3 style={{ fontWeight: 800, fontSize: 'var(--text-h3)' }}>#{incomingOrder.order_number}</h3>
                                </div>
                                <div style={{
                                    width: 52, height: 52, borderRadius: '50%',
                                    background: acceptTimer <= 5 ? 'var(--color-danger)' : 'var(--color-warning)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: 'white', fontSize: 'var(--text-body)', fontWeight: 800,
                                    boxShadow: `0 0 20px ${acceptTimer <= 5 ? 'rgba(239,68,68,0.5)' : 'rgba(245,158,11,0.5)'}`
                                }}>
                                    {acceptTimer}s
                                </div>
                            </div>

                            <div style={{ marginBottom: 'var(--space-4)' }}>
                                <p style={{ fontSize: 'var(--text-body)', color: 'var(--color-text-secondary)', marginBottom: 4 }}>
                                    🏪 <strong style={{ color: 'var(--color-text-primary)' }}>{incomingOrder.restaurant_name || 'Restaurant'}</strong>
                                </p>
                                <p style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-secondary)', marginBottom: 4 }}>
                                    📍 {incomingOrder.delivery_address}
                                </p>
                                <p style={{ fontSize: 'var(--text-h4)', fontWeight: 800, color: 'var(--brand-delivery)' }}>
                                    💰 ₹{incomingOrder.total}
                                </p>
                            </div>

                            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleDecline}
                                    style={{
                                        flex: 1, padding: '14px 0', borderRadius: 'var(--radius-md)', border: '2px solid var(--color-danger)',
                                        background: 'transparent', color: 'var(--color-danger)',
                                        fontWeight: 800, fontSize: 'var(--text-body)', cursor: 'pointer'
                                    }}
                                >
                                    ✕ Decline
                                </motion.button>
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleAccept}
                                    style={{
                                        flex: 2, padding: '14px 0', borderRadius: 'var(--radius-md)', border: 'none',
                                        background: 'var(--color-success)',
                                        color: 'white', fontWeight: 800, fontSize: 'var(--text-body)',
                                        cursor: 'pointer', boxShadow: '0 6px 20px rgba(16, 185, 129, 0.3)'
                                    }}
                                >
                                    <CheckCircle size={18} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                                    Accept Order
                                </motion.button>
                            </div>
                        </GlassCard>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                {available && suggestedZone && (
                    <GlassCard padding="var(--space-4)" style={{
                        marginBottom: 'var(--space-4)', background: 'var(--color-danger-bg)',
                        border: '1px solid rgba(239, 68, 68, 0.2)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
                            <div style={{ background: 'rgba(239, 68, 68, 0.15)', color: 'var(--color-danger)', padding: 12, borderRadius: 14, flexShrink: 0 }}>
                                <Crosshair size={24} />
                            </div>
                            <div>
                                <h4 style={{ fontWeight: 800, marginBottom: 4, fontSize: 'var(--text-body)', color: 'var(--color-text-primary)' }}>🔥 Demand Hotspot</h4>
                                <p style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                                    Move towards the highlighted zone to get more orders!
                                    {suggestedZone.predicted_orders_next_hour &&
                                        <strong style={{ color: 'var(--color-text-primary)' }}> Est. {suggestedZone.predicted_orders_next_hour} orders</strong>
                                    } coming soon.
                                </p>
                            </div>
                        </div>
                    </GlassCard>
                )}

                <SectionHeader eyebrow="Performance" title="Today at a glance" description="Earnings and delivery momentum, without the spreadsheet." action={<span style={{ padding: '4px 8px', borderRadius: '100px', background: 'var(--color-bg-elevated)', fontSize: 'var(--text-caption)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={14} /> Today</span>} />

                {}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                    {[
                        { label: "Today's Earnings", value: `₹${summary.today_earnings || 0}`, color: 'var(--accent)', icon: IndianRupee },
                        { label: 'Total Deliveries', value: summary.total_deliveries || 0, color: 'var(--text)', icon: Navigation },
                        { label: 'This Week', value: `₹${summary.week_earnings || 0}`, color: 'var(--success)', icon: MapPin },
                        { label: 'Total Earnings', value: `₹${summary.total_earnings || 0}`, color: 'var(--warning)', icon: IndianRupee },
                    ].map(({ label, value, color, icon: Icon }, i) => (
                        <motion.div
                            key={label}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 + i * 0.05 }}
                        >
                            <MetricCard icon={Icon} label={label} value={loading ? '—' : value} tone={color} detail="Live" />
                        </motion.div>
                    ))}
                </div>

                {!available && (
                    <GlassCard padding="var(--space-6)" style={{
                        textAlign: 'center',
                        background: 'var(--color-bg-elevated)',
                        border: '1px dashed var(--color-border)'
                    }}>
                        <Power size={48} style={{ color: 'var(--color-text-secondary)', opacity: 0.3, margin: '0 auto var(--space-3)' }} />
                        <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-1)', color: 'var(--color-text-primary)' }}>You're Offline</h3>
                        <p style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-secondary)' }}>
                            Go online to start receiving delivery requests
                        </p>
                    </GlassCard>
                )}
            </motion.div>
        </div>
    );
}
