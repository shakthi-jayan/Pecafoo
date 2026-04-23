import { useSyncExternalStore } from 'react';

const CART_KEY = 'pecafoo_cart';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const MEDIA_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, '');

/**
 * Normalize a media URL to be fully-qualified.
 * The backend now returns absolute Cloudinary/CDN URLs via SmartImageField,
 * so most values pass through unchanged. This handles edge cases for
 * cached cart data that may still contain relative paths.
 */
export function normalizeMediaUrl(value) {
    if (!value || typeof value !== 'string') return '';
    // Already absolute (Cloudinary / CDN / data URI / blob)
    if (/^(https?:|data:|blob:)/i.test(value)) return value;
    // Protocol-relative
    if (value.startsWith('//')) return `https:${value}`;
    // Relative path from legacy cached data
    return `${MEDIA_BASE_URL}${value.startsWith('/') ? value : `/${value}`}`;
}

function normalizeCartItem(item) {
    return {
        ...item,
        image: normalizeMediaUrl(item.image),
    };
}

function loadInitialState() {
    if (typeof localStorage === 'undefined') {
        return {
            items: [],
            activeRestaurantId: null,
            activeRestaurantName: null,
            activeRestaurantMeta: null,
            conflictPending: null,
            isCartDrawerOpen: false,
        };
    }
    try {
        const parsed = JSON.parse(localStorage.getItem(CART_KEY) || '{}');
        return {
            items: (parsed.items || []).map(normalizeCartItem),
            activeRestaurantId: parsed.activeRestaurantId || null,
            activeRestaurantName: parsed.activeRestaurantName || null,
            activeRestaurantMeta: parsed.activeRestaurantMeta || null,
            conflictPending: null,
            isCartDrawerOpen: false,
        };
    } catch {
        return {
            items: [],
            activeRestaurantId: null,
            activeRestaurantName: null,
            activeRestaurantMeta: null,
            conflictPending: null,
            isCartDrawerOpen: false,
        };
    }
}

const listeners = new Set();
let state = loadInitialState();

function emit() {
    if (typeof localStorage !== 'undefined') {
        localStorage.setItem(CART_KEY, JSON.stringify({
            items: state.items,
            activeRestaurantId: state.activeRestaurantId,
            activeRestaurantName: state.activeRestaurantName,
            activeRestaurantMeta: state.activeRestaurantMeta,
        }));
    }
    listeners.forEach((listener) => listener());
}

function setState(patch) {
    state = { ...state, ...patch };
    emit();
}

function itemCount(items = state.items) {
    return items.reduce((sum, item) => sum + item.quantity, 0);
}

function subtotal(items = state.items) {
    return items.reduce(
        (sum, item) => sum + (parseFloat(item.discount_price || item.price) || 0) * item.quantity,
        0,
    );
}

function addOrIncrementItem(items, item, restaurantId, restaurantName) {
    const existing = items.find((entry) => entry.id === item.id);
    if (existing) {
        return items.map((entry) =>
            entry.id === item.id ? { ...entry, quantity: entry.quantity + 1 } : entry
        );
    }

    return [
        ...items,
        normalizeCartItem({
            ...item,
            quantity: item.quantity || 1,
            restaurantId,
            restaurantName,
        }),
    ];
}

export const cartStore = {
    subscribe(listener) {
        listeners.add(listener);
        return () => listeners.delete(listener);
    },
    getState() {
        return state;
    },
    addItem(item, restaurantId, restaurantName, restaurantMeta = null) {
        if (state.items.length > 0 && state.activeRestaurantId !== restaurantId) {
            setState({
                conflictPending: {
                    item,
                    restaurantId,
                    restaurantName,
                    restaurantMeta,
                },
            });
            return { status: 'conflict' };
        }

        const updatedItems = addOrIncrementItem(state.items, item, restaurantId, restaurantName);
        setState({
            items: updatedItems,
            activeRestaurantId: restaurantId,
            activeRestaurantName: restaurantName,
            activeRestaurantMeta: restaurantMeta,
        });
        return { status: 'added' };
    },
    confirmReplaceCart() {
        if (!state.conflictPending) return null;
        const { item, restaurantId, restaurantName, restaurantMeta } = state.conflictPending;
        const updatedItems = addOrIncrementItem([], item, restaurantId, restaurantName);
        const previousRestaurantName = state.activeRestaurantName;
        setState({
            items: updatedItems,
            activeRestaurantId: restaurantId,
            activeRestaurantName: restaurantName,
            activeRestaurantMeta: restaurantMeta,
            conflictPending: null,
        });
        return { previousRestaurantName, restaurantName };
    },
    cancelConflict() {
        setState({ conflictPending: null });
    },
    removeItem(itemId) {
        const updatedItems = state.items.filter((item) => item.id !== itemId);
        setState({
            items: updatedItems,
            activeRestaurantId: updatedItems.length ? state.activeRestaurantId : null,
            activeRestaurantName: updatedItems.length ? state.activeRestaurantName : null,
            activeRestaurantMeta: updatedItems.length ? state.activeRestaurantMeta : null,
        });
    },
    updateQuantity(itemId, quantity) {
        if (quantity <= 0) {
            cartStore.removeItem(itemId);
            return;
        }
        const updatedItems = state.items.map((item) =>
            item.id === itemId ? { ...item, quantity } : item
        );
        setState({ items: updatedItems });
    },
    clearCart() {
        setState({
            items: [],
            activeRestaurantId: null,
            activeRestaurantName: null,
            activeRestaurantMeta: null,
            conflictPending: null,
        });
    },
    openCartDrawer() {
        setState({ isCartDrawerOpen: true });
    },
    closeCartDrawer() {
        setState({ isCartDrawerOpen: false });
    },
    itemCount,
    subtotal,
};

export function useCartStore(selector = (snapshot) => snapshot) {
    return useSyncExternalStore(
        cartStore.subscribe,
        () => selector(cartStore.getState()),
        () => selector(cartStore.getState()),
    );
}
