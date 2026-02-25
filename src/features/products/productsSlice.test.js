import productsReducer, {
  setActiveCategory,
  setSortBy,
  setSelectedProduct,
  clearSelectedProduct,
  resetFilters,
  setProductQuantity,
  selectProductQuantity,
} from './productsSlice.js';

const initialState = {
  activeCategory: 'all',
  sortBy: 'none',
  selectedProductId: null,
  productQuantities: {},
};

describe('productsSlice', () => {
  it('has correct initial state', () => {
    expect(productsReducer(undefined, { type: '@@INIT' })).toEqual(initialState);
  });

  it('setActiveCategory updates activeCategory', () => {
    const state = productsReducer(initialState, setActiveCategory('electronics'));
    expect(state.activeCategory).toBe('electronics');
  });

  it('setSortBy updates sortBy', () => {
    const state = productsReducer(initialState, setSortBy('price_asc'));
    expect(state.sortBy).toBe('price_asc');
  });

  it('setSelectedProduct updates selectedProductId', () => {
    const state = productsReducer(initialState, setSelectedProduct(42));
    expect(state.selectedProductId).toBe(42);
  });

  it('clearSelectedProduct resets selectedProductId to null', () => {
    const stateWithSelection = productsReducer(initialState, setSelectedProduct(7));
    const cleared = productsReducer(stateWithSelection, clearSelectedProduct());
    expect(cleared.selectedProductId).toBeNull();
  });

  it('resetFilters resets activeCategory and sortBy to defaults', () => {
    let state = productsReducer(initialState, setActiveCategory('jewelery'));
    state = productsReducer(state, setSortBy('price_desc'));
    const reset = productsReducer(state, resetFilters());
    expect(reset.activeCategory).toBe('all');
    expect(reset.sortBy).toBe('none');
  });

  it('setProductQuantity stores quantity for a given productId', () => {
    const state = productsReducer(initialState, setProductQuantity({ productId: 5, quantity: 3 }));
    expect(state.productQuantities[5]).toBe(3);
  });

  it('setProductQuantity overwrites a previously stored quantity', () => {
    let state = productsReducer(initialState, setProductQuantity({ productId: 5, quantity: 2 }));
    state = productsReducer(state, setProductQuantity({ productId: 5, quantity: 7 }));
    expect(state.productQuantities[5]).toBe(7);
  });

  it('selectProductQuantity returns stored quantity when set', () => {
    const state = productsReducer(initialState, setProductQuantity({ productId: 5, quantity: 4 }));
    expect(selectProductQuantity({ products: state }, 5)).toBe(4);
  });

  it('selectProductQuantity returns default 1 when productId not in map', () => {
    expect(selectProductQuantity({ products: initialState }, 999)).toBe(1);
  });
});
