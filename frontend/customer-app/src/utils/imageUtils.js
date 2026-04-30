/**
 * Image Utility Functions
 * Handles URL normalization, validation, and fallback generation
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const MEDIA_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, '');

/**
 * Normalize image URL to absolute path
 * @param {string} imageUrl - Image URL from backend
 * @param {string} type - 'restaurant' | 'menu' | 'logo' (for fallback emoji)
 * @returns {string} Absolute URL or empty string
 */
export function normalizeImageUrl(imageUrl, type = 'menu') {
  if (!imageUrl || typeof imageUrl !== 'string' || imageUrl.trim() === '') {
    return '';
  }

  // Already absolute (Cloudinary / CDN / data URI / blob / external)
  if (/^(https?:|data:|blob:)/i.test(imageUrl)) {
    return imageUrl;
  }

  // Protocol-relative
  if (imageUrl.startsWith('//')) {
    return `https:${imageUrl}`;
  }

  // Relative path - prepend media base URL
  const cleanUrl = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
  return `${MEDIA_BASE_URL}${cleanUrl}`;
}

/**
 * Generate fallback SVG based on type
 * @param {string} type - 'restaurant' | 'menu' | 'logo'
 * @param {number} size - SVG size in pixels
 * @returns {string} Data URL of SVG
 */
export function generateFallbackSVG(type = 'menu', size = 100) {
  const svgMap = {
    restaurant: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">
        <rect width="${size}" height="${size}" rx="${size / 8}" fill="#F4E7E1"/>
        <text x="${size / 2}" y="${size / 1.5}" text-anchor="middle" font-size="${size / 2}" text-anchor="middle">🏪</text>
      </svg>
    `,
    menu: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">
        <rect width="${size}" height="${size}" rx="${size / 8}" fill="#F4E7E1"/>
        <text x="${size / 2}" y="${size / 1.5}" text-anchor="middle" font-size="${size / 2}">🍽️</text>
      </svg>
    `,
    logo: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">
        <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="#F4E7E1"/>
        <text x="${size / 2}" y="${size / 1.5}" text-anchor="middle" font-size="${size / 2}">🍔</text>
      </svg>
    `,
  };

  const svg = (svgMap[type] || svgMap.menu).trim().replace(/\n\s+/g, '');
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Create image error handler with fallback
 * @param {string} type - 'restaurant' | 'menu' | 'logo'
 * @param {number} size - Size in pixels for fallback SVG
 * @returns {function} Error handler function
 */
export function createImageErrorHandler(type = 'menu', size = 100) {
  return (event) => {
    event.currentTarget.onerror = null; // Prevent infinite loop
    event.currentTarget.src = generateFallbackSVG(type, size);
  };
}

/**
 * Validate and normalize image source for React img tag
 * @param {string} imageUrl - Raw URL from backend
 * @param {string} type - 'restaurant' | 'menu' | 'logo'
 * @returns {object} { src, onError, title }
 */
export function getImageProps(imageUrl, type = 'menu', size = 100) {
  const normalizedUrl = normalizeImageUrl(imageUrl, type);
  
  return {
    src: normalizedUrl || generateFallbackSVG(type, size),
    onError: createImageErrorHandler(type, size),
    title: type.charAt(0).toUpperCase() + type.slice(1),
  };
}

export default {
  normalizeImageUrl,
  generateFallbackSVG,
  createImageErrorHandler,
  getImageProps,
};
