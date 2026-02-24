import {
  selectCartItems,
  selectCartCount,
  selectCartTotal,
  selectIsCartOpen,
  selectCartItemByProductId,
} from './cartSelectors.js';

const buildState = (items = [], isOpen = false) => ({ cart: { items, isOpen } });

const item1 = { productId: 1, title: 'A', image: 'a.jpg', price: 10.0, quantity: 2 };
const item2 = { productId: 2, title: 'B', image: 'b.jpg', price: 5.0, quantity: 3 };

describe('cartSelectors', () => {
  it('selectCartItems returns items array', () => {
    expect(selectCartItems(buildState([item1]))).toEqual([item1]);
  });

  it('selectCartCount returns sum of all quantities', () => {
    expect(selectCartCount(buildState([item1, item2]))).toBe(5);
  });

  it('selectCartCount returns 0 for empty cart', () => {
    expect(selectCartCount(buildState())).toBe(0);
  });

  it('selectCartTotal returns correct total', () => {
    // 10.00 * 2 + 5.00 * 3 = 20 + 15 = 35.00
    expect(selectCartTotal(buildState([item1, item2]))).toBe(35.0);
  });

  it('selectCartTotal includes floating-point safety', () => {
    const items = [
      { productId: 3, title: 'C', image: 'c.jpg', price: 0.1, quantity: 3 },
    ];
    // 0.1 * 3 = 0.30000000000000004 raw; Math.round guards to 0.30
    expect(selectCartTotal(buildState(items))).toBe(0.3);
  });

  it('selectIsCartOpen returns boolean', () => {
    expect(selectIsCartOpen(buildState([], true))).toBe(true);
    expect(selectIsCartOpen(buildState([], false))).toBe(false);
  });

  it('selectCartItemByProductId returns correct item', () => {
    expect(selectCartItemByProductId(buildState([item1, item2]), 2)).toEqual(item2);
  });

  it('selectCartItemByProductId returns undefined when not found', () => {
    expect(selectCartItemByProductId(buildState([item1]), 999)).toBeUndefined();
  });
});
