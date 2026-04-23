import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, Star, Clock, Heart, Plus, Minus,
    ChevronRight, Search, X, Share2, MessageSquare
} from 'lucide-react';
import { restaurantsAPI, customersAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import toast from 'react-hot-toast';

const RestaurantDetailPage = () => {
    const navigate = useNavigate();
    const { slug } = useParams();
    const { addToCart, cartItems, updateQuantity, restaurant: cartRestaurant, openCartDrawer, isCartDrawerOpen } = useCart();
    const { isAuthenticated } = useAuth();
    const { wishlist, toggleWishlist } = useWishlist();

    const [restaurant, setRestaurant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [foodWishlist, setFoodWishlist] = useState(new Set());

    const fetchRestaurant = useCallback(async () => {
        try {
            const { data } = await restaurantsAPI.getBySlug(slug);
            setRestaurant(data);
            if (data.categories?.length > 0) {
                setActiveCategory(data.categories[0].id);
            }
        } catch (err) {
            console.error('Failed to load restaurant:', err);
            toast.error('Restaurant not found');
            navigate('/');
        } finally {
            setLoading(false);
        }
    }, [slug, navigate]);

    useEffect(() => {
        fetchRestaurant();
    }, [fetchRestaurant]);

    useEffect(() => {
        if (isAuthenticated) {
            customersAPI.getFoodWishlist()
                .then(({ data }) => {
                    const items = data.results || data || [];
                    setFoodWishlist(new Set(items.map((wish) => wish.menu_item)));
                })
                .catch(() => { });
        }
    }, [isAuthenticated]);

    const isWishlisted = wishlist.some((wish) => wish.restaurant === restaurant?.id);

    const handleToggleWishlist = () => {
        if (!isAuthenticated) {
            toast.error('Please login to save favorites');
            return;
        }
        toggleWishlist(restaurant.id);
    };

    const handleToggleFoodWishlist = async (itemId, itemName) => {
        if (!isAuthenticated) {
            toast.error('Please login to save favorites');
            return;
        }
        try {
            const { data } = await customersAPI.toggleFoodWishlist({ menu_item_id: itemId });
            if (data.status === 'added') {
                setFoodWishlist((prev) => new Set([...prev, itemId]));
                toast.success(`${itemName} added to favorites`);
            } else {
                setFoodWishlist((prev) => {
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
        const item = cartItems.find((cartItem) => cartItem.id === itemId);
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
                id: restaurant.id,
                name: restaurant.name,
                slug: restaurant.slug,
                delivery_fee: restaurant.delivery_fee,
            }
        );
    };

    const handleShare = async () => {
        try {
            if (navigator.share) {
                await navigator.share({
                    title: restaurant.name,
                    text: `Check out ${restaurant.name} on Pecafoo!`,
                    url: window.location.href,
                });
            } else {
                navigator.clipboard.writeText(window.location.href);
                toast.success('Link copied to clipboard');
            }
        } catch {
            
        }
    };

    const allItems = restaurant?.categories?.flatMap((category) =>
        (category.items || []).map((item) => ({
            ...item,
            categoryName: category.name,
            categoryId: category.id,
        }))
    ) || [];

    const filteredItems = searchTerm
        ? allItems.filter((item) =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.description?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : activeCategory
            ? allItems.filter((item) => item.categoryId === activeCategory)
            : allItems;

    const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const cartTotal = cartItems.reduce((sum, item) => sum + (item.discount_price || item.price) * item.quantity, 0);

    if (loading) {
        return (
            <div className="page detail-shell">
                <div className="skeleton" style={{ height: 300, borderRadius: '0 0 30px 30px' }} />
                <div style={{ padding: 16 }}>
                    <div className="skeleton" style={{ height: 146, marginTop: -20, marginBottom: 16 }} />
                    <div className="skeleton" style={{ height: 48, marginBottom: 12 }} />
                    {[1, 2, 3].map((item) => (
                        <div key={item} className="skeleton" style={{ height: 152, marginBottom: 12 }} />
                    ))}
                </div>
            </div>
        );
    }

    if (!restaurant) return null;

    return (
        <div className="detail-shell">
            <div className="detail-cover">
                {restaurant.cover_image ? (
                    <img
                        src={restaurant.cover_image}
                        alt={restaurant.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                ) : (
                    <div
                        style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'var(--gradient-primary)',
                            color: 'white',
                            fontSize: '4rem',
                        }}
                    />
                )}

                <div className="detail-toolbar">
                    <button onClick={() => navigate(-1)} className="detail-glass-btn">
                        <ArrowLeft size={20} />
                    </button>
                    <div className="detail-toolbar-group">
                        <button onClick={handleShare} className="detail-glass-btn">
                            <Share2 size={18} />
                        </button>
                        <button onClick={handleToggleWishlist} className="detail-glass-btn">
                            <Heart size={18} color={isWishlisted ? '#ff6ea9' : 'white'} fill={isWishlisted ? '#ff6ea9' : 'transparent'} />
                        </button>
                    </div>
                </div>

                <div className="detail-title-block" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    {restaurant.logo && (
                        <img 
                            src={restaurant.logo} 
                            alt={`${restaurant.name} logo`} 
                            style={{ 
                                width: 64, 
                                height: 64, 
                                borderRadius: '50%', 
                                border: '3px solid white', 
                                objectFit: 'cover', 
                                backgroundColor: 'white',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                            }} 
                        />
                    )}
                    <div>
                        <h1>{restaurant.name}</h1>
                        <p>{restaurant.cuisine_type}</p>
                    </div>
                </div>
            </div>

            <div className="detail-panel">
                <div className="detail-summary">
                    <div className="detail-summary-row">
                        <button
                            onClick={() => navigate(`/restaurant/${slug}/reviews`)}
                            className="rating-pill"
                            style={{ cursor: 'pointer' }}
                        >
                            <Star size={14} fill="currentColor" />
                            {restaurant.average_rating || 'New'} | {restaurant.total_ratings || 0} ratings
                        </button>
                        <span>
                            <Clock size={14} />
                            {restaurant.average_delivery_time || 30} min
                        </span>
                        <span style={{ color: restaurant.is_open ? 'var(--success)' : 'var(--danger)' }}>
                            {restaurant.is_open ? 'Open now' : 'Closed'}
                        </span>
                    </div>

                    <button
                        onClick={() => navigate(`/restaurant/${slug}/reviews`)}
                        className="detail-link-card"
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span className="quick-link-icon" style={{ width: 38, height: 38, marginBottom: 0, background: 'rgba(217, 70, 239, 0.14)', color: 'var(--accent-strong)' }}>
                                <MessageSquare size={18} />
                            </span>
                            <div style={{ textAlign: 'left' }}>
                                <strong>View all reviews</strong>
                                <span>See what customers are saying</span>
                            </div>
                        </div>
                        <ChevronRight size={18} color="var(--text-muted)" />
                    </button>

                    {restaurant.minimum_order_amount > 0 && (
                        <p style={{
                            marginTop: 14,
                            color: 'var(--text-secondary)',
                            fontSize: '0.82rem',
                            fontWeight: 700,
                        }}>
                            Minimum order: Rs {restaurant.minimum_order_amount} | Delivery fee: Rs {restaurant.delivery_fee || 'Free'}
                        </p>
                    )}
                </div>

                <div style={{ marginTop: 16 }}>
                    <AnimatePresence mode="wait">
                        {showSearch ? (
                            <motion.div
                                key="search-input"
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                className="search-bar"
                            >
                                <Search size={16} />
                                <input
                                    placeholder="Search dishes..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    autoFocus
                                />
                                <button onClick={() => { setShowSearch(false); setSearchTerm(''); }} style={{ color: 'var(--text-muted)' }}>
                                    <X size={16} />
                                </button>
                            </motion.div>
                        ) : (
                            <motion.button
                                key="search-btn"
                                onClick={() => setShowSearch(true)}
                                className="detail-search-toggle"
                            >
                                <Search size={16} />
                                Search in menu
                            </motion.button>
                        )}
                    </AnimatePresence>
                </div>

                {!searchTerm && restaurant.categories?.length > 0 && (
                    <div className="menu-chip-row">
                        {restaurant.categories.map((category) => (
                            <button
                                key={category.id}
                                onClick={() => setActiveCategory(category.id)}
                                className={`menu-chip ${activeCategory === category.id ? 'active' : ''}`}
                            >
                                {category.name} ({category.item_count || category.items?.length || 0})
                            </button>
                        ))}
                    </div>
                )}

                <div className="results-stack">
                    {filteredItems.length > 0 ? (
                        filteredItems.map((item, index) => {
                            const qty = getCartQuantity(item.id);
                            const isFoodWishlisted = foodWishlist.has(item.id);
                            const isVeg = item.food_type === 'veg' || item.food_type === 'vegan';

                            return (
                                <motion.div
                                    key={item.id}
                                    className="card menu-card"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.03 }}
                                >
                                    <div className="menu-card-copy">
                                        <div style={{
                                            width: 14,
                                            height: 14,
                                            borderRadius: 3,
                                            border: `2px solid ${isVeg ? '#22c55e' : '#ef476f'}`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginBottom: 6,
                                        }}>
                                            <div style={{
                                                width: 6,
                                                height: 6,
                                                borderRadius: '50%',
                                                background: isVeg ? '#22c55e' : '#ef476f',
                                            }} />
                                        </div>

                                        <h4>
                                            {item.name}
                                            {item.is_bestseller && (
                                                <span className="badge badge-accent">Best</span>
                                            )}
                                        </h4>

                                        <div className="menu-price-row">
                                            <strong>₹{item.discount_price || item.price}</strong>
                                            {item.discount_price && parseFloat(item.discount_price) < parseFloat(item.price) && (
                                                <span>₹{item.price}</span>
                                            )}
                                        </div>

                                        {item.description && (
                                            <p>
                                                {item.description}
                                            </p>
                                        )}

                                        <button
                                            onClick={() => handleToggleFoodWishlist(item.id, item.name)}
                                            style={{
                                                marginTop: 8,
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: 4,
                                                color: isFoodWishlisted ? '#f43f5e' : 'var(--text-muted)',
                                                fontSize: '0.75rem',
                                                fontWeight: 700,
                                            }}
                                        >
                                            <Heart
                                                size={12}
                                                fill={isFoodWishlisted ? '#f43f5e' : 'transparent'}
                                                color={isFoodWishlisted ? '#f43f5e' : 'var(--text-muted)'}
                                            />
                                            {isFoodWishlisted ? 'Saved' : 'Save'}
                                        </button>
                                    </div>

                                    <div className="menu-card-side">
                                        <div className="menu-item-image-frame">
                                            {item.image ? (
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <div style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '1.5rem',
                                                }}
                                            />
                                            )}
                                        </div>

                                        {!item.is_available ? (
                                            <span className="badge badge-danger">Sold Out</span>
                                        ) : qty === 0 ? (
                                            <button
                                                onClick={() => handleAddToCart(item)}
                                                className="menu-action-btn"
                                            >
                                                ADD
                                            </button>
                                        ) : (
                                            <div className="menu-stepper">
                                                <button onClick={() => updateQuantity(item.id, qty - 1)}>
                                                    <Minus size={14} />
                                                </button>
                                                <span style={{ minWidth: 16, textAlign: 'center', fontWeight: 800 }}>
                                                    {qty}
                                                </span>
                                                <button onClick={() => handleAddToCart(item)}>
                                                    <Plus size={14} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })
                    ) : (
                        <div className="empty-state" style={{ paddingInline: 0 }}>
                            <Search size={36} style={{ opacity: 0.55 }} />
                            <h3>{searchTerm ? 'No matching dishes' : 'No items available'}</h3>
                        </div>
                    )}
                </div>
            </div>

            <AnimatePresence>
                {cartCount > 0 && !isCartDrawerOpen && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        onClick={openCartDrawer}
                        className="sticky-cart"
                    >
                        <div>
                            <div style={{ fontWeight: 800, fontSize: '0.96rem' }}>
                                {cartCount} item{cartCount !== 1 ? 's' : ''}
                            </div>
                            <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.88)' }}>
                                ₹{cartTotal.toFixed(2)}
                            </div>
                        </div>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 800 }}>
                            <span style={{ overflowWrap: 'anywhere' }}>
                                {cartRestaurant?.id === restaurant.id ? 'View Cart' : `Cart from ${cartRestaurant?.name || 'another restaurant'}`}
                            </span>
                            <ChevronRight size={18} style={{ flexShrink: 0 }} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default RestaurantDetailPage;
