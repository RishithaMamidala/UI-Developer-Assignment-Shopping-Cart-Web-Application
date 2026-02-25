import { useId } from 'react';

/**
 * Star rating display with fractional fill support via SVG linear gradients.
 * @param {Object} props
 * @param {number} props.rate - Rating value (0–5).
 * @param {number} props.count - Number of reviews.
 * @returns {JSX.Element}
 */
export default function StarRating({ rate, count }) {
  const uid = useId();

  const starPath =
    'M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z';

  return (
    <span
      aria-label={`Rated ${rate} out of 5 (${count} reviews)`}
      className="inline-flex items-center gap-1 text-sm text-text-muted"
    >
      {Array.from({ length: 5 }).map((_, i) => {
        const fill = Math.min(1, Math.max(0, rate - i));
        const pct = `${(fill * 100).toFixed(1)}%`;
        const gradId = `${uid}-s${i}`;
        return (
          <svg
            key={i}
            aria-hidden="true"
            className="w-4 h-4 flex-shrink-0"
            viewBox="0 0 20 20"
          >
            <defs>
              <linearGradient id={gradId} x1="0" x2="1" y1="0" y2="0">
                <stop offset={pct} stopColor="#f59e0b" />
                <stop offset={pct} stopColor="#e5e7eb" />
              </linearGradient>
            </defs>
            <path d={starPath} fill={`url(#${gradId})`} />
          </svg>
        );
      })}
      <span className="ml-0.5 font-medium text-text">{rate.toFixed(1)}</span>
      <span className="text-text-muted">({count})</span>
    </span>
  );
}
