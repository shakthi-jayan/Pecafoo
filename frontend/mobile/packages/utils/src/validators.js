/**
 * Input validation helpers shared across all Pecafoo mobile apps.
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^(\+91|91)?[6-9]\d{9}$/;

/**
 * Validate email format.
 * @param {string} email
 * @returns {string|null} Error message or null if valid
 */
export const isEmail = (email) => {
  if (!email?.trim()) return 'Email is required';
  if (!EMAIL_REGEX.test(email.trim())) return 'Enter a valid email address';
  return null;
};

/**
 * Validate Indian phone number.
 * @param {string} phone
 * @returns {string|null}
 */
export const isPhone = (phone) => {
  if (!phone?.trim()) return 'Phone number is required';
  const cleaned = phone.replace(/[\s\-()]/g, '');
  if (!PHONE_REGEX.test(cleaned)) return 'Enter a valid Indian phone number';
  return null;
};

/**
 * Validate password strength.
 * @param {string} password
 * @returns {string|null}
 */
export const isStrongPassword = (password) => {
  if (!password) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (!/[A-Z]/.test(password)) return 'Password must contain an uppercase letter';
  if (!/[a-z]/.test(password)) return 'Password must contain a lowercase letter';
  if (!/\d/.test(password)) return 'Password must contain a number';
  return null;
};

/**
 * Validate required field.
 * @param {string} value
 * @param {string} fieldName
 * @returns {string|null}
 */
export const isRequired = (value, fieldName = 'This field') => {
  if (!value?.toString().trim()) return `${fieldName} is required`;
  return null;
};

/**
 * Validate OTP format (6 digits).
 * @param {string} otp
 * @returns {string|null}
 */
export const isOtp = (otp) => {
  if (!otp?.trim()) return 'OTP is required';
  if (!/^\d{6}$/.test(otp.trim())) return 'OTP must be 6 digits';
  return null;
};
