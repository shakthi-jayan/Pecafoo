import { createContext, useContext, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';
import { customersAPI } from '../services/api';
import { cartStore, useCartStore } from '../stores/useCartStore';

const CartContext = createContext(null);

export function useCart() {
    const context = useContext(CartContext);
    if (!context) throw new Error('useCart must be used within CartProvider');
    return context;
}

export function CartProvider({ children }) {
    const { isAuthenticated, user } = useAuth();
    const storeState = useCartStore((snapshot) => snapshot);
    const storedTokens = (() => {
        try {
            return JSON.parse(localStorage.getItem('tokens') || '{}');
        } catch {
            return {};
        }
    })();
    const hasTokens = Boolean(storedTokens?.access || storedTokens?.refresh);

    useEffect(() => {
        if (!isAuthenticated || !hasTokens || user?.role !== 'customer') return undefined;

        const timer = window.setTimeout(async () => {
            try {
                await customersAPI.syncCart({
                    items: storeState.items.map((item) => ({
                        menu_item_id: item.id,
                        name: item.name,
                        price: item.price,
                        discount_price: item.discount_price,
                        image: item.image,
                        food_type: item.food_type,
                        quantity: item.quantity,
                        restaurant_id: item.restaurantId,
                        restaurant_name: item.restaurantName,
                    })),
                    restaurant: storeState.activeRestaurantMeta,
                });
            } catch {
                
            }
        }, 500);

        return () => window.clearTimeout(timer);
    }, [hasTokens, isAuthenticated, storeState.activeRestaurantMeta, storeState.items, user?.role]);

    useEffect(() => {
        if (!isAuthenticated || !hasTokens || user?.role !== 'customer') return;

        const loadRemoteCart = async () => {
            try {
                const { data } = await customersAPI.getCart();
                const remoteItems = data?.items || [];
                if (!remoteItems.length || storeState.items.length) return;

                cartStore.clearCart();
                remoteItems.forEach((item) => {
                    cartStore.addItem(
                        {
                            id: item.id || item.menu_item_id,
                            name: item.name,
                            price: item.price,
                            discount_price: item.discount_price,
                            image: item.image,
                            food_type: item.food_type,
                            quantity: item.quantity,
                        },
                        data?.restaurant?.id,
                        data?.restaurant?.name,
                        data?.restaurant || null,
                    );
                });
            } catch {
                
            }
        };

        loadRemoteCart();
    }, [hasTokens, isAuthenticated, storeState.items.length, user?.role]);

    const value = {
        cartItems: storeState.items,
        restaurant: storeState.activeRestaurantMeta,
        activeRestaurantId: storeState.activeRestaurantId,
        activeRestaurantName: storeState.activeRestaurantName,
        itemCount: cartStore.itemCount(storeState.items),
        subtotal: cartStore.subtotal(storeState.items),
        conflictPending: storeState.conflictPending,
        isCartDrawerOpen: storeState.isCartDrawerOpen,
        loading: false,
        addToCart: (item, restaurantInfo) => {
            const result = cartStore.addItem(
                item,
                restaurantInfo.id,
                restaurantInfo.name,
                restaurantInfo,
            );
            if (result?.status === 'added') {
                toast.success('Added to cart');
            }
            if (result?.status === 'conflict') {
                cartStore.closeCartDrawer();
            }
            return result;
        },
        removeFromCart: (itemId) => {
            cartStore.removeItem(itemId);
            toast.success('Removed from cart');
        },
        updateQuantity: (itemId, quantity) => {
            cartStore.updateQuantity(itemId, quantity);
        },
        clearCart: () => {
            cartStore.clearCart();
        },
        confirmReplaceCart: () => {
            const result = cartStore.confirmReplaceCart();
            if (result?.previousRestaurantName) {
                toast.success(`Cart updated - items from ${result.previousRestaurantName} removed`);
            }
            return result;
        },
        cancelConflict: () => cartStore.cancelConflict(),
        openCartDrawer: () => cartStore.openCartDrawer(),
        closeCartDrawer: () => cartStore.closeCartDrawer(),
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
}
