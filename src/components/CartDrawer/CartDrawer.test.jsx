import { render, screen, fireEvent } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import cartReducer from '@/features/cart/cartSlice.js';
import { productsApi } from '@/features/products/productsApi.js';
import productsReducer from '@/features/products/productsSlice.js';
import CartDrawer from './CartDrawer.jsx';

expect.extend(toHaveNoViolations);

const cartItems = [
  {
    productId: 1,
    title: 'Product A',
    image: 'https://fakestoreapi.com/img/a.jpg',
    price: 10.0,
    quantity: 2,
  },
  {
    productId: 2,
    title: 'Product B',
    image: 'https://fakestoreapi.com/img/b.jpg',
    price: 20.0,
    quantity: 1,
  },
];

function makeStore(items = []) {
  return configureStore({
    reducer: {
      [productsApi.reducerPath]: productsApi.reducer,
      products: productsReducer,
      cart: cartReducer,
    },
    middleware: (gDM) => gDM().concat(productsApi.middleware),
    preloadedState: { cart: { items, isOpen: true } },
  });
}

function renderDrawer(items = cartItems, onClose = jest.fn()) {
  const store = makeStore(items);
  return {
    store,
    onClose,
    ...render(
      <Provider store={store}>
        <CartDrawer onClose={onClose} />
      </Provider>
    ),
  };
}

describe('CartDrawer', () => {
  it('has role="dialog" with aria-modal="true" and aria-label="Shopping cart"', () => {
    renderDrawer();
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-label', 'Shopping cart');
  });

  it('renders one CartLineItem per cart item', () => {
    renderDrawer();
    expect(screen.getByText('Product A')).toBeInTheDocument();
    expect(screen.getByText('Product B')).toBeInTheDocument();
  });

  it('renders order total using selectCartTotal', () => {
    renderDrawer();
    // Total = 10*2 + 20*1 = $40.00
    expect(screen.getByText('$40.00')).toBeInTheDocument();
  });

  it('clicking the backdrop calls onClose', () => {
    const onClose = jest.fn();
    const { container } = renderDrawer(cartItems, onClose);
    const backdrop = container.querySelector('[data-testid="cart-backdrop"]');
    if (backdrop) fireEvent.click(backdrop);
    expect(onClose).toHaveBeenCalled();
  });

  it('clicking close button calls onClose', () => {
    const onClose = jest.fn();
    renderDrawer(cartItems, onClose);
    fireEvent.click(screen.getByRole('button', { name: /close/i }));
    expect(onClose).toHaveBeenCalled();
  });

  it('empty cart shows empty state message', () => {
    renderDrawer([]);
    expect(screen.getByText(/your cart is empty/i)).toBeInTheDocument();
  });

  it('empty cart shows "Continue Shopping" CTA', () => {
    renderDrawer([]);
    expect(screen.getByRole('button', { name: /continue shopping/i })).toBeInTheDocument();
  });

  it('"Continue Shopping" button calls onClose', () => {
    const onClose = jest.fn();
    renderDrawer([], onClose);
    fireEvent.click(screen.getByRole('button', { name: /continue shopping/i }));
    expect(onClose).toHaveBeenCalled();
  });

  it('passes axe accessibility audit', async () => {
    const { container } = renderDrawer();
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
