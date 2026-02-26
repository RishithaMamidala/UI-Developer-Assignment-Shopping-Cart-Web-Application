import { useState } from 'react';
import { formatPrice } from '@/utils/currency.js';
import { MAX_QUANTITY } from '@/constants/index.js';
import QuantitySelector from '@/components/ui/QuantitySelector/QuantitySelector.jsx';
import Button from '@/components/ui/Button/Button.jsx';

/**
 * A single line item row in the cart drawer.
 * @param {Object} props
 * @param {import('@/features/cart/cartSlice.js').CartItem} props.item
 * @param {Function} props.onRemove - Called when the remove button is clicked.
 * @param {Function} props.onQuantityChange - Called with the new quantity number.
 * @returns {JSX.Element}
 */
export default function CartLineItem({ item, onRemove, onQuantityChange }) {
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <>
      <div className="flex gap-4 py-5 border-b border-border last:border-b-0">
        {/* Thumbnail */}
        <img
          src={item.image}
          alt={item.title}
          className="w-20 h-20 object-contain rounded flex-shrink-0 bg-surface-muted"
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
          onClick={() => setShowConfirm(true)}
          className="self-start mt-1 p-1 text-error bg-red-50 hover:bg-red-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
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
              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {/* Confirmation modal */}
      {showConfirm && (
        <>
          {/* Backdrop */}
          <div
            data-testid="remove-confirm-backdrop"
            className="fixed inset-0 z-60 bg-black/60 backdrop-blur-sm"
            aria-hidden="true"
            onClick={() => setShowConfirm(false)}
          />

          {/* Dialog */}
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="remove-dialog-title"
            className="fixed z-70 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[22rem] bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Red header band */}
            <div className="bg-red-50 border-b border-red-100 px-6 pt-8 pb-6 flex flex-col items-center gap-3">
              <div className="flex items-center justify-center w-20 h-20 rounded-full bg-red-100 ring-4 ring-red-50">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10 text-error"
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
              </div>
              <h3 id="remove-dialog-title" className="text-base font-bold text-text">
                Remove all {item.quantity} {item.quantity === 1 ? 'unit' : 'units'}?
              </h3>
            </div>

            {/* Body */}
            <div className="px-6 py-4 flex gap-3 items-center">
              <img
                src={item.image}
                alt={item.title}
                className="w-12 h-12 object-contain rounded-lg bg-surface-muted flex-shrink-0"
              />
              <div className="min-w-0">
                <p className="text-sm font-medium text-text line-clamp-2 leading-snug">{item.title}</p>
                <p className="text-xs text-text-muted mt-0.5">
                  {item.quantity} {item.quantity === 1 ? 'unit' : 'units'} · {formatPrice(item.price * item.quantity)}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="px-6 pb-6 flex gap-3">
              <Button
                variant="secondary"
                size="sm"
                className="flex-1"
                onClick={() => setShowConfirm(false)}
              >
                Keep
              </Button>
              <Button
                variant="danger"
                size="sm"
                className="flex-1"
                onClick={() => {
                  setShowConfirm(false);
                  onRemove();
                }}
              >
                Remove
              </Button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
