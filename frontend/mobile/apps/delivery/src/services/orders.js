import { apiClient } from '@pecafoo/api';
const ordersService = {
  getDeliveryOrders: () => apiClient.get('/orders/delivery/'),
  getOrder: (id) => apiClient.get(`/orders/${id}/`),
  updateStatus: (id, d) => apiClient.patch(`/orders/${id}/status/`, d),
  getAvailableOrders: () => apiClient.get('/orders/available-for-delivery/'),
};
export default ordersService;
