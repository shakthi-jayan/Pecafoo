import axios from 'axios';

// ✅ Ensure proper base URL handling - now includes /api prefix
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({ 
    baseURL: API_BASE_URL, 
    headers: { 'Content-Type': 'application/json' } 
});

// Request interceptor for auth tokens
api.interceptors.request.use((config) => { 
    const tokens = JSON.parse(localStorage.getItem('admin_tokens') || '{}'); 
    if (tokens.access) {
        config.headers.Authorization = `Bearer ${tokens.access}`;
    }
    return config; 
});

// Response interceptor for token refresh
api.interceptors.response.use(
    response => response, 
    async (error) => { 
        const originalRequest = error.config; 
        
        if (error.response?.status === 401 && !originalRequest._retry) { 
            originalRequest._retry = true; 
            
            try { 
                const tokens = JSON.parse(localStorage.getItem('admin_tokens') || '{}'); 
                
                if (tokens.refresh) { 
                    const { data } = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, { 
                        refresh: tokens.refresh 
                    }); 
                    
                    localStorage.setItem('admin_tokens', JSON.stringify({ 
                        ...tokens, 
                        access: data.access 
                    })); 
                    
                    originalRequest.headers.Authorization = `Bearer ${data.access}`; 
                    return api(originalRequest); 
                } 
            } catch (refreshError) { 
                localStorage.clear(); 
                window.location.href = '/login'; 
            } 
        } 
        
        return Promise.reject(error); 
    }
);

export const authAPI = {
    login: (data) => api.post('/auth/login/', data),
    register: (data) => api.post('/auth/register/', data),
    logout: (data) => api.post('/auth/logout/', data),
    getProfile: () => api.get('/auth/profile/'),
};

export const restaurantsAPI = {
    getAll: (params) => api.get('/restaurants/', { params }),
    getDetail: (slug) => api.get(`/restaurants/${slug}/`),
    getPlatformCategories: () => api.get('/restaurants/categories/'),
    getVerifications: () => api.get('/restaurants/admin/'),
    reviewVerification: (id, data) => api.patch(`/restaurants/admin/${id}/`, data),
};

export const ordersAPI = {
    getAll: () => api.get('/orders/admin/'),
    getOrder: (id) => api.get(`/orders/${id}/`),
    updateStatus: (id, data) => api.patch(`/orders/${id}/status/`, data),
};

export const usersAPI = {
    getAll: () => api.get('/auth/users/'),
};

export const deliveryAPI = {
    getVerifications: () => api.get('/delivery/admin/profiles/'),
    reviewVerification: (id, data) => api.patch(`/delivery/admin/profiles/${id}/`, data),
    getPricingConfig: () => api.get('/delivery/admin/pricing/config/'),
    updatePricingConfig: (data) => api.put('/delivery/admin/pricing/config/', data),
    createSurge: (data) => api.post('/delivery/admin/pricing/surge/', data),
    updateSurge: (id, data) => api.patch(`/delivery/admin/pricing/surge/${id}/`, data),
    getIncentiveSlabs: () => api.get('/delivery/admin/pricing/slabs/'),
    createIncentiveSlab: (data) => api.post('/delivery/admin/pricing/slabs/', data),
    updateIncentiveSlab: (id, data) => api.patch(`/delivery/admin/pricing/slabs/${id}/`, data),
    deleteIncentiveSlab: (id) => api.delete(`/delivery/admin/pricing/slabs/${id}/`),
};

export const analyticsAPI = {
    getDashboard: () => api.get('/analytics/dashboard/'),
    getDemandForecast: () => api.get('/analytics/demand-forecast/'),
    getSurgePricing: () => api.get('/analytics/surge/'),
    getFraudScore: (userId) => api.get(`/analytics/fraud-score/${userId}/`),
};

export const locationsAPI = {
    getServiceArea: () => api.get('/locations/service-area/'),
    createServiceArea: (data) => api.post('/locations/service-area/create/', data),
    updateServiceArea: (id, data) => api.put(`/locations/service-area/${id}/`, data),
    getActivePartners: () => api.get('/locations/active-partners/'),
    getDeliveryPath: (orderId) => api.get(`/locations/delivery-path/${orderId}/`),
    checkServiceArea: (data) => api.post('/locations/check-service-area/', data),
};

export default api;
