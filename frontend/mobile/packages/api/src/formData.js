import { Platform } from 'react-native';

/**
 * Build a FormData object from a plain object.
 * Handles file URIs for image/document uploads.
 *
 * Usage:
 *   const form = createFormData({
 *     name: 'My Restaurant',
 *     logo: { uri: 'file:///...', name: 'logo.jpg', type: 'image/jpeg' },
 *   });
 *   await apiClient.post('/restaurants/my/', form, {
 *     headers: { 'Content-Type': undefined },
 *   });
 */
export const createFormData = (data) => {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value === null || value === undefined) {
      return;
    }

    // File object: { uri, name, type }
    if (value?.uri) {
      formData.append(key, {
        uri: Platform.OS === 'ios' ? value.uri.replace('file://', '') : value.uri,
        name: value.name || `${key}.jpg`,
        type: value.type || 'image/jpeg',
      });
    } else if (Array.isArray(value)) {
      // Array of primitives or files
      value.forEach((item, index) => {
        if (item?.uri) {
          formData.append(key, {
            uri: Platform.OS === 'ios' ? item.uri.replace('file://', '') : item.uri,
            name: item.name || `${key}_${index}.jpg`,
            type: item.type || 'image/jpeg',
          });
        } else {
          formData.append(key, String(item));
        }
      });
    } else if (typeof value === 'object') {
      formData.append(key, JSON.stringify(value));
    } else {
      formData.append(key, String(value));
    }
  });

  return formData;
};

/**
 * Send a request with FormData (for file uploads).
 * Automatically sets Content-Type to undefined so Axios picks the boundary.
 *
 * @param {import('axios').AxiosInstance} client - Axios instance
 * @param {'post'|'put'|'patch'} method
 * @param {string} url
 * @param {object} data - Plain object (files as { uri, name, type })
 */
export const sendFormData = (client, method, url, data) => {
  const formData = createFormData(data);
  return client({
    method,
    url,
    data: formData,
    headers: { 'Content-Type': undefined },
  });
};
