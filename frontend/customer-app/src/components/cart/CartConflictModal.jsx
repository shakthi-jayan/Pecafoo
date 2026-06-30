import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export default function CartConflictModal() {
    const { conflictPending, activeRestaurantName, itemCount, confirmReplaceCart, cancelConflict } = useCart();

    return (
        <AnimatePresence>
            {conflictPending ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(17, 12, 26, 0.52)',
                        zIndex: 60,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 20,
                    }}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.96 }}
                        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                        className="card"
                        style={{ width: 'min(100%, 430px)', padding: 24, borderRadius: 24 }}
                    >
                        <div style={{
                            width: 52,
                            height: 52,
                            borderRadius: 18,
                            background: 'rgba(255, 90, 31, 0.12)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: 16,
                        }}>
                            <AlertTriangle size={24} color="var(--accent)" />
                        </div>
                        <h3 style={{ fontWeight: 900, fontSize: '1.25rem', marginBottom: 10 }}>
                            Start a new cart?
                        </h3>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 16 }}>
                            Your cart has items from <strong>{activeRestaurantName}</strong>. Adding items from <strong>{conflictPending.restaurantName}</strong> will clear your current cart.
                        </p>
                        <div style={{ display: 'grid', gap: 10, marginBottom: 18 }}>
                            <PreviewCard title="Current cart" subtitle={`${activeRestaurantName} (${itemCount} items)`} />
                            <PreviewCard title="New restaurant" subtitle={conflictPending.restaurantName} />
                        </div>
                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={cancelConflict}>
                                No, keep current cart
                            </button>
                            <button
                                className="btn btn-primary"
                                style={{ flex: 1 }}
                                onClick={() => {
                                    confirmReplaceCart();
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                            >
                                Yes, start fresh
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            ) : null}
        </AnimatePresence>
    );
}

function PreviewCard({ title, subtitle }) {
    return (
        <div style={{ padding: 14, borderRadius: 16, background: 'var(--bg-elevated)' }}>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: 4 }}>{title}</div>
            <div style={{ fontWeight: 800 }}>{subtitle}</div>
        </div>
    );
}
