import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, Search, Heart, Plus, Minus,
    ChevronRight, X, SlidersHorizontal
} from 'lucide-react';
import { restaurantsAPI, customersAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { getImageProps } from '../utils/imageUtils'; // ✅ IMPORTANT

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
        } catch {
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
            } else {
                setFoodWishlist(prev => {
                    const next = new Set(prev);
                    next.delete(itemId);
                    return next;
                });
            }
        } catch {
            toast.error('Failed to update wishlist');
        }
    };

    const getCartQuantity = (itemId) => {
        return cartItems.find(i => i.id === itemId)?.quantity || 0;
    };

    const handleAddToCart = (item) => {
        addToCart(
            {
                id: item.id,
                name: item.name,
                price: parseFloat(item.price),
                discount_price: item.discount_price ? parseFloat(item.discount_price) : null,
                image: item.image,
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
            
            {/* HEADER */}
            <div className="page-header">
                <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none' }}>
                    <ArrowLeft size={22} />
                </button>
                <h1 className="page-title">Browse Food</h1>
                <button onClick={() => setShowFilters(!showFilters)}>
                    <SlidersHorizontal size={20} />
                </button>
            </div>

            {/* SEARCH */}
            <div className="search-bar">
                <Search size={18} />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." />
                {search && <button onClick={() => setSearch('')}><X size={16} /></button>}
            </div>

            {/* ITEMS */}
            {loading ? (
                <div className="grid grid-cols-2 gap-3">
                    {[1,2,3,4].map(i => <div key={i} className="skeleton h-60" />)}
                </div>
            ) : items.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                    {items.map((item, index) => {
                        const qty = getCartQuantity(item.id);
                        const isWishlisted = foodWishlist.has(item.id);

                        return (
                            <motion.div key={item.id} className="card" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                
                                {/* ✅ FIXED IMAGE */}
                                <div style={{ height: 130, overflow: 'hidden' }}>
                                    <img
                                        {...getImageProps(item.image, 'menu', 300)}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                </div>

                                {/* CONTENT */}
                                <div style={{ padding: 10 }}>
                                    <h4>{item.name}</h4>

                                    <div onClick={() => navigate(`/restaurant/${item.restaurant_slug}`)}>
                                        {item.restaurant_name}
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span>₹{item.discount_price || item.price}</span>

                                        {qty === 0 ? (
                                            <button onClick={() => handleAddToCart(item)}>ADD</button>
                                        ) : (
                                            <div>
                                                <button onClick={() => updateQuantity(item.id, qty - 1)}>-</button>
                                                {qty}
                                                <button onClick={() => handleAddToCart(item)}>+</button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            ) : (
                <div>No items found</div>
            )}
        </div>
    );
};

export default FoodProductsPage;
