# Phase 0 Research: Modern Shopping Cart Web Application

**Feature**: `001-shopping-cart-app` | **Date**: 2026-02-23

---

## Decision 1: Project Scaffold — Vite 5 over Create React App

- **Decision**: Vite 5 + `@vitejs/plugin-react`
- **Rationale**: Create React App is officially unmaintained (last release 2022). Vite provides native ESM during development (instant HMR, no bundling on start), Rollup-based production builds with superior tree-shaking, and first-class code splitting with `React.lazy`. The initial JS bundle target of ≤ 200 KB gzipped (Constitution VI) is significantly easier to achieve with Vite's Rollup output.
- **Alternatives considered**:
  - **CRA** — unmaintained, slow builds, poor tree-shaking. Rejected.
  - **Next.js** — SSR/SSG overkill for a public-API-only SPA. Adds server complexity with no benefit. Rejected.
  - **Parcel** — simpler config, but less community support and fewer optimisation hooks. Rejected.

---

## Decision 2: State Architecture — RTK Query + Redux Toolkit

- **Decision**: Redux Toolkit (`cartSlice`) for cart state + RTK Query (`productsApi`) for product fetching
- **Rationale**:
  - Constitution VII explicitly forbids raw `useEffect`-based fetch patterns. RTK Query is the official Redux data-fetching library and satisfies this requirement while keeping state management within the Redux ecosystem (user's explicit preference).
  - `cartSlice` provides Immer-backed immutable state mutations, Redux DevTools traceability, and clean action semantics for add/remove/update cart operations.
  - RTK Query eliminates boilerplate for loading/error/success states (FR-003, FR-004, FR-005), caches the product list across re-renders, and exposes a `refetch` function for the "Try Again" control (FR-004).
- **Alternatives considered**:
  - **TanStack Query + Zustand** — excellent pattern, but introduces two libraries when RTK Query already covers both. Rejected (scope/DX trade-off).
  - **React Context + useReducer** — Constitution VII requires a documented state manager for shared state, not ad-hoc context. Rejected.
  - **SWR** — simpler API, but not Redux-native; would need a separate cart solution. Rejected.

---

## Decision 3: API Timeout — `fetchBaseQuery({ timeout: 10000 })`

- **Decision**: Set `timeout: 10000` on the `fetchBaseQuery` config object
- **Rationale**: RTK Query's `fetchBaseQuery` accepts a `timeout` option (in milliseconds) that internally wraps the fetch call with `AbortController`. Setting it at the `baseQuery` level applies it globally to all endpoints, enforcing FR-036 without per-endpoint boilerplate.
- **Timeout behaviour**: If the request does not resolve within 10 000 ms, RTK Query sets `isError: true` and `error.status: 'TIMEOUT_ERROR'`. The `ProductGrid` component handles this error state by rendering the error UI with a "Try Again" button that calls `refetch()`.
- **Alternatives considered**:
  - **Manual AbortController per endpoint** — more granular but verbose; no benefit for a single API endpoint. Rejected.
  - **Axios with timeout interceptor** — adds a dependency; `fetch` is sufficient for this use case. Rejected.

---

## Decision 4: API Response Validation — Zod in `transformResponse`

- **Decision**: Define `ProductSchema` and `ProductArraySchema` with Zod; parse inside RTK Query's `transformResponse` callback
- **Rationale**: Constitution VIII requires API responses to be validated at the boundary using runtime schema validation. Zod provides a declarative schema, descriptive parse errors, and a `.transform()` method to filter malformed products before they reach component state.
- **Malformed product handling**: `ProductArraySchema` applies a `.transform()` that filters out products missing `price > 0` or a valid `image` URL — satisfying the "malformed API data" edge case in the spec.
- **Alternatives considered**:
  - **Yup** — less ergonomic transform API. Rejected.
  - **Manual `if` checks in transformResponse** — brittle, no reusable schema type. Rejected.
  - **No validation (trust the API)** — violates Constitution VIII. Rejected.

---

## Decision 5: Cart Persistence — `redux-persist` with `sessionStorage`

- **Decision**: `redux-persist` + `createWebStorage('session')` — whitelist `['cart']`, blacklist RTK Query cache
- **Rationale**: FR-029 requires cart contents to survive a page refresh. The spec assumption specifies session-only persistence (no cross-session or cross-device sync). `redux-persist` is the idiomatic, well-maintained solution for Redux state persistence, and `sessionStorage` matches the session-scope requirement exactly.
- **Config highlights**:
  - `whitelist: ['cart']` — only the cart slice is persisted; `products` (filter/sort state) resets on load as intended.
  - `blacklist: [productsApi.reducerPath]` — RTK Query cache is never serialised to storage (avoids stale cache across refreshes).
  - Serialisability middleware is configured to ignore `persist/PERSIST` and `persist/REHYDRATE` action types.
- **Alternatives considered**:
  - **Manual `useEffect` to sessionStorage** — bypasses Redux action traceability; harder to test. Rejected.
  - **localStorage** — persists beyond session; violates the spec assumption. Rejected.
  - **IndexedDB** — overkill for this data volume. Rejected.

---

## Decision 6: Currency — `en-US` / USD via `Intl.NumberFormat`

- **Decision**: `new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price)`
- **Rationale**: FakeStore API returns numeric prices in USD (e.g., `109.95`). `Intl.NumberFormat` is built into all modern browsers, requires no dependency, and delegates rounding to the browser's ICU data — eliminating floating-point display bugs (SC-003). The `minimumFractionDigits: 2` default ensures consistent two-decimal display.
- **Implementation**: `utils/currency.js` exports a single `formatPrice(n)` function. Cart totals are computed as raw numbers in `cartSelectors.js` (with `Math.round(total * 100) / 100` for precision), then formatted at display time.
- **Alternatives considered**:
  - **`currency.js` library** — adds a dependency; `Intl.NumberFormat` covers the requirement. Rejected.
  - **Template literal `$${price.toFixed(2)}`** — does not handle locale-specific thousand separators. Rejected.

---

## Decision 7: Out-of-Stock Simulation

- **Decision**: `OUT_OF_STOCK_IDS = new Set([3, 7])` in `src/constants/index.js`
- **Rationale**: FakeStore API does not expose a stock/availability field. The spec requires out-of-stock handling (FR-016a, FR-016b). A static constant of product IDs is the simplest approach: it is testable, visible in code review, and easily changeable. Products with IDs 3 (Mens Cotton Jacket) and 7 (White Gold Plated Princess) are used as demo out-of-stock items.
- **Any component** determines out-of-stock status by calling `OUT_OF_STOCK_IDS.has(product.id)` — no prop drilling of a boolean needed; the constant is imported directly.
- **Alternatives considered**:
  - **Derive from `rating.count === 0`** — FakeStore data has no products with count 0; unreliable. Rejected.
  - **Mock API endpoint** — MSW could serve a patched product list with a stock field; overkill for this scope. Rejected.

---

## Decision 8: Category Tabs — Derived Dynamically

- **Decision**: `[...new Set(products.map(p => p.category))]` computed from the fetched product array
- **Rationale**: FR-007 explicitly requires category tabs to be "dynamically derived from the category values present in the fetched product data." The FakeStore API returns four categories: `"electronics"`, `"men's clothing"`, `"women's clothing"`, `"jewelery"`. Deriving dynamically means the app automatically adapts if the API adds new categories, with no code change.
- **Implementation**: Computed in `useFilteredProducts.js` hook using `useMemo` to avoid recalculation on every render.

---

## Decision 9: Lazy Loading — `React.lazy` for CartDrawer + ProductDetailModal

- **Decision**: `React.lazy(() => import('...'))` + `<Suspense fallback={<Spinner />}>` in `App.jsx`
- **Rationale**: FR-037 mandates that the cart drawer and product detail view are loaded only when first needed. Both components are heavy organisms with their own dependencies. Lazy loading keeps the initial bundle under the 200 KB gzip target.
- **UX**: The `<Suspense>` fallback is a centred `<Spinner />` atom. It appears only on the first open (subsequent opens use the already-loaded chunk from the browser module cache).

---

## Decision 10: No Text Search

- **Decision**: No text search bar; category filter tabs + sort-by control only
- **Rationale**: Resolved in spec clarification session (Q2 answer: B). Text search was explicitly removed from scope. Only client-side category filter and sort-by (price asc/desc, rating desc) are implemented.

---

## Resolved Deferred Items from spec.md

| Item | Resolution |
|------|-----------|
| Currency locale | `en-US` / USD — FakeStore prices are USD |
| Specific live API endpoint | `https://fakestoreapi.com/products` (GET, no auth) |
| Out-of-stock field | Simulated — `OUT_OF_STOCK_IDS = new Set([3, 7])` |
| Vercel deployment | `vercel.json` SPA rewrite at repo root |
| State manager confirmation | Redux Toolkit (cart) + RTK Query (products) |
| TypeScript vs JavaScript | JavaScript (ES2022+) — explicit user preference |
