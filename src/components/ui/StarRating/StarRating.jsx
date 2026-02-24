/**
 * Star rating display.
 * @param {Object} props
 * @param {number} props.rate - Rating value (0–5).
 * @param {number} props.count - Number of reviews.
 * @returns {JSX.Element}
 */
export default function StarRating({ rate, count }) {
  const fullStars = Math.round(rate);

  return (
    <span
      aria-label={`Rated ${rate} out of 5 (${count} reviews)`}
      className="inline-flex items-center gap-1 text-sm text-text-muted"
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          aria-hidden="true"
          className={`w-4 h-4 ${i < fullStars ? 'text-warning fill-current' : 'text-gray-300 fill-current'}`}
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span>({count})</span>
    </span>
  );
}
