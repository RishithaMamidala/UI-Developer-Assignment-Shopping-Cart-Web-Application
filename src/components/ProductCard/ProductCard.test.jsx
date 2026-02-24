import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { axe, toHaveNoViolations } from 'jest-axe';
import ProductCard from './ProductCard.jsx';
import { productsApi } from '@/features/products/productsApi.js';
import cartReducer from '@/features/cart/cartSlice.js';
import productsReducer from '@/features/products/productsSlice.js';
import { MAX_QUANTITY } from '@/constants/index.js';

expect.extend(toHaveNoViolations);

const mockProduct = {
  id: 1,
  title: 'Test Product Title',
  price: 109.95,
  description: 'A great product description for testing',
  category: 'electronics',
  image: 'https://fakestoreapi.com/img/test.jpg',
  rating: { rate: 4.2, count: 88 },
};

function makeStore(cartItems = [], productQuantities = {}) {
  return configureStore({
    reducer: {
      [productsApi.reducerPath]: productsApi.reducer,
      cart: cartReducer,
      products: productsReducer,
    },
    middleware: (gDM) => gDM().concat(productsApi.middleware),
    preloadedState: {
      cart: { items: cartItems, isOpen: false },
      products: { activeCategory: 'all', sortBy: 'none', selectedProductId: null, productQuantities },
    },
  });
}

function renderCard(props = {}, cartItems = [], productQuantities = {}) {
  const store = makeStore(cartItems, productQuantities);
  const onOpenDetail = jest.fn();
  const handleAddToCart = jest.fn();
  return {
    store,
    onOpenDetail,
    handleAddToCart,
    ...render(
      <Provider store={store}>
        <ProductCard
          product={mockProduct}
          onOpenDetail={onOpenDetail}
          onAddToCart={handleAddToCart}
          {...props}
        />
      </Provider>
    ),
  };
}

describe('ProductCard (basic)', () => {
  it('renders product title', () => {
    renderCard();
    expect(screen.getByText('Test Product Title')).toBeInTheDocument();
  });

  it('renders product image with alt text', () => {
    renderCard();
    const img = screen.getByAltText('Test Product Title');
    expect(img).toHaveAttribute('src', 'https://fakestoreapi.com/img/test.jpg');
  });

  it('renders price formatted by formatPrice ($109.95)', () => {
    renderCard();
    expect(screen.getByText('$109.95')).toBeInTheDocument();
  });

  it('renders StarRating component', () => {
    const { container } = renderCard();
    expect(container.querySelector('[aria-label*="Rated"]')).toBeInTheDocument();
  });

  it('renders truncated description', () => {
    renderCard();
    expect(screen.getByText(/A great product description/)).toBeInTheDocument();
  });

  it('passes axe accessibility audit', async () => {
    const { container } = renderCard();
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

describe('ProductCard (US3 detail trigger)', () => {
  it('clicking card body calls onOpenDetail with product.id', () => {
    const { onOpenDetail } = renderCard();
    fireEvent.click(screen.getByRole('button', { name: /View details/i }));
    expect(onOpenDetail).toHaveBeenCalledWith(mockProduct.id);
  });

  it('pressing Enter on card body calls onOpenDetail', () => {
    const { onOpenDetail } = renderCard();
    fireEvent.keyDown(screen.getByRole('button', { name: /View details/i }), { key: 'Enter' });
    expect(onOpenDetail).toHaveBeenCalledWith(mockProduct.id);
  });

  it('pressing Space on card body calls onOpenDetail', () => {
    const { onOpenDetail } = renderCard();
    fireEvent.keyDown(screen.getByRole('button', { name: /View details/i }), { key: ' ' });
    expect(onOpenDetail).toHaveBeenCalledWith(mockProduct.id);
  });
});

describe('ProductCard (US4 add-to-cart)', () => {
  it('renders QuantitySelector with default value 1', () => {
    renderCard();
    const input = screen.getByRole('spinbutton');
    expect(input).toHaveValue(1);
  });

  it('shows placeholder image when product image fails to load', () => {
    renderCard();
    const img = screen.getByAltText('Test Product Title');
    fireEvent.error(img);
    expect(img.src).toContain('data:image/svg+xml');
  });

  it('Add to Cart button is present and enabled for in-stock product', () => {
    renderCard();
    const btn = screen.getByRole('button', { name: /Add to Cart/i });
    expect(btn).not.toBeDisabled();
  });

  it('clicking Add to Cart calls onAddToCart with product and quantity', () => {
    const { handleAddToCart } = renderCard();
    fireEvent.click(screen.getByRole('button', { name: /increase quantity/i })); // qty=2
    fireEvent.click(screen.getByRole('button', { name: /Add to Cart/i }));
    expect(handleAddToCart).toHaveBeenCalledWith(
      { productId: mockProduct.id, title: mockProduct.title, image: mockProduct.image, price: mockProduct.price },
      2
    );
  });

  it('quantity resets to 1 after successful add', () => {
    renderCard();
    fireEvent.click(screen.getByRole('button', { name: /increase quantity/i })); // qty=2
    fireEvent.click(screen.getByRole('button', { name: /Add to Cart/i }));
    expect(screen.getByRole('spinbutton')).toHaveValue(1);
  });

  it('reflects quantity from shared Redux state (synced with modal)', () => {
    renderCard({}, [], { [mockProduct.id]: 4 });
    expect(screen.getByRole('spinbutton')).toHaveValue(4);
  });

  it('disables Add to Cart and QuantitySelector when cart is at MAX_QUANTITY', () => {
    const maxCartItem = { productId: mockProduct.id, title: mockProduct.title, image: mockProduct.image, price: mockProduct.price, quantity: MAX_QUANTITY };
    renderCard({}, [maxCartItem]);
    expect(screen.getByRole('button', { name: /Add to Cart/i })).toBeDisabled();
    expect(screen.getByRole('spinbutton')).toBeDisabled();
  });

  it('shows inline "Already at max quantity in cart" message when cart is at MAX_QUANTITY', () => {
    const maxCartItem = { productId: mockProduct.id, title: mockProduct.title, image: mockProduct.image, price: mockProduct.price, quantity: MAX_QUANTITY };
    renderCard({}, [maxCartItem]);
    expect(screen.getByText(/already at max quantity in cart/i)).toBeInTheDocument();
  });

  it('does not call onAddToCart when already at MAX_QUANTITY', () => {
    const maxCartItem = { productId: mockProduct.id, title: mockProduct.title, image: mockProduct.image, price: mockProduct.price, quantity: MAX_QUANTITY };
    const { handleAddToCart } = renderCard({}, [maxCartItem]);
    fireEvent.click(screen.getByRole('button', { name: /Add to Cart/i }));
    expect(handleAddToCart).not.toHaveBeenCalled();
  });
});
