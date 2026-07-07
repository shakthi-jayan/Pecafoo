import { apiClient } from '@pecafoo/api';

/**
 * Orders API — mirrors frontend/customer-app/src/services/api.js ordersAPI
 */
const ordersService = {
  create: (data) => apiClient.post('/orders/create/', data),
  getMyOrders: (params) => apiClient.get('/orders/my/', { params }),
  getOrder: (id) => apiClient.get(`/orders/${id}/`),
  rateOrder: (id, data) => apiClient.post(`/orders/${id}/rate/`, data),
  cancelOrder: (id) => apiClient.post(`/orders/${id}/cancel/`),
  initiatePayment: (id, method) => apiClient.post(`/orders/${id}/pay/`, { method }),
  verifyRazorpay: (data) => apiClient.post('/orders/razorpay/verify/', data),
};

export default ordersService;
