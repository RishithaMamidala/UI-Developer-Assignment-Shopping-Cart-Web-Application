import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { PersistGate } from 'redux-persist/integration/react';
import { persistReducer, persistStore, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage/session';
import { server } from '../msw-setup.cjs';
import { productsApi } from '@/features/products/productsApi.js';
import productsReducer from '@/features/products/productsSlice.js';
import cartReducer from '@/features/cart/cartSlice.js';
import App from '@/App.jsx';

const mockProducts = [
  { id: 1, title: 'In Stock A', price: 10.00, description: 'desc', category: 'electronics', image: 'https://fakestoreapi.com/img/a.jpg', rating: { rate: 4.0, count: 10 } },
  { id: 2, title: 'In Stock B', price: 20.00, description: 'desc', category: 'electronics', image: 'https://fakestoreapi.com/img/b.jpg', rating: { rate: 3.5, count: 5 } },
];

function makeStore() {
  // Use unique key per test run to avoid sessionStorage state leakage
  const key = `cart-test-${Date.now()}-${Math.random()}`;
  const cartPersistConfig = { key, storage, whitelist: ['items', 'isOpen'] };
  const persistedCart = persistReducer(cartPersistConfig, cartReducer);
  const store = configureStore({
    reducer: {
      [productsApi.reducerPath]: productsApi.reducer,
      products: productsReducer,
      cart: persistedCart,
    },
    middleware: (gDM) =>
      gDM({
        serializableCheck: {
          ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        },
      }).concat(productsApi.middleware),
  });
  const persistor = persistStore(store);
  return { store, persistor };
}

function renderApp() {
  const { store, persistor } = makeStore();
  const result = render(
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <App />
      </PersistGate>
    </Provider>
  );
  return { store, ...result };
}

beforeEach(() => {
  server.use(
    http.get('https://fakestoreapi.com/products', () => HttpResponse.json(mockProducts))
  );
});

describe('add-to-cart integration', () => {
  it('quantity incremented in listing card is reflected in the detail modal', async () => {
    renderApp();
    await waitFor(() => expect(screen.getAllByRole('article')).toHaveLength(2));

    const firstCard = screen.getAllByRole('article')[0];

    // Increment quantity twice so qty=3
    fireEvent.click(within(firstCard).getByRole('button', { name: /increase quantity/i }));
    fireEvent.click(within(firstCard).getByRole('button', { name: /increase quantity/i }));

    // Open the detail modal
    fireEvent.click(within(firstCard).getByRole('button', { name: /view details/i }));

    // Modal should reflect the same Redux quantity (3)
    await waitFor(() => {
      const dialog = screen.getByRole('dialog');
      expect(within(dialog).getByRole('spinbutton')).toHaveValue(3);
    });
  });

  it('adds product to cart and shows cart badge count', async () => {
    renderApp();
    await waitFor(() => expect(screen.getAllByRole('article')).toHaveLength(2));

    const firstCard = screen.getAllByRole('article')[0];
    const incrementBtn = within(firstCard).getByRole('button', { name: /increase quantity/i });

    fireEvent.click(incrementBtn);
    fireEvent.click(incrementBtn); // quantity = 3
    fireEvent.click(within(firstCard).getByRole('button', { name: /add to cart/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Cart, 3 items' })).toBeInTheDocument();
    });
  });


});
