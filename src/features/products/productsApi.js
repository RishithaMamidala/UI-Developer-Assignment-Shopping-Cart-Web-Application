import { createApi, fetchBaseQuery, retry } from '@reduxjs/toolkit/query/react';

const staggeredBase = retry(
  fetchBaseQuery({ baseUrl: 'https://fakestoreapi.com', timeout: 10000 }),
  { maxRetries: 3 }
);

/**
 * Validates and filters a raw API product array.
 * Drops items missing required fields, non-positive price, or empty image.
 * @param {unknown[]} raw
 * @returns {Object[]}
 */
function parseProducts(raw) {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (p) =>
      p &&
      typeof p.id === 'number' &&
      typeof p.title === 'string' &&
      p.title.length > 0 &&
      typeof p.price === 'number' &&
      p.price > 0 &&
      typeof p.description === 'string' &&
      typeof p.category === 'string' &&
      typeof p.image === 'string' &&
      p.image.length > 0 &&
      p.rating !== null &&
      typeof p.rating === 'object' &&
      typeof p.rating.rate === 'number' &&
      typeof p.rating.count === 'number'
  );
}

export const productsApi = createApi({
  reducerPath: 'productsApi',
  baseQuery: staggeredBase,
  endpoints: (builder) => ({
    getProducts: builder.query({
      query: () => '/products',
      transformResponse: (raw) => parseProducts(raw),
    }),
  }),
});

export const { useGetProductsQuery } = productsApi;
