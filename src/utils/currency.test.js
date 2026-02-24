import { formatPrice } from './currency.js';

describe('formatPrice', () => {
  it('formats a typical price', () => {
    expect(formatPrice(109.95)).toBe('$109.95');
  });

  it('formats zero', () => {
    expect(formatPrice(0)).toBe('$0.00');
  });

  it('handles floating-point imprecision (3 * 0.1)', () => {
    expect(formatPrice(3 * 0.1)).toBe('$0.30');
  });

  it('formats large price with thousands separator', () => {
    expect(formatPrice(1999.99)).toBe('$1,999.99');
  });
});
