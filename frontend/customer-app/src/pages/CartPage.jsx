import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Minus, Plus, Trash2, ShoppingBag, MapPin, ArrowRight, Navigation, Loader } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';
import { ordersAPI, customersAPI, locationsAPI } from '../services/api';
import toast from 'react-hot-toast';
import MapView from '../components/shared/MapView';
import DeliveryFeeEstimate from '../components/cart/DeliveryFeeEstimate';

const CartPage = () => {
    const navigate = useNavigate();
    const { cartItems, restaurant, subtotal, updateQuantity, removeFromCart, clearCart } = useCart();
    const { isAuthenticated } = useAuth();
    const { coords: locationCoords, address: locationAddress } = useLocation();
    const [placing, setPlacing] = useState(false);
    const [fetchingLocation, setFetchingLocation] = useState(false);
    const [deliveryAddress, setDeliveryAddress] = useState('');
    const [deliveryCoords, setDeliveryCoords] = useState([19.0760, 72.8777]);
    const [savedAddresses, setSavedAddresses] = useState([]);
    const [specialInstructions, setSpecialInstructions] = useState('');
    const [deliveryEstimate, setDeliveryEstimate] = useState(null);
    const [resolvingMapAddress, setResolvingMapAddress] = useState(false);

    useEffect(() => {
        if (isAuthenticated) {
            customersAPI.getAddresses().then(({ data }) => {
                const addrs = data.results || data || [];
                setSavedAddresses(addrs);
                // Auto-select default address
                const defaultAddr = addrs.find(a => a.is_default);
                if (defaultAddr && !deliveryAddress) {
                    handleSelectAddress(defaultAddr);
                } else if (!deliveryAddress && locationAddress && locationCoords) {
                    // Fall back to GPS-detected location
                    setDeliveryAddress(locationAddress);
                    setDeliveryCoords(locationCoords);
                }
            }).catch(() => { });
        } else if (!deliveryAddress && locationAddress && locationCoords) {
            // Unauthenticated — use GPS location
            setDeliveryAddress(locationAddress);
            setDeliveryCoords(locationCoords);
        }
    }, [isAuthenticated, locationAddress, locationCoords]);

    const handleSelectAddress = (addr) => {
        setDeliveryAddress(
            [addr.full_address, addr.landmark, addr.city, addr.state, addr.pincode]
                .filter(Boolean)
                .join(', ')
        );
        if (addr.latitude && addr.longitude) {
            setDeliveryCoords([parseFloat(addr.latitude), parseFloat(addr.longitude)]);
        }
    };

    // ── GPS + Reverse Geocoding Auto-fill ──
    const fetchCurrentLocation = async () => {
        if (!('geolocation' in navigator)) {
            toast.error('Geolocation not supported');
            return;
        }

        setFetchingLocation(true);

        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const lat = pos.coords.latitude;
                const lng = pos.coords.longitude;
                setDeliveryCoords([lat, lng]);

                try {
                    
                    const { data } = await locationsAPI.reverseGeocode({
                        latitude: lat,
                        longitude: lng,
                    });

                    if (data && data.display_name) {
                        
                        const parts = [
                            data.road,
                            data.suburb,
                            data.city,
                            data.state,
                            data.postcode,
                        ].filter(Boolean);

                        const addressStr = parts.length > 0 ? parts.join(', ') : data.display_name;
                        setDeliveryAddress(addressStr);
                        toast.success('📍 Address auto-filled from your location!');
                    } else {
                        toast.success('📍 Location set! Please type your address.');
                    }
                } catch (err) {
                    
                    toast.success('📍 Location set! Please type your street address.');
                }

                setFetchingLocation(false);
            },
            (err) => {
                setFetchingLocation(false);
                if (err.code === 1) toast.error('Location permission denied. Enable it in browser settings.');
                else if (err.code === 2) toast.error('Location unavailable. Try again.');
                else toast.error('Location request timed out.');
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
        );
    };

    
    const handleMapClick = async (coords) => {
        const fallbackAddress = `${coords[0].toFixed(5)}, ${coords[1].toFixed(5)}`;
        setDeliveryCoords(coords);
        setDeliveryAddress(fallbackAddress);
        setResolvingMapAddress(true);
        try {
            const { data } = await locationsAPI.reverseGeocode({
                latitude: coords[0],
                longitude: coords[1],
            });
            if (data && data.display_name) {
                const parts = [data.road, data.suburb, data.city, data.state, data.postcode].filter(Boolean);
                setDeliveryAddress(parts.length > 0 ? parts.join(', ') : data.display_name);
            }
        } catch {
            
        }
    };

    const handleMapLocationChange = async (coords) => {
        const fallbackAddress = `${coords[0].toFixed(5)}, ${coords[1].toFixed(5)}`;
        setDeliveryCoords(coords);
        setDeliveryAddress(fallbackAddress);
        setResolvingMapAddress(true);

        try {
            const { data } = await locationsAPI.reverseGeocode({
                latitude: coords[0],
                longitude: coords[1],
            });

            if (data && data.display_name) {
                const parts = [data.road, data.suburb, data.city, data.state, data.postcode].filter(Boolean);
                setDeliveryAddress(parts.length > 0 ? parts.join(', ') : data.display_name);
            }
        } catch {
            setDeliveryAddress(fallbackAddress);
        } finally {
            setResolvingMapAddress(false);
        }
    };

    const tax = subtotal * 0.05;
    const deliveryFee = parseFloat(deliveryEstimate?.total_delivery_fee ?? restaurant?.delivery_fee ?? 0);
    const total = subtotal + tax + deliveryFee;

    const [paymentMethod, setPaymentMethod] = useState('cod');

    const loadRazorpay = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handlePlaceOrder = async () => {
        if (!isAuthenticated) { navigate('/login'); return; }
        if (!deliveryAddress.trim()) { toast.error('Please enter or select a delivery address.'); return; }
        setPlacing(true);
        try {
            const { data: order } = await ordersAPI.create({
                restaurant_id: restaurant.id,
                items: cartItems.map(i => ({ menu_item_id: i.id, quantity: i.quantity })),
                delivery_address: deliveryAddress,
                delivery_latitude: Number(deliveryCoords[0]).toFixed(6),
                delivery_longitude: Number(deliveryCoords[1]).toFixed(6),
                special_instructions: specialInstructions,
                payment_method: paymentMethod,
            });
            
            if (paymentMethod === 'razorpay') {
                const res = await loadRazorpay();
                if (!res) {
                    toast.error('Failed to load Razorpay SDK');
                    setPlacing(false);
                    return;
                }
                
                const { data: initData } = await ordersAPI.initiatePayment(order.id, 'razorpay');
                
                const options = {
                    key: initData.key_id,
                    amount: initData.amount,
                    currency: initData.currency,
                    name: 'Pecafoo',
                    description: 'Order Payment',
                    order_id: initData.razorpay_order_id,
                    handler: async function (response) {
                        try {
                            setPlacing(true);
                            await ordersAPI.verifyRazorpay({
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_signature: response.razorpay_signature
                            });
                            clearCart();
                            toast.success('Payment successful! Order placed. 🎉');
                            navigate('/orders');
                        } catch (err) {
                            toast.error('Payment verification failed.');
                            setPlacing(false);
                        }
                    },
                    prefill: {
                        name: 'Customer',
                        email: 'customer@pecafoo.com',
                        contact: '9999999999'
                    },
                    theme: {
                        color: '#ff5a1f'
                    }
                };
                
                const paymentObject = new window.Razorpay(options);
                paymentObject.open();
                paymentObject.on('payment.failed', function () {
                    toast.error('Payment failed. Please try again.');
                    setPlacing(false);
                });
            } else {
                clearCart();
                toast.success('Order placed! 🎉');
                navigate('/orders');
            }
        } catch (e) {
            const errData = e.response?.data;
            const msg = errData?.error || errData?.detail ||
                (typeof errData === 'object' ? JSON.stringify(errData) : 'Failed to place order.');
            toast.error(msg);
            setPlacing(false);
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className="page">
                <div className="page-header"><h1 className="page-title">Cart</h1></div>
                <div className="empty-state" style={{ marginTop: 'var(--space-2xl)' }}>
                    <ShoppingBag />
                    <h3>Your cart is empty</h3>
                    <p>Add items from a restaurant to get started</p>
                    <button className="btn btn-primary" onClick={() => navigate('/')} style={{ marginTop: 16 }}>Browse Restaurants</button>
                </div>
            </div>
        );
    }

    return (
        <div className="page" style={{ paddingBottom: 120 }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="page-header">
                    <h1 className="page-title">Cart</h1>
                    <button className="btn btn-ghost" onClick={clearCart} style={{ color: 'var(--danger)' }}>
                        <Trash2 size={18} /> Clear
                    </button>
                </div>

                {}
                <div className="card" style={{ padding: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>Ordering from</p>
                    <h3 style={{ fontWeight: 700 }}>{restaurant?.name}</h3>
                </div>

                {}
                {cartItems.map((item) => (
                    <div key={item.id} style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '12px 0', borderBottom: '1px solid var(--border-light)',
                    }}>
                        {item.image ? (
                            <img src={item.image} alt={item.name} style={{
                                width: 52, height: 52, borderRadius: 10, objectFit: 'cover',
                            }} onError={(event) => {
                                event.currentTarget.onerror = null;
                                event.currentTarget.src = `data:image/svg+xml;utf8,${encodeURIComponent(
                                    '<svg xmlns="http://www.w3.org/2000/svg" width="52" height="52" viewBox="0 0 52 52"><rect width="52" height="52" rx="10" fill="#F4E7E1"/><text x="26" y="31" text-anchor="middle" font-size="20">🍽️</text></svg>'
                                )}`;
                            }} />
                        ) : (
                            <div style={{
                                width: 52, height: 52, borderRadius: 10, background: 'var(--bg-elevated)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem',
                            }}>🍽️</div>
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <h4 style={{ fontWeight: 600, marginBottom: 2, fontSize: '0.9rem' }}>{item.name}</h4>
                            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                                ₹{item.discount_price || item.price}
                            </p>
                        </div>
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            background: 'var(--bg-card)', border: '1px solid var(--border)',
                            borderRadius: 8, padding: '4px 8px',
                        }}>
                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer' }}>
                                <Minus size={16} />
                            </button>
                            <span style={{ fontWeight: 700, minWidth: 20, textAlign: 'center' }}>{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer' }}>
                                <Plus size={16} />
                            </button>
                        </div>
                        <span style={{ fontWeight: 700, minWidth: 55, textAlign: 'right' }}>
                            ₹{((item.discount_price || item.price) * item.quantity).toFixed(0)}
                        </span>
                    </div>
                ))}

                {}
                <div style={{ marginTop: 'var(--space-lg)' }}>
                    <label className="input-label">Special Instructions (optional)</label>
                    <input
                        className="input"
                        placeholder="Extra spicy, no onions, etc."
                        value={specialInstructions}
                        onChange={e => setSpecialInstructions(e.target.value)}
                    />
                </div>

                {}
                <div className="input-group" style={{ marginTop: 'var(--space-lg)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label className="input-label" style={{ margin: 0 }}>
                            <MapPin size={14} style={{ color: 'var(--accent)' }} /> Delivery Address
                        </label>
                        {savedAddresses.length > 0 && (
                            <select
                                onChange={(e) => {
                                    const ad = savedAddresses.find(a => a.id === e.target.value);
                                    if (ad) handleSelectAddress(ad);
                                }}
                                style={{
                                    padding: '4px 8px', borderRadius: 8,
                                    border: '1px solid var(--border)', background: 'var(--bg-elevated)',
                                    fontSize: '0.8rem', outline: 'none', maxWidth: 160,
                                    color: 'var(--text-primary)',
                                }}
                                defaultValue=""
                            >
                                <option value="" disabled>Saved addresses...</option>
                                {savedAddresses.map(a => (
                                    <option key={a.id} value={a.id}>
                                        {a.label || a.address_type} — {(a.full_address || '').substring(0, 20)}...
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    <textarea
                        className="input"
                        placeholder="Enter full delivery address..."
                        value={deliveryAddress}
                        onChange={e => setDeliveryAddress(e.target.value)}
                        rows={2}
                        style={{ resize: 'none', marginTop: 'var(--space-sm)' }}
                        id="delivery-address"
                    />

                    {}
                    <div style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        marginTop: 'var(--space-sm)', marginBottom: 4,
                    }}>
                        <label className="input-label" style={{ margin: 0, fontSize: '0.8rem' }}>
                            {resolvingMapAddress ? 'Updating address from pin...' : 'Tap, drag the pin, or use GPS'}
                        </label>
                        <button
                            type="button"
                            onClick={fetchCurrentLocation}
                            disabled={fetchingLocation}
                            className="btn btn-ghost btn-sm"
                            style={{
                                color: fetchingLocation ? 'var(--text-muted)' : 'var(--primary)',
                                padding: '6px 12px', fontSize: '0.8rem',
                                background: 'var(--bg-elevated)', borderRadius: 8,
                                border: '1px solid var(--border)',
                                display: 'flex', alignItems: 'center', gap: 6,
                            }}
                        >
                            {fetchingLocation ? (
                                <><Loader size={14} className="spin" /> Finding...</>
                            ) : (
                                <><Navigation size={14} /> Use My Location</>
                            )}
                        </button>
                    </div>

                    <div style={{
                        position: 'relative', height: 200, background: 'var(--bg-elevated)',
                        borderRadius: 16, overflow: 'hidden', border: '1px solid var(--border)',
                    }}>
                        <MapView
                            center={deliveryCoords}
                            markers={[{
                                position: deliveryCoords,
                                popup: deliveryAddress || 'Delivery Location',
                                draggable: true,
                                onDragEnd: handleMapLocationChange,
                            }]}
                            onLocationSelect={handleMapLocationChange}
                            style={{ height: '100%', width: '100%' }}
                        />
                    </div>
                </div>

                {}
                <DeliveryFeeEstimate
                    restaurantId={restaurant?.id}
                    cartValue={subtotal}
                    customerLat={deliveryCoords?.[0]}
                    customerLng={deliveryCoords?.[1]}
                    onEstimateChange={setDeliveryEstimate}
                />

                <div className="card" style={{ padding: 'var(--space-md)', marginTop: 'var(--space-md)' }}>
                    <h3 style={{ fontWeight: 700, marginBottom: 12 }}>Bill Summary</h3>
                    {[['Subtotal', subtotal], ['Tax (5%)', tax], ['Delivery', deliveryFee]].map(([l, v]) => (
                        <div key={l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 'var(--font-size-sm)' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>{l}</span>
                            <span>₹{Number(v).toFixed(2)}</span>
                        </div>
                    ))}
                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: 10, display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                        <span style={{ fontWeight: 700 }}>Total</span>
                        <span style={{ fontWeight: 800, color: 'var(--accent)' }}>₹{total.toFixed(2)}</span>
                    </div>
                </div>

                <div className="card" style={{ padding: 'var(--space-md)', marginTop: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
                    <h3 style={{ fontWeight: 700, marginBottom: 12 }}>Payment Method</h3>
                    <div style={{ display: 'flex', gap: 12 }}>
                        <button
                            onClick={() => setPaymentMethod('cod')}
                            className={`btn ${paymentMethod === 'cod' ? 'btn-primary' : 'btn-secondary'}`}
                            style={{ flex: 1, padding: '12px 4px', fontSize: '0.9rem' }}
                        >
                            Cash on Delivery
                        </button>
                        <button
                            onClick={() => setPaymentMethod('razorpay')}
                            className={`btn ${paymentMethod === 'razorpay' ? 'btn-primary' : 'btn-secondary'}`}
                            style={{ flex: 1, padding: '12px 4px', fontSize: '0.9rem' }}
                        >
                            Pay Online
                        </button>
                    </div>
                </div>

                {}
                <button
                    className="btn btn-primary btn-full btn-lg"
                    onClick={handlePlaceOrder}
                    disabled={placing || !deliveryAddress.trim()}
                    id="place-order-btn"
                >
                    {placing ? 'Processing...' : `Place Order — ₹${total.toFixed(2)}`}
                    {!placing && <ArrowRight size={20} />}
                </button>
            </motion.div>
        </div>
    );
};
export default CartPage;
