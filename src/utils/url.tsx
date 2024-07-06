/**
 * Constructs a valid URL string from the provided input or returns a default URL.
 * @function constructUrl
 * @param {string} urlString - The input string to be converted to a URL.
 * @param {string} defaultUrl - The default URL to return if the input is not a valid URL.
 * @returns {string} A valid URL string or the default URL.
 */
export const constructUrl = (urlString: string, defaultUrl: string): string => {
  try {
    return new URL(urlString).toString();
  } catch {
    return defaultUrl;
  }
};
