/**
 * @param {Object} state - Redux root state
 * @returns {import('./cartSlice.js').CartItem[]}
 */
export const selectCartItems = (state) => state.cart.items;

/**
 * @param {Object} state
 * @returns {number} Sum of all item quantities
 */
export const selectCartCount = (state) =>
  state.cart.items.reduce((sum, item) => sum + item.quantity, 0);

/**
 * @param {Object} state
 * @returns {number} Order total rounded to 2 decimal places
 */
export const selectCartTotal = (state) =>
  Math.round(
    state.cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0) * 100
  ) / 100;

/**
 * @param {Object} state
 * @returns {boolean}
 */
export const selectIsCartOpen = (state) => state.cart.isOpen;

/**
 * @param {Object} state
 * @param {number} productId
 * @returns {import('./cartSlice.js').CartItem | undefined}
 */
export const selectCartItemByProductId = (state, productId) =>
  state.cart.items.find((item) => item.productId === productId);
