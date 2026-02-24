# Component Interface Contracts: Modern Shopping Cart Web Application

**Feature**: `001-shopping-cart-app` | **Date**: 2026-02-23

All components are JavaScript (JSX). Props are documented via JSDoc `@param`. No TypeScript types.

---

## Atomic Design Hierarchy

```
ATOMS         MOLECULES              ORGANISMS
──────────    ─────────────────      ─────────────────────────
Button        ProductCard            Header
Badge         CategoryTabs           ProductGrid
QuantitySelector  SortSelect         ProductDetailModal (lazy)
StarRating    CartLineItem           CartDrawer (lazy)
Spinner
Toast
ProductSkeleton
```

---

## ATOMS — `src/components/ui/`

### `Button`

```jsx
/**
 * Base button atom. Used throughout the app for all interactive actions.
 * @param {object} props
 * @param {'primary' | 'secondary' | 'ghost' | 'danger'} [props.variant='primary']
 * @param {'sm' | 'md' | 'lg'} [props.size='md']
 * @param {boolean} [props.disabled=false]
 * @param {boolean} [props.loading=false]     - Shows spinner, disables interaction
 * @param {string} [props.className]          - Additional Tailwind classes
 * @param {React.ReactNode} props.children
 * @param {React.ButtonHTMLAttributes} props  - Spread to <button> element
 */
function Button({ variant, size, disabled, loading, className, children, ...rest }) {}
```

### `Badge`

```jsx
/**
 * Status badge for product states (e.g., "Out of Stock").
 * @param {object} props
 * @param {'error' | 'warning' | 'success' | 'neutral'} [props.variant='neutral']
 * @param {string} props.children - Badge label text
 * @param {string} [props.className]
 */
function Badge({ variant, children, className }) {}
```

### `QuantitySelector`

```jsx
/**
 * Numeric quantity input with increment/decrement buttons.
 * Reused on: ProductCard, ProductDetailModal, CartLineItem.
 * Enforces min/max bounds; shows inline validation on boundary violation.
 * @param {object} props
 * @param {number} props.value                - Current quantity
 * @param {function(number): void} props.onChange  - Called with new quantity
 * @param {number} [props.min=1]              - Minimum allowed value
 * @param {number} [props.max=50]             - Maximum allowed value (MAX_QUANTITY)
 * @param {boolean} [props.disabled=false]    - Disables all controls (out-of-stock)
 * @param {string} [props.label='Quantity']   - Accessible label for screen readers
 * @param {string} [props.className]
 */
function QuantitySelector({ value, onChange, min, max, disabled, label, className }) {}
```

**Accessibility requirements**:
- The decrement `−` button: `aria-label="Decrease quantity"`
- The increment `+` button: `aria-label="Increase quantity"`
- The number input: associated `<label>` via `htmlFor`/`id` pair
- Boundary error message: `role="alert"` + `aria-live="assertive"` (FR-031)
- Boundary error message dismissed automatically via `onBlur` on the wrapper
  `div` when focus moves outside the component (`e.currentTarget.contains(e.relatedTarget)` guard — FR-019)

### `StarRating`

```jsx
/**
 * Visual star rating display. Read-only (not interactive).
 * @param {object} props
 * @param {number} props.rate    - Rating value (0–5)
 * @param {number} props.count   - Number of reviews
 * @param {string} [props.className]
 */
function StarRating({ rate, count, className }) {}
// Renders: aria-label="Rated {rate} out of 5 ({count} reviews)"
```

### `Spinner`

```jsx
/**
 * Loading spinner for transient operations (< 2 seconds).
 * @param {object} props
 * @param {'sm' | 'md' | 'lg'} [props.size='md']
 * @param {string} [props.label='Loading...']  - Screen reader text
 * @param {string} [props.className]
 */
function Spinner({ size, label, className }) {}
// Renders: <div role="status" aria-label={label}>
```

### `Toast`

```jsx
/**
 * Non-blocking success/error notification. Auto-dismisses after 3 seconds.
 * @param {object} props
 * @param {string} props.message
 * @param {'success' | 'error'} [props.variant='success']
 * @param {function(): void} [props.onDismiss]
 */
function Toast({ message, variant, onDismiss }) {}
// Renders: <div role="status" aria-live="polite"> (FR-021)
```

### `ProductSkeleton`

```jsx
/**
 * Animated skeleton placeholder matching ProductCard dimensions.
 * Prevents CLS during API fetch (FR-003).
 * @param {object} props
 * @param {string} [props.className]
 */
function ProductSkeleton({ className }) {}
// Renders: aria-hidden="true" (decorative — screen reader reads "Loading products")
```

---

## MOLECULES

### `ProductCard`

```jsx
/**
 * Product listing card. Displays product info + quantity selector + add-to-cart.
 * Clicking the card body (not button/selector) calls onOpenDetail.
 * @param {object} props
 * @param {import('../../features/products/productSchema').Product} props.product
 * @param {boolean} props.isOutOfStock         - Drives badge + disabled state (FR-016a)
 * @param {function(number): void} props.onOpenDetail  - Called with product.id on card click
 */
function ProductCard({ product, isOutOfStock, onOpenDetail }) {}
```

**Internals**: `ProductCard` is connected to Redux (dispatches `addToCart`). It holds local state for the card-level quantity selector (default 1, resets after add).

### `CategoryTabs`

