import axios from 'axios';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.pecafoo.com/api';
const api = axios.create({ baseURL: API_BASE_URL, headers: { 'Content-Type': 'application/json' } });
const clearDeliveryAuth = () => {
    localStorage.removeItem('delivery_user');
    localStorage.removeItem('delivery_tokens');
    window.dispatchEvent(new Event('delivery-auth-expired'));
};
const sendFormData = (method, url, data) => {
    const isForm = data instanceof FormData;
    return api({
        method,
        url,
        data,
        headers: isForm ? { 'Content-Type': 'multipart/form-data' } : undefined,
    });
};
api.interceptors.request.use((c) => {
    const t = JSON.parse(localStorage.getItem('delivery_tokens') || '{}');
    if (t.access) c.headers.Authorization = `Bearer ${t.access}`;
    return c;
});
api.interceptors.response.use(r => r, async (e) => {
    const c = e.config;
    if (e.response?.status === 401 && !c._retry) {
        c._retry = true;
        try {
            const t = JSON.parse(localStorage.getItem('delivery_tokens') || '{}');
            if (t.refresh) {
                const { data } = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, { refresh: t.refresh });
                localStorage.setItem('delivery_tokens', JSON.stringify({ ...t, access: data.access }));
                c.headers.Authorization = `Bearer ${data.access}`;
                return api(c);
            }
        } catch {
            clearDeliveryAuth();
            window.location.href = '/login';
        }

        clearDeliveryAuth();
        window.location.href = '/login';
    }

    return Promise.reject(e);
});
export const authAPI = { login: (d) => api.post('/auth/login/', d), register: (d) => api.post('/auth/register/', d), logout: (d) => api.post('/auth/logout/', d), completeLogin: (d) => api.post('/auth/complete-login/', d), partnerOnboard: (d) => api.post('/auth/partner/onboard/', d) };
export const deliveryAPI = {
    getProfile: () => api.get('/delivery/profile/'),
    updateProfile: (d) => sendFormData('patch', '/delivery/profile/', d),
    toggleAvailability: (d) => api.post('/delivery/availability/', d),
    updateLocation: (d) => api.post('/delivery/location/', d),
    getEarnings: () => api.get('/delivery/earnings/'),
    getEarningsSummary: () => api.get('/delivery/earnings/summary/'),
    getTodayEarnings: () => api.get('/delivery/partner/earnings/today/'),
    acceptOrder: (id) => api.post(`/delivery/orders/${id}/accept/`),
    declineOrder: (id) => api.post(`/delivery/orders/${id}/decline/`)
};

export const ordersAPI = {
    getDeliveryOrders: () => api.get('/orders/delivery/'),
    getOrder: (id) => api.get(`/orders/${id}/`),
    updateStatus: (id, d) => api.patch(`/orders/${id}/status/`, d),
    getAvailableOrders: () => api.get('/orders/available-for-delivery/')
};

export const locationsAPI = {
    getOrderRoute: (id) => api.get(`/locations/orders/${id}/route/`)
};

export const analyticsAPI = {
    getDeliveryStats: () => api.get('/analytics/dashboard/'),
    getSurgePricing: () => api.get('/analytics/surge/'),
    getSuggestedZone: () => api.get('/analytics/driver/suggested-zone/')
};

export default api;
