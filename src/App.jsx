import { lazy, Suspense, useState } from 'react';
import { useGetProductsQuery } from '@/features/products/productsApi.js';
import { setActiveCategory, setSortBy, setSelectedProduct, clearSelectedProduct, resetFilters } from '@/features/products/productsSlice.js';
import { addToCart, openCart, closeCart } from '@/features/cart/cartSlice.js';
import { selectCartCount, selectIsCartOpen } from '@/features/cart/cartSelectors.js';
import { useAppDispatch, useAppSelector } from '@/app/hooks.js';
import useFilteredProducts from '@/hooks/useFilteredProducts.js';
import Header from '@/components/Header/Header.jsx';
import ProductGrid from '@/components/ProductGrid/ProductGrid.jsx';
import Spinner from '@/components/ui/Spinner/Spinner.jsx';
import Toast from '@/components/ui/Toast/Toast.jsx';
import CategoryTabs from '@/components/CategoryTabs/CategoryTabs.jsx';
import SortSelect from '@/components/SortSelect/SortSelect.jsx';

// Lazy-loaded organisms for US3 and US5
const ProductDetailModal = lazy(() => import('@/components/ProductDetailModal/ProductDetailModal.jsx'));
const CartDrawer = lazy(() => import('@/components/CartDrawer/CartDrawer.jsx'));

/**
 * Root application component. Wires Redux state to UI.
 * @returns {JSX.Element}
 */
export default function App() {
  const dispatch = useAppDispatch();

  // API state
  const { data: products = [], isLoading, isError, refetch } = useGetProductsQuery();

  // Filter / sort state
  const activeCategory = useAppSelector((s) => s.products.activeCategory);
  const sortBy = useAppSelector((s) => s.products.sortBy);

  // Filtered + sorted products
  const filteredProducts = useFilteredProducts();

  // Modal / drawer state
  const selectedProductId = useAppSelector((s) => s.products.selectedProductId);
  const isCartOpen = useAppSelector(selectIsCartOpen);
  const cartCount = useAppSelector(selectCartCount);

  // Toast state
  const [toast, setToast] = useState({ visible: false, message: '', variant: 'success' });

  // Derived state
  const categories = [...new Set(products.map((p) => p.category))];
  const isEmpty = !isLoading && !isError && filteredProducts.length === 0;
  const emptyVariant = isEmpty && activeCategory !== 'all' ? 'filter-empty' : 'api-error';

  // Handlers
  const handleOpenDetail = (id) => dispatch(setSelectedProduct(id));
  const handleCloseDetail = () => dispatch(clearSelectedProduct());
  const handleOpenCart = () => dispatch(openCart());
  const handleCloseCart = () => dispatch(closeCart());
  const handleClearFilters = () => dispatch(resetFilters());

  function handleAddToCart(product, quantity) {
    dispatch(addToCart({ product, quantity }));
    setToast({ visible: true, message: `Added ${quantity} item(s) to cart`, variant: 'success' });
  }

  return (
    <div className="min-h-screen bg-surface-muted">
      <Header cartCount={cartCount} onOpenCart={handleOpenCart} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CategoryTabs
            categories={categories}
            activeCategory={activeCategory}
            onChange={(cat) => dispatch(setActiveCategory(cat))}
          />
          <SortSelect
            value={sortBy}
            onChange={(val) => dispatch(setSortBy(val))}
          />
        </div>

        <ProductGrid
          products={filteredProducts}
          isLoading={isLoading}
          isError={isError}
          isEmpty={isEmpty}
          emptyVariant={emptyVariant}
          onRetry={refetch}
          onClearFilters={handleClearFilters}
          onOpenDetail={handleOpenDetail}
          onAddToCart={handleAddToCart}
        />
      </main>

      <Suspense fallback={<Spinner size="lg" />}>
        {selectedProductId != null && (
          <ProductDetailModal
            productId={selectedProductId}
            onClose={handleCloseDetail}
          />
        )}
        {isCartOpen && (
          <CartDrawer onClose={handleCloseCart} />
        )}
      </Suspense>

      {toast.visible && (
        <Toast
          message={toast.message}
          variant={toast.variant}
          onDismiss={() => setToast({ visible: false, message: '', variant: 'success' })}
        />
      )}
    </div>
  );
}
