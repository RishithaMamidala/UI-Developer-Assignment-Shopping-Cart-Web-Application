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
  { id: 1, title: 'Alpha', price: 10.00, description: 'desc', category: 'electronics', image: 'https://fakestoreapi.com/img/a.jpg', rating: { rate: 4.0, count: 10 } },
  { id: 2, title: 'Beta',  price: 20.00, description: 'desc', category: 'electronics', image: 'https://fakestoreapi.com/img/b.jpg', rating: { rate: 3.5, count: 5 } },
  { id: 4, title: 'Delta', price: 30.00, description: 'desc', category: 'jewelery',    image: 'https://fakestoreapi.com/img/d.jpg', rating: { rate: 4.2, count: 8 } },
];

function makeStore() {
  const key = `cart-mgmt-${Date.now()}-${Math.random()}`;
  const cartPersistConfig = { key, storage, whitelist: ['items', 'isOpen'] };
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

function renderApp() {
  const { store, persistor } = makeStore();
  render(
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <App />
      </PersistGate>
    </Provider>
  );
  return store;
}

beforeEach(() => {
  server.use(
    http.get('https://fakestoreapi.com/products', () => HttpResponse.json(mockProducts))
  );
});

function addItemToCart(cardIndex, extraIncrements = 0) {
  const card = screen.getAllByRole('article')[cardIndex];
  for (let i = 0; i < extraIncrements; i++) {
    fireEvent.click(within(card).getByRole('button', { name: /increase quantity/i }));
  }
  fireEvent.click(within(card).getByRole('button', { name: /add to cart/i }));
}

async function openCart() {
  // Use exact regex to match "Cart, N items" not "Add to Cart"
  const cartBtn = screen.getAllByRole('button').find(
    (btn) => /^Cart, \d+ items$/.test(btn.getAttribute('aria-label') ?? '')
  );
  fireEvent.click(cartBtn);
  await waitFor(() => screen.getByRole('dialog', { name: /shopping cart/i }));
}

describe('cart-management integration', () => {
  it('adds two products and cart drawer shows correct items and total', async () => {
    renderApp();
    await waitFor(() => expect(screen.getAllByRole('article')).toHaveLength(3));

    // Add Alpha (qty=2) and Beta (qty=1)
    addItemToCart(0, 1); // Alpha qty=2
    addItemToCart(1, 0); // Beta qty=1

    await openCart();

    const drawer = screen.getByRole('dialog', { name: /shopping cart/i });
    expect(within(drawer).getByText('Alpha')).toBeInTheDocument();
    expect(within(drawer).getByText('Beta')).toBeInTheDocument();

    // Total = 10*2 + 20*1 = $40.00
    await waitFor(() => {
      expect(within(drawer).getByText('$40.00')).toBeInTheDocument();
    });
  });

  it('updating quantity in cart drawer updates subtotal and total', async () => {
    renderApp();
    await waitFor(() => expect(screen.getAllByRole('article')).toHaveLength(3));

    // Add Alpha (qty=2)
    addItemToCart(0, 1);

    await openCart();

    // Alpha: qty=2, subtotal=$20.00
    const drawer = screen.getByRole('dialog', { name: /shopping cart/i });

    // Increment qty in drawer to 3
    fireEvent.click(within(drawer).getByRole('button', { name: /increase quantity/i }));

    // Subtotal = $30.00, total = $30.00 (single item)
    await waitFor(() => {
      // Both the line item subtotal and the order total show $30.00
      expect(within(drawer).getAllByText('$30.00').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('removing a product from cart drawer removes it', async () => {
    renderApp();
    await waitFor(() => expect(screen.getAllByRole('article')).toHaveLength(3));

    addItemToCart(0, 0); // Alpha qty=1
    addItemToCart(1, 0); // Beta qty=1

    await openCart();

    const drawer = screen.getByRole('dialog', { name: /shopping cart/i });
    expect(within(drawer).getByText('Alpha')).toBeInTheDocument();
    expect(within(drawer).getByText('Beta')).toBeInTheDocument();

    // Remove Beta (second item in cart) — two-step: open modal then confirm
    const removeButtons = within(drawer).getAllByRole('button', { name: /remove beta/i });
    fireEvent.click(removeButtons[0]);
    const confirmModal = screen.getByRole('dialog', { name: /remove all/i });
    fireEvent.click(within(confirmModal).getByRole('button', { name: /^remove$/i }));

    await waitFor(() => {
      expect(within(drawer).queryByText('Beta')).not.toBeInTheDocument();
    });
    expect(within(drawer).getByText('Alpha')).toBeInTheDocument();
  });

  it('empty cart shows empty state in drawer', async () => {
    renderApp();
    await waitFor(() => expect(screen.getAllByRole('article')).toHaveLength(3));

    await openCart();

    expect(screen.getByText(/your cart is empty/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /continue shopping/i })).toBeInTheDocument();
  });
});
