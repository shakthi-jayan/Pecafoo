import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Minus, Plus, Trash2, ShoppingBag, MapPin, Navigation, Loader, CreditCard, Banknote } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';
import { ordersAPI, customersAPI, locationsAPI } from '../services/api';
import toast from 'react-hot-toast';
import { MapView } from '../../../shared-ui';
import DeliveryFeeEstimate from '../components/cart/DeliveryFeeEstimate';

import {
    PageContainer,
    Button,
    IconButton,
    SectionHeader,
    EmptyState,
    FloatingInput,
    SegmentedControl,
    GlassCard
} from '../../../shared-ui/index';

const CartPage = () => {
    const navigate = useNavigate();
    const { cartItems, restaurant, subtotal, updateQuantity, clearCart } = useCart();
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
    const [paymentMethod, setPaymentMethod] = useState('cod');

    useEffect(() => {
        if (isAuthenticated) {
            customersAPI.getAddresses().then(({ data }) => {
                const addrs = data.results || data || [];
                setSavedAddresses(addrs);
                const defaultAddr = addrs.find(a => a.is_default);
                if (defaultAddr && !deliveryAddress) {
                    handleSelectAddress(defaultAddr);
                } else if (!deliveryAddress && locationAddress && locationCoords) {
                    setDeliveryAddress(locationAddress);
                    setDeliveryCoords(locationCoords);
                }
            }).catch(() => { });
        } else if (!deliveryAddress && locationAddress && locationCoords) {
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
                    const { data } = await locationsAPI.reverseGeocode({ latitude: lat, longitude: lng });
                    if (data && data.display_name) {
                        const parts = [data.road, data.suburb, data.city, data.state, data.postcode].filter(Boolean);
                        const addressStr = parts.length > 0 ? parts.join(', ') : data.display_name;
                        setDeliveryAddress(addressStr);
                        toast.success('Address auto-filled from your location!');
                    } else {
                        toast.success('Location set! Please type your address.');
                    }
                } catch (err) {
                    toast.success('Location set! Please type your street address.');
                }
                setFetchingLocation(false);
            },
            (err) => {
                setFetchingLocation(false);
                if (err.code === 1) toast.error('Location permission denied.');
                else if (err.code === 2) toast.error('Location unavailable.');
                else toast.error('Location request timed out.');
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
        );
    };

    const handleMapLocationChange = async (coords) => {
        const fallbackAddress = `${coords[0].toFixed(5)}, ${coords[1].toFixed(5)}`;
        setDeliveryCoords(coords);
        setDeliveryAddress(fallbackAddress);
        setResolvingMapAddress(true);

        try {
            const { data } = await locationsAPI.reverseGeocode({ latitude: coords[0], longitude: coords[1] });
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
        if (!isAuthenticated) { navigate('/login', { state: { from: { pathname: '/cart' } } }); return; }
        if (!deliveryAddress.trim()) { toast.error('Please enter a delivery address.'); return; }
        
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
                    toast.error('Failed to load payment gateway');
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
                    theme: { color: '#FF3366' }
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
            const msg = errData?.error || errData?.detail || 'Failed to place order.';
            toast.error(msg);
            setPlacing(false);
        }
    };

    if (cartItems.length === 0) {
        return (
            <PageContainer>
                <div style={{ marginTop: 'var(--space-8)' }}>
                    <EmptyState
                        icon={ShoppingBag}
                        title="Your cart is empty"
                        description="Add items from a restaurant to get started"
                        action={<Button onClick={() => navigate('/')}>Browse Restaurants</Button>}
                    />
                </div>
            </PageContainer>
        );
    }

    return (
        <PageContainer padding="0">
            <div style={{ position: 'sticky', top: 0, zIndex: 10, backgroundColor: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)', padding: 'var(--space-4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)' }}>
                <h1 style={{ margin: 0, fontSize: 'var(--text-h2)' }}>Checkout</h1>
                <Button variant="ghost" onClick={clearCart} style={{ color: 'var(--color-danger)' }}>
                    <Trash2 size={18} style={{ marginRight: 8 }}/> Clear Cart
                </Button>
            </div>

            <div style={{ padding: 'var(--space-4)' }}>
                <GlassCard padding="var(--space-4)" style={{ marginBottom: 'var(--space-5)' }}>
                    <p style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-secondary)', margin: '0 0 4px 0', fontWeight: 600, textTransform: 'uppercase' }}>Ordering from</p>
                    <h2 style={{ margin: 0, fontSize: 'var(--text-h2)' }}>{restaurant?.name}</h2>
                </GlassCard>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
                    {cartItems.map((item) => (
                        <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', paddingBottom: 'var(--space-4)', borderBottom: '1px solid var(--color-divider)' }}>
                            {item.image ? (
                                <img src={item.image} alt={item.name} style={{ width: 64, height: 64, borderRadius: '12px', objectFit: 'cover' }} />
                            ) : (
                                <div style={{ width: 64, height: 64, borderRadius: '12px', background: 'var(--color-divider)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>🍽️</div>
                            )}
                            
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <h4 style={{ fontWeight: 700, margin: '0 0 4px 0', fontSize: 'var(--text-body)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</h4>
                                <p style={{ color: 'var(--color-text-secondary)', margin: 0, fontSize: 'var(--text-body)' }}>₹{item.discount_price || item.price}</p>
                            </div>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                                <div style={{ fontWeight: 800, fontSize: 'var(--text-body)' }}>
                                    ₹{((item.discount_price || item.price) * item.quantity).toFixed(2)}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: '100px', padding: '4px 12px' }}>
                                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} style={{ background: 'none', border: 'none', color: 'var(--brand-customer)', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
                                        <Minus size={16} />
                                    </button>
                                    <span style={{ fontWeight: 800, fontSize: 'var(--text-body)', minWidth: 20, textAlign: 'center' }}>{item.quantity}</span>
                                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} style={{ background: 'none', border: 'none', color: 'var(--brand-customer)', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
                                        <Plus size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <FloatingInput
                    label="Special Instructions (optional)"
                    value={specialInstructions}
                    onChange={e => setSpecialInstructions(e.target.value)}
                    placeholder="Extra spicy, no onions, etc."
                />

                <SectionHeader title="Delivery Details" style={{ marginTop: 'var(--space-6)' }} />
                
                <GlassCard padding="var(--space-4)" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    {savedAddresses.length > 0 && (
                        <select
                            onChange={(e) => {
                                const ad = savedAddresses.find(a => a.id === e.target.value);
                                if (ad) handleSelectAddress(ad);
                            }}
                            style={{
                                width: '100%', padding: '12px', borderRadius: '12px',
                                border: '1px solid var(--color-border)', background: 'var(--color-bg-card)',
                                fontSize: 'var(--text-body)', color: 'var(--color-text-primary)',
                                outline: 'none', fontFamily: 'inherit'
                            }}
                            defaultValue=""
                        >
                            <option value="" disabled>Select a saved address...</option>
                            {savedAddresses.map(a => (
                                <option key={a.id} value={a.id}>
                                    {a.label || a.address_type} — {(a.full_address || '').substring(0, 30)}...
                                </option>
                            ))}
                        </select>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                            {resolvingMapAddress ? 'Updating address...' : 'Or set location on map'}
                        </span>
                        <Button 
                            variant="secondary" 
                            size="small" 
                            onClick={fetchCurrentLocation} 
                            disabled={fetchingLocation}
                            icon={fetchingLocation ? Loader : Navigation}
                        >
                            {fetchingLocation ? 'Locating...' : 'Use Current'}
                        </Button>
                    </div>

                    <div style={{ height: 200, borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--color-border)', position: 'relative' }}>
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
                    
                    <textarea
                        value={deliveryAddress}
                        onChange={e => setDeliveryAddress(e.target.value)}
                        placeholder="Enter full delivery address manually..."
                        rows={3}
                        style={{
                            width: '100%', padding: '12px', borderRadius: '12px',
                            border: '1px solid var(--color-border)', background: 'var(--color-bg-card)',
                            fontSize: 'var(--text-body)', color: 'var(--color-text-primary)',
                            outline: 'none', fontFamily: 'inherit', resize: 'none'
                        }}
                    />
                </GlassCard>

                <div style={{ display: 'none' }}>
                    <DeliveryFeeEstimate
                        restaurantId={restaurant?.id}
                        cartValue={subtotal}
                        customerLat={deliveryCoords?.[0]}
                        customerLng={deliveryCoords?.[1]}
                        onEstimateChange={setDeliveryEstimate}
                    />
                </div>

                <SectionHeader title="Bill Summary" style={{ marginTop: 'var(--space-6)' }} />
                
                <GlassCard padding="var(--space-5)">
                    {[['Subtotal', subtotal], ['Tax (5%)', tax], ['Delivery Fee', deliveryFee]].map(([label, value]) => (
                        <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: 'var(--text-body)' }}>
                            <span style={{ color: 'var(--color-text-secondary)' }}>{label}</span>
                            <span style={{ fontWeight: 600 }}>₹{Number(value).toFixed(2)}</span>
                        </div>
                    ))}
                    <div style={{ width: '100%', height: '1px', backgroundColor: 'var(--color-border)', margin: '16px 0' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 800, fontSize: 'var(--text-h3)' }}>Total</span>
                        <span style={{ fontWeight: 800, fontSize: 'var(--text-h3)', color: 'var(--brand-customer)' }}>₹{total.toFixed(2)}</span>
                    </div>
                </GlassCard>

                <SectionHeader title="Payment" style={{ marginTop: 'var(--space-6)' }} />
                
                <SegmentedControl 
                    options={[
                        { label: <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Banknote size={16}/> Cash</div>, value: 'cod' },
                        { label: <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><CreditCard size={16}/> Online</div>, value: 'razorpay' }
                    ]}
                    value={paymentMethod}
                    onChange={setPaymentMethod}
                    brandColor="var(--brand-customer)"
                />

                <div style={{ marginTop: 'var(--space-8)', marginBottom: 'var(--space-6)' }}>
                    <Button 
                        variant="primary" 
                        fullWidth 
                        size="large" 
                        onClick={handlePlaceOrder}
                        disabled={placing || !deliveryAddress.trim()}
                    >
                        {placing ? 'Processing...' : `Place Order — ₹${total.toFixed(2)}`}
                    </Button>
                </div>
            </div>
        </PageContainer>
    );
};

export default CartPage;



