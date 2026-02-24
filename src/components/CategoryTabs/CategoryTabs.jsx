/**
 * Horizontal scrollable tab list for filtering products by category.
 * @param {Object} props
 * @param {string[]} props.categories - List of category strings from the API.
 * @param {string} props.activeCategory - Currently selected category or 'all'.
 * @param {Function} props.onChange - Called with the selected category string.
 * @returns {JSX.Element}
 */
export default function CategoryTabs({ categories, activeCategory, onChange }) {
  const tabs = [{ label: 'All Categories', value: 'all' }, ...categories.map((c) => ({ label: c, value: c }))];

  return (
    <ul
      role="tablist"
      aria-label="Product categories"
      className="flex overflow-x-auto gap-2 pb-1 scrollbar-none"
    >
      {tabs.map(({ label, value }) => {
        const isActive = activeCategory === value;
        return (
          <li key={value} role="presentation">
            <button
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(value)}
              className={[
                'h-11 px-4 whitespace-nowrap rounded-btn text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                isActive
                  ? 'border-b-2 border-primary text-primary bg-primary/5'
                  : 'text-text-muted hover:text-text hover:bg-surface',
              ].join(' ')}
            >
              {label}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
