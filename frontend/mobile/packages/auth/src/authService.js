import { apiClient } from '@pecafoo/api';

/**
 * Auth service — mirrors the Django auth API endpoints exactly.
 *
 * Endpoints match:
 *   frontend/customer-app/src/services/api.js  (authAPI)
 *   frontend/restaurant-app/src/services/api.js (authAPI)
 *   frontend/delivery-app/src/services/api.js   (authAPI)
 *
 * No mobile-specific endpoints. Same backend, different client.
 */
const authService = {
  // ── Registration & Login ──
  register: (data) => apiClient.post('/auth/register/', data),
  login: (data) => apiClient.post('/auth/login/', data),
  completeLogin: (data) => apiClient.post('/auth/complete-login/', data),
  partnerOnboard: (data) => apiClient.post('/auth/partner/onboard/', data),

  // ── Firebase / Google Auth ──
  firebaseAuth: (data) => apiClient.post('/auth/firebase/', data),

  // ── Phone OTP ──
  requestPhoneOtp: (data) => apiClient.post('/auth/phone/request-otp/', data),
  verifyPhoneOtp: (data) => apiClient.post('/auth/phone/verify-otp/', data),

  // ── Session ──
  logout: (data) => apiClient.post('/auth/logout/', data),

  // ── Profile ──
  getProfile: () => apiClient.get('/auth/profile/'),
  updateProfile: (data) => apiClient.patch('/auth/profile/', data),

  // ── Password ──
  changePassword: (data) => apiClient.post('/auth/change-password/', data),
  forgotPassword: (data) => apiClient.post('/auth/forgot-password/', data),
  resetPassword: (data) => apiClient.post('/auth/reset-password/', data),

  // ── Push Notifications ──
  registerFcmToken: (data) => apiClient.post('/auth/fcm-token/', data),
  removeFcmToken: () => apiClient.delete('/auth/fcm-token/'),

  // ── Email Verification ──
  requestEmailVerification: () => apiClient.post('/auth/verify-email/request/'),
  confirmEmailVerification: (data) => apiClient.post('/auth/verify-email/confirm/', data),

  // ── Account Management ──
  exportAccountData: () => apiClient.get('/auth/account/'),
  deleteAccount: (data) => apiClient.delete('/auth/account/', { data }),
};

export default authService;
