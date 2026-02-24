import { formatPrice } from '@/utils/currency.js';
import { MAX_QUANTITY } from '@/constants/index.js';
import { selectCartItemByProductId } from '@/features/cart/cartSelectors.js';
import { selectProductQuantity, setProductQuantity } from '@/features/products/productsSlice.js';
import { useAppSelector, useAppDispatch } from '@/app/hooks.js';
import StarRating from '@/components/ui/StarRating/StarRating.jsx';
import Button from '@/components/ui/Button/Button.jsx';
import QuantitySelector from '@/components/ui/QuantitySelector/QuantitySelector.jsx';

const PLACEHOLDER_SRC =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300' viewBox='0 0 300 300'%3E%3Crect width='300' height='300' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-size='14'%3ENo image%3C/text%3E%3C/svg%3E";

/**
 * Product listing card with quantity selector and add-to-cart.
 * @param {Object} props
 * @param {import('@/features/products/productSchema.js').Product} props.product
 * @param {Function} props.onOpenDetail
 * @param {Function} props.onAddToCart
 * @returns {JSX.Element}
 */
export default function ProductCard({ product, onOpenDetail, onAddToCart }) {
  const dispatch = useAppDispatch();

  const quantity = useAppSelector((state) => selectProductQuantity(state, product.id));
  const cartItem = useAppSelector((state) => selectCartItemByProductId(state, product.id));
  const isAtMax = (cartItem?.quantity ?? 0) >= MAX_QUANTITY;

  function handleQuantityChange(q) {
    dispatch(setProductQuantity({ productId: product.id, quantity: q }));
  }

  function handleAddToCart(e) {
    e.stopPropagation();
    if (isAtMax) return;
    onAddToCart(
      { productId: product.id, title: product.title, image: product.image, price: product.price },
      quantity
    );
    dispatch(setProductQuantity({ productId: product.id, quantity: 1 }));
  }

  function handleCardClick() {
    onOpenDetail(product.id);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onOpenDetail(product.id);
    }
  }

  return (
    <article className="bg-white rounded-card shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
      {/* Clickable card body */}
      <div
        role="button"
        tabIndex={0}
        aria-label={`View details for ${product.title}`}
        onClick={handleCardClick}
        onKeyDown={handleKeyDown}
        className="cursor-pointer flex-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <img
          src={product.image}
          alt={product.title}
          className="w-full h-56 object-contain p-4"
          onError={(e) => {
            e.currentTarget.src = PLACEHOLDER_SRC;
          }}
        />
        <div className="px-4 pb-2">
          <h2 className="text-sm font-semibold text-text line-clamp-2 mb-1">{product.title}</h2>
          <p className="text-primary font-bold text-lg mb-1">{formatPrice(product.price)}</p>
          <StarRating rate={product.rating.rate} count={product.rating.count} />
          <p className="text-text-muted text-xs mt-2 line-clamp-3">{product.description}</p>
        </div>
      </div>

      {/* Add-to-cart area */}
      <div className="px-4 pb-4 pt-2 space-y-2" onClick={(e) => e.stopPropagation()}>
        <QuantitySelector
          value={quantity}
          onChange={handleQuantityChange}
          min={1}
          max={MAX_QUANTITY}
          label="Quantity"
          disabled={isAtMax}
        />
        <Button
          variant="primary"
          size="sm"
          className="w-full"
          onClick={handleAddToCart}
          disabled={isAtMax}
        >
          Add to Cart
        </Button>
        {isAtMax && (
          <p role="status" aria-live="polite" className="text-xs text-error">
            Already at max quantity in cart
          </p>
        )}
      </div>
    </article>
  );
}
