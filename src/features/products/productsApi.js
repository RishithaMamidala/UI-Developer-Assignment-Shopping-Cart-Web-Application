import { createApi, fetchBaseQuery, retry } from '@reduxjs/toolkit/query/react';
import { ProductArraySchema } from './productSchema.js';

const staggeredBase = retry(
  fetchBaseQuery({ baseUrl: 'https://fakestoreapi.com', timeout: 10000 }),
  { maxRetries: 3 }
);

export const productsApi = createApi({
  reducerPath: 'productsApi',
  baseQuery: staggeredBase,
  endpoints: (builder) => ({
    getProducts: builder.query({
      query: () => '/products',
      transformResponse: (raw) => ProductArraySchema.parse(raw),
    }),
  }),
});

export const { useGetProductsQuery } = productsApi;
