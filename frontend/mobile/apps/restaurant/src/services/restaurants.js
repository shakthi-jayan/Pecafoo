import { apiClient, sendFormData } from '@pecafoo/api';

/**
 * Restaurant management API — mirrors frontend/restaurant-app/src/services/api.js restaurantsAPI
 */
const restaurantsService = {
  getMyRestaurants: () => apiClient.get('/restaurants/my/'),
  createRestaurant: (data) => sendFormData(apiClient, 'post', '/restaurants/my/', data),
  getRestaurant: (id) => apiClient.get(`/restaurants/my/${id}/`),
  updateRestaurant: (id, data) => sendFormData(apiClient, 'patch', `/restaurants/my/${id}/`, data),
  getCategories: (id) => apiClient.get(`/restaurants/my/${id}/categories/`),
  createCategory: (id, data) => apiClient.post(`/restaurants/my/${id}/categories/`, data),
  updateCategory: (rId, cId, data) => apiClient.patch(`/restaurants/my/${rId}/categories/${cId}/`, data),
  deleteCategory: (rId, cId) => apiClient.delete(`/restaurants/my/${rId}/categories/${cId}/`),
  getMenuItems: (id) => apiClient.get(`/restaurants/my/${id}/items/`),
  createMenuItem: (id, data) => sendFormData(apiClient, 'post', `/restaurants/my/${id}/items/`, data),
  updateMenuItem: (rId, iId, data) => sendFormData(apiClient, 'patch', `/restaurants/my/${rId}/items/${iId}/`, data),
  deleteMenuItem: (rId, iId) => apiClient.delete(`/restaurants/my/${rId}/items/${iId}/`),
};

export default restaurantsService;
