import { formatPrice } from '@/utils/currency.js';
import { MAX_QUANTITY } from '@/constants/index.js';
import QuantitySelector from '@/components/ui/QuantitySelector/QuantitySelector.jsx';

/**
 * A single line item row in the cart drawer.
 * @param {Object} props
 * @param {import('@/features/cart/cartSlice.js').CartItem} props.item
 * @param {Function} props.onRemove - Called when the remove button is clicked.
 * @param {Function} props.onQuantityChange - Called with the new quantity number.
 * @returns {JSX.Element}
 */
export default function CartLineItem({ item, onRemove, onQuantityChange }) {
  return (
    <div className="flex gap-3 py-4 border-b border-border last:border-b-0">
      {/* Thumbnail */}
      <img
        src={item.image}
        alt={item.title}
        className="w-16 h-16 object-contain rounded flex-shrink-0 bg-surface-muted"
      />

      {/* Details */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text truncate">{item.title}</p>
        <p className="text-xs text-text-muted mt-0.5">{formatPrice(item.price)}</p>

        <div className="mt-2 flex items-center justify-between gap-2">
          <QuantitySelector
            value={item.quantity}
            onChange={onQuantityChange}
            min={1}
            max={MAX_QUANTITY}
            resetTo={item.quantity}
          />
          <span className="text-sm font-semibold text-text whitespace-nowrap">
            {formatPrice(item.price * item.quantity)}
          </span>
        </div>
      </div>

      {/* Remove */}
      <button
        type="button"
        aria-label={`Remove ${item.title}`}
        onClick={onRemove}
        className="self-start mt-1 p-1 text-text-muted hover:text-error focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </div>
  );
}
