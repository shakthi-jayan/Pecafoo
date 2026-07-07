import { apiClient } from '@pecafoo/api';
const notificationsService = {
  getAll: () => apiClient.get('/notifications/'),
  getUnreadCount: () => apiClient.get('/notifications/unread-count/'),
  markRead: (id) => apiClient.post(`/notifications/${id}/read/`),
  markAllRead: () => apiClient.post('/notifications/mark-all-read/'),
};
export default notificationsService;
