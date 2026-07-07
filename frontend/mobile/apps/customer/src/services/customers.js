import { apiClient } from '@pecafoo/api';

/**
 * Customers API — mirrors frontend/customer-app/src/services/api.js customersAPI
 */
const customersService = {
  getProfile: () => apiClient.get('/customers/profile/'),
  updateProfile: (data) => apiClient.patch('/customers/profile/', data),
  getAddresses: () => apiClient.get('/customers/addresses/'),
  addAddress: (data) => apiClient.post('/customers/addresses/', data),
  updateAddress: (id, data) => apiClient.patch(`/customers/addresses/${id}/`, data),
  deleteAddress: (id) => apiClient.delete(`/customers/addresses/${id}/`),
  getWishlist: () => apiClient.get('/customers/wishlist/'),
  toggleWishlist: (data) => apiClient.post('/customers/wishlist/toggle/', data),
  getFoodWishlist: () => apiClient.get('/customers/food-wishlist/'),
  toggleFoodWishlist: (data) => apiClient.post('/customers/food-wishlist/toggle/', data),
  getCart: () => apiClient.get('/customers/cart/'),
  syncCart: (data) => apiClient.post('/customers/cart/', data),
  clearCart: () => apiClient.delete('/customers/cart/'),
};

export default customersService;
