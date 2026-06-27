import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ChevronRight, Heart, Trash2, UtensilsCrossed } from 'lucide-react';
import toast from 'react-hot-toast';
import { customersAPI } from '../services/api';

const buildMediaUrl = (value) => {
    if (!value || typeof value !== 'string') return '';
    if (/^(https?:|data:|blob:)/i.test(value)) return value;
    const apiBase = import.meta.env.VITE_API_BASE_URL || 'https://api.pecafoo.com/api';
    const mediaBase = apiBase.replace(/\/api\/?$/, '');
    return `${mediaBase}${value.startsWith('/') ? value : `/${value}`}`;
};

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
            setItems(data.results || data || []);
        } catch {
            setItems([]);
            toast.error('Failed to load saved items');
        } finally {
            setLoading(false);
        }
    };

    const removeSavedItem = async (menuItemId, itemName) => {
        try {
            await customersAPI.toggleFoodWishlist({ menu_item_id: menuItemId });
            setItems((current) => current.filter((item) => item.menu_item !== menuItemId));
            toast.success(`${itemName} removed from saved items`);
        } catch {
            toast.error('Failed to remove item');
        }
    };

    const totalValue = items.reduce(
        (sum, item) => sum + Number(item.item_discount_price || item.item_price || 0),
        0,
    );

    return (
        <div className="page" style={{ paddingBottom: 100 }}>
            <div className="page-header">
                <button
                    onClick={() => navigate(-1)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}
                >
                    <ArrowLeft size={22} />
                </button>
                <h1 className="page-title">Saved Items</h1>
                <Heart size={20} color="var(--accent)" fill="var(--accent)" />
            </div>

            <div
                className="card"
                style={{
                    marginBottom: 16,
                    padding: 18,
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.98), rgba(255,240,252,0.94))',
                    display: 'grid',
                    gap: 14,
                }}
            >
                <div>
                    <p style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent-strong)', fontWeight: 800 }}>
                        Saved For Later
                    </p>
                    <h2 style={{ fontSize: '1.35rem', lineHeight: 1.1, fontWeight: 800, marginTop: 6 }}>
                        Your favorite dishes in one place
                    </h2>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
                    <div style={{ padding: 12, borderRadius: 16, background: 'rgba(217, 70, 239, 0.08)' }}>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontWeight: 700 }}>Items</div>
                        <div style={{ marginTop: 4, fontSize: '1.2rem', fontWeight: 800 }}>{items.length}</div>
                    </div>
                    <div style={{ padding: 12, borderRadius: 16, background: 'rgba(255, 155, 63, 0.12)' }}>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontWeight: 700 }}>Approx value</div>
                        <div style={{ marginTop: 4, fontSize: '1.2rem', fontWeight: 800 }}>Rs {totalValue.toFixed(0)}</div>
                    </div>
                </div>
            </div>

            {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {[1, 2, 3].map((item) => (
                        <div key={item} className="skeleton" style={{ height: 112, borderRadius: 20 }} />
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
                            style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 14 }}
                        >
                            {item.item_image ? (
                                <img
                                    src={buildMediaUrl(item.item_image)}
                                    alt={item.item_name}
                                    style={{
                                        width: 72,
                                        height: 72,
                                        borderRadius: 16,
                                        objectFit: 'cover',
                                        flexShrink: 0,
                                    }}
                                    onError={(event) => {
                                        event.currentTarget.onerror = null;
                                        event.currentTarget.src = `data:image/svg+xml;utf8,${encodeURIComponent(
                                            '<svg xmlns="http://www.w3.org/2000/svg" width="72" height="72" viewBox="0 0 72 72"><rect width="72" height="72" rx="16" fill="#F4E7E1"/><text x="36" y="43" text-anchor="middle" font-size="26">Food</text></svg>'
                                        )}`;
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
                                        fontSize: '1.4rem',
                                        flexShrink: 0,
                                    }}
                                >
                                    <UtensilsCrossed size={24} color="var(--accent-strong)" />
                                </div>
                            )}

                            <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ fontWeight: 800, marginBottom: 4, lineHeight: 1.25 }}>
                                    {item.item_name || 'Saved item'}
                                </p>
                                <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                                    {item.category_name || 'Menu item'}
                                </p>
                                {item.restaurant_name && item.restaurant_slug ? (
                                    <button
                                        onClick={() => navigate(`/restaurant/${item.restaurant_slug}`)}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            padding: 0,
                                            color: 'var(--accent)',
                                            cursor: 'pointer',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: 4,
                                            fontSize: '0.82rem',
                                            fontWeight: 700,
                                            textAlign: 'left',
                                        }}
                                    >
                                        {item.restaurant_name}
                                        <ChevronRight size={12} />
                                    </button>
                                ) : null}
                                <p style={{ fontWeight: 800, marginTop: 6, fontSize: '0.94rem' }}>
                                    Rs {Number(item.item_discount_price || item.item_price || 0).toFixed(2)}
                                </p>
                            </div>

                            <div style={{ display: 'grid', gap: 8, flexShrink: 0 }}>
                                <button
                                    onClick={() => navigate(item.restaurant_slug ? `/restaurant/${item.restaurant_slug}` : '/search')}
                                    className="btn btn-secondary btn-sm"
                                    style={{ minHeight: 36, paddingInline: 12 }}
                                >
                                    Open
                                </button>
                                <button
                                    onClick={() => removeSavedItem(item.menu_item, item.item_name)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: '#f43f5e',
                                        padding: 8,
                                        justifySelf: 'center',
                                    }}
                                    aria-label={`Remove ${item.item_name} from saved items`}
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="empty-state">
                    <UtensilsCrossed size={48} style={{ opacity: 0.5, color: 'var(--accent)' }} />
                    <h3>No Saved Food Items</h3>
                    <p>Browse menus and tap the heart on dishes you want to save.</p>
                    <button
                        className="btn btn-primary"
                        onClick={() => navigate('/food-products')}
                        style={{ marginTop: 12 }}
                    >
                        Browse Food
                    </button>
                </div>
            )}
        </div>
    );
}
