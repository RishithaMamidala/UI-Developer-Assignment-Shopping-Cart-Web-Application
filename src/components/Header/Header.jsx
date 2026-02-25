/**
 * Site header with brand name and cart button.
 * @param {Object} props
 * @param {number} props.cartCount - Number of items in the cart.
 * @param {Function} props.onOpenCart - Called when the cart button is clicked.
 * @returns {JSX.Element}
 */
export default function Header({ cartCount, onOpenCart }) {
  return (
    <header className="sticky top-0 z-50 bg-primary border-b border-primary-hover shadow-sm">
      <nav
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between"
        aria-label="Site navigation"
      >
        <span className="text-2xl font-bold text-white tracking-tight">Kibo Store</span>

        <button
          type="button"
          aria-label={`Cart, ${cartCount} items`}
          onClick={onOpenCart}
          className="relative h-11 w-11 flex items-center justify-center rounded-btn text-white bg-white/10 border border-white/30 shadow-md hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white transition-colors"
        >
          {/* Cart icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6"
            aria-hidden="true"
          >
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>

          {cartCount > 0 && (
            <span
              key={cartCount}
              aria-hidden="true"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center leading-none animate-badge-pop"
            >
              {cartCount > 99 ? '99+' : cartCount}
            </span>
          )}
        </button>
      </nav>
    </header>
  );
}
