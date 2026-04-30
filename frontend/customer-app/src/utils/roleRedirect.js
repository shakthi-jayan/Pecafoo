const ROLE_URLS = {
    customer: import.meta.env.VITE_CUSTOMER_APP_URL || 'http://localhost:5173',
    restaurant: import.meta.env.VITE_RESTAURANT_APP_URL || 'http://localhost:5174',
    delivery: import.meta.env.VITE_DELIVERY_APP_URL || 'http://localhost:5175',
    admin: import.meta.env.VITE_ADMIN_APP_URL || 'http://localhost:5176',
};

export function getRoleAppUrl(role) {
    return ROLE_URLS[role] || ROLE_URLS.customer;
}

export function redirectToRoleApp(role, fallbackPath = '/') {
    const baseUrl = getRoleAppUrl(role);
    const target = new URL(fallbackPath, baseUrl).toString();
    window.location.assign(target);
}
