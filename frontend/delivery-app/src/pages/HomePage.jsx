import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Power, Crosshair, MapPin, Phone, Navigation, Clock, IndianRupee, AlertTriangle, CheckCircle } from 'lucide-react';
import { deliveryAPI, analyticsAPI, ordersAPI } from '../services/api';
import toast from 'react-hot-toast';
import MapView from '../components/shared/MapView';
import SurgeBadge from '../components/shared/SurgeBadge';
import { useAuth } from '../App';

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
            {}
            <div style={{
                position: 'relative', margin: '-20px -20px 20px -20px',
                height: 300, background: 'var(--bg-elevated)',
                borderBottomLeftRadius: 24, borderBottomRightRadius: 24, overflow: 'hidden'
            }}>
                {currentLocation ? (
                    <MapView center={currentLocation} markers={markers} zone={hotspotZone} style={{ height: 300, width: '100%' }} />
                ) : (
                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div className="skeleton" style={{ width: '100%', height: '100%', borderRadius: 0 }} />
                    </div>
                )}

                {}
                <div style={{ position: 'absolute', top: 20, right: 20, zIndex: 1000, display: 'flex', gap: 8 }}>
                    {surgeMultiplier > 1 && <SurgeBadge multiplier={surgeMultiplier} />}
                </div>

                {}
                <div style={{ position: 'absolute', bottom: 20, left: 20, right: 20, zIndex: 1000 }}>
                    <motion.button
                        onClick={toggle}
                        whileTap={{ scale: 0.95 }}
                        style={{
                            width: '100%', padding: 16, borderRadius: 16, border: 'none',
                            background: available
                                ? 'linear-gradient(135deg, #00c853, #00e676)'
                                : 'var(--bg-card)',
                            color: available ? 'white' : 'var(--text)',
                            fontSize: '1.2rem', fontWeight: 800,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                            boxShadow: available
                                ? '0 8px 32px rgba(0, 200, 83, 0.35)'
                                : 'var(--shadow-elevation)',
                            cursor: 'pointer', transition: 'all 0.3s ease'
                        }}
                    >
                        <Power size={24} /> {available ? '🟢 You are Online' : '⭕ You are Offline'}
                    </motion.button>
                </div>
            </div>

            {}
            <AnimatePresence>
                {incomingOrder && (
                    <motion.div
                        initial={{ opacity: 0, y: -30, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -30, scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                        style={{
                            background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.12), rgba(245, 158, 11, 0.08))',
                            border: '2px solid var(--warning)',
                            borderRadius: 20, padding: 20, marginBottom: 20,
                            boxShadow: '0 8px 32px rgba(251, 191, 36, 0.2)'
                        }}
                    >
                        {}
                        <div style={{
                            height: 4, background: 'rgba(251, 191, 36, 0.2)',
                            borderRadius: 2, marginBottom: 16, overflow: 'hidden'
                        }}>
                            <motion.div
                                initial={{ width: '100%' }}
                                animate={{ width: `${timerProgress}%` }}
                                style={{
                                    height: '100%', borderRadius: 2,
                                    background: acceptTimer <= 5
                                        ? 'var(--danger)'
                                        : 'var(--warning)',
                                    transition: 'background 0.3s ease'
                                }}
                            />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                    <AlertTriangle size={18} color="var(--warning)" />
                                    <span style={{ fontWeight: 800, fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--warning)' }}>
                                        New Order Request
                                    </span>
                                </div>
                                <h3 style={{ fontWeight: 800, fontSize: '1.4rem' }}>#{incomingOrder.order_number}</h3>
                            </div>
                            <div style={{
                                width: 52, height: 52, borderRadius: '50%',
                                background: acceptTimer <= 5 ? 'var(--danger)' : 'var(--warning)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'white', fontSize: '1.2rem', fontWeight: 800,
                                boxShadow: `0 0 20px ${acceptTimer <= 5 ? 'rgba(239,68,68,0.5)' : 'rgba(251,191,36,0.5)'}`
                            }}>
                                {acceptTimer}s
                            </div>
                        </div>

                        <div style={{ marginBottom: 16 }}>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 4 }}>
                                🏪 <strong>{incomingOrder.restaurant_name || 'Restaurant'}</strong>
                            </p>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                                📍 {incomingOrder.delivery_address}
                            </p>
                            <p style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent)' }}>
                                💰 ₹{incomingOrder.total}
                            </p>
                        </div>

                        <div style={{ display: 'flex', gap: 12 }}>
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={handleDecline}
                                style={{
                                    flex: 1, padding: '14px 0', borderRadius: 14, border: '2px solid var(--danger)',
                                    background: 'transparent', color: 'var(--danger)',
                                    fontWeight: 800, fontSize: '1rem', cursor: 'pointer'
                                }}
                            >
                                ✕ Decline
                            </motion.button>
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={handleAccept}
                                style={{
                                    flex: 2, padding: '14px 0', borderRadius: 14, border: 'none',
                                    background: 'linear-gradient(135deg, #00c853, #00e676)',
                                    color: 'white', fontWeight: 800, fontSize: '1rem',
                                    cursor: 'pointer', boxShadow: '0 6px 20px rgba(0, 200, 83, 0.3)'
                                }}
                            >
                                <CheckCircle size={18} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                                Accept Order
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                {}
                {available && suggestedZone && (
                    <div className="card" style={{
                        marginBottom: 16, background: 'linear-gradient(135deg, rgba(235, 87, 87, 0.08), rgba(235, 87, 87, 0.04))',
                        border: '1px solid rgba(235, 87, 87, 0.2)', borderRadius: 20
                    }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                            <div style={{ background: 'rgba(235, 87, 87, 0.15)', color: 'var(--danger)', padding: 12, borderRadius: 14, flexShrink: 0 }}>
                                <Crosshair size={24} />
                            </div>
                            <div>
                                <h4 style={{ fontWeight: 800, marginBottom: 4, fontSize: '1rem' }}>🔥 Demand Hotspot</h4>
                                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                    Move towards the highlighted zone to get more orders!
                                    {suggestedZone.predicted_orders_next_hour &&
                                        <strong> Est. {suggestedZone.predicted_orders_next_hour} orders</strong>
                                    } coming soon.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Quick Stats</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: 'var(--bg-elevated)', borderRadius: 20, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        <Clock size={14} /> Today
                    </div>
                </div>

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
                            className="card"
                            style={{ textAlign: 'center', padding: '20px 12px', borderRadius: 20 }}
                        >
                            <div style={{ width: 36, height: 36, margin: '0 auto 10px', borderRadius: 10, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Icon size={18} color={color} />
                            </div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: 6 }}>{label}</p>
                            <p style={{ fontSize: '1.5rem', fontWeight: 800, color }}>{value}</p>
                        </motion.div>
                    ))}
                </div>

                {}
                {!available && (
                    <div className="card" style={{
                        textAlign: 'center', padding: 32, borderRadius: 20,
                        background: 'linear-gradient(135deg, rgba(100,100,120,0.06), rgba(100,100,120,0.02))',
                        border: '1px dashed var(--border)'
                    }}>
                        <Power size={48} style={{ color: 'var(--text-muted)', opacity: 0.3, marginBottom: 12 }} />
                        <h3 style={{ fontWeight: 700, marginBottom: 4, color: 'var(--text-secondary)' }}>You're Offline</h3>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                            Go online to start receiving delivery requests
                        </p>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
