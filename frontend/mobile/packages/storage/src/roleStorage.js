import AsyncStorage from '@react-native-async-storage/async-storage';

const ROLE_KEY = '@pecafoo:role';

/**
 * Retrieve stored active role (customer | restaurant | delivery | admin).
 * @returns {Promise<string | null>}
 */
export const getActiveRole = async () => {
  try {
    return await AsyncStorage.getItem(ROLE_KEY);
  } catch {
    return null;
  }
};

/**
 * Persist active role.
 * @param {string} role
 */
export const setActiveRole = async (role) => {
  await AsyncStorage.setItem(ROLE_KEY, role);
};

/**
 * Remove stored role.
 */
export const clearRole = async () => {
  await AsyncStorage.removeItem(ROLE_KEY);
};
