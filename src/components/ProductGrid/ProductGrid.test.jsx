import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { axe, toHaveNoViolations } from 'jest-axe';
import ProductGrid from './ProductGrid.jsx';
import { productsApi } from '@/features/products/productsApi.js';
import cartReducer from '@/features/cart/cartSlice.js';
import productsReducer from '@/features/products/productsSlice.js';

function makeStore() {
  return configureStore({
    reducer: {
      [productsApi.reducerPath]: productsApi.reducer,
      cart: cartReducer,
      products: productsReducer,
    },
    middleware: (gDM) => gDM().concat(productsApi.middleware),
  });
}

expect.extend(toHaveNoViolations);

const mockProducts = [
  {
    id: 1,
    title: 'Product A',
    price: 29.99,
    description: 'A description',
    category: 'electronics',
    image: 'https://fakestoreapi.com/img/a.jpg',
    rating: { rate: 4.0, count: 50 },
  },
  {
    id: 2,
    title: 'Product B',
    price: 49.99,
    description: 'B description',
    category: 'electronics',
    image: 'https://fakestoreapi.com/img/b.jpg',
    rating: { rate: 3.5, count: 30 },
  },
];

describe('ProductGrid', () => {
  it('renders 8 ProductSkeleton components when loading', () => {
    const { container } = render(
      <ProductGrid
        isLoading
        products={[]}
        onRetry={jest.fn()}
        onOpenDetail={jest.fn()}
        onAddToCart={jest.fn()}
      />
    );
    const skeletons = container.querySelectorAll('[aria-hidden="true"]');
    expect(skeletons.length).toBe(8);
  });

  it('renders error message and retry button when isError', () => {
    const onRetry = jest.fn();
    render(
      <ProductGrid
        isError
        products={[]}
        onRetry={onRetry}
        onOpenDetail={jest.fn()}
        onAddToCart={jest.fn()}
      />
    );
    expect(screen.getByText(/failed|error|unable/i)).toBeInTheDocument();
    const retryBtn = screen.getByRole('button', { name: /Try Again/i });
    fireEvent.click(retryBtn);
    expect(onRetry).toHaveBeenCalled();
  });

  it('renders filter-empty state with "Clear Filters" button', () => {
    const onClear = jest.fn();
    render(
      <ProductGrid
        isEmpty
        emptyVariant="filter-empty"
        products={[]}
        onRetry={jest.fn()}
        onClearFilters={onClear}
        onOpenDetail={jest.fn()}
        onAddToCart={jest.fn()}
      />
    );
    const clearBtn = screen.getByRole('button', { name: /Clear Filters/i });
    fireEvent.click(clearBtn);
    expect(onClear).toHaveBeenCalled();
  });

  it('renders api-error empty state', () => {
    render(
      <ProductGrid
        isEmpty
        emptyVariant="api-error"
        products={[]}
        onRetry={jest.fn()}
        onOpenDetail={jest.fn()}
        onAddToCart={jest.fn()}
      />
    );
    expect(screen.getByText(/no products/i)).toBeInTheDocument();
  });

  it('renders one ProductCard per product', () => {
    render(
      <Provider store={makeStore()}>
        <ProductGrid
          products={mockProducts}
          onRetry={jest.fn()}
          onOpenDetail={jest.fn()}
          onAddToCart={jest.fn()}
        />
      </Provider>
    );
    expect(screen.getByText('Product A')).toBeInTheDocument();
    expect(screen.getByText('Product B')).toBeInTheDocument();
  });

  it('passes axe accessibility audit', async () => {
    const { container } = render(
      <Provider store={makeStore()}>
        <ProductGrid
          products={mockProducts}
          onRetry={jest.fn()}
          onOpenDetail={jest.fn()}
          onAddToCart={jest.fn()}
        />
      </Provider>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
