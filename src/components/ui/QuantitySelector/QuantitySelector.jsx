import { useState, useId } from 'react';

/**
 * Numeric quantity selector with decrement/increment buttons.
 * @param {Object} props
 * @param {number} props.value
 * @param {Function} props.onChange
 * @param {number} [props.min=1]
 * @param {number} [props.max=50]
 * @param {boolean} [props.disabled]
 * @param {string} [props.label='Quantity']
 * @returns {JSX.Element}
 */
export default function QuantitySelector({
  value,
  onChange,
  min = 1,
  max = 50,
  disabled = false,
  label = 'Quantity',
}) {
  const [attempted, setAttempted] = useState(null);
  const inputId = useId();

  function handleDecrement() {
    const next = value - 1;
    if (next < min) {
      setAttempted(next);
    } else {
      setAttempted(null);
      onChange(next);
    }
  }

  function handleIncrement() {
    const next = value + 1;
    if (next > max) {
      setAttempted(next);
    } else {
      setAttempted(null);
      onChange(next);
    }
  }

  function handleChange(e) {
    const n = parseInt(e.target.value, 10);
    if (isNaN(n)) return;
    if (n < min || n > max) {
      setAttempted(n);
    } else {
      setAttempted(null);
      onChange(n);
    }
  }

  const outOfRange = attempted !== null;
  const errorId = inputId + '-error';

  function handleBlur(e) {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setAttempted(null);
    }
  }

  return (
    <div className="flex flex-col gap-1" onBlur={handleBlur}>
      <label htmlFor={inputId} className="text-xs text-text-muted font-medium">
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
          value={value}
          min={min}
          max={max}
          onChange={handleChange}
          onKeyDown={(e) => {
            if (e.key === 'ArrowUp' || e.key === 'ArrowDown') e.preventDefault();
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
