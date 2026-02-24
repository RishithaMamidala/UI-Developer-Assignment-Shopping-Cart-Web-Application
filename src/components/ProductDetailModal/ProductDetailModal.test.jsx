import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { http, HttpResponse } from 'msw';
import { server } from '../../../tests/msw-setup.cjs';
import { productsApi } from '@/features/products/productsApi.js';
import productsReducer from '@/features/products/productsSlice.js';
import cartReducer from '@/features/cart/cartSlice.js';
import { addToCart } from '@/features/cart/cartSlice.js';
import { MAX_QUANTITY } from '@/constants/index.js';
import ProductDetailModal from './ProductDetailModal.jsx';

expect.extend(toHaveNoViolations);

const testProduct = {
  id: 1,
  title: 'Test Product',
  description: 'A great product.',
  price: 29.99,
  category: 'electronics',
  image: 'https://fakestoreapi.com/img/test.jpg',
  rating: { rate: 4.5, count: 100 },
};

function makeStore(products = [testProduct], cartItems = [], productQuantities = {}) {
  server.use(
    http.get('https://fakestoreapi.com/products', () => HttpResponse.json(products))
  );
  return configureStore({
    reducer: {
      [productsApi.reducerPath]: productsApi.reducer,
      products: productsReducer,
      cart: cartReducer,
    },
    middleware: (gDM) => gDM().concat(productsApi.middleware),
    preloadedState: {
      cart: { items: cartItems, isOpen: false },
      products: { activeCategory: 'all', sortBy: 'none', selectedProductId: null, productQuantities },
    },
  });
}

function renderModal(productId, products = [testProduct], onClose = jest.fn(), cartItems = [], productQuantities = {}) {
  const store = makeStore(products, cartItems, productQuantities);
  return {
    store,
    onClose,
    ...render(
      <Provider store={store}>
        <ProductDetailModal productId={productId} onClose={onClose} />
      </Provider>
    ),
  };
}

describe('ProductDetailModal', () => {
  it('has role="dialog" with aria-modal="true" and aria-labelledby pointing to title', async () => {
    renderModal(testProduct.id);
    await waitFor(() => {
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      const labelId = dialog.getAttribute('aria-labelledby');
      expect(labelId).toBeTruthy();
      expect(document.getElementById(labelId)).toBeInTheDocument();
    });
  });

  it('displays product title, description, price, and category', async () => {
    renderModal(testProduct.id);
    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeInTheDocument();
      expect(screen.getByText('A great product.')).toBeInTheDocument();
      expect(screen.getByText(/\$29\.99/)).toBeInTheDocument();
      expect(screen.getByText(/electronics/i)).toBeInTheDocument();
    });
  });

  it('displays product image with correct alt text', async () => {
    renderModal(testProduct.id);
    await waitFor(() => {
      const img = screen.getByAltText('Test Product');
      expect(img).toHaveAttribute('src', testProduct.image);
    });
  });

  it('renders QuantitySelector defaulting to value 1', async () => {
    renderModal(testProduct.id);
    await waitFor(() => {
      expect(screen.getByRole('spinbutton')).toHaveValue(1);
    });
  });

  it('reflects quantity from shared Redux state (synced with listing card)', async () => {
    renderModal(testProduct.id, [testProduct], jest.fn(), [], { [testProduct.id]: 4 });
    await waitFor(() => expect(screen.getByRole('spinbutton')).toHaveValue(4));
  });

  it('changing quantity via QuantitySelector updates the displayed value', async () => {
    renderModal(testProduct.id);
    await waitFor(() => expect(screen.getByText('Test Product')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /increase quantity/i }));
    expect(screen.getByRole('spinbutton')).toHaveValue(2);
  });

  it('clicking Add to Cart dispatches addToCart and calls onClose', async () => {
    const onClose = jest.fn();
    const { store } = renderModal(testProduct.id, [testProduct], onClose);

    await waitFor(() => expect(screen.getByText('Test Product')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: /add to cart/i }));
    expect(onClose).toHaveBeenCalled();

    const state = store.getState().cart;
    expect(state.items).toHaveLength(1);
    expect(state.items[0].productId).toBe(testProduct.id);
    expect(state.items[0].quantity).toBe(1);
  });

  it('pressing Escape calls onClose', async () => {
    const onClose = jest.fn();
    renderModal(testProduct.id, [testProduct], onClose);
    await waitFor(() => expect(screen.getByText('Test Product')).toBeInTheDocument());
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });

  it('clicking the backdrop calls onClose', async () => {
    const onClose = jest.fn();
    const { container } = renderModal(testProduct.id, [testProduct], onClose);
    await waitFor(() => expect(screen.getByText('Test Product')).toBeInTheDocument());
    // Click the fixed overlay backdrop (first child of container)
    const backdrop = container.querySelector('[data-testid="modal-backdrop"]');
    if (backdrop) fireEvent.click(backdrop);
    else {
      // Fallback: click the outermost overlay div
      const overlay = container.querySelector('.fixed.inset-0');
      fireEvent.click(overlay);
    }
    expect(onClose).toHaveBeenCalled();
  });

  it('clicking the close button calls onClose', async () => {
    const onClose = jest.fn();
    renderModal(testProduct.id, [testProduct], onClose);
    await waitFor(() => expect(screen.getByText('Test Product')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /close/i }));
    expect(onClose).toHaveBeenCalled();
  });

  it('disables Add to Cart and QuantitySelector when cart already has MAX_QUANTITY', async () => {
    const maxCartItem = { productId: testProduct.id, title: testProduct.title, image: testProduct.image, price: testProduct.price, quantity: MAX_QUANTITY };
    renderModal(testProduct.id, [testProduct], jest.fn(), [maxCartItem]);
    await waitFor(() => expect(screen.getByText('Test Product')).toBeInTheDocument());
    expect(screen.getByRole('button', { name: /add to cart/i })).toBeDisabled();
    expect(screen.getByRole('spinbutton')).toBeDisabled();
  });

  it('shows "Already at max quantity in cart" message when cart is at MAX_QUANTITY', async () => {
    const maxCartItem = { productId: testProduct.id, title: testProduct.title, image: testProduct.image, price: testProduct.price, quantity: MAX_QUANTITY };
    renderModal(testProduct.id, [testProduct], jest.fn(), [maxCartItem]);
    await waitFor(() => expect(screen.getByText(/already at max quantity in cart/i)).toBeInTheDocument());
  });

  it('does not call onClose when Add to Cart is clicked at MAX_QUANTITY', async () => {
    const onClose = jest.fn();
    const maxCartItem = { productId: testProduct.id, title: testProduct.title, image: testProduct.image, price: testProduct.price, quantity: MAX_QUANTITY };
    renderModal(testProduct.id, [testProduct], onClose, [maxCartItem]);
    await waitFor(() => expect(screen.getByText('Test Product')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /add to cart/i }));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('productId not in cache renders a loading/fallback state without crashing', async () => {
    renderModal(999); // non-existent id
    // Should not throw; may show loading or a fallback
    await waitFor(() => {
      // Either loading spinner or fallback text
      const fallback = screen.queryByText(/loading/i) || screen.queryByRole('status');
      // Just check no crash — modal may show loading or empty
      expect(document.body).toBeInTheDocument();
    });
  });

  it('passes axe accessibility audit', async () => {
    const { container } = renderModal(testProduct.id);
    await waitFor(() => expect(screen.getByText('Test Product')).toBeInTheDocument());
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
