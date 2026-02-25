# Data Model: Modern Shopping Cart Web Application

**Feature**: `001-shopping-cart-app` | **Date**: 2026-02-23

---

## 1. External API Entity — `Product`

Source: `GET https://fakestoreapi.com/products`

### FakeStore API Response Shape

```json
{
  "id": 1,
  "title": "Fjallraven - Foldsack No. 1 Backpack, Fits 15 Laptops",
  "price": 109.95,
  "description": "Your perfect pack for everyday use and walks in the forest...",
  "category": "men's clothing",
  "image": "https://fakestoreapi.com/img/81fAn2...",
  "rating": {
    "rate": 3.9,
    "count": 120
  }
}
```

### Known Categories (FakeStore)
- `"electronics"`
- `"men's clothing"`
- `"women's clothing"`
- `"jewelery"`

### Validation (`src/features/products/productsApi.js` — `parseProducts`)

```js
// Plain JS filter inside RTK Query transformResponse
// Drops any item missing required fields, with price ≤ 0, or with empty image
function parseProducts(raw) {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (p) =>
      p &&
      typeof p.id === 'number' &&
      typeof p.title === 'string' && p.title.length > 0 &&
      typeof p.price === 'number' && p.price > 0 &&
      typeof p.description === 'string' &&
      typeof p.category === 'string' &&
      typeof p.image === 'string' && p.image.length > 0 &&
      p.rating !== null && typeof p.rating === 'object' &&
      typeof p.rating.rate === 'number' &&
      typeof p.rating.count === 'number'
  );
}
```

### JSDoc Typedef

```js
/**
 * @typedef {object} Product
 * @property {number} id           - Unique product identifier
 * @property {string} title        - Full product name
 * @property {number} price        - Unit price in USD
 * @property {string} description  - Full product description
 * @property {string} category     - Product category (derived for filter tabs)
 * @property {string} image        - Absolute image URL
 * @property {{ rate: number, count: number }} rating - Average rating (0–5) and review count
 */
```

### Validation Rules

| Field | Rule | FR Reference |
|-------|------|-------------|
| `id` | Positive integer | Identity key for deduplication in cart |
| `price` | Non-negative number; products with `price === 0` are filtered out | FR-033 (malformed data) |
| `image` | Valid URL; products with invalid image are filtered out | FR-006 (broken image handling) |
| `rating.rate` | 0–5 inclusive | Displayed in `StarRating` component |

---

## 2. App Entity — `CartItem`

Stored in Redux `cartSlice.items[]`. Derived from a `Product` when the user adds to cart.

### Shape

```js
/**
 * @typedef {object} CartItem
 * @property {number} productId  - References Product.id
 * @property {string} title      - Snapshot of Product.title at add-time
 * @property {string} image      - Snapshot of Product.image at add-time
 * @property {number} price      - Snapshot of Product.price at add-time (USD)
 * @property {number} quantity   - Current quantity in cart (1–MAX_QUANTITY)
 */
```

### Why snapshot fields?

Product data is not re-fetched after adding to cart. Title, image, and price are copied into the cart item at add-time to ensure the cart drawer displays correctly even if the RTK Query cache is invalidated (e.g., on page refresh).

### Validation Rules

| Field | Rule | FR Reference |
|-------|------|-------------|
| `quantity` | Integer, 1 ≤ quantity ≤ 50 | FR-019, FR-025 |
| `productId` | Must match a valid Product.id | FR-018 (no duplicates) |

---

## 3. Redux State — `CartState`

Managed by `src/features/cart/cartSlice.js`. Persisted to `sessionStorage` via `redux-persist`.

```js
// Initial state
{
  items: [],      // CartItem[]
  isOpen: false   // Whether the cart drawer is visible
}
```

### Reducers / Actions

| Action | Payload | Behaviour |
|--------|---------|-----------|
| `addToCart` | `{ product: Product, quantity: number }` | If `productId` already in `items`, increment `quantity` by payload (capped at 50). Else push new `CartItem`. |
| `updateQuantity` | `{ productId: number, quantity: number }` | Set item quantity. If `quantity === 0`, remove item. |
| `removeItem` | `{ productId: number }` | Filter item out of `items[]`. |
| `openCart` | — | Set `isOpen: true` |
| `closeCart` | — | Set `isOpen: false` |

### Derived Values (Selectors — `cartSelectors.js`)

