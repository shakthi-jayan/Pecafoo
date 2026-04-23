import { Star, Clock, IndianRupee, Heart, ArrowRight, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';

const RestaurantCard = ({ restaurant, showDistance = false }) => {
    const navigate = useNavigate();
    const { toggleWishlist, isWishlisted } = useWishlist();
    const wishlisted = isWishlisted(restaurant.id);

    const handleWishlistClick = (e) => {
        e.stopPropagation();
        toggleWishlist(restaurant.id, restaurant.name);
    };

    return (
        <div
            className="restaurant-card"
            onClick={() => navigate(`/restaurant/${restaurant.slug}`)}
            role="button"
            tabIndex={0}
            id={`restaurant-${restaurant.id}`}
        >
            {restaurant.cover_image ? (
                <img
                    src={restaurant.cover_image}
                    alt={restaurant.name}
                    className="restaurant-card-image"
                    loading="lazy"
                />
            ) : (
                <div
                    className="restaurant-card-image"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '2.4rem',
                    }}
                />
            )}

            <button
                onClick={handleWishlistClick}
                className="wishlist-btn"
                style={{ color: wishlisted ? '#f43f5e' : 'var(--text-secondary)' }}
            >
                <Heart size={20} fill={wishlisted ? '#f43f5e' : 'transparent'} strokeWidth={wishlisted ? 0 : 2} />
            </button>

            <div className="restaurant-card-body">
                <div className="restaurant-card-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {restaurant.logo && (
                            <img 
                                src={restaurant.logo} 
                                alt={`${restaurant.name} logo`}
                                style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border)' }} 
                            />
                        )}
                        <div>
                            <h3 className="restaurant-card-name" style={{ margin: 0 }}>{restaurant.name}</h3>
                            <p className="restaurant-card-cuisine" style={{ margin: 0, fontSize: '0.8rem' }}>{restaurant.cuisine_type}</p>
                        </div>
                    </div>
                    {restaurant.is_featured && (
                        <span className="badge badge-accent">Featured</span>
                    )}
                </div>

                <div className="restaurant-card-meta">
                    <span className="rating">
                        <Star size={14} fill="currentColor" />
                        {restaurant.average_rating > 0 ? restaurant.average_rating : 'New'}
                    </span>
                    <span>
                        <Clock size={14} />
                        {restaurant.average_delivery_time} min
                    </span>
                    {showDistance && restaurant.distance_km != null && (
                        <span style={{ color: 'var(--accent-strong)' }}>
                            <MapPin size={14} />
                            {restaurant.distance_km} km
                        </span>
                    )}
                    {restaurant.minimum_order_amount > 0 && (
                        <span>
                            <IndianRupee size={14} />
                            {restaurant.minimum_order_amount} min
                        </span>
                    )}
                </div>

                <div className="restaurant-card-footer">
                    <span style={{ color: restaurant.is_open ? 'var(--success)' : 'var(--danger)', fontSize: '0.78rem', fontWeight: 800 }}>
                        {restaurant.is_open ? 'Open now' : 'Closed'}
                    </span>
                    <span className="restaurant-cta">
                        View menu <ArrowRight size={14} />
                    </span>
                </div>
            </div>
        </div>
    );
};

export default RestaurantCard;
