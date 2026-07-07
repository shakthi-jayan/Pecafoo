import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKENS_KEY = '@pecafoo:tokens';

/**
 * Retrieve stored JWT tokens (access + refresh).
 * @returns {Promise<{access: string, refresh: string} | null>}
 */
export const getTokens = async () => {
  try {
    const raw = await AsyncStorage.getItem(TOKENS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

/**
 * Persist JWT tokens.
 * @param {{access: string, refresh: string}} tokens
 */
export const setTokens = async (tokens) => {
  await AsyncStorage.setItem(TOKENS_KEY, JSON.stringify(tokens));
};

/**
 * Remove stored tokens (logout).
 */
export const clearTokens = async () => {
  await AsyncStorage.removeItem(TOKENS_KEY);
};
