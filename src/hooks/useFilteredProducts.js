import { useMemo } from 'react';
import { useAppSelector } from '@/app/hooks.js';
import { useGetProductsQuery } from '@/features/products/productsApi.js';

/**
 * Returns products filtered by activeCategory and sorted by sortBy from Redux state.
 * @returns {import('@/features/products/productSchema.js').Product[]}
 */
export default function useFilteredProducts() {
  const { data: products = [] } = useGetProductsQuery();
  const activeCategory = useAppSelector((state) => state.products.activeCategory);
  const sortBy = useAppSelector((state) => state.products.sortBy);

  return useMemo(() => {
    let filtered =
      activeCategory === 'all' ? products : products.filter((p) => p.category === activeCategory);

    if (sortBy === 'price_asc') {
      filtered = [...filtered].sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_desc') {
      filtered = [...filtered].sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating_desc') {
      filtered = [...filtered].sort((a, b) => b.rating.rate - a.rating.rate);
    }

    return filtered;
  }, [products, activeCategory, sortBy]);
}
