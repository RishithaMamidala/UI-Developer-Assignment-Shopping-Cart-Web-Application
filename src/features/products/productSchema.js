import { z } from 'zod';

/**
 * @typedef {Object} Product
 * @property {number} id
 * @property {string} title
 * @property {number} price
 * @property {string} description
 * @property {string} category
 * @property {string} image
 * @property {{ rate: number, count: number }} rating
 */

export const ProductSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().min(1),
  price: z.number().nonnegative(),
  description: z.string(),
  category: z.string(),
  image: z.string().url(),
  rating: z.object({
    rate: z.number().min(0).max(5),
    count: z.number().int().nonnegative(),
  }),
});

export const ProductArraySchema = z.array(z.unknown()).transform((arr) => {
  const valid = [];
  for (const item of arr) {
    const result = ProductSchema.safeParse(item);
    if (result.success) {
      const p = result.data;
      if (p.price > 0 && p.image) valid.push(p);
    }
  }
  return valid;
});
