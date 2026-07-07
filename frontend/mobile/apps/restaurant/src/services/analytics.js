import { apiClient } from '@pecafoo/api';
const analyticsService = {
  getDashboard: () => apiClient.get('/analytics/dashboard/'),
};
export default analyticsService;
