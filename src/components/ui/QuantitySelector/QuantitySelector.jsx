import { useState, useId, useEffect } from 'react';

/**
 * Numeric quantity selector with decrement/increment buttons.
 * @param {Object} props
 * @param {number} props.value
 * @param {Function} props.onChange
 * @param {number} [props.min=1]
 * @param {number} [props.max=50]
 * @param {boolean} [props.disabled]
 * @param {string} [props.label='Quantity']
 * @param {number} [props.resetTo] - Value to restore on empty/invalid blur. Defaults to `min`.
 *   In cart contexts, also triggers a modal instead of an inline error when the user types above max.
 * @param {Function} [props.onValidityChange] - Called with `false` when the selector enters an
 *   invalid state and `true` when it returns to a valid state. Use to disable dependent actions.
 * @returns {JSX.Element}
 */
export default function QuantitySelector({
  value,
  onChange,
  min = 1,
  max = 50,
  disabled = false,
  label = 'Quantity',
  resetTo,
  onValidityChange,
}) {
  const [attempted, setAttempted] = useState(null);
  const [showMaxModal, setShowMaxModal] = useState(false);
  // draft holds the raw string the user is typing so backspace/clear works
  const [draft, setDraft] = useState(String(value));
  const inputId = useId();
  const maxModalTitleId = inputId + '-max-title';

  // Sync display when the controlled value changes externally (e.g. reset after add-to-cart)
  useEffect(() => {
    setDraft(String(value));
  }, [value]);

  function handleDecrement() {
    const next = value - 1;
    if (next < min) {
      setAttempted(next);
    } else {
      setAttempted(null);
      onValidityChange?.(true);
      onChange(next);
    }
  }

  function handleIncrement() {
    const next = value + 1;
    if (next > max) {
      setAttempted(next);
      onValidityChange?.(false);
    } else {
      setAttempted(null);
      onValidityChange?.(true);
      onChange(next);
    }
  }

  function handleChange(e) {
    const raw = e.target.value;
    setDraft(raw); // always update display so backspace/clear is visible
    const n = parseInt(raw, 10);
    if (isNaN(n)) {
      onValidityChange?.(false); // empty input — disable dependent actions
      return;
    }
    if (n > max && resetTo !== undefined) {
      // Cart context: show modal and revert to the current cart quantity
      setDraft(String(resetTo));
      setShowMaxModal(true);
    } else if (n < min || n > max) {
      setAttempted(n);
      onValidityChange?.(false);
    } else {
      setAttempted(null);
      onValidityChange?.(true);
      setDraft(String(n)); // normalize leading zeros
      onChange(n);
    }
  }

  const outOfRange = attempted !== null;
  const errorId = inputId + '-error';

  function handleBlur(e) {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setAttempted(null);
      const n = parseInt(draft, 10);
      if (isNaN(n) || n < min || n > max) {
        const fallback = resetTo !== undefined ? resetTo : min;
        setDraft(String(fallback));
        onChange(fallback);
      }
      // Defer re-enabling dependent actions until after the current click event
      // completes, so a click on a disabled Add-to-Cart button while the field
      // is invalid can't sneak through as the button re-enables mid-event.
      setTimeout(() => onValidityChange?.(true), 0);
    }
  }

  return (
    <div className="flex flex-col gap-1" onBlur={handleBlur}>
      <label htmlFor={inputId} className="sr-only">
        {label}
      </label>
      <div className="flex items-center gap-1">
        <button
          type="button"
          aria-label="Decrease quantity"
          onClick={handleDecrement}
          disabled={disabled}
          className="w-8 h-8 flex items-center justify-center rounded-btn border border-border text-text hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1"
        >
          −
        </button>
        <input
          id={inputId}
          type="number"
          value={draft}
          min={min}
          max={max}
          onChange={handleChange}
          onKeyDown={(e) => {
            if (['ArrowUp', 'ArrowDown', '.', 'e', 'E', '+', '-'].includes(e.key))
              e.preventDefault();
          }}
          disabled={disabled}
          aria-describedby={outOfRange ? errorId : undefined}
          className="w-14 text-center text-sm border border-border rounded-btn py-1 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <button
          type="button"
          aria-label="Increase quantity"
          onClick={handleIncrement}
          disabled={disabled}
          className="w-8 h-8 flex items-center justify-center rounded-btn border border-border text-text hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1"
        >
          +
        </button>
      </div>
      {outOfRange && (
        <div id={errorId} role="alert" aria-live="assertive" className="text-xs text-error">
          {attempted < min ? `Minimum quantity is ${min}` : `Maximum quantity is ${max}`}
        </div>
      )}

      {/* Max-quantity modal — shown in cart context when user types above max */}
      {showMaxModal && (
        <>
          <div
            data-testid="max-quantity-backdrop"
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
            aria-hidden="true"
            onClick={() => setShowMaxModal(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={maxModalTitleId}
            className="fixed z-[70] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="bg-amber-50 border-b border-amber-100 px-6 pt-8 pb-6 flex flex-col items-center gap-3">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 ring-4 ring-amber-50">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-amber-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h3 id={maxModalTitleId} className="text-base font-bold text-text text-center">
                Maximum quantity reached
              </h3>
            </div>
            <div className="px-6 py-5 text-center">
              <p className="text-sm text-text-muted">
                You can add up to{' '}
                <span className="font-semibold text-text">{max}</span> units of this product per
                order.
              </p>
            </div>
            <div className="px-6 pb-6">
              <button
                type="button"
                onClick={() => setShowMaxModal(false)}
                className="w-full rounded-btn bg-primary text-white py-2 text-sm font-medium hover:bg-primary-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                Got it
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
