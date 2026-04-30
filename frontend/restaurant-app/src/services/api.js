import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || '/ws';

// Get CSRF token from cookies
export const getCSRFToken = () => {
  const name = 'csrftoken';
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [key, value] = cookie.trim().split('=');
    if (key === name) return decodeURIComponent(value);
  }
  return null;
};

// Get CSRF token from meta tag (alternative method)
export const getCSRFTokenFromMeta = () => {
  const metaTag = document.querySelector('meta[name="csrf-token"]');
  return metaTag ? metaTag.getAttribute('content') : null;
};

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // CRITICAL for cookies and CSRF
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add JWT token AND CSRF token
api.interceptors.request.use(
  (config) => {
    // Add JWT token if available
    const tokens = JSON.parse(localStorage.getItem('restaurant_tokens') || '{}');
    if (tokens.access) {
      config.headers.Authorization = `Bearer ${tokens.access}`;
    }
    
    // Add CSRF token for state-changing requests
    const csrfToken = getCSRFToken();
    if (csrfToken && ['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase())) {
      config.headers['X-CSRFToken'] = csrfToken;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized - Token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const tokens = JSON.parse(localStorage.getItem('restaurant_tokens') || '{}');
        if (tokens.refresh) {
          const { data } = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
            refresh: tokens.refresh,
          });

          const newTokens = { ...tokens, access: data.access };
          localStorage.setItem('restaurant_tokens', JSON.stringify(newTokens));
          originalRequest.headers.Authorization = `Bearer ${data.access}`;
          
          // Retry the original request
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed - clear tokens and redirect to login
        localStorage.removeItem('restaurant_tokens');
        localStorage.removeItem('restaurant_user');
        window.location.href = '/login';
      }
    }
    
    // Handle 403 CSRF errors
    if (error.response?.status === 403) {
      const responseData = error.response?.data;
      if (responseData?.includes('CSRF') || responseData?.includes('csrf')) {
        console.error('CSRF Verification Failed. Refreshing page...');
        // Optionally refresh the page to get new CSRF token
        // window.location.reload();
      }
    }

    return Promise.reject(error);
  }
);

// ============================================
// AUTH API
// ============================================
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
  
  // CSRF token endpoint (call this on app start)
  getCSRFToken: () => api.get('/auth/csrf/'),
};

