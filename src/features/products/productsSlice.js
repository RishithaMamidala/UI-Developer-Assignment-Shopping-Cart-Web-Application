import { createSlice } from '@reduxjs/toolkit';

const productsSlice = createSlice({
  name: 'products',
  initialState: {
    activeCategory: 'all',
    sortBy: 'none',
    selectedProductId: null,
    /** @type {Object.<number, number>} productId → pending quantity */
    productQuantities: {},
  },
  reducers: {
    setActiveCategory(state, action) {
      state.activeCategory = action.payload;
    },
    setSortBy(state, action) {
      state.sortBy = action.payload;
    },
    setSelectedProduct(state, action) {
      state.selectedProductId = action.payload;
    },
    clearSelectedProduct(state) {
      state.selectedProductId = null;
    },
    resetFilters(state) {
      state.activeCategory = 'all';
      state.sortBy = 'none';
    },
    /**
     * @param {{ productId: number, quantity: number }} action.payload
     */
    setProductQuantity(state, action) {
      state.productQuantities[action.payload.productId] = action.payload.quantity;
    },
  },
});

export const {
  setActiveCategory,
  setSortBy,
  setSelectedProduct,
  clearSelectedProduct,
  resetFilters,
  setProductQuantity,
} = productsSlice.actions;

/**
 * @param {Object} state
 * @param {number} productId
 * @returns {number}
 */
export const selectProductQuantity = (state, productId) =>
  state.products.productQuantities[productId] ?? 1;

export default productsSlice.reducer;
