import { apiClient } from '@pecafoo/api';

const promotionsService = {
  getAll: () => apiClient.get('/promotions/'),
  apply: (data) => apiClient.post('/promotions/apply/', data),
};

export default promotionsService;
