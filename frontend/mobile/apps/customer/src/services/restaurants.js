import { apiClient } from '@pecafoo/api';

/**
 * Restaurants API — mirrors frontend/customer-app/src/services/api.js restaurantsAPI
 */
const restaurantsService = {
  getAll: (params) => apiClient.get('/restaurants/', { params }),
  getBySlug: (slug) => apiClient.get(`/restaurants/${slug}/`),
  getReviews: (slug) => apiClient.get(`/restaurants/${slug}/reviews/`),
  getNearby: (lat, lng, radius = 15) =>
    apiClient.get('/restaurants/', {
      params: { latitude: lat, longitude: lng, radius },
    }),
  getFoodItems: (params) => apiClient.get('/restaurants/food-items/', { params }),
  getPlatformCategories: () => apiClient.get('/restaurants/categories/platform/'),
  getCuisines: () => apiClient.get('/restaurants/cuisines/'),
};

export default restaurantsService;
