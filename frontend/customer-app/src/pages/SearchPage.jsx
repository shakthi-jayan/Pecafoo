import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, X, TrendingUp, UtensilsCrossed, Store, Tags } from 'lucide-react';
import { restaurantsAPI } from '../services/api';
import RestaurantCard from '../components/RestaurantCard';



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
        <div className="page search-shell">
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="search-bar">
                    <Search size={20} />
                    <input
                        ref={inputRef}
                        placeholder="Search restaurants, cuisines..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        id="search-input"
                    />
                    {query && (
                        <button className="btn-ghost" onClick={() => setQuery('')} style={{ padding: 4, color: 'var(--text-muted)' }}>
                            <X size={18} />
                        </button>
                    )}
                </div>
            </motion.div>

            {!searched && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.15 }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 12 }}>
                        <span className="quick-link-icon" style={{ width: 36, height: 36, marginBottom: 0, background: 'rgba(217, 70, 239, 0.14)', color: 'var(--accent-strong)' }}>
                            <TrendingUp size={18} />
                        </span>
                        <div>
                            <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>Trending Searches</h3>
                            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Popular dishes people are ordering today.</p>
                        </div>
                    </div>
                    <div className="trend-row">
                        {platformCategories.slice(0, 10).map((category) => (
                            <button
                                key={category.name}
                                className="trend-chip"
                                onClick={() => setQuery(category.name)}
                            >
                                {category.name}
                            </button>
                        ))}
                    </div>
                </motion.div>
            )}

            {loading && (
                <div className="results-stack">
                    {[1, 2, 3].map((item) => (
                        <div key={item} className="skeleton" style={{ height: 210 }} />
                    ))}
                </div>
            )}

            {searched && !loading && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginBottom: 14, fontWeight: 700 }}>
                        {totalResults} result{totalResults !== 1 ? 's' : ''} for "{query}"
                    </p>

                    {totalResults > 0 ? (
                        <div className="results-stack">
                            {categoryResults.length > 0 && (
                                <div className="page-shell">
                                    <div className="section-header" style={{ marginBottom: 0 }}>
                                        <h3 className="section-title" style={{ marginBottom: 0, fontSize: '1rem' }}>Categories</h3>
                                        <span className="badge badge-accent"><Tags size={12} /> {categoryResults.length}</span>
                                    </div>
                                    <div className="trend-row">
                                        {categoryResults.map((category) => (
                                            <button
                                                key={category.name}
                                                className="trend-chip"
                                                onClick={() => navigate(`/food-products?q=${encodeURIComponent(category.name)}`)}
                                                style={{ textAlign: 'left' }}
                                            >
                                                {category.name}
                                                <span style={{ display: 'block', marginTop: 4, fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                                    {category.item_count || 0} dishes • {category.restaurant_count || 0} restaurants
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {foodResults.length > 0 && (
                                <div className="page-shell">
                                    <div className="section-header" style={{ marginBottom: 0 }}>
                                        <h3 className="section-title" style={{ marginBottom: 0, fontSize: '1rem' }}>Dishes</h3>
                                        <span className="badge badge-accent"><UtensilsCrossed size={12} /> {foodResults.length}</span>
                                    </div>
                                    {foodResults.map((item, index) => (
                                        <motion.button
                                            key={item.id}
                                            initial={{ opacity: 0, y: 15 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.04 }}
                                            className="card"
                                            onClick={() => navigate(`/restaurant/${item.restaurant_slug}`)}
                                            style={{ padding: 14, textAlign: 'left' }}
                                        >
                                            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                                {item.image ? (
                                                    <img
                                                        src={item.image}
                                                        alt={item.name}
                                                        loading="lazy"
                                                        style={{ width: 72, height: 72, borderRadius: 16, objectFit: 'cover', flexShrink: 0 }}
                                                    />
                                                ) : (
                                                    <div style={{ width: 72, height: 72, borderRadius: 16, background: 'var(--bg-chip)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-strong)', flexShrink: 0 }}>
                                                        <UtensilsCrossed size={22} />
                                                    </div>
                                                )}
                                                <div style={{ minWidth: 0, flex: 1 }}>
                                                    <p style={{ fontWeight: 800, fontSize: '1rem', lineHeight: 1.2 }}>{item.name}</p>
                                                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 4 }}>{item.restaurant_name}</p>
                                                    <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: 2 }}>{item.category_name || item.description || 'Menu item'}</p>
                                                    <p style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--accent-strong)', marginTop: 8 }}>
                                                        ₹{Number(item.effective_price || item.discount_price || item.price || 0).toFixed(2)}
                                                    </p>
                                                </div>
                                            </div>
                                        </motion.button>
                                    ))}
                                </div>
                            )}

                            {restaurantResults.length > 0 && (
                                <div className="page-shell">
                                    <div className="section-header" style={{ marginBottom: 0 }}>
                                        <h3 className="section-title" style={{ marginBottom: 0, fontSize: '1rem' }}>Restaurants</h3>
                                        <span className="badge badge-accent"><Store size={12} /> {restaurantResults.length}</span>
                                    </div>
                                    {restaurantResults.map((restaurant, index) => (
                                <motion.div key={restaurant.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06 }}>
                                    <RestaurantCard restaurant={restaurant} />
                                </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <Search />
                            <h3>No results found</h3>
                            <p>Try another dish, cuisine, or restaurant name.</p>
                        </div>
                    )}
                </motion.div>
            )}
        </div>
    );
};

export default SearchPage;
