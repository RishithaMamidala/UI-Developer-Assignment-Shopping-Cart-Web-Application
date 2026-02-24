const SIZE_CLASSES = {
  sm: 'w-4 h-4',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
};

/**
 * Animated loading spinner.
 * @param {Object} props
 * @param {'sm'|'md'|'lg'} [props.size='md'] - Spinner size.
 * @param {string} [props.label='Loading...'] - Accessible aria-label.
 * @returns {JSX.Element}
 */
export default function Spinner({ size = 'md', label = 'Loading...' }) {
  return (
    <div
      role="status"
      aria-label={label}
      className={`${SIZE_CLASSES[size] || SIZE_CLASSES.md} border-4 border-primary border-t-transparent rounded-full animate-spin`}
    />
  );
}
