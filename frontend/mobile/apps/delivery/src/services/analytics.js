import { apiClient } from '@pecafoo/api';
const analyticsService = {
  getDeliveryStats: () => apiClient.get('/analytics/dashboard/'),
  getSurgePricing: () => apiClient.get('/analytics/surge/'),
  getSuggestedZone: () => apiClient.get('/analytics/driver/suggested-zone/'),
};
export default analyticsService;
