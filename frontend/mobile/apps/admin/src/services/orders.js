import { apiClient } from '@pecafoo/api';
const ordersService = {
  getAllOrders: () => apiClient.get('/admin/orders/'),
};
export default ordersService;
