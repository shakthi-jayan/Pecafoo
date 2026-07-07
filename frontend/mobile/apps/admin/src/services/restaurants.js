import { apiClient } from '@pecafoo/api';
const restaurantsService = {
  getRestaurants: () => apiClient.get('/admin/restaurants/'),
  getVerifications: () => apiClient.get('/admin/restaurants/verifications/'),
};
export default restaurantsService;
