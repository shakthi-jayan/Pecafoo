import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Search, MapPin, ChevronRight,
    Utensils, Coffee, Pizza, Salad, Cake, Soup,
    Navigation, RefreshCw, ShoppingBag, ClipboardList, Loader
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';
import { restaurantsAPI } from '../services/api';
import CustomerHomeHeader from '../components/home/CustomerHomeHeader';
import { RestaurantMap } from '@pecafoo/shared-ui';

import {
    PageContainer,
    HeroBanner,
    SearchBar,
    SectionHeader,
    HorizontalScroller,
    RestaurantCard,
    EmptyState,
    Button,
    Chip,
    GlassCard
} from '@pecafoo/shared-ui/index';

const fallbackCategories = [
    { name: 'All', icon: Utensils, color: '#ffb546', softColor: '#fff1cf' },
    { name: 'Indian', icon: Soup, color: '#ff7f50', softColor: '#ffe2d7' },
    { name: 'Pizza', icon: Pizza, color: '#f97316', softColor: '#ffe4d5' },
    { name: 'Coffee', icon: Coffee, color: '#8b5e3c', softColor: '#efe1d7' },
    { name: 'Salad', icon: Salad, color: '#22c55e', softColor: '#dff8e8' },
    { name: 'Dessert', icon: Cake, color: '#d946ef', softColor: '#fae1ff' },
];

