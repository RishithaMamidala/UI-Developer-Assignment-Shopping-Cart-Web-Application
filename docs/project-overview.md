# Kibo Strore— Project Documentation

## Overview

Kibo is a single-page shopping cart application built with React. The goal was straightforward: give users a product catalogue they can browse, filter, and sort, then let them manage a shopping cart that persists across page reloads within the same browser session. There is no checkout or payment flow — the cart review is the final step.

The project runs entirely in the browser with no backend of its own. Product data comes from the public FakeStore API (`https://fakestoreapi.com/products`), and everything else — filtering, sorting, cart arithmetic — is computed client-side.

---

## Technology Choices

The stack was chosen to be modern but pragmatic. React 18 handles the UI, Vite 5 handles bundling and local development, and Tailwind CSS v3 handles styling through utility classes with a small set of custom design tokens. The codebase is plain JavaScript (ES2022+) with JSDoc comments.

State management is split into two concerns. The Redux Toolkit handles cart state and UI state (active category, sort order, which product modal is open). RTK Query, which is part of the Redux Toolkit ecosystem, handles all API data fetching with built-in caching and retry logic. This division means there are no raw `useEffect` fetch patterns in the codebase everything goes through RTK Query.

---

## Project Structure

The source code lives in `src/` and follows Atomic Design principles.

**`src/app/`** holds the Redux store configuration and shared hooks (`useAppDispatch`, `useAppSelector`). The store brings together three reducers: the RTK Query API cache, the products UI slice, and the cart slice (which is wrapped in `redux-persist`).

**`src/components/ui/`** holds the atom-level components: `Button`, `Badge`, `QuantitySelector`, `StarRating`, `Spinner` and `ProductSkeleton`. These are generic, reusable, and have no knowledge of application state.

**`src/components/`** holds molecules and organisms. `ProductCard` and `CartLineItem` are molecules — they compose atoms and accept props but remain relatively self-contained. `Header`, `ProductGrid`, `ProductDetailModal`, and `CartDrawer` are organisms that wire directly into Redux state. The modal and drawer are code-split with `React.lazy` so they do not affect the initial page load.

**`src/features/`** is split into `products/` and `cart/`. The products feature contains the RTK Query API definition and the productsSlice (UI state for filters and the selected product ID). The cart feature contains the cartSlice and its selectors.

**`src/hooks/`** holds `useFilteredProducts`, a custom hook that reads API data and Redux filter/sort state and returns a sorted, filtered product list via `useMemo`.

**`src/utils/`** holds `currency.js`, which exports `formatPrice()` using `Intl.NumberFormat`. This is the only way prices are formatted anywhere in the app, template literals are never used for prices.

**`src/constants/`** holds the single constants file. `MAX_QUANTITY` (50) and `API_TIMEOUT` (10,000 ms).

---

## How the API Works

There is one API endpoint: `GET /products`. RTK Query wraps this in a `createApi` call with a 10-second timeout and up to three automatic retries on failure. The response goes through `transformResponse`.

The response goes through a plain JS filter in `transformResponse`. Products with missing required fields, non-positive prices, or empty image URLs are silently dropped before the data reaches Redux.

The validated product list is cached in Redux. Any component that needs product data calls `useGetProductsQuery()` and gets back the loading state, error state, and data automatically.

---

## State Management

**Cart state** lives in the `cartSlice`. Each cart item stores the product ID, title, image, price, and quantity. Two actions handle quantity changes: `addToCart` merges quantities if the product is already in the cart (capped at `MAX_QUANTITY`), and `updateQuantity` removes the item if the new quantity is zero. The cart slice is wrapped in `redux-persist` configured to use `sessionStorage`, so the cart survives page refreshes but is cleared when the browser tab is closed.

**Products UI state** lives in the `productsSlice`. It holds the active category filter, the current sort order, the ID of the product whose modal is open, and a `productQuantities` map. The quantity map deserves explanation: both `ProductCard` (on the listing page) and `ProductDetailModal` (in the modal) need to show the same quantity for a given product. Lifting that state into Redux, rather than keeping independent `useState` values — ensures they stay in sync.

**Selectors** in `cartSelectors.js` compute derived values from cart state: the total item count for the header badge, the total price, and whether the drawer is open. These are used throughout the app rather than repeating the same reduce logic in multiple components.

---

## Filtering and Sorting

Categories come directly from the product data — there is no hardcoded category list. `CategoryTabs` reads the unique categories from the API response and renders a tab for each. Selecting a tab dispatches `setActiveCategory` to Redux.

`SortSelect` offers three options: price ascending, price descending, and rating descending. Selecting one dispatches `setSortBy`.

`useFilteredProducts` is where both concerns meet. It reads the full product list from RTK Query, the active category from Redux, and the sort order from Redux, then returns the filtered and sorted result via `useMemo`. This means filtering and sorting happen in one place, and the memoization ensures they only recompute when their inputs change.

---

## Component Highlights

**QuantitySelector** is a spinbutton-style control used on both the product listing and the detail modal. It validates input against a minimum of 1 and a maximum of `MAX_QUANTITY`. Validation errors clear on blur once the user moves focus away.

**ProductDetailModal** receives a `productId` rather than a full product object. It looks up the product from the RTK Query cache using that ID. This was a deliberate change from an earlier design that passed the full product as a prop — the ID-based approach ensures the modal always reflects the cached (validated) data rather than whatever object happened to be passed to it.

**CartDrawer** is a slide-in panel that shows all cart line items with their quantities, individual prices, and the order total. It opens when the user clicks the cart button in the header. The order total is computed by a selector and formatted with `formatPrice()`.

**Header** shows the Kibo name and a cart icon with a badge. The badge count is the sum of all item quantities in the cart (so two units of one product count as two).

---

## Testing

The project uses Test-Driven Development. A failing test is written before each piece of functionality is implemented. 

Coverage thresholds are enforced by Jest:

- Utilities: 95% statements, 90% branches, 100% functions
- Hooks and features: 90% statements, 85% branches, 95% functions
- Global: 85% statements, 80% branches, 90% functions

MSW v2 handles API mocking. A single shared server is initialized in `jest.setup.cjs` and individual tests override specific handlers with 

Playwright covers two end-to-end flows: browsing the catalogue (skeleton loading, product rendering, no horizontal overflow across three viewports) and adding to cart (quantity selector, cart badge increment, drawer contents, order total). Tests run against `localhost:4173` (the Vite preview server) via a `PLAYWRIGHT_BASE_URL` environment variable.

`redux-persist` in tests requires isolated state. Each test that involves the store uses a unique persist key to prevent state leaking from one test to the next via `sessionStorage`.

---

## Deployment

The app deploys to Vercel as a static SPA. `vercel.json` contains a rewrite rule that sends all requests to `index.html`, which is required for client-side routing to work. The same file sets Content Security Policy headers that allow images from the FakeStore CDN and API calls to `fakestoreapi.com` while blocking everything else.