// ============================================
// RESTAURANTS API - COMPLETE WITH ALL METHODS
// ============================================
export const restaurantsAPI = {
  // Public endpoints (no auth required)
  getAll: (params) => api.get('/restaurants/', { params }),
  getBySlug: (slug) => api.get(`/restaurants/${slug}/`),
  getReviews: (slug) => api.get(`/restaurants/${slug}/reviews/`),
  getNearby: (lat, lng, radius = 15) => api.get('/restaurants/', {
    params: { latitude: lat, longitude: lng, radius },
  }),
  getFoodItems: (params) => api.get('/restaurants/food-items/', { params }),
  getPlatformCategories: () => api.get('/restaurants/categories/platform/'),
  getCuisines: () => api.get('/restaurants/cuisines/'),
  
  // Restaurant owner endpoints (requires auth)
  getMyRestaurants: () => api.get('/restaurants/my/'),
  getRestaurant: (id) => api.get(`/restaurants/my/${id}/`),
  
  // Create restaurant - IMPORTANT: This is the missing method
  createRestaurant: (data) => {
    // If FormData is passed, let axios set the correct content type
    if (data instanceof FormData) {
      return api.post('/restaurants/my/', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }
    return api.post('/restaurants/my/', data);
  },
  
  updateRestaurant: (id, data) => {
    if (data instanceof FormData) {
      return api.patch(`/restaurants/my/${id}/`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }
    return api.patch(`/restaurants/my/${id}/`, data);
  },
  
  deleteRestaurant: (id) => api.delete(`/restaurants/my/${id}/`),
  
  // Menu management
  getCategories: (restaurantId) => api.get(`/restaurants/my/${restaurantId}/categories/`),
  createCategory: (restaurantId, data) => api.post(`/restaurants/my/${restaurantId}/categories/`, data),
  updateCategory: (restaurantId, categoryId, data) => api.patch(`/restaurants/my/${restaurantId}/categories/${categoryId}/`, data),
  deleteCategory: (restaurantId, categoryId) => api.delete(`/restaurants/my/${restaurantId}/categories/${categoryId}/`),
  
  getMenuItems: (restaurantId) => api.get(`/restaurants/my/${restaurantId}/items/`),
  createMenuItem: (restaurantId, data) => {
    if (data instanceof FormData) {
      return api.post(`/restaurants/my/${restaurantId}/items/`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }
    return api.post(`/restaurants/my/${restaurantId}/items/`, data);
  },
  updateMenuItem: (restaurantId, itemId, data) => {
    if (data instanceof FormData) {
      return api.patch(`/restaurants/my/${restaurantId}/items/${itemId}/`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }
    return api.patch(`/restaurants/my/${restaurantId}/items/${itemId}/`, data);
  },
  deleteMenuItem: (restaurantId, itemId) => api.delete(`/restaurants/my/${restaurantId}/items/${itemId}/`),
  
  // Admin endpoints (requires admin/superuser)
  adminGetAll: () => api.get('/restaurants/admin/'),
  adminGetRestaurant: (id) => api.get(`/restaurants/admin/${id}/`),
  adminUpdateRestaurant: (id, data) => api.patch(`/restaurants/admin/${id}/`, data),
  adminDeleteRestaurant: (id) => api.delete(`/restaurants/admin/${id}/`),
  adminApproveRestaurant: (id) => api.post(`/restaurants/admin/${id}/approve/`),
  adminRejectRestaurant: (id, reason) => api.post(`/restaurants/admin/${id}/reject/`, { reason }),
};

// ============================================
// RESTAURANT ORDERS API
// ============================================
export const restaurantOrdersAPI = {
  getRestaurantOrders: (params) => api.get('/orders/restaurant/', { params }),
  getOrderDetails: (id) => api.get(`/orders/restaurant/${id}/`),
  updateOrderStatus: (id, data) => api.patch(`/orders/restaurant/${id}/status/`, data),
  acceptOrder: (id) => api.post(`/orders/restaurant/${id}/accept/`),
  rejectOrder: (id, reason) => api.post(`/orders/restaurant/${id}/reject/`, { reason }),
  markReady: (id) => api.post(`/orders/restaurant/${id}/ready/`),
  getOrderHistory: (params) => api.get('/orders/restaurant/history/', { params }),
  getTodayOrders: () => api.get('/orders/restaurant/today/'),
  getOrderStats: () => api.get('/orders/restaurant/stats/'),
};

// ============================================
// CUSTOMERS API
// ============================================
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

// ============================================
// ORDERS API
// ============================================
export const ordersAPI = {
  create: (data) => api.post('/orders/create/', data),
  getMyOrders: (params) => api.get('/orders/my/', { params }),
  getOrder: (id) => api.get(`/orders/${id}/`),
  rateOrder: (id, data) => api.post(`/orders/${id}/rate/`, data),
  cancelOrder: (id) => api.post(`/orders/${id}/cancel/`),
  initiatePayment: (id, method) => api.post(`/orders/${id}/pay/`, { method }),
  verifyRazorpay: (data) => api.post(`/orders/razorpay/verify/`, data),
};

// ============================================
// DELIVERY API
// ============================================
export const deliveryAPI = {
  getActiveOrders: () => api.get('/delivery/active-orders/'),
  estimateFee: (data) => api.post('/delivery/estimate/', data),
  acceptOrder: (id) => api.post(`/delivery/orders/${id}/accept/`),
  updateLocation: (data) => api.post('/delivery/location/update/', data),
  markDelivered: (id) => api.post(`/delivery/orders/${id}/deliver/`),
  getEarnings: (params) => api.get('/delivery/earnings/', { params }),
};

// ============================================
// NOTIFICATIONS API
// ============================================
export const notificationsAPI = {
  getAll: () => api.get('/notifications/'),
  getUnreadCount: () => api.get('/notifications/unread-count/'),
  markRead: (id) => api.post(`/notifications/${id}/read/`),
  markAllRead: () => api.post('/notifications/mark-all-read/'),
};

// ============================================
// PROMOTIONS API
// ============================================
export const promotionsAPI = {
  getAll: () => api.get('/promotions/'),
  apply: (data) => api.post('/promotions/apply/', data),
  getRestaurantPromotions: () => api.get('/promotions/restaurant/'),
  createPromotion: (data) => api.post('/promotions/restaurant/', data),
  updatePromotion: (id, data) => api.patch(`/promotions/restaurant/${id}/`, data),
  deletePromotion: (id) => api.delete(`/promotions/restaurant/${id}/`),
};

// ============================================
// LOCATIONS API
// ============================================
export const locationsAPI = {
  getServiceArea: () => api.get('/locations/service-area/'),
  checkServiceArea: (data) => api.post('/locations/check-service-area/', data),
  geocode: (address) => api.post('/locations/geocode/', { address }),
  reverseGeocode: (data) => api.post('/locations/reverse-geocode/', data),
  getOrderRoute: (orderId) => api.get(`/locations/orders/${orderId}/route/`),
};

// ============================================
// ANALYTICS API (for restaurant dashboard)
// ============================================
export const analyticsAPI = {
  getDashboardStats: () => api.get('/analytics/restaurant/dashboard/'),
  getSalesReport: (params) => api.get('/analytics/restaurant/sales/', { params }),
  getTopItems: (params) => api.get('/analytics/restaurant/top-items/', { params }),
  getCustomerInsights: () => api.get('/analytics/restaurant/customers/'),
  exportReport: (type, params) => api.get(`/analytics/restaurant/export/${type}/`, { 
    params,
    responseType: 'blob' 
  }),
};

// ============================================
// WEBSOCKET CONNECTION
// ============================================
export const getWebSocketUrl = (path) => {
  const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsBase = WS_BASE_URL === '/ws' ? `${wsProtocol}//${window.location.host}/ws` : WS_BASE_URL;
  return `${wsBase}${path}`;
};

export const connectRestaurantWebSocket = (restaurantId, token) => {
  const wsUrl = getWebSocketUrl(`/restaurant/${restaurantId}/?token=${token}`);
  return new WebSocket(wsUrl);
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Function to initialize CSRF token on app start
export const initializeCSRF = async () => {
  try {
    await authAPI.getCSRFToken();
    console.log('CSRF token initialized');
  } catch (error) {
    console.error('Failed to initialize CSRF:', error);
  }
};

// Function to check if user is authenticated
export const isAuthenticated = () => {
  const tokens = JSON.parse(localStorage.getItem('restaurant_tokens') || '{}');
  return !!tokens.access;
};

// Function to get current user
export const getCurrentUser = () => {
  const user = localStorage.getItem('restaurant_user');
  return user ? JSON.parse(user) : null;
};

// Function to get user role
export const getUserRole = () => {
  const user = getCurrentUser();
  return user?.role || null;
};

// Function to logout user
export const logoutUser = async () => {
  try {
    const tokens = JSON.parse(localStorage.getItem('restaurant_tokens') || '{}');
    if (tokens.refresh) {
      await authAPI.logout({ refresh: tokens.refresh });
    }
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    localStorage.removeItem('restaurant_tokens');
    localStorage.removeItem('restaurant_user');
    window.location.href = '/login';
  }
};

// Helper to format restaurant data before sending
export const formatRestaurantData = (data) => {
  const formData = new FormData();
  
  Object.keys(data).forEach(key => {
    if (data[key] !== null && data[key] !== undefined) {
      if (key === 'logo' || key === 'cover_image' || key === 'business_license' || 
          key === 'food_safety_certificate' || key === 'owner_id_proof') {
        if (data[key] instanceof File) {
          formData.append(key, data[key]);
        }
      } else if (typeof data[key] === 'object') {
        formData.append(key, JSON.stringify(data[key]));
      } else {
        formData.append(key, data[key]);
      }
    }
  });
  
  return formData;
};

export default api;