| Selector | Formula | SC Reference |
|----------|---------|-------------|
| `selectCartCount` | `items.reduce((s, i) => s + i.quantity, 0)` | SC-001 (badge) |
| `selectCartTotal` | `Math.round(items.reduce((s, i) => s + i.price * i.quantity, 0) * 100) / 100` | SC-003 (rounding) |
| `selectCartItems` | `state.cart.items` | — |
| `selectIsCartOpen` | `state.cart.isOpen` | — |

> **Important**: Total is always computed, never stored. Formatted at display time via `formatPrice()`. This prevents floating-point accumulated errors.

### State Transitions

```
addToCart(qty):
  existing item → item.quantity = min(item.quantity + qty, MAX_QUANTITY)
  new item      → items.push({ productId, title, image, price, quantity: qty })

updateQuantity(qty):
  qty === 0 → remove item
  qty > 0   → item.quantity = min(qty, MAX_QUANTITY)

removeItem(productId):
  items = items.filter(i => i.productId !== productId)
```

---

## 4. Redux State — `ProductsUIState`

Managed by `src/features/products/productsSlice.js`. **Not persisted** — resets to defaults on page load.

```js
// Initial state
{
  activeCategory:    'all',   // 'all' | any category string from API
  sortBy:            'none',  // 'none' | 'price_asc' | 'price_desc' | 'rating_desc'
  selectedProductId: null     // null | number — drives ProductDetailModal open state
}
```

### Reducers / Actions

| Action | Payload | Behaviour |
|--------|---------|-----------|
| `setActiveCategory` | `string` | Set `activeCategory`; grid updates client-side |
| `setSortBy` | `'none' \| 'price_asc' \| 'price_desc' \| 'rating_desc'` | Set `sortBy`; grid reorders client-side |
| `setSelectedProduct` | `number` | Open product detail modal |
| `clearSelectedProduct` | — | Close modal; listing state unchanged |
| `resetFilters` | — | Reset `activeCategory = 'all'`, `sortBy = 'none'` |

### Filter + Sort Logic (`useFilteredProducts.js`)

```js
// Pseudocode — implemented with useMemo
filtered = activeCategory === 'all'
  ? products
  : products.filter(p => p.category === activeCategory)

sorted = sortBy === 'price_asc'  ? [...filtered].sort((a,b) => a.price - b.price)
       : sortBy === 'price_desc' ? [...filtered].sort((a,b) => b.price - a.price)
       : sortBy === 'rating_desc'? [...filtered].sort((a,b) => b.rating.rate - a.rating.rate)
       : filtered  // 'none' — preserve API order
```

---

## 5. Relationships

```
FakeStore API
  └── GET /products → Product[]
        │
        ├── Displayed in: ProductCard, ProductDetailModal
        ├── Filtered by:  productsSlice.activeCategory
        ├── Sorted by:    productsSlice.sortBy
        │
        └── addToCart() →  CartItem (snapshot of: id, title, image, price)
                                │
                                └── stored in cartSlice.items[]
                                      │
                                      ├── displayed in: CartDrawer → CartLineItem
                                      └── derived:      cartTotal, cartCount (selectors)
```

---

## 6. Constants (`src/constants/index.js`)

```js
export const MAX_QUANTITY = 50;          // FR-019: maximum per line item
export const API_TIMEOUT  = 10_000;      // FR-036: 10 seconds in ms

// Products simulated as out-of-stock (FakeStore has no stock field)
// FR-016a, FR-016b: badge + disabled controls
export const OUT_OF_STOCK_IDS = new Set([3, 7]);
```

---

## 7. Utility Functions

### `src/utils/currency.js`
```js
/**
 * Format a numeric USD amount for display.
 * Uses Intl.NumberFormat to avoid floating-point display bugs (SC-003).
 * @param {number} amount - Raw USD value (e.g., 109.95)
 * @returns {string} Formatted price (e.g., "$109.95")
 */
export function formatPrice(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}
```

### `src/utils/validation.js`
```js
/**
 * Validate a quantity value against business rules.
 * @param {unknown} value - Raw input value
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateQuantity(value) {
  const n = Number(value);
  if (!Number.isInteger(n)) return { valid: false, error: 'Quantity must be a whole number' };
  if (n < 1)            return { valid: false, error: 'Quantity must be at least 1' };
  if (n > MAX_QUANTITY) return { valid: false, error: `Quantity cannot exceed ${MAX_QUANTITY}` };
  return { valid: true };
}
```
