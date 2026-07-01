import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, Star, Clock, Heart, Search, X, Share2, MessageSquare, AlertCircle
} from 'lucide-react';
import { restaurantsAPI, customersAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import toast from 'react-hot-toast';

import {
    PageContainer,
    Button,
    IconButton,
    FoodCard,
    SearchBar,
    Chip,
    HorizontalScroller,
    EmptyState,
    GlassCard,
    Skeleton
} from '../shared-ui/PremiumUI';

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
            <PageContainer padding="0">
                <Skeleton width="100%" height={300} borderRadius="0" />
                <div style={{ padding: 'var(--space-4)' }}>
                    <div style={{ height: 120, backgroundColor: 'var(--color-bg-card)', borderRadius: 'var(--radius-card)', marginTop: -40, marginBottom: 'var(--space-4)', position: 'relative', zIndex: 2 }} />
                    <Skeleton width="100%" height={60} borderRadius="100px" style={{ marginBottom: 'var(--space-5)' }} />
                    {[1, 2, 3].map(i => <Skeleton key={i} width="100%" height={140} borderRadius="var(--radius-card)" style={{ marginBottom: 'var(--space-4)' }} />)}
                </div>
            </PageContainer>
        );
    }

    if (!restaurant) return null;

    return (
        <PageContainer padding="0">
            {/* Header / Cover */}
            <div style={{ position: 'relative', height: '280px', backgroundColor: 'var(--color-divider)' }}>
                {restaurant.cover_image && (
                    <img
                        src={restaurant.cover_image}
                        alt={restaurant.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                )}
                {/* Overlay gradient */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(rgba(0,0,0,0.3) 0%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.6) 100%)' }} />

                <div style={{ position: 'absolute', top: 'var(--space-4)', left: 'var(--space-4)', right: 'var(--space-4)', display: 'flex', justifyContent: 'space-between' }}>
                    <IconButton icon={ArrowLeft} onClick={() => navigate(-1)} style={{ backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)' }} />
                    <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                        <IconButton icon={Share2} onClick={handleShare} style={{ backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)' }} />
                        <IconButton 
                            icon={Heart} 
                            onClick={handleToggleWishlist} 
                            style={{ backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', color: isWishlisted ? '#f43f5e' : 'var(--color-text-primary)' }} 
                        />
                    </div>
                </div>

                <div style={{ position: 'absolute', bottom: '-40px', left: 'var(--space-4)', right: 'var(--space-4)', display: 'flex', gap: 'var(--space-4)', alignItems: 'flex-end' }}>
                    {restaurant.logo && (
                        <div style={{ width: 80, height: 80, borderRadius: '24px', backgroundColor: 'white', padding: '4px', boxShadow: 'var(--shadow-soft)' }}>
                            <img src={restaurant.logo} alt={restaurant.name} style={{ width: '100%', height: '100%', borderRadius: '20px', objectFit: 'cover' }} />
                        </div>
                    )}
                    <div style={{ marginBottom: '44px', color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                        <h1 style={{ fontSize: 'var(--text-h1)', margin: 0 }}>{restaurant.name}</h1>
                        <p style={{ fontSize: 'var(--text-body)', margin: 0, opacity: 0.9 }}>{restaurant.cuisine_type}</p>
                    </div>
                </div>
            </div>

            <div style={{ padding: '0 var(--space-4)', marginTop: '60px' }}>
                {/* Info Card */}
                <GlassCard padding="var(--space-4)" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                        <div 
                            onClick={() => navigate(`/restaurant/${slug}/reviews`)}
                            style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(255, 204, 0, 0.15)', color: '#D97706', padding: '6px 12px', borderRadius: '100px', fontSize: 'var(--text-caption)', fontWeight: 800, cursor: 'pointer' }}
                        >
                            <Star size={14} fill="currentColor" />
                            {restaurant.average_rating || 'New'} ({restaurant.total_ratings || 0})
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'var(--color-divider)', padding: '6px 12px', borderRadius: '100px', fontSize: 'var(--text-caption)', fontWeight: 800 }}>
                            <Clock size={14} />
                            {restaurant.average_delivery_time || 30} min
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: restaurant.currently_open ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 71, 111, 0.1)', color: restaurant.currently_open ? '#15803d' : '#be123c', padding: '6px 12px', borderRadius: '100px', fontSize: 'var(--text-caption)', fontWeight: 800 }}>
                            {restaurant.currently_open ? 'Open now' : 'Closed'}
                        </div>
                    </div>

                    <div style={{ width: '100%', height: '1px', backgroundColor: 'var(--color-border)' }} />

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: 'var(--color-divider)', color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <MessageSquare size={20} />
                        </div>
                        <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => navigate(`/restaurant/${slug}/reviews`)}>
                            <div style={{ fontWeight: 700, fontSize: 'var(--text-body)' }}>View all reviews</div>
                            <div style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-secondary)' }}>See what customers are saying</div>
                        </div>
                    </div>

                    {restaurant.minimum_order_amount > 0 && (
                        <>
                            <div style={{ width: '100%', height: '1px', backgroundColor: 'var(--color-border)' }} />
                            <div style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                                Minimum order: ₹{restaurant.minimum_order_amount} • Delivery fee: ₹{restaurant.delivery_fee || 'Free'}
                            </div>
                        </>
                    )}
                </GlassCard>

                {/* Search & Categories */}
                <div style={{ marginBottom: 'var(--space-5)', position: 'sticky', top: '16px', zIndex: 10 }}>
                    <AnimatePresence mode="wait">
                        {showSearch ? (
                            <motion.div
                                key="search"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                style={{ display: 'flex', gap: 'var(--space-2)' }}
                            >
                                <SearchBar
                                    placeholder="Search dishes..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    icon={Search}
                                    autoFocus
                                    style={{ flex: 1 }}
                                />
                                <Button variant="ghost" icon={X} onClick={() => { setShowSearch(false); setSearchTerm(''); }} />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="btn"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}
                            >
                                {restaurant.categories?.length > 0 && (
                                    <HorizontalScroller style={{ flex: 1, padding: 0, margin: 0 }}>
                                        {restaurant.categories.map((category) => (
                                            <Chip
                                                key={category.id}
                                                label={`${category.name} (${category.item_count || category.items?.length || 0})`}
                                                isActive={activeCategory === category.id}
                                                onClick={() => setActiveCategory(category.id)}
                                            />
                                        ))}
                                    </HorizontalScroller>
                                )}
                                <IconButton icon={Search} onClick={() => setShowSearch(true)} style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border)', flexShrink: 0 }} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Menu Items */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    {filteredItems.length > 0 ? (
                        filteredItems.map((item, index) => (
                            <FoodCard 
                                key={item.id}
                                name={item.name}
                                description={item.description}
                                image={item.image}
                                price={parseFloat(item.price)}
                                discountPrice={item.discount_price ? parseFloat(item.discount_price) : null}
                                isVeg={item.food_type === 'veg' || item.food_type === 'vegan'}
                                isBestseller={item.is_bestseller}
                                isAvailable={item.is_available}
                                quantity={getCartQuantity(item.id)}
                                onAdd={() => handleAddToCart(item)}
                                onIncrement={() => handleAddToCart(item)}
                                onDecrement={() => updateQuantity(item.id, getCartQuantity(item.id) - 1)}
                                onWishlist={() => handleToggleFoodWishlist(item.id, item.name)}
                                isWishlisted={foodWishlist.has(item.id)}
                            />
                        ))
                    ) : (
                        <EmptyState 
                            icon={Search}
                            title={searchTerm ? 'No matching dishes' : 'No items available'}
                            description="Try searching for something else or changing categories."
                        />
                    )}
                </div>
                
                <div style={{ height: '100px' }} />
            </div>

            {/* Sticky Cart */}
            <AnimatePresence>
                {cartCount > 0 && !isCartDrawerOpen && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        style={{
                            position: 'fixed',
                            bottom: 'var(--space-5)',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: 'calc(100% - var(--space-8))',
                            maxWidth: '500px',
                            backgroundColor: 'var(--brand-customer)',
                            color: 'white',
                            padding: 'var(--space-3) var(--space-4)',
                            borderRadius: '16px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            cursor: 'pointer',
                            boxShadow: '0 8px 30px rgba(217, 70, 239, 0.4)',
                            zIndex: 100
                        }}
                        onClick={openCartDrawer}
                    >
                        <div>
                            <div style={{ fontWeight: 800, fontSize: 'var(--text-body)' }}>{cartCount} item{cartCount !== 1 ? 's' : ''}</div>
                            <div style={{ fontSize: 'var(--text-caption)', opacity: 0.9 }}>₹{cartTotal.toFixed(2)}</div>
                        </div>
                        <div style={{ fontWeight: 800, fontSize: 'var(--text-body)' }}>
                            View Cart
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </PageContainer>
    );
};

export default RestaurantDetailPage;
