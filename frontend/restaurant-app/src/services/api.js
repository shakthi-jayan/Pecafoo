import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
const WS_BASE_URL = import.meta.env.VITE_WS_URL || '/ws';

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
    const tokens = JSON.parse(localStorage.getItem('tokens') || '{}');
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
        const tokens = JSON.parse(localStorage.getItem('tokens') || '{}');
        if (tokens.refresh) {
          const { data } = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
            refresh: tokens.refresh,
          });

          const newTokens = { ...tokens, access: data.access };
          localStorage.setItem('tokens', JSON.stringify(newTokens));
          originalRequest.headers.Authorization = `Bearer ${data.access}`;
          
          // Retry the original request
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed - clear tokens and redirect to login
        localStorage.removeItem('tokens');
        localStorage.removeItem('user');
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
// RESTAURANTS API
// ============================================
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
  const tokens = JSON.parse(localStorage.getItem('tokens') || '{}');
  return !!tokens.access;
};

// Function to get current user
export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Function to logout user
export const logoutUser = async () => {
  try {
    const tokens = JSON.parse(localStorage.getItem('tokens') || '{}');
    if (tokens.refresh) {
      await authAPI.logout({ refresh: tokens.refresh });
    }
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    localStorage.removeItem('tokens');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }
};

export default api;
