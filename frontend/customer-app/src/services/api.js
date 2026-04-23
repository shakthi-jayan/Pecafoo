
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});


api.interceptors.request.use(
    (config) => {
        const tokens = JSON.parse(localStorage.getItem('tokens') || '{}');
        if (tokens.access) {
            config.headers.Authorization = `Bearer ${tokens.access}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);


api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const tokens = JSON.parse(localStorage.getItem('tokens') || '{}');
                if (tokens.refresh) {
                    const { data } = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
                        refresh: tokens.refresh,
                    });

                    const newTokens = { ...tokens, access: data.access };
                    localStorage.setItem('tokens', JSON.stringify(newTokens));
                    originalRequest.headers.Authorization = `Bearer ${data.access}`;

                    return api(originalRequest);
                }
            } catch (refreshError) {
                
                localStorage.removeItem('tokens');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    }
);




export const authAPI = {
    register: (data) => api.post('/auth/register/', data),
    login: (data) => api.post('/auth/login/', data),
    firebaseAuth: (data) => api.post('/auth/firebase/', data),
    requestPhoneOtp: (data) => api.post('/auth/phone/request-otp/', data),
    verifyPhoneOtp: (data) => api.post('/auth/phone/verify-otp/', data),
    logout: (data) => api.post('/auth/logout/', data),
    getProfile: () => api.get('/auth/profile/'),
    updateProfile: (data) => api.patch('/auth/profile/', data),
    changePassword: (data) => api.post('/auth/change-password/', data),
    forgotPassword: (data) => api.post('/auth/forgot-password/', data),
    resetPassword: (data) => api.post('/auth/reset-password/', data),
    registerFcmToken: (data) => api.post('/auth/fcm-token/', data),
    removeFcmToken: () => api.delete('/auth/fcm-token/'),
    requestEmailVerification: () => api.post('/auth/verify-email/request/'),
    confirmEmailVerification: (data) => api.post('/auth/verify-email/confirm/', data),
    exportAccountData: () => api.get('/auth/account/'),
    deleteAccount: (data) => api.delete('/auth/account/', { data }),
};




export const restaurantsAPI = {
    getAll: (params) => api.get('/restaurants/', { params }),
    getBySlug: (slug) => api.get(`/restaurants/${slug}/`),
    getReviews: (slug) => api.get(`/restaurants/${slug}/reviews/`),
    getNearby: (lat, lng, radius = 15) => api.get('/restaurants/', {
        params: { latitude: lat, longitude: lng, radius },
    }),
    getFoodItems: (params) => api.get('/restaurants/food-items/', { params }),
    getPlatformCategories: () => api.get('/restaurants/categories/platform/'),
    getCuisines: () => api.get('/restaurants/cuisines/'),
};




export const customersAPI = {
    getProfile: () => api.get('/customers/profile/'),
    updateProfile: (data) => api.patch('/customers/profile/', data),
    getAddresses: () => api.get('/customers/addresses/'),
    addAddress: (data) => api.post('/customers/addresses/', data),
    updateAddress: (id, data) => api.patch(`/customers/addresses/${id}/`, data),
    deleteAddress: (id) => api.delete(`/customers/addresses/${id}/`),
    getWishlist: () => api.get('/customers/wishlist/'),
    toggleWishlist: (data) => api.post('/customers/wishlist/toggle/', data),
    
    getFoodWishlist: () => api.get('/customers/food-wishlist/'),
    toggleFoodWishlist: (data) => api.post('/customers/food-wishlist/toggle/', data),
    
    getCart: () => api.get('/customers/cart/'),
    syncCart: (data) => api.post('/customers/cart/', data),
    clearCart: () => api.delete('/customers/cart/'),
};




export const ordersAPI = {
    create: (data) => api.post('/orders/create/', data),
    getMyOrders: (params) => api.get('/orders/my/', { params }),
    getOrder: (id) => api.get(`/orders/${id}/`),
    rateOrder: (id, data) => api.post(`/orders/${id}/rate/`, data),
    cancelOrder: (id) => api.post(`/orders/${id}/cancel/`),
    initiatePayment: (id, method) => api.post(`/orders/${id}/pay/`, { method }),
    verifyRazorpay: (data) => api.post(`/orders/razorpay/verify/`, data),
};




export const deliveryAPI = {
    getActiveOrders: () => api.get('/delivery/active-orders/'),
    estimateFee: (data) => api.post('/delivery/estimate/', data),
};




export const notificationsAPI = {
    getAll: () => api.get('/notifications/'),
    getUnreadCount: () => api.get('/notifications/unread-count/'),
    markRead: (id) => api.post(`/notifications/${id}/read/`),
    markAllRead: () => api.post('/notifications/mark-all-read/'),
};




export const promotionsAPI = {
    getAll: () => api.get('/promotions/'),
    apply: (data) => api.post('/promotions/apply/', data),
};




export const locationsAPI = {
    getServiceArea: () => api.get('/locations/service-area/'),
    checkServiceArea: (data) => api.post('/locations/check-service-area/', data),
    geocode: (address) => api.post('/locations/geocode/', { address }),
    reverseGeocode: (data) => api.post('/locations/reverse-geocode/', data),
    getOrderRoute: (orderId) => api.get(`/locations/orders/${orderId}/route/`),
};

export default api;

