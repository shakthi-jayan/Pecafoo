import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ShoppingBag, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { deliveryAPI } from '../../services/api';
import { useCart } from '../../context/CartContext';

const currency = (value) => `Rs ${Number(value || 0).toFixed(2)}`;

export default function CartDrawer() {
    const navigate = useNavigate();
    const {
        cartItems,
        restaurant,
        subtotal,
        isCartDrawerOpen,
        closeCartDrawer,
        updateQuantity,
        removeFromCart,
    } = useCart();
    const [estimate, setEstimate] = useState(null);
    const [loadingEstimate, setLoadingEstimate] = useState(false);

    useEffect(() => {
        const tokens = JSON.parse(localStorage.getItem('tokens') || '{}');
        const customerCoords = JSON.parse(localStorage.getItem('pecafoo_last_location') || 'null');

        if (!isCartDrawerOpen || !cartItems.length || !restaurant?.id || !tokens.access || !customerCoords?.length) {
            setEstimate(null);
            return;
        }

        const loadEstimate = async () => {
            setLoadingEstimate(true);
            try {
                const { data } = await deliveryAPI.estimateFee({
                    restaurant_id: restaurant.id,
                    customer_lat: customerCoords[0],
                    customer_lng: customerCoords[1],
                    cart_value: subtotal,
                });
                setEstimate(data);
            } catch {
                setEstimate(null);
            } finally {
                setLoadingEstimate(false);
            }
        };

        loadEstimate();
    }, [cartItems.length, isCartDrawerOpen, restaurant?.id, subtotal]);

    const tax = subtotal * 0.05;
    const deliveryFee = Number(estimate?.total_delivery_fee || restaurant?.delivery_fee || 0);
    const grandTotal = subtotal + tax + deliveryFee;
    const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 768;

    const drawerStyle = useMemo(() => (
        isDesktop
            ? {
                position: 'fixed',
                top: 0,
                right: 0,
                width: 'min(100vw, 430px)',
                height: '100dvh',
                borderRadius: '28px 0 0 28px',
              }
            : {
                position: 'fixed',
                left: 0,
                right: 0,
                bottom: 0,
                minHeight: '68vh',
                maxHeight: '92dvh',
                borderRadius: '28px 28px 0 0',
              }
    ), [isDesktop]);

    return (
        <AnimatePresence>
            {isCartDrawerOpen ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(21, 18, 29, 0.48)',
                        zIndex: 160,
                    }}
                    onClick={closeCartDrawer}
                >
                    <motion.div
                        initial={isDesktop ? { x: 460 } : { y: 420 }}
                        animate={isDesktop ? { x: 0 } : { y: 0 }}
                        exit={isDesktop ? { x: 460 } : { y: 420 }}
                        transition={{ type: 'spring', stiffness: 320, damping: 30 }}
                        className="card"
                        style={{
                            ...drawerStyle,
                            marginLeft: 'auto',
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column',
                            padding: 20,
                            zIndex: 161,
                        }}
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                            <div>
                                <h3 style={{ fontWeight: 900, fontSize: '1.25rem' }}>Cart</h3>
                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                    {restaurant?.name || 'Your selected restaurant'}
                                </div>
                            </div>
                            <button className="btn-icon" onClick={closeCartDrawer}>
                                <X size={18} />
                            </button>
                        </div>

                        {cartItems.length ? (
                            <>
                                <div style={{ overflowY: 'auto', flex: 1, display: 'grid', gap: 12, paddingRight: 4, paddingBottom: 8 }}>
                                    {cartItems.map((item) => (
                                        <motion.div
                                            key={item.id}
                                            layout
                                            exit={{ opacity: 0, height: 0 }}
                                            style={{ padding: 14, borderRadius: 18, background: 'var(--bg-elevated)' }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                                                <div style={{ display: 'flex', gap: 12, minWidth: 0 }}>
                                                    {item.image ? (
                                                        <img
                                                            src={item.image}
                                                            alt={item.name}
                                                            style={{ width: 56, height: 56, borderRadius: 16, objectFit: 'cover', flexShrink: 0 }}
                                                            onError={(event) => {
                                                                event.currentTarget.onerror = null;
                                                                event.currentTarget.src = `data:image/svg+xml;utf8,${encodeURIComponent(
                                                                    '<svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 56 56"><rect width="56" height="56" rx="16" fill="#F4E7E1"/><text x="28" y="34" text-anchor="middle" font-size="22">🍽️</text></svg>'
                                                                )}`;
                                                            }}
                                                        />
                                                    ) : (
                                                        <div
                                                            style={{
                                                                width: 56,
                                                                height: 56,
                                                                borderRadius: 16,
                                                                background: '#F4E7E1',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                fontSize: '1.35rem',
                                                                flexShrink: 0,
                                                            }}
                                                        >
                                                            🍽️
                                                        </div>
                                                    )}

                                                    <div style={{ minWidth: 0 }}>
                                                    <div style={{ fontWeight: 800 }}>{item.name}</div>
                                                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginTop: 4 }}>
                                                        {currency(item.discount_price || item.price)} each
                                                    </div>
                                                </div>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <div style={{ fontWeight: 800 }}>
                                                        {currency((item.discount_price || item.price) * item.quantity)}
                                                    </div>
                                                    <button
                                                        onClick={() => removeFromCart(item.id)}
                                                        style={{ marginTop: 6, color: 'var(--danger)', fontSize: '0.78rem', fontWeight: 700 }}
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                            <div style={{ display: 'inline-flex', gap: 10, alignItems: 'center', marginTop: 12, padding: '8px 10px', borderRadius: 14, background: 'white' }}>
                                                <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                                                <span style={{ minWidth: 18, textAlign: 'center', fontWeight: 800 }}>{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>

                                <div style={{ marginTop: 16, padding: 16, borderRadius: 20, background: 'var(--bg-elevated)' }}>
                                    <div style={{ fontWeight: 800, marginBottom: 12 }}>Bill Preview</div>
                                    <BillRow label="Item subtotal" value={subtotal} />
                                    <BillRow label="Estimated delivery fee" value={deliveryFee} loading={loadingEstimate} />
                                    <BillRow label="GST (5%)" value={tax} />
                                    <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', fontWeight: 900 }}>
                                        <span>Grand Total</span>
                                        <span>{currency(grandTotal)}</span>
                                    </div>
                                </div>

                                <button
                                    className="btn btn-primary btn-full btn-lg"
                                    style={{ marginTop: 16 }}
                                    onClick={() => {
                                        closeCartDrawer();
                                        navigate('/cart');
                                    }}
                                >
                                    Proceed to Checkout
                                </button>
                            </>
                        ) : (
                            <div className="empty-state" style={{ flex: 1 }}>
                                <ShoppingBag size={44} style={{ opacity: 0.35 }} />
                                <h3>Your cart is empty</h3>
                                <p>Add something delicious to get started.</p>
                                <button className="btn btn-primary" onClick={closeCartDrawer}>
                                    Browse Restaurants
                                </button>
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            ) : null}
        </AnimatePresence>
    );
}

function BillRow({ label, value, loading = false }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.88rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
            <span style={{ fontWeight: 700 }}>{loading ? '...' : currency(value)}</span>
        </div>
    );
}
