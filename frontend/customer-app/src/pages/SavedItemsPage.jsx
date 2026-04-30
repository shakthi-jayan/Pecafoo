import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    ChevronRight,
    Heart,
    Trash2,
    UtensilsCrossed,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { customersAPI } from '../services/api';
import { getImageProps } from '../utils/imageUtils';

export default function SavedItemsPage() {
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSavedItems();
    }, []);

    const fetchSavedItems = async () => {
        setLoading(true);
        try {
            const { data } = await customersAPI.getFoodWishlist();
            setItems(data?.results || data || []);
        } catch (err) {
            console.error(err);
            setItems([]);
            toast.error('Failed to load saved items');
        } finally {
            setLoading(false);
        }
    };

    const removeSavedItem = async (menuItemId, itemName) => {
        try {
            await customersAPI.toggleFoodWishlist({
                menu_item_id: menuItemId,
            });

            setItems((current) =>
                current.filter((item) => item.menu_item !== menuItemId)
            );

            toast.success(`${itemName} removed from saved items`);
        } catch (err) {
            console.error(err);
            toast.error('Failed to remove item');
        }
    };

    const totalValue = items.reduce(
        (sum, item) =>
            sum + Number(item.item_discount_price || item.item_price || 0),
        0
    );

    return (
        <div className="page" style={{ paddingBottom: 100 }}>
            {/* HEADER */}
            <div className="page-header">
                <button
                    onClick={() => navigate(-1)}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-primary)',
                        cursor: 'pointer',
                    }}
                >
                    <ArrowLeft size={22} />
                </button>

                <h1 className="page-title">Saved Items</h1>

                <Heart size={20} color="var(--accent)" fill="var(--accent)" />
            </div>

            {/* SUMMARY CARD */}
            <div
                className="card"
                style={{
                    marginBottom: 16,
                    padding: 18,
                    background:
                        'linear-gradient(135deg, rgba(255,255,255,0.98), rgba(255,240,252,0.94))',
                    display: 'grid',
                    gap: 14,
                }}
            >
                <div>
                    <p
                        style={{
                            fontSize: '0.78rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.08em',
                            color: 'var(--accent-strong)',
                            fontWeight: 800,
                        }}
                    >
                        Saved For Later
                    </p>

                    <h2
                        style={{
                            fontSize: '1.35rem',
                            lineHeight: 1.1,
                            fontWeight: 800,
                            marginTop: 6,
                        }}
                    >
                        Your favorite dishes in one place
                    </h2>
                </div>

                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                        gap: 10,
                    }}
                >
                    <div
                        style={{
                            padding: 12,
                            borderRadius: 16,
                            background: 'rgba(217, 70, 239, 0.08)',
                        }}
                    >
                        <div
                            style={{
                                fontSize: '0.74rem',
                                color: 'var(--text-secondary)',
                                fontWeight: 700,
                            }}
                        >
                            Items
                        </div>

                        <div
                            style={{
                                marginTop: 4,
                                fontSize: '1.2rem',
                                fontWeight: 800,
                            }}
                        >
                            {items.length}
                        </div>
                    </div>

                    <div
                        style={{
                            padding: 12,
                            borderRadius: 16,
                            background: 'rgba(255, 155, 63, 0.12)',
                        }}
                    >
                        <div
                            style={{
                                fontSize: '0.74rem',
                                color: 'var(--text-secondary)',
                                fontWeight: 700,
                            }}
                        >
                            Approx value
                        </div>

                        <div
                            style={{
                                marginTop: 4,
                                fontSize: '1.2rem',
                                fontWeight: 800,
                            }}
                        >
                            Rs {totalValue.toFixed(0)}
                        </div>
                    </div>
                </div>
            </div>

            {/* LOADING */}
            {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {[1, 2, 3].map((item) => (
                        <div
                            key={item}
                            className="skeleton"
                            style={{ height: 112, borderRadius: 20 }}
                        />
                    ))}
                </div>
            ) : items.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {items.map((item, index) => (
                        <motion.div
                            key={item.id || `${item.menu_item}-${index}`}
                            className="card"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.04 }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 14,
                                padding: 14,
                            }}
                        >
                            {/* IMAGE */}
                            {item.item_image ? (
                                <img
                                    {...getImageProps(item.item_image, 'menu', 72)}
                                    alt={item.item_name || 'Food item'}
                                    style={{
                                        width: 72,
                                        height: 72,
                                        borderRadius: 16,
                                        objectFit: 'cover',
                                        flexShrink: 0,
                                    }}
                                />
                            ) : (
                                <div
                                    style={{
                                        width: 72,
                                        height: 72,
                                        borderRadius: 16,
                                        background: 'var(--bg-elevated)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0,
                                    }}
                                >
                                    <UtensilsCrossed size={24} color="var(--accent-strong)" />
                                </div>
                            )}

                            {/* DETAILS */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ fontWeight: 800, marginBottom: 4 }}>
                                    {item.item_name || 'Saved item'}
                                </p>

                                <p
                                    style={{
                                        fontSize: '0.76rem',
                                        color: 'var(--text-muted)',
                                    }}
                                >
                                    {item.category_name || 'Menu item'}
                                </p>

                                {item.restaurant_name && item.restaurant_slug && (
                                    <button
                                        onClick={() =>
                                            navigate(`/restaurant/${item.restaurant_slug}`)
                                        }
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: 'var(--accent)',
                                            cursor: 'pointer',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: 4,
                                            fontSize: '0.82rem',
                                            fontWeight: 700,
                                        }}
                                    >
                                        {item.restaurant_name}
                                        <ChevronRight size={12} />
                                    </button>
                                )}

                                <p
                                    style={{
                                        fontWeight: 800,
                                        marginTop: 6,
                                        fontSize: '0.94rem',
                                    }}
                                >
                                    Rs{' '}
                                    {Number(
                                        item.item_discount_price || item.item_price || 0
                                    ).toFixed(2)}
                                </p>
                            </div>

                            {/* ACTIONS */}
                            <div style={{ display: 'grid', gap: 8 }}>
                                <button
                                    onClick={() =>
                                        navigate(
                                            item.restaurant_slug
                                                ? `/restaurant/${item.restaurant_slug}`
                                                : '/search'
                                        )
                                    }
                                    className="btn btn-secondary btn-sm"
                                >
                                    Open
                                </button>

                                <button
                                    onClick={() =>
                                        removeSavedItem(item.menu_item, item.item_name)
                                    }
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: '#f43f5e',
                                        padding: 8,
                                    }}
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="empty-state">
                    <UtensilsCrossed size={48} style={{ opacity: 0.5 }} />
                    <h3>No Saved Food Items</h3>
                    <p>Browse menus and tap the heart to save dishes.</p>

                    <button
                        className="btn btn-primary"
                        onClick={() => navigate('/food-products')}
                    >
                        Browse Food
                    </button>
                </div>
            )}
        </div>
    );
}
