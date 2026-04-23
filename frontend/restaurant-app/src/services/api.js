
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const api = axios.create({ baseURL: API_BASE_URL, headers: { 'Content-Type': 'application/json' } });


const sendFormData = (method, url, data) => {
    const isForm = data instanceof FormData;
    return api({
        method,
        url,
        data,
        headers: isForm ? { 'Content-Type': 'multipart/form-data' } : undefined,
    });
};

api.interceptors.request.use((config) => {
    const tokens = JSON.parse(localStorage.getItem('restaurant_tokens') || '{}');
    if (tokens.access) config.headers.Authorization = `Bearer ${tokens.access}`;
    return config;
});

api.interceptors.response.use(
    (res) => res,
    async (error) => {
        const req = error.config;
        if (error.response?.status === 401 && !req._retry) {
            req._retry = true;
            try {
                const tokens = JSON.parse(localStorage.getItem('restaurant_tokens') || '{}');
                if (tokens.refresh) {
                    const { data } = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, { refresh: tokens.refresh });
                    localStorage.setItem('restaurant_tokens', JSON.stringify({ ...tokens, access: data.access }));
                    req.headers.Authorization = `Bearer ${data.access}`;
                    return api(req);
                }
            } catch { localStorage.removeItem('restaurant_tokens'); localStorage.removeItem('restaurant_user'); window.location.href = '/login'; }
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
    getMyRestaurants: () => api.get('/restaurants/my/'),
    createRestaurant: (data) => sendFormData('post', '/restaurants/my/', data),
    getRestaurant: (id) => api.get(`/restaurants/my/${id}/`),
    updateRestaurant: (id, data) => sendFormData('patch', `/restaurants/my/${id}/`, data),
    getCategories: (id) => api.get(`/restaurants/my/${id}/categories/`),
    createCategory: (id, data) => api.post(`/restaurants/my/${id}/categories/`, data),
    updateCategory: (rId, cId, data) => api.patch(`/restaurants/my/${rId}/categories/${cId}/`, data),
    deleteCategory: (rId, cId) => api.delete(`/restaurants/my/${rId}/categories/${cId}/`),
    getMenuItems: (id) => api.get(`/restaurants/my/${id}/items/`),
    createMenuItem: (id, data) => sendFormData('post', `/restaurants/my/${id}/items/`, data),
    updateMenuItem: (rId, iId, data) => sendFormData('patch', `/restaurants/my/${rId}/items/${iId}/`, data),
    deleteMenuItem: (rId, iId) => api.delete(`/restaurants/my/${rId}/items/${iId}/`),
};

export const ordersAPI = {
    getRestaurantOrders: () => api.get('/orders/restaurant/'),
    getOrder: (id) => api.get(`/orders/${id}/`),
    updateStatus: (id, data) => api.patch(`/orders/${id}/status/`, data),
};

export default api;
