import { apiClient } from '@pecafoo/api';

const ordersService = {
  getRestaurantOrders: () => apiClient.get('/orders/restaurant/'),
  getOrder: (id) => apiClient.get(`/orders/${id}/`),
  updateStatus: (id, data) => apiClient.patch(`/orders/${id}/status/`, data),
};

export default ordersService;
