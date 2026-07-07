import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_KEY = '@pecafoo:user';

/**
 * Retrieve stored user object.
 * @returns {Promise<object | null>}
 */
export const getUser = async () => {
  try {
    const raw = await AsyncStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

/**
 * Persist user object.
 * @param {object} user
 */
export const setUser = async (user) => {
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
};

/**
 * Remove stored user data.
 */
export const clearUser = async () => {
  await AsyncStorage.removeItem(USER_KEY);
};
