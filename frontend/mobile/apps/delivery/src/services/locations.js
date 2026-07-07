import { apiClient } from '@pecafoo/api';
const locationsService = { getOrderRoute: (id) => apiClient.get(`/locations/orders/${id}/route/`) };
export default locationsService;
