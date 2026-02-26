import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { PersistGate } from 'redux-persist/integration/react';
import { persistReducer, persistStore, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage/session';
import { productsApi } from '@/features/products/productsApi.js';
import productsReducer from '@/features/products/productsSlice.js';
import cartReducer from '@/features/cart/cartSlice.js';
import App from '@/App.jsx';

const PERSIST_KEY = 'cart-persist-test';

// Pre-populate sessionStorage with a serialized redux-persist cart state.
// redux-persist v6 double-serializes: each value in the outer JSON is itself JSON.stringify'd.
function seedSessionStorage(items) {
  const persistedState = JSON.stringify({
    items: JSON.stringify(items),
    isOpen: JSON.stringify(false),
    _persist: JSON.stringify({ version: -1, rehydrated: true }),
  });
  sessionStorage.setItem(`persist:${PERSIST_KEY}`, persistedState);
}

function makeStore() {
  const cartPersistConfig = { key: PERSIST_KEY, storage, whitelist: ['items', 'isOpen'] };
  const persistedCart = persistReducer(cartPersistConfig, cartReducer);
  const store = configureStore({
    reducer: {
      [productsApi.reducerPath]: productsApi.reducer,
      products: productsReducer,
      cart: persistedCart,
    },
    middleware: (gDM) =>
      gDM({ serializableCheck: { ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER] } })
        .concat(productsApi.middleware),
  });
  const persistor = persistStore(store);
  return { store, persistor };
}

beforeEach(() => {
  sessionStorage.clear();
});

describe('cart-persistence integration', () => {
  it('rehydrates cart count from sessionStorage before API resolves', async () => {
    const persistedItems = [
      { productId: 10, title: 'Persisted A', image: 'https://fakestoreapi.com/img/a.jpg', price: 15, quantity: 3 },
      { productId: 11, title: 'Persisted B', image: 'https://fakestoreapi.com/img/b.jpg', price: 25, quantity: 2 },
    ];
    seedSessionStorage(persistedItems);

    const { store, persistor } = makeStore();

    render(
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <App />
        </PersistGate>
      </Provider>
    );

    // Cart badge should show 5 (3+2) after rehydration — even if API hasn't responded yet
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Cart, 5 items' })).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('persisted cart items are visible in cart drawer', async () => {
    const persistedItems = [
      { productId: 1, title: 'Persisted Widget', image: 'https://fakestoreapi.com/img/a.jpg', price: 10, quantity: 1 },
    ];
    seedSessionStorage(persistedItems);

    const { store, persistor } = makeStore();

    render(
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <App />
        </PersistGate>
      </Provider>
    );

    // Open cart
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Cart, 1 items' })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Cart, 1 items' }));

    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: /shopping cart/i })).toBeInTheDocument();
    });

    expect(screen.getByText('Persisted Widget')).toBeInTheDocument();
  });

  it('cart operations work correctly with already-loaded data (offline resilience)', async () => {
    const persistedItems = [
      { productId: 5, title: 'Offline Item', image: 'https://fakestoreapi.com/img/e.jpg', price: 50, quantity: 2 },
    ];
    seedSessionStorage(persistedItems);

    const { store, persistor } = makeStore();

    render(
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <App />
        </PersistGate>
      </Provider>
    );

    // Wait for cart to rehydrate
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Cart, 2 items' })).toBeInTheDocument();
    });

    // Open cart
    fireEvent.click(screen.getByRole('button', { name: 'Cart, 2 items' }));

    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: /shopping cart/i })).toBeInTheDocument();
    });

    // Remove the item — two-step: open modal then confirm
    fireEvent.click(screen.getByRole('button', { name: /remove offline item/i }));
    const confirmModal = screen.getByRole('dialog', { name: /remove all/i });
    fireEvent.click(within(confirmModal).getByRole('button', { name: /^remove$/i }));

    // Cart should be empty
    await waitFor(() => {
      expect(screen.getByText(/your cart is empty/i)).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: 'Cart, 0 items' })).toBeInTheDocument();
  });
});
