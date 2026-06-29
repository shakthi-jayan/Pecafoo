import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Search, MapPin, ChevronRight, ChevronDown,
    Utensils, Coffee, Pizza, Salad, Cake, Soup,
    Navigation, Loader, RefreshCw, ShoppingBag, ClipboardList
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';
import { restaurantsAPI } from '../services/api';
import RestaurantCard from '../components/RestaurantCard';
import CustomerHomeHeader from '../components/home/CustomerHomeHeader';
import RestaurantMap from '../components/maps/RestaurantMap';
import { ContentShelf, PageHero, SectionHeader } from '../../../shared-ui/PremiumUI';

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
        <div className="page page-shell stack-safe">
            <CustomerHomeHeader
                greeting={greeting()}
                firstName={user?.first_name}
                onNotifications={() => navigate('/notifications')}
            />

            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
            >
                <PageHero
                    eyebrow="Pecafoo picks today"
                    title="Cravings, beautifully close."
                    description="Explore trending meals and local favorites, with every part of your next order just a tap away."
                    actions={<><button className="btn btn-primary" onClick={() => navigate('/food-products')}>Order now <ChevronRight size={16} /></button><button className="btn btn-outline" onClick={() => navigate('/search')}>Explore nearby</button></>}
                >
                    <button onClick={handleRetryLocation} className="premium-location-card" type="button">
                        <span className="premium-location-icon">{locationLoading || retrying ? <Loader size={20} className="spin" /> : <MapPin size={20} />}</span>
                        <span><small>Delivering to</small><strong>{locationLoading || retrying ? 'Finding your location…' : address || (permissionDenied ? 'Enable location' : 'Current location')}</strong></span>
                        <ChevronDown size={16} />
                    </button>
                </PageHero>
            </motion.div>

            <motion.div
                className="search-bar"
                onClick={() => navigate('/search')}
                style={{ cursor: 'pointer', marginBottom: 18 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <Search size={20} />
                <input
                    placeholder="Search restaurants, dishes..."
                    readOnly
                    style={{ cursor: 'pointer' }}
                    id="home-search"
                />
            </motion.div>

            <motion.div
                className="quick-links"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.16 }}
            >
                <button className="quick-link-card" onClick={() => navigate('/food-products')}>
                    <span className="quick-link-icon" style={{ background: 'rgba(255, 194, 76, 0.2)', color: '#ff9b3f' }}>
                        <ShoppingBag size={18} />
                    </span>
                    <span className="quick-link-title">Browse Food</span>
                    <span className="quick-link-copy">Meals, snacks, and daily specials</span>
                </button>
                <button className="quick-link-card" onClick={() => navigate('/orders')}>
                    <span className="quick-link-icon" style={{ background: 'rgba(217, 70, 239, 0.14)', color: 'var(--accent-strong)' }}>
                        <ClipboardList size={18} />
                    </span>
                    <span className="quick-link-title">My Orders</span>
                    <span className="quick-link-copy">Track current and past deliveries</span>
                </button>
            </motion.div>

            <motion.section
                style={{ marginTop: 20 }}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <div className="section-header">
                    <h2 className="section-title" style={{ marginBottom: 0 }}>
                        Explore on Map
                    </h2>
                    <button
                        className="see-all"
                        onClick={handleRetryLocation}
                    >
                        Update Location <ChevronRight size={14} />
                    </button>
                </div>
                <div
                    className="card"
                    style={{
                        padding: 12,
                        overflow: 'hidden',
                        background: 'linear-gradient(180deg, rgba(255,255,255,0.98), rgba(255,247,242,0.98))',
                    }}
                >
                    <div style={{ marginBottom: 10 }}>
                        <p style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent-strong)' }}>
                            {address ? 'Restaurants near your selected address' : 'Enable location to discover nearby places'}
                        </p>
                        <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                            {address || 'Use GPS or tap update location to center the map around you.'}
                        </p>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.45, marginTop: 6 }}>
                            Drag the blue pin or tap anywhere on the map to set your exact delivery location.
                        </p>
                    </div>
                    <RestaurantMap
                        restaurants={restaurants}
                        height={260}
                        userLocation={coords}
                        onUserLocationChange={handleManualMapLocationChange}
                        interactiveUserLocation
                    />
                </div>
            </motion.section>

            <motion.section
                className="promo-card"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.22 }}
            >
                <p className="promo-eyebrow">First Order Offer</p>
                <h3 className="promo-title">Get 30% off your first meal today</h3>
                <p className="promo-copy">Use code PECAFOO30 at checkout to unlock the welcome offer.</p>
                <button
                    className="btn btn-primary btn-sm"
                    onClick={() => navigate('/food-products')}
                    style={{ marginTop: 14 }}
                >
                    Claim offer <ChevronRight size={16} />
                </button>
            </motion.section>

            <motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
            >
                <div className="section-header">
                    <h2 className="section-title" style={{ marginBottom: 0 }}>Categories</h2>
                    <button className="see-all" onClick={() => navigate('/food-products')}>
                        Browse Dishes <ChevronRight size={14} />
                    </button>
                </div>
                <div className="category-row">
                    {displayedCategories.map(({ name, icon: Icon, color, softColor, itemCount }) => {
                        const isActive = activeCategory === name;
                        return (
                            <motion.button
                                key={name}
                                className={`category-chip ${isActive ? 'active' : ''}`}
                                onClick={() => {
                                    setActiveCategory(name);
                                    if (name === 'All') {
                                        navigate('/food-products');
                                        return;
                                    }
                                    navigate(`/food-products?q=${encodeURIComponent(name)}`);
                                }}
                                whileTap={{ scale: 0.96 }}
                            >
                                <div
                                    className="category-icon"
                                    style={{
                                        background: isActive ? color : softColor,
                                        color: isActive ? 'white' : color,
                                    }}
                                >
                                    <Icon size={24} />
                                </div>
                                <span className="category-label">{name}</span>
                                {itemCount ? (
                                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{itemCount} items</span>
                                ) : null}
                            </motion.button>
                        );
                    })}
                </div>
            </motion.section>

            {featuredRestaurants.length > 0 && (
                <motion.section
                    style={{ marginTop: 22 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <SectionHeader eyebrow="Editor’s shelf" title="Featured near you" description="Standout kitchens and local favorites worth discovering." action={<button className="see-all" onClick={() => navigate('/search?featured=true')}>See All <ChevronRight size={14} /></button>} />
                    <ContentShelf>
                        {featuredRestaurants.map((restaurant) => (
                            <div key={restaurant.id}>
                                <RestaurantCard restaurant={restaurant} />
                            </div>
                        ))}
                    </ContentShelf>
                </motion.section>
            )}

            <motion.section
                style={{ marginTop: 22 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
            >
                <SectionHeader eyebrow="Around you" title={coords ? 'Nearby restaurants' : restaurants.length > 0 ? 'Restaurants' : 'No restaurants yet'} description="Fresh options organized for quick, comfortable browsing." action={coords && (
                        <button
                            className="btn btn-outline btn-sm"
                            onClick={fetchRestaurants}
                            style={{ minHeight: 38, paddingInline: 12, color: 'var(--accent-strong)' }}
                        >
                            <RefreshCw size={12} /> Refresh
                        </button>
                    )} />

                {loading ? (
                    <div className="results-stack">
                        {[1, 2, 3].map((item) => (
                            <div key={item} className="skeleton" style={{ height: 230 }} />
                        ))}
                    </div>
                ) : restaurants.length > 0 ? (
                    <div className="results-stack">
                        {restaurants.map((restaurant, index) => (
                            <motion.div
                                key={restaurant.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.08 * index }}
                            >
                                <RestaurantCard restaurant={restaurant} showDistance={!!coords} />
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <Utensils />
                        <h3>No restaurants nearby</h3>
                        <p>We&apos;re expanding quickly. New restaurants are added daily.</p>
                        {!coords && (
                            <button
                                className="btn btn-primary"
                                onClick={handleRetryLocation}
                                style={{ marginTop: 12 }}
                            >
                                <Navigation size={16} /> Enable Location
                            </button>
                        )}
                    </div>
                )}
            </motion.section>
        </div>
    );
};

export default HomePage;
