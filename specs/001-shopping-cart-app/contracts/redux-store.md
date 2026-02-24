# Redux Store Contract: Modern Shopping Cart Web Application

**Feature**: `001-shopping-cart-app` | **Date**: 2026-02-23

---

## Store Configuration (`src/app/store.js`)

```js
import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage/session'; // sessionStorage

import { productsApi } from '../features/products/productsApi';
import productsReducer   from '../features/products/productsSlice';
import cartReducer       from '../features/cart/cartSlice';

const cartPersistConfig = {
  key:       'cart',
  storage,                              // sessionStorage
  whitelist: ['items', 'isOpen'],       // persist cart contents + drawer state
};

const persistedCartReducer = persistReducer(cartPersistConfig, cartReducer);

export const store = configureStore({
  reducer: {
    [productsApi.reducerPath]: productsApi.reducer,  // RTK Query cache (NOT persisted)
    products:                  productsReducer,       // filter/sort UI state (NOT persisted)
    cart:                      persistedCartReducer,  // cart items + open state (PERSISTED)
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(productsApi.middleware),
});

export const persistor = persistStore(store);
export default store;
```

---

## Full Store Shape (Runtime)

```js
{
  // ─── RTK Query Cache (auto-managed, blacklisted from persist) ───────────────
  productsApi: {
    queries: {
      'getProducts(undefined)': {
        status: 'fulfilled' | 'pending' | 'rejected' | 'uninitialized',
        data:   Product[],    // when status === 'fulfilled'
        error:  object,       // when status === 'rejected'
      }
    },
    mutations:       {},
    provided:        {},
    subscriptions:   {},
    config:          { /* RTK Query internal config */ }
  },

  // ─── Products UI State (productsSlice) ──────────────────────────────────────
  products: {
    activeCategory:    'all',   // 'all' | 'electronics' | "men's clothing" | ...
    sortBy:            'none',  // 'none' | 'price_asc' | 'price_desc' | 'rating_desc'
    selectedProductId: null,    // null | number — drives ProductDetailModal
  },

  // ─── Cart State (cartSlice — persisted to sessionStorage) ───────────────────
  cart: {
    items: [
      {
        productId: 1,
        title:     'Fjallraven - Foldsack No. 1 Backpack',
        image:     'https://fakestoreapi.com/img/...',
        price:     109.95,
        quantity:  2,
      },
      // ... more CartItem objects
    ],
    isOpen: false,

    // redux-persist internal metadata (injected automatically):
    _persist: { version: -1, rehydrated: true }
  },
}
```

---

## Slice Contracts

### `cartSlice` (`src/features/cart/cartSlice.js`)

#### Actions

| Action Creator | Payload | Effect |
|----------------|---------|--------|
| `addToCart({ product, quantity })` | `{ product: Product, quantity: number }` | If product exists in cart, increment quantity (capped at `MAX_QUANTITY`). Else push new `CartItem`. |
| `updateQuantity({ productId, quantity })` | `{ productId: number, quantity: number }` | Set item quantity. If `quantity === 0`, remove item. If `quantity > MAX_QUANTITY`, cap at `MAX_QUANTITY`. |
| `removeItem({ productId })` | `{ productId: number }` | Remove item from `items[]`. No-op if not found. |
| `openCart()` | — | `isOpen = true` |
| `closeCart()` | — | `isOpen = false` |

#### Selectors (`src/features/cart/cartSelectors.js`)

| Selector | Returns | Description |
|----------|---------|-------------|
| `selectCartItems(state)` | `CartItem[]` | All items in cart |
| `selectCartCount(state)` | `number` | Total unit count across all items |
| `selectCartTotal(state)` | `number` | Raw USD total (pre-formatted); rounded to 2 decimal places |
| `selectIsCartOpen(state)` | `boolean` | Whether cart drawer is visible |
| `selectCartItemByProductId(state, productId)` | `CartItem \| undefined` | Single item lookup |

---

### `productsSlice` (`src/features/products/productsSlice.js`)

#### Actions

| Action Creator | Payload | Effect |
|----------------|---------|--------|
| `setActiveCategory(category)` | `string` | Update `activeCategory`; triggers `useFilteredProducts` recalculation |
| `setSortBy(sortKey)` | `'none' \| 'price_asc' \| 'price_desc' \| 'rating_desc'` | Update `sortBy`; triggers sort recalculation |
| `setSelectedProduct(id)` | `number` | Open ProductDetailModal for product with this ID |
| `clearSelectedProduct()` | — | Close modal; `selectedProductId = null` |
| `resetFilters()` | — | `activeCategory = 'all'`, `sortBy = 'none'` |

#### Selectors (inline with RTK Query hook or via `useSelector`)

| Selector | Returns |
|----------|---------|
| `state.products.activeCategory` | Active filter tab value |
| `state.products.sortBy` | Active sort key |
| `state.products.selectedProductId` | Product ID for detail modal (null = closed) |

---

## Typed Hooks (`src/app/hooks.js`)

```js
import { useDispatch, useSelector } from 'react-redux';

/**
 * Pre-typed Redux dispatch hook.
 * @returns {import('@reduxjs/toolkit').AppDispatch}
 */
export const useAppDispatch = () => useDispatch();

/**
 * Pre-typed Redux selector hook.
 * @template T
 * @param {function(import('./store').RootState): T} selector
 * @returns {T}
 */
export const useAppSelector = useSelector;
```

---

## Persistence Contract

| Slice | Persisted? | Storage | Reset Condition |
|-------|-----------|---------|-----------------|
| `productsApi` | ❌ No | — | Always fresh (RTK Query re-fetches on mount) |
| `products` | ❌ No | — | Resets to `{ activeCategory: 'all', sortBy: 'none', selectedProductId: null }` on load |
| `cart.items` | ✅ Yes | `sessionStorage` | Cleared when browser tab/session is closed |
| `cart.isOpen` | ✅ Yes | `sessionStorage` | Preserved on refresh (drawer stays open/closed) |

---

## `main.jsx` Wiring

```jsx
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './app/store';
import Spinner from './components/ui/Spinner/Spinner';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={<Spinner />} persistor={persistor}>
        <App />
      </PersistGate>
    </Provider>
  </React.StrictMode>
);
```

The `PersistGate` delays app render until `sessionStorage` rehydration is complete, preventing a flash of empty cart state.
