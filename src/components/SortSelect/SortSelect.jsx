const SORT_OPTIONS = [
  { value: 'none', label: 'Default' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating_desc', label: 'Rating: Highest First' },
];

/**
 * Dropdown for selecting the product sort order.
 * @param {Object} props
 * @param {string} props.value - Current sort value.
 * @param {Function} props.onChange - Called with the new sort value string.
 * @returns {JSX.Element}
 */
export default function SortSelect({ value, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <label
        htmlFor="sort-select"
        className="text-sm font-medium text-text-muted whitespace-nowrap"
      >
        Sort by
      </label>
      <select
        id="sort-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 rounded-full border border-border bg-surface px-4 pr-8 text-sm text-text shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary hover:border-primary hover:text-primary transition-colors cursor-pointer"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
