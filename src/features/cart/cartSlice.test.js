import cartReducer, {
  addToCart,
  updateQuantity,
  removeItem,
  openCart,
  closeCart,
} from './cartSlice.js';

const initialState = { items: [], isOpen: false };

const mockProduct = {
  productId: 1,
  title: 'Test Product',
  image: 'https://example.com/img.jpg',
  price: 29.99,
};

describe('cartSlice', () => {
  it('addToCart with new product adds item to empty cart', () => {
    const state = cartReducer(initialState, addToCart({ product: mockProduct, quantity: 2 }));
    expect(state.items).toHaveLength(1);
    expect(state.items[0].productId).toBe(1);
    expect(state.items[0].quantity).toBe(2);
  });

  it('addToCart with existing productId accumulates quantity', () => {
    const stateWithItem = cartReducer(
      initialState,
      addToCart({ product: mockProduct, quantity: 3 })
    );
    const stateAfterSecondAdd = cartReducer(
      stateWithItem,
      addToCart({ product: mockProduct, quantity: 4 })
    );
    expect(stateAfterSecondAdd.items).toHaveLength(1);
    expect(stateAfterSecondAdd.items[0].quantity).toBe(7);
  });

  it('addToCart caps accumulated quantity at MAX_QUANTITY (50)', () => {
    const stateWithItem = cartReducer(
      initialState,
      addToCart({ product: mockProduct, quantity: 48 })
    );
    const stateAfterCap = cartReducer(
      stateWithItem,
      addToCart({ product: mockProduct, quantity: 10 })
    );
    expect(stateAfterCap.items[0].quantity).toBe(50);
  });

  it('updateQuantity sets new quantity', () => {
    const stateWithItem = cartReducer(
      initialState,
      addToCart({ product: mockProduct, quantity: 2 })
    );
    const stateUpdated = cartReducer(stateWithItem, updateQuantity({ productId: 1, quantity: 5 }));
    expect(stateUpdated.items[0].quantity).toBe(5);
  });

  it('updateQuantity with quantity 0 removes the item', () => {
    const stateWithItem = cartReducer(
      initialState,
      addToCart({ product: mockProduct, quantity: 2 })
    );
    const stateRemoved = cartReducer(stateWithItem, updateQuantity({ productId: 1, quantity: 0 }));
    expect(stateRemoved.items).toHaveLength(0);
  });

  it('updateQuantity is a no-op when productId not found', () => {
    const stateWithItem = cartReducer(
      initialState,
      addToCart({ product: mockProduct, quantity: 2 })
    );
    const stateUnchanged = cartReducer(
      stateWithItem,
      updateQuantity({ productId: 999, quantity: 5 })
    );
    expect(stateUnchanged.items[0].quantity).toBe(2);
  });

  it('removeItem removes item by productId', () => {
    const stateWithItem = cartReducer(
      initialState,
      addToCart({ product: mockProduct, quantity: 2 })
    );
    const stateRemoved = cartReducer(stateWithItem, removeItem(1));
    expect(stateRemoved.items).toHaveLength(0);
  });

  it('removeItem is a no-op if productId not found', () => {
    const stateWithItem = cartReducer(
      initialState,
      addToCart({ product: mockProduct, quantity: 2 })
    );
    const stateUnchanged = cartReducer(stateWithItem, removeItem(999));
    expect(stateUnchanged.items).toHaveLength(1);
  });

  it('openCart sets isOpen true', () => {
    const state = cartReducer(initialState, openCart());
    expect(state.isOpen).toBe(true);
  });

  it('closeCart sets isOpen false', () => {
    const stateOpen = cartReducer(initialState, openCart());
    const stateClosed = cartReducer(stateOpen, closeCart());
    expect(stateClosed.isOpen).toBe(false);
  });

  it('rapid-dispatch edge case: 10 sequential addToCart with qty 1 each yields quantity 10', () => {
    let state = initialState;
    for (let i = 0; i < 10; i++) {
      state = cartReducer(state, addToCart({ product: mockProduct, quantity: 1 }));
    }
    expect(state.items[0].quantity).toBe(10);
  });

  it('large-cart edge case: 30 distinct products', () => {
    let state = initialState;
    for (let i = 1; i <= 30; i++) {
      state = cartReducer(
        state,
        addToCart({
          product: {
            productId: i,
            title: `Product ${i}`,
            image: `https://example.com/${i}.jpg`,
            price: 9.99,
          },
          quantity: 1,
        })
      );
    }
    expect(state.items).toHaveLength(30);
    // selectCartCount equivalent
    const count = state.items.reduce((s, item) => s + item.quantity, 0);
    expect(count).toBe(30);
  });
});
