import ProductSkeleton from '@/components/ProductSkeleton/ProductSkeleton.jsx';
import ProductCard from '@/components/ProductCard/ProductCard.jsx';
import Button from '@/components/ui/Button/Button.jsx';

/**
 * Responsive product grid with loading, error, and empty states.
 * @param {Object} props
 * @param {import('@/features/products/productSchema.js').Product[]} props.products
 * @param {boolean} [props.isLoading]
 * @param {boolean} [props.isError]
 * @param {boolean} [props.isEmpty]
 * @param {'filter-empty'|'api-error'} [props.emptyVariant]
 * @param {Function} props.onRetry
 * @param {Function} [props.onClearFilters]
 * @param {Function} props.onOpenDetail
 * @param {Function} props.onAddToCart
 * @returns {JSX.Element}
 */
export default function ProductGrid({
  products,
  isLoading,
  isError,
  isEmpty,
  emptyVariant,
  onRetry,
  onClearFilters,
  onOpenDetail,
  onAddToCart,
}) {
  if (isLoading) {
    return (
      <div
        aria-live="polite"
        aria-busy="true"
        aria-label="Loading products"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div aria-live="polite" className="flex flex-col items-center justify-center py-16 gap-4">
        <p className="text-text-muted text-lg">Failed to load products. Please try again.</p>
        <Button onClick={onRetry}>Try Again</Button>
      </div>
    );
  }

  if (isEmpty) {
    if (emptyVariant === 'filter-empty') {
      return (
        <div aria-live="polite" className="flex flex-col items-center justify-center py-16 gap-4">
          <p className="text-text-muted text-lg">No products match your filters.</p>
          <Button variant="secondary" onClick={onClearFilters}>
            Clear Filters
          </Button>
        </div>
      );
    }
    return (
      <div aria-live="polite" className="flex flex-col items-center justify-center py-16">
        <p className="text-text-muted text-lg">No products found.</p>
      </div>
    );
  }

  return (
    <div
      aria-live="polite"
      aria-label={`${products.length} products`}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
    >
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onOpenDetail={onOpenDetail}
          onAddToCart={onAddToCart}
        />
      ))}
    </div>
  );
}
