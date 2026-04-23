
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, Trash2, ChevronRight, Store, UtensilsCrossed } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { customersAPI } from '../services/api';
import RestaurantCard from '../components/RestaurantCard';
import toast from 'react-hot-toast';

const WishlistPage = () => {
    const navigate = useNavigate();
    const { wishlist, loading: restaurantLoading, toggleWishlist } = useWishlist();
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
            {}
            <div className="page-header">
                <button
                    onClick={() => navigate(-1)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}
                >
                    <ArrowLeft size={22} />
                </button>
                <h1 className="page-title">My Wishlist</h1>
                <Heart size={20} color="var(--accent)" fill="var(--accent)" />
            </div>

            {}
            <div style={{
                display: 'flex', gap: 0, marginBottom: 'var(--space-lg)',
                background: 'var(--bg-elevated)', borderRadius: 12, padding: 4,
            }}>
                {[
                    { key: 'restaurants', label: 'Restaurants', icon: Store },
                    { key: 'food', label: 'Food Items', icon: UtensilsCrossed },
                ].map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        style={{
                            flex: 1, padding: '10px 16px', borderRadius: 10,
                            background: activeTab === tab.key ? 'var(--accent)' : 'transparent',
                            color: activeTab === tab.key ? 'white' : 'var(--text-secondary)',
                            border: 'none', cursor: 'pointer',
                            fontWeight: activeTab === tab.key ? 700 : 500,
                            fontSize: '0.85rem', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', gap: 6,
                            transition: 'all 0.2s',
                        }}
                    >
                        <tab.icon size={16} /> {tab.label}
                    </button>
                ))}
            </div>

            {}
            {activeTab === 'restaurants' && (
                <>
                    {restaurantLoading ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {[1, 2, 3].map(i => (
                                <div key={i} className="skeleton" style={{ height: 200, borderRadius: 16 }} />
                            ))}
                        </div>
                    ) : wishlist.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {wishlist.map((item, i) => (
                                <motion.div
                                    key={item.id || i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                >
                                    <RestaurantCard restaurant={item.restaurant_detail || item} />
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <Heart size={48} style={{ opacity: 0.5, color: 'var(--accent)' }} />
                            <h3>No Saved Restaurants</h3>
                            <p>Tap the heart icon on restaurants to save them here!</p>
                            <button
                                className="btn btn-primary"
                                onClick={() => navigate('/')}
                                style={{ marginTop: 12 }}
                            >
                                Explore Restaurants
                            </button>
                        </div>
                    )}
                </>
            )}

            {}
            {activeTab === 'food' && (
                <>
                    {foodLoading ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {[1, 2, 3].map(i => (
                                <div key={i} className="skeleton" style={{ height: 80, borderRadius: 12 }} />
                            ))}
                        </div>
                    ) : foodItems.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {foodItems.map((item, i) => (
                                <motion.div
                                    key={item.id || i}
                                    className="card"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    style={{ display: 'flex', alignItems: 'center', gap: 12 }}
                                >
                                    {}
                                    <div style={{
                                        width: 64, height: 64, borderRadius: 12,
                                        overflow: 'hidden', flexShrink: 0,
                                    }}>
                                        {item.menu_item_image ? (
                                            <img
                                                src={item.menu_item_image} alt={item.menu_item_name}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                        ) : (
                                            <div style={{
                                                width: '100%', height: '100%',
                                                background: 'var(--bg-elevated)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: '1.2rem',
                                            }}>
                                                🍽️
                                            </div>
                                        )}
                                    </div>

                                    {}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ fontWeight: 600, marginBottom: 2 }}>
                                            {item.menu_item_name || 'Food Item'}
                                        </p>
                                        {item.restaurant_name && (
                                            <p
                                                onClick={() => navigate(`/restaurant/${item.restaurant_slug}`)}
                                                style={{
                                                    fontSize: '0.8rem', color: 'var(--accent)',
                                                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                                                }}
                                            >
                                                {item.restaurant_name}
                                                <ChevronRight size={12} />
                                            </p>
                                        )}
                                        <p style={{ fontWeight: 700, fontSize: '0.9rem', marginTop: 4 }}>
                                            ₹{item.menu_item_price || 'N/A'}
                                        </p>
                                    </div>

                                    {}
                                    <button
                                        onClick={() => removeFoodItem(item.menu_item, item.menu_item_name)}
                                        style={{
                                            background: 'none', border: 'none', cursor: 'pointer',
                                            color: '#f43f5e', padding: 8,
                                        }}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <UtensilsCrossed size={48} style={{ opacity: 0.5, color: 'var(--accent)' }} />
                            <h3>No Saved Food Items</h3>
                            <p>Browse menus and tap the heart on items you love!</p>
                            <button
                                className="btn btn-primary"
                                onClick={() => navigate('/food-products')}
                                style={{ marginTop: 12 }}
                            >
                                Browse Food
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default WishlistPage;
