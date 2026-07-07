import { apiClient, sendFormData } from '@pecafoo/api';
const deliveryService = {
  getProfile: () => apiClient.get('/delivery/profile/'),
  createProfile: (d) => sendFormData(apiClient, 'post', '/delivery/profile/', d),
  updateProfile: (d) => sendFormData(apiClient, 'patch', '/delivery/profile/', d),
  toggleAvailability: (d) => apiClient.post('/delivery/availability/', d),
  updateLocation: (d) => apiClient.post('/delivery/location/', d),
  getEarnings: () => apiClient.get('/delivery/earnings/'),
  getEarningsSummary: () => apiClient.get('/delivery/earnings/summary/'),
  getTodayEarnings: () => apiClient.get('/delivery/partner/earnings/today/'),
  acceptOrder: (id) => apiClient.post(`/delivery/orders/${id}/accept/`),
  declineOrder: (id) => apiClient.post(`/delivery/orders/${id}/decline/`),
};
export default deliveryService;
