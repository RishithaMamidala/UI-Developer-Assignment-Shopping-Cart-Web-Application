const VARIANT_CLASSES = {
  error: 'bg-red-50 text-error',
  warning: 'bg-orange-50 text-warning',
  success: 'bg-green-50 text-success',
  neutral: 'bg-gray-100 text-text-muted',
};

/**
 * Small inline status badge.
 * @param {Object} props
 * @param {'error'|'warning'|'success'|'neutral'} [props.variant='neutral']
 * @param {string} [props.className]
 * @param {React.ReactNode} props.children
 * @returns {JSX.Element}
 */
export default function Badge({ variant = 'neutral', className = '', children }) {
  const variantClass = VARIANT_CLASSES[variant] || VARIANT_CLASSES.neutral;
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${variantClass} ${className}`}
    >
      {children}
    </span>
  );
}