```jsx
/**
 * Horizontal scrollable tab list for filtering by product category.
 * "All Categories" is always the first tab (FR-008).
 * @param {object} props
 * @param {string[]} props.categories          - Derived category list from API data
 * @param {string} props.activeCategory        - Currently selected category or 'all'
 * @param {function(string): void} props.onChange  - Dispatches setActiveCategory
 */
function CategoryTabs({ categories, activeCategory, onChange }) {}
// Renders: role="tablist" + role="tab" + aria-selected (FR-031)
```

### `SortSelect`

```jsx
/**
 * Sort-by dropdown control.
 * @param {object} props
 * @param {'none' | 'price_asc' | 'price_desc' | 'rating_desc'} props.value
 * @param {function(string): void} props.onChange  - Dispatches setSortBy
 */
function SortSelect({ value, onChange }) {}
// Renders: <select> with associated <label>
```

### `CartLineItem`

```jsx
/**
 * Single item row inside the cart drawer.
 * @param {object} props
 * @param {import('../../features/cart/cartSlice').CartItem} props.item
 * @param {function(number): void} props.onQuantityChange  - Dispatches updateQuantity
 * @param {function(): void} props.onRemove                - Dispatches removeItem
 */
function CartLineItem({ item, onQuantityChange, onRemove }) {}
```

---

## ORGANISMS

### `Header`

```jsx
/**
 * Top navigation bar. Contains logo, cart icon with item-count badge, and open-cart button.
 * Sticky — remains visible during scroll.
 * @param {object} props
 * @param {function(): void} props.onOpenCart  - Dispatches openCart
 * @param {number} props.cartCount             - From selectCartCount selector
 */
function Header({ onOpenCart, cartCount }) {}
// Cart button: aria-label=`Cart, ${cartCount} items` (FR-020, FR-031)
```

### `ProductGrid`

```jsx
/**
 * Product listing organism. Manages all fetch states and renders ProductCards.
 * @param {object} props
 * @param {import('../../features/products/productSchema').Product[]} props.products
 *        - Already filtered + sorted by useFilteredProducts hook
 * @param {boolean} props.isLoading            - Renders skeleton grid (FR-003)
 * @param {boolean} props.isError              - Renders error state with retry (FR-004)
 * @param {boolean} props.isEmpty              - Renders empty state (FR-005, FR-011)
 * @param {'api-error' | 'filter-empty'} [props.emptyVariant] - Which empty state to show
 * @param {function(): void} props.onRetry     - Calls refetch() on API error
 * @param {function(): void} props.onClearFilters - Dispatches resetFilters
 */
function ProductGrid({ products, isLoading, isError, isEmpty, emptyVariant, onRetry, onClearFilters }) {}
```

### `ProductDetailModal` (lazy loaded)

```jsx
/**
 * Full-screen product detail modal overlay. Loaded lazily via React.lazy (FR-037).
 * Displays all product attributes + quantity selector + Add to Cart.
 * Focus is trapped inside the modal when open (FR-031, FR-032).
 * @param {object} props
 * @param {number} props.productId             - ID of product to display
 * @param {function(): void} props.onClose     - Dispatches clearSelectedProduct
 */
function ProductDetailModal({ productId, onClose }) {}
// Renders: role="dialog" aria-modal="true" aria-labelledby={titleId}
// Closes on: close button click, Escape key, backdrop click
```

**Data source**: Reads from RTK Query cache (`useGetProductsQuery().data.find(p => p.id === productId)`). No additional API call.

### `CartDrawer` (lazy loaded)

```jsx
/**
 * Slide-out cart drawer from the right edge. Loaded lazily via React.lazy (FR-037).
 * Lists all CartLineItems, shows order total, handles empty cart state.
 * @param {object} props
 * @param {boolean} props.isOpen               - From selectIsCartOpen selector
 * @param {function(): void} props.onClose     - Dispatches closeCart
 */
function CartDrawer({ isOpen, onClose }) {}
// Renders: role="dialog" aria-modal="true" aria-label="Shopping cart"
// Backdrop click or close button → onClose()
```

---

## Component ↔ Redux Connections

| Component | Reads from Store | Dispatches Actions |
|-----------|-----------------|-------------------|
| `Header` | `selectCartCount` | `openCart` |
| `ProductGrid` | `useGetProductsQuery()` | `setSelectedProduct` (via card click handler) |
| `ProductCard` | `OUT_OF_STOCK_IDS` (constant) | `addToCart` |
| `CategoryTabs` | `products.activeCategory` | `setActiveCategory` |
| `SortSelect` | `products.sortBy` | `setSortBy` |
| `ProductDetailModal` | `products.selectedProductId`, RTK Query cache | `addToCart`, `clearSelectedProduct` |
| `CartDrawer` | `selectCartItems`, `selectCartTotal`, `selectIsCartOpen` | `updateQuantity`, `removeItem`, `closeCart` |
| `CartLineItem` | via `CartDrawer` props | via `CartDrawer` callbacks |

---

## Co-located Test File Convention

Every component directory contains a `<ComponentName>.test.jsx` file. Minimum test coverage:

| Test Case | Required? |
|-----------|-----------|
| Renders without crashing | ✅ |
| Accessibility audit (jest-axe `toHaveNoViolations`) | ✅ |
| Loading state renders correctly | ✅ (where applicable) |
| Error state renders correctly | ✅ (where applicable) |
| Empty state renders correctly | ✅ (where applicable) |
| Interactive behaviour (click, keyboard) | ✅ |
| Out-of-stock disabled state | ✅ (ProductCard, ProductDetailModal) |
| Quantity boundary (min=1, max=50) | ✅ (QuantitySelector, ProductCard) |
