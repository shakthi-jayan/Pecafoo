import axios from 'axios';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const api = axios.create({ baseURL: API_BASE_URL, headers: { 'Content-Type': 'application/json' } });
api.interceptors.request.use((c) => { const t = JSON.parse(localStorage.getItem('admin_tokens') || '{}'); if (t.access) c.headers.Authorization = `Bearer ${t.access}`; return c; });
api.interceptors.response.use(r => r, async (e) => { const c = e.config; if (e.response?.status === 401 && !c._retry) { c._retry = true; try { const t = JSON.parse(localStorage.getItem('admin_tokens') || '{}'); if (t.refresh) { const { data } = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, { refresh: t.refresh }); localStorage.setItem('admin_tokens', JSON.stringify({ ...t, access: data.access })); c.headers.Authorization = `Bearer ${data.access}`; return api(c); } } catch { localStorage.clear(); window.location.href = '/login'; } } return Promise.reject(e); });

export const authAPI = {
    login: (d) => api.post('/auth/login/', d),
    register: (d) => api.post('/auth/register/', d),
    logout: (d) => api.post('/auth/logout/', d),
    getProfile: () => api.get('/auth/profile/'),
};

export const restaurantsAPI = {
    getAll: (p) => api.get('/restaurants/', { params: p }),
    getDetail: (slug) => api.get(`/restaurants/${slug}/`),
    getVerifications: () => api.get('/restaurants/admin/'),
    reviewVerification: (id, data) => api.patch(`/restaurants/admin/${id}/`, data),
};

export const ordersAPI = {
    getAll: () => api.get('/orders/admin/'),
    getOrder: (id) => api.get(`/orders/${id}/`),
    updateStatus: (id, d) => api.patch(`/orders/${id}/status/`, d),
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
