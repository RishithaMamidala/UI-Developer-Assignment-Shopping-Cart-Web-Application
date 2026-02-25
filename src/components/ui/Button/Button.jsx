import Spinner from '../Spinner/Spinner.jsx';

const VARIANT_CLASSES = {
  primary: 'bg-primary text-white hover:bg-primary-hover focus-visible:ring-primary',
  secondary: 'border border-primary text-primary hover:bg-blue-50 focus-visible:ring-primary',
  ghost: 'text-text hover:bg-gray-100 focus-visible:ring-gray-400',
  danger: 'bg-error text-white hover:bg-red-600 focus-visible:ring-error',
  success: 'bg-success text-white hover:bg-green-600 focus-visible:ring-success',
};

const SIZE_CLASSES = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

/**
 * Versatile button component.
 * @param {Object} props
 * @param {'primary'|'secondary'|'ghost'|'danger'|'success'} [props.variant='primary']
 * @param {'sm'|'md'|'lg'} [props.size='md']
 * @param {boolean} [props.disabled]
 * @param {boolean} [props.loading]
 * @param {React.ReactNode} props.children
 * @param {string} [props.className]
 * @returns {JSX.Element}
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  children,
  className = '',
  ...rest
}) {
  const variantClass = VARIANT_CLASSES[variant] || VARIANT_CLASSES.primary;
  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.md;
  const isDisabled = disabled || loading;

  return (
    <button
      disabled={isDisabled}
      className={`inline-flex items-center justify-center gap-2 rounded-btn font-medium transition-colors
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantClass} ${sizeClass} ${className}`}
      {...rest}
    >
      {loading && <Spinner size="sm" label="Loading..." />}
      {children}
    </button>
  );
}
