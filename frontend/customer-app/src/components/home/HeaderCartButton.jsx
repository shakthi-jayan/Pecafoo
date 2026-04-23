import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export default function HeaderCartButton() {
    const { itemCount, openCartDrawer } = useCart();
    const [animateBadge, setAnimateBadge] = useState(false);

    useEffect(() => {
        if (itemCount < 1) return;
        setAnimateBadge(true);
        const timer = window.setTimeout(() => setAnimateBadge(false), 500);
        return () => window.clearTimeout(timer);
    }, [itemCount]);

    return (
        <button className="btn-icon" onClick={openCartDrawer} style={{ position: 'relative' }} aria-label="Open cart">
            <ShoppingCart size={20} />
            {itemCount > 0 ? (
                <motion.span
                    animate={animateBadge ? { scale: [1, 1.4, 1] } : { scale: 1 }}
                    transition={{ duration: 0.35 }}
                    style={{
                        position: 'absolute',
                        top: -6,
                        right: -6,
                        minWidth: 20,
                        height: 20,
                        borderRadius: 999,
                        background: '#FF5A1F',
                        color: 'white',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        paddingInline: 6,
                        boxShadow: '0 10px 18px rgba(255, 90, 31, 0.28)',
                    }}
                >
                    {itemCount}
                </motion.span>
            ) : null}
        </button>
    );
}
