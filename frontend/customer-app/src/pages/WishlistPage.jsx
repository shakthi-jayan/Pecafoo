import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Trash2, ChevronRight, Store, UtensilsCrossed } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { customersAPI } from '../services/api';
import RestaurantCard from '../components/RestaurantCard';
import toast from 'react-hot-toast';
import { getImageProps } from '../utils/imageUtils'; // ✅ NEW

const WishlistPage = () => {
    const navigate = useNavigate();
    const { wishlist, loading: restaurantLoading } = useWishlist();
    const [activeTab, setActiveTab] = useState('restaurants');

    const [foodItems, setFoodItems] = useState([]);
    const [foodLoading, setFoodLoading] = useState(false);

    useEffect(() => {
        if (activeTab === 'food') {
            fetchFoodWishlist();
        }
    }, [activeTab]);

    const fetchFoodWishlist = async () => {
        setFoodLoading(true);
        try {
            const { data } = await customersAPI.getFoodWishlist();
            setFoodItems(data.results || data || []);
        } catch {
            setFoodItems([]);
        } finally {
            setFoodLoading(false);
        }
    };

    const removeFoodItem = async (menuItemId, itemName) => {
        try {
            await customersAPI.toggleFoodWishlist({ menu_item_id: menuItemId });
            setFoodItems(prev => prev.filter(f => f.menu_item !== menuItemId));
            toast.success(`${itemName} removed from wishlist`);
        } catch {
            toast.error('Failed to remove item');
        }
    };

    return (
        <div className="page" style={{ paddingBottom: 100 }}>

            {/* HEADER */}
            <div className="page-header">
                <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none' }}>
                    <ArrowLeft size={22} />
                </button>
                <h1 className="page-title">My Wishlist</h1>
                <Heart size={20} color="var(--accent)" fill="var(--accent)" />
            </div>

            {/* TABS */}
            <div style={{
                display: 'flex',
                background: 'var(--bg-elevated)',
                borderRadius: 12,
                padding: 4,
                marginBottom: 16,
            }}>
                {[
                    { key: 'restaurants', label: 'Restaurants', icon: Store },
                    { key: 'food', label: 'Food Items', icon: UtensilsCrossed },
                ].map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        style={{
                            flex: 1,
                            padding: '10px',
                            borderRadius: 10,
                            background: activeTab === tab.key ? 'var(--accent)' : 'transparent',
                            color: activeTab === tab.key ? 'white' : 'var(--text-secondary)',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: 6,
                        }}
                    >
                        <tab.icon size={16} /> {tab.label}
                    </button>
                ))}
            </div>

            {/* RESTAURANTS */}
            {activeTab === 'restaurants' && (
                restaurantLoading ? (
                    <div className="skeleton h-40" />
                ) : wishlist.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {wishlist.map((item, i) => (
                            <motion.div key={item.id || i} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <RestaurantCard restaurant={item.restaurant_detail || item} />
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <Heart size={48} />
                        <h3>No Saved Restaurants</h3>
                        <button onClick={() => navigate('/')}>Explore</button>
                    </div>
                )
            )}

            {/* FOOD ITEMS */}
            {activeTab === 'food' && (
                foodLoading ? (
                    <div className="skeleton h-24" />
                ) : foodItems.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {foodItems.map((item, i) => (
                            <motion.div
                                key={item.id || i}
                                className="card"
                                style={{ display: 'flex', gap: 12, alignItems: 'center' }}
                            >
                                
                                {/* ✅ FIXED IMAGE */}
                                <div style={{
                                    width: 64,
                                    height: 64,
                                    borderRadius: 12,
                                    overflow: 'hidden',
                                    flexShrink: 0,
                                }}>
                                    <img
                                        {...getImageProps(item.menu_item_image, 'menu', 100)}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                </div>

                                {/* INFO */}
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontWeight: 600 }}>
                                        {item.menu_item_name || 'Food Item'}
                                    </p>

                                    {item.restaurant_name && (
                                        <p
                                            onClick={() => navigate(`/restaurant/${item.restaurant_slug}`)}
                                            style={{ color: 'var(--accent)', cursor: 'pointer' }}
                                        >
                                            {item.restaurant_name} <ChevronRight size={12} />
                                        </p>
                                    )}

                                    <p style={{ fontWeight: 700 }}>
                                        ₹{item.menu_item_price || 'N/A'}
                                    </p>
                                </div>

                                {/* DELETE */}
                                <button
                                    onClick={() => removeFoodItem(item.menu_item, item.menu_item_name)}
                                    style={{ background: 'none', border: 'none', color: 'red' }}
                                >
                                    <Trash2 size={18} />
                                </button>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <UtensilsCrossed size={48} />
                        <h3>No Saved Food Items</h3>
                        <button onClick={() => navigate('/food-products')}>
                            Browse Food
                        </button>
                    </div>
                )
            )}
        </div>
    );
};

export default WishlistPage;
