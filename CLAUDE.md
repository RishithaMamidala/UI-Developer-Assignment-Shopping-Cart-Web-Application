# Kibo Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-02-23

## Active Technologies

| Concern | Technology |
|---------|-----------|
| Language | JavaScript (ES2022+) — no TypeScript |
| Framework | React 18 + Vite 5 |
| Styling | Tailwind CSS v3 (tokens in `tailwind.config.js`) |
| State — Cart | Redux Toolkit (`cartSlice`) + `redux-persist` (sessionStorage) |
| State — API | RTK Query (`createApi` / `fetchBaseQuery`) |
| API Validation | Zod (`ProductSchema`, `ProductArraySchema` in `transformResponse`) |
| Testing | Jest 29 + React Testing Library + jest-axe |
| External API | `https://fakestoreapi.com/products` (GET, no auth, 10s timeout) |
| Deployment | Vercel — static SPA with `vercel.json` rewrite rule |

## Project Structure

```text
src/
├── app/               # store.js + hooks.js
├── components/
│   ├── ui/            # Atoms: Button, Badge, QuantitySelector, StarRating, Spinner, Toast, ProductSkeleton
│   ├── ProductCard/   # Molecule
│   ├── CategoryTabs/  # Molecule
│   ├── SortSelect/    # Molecule
│   ├── ProductGrid/   # Organism
│   ├── Header/        # Organism
│   ├── ProductDetailModal/  # Organism (lazy)
│   └── CartDrawer/    # Organism (lazy)
│       └── CartLineItem/    # Molecule
├── features/
│   ├── products/      # productsApi.js, productsSlice.js, productSchema.js
│   └── cart/          # cartSlice.js, cartSelectors.js
├── hooks/             # useFilteredProducts.js
├── utils/             # currency.js, validation.js
└── constants/         # index.js (MAX_QUANTITY=50, API_TIMEOUT)
tests/
└── integration/
```

## Commands

```bash
npm run dev          # Vite dev server → http://localhost:5173
npm run build        # Production build → dist/
npm run test         # Jest test suite
npm run test:coverage # Jest + coverage report
npm run lint         # ESLint
npm run format       # Prettier
vercel --prod        # Deploy to Vercel
```

## Code Style

- **Language**: JavaScript (JSX) — no TypeScript. JSDoc `@param`/`@returns` on all public functions and component props.
- **Component files**: `.jsx` extension. Test files: `.test.jsx` co-located in same directory.
- **Utility files**: `.js` extension. Test files: `.test.js` co-located.
- **Atomic Design**: atoms in `components/ui/`, molecules and organisms in `components/`.
- **State**: Cart state via Redux Toolkit (`cartSlice`). API data via RTK Query. Filter/sort UI via `productsSlice`. No raw `useEffect` fetch patterns (Constitution VII).
- **Imports**: Path alias `@/` maps to `src/` (configured in `jsconfig.json` and `vite.config.js`).
- **Constants**: All magic numbers/IDs in `src/constants/index.js`.
- **Currency**: Always use `formatPrice()` from `src/utils/currency.js` — never template literals.

## Key Constraints

- Max cart quantity per product: **50** (`MAX_QUANTITY`)
- API timeout: **10 000 ms** (enforced by `fetchBaseQuery`)
- Cart persistence: **sessionStorage only** (no localStorage, no cross-session)
- No text search — category filter tabs + sort-by only
- No checkout/payment flow — cart review is the final step
- No backend, no database — frontend SPA only

## Constitution Compliance

See `.specify/memory/constitution.md` for full governance rules.

Key non-negotiables:
- **WCAG 2.1 AA** — `jest-axe` in every component test; zero critical/serious violations
- **TDD** — failing test before implementation; coverage thresholds enforced in CI
- **No raw useEffect fetch** — use RTK Query for all API calls
- **No dangerouslySetInnerHTML** — React JSX escapes by default

## Recent Changes

- 2026-02-23: Feature `001-shopping-cart-app` planned — React + Vite + Tailwind + Redux + Jest stack confirmed

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