const HomePage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const {
        coords, address, loading: locationLoading,
        detectLocation, permissionDenied, setManualLocation,
    } = useLocation();

    const [restaurants, setRestaurants] = useState([]);
    const [featuredRestaurants, setFeaturedRestaurants] = useState([]);
    const [platformCategories, setPlatformCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('All');
    const [retrying, setRetrying] = useState(false);

    const fetchRestaurants = useCallback(async () => {
        try {
            setLoading(true);
            const params = {};

            if (coords) {
                params.latitude = coords[0];
                params.longitude = coords[1];
                params.radius = 15;
            }

            const { data } = await restaurantsAPI.getAll(params);
            const results = data.results || data || [];
            setRestaurants(results);
            setFeaturedRestaurants(results.filter((restaurant) => restaurant.is_featured));
        } catch (error) {
            console.error('Failed to fetch restaurants:', error);
            setRestaurants([]);
            setFeaturedRestaurants([]);
        } finally {
            setLoading(false);
        }
    }, [coords]);

    useEffect(() => {
        fetchRestaurants();
    }, [fetchRestaurants]);

    useEffect(() => {
        restaurantsAPI.getPlatformCategories()
            .then(({ data }) => setPlatformCategories(data || []))
            .catch(() => setPlatformCategories([]));
    }, []);

    const handleRetryLocation = async () => {
        setRetrying(true);
        await detectLocation();
        setRetrying(false);
    };

    const handleManualMapLocationChange = async (nextCoords) => {
        await setManualLocation(nextCoords[0], nextCoords[1]);
    };

    const greeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    const categoryPalette = [Utensils, Soup, Pizza, Coffee, Salad, Cake];
    const displayedCategories = platformCategories.length > 0
        ? [
            { name: 'All', icon: Utensils, color: '#ffb546', softColor: '#fff1cf' },
            ...platformCategories.slice(0, 7).map((category, index) => ({
                name: category.name,
                icon: categoryPalette[(index + 1) % categoryPalette.length],
                color: ['#ff7f50', '#f97316', '#8b5e3c', '#22c55e', '#d946ef', '#8b2cf5', '#0ea5e9'][index % 7],
                softColor: ['#ffe2d7', '#ffe4d5', '#efe1d7', '#dff8e8', '#fae1ff', '#efe3ff', '#dff2ff'][index % 7],
                itemCount: category.item_count,
            })),
        ]
        : fallbackCategories;

    return (
        <PageContainer padding="0">
            <div style={{ padding: 'var(--space-4)' }}>
                <CustomerHomeHeader
                    greeting={greeting()}
                    firstName={user?.first_name}
                    onNotifications={() => navigate('/notifications')}
                />
            </div>

            <div style={{ padding: '0 var(--space-4)' }}>
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                    <HeroBanner
                        eyebrow="Pecafoo Picks Today"
                        title="Cravings, beautifully close."
                        description="Explore trending meals and local favorites, with every part of your next order just a tap away."
                        actions={
                            <>
                                <Button onClick={() => navigate('/food-products')}>Order now</Button>
                                <Button variant="secondary" onClick={() => navigate('/search')}>Explore nearby</Button>
                            </>
                        }
                    >
                        <GlassCard padding="var(--space-4)" className="flex-column" style={{ width: '100%', maxWidth: '300px' }}>
                            <Button 
                                variant="secondary" 
                                fullWidth 
                                onClick={handleRetryLocation} 
                                icon={locationLoading || retrying ? Loader : MapPin}
                            >
                                {locationLoading || retrying ? 'Finding...' : address || (permissionDenied ? 'Enable location' : 'Current location')}
                            </Button>
                        </GlassCard>
                    </HeroBanner>
                </motion.div>

                <div onClick={() => navigate('/search')} style={{ marginBottom: 'var(--space-6)', cursor: 'pointer' }}>
                    <SearchBar 
                        placeholder="Search restaurants, dishes..."
                        icon={Search}
                        readOnly
                        style={{ pointerEvents: 'none' }} 
                    />
                </div>

                <HorizontalScroller>
                    {displayedCategories.map(({ name, icon, color }) => (
                        <Chip
                            key={name}
                            label={name}
                            icon={icon}
                            isActive={activeCategory === name}
                            brandColor={color}
                            onClick={() => {
                                setActiveCategory(name);
                                if (name === 'All') navigate('/food-products');
                                else navigate(`/food-products?q=${encodeURIComponent(name)}`);
                            }}
                        />
                    ))}
                </HorizontalScroller>

                {featuredRestaurants.length > 0 && (
                    <motion.section style={{ marginTop: 'var(--space-6)' }}>
                        <SectionHeader 
                            eyebrow="Editor's Shelf" 
                            title="Featured near you" 
                            action={<Button variant="ghost" size="small" onClick={() => navigate('/search?featured=true')}>See All</Button>}
                        />
                        <HorizontalScroller>
                            {featuredRestaurants.map((restaurant) => (
                                <div key={restaurant.id} style={{ width: '320px' }}>
                                    <RestaurantCard 
                                        name={restaurant.name}
                                        subtitle={restaurant.cuisine_type || 'Local Favorite'}
                                        image={restaurant.image_url}
                                        rating={restaurant.rating}
                                    />
                                </div>
                            ))}
                        </HorizontalScroller>
                    </motion.section>
                )}

                <motion.section style={{ marginTop: 'var(--space-6)' }}>
                    <SectionHeader 
                        eyebrow="Around you"
                        title={coords ? 'Nearby restaurants' : restaurants.length > 0 ? 'Restaurants' : 'No restaurants yet'}
                        action={coords && <Button variant="ghost" size="small" onClick={fetchRestaurants} icon={RefreshCw}>Refresh</Button>}
                    />

                    {loading ? (
                        <div style={{ display: 'grid', gap: 'var(--space-5)', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                            {[1, 2, 3, 4].map(i => <div key={i} style={{ height: 260, backgroundColor: 'var(--color-divider)', borderRadius: 'var(--radius-card)' }} />)}
                        </div>
                    ) : restaurants.length > 0 ? (
                        <div style={{ display: 'grid', gap: 'var(--space-5)', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                            {restaurants.map((restaurant, index) => (
                                <motion.div key={restaurant.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                                    <RestaurantCard 
                                        name={restaurant.name}
                                        subtitle={restaurant.cuisine_type || 'Restaurant'}
                                        image={restaurant.image_url}
                                        rating={restaurant.rating}
                                        time={restaurant.estimated_delivery_time ? `${restaurant.estimated_delivery_time} min` : undefined}
                                    />
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <EmptyState 
                            icon={Utensils}
                            title="No restaurants nearby"
                            description="We're expanding quickly. New restaurants are added daily."
                            action={
                                !coords && (
                                    <Button onClick={handleRetryLocation} icon={Navigation}>
                                        Enable Location
                                    </Button>
                                )
                            }
                        />
                    )}
                </motion.section>
                
                <div style={{ height: '120px' }} /> {/* Space for bottom nav */}
            </div>
        </PageContainer>
    );
};

export default HomePage;


