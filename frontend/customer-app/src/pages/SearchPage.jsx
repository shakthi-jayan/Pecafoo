import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, X, TrendingUp, UtensilsCrossed, Store, Tags } from 'lucide-react';
import { restaurantsAPI } from '../services/api';
import RestaurantCard from '../components/RestaurantCard';
import { getImageProps } from '../utils/imageUtils'; // ✅ NEW

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
            .then(({ data }) => setPlatformCategories(Array.isArray(data) ? data : (data?.results || [])))
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
        ? (Array.isArray(platformCategories) ? platformCategories : []).filter((c) =>
            c.name?.toLowerCase().includes(normalizedQuery)
        )
        : [];

    const totalResults =
        restaurantResults.length +
        foodResults.length +
        categoryResults.length;

    return (
        <div className="page search-shell">

            {/* SEARCH BAR */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <div className="search-bar">
                    <Search size={20} />
                    <input
                        ref={inputRef}
                        placeholder="Search restaurants, cuisines..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    {query && (
                        <button onClick={() => setQuery('')}>
                            <X size={18} />
                        </button>
                    )}
                </div>
            </motion.div>

            {/* TRENDING */}
            {!searched && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <h3>Trending</h3>
                    <div className="trend-row">
                        {platformCategories.slice(0, 10).map((cat) => (
                            <button key={cat.name} onClick={() => setQuery(cat.name)}>
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* LOADING */}
            {loading && <div className="skeleton h-40" />}

            {/* RESULTS */}
            {searched && !loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

                    <p>{totalResults} results for "{query}"</p>

                    {/* FOOD RESULTS */}
                    {foodResults.length > 0 && (
                        <div>
                            <h3>Dishes</h3>

                            {foodResults.map((item, index) => (
                                <motion.button
                                    key={item.id}
                                    onClick={() => navigate(`/restaurant/${item.restaurant_slug}`)}
                                    className="card"
                                >
                                    <div style={{ display: 'flex', gap: 12 }}>

                                        {/* ✅ FIXED IMAGE */}
                                        <img
                                            {...getImageProps(item.image, 'menu', 100)}
                                            style={{
                                                width: 72,
                                                height: 72,
                                                borderRadius: 16,
                                                objectFit: 'cover',
                                            }}
                                        />

                                        <div>
                                            <p>{item.name}</p>
                                            <p>{item.restaurant_name}</p>
                                            <p>₹{item.price}</p>
                                        </div>
                                    </div>
                                </motion.button>
                            ))}
                        </div>
                    )}

                    {/* RESTAURANTS */}
                    {restaurantResults.length > 0 && (
                        <div>
                            <h3>Restaurants</h3>

                            {restaurantResults.map((r) => (
                                <RestaurantCard key={r.id} restaurant={r} />
                            ))}
                        </div>
                    )}

                    {/* EMPTY */}
                    {totalResults === 0 && (
                        <div>
                            <Search />
                            <p>No results</p>
                        </div>
                    )}
                </motion.div>
            )}
        </div>
    );
};

export default SearchPage;
