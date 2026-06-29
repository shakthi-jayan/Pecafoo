import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, Trash2, ChevronRight, Store, UtensilsCrossed } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { customersAPI } from '../services/api';
import toast from 'react-hot-toast';

import {
    PageContainer,
    IconButton,
    SegmentedControl,
    EmptyState,
    Button,
    GlassCard,
    RestaurantCard
} from '../../../shared-ui/PremiumUI';

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
            toast.success(`${itemName} removed from favorites`);
        } catch {
            toast.error('Failed to remove item');
        }
    };

    return (
        <PageContainer padding="0">
            <div style={{ position: 'sticky', top: 0, zIndex: 10, backgroundColor: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)', padding: 'var(--space-4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <IconButton icon={ArrowLeft} onClick={() => navigate(-1)} />
                    <h1 style={{ margin: 0, fontSize: 'var(--text-h3)' }}>Favorites</h1>
                </div>
                <div style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Heart size={20} color="var(--brand-customer)" fill="var(--brand-customer)" />
                </div>
            </div>

            <div style={{ padding: 'var(--space-4)', paddingBottom: '120px' }}>
                <div style={{ marginBottom: 'var(--space-6)' }}>
                    <SegmentedControl 
                        options={[
                            { label: <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Store size={14}/> Restaurants</div>, value: 'restaurants' },
                            { label: <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><UtensilsCrossed size={14}/> Food</div>, value: 'food' }
                        ]}
                        value={activeTab}
                        onChange={setActiveTab}
                        brandColor="var(--brand-customer)"
                    />
                </div>

                <AnimatePresence mode="wait">
                    {activeTab === 'restaurants' ? (
                        <motion.div key="restaurants" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            {restaurantLoading ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                                    {[1, 2, 3].map(i => (
                                        <div key={i} style={{ height: 200, backgroundColor: 'var(--color-divider)', borderRadius: 'var(--radius-card)' }} />
                                    ))}
                                </div>
                            ) : wishlist.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                                    {wishlist.map((item, i) => {
                                        const r = item.restaurant_detail || item;
                                        return (
                                            <motion.div
                                                key={item.id || i}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.05 }}
                                            >
                                                <RestaurantCard 
                                                    image={r.cover_image || r.logo}
                                                    name={r.name}
                                                    subtitle={r.cuisine_type}
                                                    rating={r.average_rating}
                                                    time={`${r.average_delivery_time || 30} min`}
                                                    onClick={() => navigate(`/restaurant/${r.slug}`)}
                                                />
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <EmptyState
                                    icon={Heart}
                                    title="No Saved Restaurants"
                                    description="Tap the heart icon on restaurants to save them here!"
                                    action={<Button onClick={() => navigate('/')}>Explore Restaurants</Button>}
                                />
                            )}
                        </motion.div>
                    ) : (
                        <motion.div key="food" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            {foodLoading ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                                    {[1, 2, 3].map(i => (
                                        <div key={i} style={{ height: 100, backgroundColor: 'var(--color-divider)', borderRadius: 'var(--radius-card)' }} />
                                    ))}
                                </div>
                            ) : foodItems.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                                    {foodItems.map((item, i) => (
                                        <motion.div
                                            key={item.id || i}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                        >
                                            <GlassCard padding="var(--space-3)" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                                <div style={{ width: 64, height: 64, borderRadius: '12px', overflow: 'hidden', backgroundColor: 'var(--color-divider)', flexShrink: 0 }}>
                                                    {item.menu_item_image ? (
                                                        <img src={item.menu_item_image} alt={item.menu_item_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    ) : (
                                                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>🍽️</div>
                                                    )}
                                                </div>
                                                
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <p style={{ margin: '0 0 2px 0', fontWeight: 800, fontSize: 'var(--text-body)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.menu_item_name || 'Food Item'}</p>
                                                    {item.restaurant_name && (
                                                        <div 
                                                            onClick={() => navigate(`/restaurant/${item.restaurant_slug}`)}
                                                            style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--brand-customer)', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                                                        >
                                                            {item.restaurant_name} <ChevronRight size={12}/>
                                                        </div>
                                                    )}
                                                    <p style={{ margin: '4px 0 0 0', fontWeight: 800, fontSize: 'var(--text-body)' }}>₹{item.menu_item_price || 'N/A'}</p>
                                                </div>
                                                
                                                <IconButton 
                                                    icon={Trash2} 
                                                    variant="ghost" 
                                                    onClick={() => removeFoodItem(item.menu_item, item.menu_item_name)} 
                                                    style={{ color: 'var(--color-danger)' }}
                                                />
                                            </GlassCard>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <EmptyState
                                    icon={UtensilsCrossed}
                                    title="No Saved Dishes"
                                    description="Browse menus and tap the heart on items you love!"
                                    action={<Button onClick={() => navigate('/food-products')}>Browse Food</Button>}
                                />
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </PageContainer>
    );
};

export default WishlistPage;
