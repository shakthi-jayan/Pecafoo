/**
 * Shared constants / enums across all Pecafoo mobile apps.
 * Must match Django backend enum values exactly.
 */

export const ROLES = {
  CUSTOMER: 'customer',
  RESTAURANT: 'restaurant_owner',
  DELIVERY: 'delivery_partner',
  ADMIN: 'admin',
};

export const ORDER_STATUSES = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PREPARING: 'preparing',
  READY: 'ready_for_pickup',
  PICKED_UP: 'picked_up',
  ON_THE_WAY: 'on_the_way',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
};

export const ORDER_STATUS_LABELS = {
  [ORDER_STATUSES.PENDING]: 'Pending',
  [ORDER_STATUSES.CONFIRMED]: 'Confirmed',
  [ORDER_STATUSES.PREPARING]: 'Preparing',
  [ORDER_STATUSES.READY]: 'Ready for Pickup',
  [ORDER_STATUSES.PICKED_UP]: 'Picked Up',
  [ORDER_STATUSES.ON_THE_WAY]: 'On the Way',
  [ORDER_STATUSES.DELIVERED]: 'Delivered',
  [ORDER_STATUSES.CANCELLED]: 'Cancelled',
};

export const PAYMENT_METHODS = {
  COD: 'cod',
  RAZORPAY: 'razorpay',
  WALLET: 'wallet',
};

export const PAYMENT_METHOD_LABELS = {
  [PAYMENT_METHODS.COD]: 'Cash on Delivery',
  [PAYMENT_METHODS.RAZORPAY]: 'Online Payment',
  [PAYMENT_METHODS.WALLET]: 'Wallet',
};

export const VERIFICATION_STATUSES = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

export const DELIVERY_AVAILABILITY = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  BUSY: 'busy',
};
