import { apiClient } from '@pecafoo/api';

const locationsService = {
  getServiceArea: () => apiClient.get('/locations/service-area/'),
  checkServiceArea: (data) => apiClient.post('/locations/check-service-area/', data),
  geocode: (address) => apiClient.post('/locations/geocode/', { address }),
  reverseGeocode: (data) => apiClient.post('/locations/reverse-geocode/', data),
  getOrderRoute: (orderId) => apiClient.get(`/locations/orders/${orderId}/route/`),
};

export default locationsService;
