import { validateQuantity } from './validation.js';

describe('validateQuantity', () => {
  it('returns true for value 1 (min)', () => {
    expect(validateQuantity(1)).toBe(true);
  });

  it('returns true for value 50 (max)', () => {
    expect(validateQuantity(50)).toBe(true);
  });

  it('returns false for 0', () => {
    expect(validateQuantity(0)).toBe(false);
  });

  it('returns false for 51 (above max)', () => {
    expect(validateQuantity(51)).toBe(false);
  });

  it('returns false for -1', () => {
    expect(validateQuantity(-1)).toBe(false);
  });

  it('returns false for float 1.5', () => {
    expect(validateQuantity(1.5)).toBe(false);
  });

  it('returns false for string "2"', () => {
    expect(validateQuantity('2')).toBe(false);
  });

  it('returns false for NaN', () => {
    expect(validateQuantity(NaN)).toBe(false);
  });
});
