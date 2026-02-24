import { useEffect } from 'react';

const VARIANT_CLASSES = {
  success: 'bg-success',
  error: 'bg-error',
};

/**
 * Auto-dismissing notification toast.
 * @param {Object} props
 * @param {string} props.message - Text to display.
 * @param {'success'|'error'} [props.variant='success'] - Visual style.
 * @param {Function} props.onDismiss - Called after 3 s or on manual dismiss.
 * @returns {JSX.Element}
 */
export default function Toast({ message, variant = 'success', onDismiss }) {
  useEffect(() => {
    const id = setTimeout(onDismiss, 3000);
    return () => clearTimeout(id);
  }, [onDismiss]);

  return (
    <div
      role="status"
      aria-live="polite"
      className={[
        'fixed bottom-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-card text-white text-sm font-medium shadow-lg',
        VARIANT_CLASSES[variant] ?? VARIANT_CLASSES.success,
      ].join(' ')}
    >
      <span>{message}</span>
      <button
        type="button"
        aria-label="Dismiss notification"
        onClick={onDismiss}
        className="ml-2 text-white/80 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded"
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
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </div>
  );
}
