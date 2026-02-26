import { useState, useId, useEffect, useRef } from 'react';

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
  // draft holds the raw string the user is typing so backspace/clear works
  const [draft, setDraft] = useState(String(value));
  const inputId = useId();
  // Snapshot of resetTo (or min) captured when focus enters the component.
  // Prevents intermediate valid keystrokes (e.g. typing "9" before "99") from
  // updating the fallback before the user finishes typing.
  const sessionResetTo = useRef(resetTo ?? min);

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
    if (n < min || n > max) {
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

  function handleFocusIn(e) {
    // Snapshot the reset target only when focus arrives from outside the component.
    if (!e.currentTarget.contains(e.relatedTarget)) {
      sessionResetTo.current = resetTo ?? min;
    }
  }

  function handleBlur(e) {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setAttempted(null);
      const n = parseInt(draft, 10);
      if (isNaN(n) || n < min || n > max) {
        const fallback = sessionResetTo.current;
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
    <div className="flex flex-col gap-1" onFocus={handleFocusIn} onBlur={handleBlur}>
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

    </div>
  );
}
