
import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, Search, Filter, Heart, Plus, Minus, Star,
    Leaf, Drumstick, Clock, ChevronRight, X, SlidersHorizontal
} from 'lucide-react';
import { restaurantsAPI, customersAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const foodTypeFilters = [
    { value: '', label: 'All', icon: '🍽️' },
    { value: 'veg', label: 'Veg', icon: '🥬' },
    { value: 'non_veg', label: 'Non-Veg', icon: '🍗' },
    { value: 'vegan', label: 'Vegan', icon: '🌱' },
];

const sortOptions = [
    { value: 'bestseller', label: 'Popular' },
    { value: 'price_low', label: 'Price: Low → High' },
    { value: 'price_high', label: 'Price: High → Low' },
];

const FoodProductsPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { addToCart, cartItems, updateQuantity } = useCart();
    const { isAuthenticated } = useAuth();

    const [items, setItems] = useState([]);
    const [platformCategories, setPlatformCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState(searchParams.get('q') || '');
    const [foodType, setFoodType] = useState('');
    const [sort, setSort] = useState('bestseller');
    const [showFilters, setShowFilters] = useState(false);
    const [foodWishlist, setFoodWishlist] = useState(new Set());

    const fetchItems = useCallback(async () => {
        setLoading(true);
        try {
            const params = { sort };
            if (search.trim()) params.search = search.trim();
            if (foodType) params.food_type = foodType;

            const { data } = await restaurantsAPI.getFoodItems(params);
            setItems(data.results || data || []);
        } catch (err) {
            console.error('Failed to fetch food items:', err);
            setItems([]);
        } finally {
            setLoading(false);
        }
    }, [search, foodType, sort]);

    useEffect(() => {
        const debounce = setTimeout(() => fetchItems(), 300);
        return () => clearTimeout(debounce);
    }, [fetchItems]);

    useEffect(() => {
        restaurantsAPI.getPlatformCategories()
            .then(({ data }) => setPlatformCategories(data || []))
            .catch(() => setPlatformCategories([]));
    }, []);

    
    useEffect(() => {
        if (isAuthenticated) {
            customersAPI.getFoodWishlist()
                .then(({ data }) => {
                    const items = data.results || data || [];
                    setFoodWishlist(new Set(items.map(w => w.menu_item)));
                })
                .catch(() => { });
        }
    }, [isAuthenticated]);

    const toggleFoodWishlist = async (itemId, itemName) => {
        if (!isAuthenticated) {
            toast.error('Please login to save favorites');
            return;
        }
        try {
            const { data } = await customersAPI.toggleFoodWishlist({ menu_item_id: itemId });
            if (data.status === 'added') {
                setFoodWishlist(prev => new Set([...prev, itemId]));
                toast.success(`${itemName} added to wishlist! 💖`);
            } else {
                setFoodWishlist(prev => {
                    const next = new Set(prev);
                    next.delete(itemId);
                    return next;
                });
                toast.success(`${itemName} removed from wishlist`);
            }
        } catch {
            toast.error('Failed to update wishlist');
        }
    };

    const getCartQuantity = (itemId) => {
        const item = cartItems.find(i => i.id === itemId);
        return item?.quantity || 0;
    };

    const handleAddToCart = (item) => {
        addToCart(
            {
                id: item.id,
                name: item.name,
                price: parseFloat(item.price),
                discount_price: item.discount_price ? parseFloat(item.discount_price) : null,
                image: item.image,
                food_type: item.food_type,
            },
            {
                id: item.restaurant_id,
                name: item.restaurant_name,
                slug: item.restaurant_slug,
            }
        );
    };

    return (
        <div className="page" style={{ paddingBottom: 100 }}>
            {}
            <div className="page-header" style={{ marginBottom: 'var(--space-sm)' }}>
                <button
                    onClick={() => navigate(-1)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}
                >
                    <ArrowLeft size={22} />
                </button>
                <h1 className="page-title">Browse Food</h1>
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    style={{
                        background: showFilters ? 'var(--accent)' : 'none',
                        border: 'none', color: showFilters ? 'white' : 'var(--text-primary)',
                        cursor: 'pointer', padding: 6, borderRadius: 8,
                    }}
                >
                    <SlidersHorizontal size={20} />
                </button>
            </div>

            {}
            <div className="search-bar" style={{ marginBottom: 'var(--space-md)' }}>
                <Search size={18} />
                <input
                    placeholder="Search food items..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    id="food-search"
                />
                {search && (
                    <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                        <X size={16} />
                    </button>
                )}
            </div>

            {}
            <div style={{
                display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 'var(--space-md)',
                scrollbarWidth: 'none', paddingBottom: 4,
            }}>
                {foodTypeFilters.map(f => (
                    <button
                        key={f.value}
                        onClick={() => setFoodType(f.value)}
                        style={{
                            padding: '8px 16px', borderRadius: 'var(--radius-full)',
                            background: foodType === f.value ? 'var(--accent)' : 'var(--bg-card)',
                            color: foodType === f.value ? 'white' : 'var(--text-secondary)',
                            border: `1px solid ${foodType === f.value ? 'var(--accent)' : 'var(--border)'}`,
                            fontSize: '0.85rem', fontWeight: 500, whiteSpace: 'nowrap',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                            transition: 'all 0.2s',
                        }}
                    >
                        <span>{f.icon}</span> {f.label}
                    </button>
                ))}
            </div>

            {platformCategories.length > 0 && (
                <div style={{
                    display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 'var(--space-md)',
                    scrollbarWidth: 'none', paddingBottom: 4,
                }}>
                    {platformCategories.slice(0, 12).map((category) => {
                        const isActive = search.trim().toLowerCase() === String(category.name || '').trim().toLowerCase();
                        return (
                            <button
                                key={category.name}
                                onClick={() => setSearch(category.name)}
                                style={{
                                    padding: '8px 14px',
                                    borderRadius: 'var(--radius-full)',
                                    background: isActive ? 'var(--gradient-primary)' : 'var(--bg-card)',
                                    color: isActive ? 'white' : 'var(--text-secondary)',
                                    border: `1px solid ${isActive ? 'transparent' : 'var(--border)'}`,
                                    fontSize: '0.8rem',
                                    fontWeight: 700,
                                    whiteSpace: 'nowrap',
                                    cursor: 'pointer',
                                    boxShadow: isActive ? 'var(--shadow-accent)' : 'none',
                                }}
                            >
                                {category.name}
                            </button>
                        );
                    })}
                </div>
            )}

            {}
            <AnimatePresence>
                {showFilters && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        style={{ overflow: 'hidden', marginBottom: 'var(--space-md)' }}
                    >
                        <div style={{
                            background: 'var(--bg-card)', padding: 'var(--space-md)',
                            borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)',
                        }}>
                            <p style={{ fontWeight: 600, marginBottom: 8, fontSize: '0.85rem' }}>Sort By</p>
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                {sortOptions.map(s => (
                                    <button
                                        key={s.value}
                                        onClick={() => setSort(s.value)}
                                        style={{
                                            padding: '6px 14px', borderRadius: 8,
                                            background: sort === s.value ? 'var(--accent)' : 'var(--bg-elevated)',
                                            color: sort === s.value ? 'white' : 'var(--text-secondary)',
                                            border: 'none', fontSize: '0.8rem', cursor: 'pointer',
                                        }}
                                    >
                                        {s.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {}
            {!loading && (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 'var(--space-md)' }}>
                    {items.length} items found
                </p>
            )}

            {}
            {loading ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="skeleton" style={{ height: 240, borderRadius: 16 }} />
                    ))}
                </div>
            ) : items.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    {items.map((item, index) => {
                        const qty = getCartQuantity(item.id);
                        const isWishlisted = foodWishlist.has(item.id);
                        return (
                            <motion.div
                                key={item.id}
                                className="card"
                                style={{ padding: 0, overflow: 'hidden', position: 'relative' }}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.03 }}
                            >
                                {}
                                <div style={{ position: 'relative', height: 130, overflow: 'hidden' }}>
                                    {item.image ? (
                                        <img
                                            src={item.image} alt={item.name}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div style={{
                                            width: '100%', height: '100%',
                                            background: 'linear-gradient(135deg, var(--bg-elevated) 0%, var(--bg-card) 100%)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '2rem',
                                        }}>
                                            🍽️
                                        </div>
                                    )}

                                    {}
                                    <button
                                        onClick={(e) => { e.stopPropagation(); toggleFoodWishlist(item.id, item.name); }}
                                        style={{
                                            position: 'absolute', top: 8, right: 8,
                                            background: 'rgba(0,0,0,0.5)', border: 'none',
                                            borderRadius: '50%', width: 28, height: 28,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        <Heart
                                            size={14}
                                            color={isWishlisted ? '#f43f5e' : 'white'}
                                            fill={isWishlisted ? '#f43f5e' : 'transparent'}
                                        />
                                    </button>

                                    {}
                                    <div style={{
                                        position: 'absolute', top: 8, left: 8,
                                        width: 16, height: 16, borderRadius: 3,
                                        border: `2px solid ${item.food_type === 'veg' || item.food_type === 'vegan' ? '#22c55e' : '#ef4444'}`,
                                        background: 'rgba(0,0,0,0.5)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        <div style={{
                                            width: 8, height: 8, borderRadius: '50%',
                                            background: item.food_type === 'veg' || item.food_type === 'vegan' ? '#22c55e' : '#ef4444',
                                        }} />
                                    </div>

                                    {item.is_bestseller && (
                                        <span style={{
                                            position: 'absolute', bottom: 8, left: 8,
                                            background: 'var(--accent)', color: 'white',
                                            fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px',
                                            borderRadius: 4,
                                        }}>
                                            ⭐ Bestseller
                                        </span>
                                    )}
                                </div>

                                {}
                                <div style={{ padding: '10px 12px' }}>
                                    <h4 style={{
                                        fontWeight: 600, fontSize: '0.85rem', marginBottom: 2,
                                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                    }}>
                                        {item.name}
                                    </h4>

                                    <div
                                        onClick={() => navigate(`/restaurant/${item.restaurant_slug}`)}
                                        style={{
                                            fontSize: '0.7rem', color: 'var(--accent)', marginBottom: 6,
                                            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                                        }}
                                    >
                                        {item.restaurant_name}
                                        <ChevronRight size={10} />
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div>
                                            {item.category_name && (
                                                <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                                                    {item.category_name}
                                                </p>
                                            )}
                                            <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                                                ₹{item.discount_price || item.price}
                                            </span>
                                            {item.discount_price && parseFloat(item.discount_price) < parseFloat(item.price) && (
                                                <span style={{
                                                    textDecoration: 'line-through', color: 'var(--text-muted)',
                                                    fontSize: '0.75rem', marginLeft: 4,
                                                }}>
                                                    ₹{item.price}
                                                </span>
                                            )}
                                        </div>

                                        {}
                                        {qty === 0 ? (
                                            <button
                                                onClick={() => handleAddToCart(item)}
                                                style={{
                                                    background: 'var(--accent)', color: 'white', border: 'none',
                                                    borderRadius: 6, padding: '4px 12px', fontSize: '0.75rem',
                                                    fontWeight: 700, cursor: 'pointer',
                                                }}
                                            >
                                                ADD
                                            </button>
                                        ) : (
                                            <div style={{
                                                display: 'flex', alignItems: 'center', gap: 6,
                                                background: 'var(--accent)', borderRadius: 6, padding: '2px 6px',
                                            }}>
                                                <button
                                                    onClick={() => updateQuantity(item.id, qty - 1)}
                                                    style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: 2 }}
                                                >
                                                    <Minus size={12} />
                                                </button>
                                                <span style={{ color: 'white', fontWeight: 700, fontSize: '0.8rem', minWidth: 14, textAlign: 'center' }}>
                                                    {qty}
                                                </span>
                                                <button
                                                    onClick={() => handleAddToCart(item)}
                                                    style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: 2 }}
                                                >
                                                    <Plus size={12} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            ) : (
                <div className="empty-state" style={{ marginTop: 'var(--space-2xl)' }}>
                    <Search size={40} style={{ opacity: 0.5 }} />
                    <h3>No food items found</h3>
                    <p>Try a different search or filter</p>
                </div>
            )}
        </div>
    );
};

export default FoodProductsPage;
