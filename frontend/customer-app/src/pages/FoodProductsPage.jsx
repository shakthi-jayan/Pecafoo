import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, Search, SlidersHorizontal, X, Clock, ChevronRight
} from 'lucide-react';
import { restaurantsAPI, customersAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

import {
    PageContainer,
    IconButton,
    SearchBar,
    Button,
    FoodCard,
    EmptyState,
    GlassCard
} from '../../../shared-ui/index';

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

    const buildMediaUrl = (value) => {
        if (!value || typeof value !== 'string') return '';
        if (/^(https?:|data:|blob:)/i.test(value)) return value;
        const apiBase = import.meta.env.VITE_API_BASE_URL || 'https://api.pecafoo.com/api';
        const mediaBase = apiBase.replace(/\/api\/?$/, '');
        return `${mediaBase}${value.startsWith('/') ? value : `/${value}`}`;
    };

    return (
        <PageContainer padding="0">
            <div style={{ position: 'sticky', top: 0, zIndex: 10, backgroundColor: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)', padding: 'var(--space-4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <IconButton icon={ArrowLeft} onClick={() => navigate(-1)} />
                    <h1 style={{ margin: 0, fontSize: 'var(--text-h3)' }}>Browse Food</h1>
                </div>
                <IconButton 
                    icon={SlidersHorizontal} 
                    variant={showFilters ? 'primary' : 'ghost'} 
                    onClick={() => setShowFilters(!showFilters)} 
                />
            </div>

            <div style={{ padding: 'var(--space-4)', paddingBottom: '120px' }}>
                <div style={{ marginBottom: 'var(--space-4)' }}>
                    <SearchBar 
                        placeholder="Search food items..." 
                        value={search} 
                        onChange={e => setSearch(e.target.value)} 
                    />
                </div>

                <div style={{ display: 'flex', gap: 'var(--space-2)', overflowX: 'auto', marginBottom: 'var(--space-4)', scrollbarWidth: 'none' }}>
                    <style>{`div::-webkit-scrollbar { display: none; }`}</style>
                    {foodTypeFilters.map(f => (
                        <button
                            key={f.value}
                            onClick={() => setFoodType(f.value)}
                            style={{
                                padding: '8px 16px', borderRadius: '100px',
                                background: foodType === f.value ? 'var(--brand-customer)' : 'var(--color-bg-base)',
                                color: foodType === f.value ? 'white' : 'var(--color-text-secondary)',
                                border: `1px solid ${foodType === f.value ? 'var(--brand-customer)' : 'var(--color-border)'}`,
                                fontSize: '12px', fontWeight: 700, whiteSpace: 'nowrap',
                                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                                transition: 'all 0.2s', flexShrink: 0
                            }}
                        >
                            <span>{f.icon}</span> {f.label}
                        </button>
                    ))}
                </div>

                {platformCategories.length > 0 && (
                    <div style={{ display: 'flex', gap: 'var(--space-2)', overflowX: 'auto', marginBottom: 'var(--space-4)', scrollbarWidth: 'none' }}>
                        {platformCategories.slice(0, 12).map((category) => {
                            const isActive = search.trim().toLowerCase() === String(category.name || '').trim().toLowerCase();
                            return (
                                <button
                                    key={category.name}
                                    onClick={() => setSearch(category.name)}
                                    style={{
                                        padding: '6px 14px',
                                        borderRadius: '100px',
                                        background: isActive ? 'rgba(217, 70, 239, 0.1)' : 'var(--color-bg-card)',
                                        color: isActive ? 'var(--brand-customer)' : 'var(--color-text-secondary)',
                                        border: `1px solid ${isActive ? 'var(--brand-customer)' : 'var(--color-border)'}`,
                                        fontSize: '11px',
                                        fontWeight: 700,
                                        whiteSpace: 'nowrap',
                                        cursor: 'pointer',
                                        flexShrink: 0
                                    }}
                                >
                                    {category.name}
                                </button>
                            );
                        })}
                    </div>
                )}

                <AnimatePresence>
                    {showFilters && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            style={{ overflow: 'hidden', marginBottom: 'var(--space-4)' }}
                        >
                            <GlassCard padding="var(--space-4)">
                                <p style={{ fontWeight: 800, margin: '0 0 var(--space-3) 0', fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-text-tertiary)' }}>Sort By</p>
                                <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                                    {sortOptions.map(s => (
                                        <button
                                            key={s.value}
                                            onClick={() => setSort(s.value)}
                                            style={{
                                                padding: '8px 16px', borderRadius: '8px',
                                                background: sort === s.value ? 'var(--brand-customer)' : 'var(--color-bg-base)',
                                                color: sort === s.value ? 'white' : 'var(--color-text-secondary)',
                                                border: '1px solid var(--color-border)', fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                                            }}
                                        >
                                            {s.label}
                                        </button>
                                    ))}
                                </div>
                            </GlassCard>
                        </motion.div>
                    )}
                </AnimatePresence>

                {!loading && (
                    <p style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>
                        {items.length} items found
                    </p>
                )}

                {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} style={{ height: 160, backgroundColor: 'var(--color-divider)', borderRadius: 'var(--radius-card)' }} />
                        ))}
                    </div>
                ) : items.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                        {items.map((item, index) => {
                            const qty = getCartQuantity(item.id);
                            const isWishlisted = foodWishlist.has(item.id);
                            return (
                                <motion.div key={item.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }}>
                                    <FoodCard
                                        name={item.name}
                                        description={`${item.restaurant_name} • ${item.category_name || ''}`}
                                        image={buildMediaUrl(item.image)}
                                        price={item.price}
                                        discountPrice={item.discount_price}
                                        isVeg={item.food_type === 'veg' || item.food_type === 'vegan'}
                                        isBestseller={item.is_bestseller}
                                        isAvailable={true}
                                        quantity={qty}
                                        onAdd={() => handleAddToCart(item)}
                                        onIncrement={() => handleAddToCart(item)}
                                        onDecrement={() => updateQuantity(item.id, qty - 1)}
                                        onWishlist={() => toggleFoodWishlist(item.id, item.name)}
                                        isWishlisted={isWishlisted}
                                    />
                                </motion.div>
                            );
                        })}
                    </div>
                ) : (
                    <div style={{ marginTop: 'var(--space-8)' }}>
                        <EmptyState
                            icon={Search}
                            title="No food items found"
                            description="Try a different search or filter"
                            action={<Button onClick={() => { setSearch(''); setFoodType(''); setShowFilters(false); }}>Clear Filters</Button>}
                        />
                    </div>
                )}
            </div>
        </PageContainer>
    );
};

export default FoodProductsPage;

