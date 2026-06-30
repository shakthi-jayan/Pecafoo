import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, X, TrendingUp, UtensilsCrossed, Store, Tags } from 'lucide-react';
import { restaurantsAPI } from '../services/api';
import {
    PageContainer,
    SearchBar,
    SectionHeader,
    Chip,
    RestaurantCard,
    EmptyState,
    Button,
    HorizontalScroller,
    GlassCard
} from '../../../shared-ui/PremiumUI';

const SearchPage = () => {
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [restaurantResults, setRestaurantResults] = useState([]);
    const [foodResults, setFoodResults] = useState([]);
    const [platformCategories, setPlatformCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const inputRef = useRef(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    useEffect(() => {
        restaurantsAPI.getPlatformCategories()
            .then(({ data }) => setPlatformCategories(data || []))
            .catch(() => setPlatformCategories([]));
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (query.trim().length >= 2) {
                searchEverything(query);
            } else {
                setRestaurantResults([]);
                setFoodResults([]);
                setSearched(false);
            }
        }, 400);

        return () => clearTimeout(timer);
    }, [query]);

    const searchEverything = async (searchQuery) => {
        setLoading(true);
        setSearched(true);
        try {
            const [restaurantRes, foodRes] = await Promise.all([
                restaurantsAPI.getAll({ search: searchQuery }),
                restaurantsAPI.getFoodItems({ search: searchQuery }),
            ]);
            setRestaurantResults(restaurantRes.data.results || restaurantRes.data || []);
            setFoodResults(foodRes.data.results || foodRes.data || []);
        } catch {
            setRestaurantResults([]);
            setFoodResults([]);
        } finally {
            setLoading(false);
        }
    };

    const normalizedQuery = query.trim().toLowerCase();
    const categoryResults = normalizedQuery
        ? platformCategories.filter((category) => category.name?.toLowerCase().includes(normalizedQuery))
        : [];
    const totalResults = restaurantResults.length + foodResults.length + categoryResults.length;

    return (
        <PageContainer padding="0">
            <div style={{ padding: 'var(--space-4)' }}>
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ position: 'sticky', top: 0, zIndex: 10, backgroundColor: 'var(--color-bg-base)', paddingTop: 'var(--space-2)', paddingBottom: 'var(--space-4)' }}>
                    <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                        <SearchBar
                            ref={inputRef}
                            placeholder="Search restaurants, cuisines..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            icon={Search}
                            style={{ flex: 1 }}
                        />
                        {query && (
                            <Button variant="ghost" onClick={() => setQuery('')} icon={X} />
                        )}
                    </div>
                </motion.div>

                {!searched && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                            <div style={{
                                width: '40px', height: '40px', borderRadius: '12px',
                                backgroundColor: 'rgba(217, 70, 239, 0.14)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'var(--brand-customer)'
                            }}>
                                <TrendingUp size={20} />
                            </div>
                            <div>
                                <h3 style={{ fontSize: 'var(--text-h3)', margin: 0 }}>Trending Searches</h3>
                                <p style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-secondary)', margin: 0 }}>Popular dishes people are ordering today.</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                            {platformCategories.slice(0, 10).map((category) => (
                                <Chip
                                    key={category.name}
                                    label={category.name}
                                    onClick={() => setQuery(category.name)}
                                />
                            ))}
                        </div>
                    </motion.div>
                )}

                {loading && (
                    <div style={{ display: 'grid', gap: 'var(--space-5)', marginTop: 'var(--space-5)' }}>
                        {[1, 2, 3].map((item) => (
                            <div key={item} style={{ height: 160, backgroundColor: 'var(--color-divider)', borderRadius: 'var(--radius-card)' }} />
                        ))}
                    </div>
                )}

                {searched && !loading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <p style={{ fontSize: 'var(--text-body)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-5)', fontWeight: 600 }}>
                            {totalResults} result{totalResults !== 1 ? 's' : ''} for "{query}"
                        </p>

                        {totalResults > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-7)' }}>
                                {categoryResults.length > 0 && (
                                    <div>
                                        <SectionHeader 
                                            title="Categories"
                                            action={<span style={{ fontWeight: 800, color: 'var(--brand-customer)' }}><Tags size={14} style={{ marginRight: 4 }}/>{categoryResults.length}</span>}
                                        />
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                                            {categoryResults.map((category) => (
                                                <GlassCard 
                                                    key={category.name}
                                                    padding="var(--space-3)" 
                                                    style={{ cursor: 'pointer', flex: '1 1 auto', minWidth: '150px' }}
                                                    onClick={() => navigate(`/food-products?q=${encodeURIComponent(category.name)}`)}
                                                >
                                                    <div style={{ fontWeight: 600, fontSize: 'var(--text-body)' }}>{category.name}</div>
                                                    <div style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                                                        {category.item_count || 0} dishes • {category.restaurant_count || 0} restaurants
                                                    </div>
                                                </GlassCard>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {foodResults.length > 0 && (
                                    <div>
                                        <SectionHeader 
                                            title="Dishes"
                                            action={<span style={{ fontWeight: 800, color: 'var(--brand-customer)' }}><UtensilsCrossed size={14} style={{ marginRight: 4 }}/>{foodResults.length}</span>}
                                        />
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--space-4)' }}>
                                            {foodResults.map((item, index) => (
                                                <motion.div
                                                    key={item.id}
                                                    initial={{ opacity: 0, y: 15 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: index * 0.04 }}
                                                    onClick={() => navigate(`/restaurant/${item.restaurant_slug}`)}
                                                    style={{ 
                                                        backgroundColor: 'var(--color-bg-card)', 
                                                        padding: 'var(--space-4)', 
                                                        borderRadius: 'var(--radius-card)', 
                                                        boxShadow: 'var(--shadow-softer)',
                                                        border: '1px solid var(--color-border)',
                                                        display: 'flex', gap: 'var(--space-4)', alignItems: 'center', cursor: 'pointer' 
                                                    }}
                                                >
                                                    {item.image ? (
                                                        <img
                                                            src={item.image}
                                                            alt={item.name}
                                                            loading="lazy"
                                                            style={{ width: 80, height: 80, borderRadius: 16, objectFit: 'cover', flexShrink: 0 }}
                                                        />
                                                    ) : (
                                                        <div style={{ width: 80, height: 80, borderRadius: 16, background: 'var(--color-divider)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-tertiary)', flexShrink: 0 }}>
                                                            <UtensilsCrossed size={24} />
                                                        </div>
                                                    )}
                                                    <div style={{ minWidth: 0, flex: 1 }}>
                                                        <p style={{ fontWeight: 700, fontSize: 'var(--text-body)', margin: '0 0 var(--space-1) 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</p>
                                                        <p style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-secondary)', margin: '0 0 2px 0' }}>{item.restaurant_name}</p>
                                                        <p style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-tertiary)', margin: '0 0 var(--space-2) 0' }}>{item.category_name || item.description || 'Menu item'}</p>
                                                        <p style={{ fontSize: 'var(--text-body)', fontWeight: 800, color: 'var(--brand-customer)', margin: 0 }}>
                                                            ₹{Number(item.effective_price || item.discount_price || item.price || 0).toFixed(2)}
                                                        </p>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {restaurantResults.length > 0 && (
                                    <div>
                                        <SectionHeader 
                                            title="Restaurants"
                                            action={<span style={{ fontWeight: 800, color: 'var(--brand-customer)' }}><Store size={14} style={{ marginRight: 4 }}/>{restaurantResults.length}</span>}
                                        />
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--space-5)' }}>
                                            {restaurantResults.map((restaurant, index) => (
                                                <motion.div key={restaurant.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06 }}>
                                                    <RestaurantCard 
                                                        name={restaurant.name}
                                                        subtitle={restaurant.cuisine_type || 'Restaurant'}
                                                        image={restaurant.image_url}
                                                        rating={restaurant.rating}
                                                    />
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <EmptyState
                                icon={Search}
                                title="No results found"
                                description="Try another dish, cuisine, or restaurant name."
                            />
                        )}
                    </motion.div>
                )}
            </div>
        </PageContainer>
    );
};

export default SearchPage;
