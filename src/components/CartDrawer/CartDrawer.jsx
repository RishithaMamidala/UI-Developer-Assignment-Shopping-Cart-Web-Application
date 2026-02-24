import { useAppDispatch, useAppSelector } from '@/app/hooks.js';
import { updateQuantity, removeItem } from '@/features/cart/cartSlice.js';
import { selectCartItems, selectCartTotal } from '@/features/cart/cartSelectors.js';
import { formatPrice } from '@/utils/currency.js';
import Button from '@/components/ui/Button/Button.jsx';
import CartLineItem from './CartLineItem/CartLineItem.jsx';

/**
 * Slide-in cart drawer showing all items, quantity controls, and order total.
 * @param {Object} props
 * @param {Function} props.onClose - Called when the drawer should close.
 * @returns {JSX.Element}
 */
export default function CartDrawer({ onClose }) {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectCartItems);
  const total = useAppSelector(selectCartTotal);

  return (
    <>
      {/* Backdrop */}
      <div
        data-testid="cart-backdrop"
        className="fixed inset-0 z-40 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        className="fixed right-0 top-0 h-full w-80 sm:w-96 bg-surface z-50 shadow-xl flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-border">
          <h2 className="text-lg font-bold text-text">Your Cart</h2>
          <button
            type="button"
            aria-label="Close shopping cart"
            onClick={onClose}
            className="h-9 w-9 flex items-center justify-center rounded-btn text-text-muted hover:bg-surface-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
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
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 py-16">
              <p className="text-text-muted text-base">Your cart is empty.</p>
              <Button variant="secondary" onClick={onClose}>
                Continue Shopping
              </Button>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {items.map((item) => (
                <li key={item.productId}>
                  <CartLineItem
                    item={item}
                    onRemove={() => dispatch(removeItem(item.productId))}
                    onQuantityChange={(qty) =>
                      dispatch(updateQuantity({ productId: item.productId, quantity: qty }))
                    }
                  />
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer with total */}
        {items.length > 0 && (
          <div className="border-t border-border px-4 py-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-text-muted">Order Total</span>
              <span className="text-lg font-bold text-text">{formatPrice(total)}</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
