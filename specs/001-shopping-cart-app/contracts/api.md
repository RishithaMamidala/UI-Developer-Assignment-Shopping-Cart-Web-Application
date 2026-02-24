# API Contracts: Modern Shopping Cart Web Application

**Feature**: `001-shopping-cart-app` | **Date**: 2026-02-23

---

## External API: FakeStore

**Base URL**: `https://fakestoreapi.com`
**Authentication**: None
**Protocol**: HTTPS (browser-direct, no server proxy needed)
**Timeout**: 10 000 ms (enforced by RTK Query `fetchBaseQuery`)

---

## Endpoint 1: Get All Products

```
GET https://fakestoreapi.com/products
```

**Used by**: `productsApi.js` → `useGetProductsQuery()` hook
**Called on**: Initial page load (FR-001)
**Frequency**: Once per session (RTK Query caches the result)

### Request

No query parameters, no headers, no authentication.

### Response — Success (HTTP 200)

```json
[
  {
    "id": 1,
    "title": "Fjallraven - Foldsack No. 1 Backpack, Fits 15 Laptops",
    "price": 109.95,
    "description": "Your perfect pack for everyday use and walks in the forest. Stash your laptop (up to 15 inches) in the padded sleeve...",
    "category": "men's clothing",
    "image": "https://fakestoreapi.com/img/81fAn2...",
    "rating": {
      "rate": 3.9,
      "count": 120
    }
  },
  { "id": 2, ... },
  ...
]
```

### Response — Error States

| Scenario | Behaviour |
|----------|-----------|
| HTTP 4xx / 5xx | RTK Query sets `isError: true`; `error.status` = HTTP status code |
| Network unreachable | RTK Query sets `isError: true`; `error.status = 'FETCH_ERROR'` |
| Timeout (> 10 000 ms) | RTK Query sets `isError: true`; `error.status = 'TIMEOUT_ERROR'` |
| Empty array `[]` | Valid response; `data = []`; `ProductGrid` shows empty state |

### RTK Query Integration

```js
// src/features/products/productsApi.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { ProductArraySchema } from './productSchema';

export const productsApi = createApi({
  reducerPath: 'productsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://fakestoreapi.com',
    timeout: 10000,  // FR-036
  }),
  endpoints: builder => ({
    getProducts: builder.query({
      query: () => '/products',
      // Validate + filter malformed products at the API boundary (Constitution VIII)
      transformResponse: raw => ProductArraySchema.parse(raw),
    }),
  }),
});

export const { useGetProductsQuery } = productsApi;
```

### Hook Usage in Components

```jsx
const { data: products = [], isLoading, isError, error, refetch } = useGetProductsQuery();

// Render states:
// isLoading === true  → show skeleton cards (FR-003)
// isError   === true  → show error UI with retry (FR-004)
// data === []         → show empty state (FR-005)
// data.length > 0     → show product grid (FR-001)
```

---

## Endpoint 2: Get Single Product (Optional)

```
GET https://fakestoreapi.com/products/{id}
```

**Used by**: `ProductDetailModal` — optional endpoint. The modal can reuse the already-cached product from `useGetProductsQuery().data` without an additional API call. A separate `getProductById` query is defined for completeness but is only called if the product is not already in the cache.

### Response — Success (HTTP 200)

Same shape as a single item in the products array above.

### RTK Query Integration

```js
// Optional — add to productsApi.js if needed
getProductById: builder.query({
  query: id => `/products/${id}`,
  transformResponse: raw => ProductSchema.parse(raw),
}),
```

---

## Error Handling Contract

All error states MUST render a user-readable message and a retry action (FR-004, Constitution VIII):

| `error.status` | Display Message | User Action |
|----------------|-----------------|-------------|
| `'TIMEOUT_ERROR'` | "The request timed out. Please check your connection." | "Try Again" → `refetch()` |
| `'FETCH_ERROR'` | "Could not connect to the store. Please check your connection." | "Try Again" → `refetch()` |
| `400`–`499` | "There was a problem loading products. Please try again." | "Try Again" → `refetch()` |
| `500`–`599` | "The store service is temporarily unavailable." | "Try Again" → `refetch()` |

Raw `error.message` or API error strings MUST NOT be surfaced in the UI (Constitution VIII).

---

## RTK Query Cache Policy

| Setting | Value | Rationale |
|---------|-------|-----------|
| `keepUnusedDataFor` | default (60 s) | Product list is stable; no stale data risk within a session |
| `refetchOnMountOrArgChange` | false (default) | Avoid redundant network calls during navigation |
| `refetchOnReconnect` | true | Recover gracefully if user went offline then reconnected |
| `refetchOnFocus` | false (default) | Not needed for a catalogue app |
