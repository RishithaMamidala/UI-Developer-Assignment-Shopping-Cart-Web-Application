import { MAX_QUANTITY } from '@/constants/index.js';

/**
 * Returns true only when n is an integer in the range [1, MAX_QUANTITY].
 * @param {number} n - Quantity to validate.
 * @returns {boolean}
 */
export function validateQuantity(n) {
  return Number.isInteger(n) && n >= 1 && n <= MAX_QUANTITY;
}
