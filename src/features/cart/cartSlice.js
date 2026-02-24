import { createSlice } from '@reduxjs/toolkit';
import { MAX_QUANTITY } from '@/constants/index.js';

/**
 * @typedef {Object} CartItem
 * @property {number} productId
 * @property {string} title
 * @property {string} image
 * @property {number} price
 * @property {number} quantity
 */

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    /** @type {CartItem[]} */
    items: [],
    isOpen: false,
  },
  reducers: {
    /**
     * @param {{ product: CartItem, quantity: number }} action.payload
     */
    addToCart(state, action) {
      const { product, quantity } = action.payload;
      const existing = state.items.find((item) => item.productId === product.productId);
      if (existing) {
        existing.quantity = Math.min(existing.quantity + quantity, MAX_QUANTITY);
      } else {
        state.items.push({ ...product, quantity: Math.min(quantity, MAX_QUANTITY) });
      }
    },
    /**
     * @param {{ productId: number, quantity: number }} action.payload
     */
    updateQuantity(state, action) {
      const { productId, quantity } = action.payload;
      if (quantity === 0) {
        state.items = state.items.filter((item) => item.productId !== productId);
      } else {
        const item = state.items.find((i) => i.productId === productId);
        if (item) {
          item.quantity = Math.min(quantity, MAX_QUANTITY);
        }
      }
    },
    /**
     * @param {number} action.payload - productId to remove
     */
    removeItem(state, action) {
      state.items = state.items.filter((item) => item.productId !== action.payload);
    },
    openCart(state) {
      state.isOpen = true;
    },
    closeCart(state) {
      state.isOpen = false;
    },
  },
});

export const { addToCart, updateQuantity, removeItem, openCart, closeCart } = cartSlice.actions;
export default cartSlice.reducer;
