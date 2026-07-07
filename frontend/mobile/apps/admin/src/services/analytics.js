import { apiClient } from '@pecafoo/api';
const analyticsService = {
  getDashboard: () => apiClient.get('/analytics/platform/dashboard/'),
};
export default analyticsService;
