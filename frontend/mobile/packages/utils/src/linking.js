/**
 * Deep linking configuration helpers.
 * Each app defines its own scheme in app.json and provides a linking config.
 */

/**
 * Create a linking configuration for React Navigation.
 * @param {string} scheme - e.g. 'pecafoo-customer'
 * @param {object} screens - Screen → path mapping
 * @returns Linking config object for NavigationContainer
 */
export const createLinkingConfig = (scheme, screens) => ({
  prefixes: [`${scheme}://`, `https://pecafoo.com`],
  config: {
    screens,
  },
});
