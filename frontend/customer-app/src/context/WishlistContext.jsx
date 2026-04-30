import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { customersAPI } from '../services/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const WishlistContext = createContext(null);

export const useWishlist = () => {
    const context = useContext(WishlistContext);
    if (!context) throw new Error('useWishlist must be used within WishlistProvider');
    return context;
};

export const WishlistProvider = ({ children }) => {
    const [wishlist, setWishlist] = useState([]);
    const { isAuthenticated, user } = useAuth();
    const [loading, setLoading] = useState(false);
    const storedTokens = (() => {
        try {
            return JSON.parse(localStorage.getItem('tokens') || '{}');
        } catch {
            return {};
        }
    })();
    const hasTokens = Boolean(storedTokens?.access || storedTokens?.refresh);

    const fetchWishlist = useCallback(async () => {
        if (!isAuthenticated || !hasTokens || user?.role !== 'customer') {
            setWishlist([]);
            return;
        }
        setLoading(true);
        try {
            const { data } = await customersAPI.getWishlist();
            setWishlist(data.results || data || []);
        } catch (error) {
            console.error('Failed to fetch wishlist', error);
        } finally {
            setLoading(false);
        }
    }, [hasTokens, isAuthenticated, user?.role]);

    useEffect(() => {
        fetchWishlist();
    }, [fetchWishlist]);

    const toggleWishlist = async (restaurantId, restaurantName) => {
        if (!isAuthenticated || user?.role !== 'customer') {
            toast.error('Customer account required to save favorites');
            return false;
        }

        try {
            const { data } = await customersAPI.toggleWishlist({ restaurant_id: restaurantId });

            if (data.status === 'added') {
                toast.success(`${restaurantName} added to favorites! 💖`);
                fetchWishlist(); 
                return true;
            } else {
                toast.success(`${restaurantName} removed from favorites 💔`);
                setWishlist(prev => prev.filter(w => w.restaurant !== restaurantId));
                return false;
            }
        } catch (err) {
            toast.error('Failed to update wishlist');
            return null;
        }
    };

    const isWishlisted = useCallback((restaurantId) => {
        return wishlist.some(w => w.restaurant === restaurantId);
    }, [wishlist]);

    return (
        <WishlistContext.Provider value={{
            wishlist,
            loading,
            toggleWishlist,
            isWishlisted,
            refreshWishlist: fetchWishlist
        }}>
            {children}
        </WishlistContext.Provider>
    );
};
