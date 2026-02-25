import { useEffect, useId, useState } from 'react';
import { useGetProductsQuery } from '@/features/products/productsApi.js';
import { addToCart } from '@/features/cart/cartSlice.js';
import { selectCartItemByProductId } from '@/features/cart/cartSelectors.js';
import { selectProductQuantity, setProductQuantity } from '@/features/products/productsSlice.js';
import { formatPrice } from '@/utils/currency.js';
import { MAX_QUANTITY } from '@/constants/index.js';
import { useAppDispatch, useAppSelector } from '@/app/hooks.js';
import StarRating from '@/components/ui/StarRating/StarRating.jsx';
import QuantitySelector from '@/components/ui/QuantitySelector/QuantitySelector.jsx';
import Button from '@/components/ui/Button/Button.jsx';
import Spinner from '@/components/ui/Spinner/Spinner.jsx';

/**
 * Full product detail modal overlay.
 * @param {Object} props
 * @param {number} props.productId - ID of the product to display.
 * @param {Function} props.onClose - Called when the modal should close.
 * @returns {JSX.Element}
 */
export default function ProductDetailModal({ productId, onClose }) {
  const dispatch = useAppDispatch();
  const titleId = useId();

  const { data: products } = useGetProductsQuery();
  const product = products?.find((p) => p.id === productId);
  const quantity = useAppSelector((state) => selectProductQuantity(state, productId));
  const cartItem = useAppSelector((state) => selectCartItemByProductId(state, productId));
  const isAtMax = (cartItem?.quantity ?? 0) >= MAX_QUANTITY;
  const [added, setAdded] = useState(false);
  const [isQtyInvalid, setIsQtyInvalid] = useState(false);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  function handleAddToCart() {
    if (!product || isAtMax || isQtyInvalid) return;
    dispatch(
      addToCart({
        product: {
          productId: product.id,
          title: product.title,
          image: product.image,
          price: product.price,
        },
        quantity,
      })
    );
    dispatch(setProductQuantity({ productId, quantity: 1 }));
    setAdded(true);
    setTimeout(onClose, 1000);
  }

  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div
      data-testid="modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={handleBackdropClick}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative bg-surface rounded-card shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute top-4 right-4 h-9 w-9 flex items-center justify-center rounded-btn text-text-muted hover:bg-surface-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-primary z-10"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {!product ? (
          <div className="flex items-center justify-center py-16">
            <Spinner size="lg" />
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-6 p-6">
            {/* Image */}
            <div className="flex-shrink-0 flex items-center justify-center sm:w-56 bg-gray-100 rounded-card p-4">
              <img src={product.image} alt={product.title} className="max-h-64 object-contain" />
            </div>

            {/* Details */}
            <div className="flex-1 flex flex-col gap-4">
              <div className="pr-10">
                <h1 id={titleId} className="text-xl font-bold text-text leading-snug">
                  {product.title}
                </h1>
                <p className="text-sm text-text-muted capitalize mt-1">{product.category}</p>
              </div>

              <StarRating rate={product.rating.rate} count={product.rating.count} />

              <p className="text-2xl font-bold text-text">{formatPrice(product.price)}</p>

              <p className="text-sm text-text-muted leading-relaxed">{product.description}</p>

              <div className="flex flex-col gap-3">
                <QuantitySelector
                  value={quantity}
                  onChange={(q) => dispatch(setProductQuantity({ productId, quantity: q }))}
                  onValidityChange={(isValid) => setIsQtyInvalid(!isValid)}
                  min={1}
                  max={MAX_QUANTITY}
                  disabled={isAtMax}
                />
                <Button
                  onClick={handleAddToCart}
                  aria-label="Add to cart"
                  disabled={isAtMax || added || isQtyInvalid}
                  variant={added ? 'success' : 'primary'}
                >
                  {added ? '✓ Added to Cart!' : 'Add to Cart'}
                </Button>
                {isAtMax && (
                  <p role="status" aria-live="polite" className="text-xs text-error">
                    Already at max quantity in cart
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
