const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

/**
 * Formats a number as a USD currency string.
 * @param {number} n - The numeric value to format.
 * @returns {string} Formatted currency string (e.g. "$1,234.56").
 */
export function formatPrice(n) {
  return formatter.format(n);
}
