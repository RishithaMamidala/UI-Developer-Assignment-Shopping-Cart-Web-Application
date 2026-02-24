import { ProductSchema, ProductArraySchema } from './productSchema.js';
import { ZodError } from 'zod';

const validProduct = {
  id: 1,
  title: 'Test Product',
  price: 29.99,
  description: 'A great product',
  category: 'electronics',
  image: 'https://fakestoreapi.com/img/test.jpg',
  rating: { rate: 4.5, count: 100 },
};

describe('ProductSchema', () => {
  it('parses a valid product', () => {
    const result = ProductSchema.parse(validProduct);
    expect(result.id).toBe(1);
    expect(result.title).toBe('Test Product');
  });

  it('throws ZodError when price is missing', () => {
    const { price, ...noPriceProduct } = validProduct;
    expect(() => ProductSchema.parse(noPriceProduct)).toThrow(ZodError);
  });
});

describe('ProductArraySchema', () => {
  it('filters out product with empty string image', () => {
    const products = [validProduct, { ...validProduct, id: 2, image: '' }];
    const result = ProductArraySchema.parse(products);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(1);
  });

  it('filters out product with price 0', () => {
    const products = [validProduct, { ...validProduct, id: 2, price: 0 }];
    const result = ProductArraySchema.parse(products);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(1);
  });

  it('preserves valid products in the same array', () => {
    const products = [
      validProduct,
      { ...validProduct, id: 2, title: 'Second Product', price: 49.99 },
    ];
    const result = ProductArraySchema.parse(products);
    expect(result).toHaveLength(2);
  });
});
