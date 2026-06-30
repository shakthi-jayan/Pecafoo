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
            className="premium-restaurant-card" style={{ backgroundColor: "var(--color-bg-card)", borderRadius: "var(--radius-card)", overflow: "hidden", boxShadow: "var(--shadow-md)", cursor: "pointer", display: "flex", flexDirection: "column", position: "relative", border: "1px solid var(--color-border)", transition: "transform 0.2s ease, box-shadow 0.2s ease" }}
            onClick={() => navigate(`/restaurant/${restaurant.slug}`)}
            role="button"
            tabIndex={0}
            id={`restaurant-${restaurant.id}`}
        >
            <div style={{ width: "100%", height: "160px", backgroundColor: "var(--color-divider)", position: "relative" }}>
                {restaurant.cover_image ? (
                    <img src={restaurant.cover_image} alt={restaurant.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} loading="lazy" />
                ) : (
                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "40px", color: "var(--color-text-tertiary)" }}><span>{restaurant.name?.charAt(0)}</span></div>
                )}
                <div style={{ display: "none" }} />
                <span className={`restaurant-open-pill ${restaurant.is_open ? 'is-open' : ''}`}>{restaurant.is_open ? 'Open' : 'Closed'}</span>
                <button onClick={handleWishlistClick} style={{ position: "absolute", top: "var(--space-3)", right: "var(--space-3)", backgroundColor: "rgba(255,255,255,0.9)", backdropFilter: "blur(10px)", borderRadius: "50%", padding: "6px", display: "flex", border: "none", cursor: "pointer", zIndex: 2, boxShadow: "var(--shadow-sm)", color: wishlisted ? '#f43f5e' : 'var(--text-secondary)' }} aria-label={wishlisted ? `Remove ${restaurant.name} from favorites` : `Add ${restaurant.name} to favorites`}>
                    <Heart size={20} fill={wishlisted ? '#f43f5e' : 'transparent'} strokeWidth={wishlisted ? 0 : 2} />
                </button>
            </div>

            <div style={{ padding: "var(--space-4)" }}>
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
                            <h3 style={{ fontSize: "var(--text-h3)", margin: "0 0 var(--space-1) 0", fontWeight: 600 }}>{restaurant.name}</h3>
                            <p style={{ color: "var(--color-text-secondary)", fontSize: "var(--text-caption)", margin: 0 }}>{restaurant.cuisine_type}</p>
                        </div>
                    </div>
                    {restaurant.is_featured && (
                        <span style={{ backgroundColor: "var(--brand-customer)", color: "#fff", padding: "4px 8px", borderRadius: "12px", fontSize: "11px", fontWeight: 700 }}>Featured</span>
                    )}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", marginTop: "var(--space-3)", fontSize: "var(--text-caption)", color: "var(--color-text-secondary)", fontWeight: 600 }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--color-text-primary)" }}>
                        <Star size={14} fill="#FFCC00" color="#FFCC00" />
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

                <div style={{ display: "none" }}>
                    <span className="restaurant-delivery-note">Delivery details at checkout</span>
                    <span className="restaurant-cta">
                        View menu <ArrowRight size={14} />
                    </span>
                </div>
            </div>
        </div>
    );
};

export { RestaurantCard };
export default RestaurantCard;
