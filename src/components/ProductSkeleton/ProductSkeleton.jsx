/**
 * Placeholder card displayed while product data loads.
 * @returns {JSX.Element}
 */
export default function ProductSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="animate-pulse bg-white rounded-card shadow-sm overflow-hidden"
    >
      {/* Image area */}
      <div className="h-56 bg-gray-200 rounded-t-card" />
      {/* Content area */}
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-5 bg-gray-200 rounded w-1/3" />
        <div className="h-3 bg-gray-200 rounded w-full" />
        <div className="h-3 bg-gray-200 rounded w-5/6" />
      </div>
    </div>
  );
}
