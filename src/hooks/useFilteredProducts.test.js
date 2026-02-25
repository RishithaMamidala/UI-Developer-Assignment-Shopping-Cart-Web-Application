import { renderHook, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { http, HttpResponse } from 'msw';
import { server } from '../../tests/msw-setup.cjs';
import productsReducer from '@/features/products/productsSlice.js';
import { productsApi } from '@/features/products/productsApi.js';
import useFilteredProducts from './useFilteredProducts.js';

const testProducts = [
  {
    id: 1,
    title: 'A',
    price: 30,
    description: 'desc a',
    category: 'electronics',
    image: 'https://fakestoreapi.com/img/a.jpg',
    rating: { rate: 4.5, count: 10 },
  },
  {
    id: 2,
    title: 'B',
    price: 10,
    description: 'desc b',
    category: 'electronics',
    image: 'https://fakestoreapi.com/img/b.jpg',
    rating: { rate: 3.0, count: 5 },
  },
  {
    id: 3,
    title: 'C',
    price: 20,
    description: 'desc c',
    category: 'jewelery',
    image: 'https://fakestoreapi.com/img/c.jpg',
    rating: { rate: 4.8, count: 20 },
  },
];

function makeWrapper(productsState) {
  const store = configureStore({
    reducer: {
      products: productsReducer,
      [productsApi.reducerPath]: productsApi.reducer,
    },
    middleware: (gDM) => gDM().concat(productsApi.middleware),
    preloadedState: { products: productsState },
  });
  return function Wrapper({ children }) {
    return <Provider store={store}>{children}</Provider>;
  };
}

beforeEach(() => {
  server.use(http.get('https://fakestoreapi.com/products', () => HttpResponse.json(testProducts)));
});

describe('useFilteredProducts', () => {
  it('returns all products when activeCategory is "all" and sortBy is "none"', async () => {
    const { result } = renderHook(() => useFilteredProducts(), {
      wrapper: makeWrapper({ activeCategory: 'all', sortBy: 'none', selectedProductId: null }),
    });
    await waitFor(() => expect(result.current).toHaveLength(3));
  });

  it('filters to matching category', async () => {
    const { result } = renderHook(() => useFilteredProducts(), {
      wrapper: makeWrapper({
        activeCategory: 'electronics',
        sortBy: 'none',
        selectedProductId: null,
      }),
    });
    await waitFor(() => expect(result.current).toHaveLength(2));
    expect(result.current.every((p) => p.category === 'electronics')).toBe(true);
  });

  it('returns empty array when no products match category', async () => {
    const { result } = renderHook(() => useFilteredProducts(), {
      wrapper: makeWrapper({
        activeCategory: 'nonexistent',
        sortBy: 'none',
        selectedProductId: null,
      }),
    });
    await waitFor(
      () => {
        // Wait for API to finish - products loaded but filtered to none
        const state = result.current;
        // After fetch completes, result will be empty array (no match)
        expect(state).toHaveLength(0);
      },
      { timeout: 5000 }
    );
  });

  it('sorts by price_asc (lowest first)', async () => {
    const { result } = renderHook(() => useFilteredProducts(), {
      wrapper: makeWrapper({ activeCategory: 'all', sortBy: 'price_asc', selectedProductId: null }),
    });
    await waitFor(() => {
      const prices = result.current.map((p) => p.price);
      expect(prices).toEqual([10, 20, 30]);
    });
  });

  it('sorts by price_desc (highest first)', async () => {
    const { result } = renderHook(() => useFilteredProducts(), {
      wrapper: makeWrapper({
        activeCategory: 'all',
        sortBy: 'price_desc',
        selectedProductId: null,
      }),
    });
    await waitFor(() => {
      const prices = result.current.map((p) => p.price);
      expect(prices).toEqual([30, 20, 10]);
    });
  });

  it('sorts by rating_desc (highest first)', async () => {
    const { result } = renderHook(() => useFilteredProducts(), {
      wrapper: makeWrapper({
        activeCategory: 'all',
        sortBy: 'rating_desc',
        selectedProductId: null,
      }),
    });
    await waitFor(() => {
      const rates = result.current.map((p) => p.rating.rate);
      expect(rates).toEqual([4.8, 4.5, 3.0]);
    });
  });

  it('maintains original order for equal prices in price_asc sort', async () => {
    const equalPriceProducts = [
      { id: 1, title: 'First', price: 10, description: 'd', category: 'a', image: 'https://x.com/1.jpg', rating: { rate: 4.0, count: 1 } },
      { id: 2, title: 'Second', price: 10, description: 'd', category: 'a', image: 'https://x.com/2.jpg', rating: { rate: 3.0, count: 1 } },
      { id: 3, title: 'Third', price: 20, description: 'd', category: 'a', image: 'https://x.com/3.jpg', rating: { rate: 2.0, count: 1 } },
    ];
    server.use(http.get('https://fakestoreapi.com/products', () => HttpResponse.json(equalPriceProducts)));

    const { result } = renderHook(() => useFilteredProducts(), {
      wrapper: makeWrapper({ activeCategory: 'all', sortBy: 'price_asc', selectedProductId: null }),
    });

    await waitFor(() => {
      const prices = result.current.map((p) => p.price);
      expect(prices).toEqual([10, 10, 20]);
      // stable sort: original insertion order preserved for equal prices
      expect(result.current[0].id).toBe(1);
      expect(result.current[1].id).toBe(2);
    });
  });

  it('preserves original order for equal ratings in rating_desc sort', async () => {
    const equalRatingProducts = [
      { id: 1, title: 'First', price: 10, description: 'd', category: 'a', image: 'https://x.com/1.jpg', rating: { rate: 4.5, count: 1 } },
      { id: 2, title: 'Second', price: 20, description: 'd', category: 'a', image: 'https://x.com/2.jpg', rating: { rate: 4.5, count: 1 } },
      { id: 3, title: 'Third', price: 30, description: 'd', category: 'a', image: 'https://x.com/3.jpg', rating: { rate: 3.0, count: 1 } },
    ];
    server.use(http.get('https://fakestoreapi.com/products', () => HttpResponse.json(equalRatingProducts)));

    const { result } = renderHook(() => useFilteredProducts(), {
      wrapper: makeWrapper({ activeCategory: 'all', sortBy: 'rating_desc', selectedProductId: null }),
    });

    await waitFor(() => {
      const rates = result.current.map((p) => p.rating.rate);
      expect(rates).toEqual([4.5, 4.5, 3.0]);
      // stable sort: original insertion order preserved for equal ratings
      expect(result.current[0].id).toBe(1);
      expect(result.current[1].id).toBe(2);
    });
  });

  it('applies combined category filter AND sort simultaneously', async () => {
    const { result } = renderHook(() => useFilteredProducts(), {
      wrapper: makeWrapper({
        activeCategory: 'electronics',
        sortBy: 'price_asc',
        selectedProductId: null,
      }),
    });
    await waitFor(() => {
      expect(result.current).toHaveLength(2);
      expect(result.current[0].price).toBe(10);
      expect(result.current[1].price).toBe(30);
    });
  });
});
