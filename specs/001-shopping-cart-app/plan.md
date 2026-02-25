# Implementation Plan: Modern Shopping Cart Web Application

**Branch**: `001-shopping-cart-app` | **Date**: 2026-02-23 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/001-shopping-cart-app/spec.md`

## Summary

Greenfield frontend-only SPA: a modern shopping cart built with React 18 + Vite 5 + Tailwind CSS. Products are fetched from the FakeStore public API via RTK Query (Redux Toolkit's data-fetching layer). Cart state is managed in a Redux Toolkit slice, persisted to `sessionStorage` via `redux-persist`. All functional requirements are addressed across 5 user stories (browse, filter/sort, detail modal, add-to-cart, cart management). Currency: USD. Deployed as a static SPA to Vercel.

---

## Technical Context

| Key | Value |
|-----|-------|
| **Language** | JavaScript (ES2022+) — user preference; see Complexity Tracking |
| **Framework** | React 18 + Vite 5 (`@vitejs/plugin-react`) |
| **Styling** | Tailwind CSS v3 (design tokens in `tailwind.config.js`) |
| **State — Cart** | Redux Toolkit (`cartSlice`) + `redux-persist` → `sessionStorage` |
| **State — Products API** | RTK Query (`createApi`) — satisfies Constitution VII data-fetching library requirement |
| **API Runtime Validation** | Plain JS filter in `transformResponse` (drops malformed products at boundary) |
| **Testing** | Jest 29 + React Testing Library + jest-axe |
| **API Endpoint** | `https://fakestoreapi.com/products` (public, no auth, browser-direct) |
| **Currency Locale** | `en-US` / USD — `Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })` |
| **Storage** | `sessionStorage` only — cart persists per browser session (FR-029) |
| **Deployment** | Vercel — static SPA via `vercel.json` with SPA fallback rewrite |
| **Target Platform** | Browser SPA — Mobile < 768px · Tablet 768–1199px · Desktop ≥ 1200px |
| **Performance Goals** | LCP ≤ 2.5s · INP ≤ 200ms · CLS < 0.1 · Initial JS bundle ≤ 200 KB gzipped |
| **Lazy Loading** | `React.lazy` for `CartDrawer` and `ProductDetailModal` (FR-037) |
| **Prop Docs** | JSDoc `@param` comments on all public component props |
| **Editor Support** | `jsconfig.json` with path alias `@/` → `src/` |

---

## Constitution Check

| # | Principle | Status | How Satisfied |
|---|-----------|--------|---------------|
| I | Component Architecture | ✅ PASS | Atomic Design hierarchy; each component has co-located `.test.jsx`; `components/ui/` for atoms |
| II | Design System Conformance | ✅ PASS | All tokens in `tailwind.config.js` (`colors`, `spacing`, `fontFamily`, `borderRadius`); no hard-coded values |
| III | Responsive-First Development | ✅ PASS | Tailwind mobile-first (`sm:` / `md:` / `lg:`); touch targets ≥ 44px via Tailwind `min-h-11` |
| IV | WCAG 2.1 AA (NON-NEGOTIABLE) | ✅ PASS | `jest-axe` in every component test; ARIA live regions for cart badge + toast; all images have `alt` |
| V | TDD (NON-NEGOTIABLE) | ✅ PASS | Jest + RTL; CI coverage gates: Components 85/80/90, Hooks/Services 90/85/95, Utils 95/90/100 |
| VI | Performance Optimization | ✅ PASS | Vite code splitting; `React.lazy` for drawer + modal; skeleton screens prevent CLS; RTK Query caching |
| VII | State Management Discipline | ✅ PASS | Cart → Redux Toolkit slice; Products → RTK Query; filter/sort UI → `productsSlice` |
| VIII | API Integration & Error Handling | ✅ PASS | RTK Query: loading/success/error states; 10s timeout (FR-036); plain JS validation in `transformResponse`; automatic retry via RTK Query `retry` wrapper (maxRetries: 3) on transient GET failures — see T023 |
| IX | Frontend Security | ✅ PASS | JSX escapes by default; no `dangerouslySetInnerHTML`; external links use `rel="noopener noreferrer"` |
| X | Code Quality & Maintainability | ⚠️ DEVIATION | ESLint + Prettier enforced; TypeScript strict not applicable (JS project — user explicit choice); JSDoc on all public APIs |

**Gate result: 9/10 PASS — 1 justified deviation (Principle X / TypeScript).**

---

## Project Structure

### Documentation (this feature)

```text
specs/001-shopping-cart-app/
├── plan.md                      # This file (/speckit.plan output)
├── research.md                  # Phase 0 research findings
├── data-model.md                # Entities, state shapes
├── quickstart.md                # Scaffold, install, run, test steps
├── contracts/
│   ├── api.md                   # FakeStore API + RTK Query contracts
│   ├── redux-store.md           # Full Redux store shape
│   └── component-interfaces.md # Public prop interfaces (JSDoc)
└── checklists/
    └── requirements.md          # Spec quality checklist
```

### Source Code (repository root — greenfield)

```text
src/
├── app/
│   ├── store.js                    # configureStore + persistStore + middleware
│   └── hooks.js                    # useAppDispatch / useAppSelector
│
├── components/
│   ├── ui/                         # ATOMS — no feature imports allowed
│   │   ├── Button/
│   │   │   ├── Button.jsx
│   │   │   └── Button.test.jsx
│   │   ├── Badge/
│   │   │   ├── Badge.jsx
│   │   │   └── Badge.test.jsx
│   │   ├── QuantitySelector/       # reused on card + modal + cart drawer
│   │   │   ├── QuantitySelector.jsx
│   │   │   └── QuantitySelector.test.jsx
│   │   ├── StarRating/
│   │   ├── Spinner/
│   │   └── Toast/
│   │
│   ├── ProductCard/                # MOLECULE (card + quantity + add-to-cart)
│   │   ├── ProductCard.jsx
│   │   └── ProductCard.test.jsx
│   ├── ProductSkeleton/            # ATOM (matches ProductCard dimensions)
│   ├── CategoryTabs/               # MOLECULE
│   ├── SortSelect/                 # MOLECULE
│   ├── ProductGrid/                # ORGANISM (grid + skeleton + empty + error states)
│   ├── Header/                     # ORGANISM (logo + cart badge + open-cart button)
│   ├── ProductDetailModal/         # ORGANISM — lazy loaded via React.lazy
│   │   ├── ProductDetailModal.jsx
│   │   └── ProductDetailModal.test.jsx
│   └── CartDrawer/                 # ORGANISM — lazy loaded via React.lazy
│       ├── CartDrawer.jsx
│       ├── CartDrawer.test.jsx
│       └── CartLineItem/           # MOLECULE
│
├── features/
│   ├── products/
│   │   ├── productsApi.js          # RTK Query createApi — GET /products (plain JS filter in transformResponse)
│   │   └── productsSlice.js        # activeCategory, sortBy, selectedProductId
│   └── cart/
│       ├── cartSlice.js            # items[], isOpen — add/remove/update/open/close
│       └── cartSelectors.js        # selectCartItems, selectCartTotal, selectCartCount
│
├── hooks/
│   └── useFilteredProducts.js      # memoized filter + sort (useMemo)
│
├── utils/
│   ├── currency.js                 # formatPrice(n) → string (Intl.NumberFormat USD)
│   └── validation.js               # validateQuantity(n) → boolean
│
├── constants/
│   └── index.js                    # MAX_QUANTITY=50, API_TIMEOUT=10000
│
├── App.jsx                         # layout shell + Suspense boundaries
└── main.jsx                        # ReactDOM.createRoot + PersistGate + Provider

tests/
└── integration/                    # multi-component user journey tests (RTL)

public/
tailwind.config.js                  # design tokens
jest.config.js
jest.setup.js                       # @testing-library/jest-dom + jest-axe
jsconfig.json                       # path alias @/ → src/
vite.config.js
vercel.json                         # SPA rewrite rule
package.json
```

**Structure Decision**: Single SPA project at repository root. Frontend-only — no `backend/` subdirectory. All source in `src/`; co-located unit tests; integration tests in `tests/integration/`.

---

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|--------------------------------------|
| Constitution X — TypeScript strict mode not used | Explicit user preference: "use javascript instead" | TypeScript requires `tsc` toolchain + tsconfig + type annotations; user opted for plain JS |
| Constitution VI — WebP/AVIF image format not used | FakeStore CDN (`fakestoreapi.com`) serves JPEG/PNG; client cannot reformat CDN-hosted images | Image conversion proxy (Cloudflare Images, imgix) would add a paid CDN dependency and infrastructure complexity disproportionate to a demo SPA |

**Mitigations**: ESLint (`plugin:react/recommended` + `react-hooks/recommended` + `no-undef` + `no-unused-vars`); plain JS filter for API boundary validation; JSDoc `@param` / `@returns` on all public APIs.
**WebP deviation mitigation**: All `<img>` tags rendering FakeStore images MUST specify explicit `width` and `height` attributes (or equivalent Tailwind `w-*`/`h-*` with `aspect-ratio`) to prevent CLS — partially satisfying the spirit of Constitution VI's layout-stability goal.

---

## Phase 0: Research Findings

See [research.md](./research.md) for full findings. Key decisions:

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Scaffolding | Vite 5 | CRA unmaintained; Vite = faster HMR, native ESM, superior tree-shaking |
| Products async state | RTK Query | Constitution VII forbids raw `useEffect` fetch; RTK Query is Redux-native data-fetching |
| API timeout | `fetchBaseQuery({ timeout: 10000 })` | Enforces FR-036 at the API layer without manual AbortController |
| API response validation | Plain JS filter in `transformResponse` | Constitution VIII requires runtime validation at external boundary |
| Cart persistence | `redux-persist` + `sessionStorage` | FR-029 (page-refresh persistence); session-only per spec assumption |
| Currency | `Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })` | FakeStore prices are USD; `Intl` avoids floating-point rounding bugs (SC-003) |
| Category tabs | Derived from `products.map(p => p.category)` | FR-007 requires dynamic derivation from API data; no hardcoded list |

---

## Data Model

See [data-model.md](./data-model.md) for full details.

### FakeStore API — `Product` shape
```js
{
  id:          Number (int, positive),
  title:       String,
  price:       Number (USD),
  description: String,
  category:    String,    // 'electronics' | "men's clothing" | "women's clothing" | 'jewelery'
  image:       String (URL),
  rating: {
    rate:  Number (0–5),
    count: Number (int ≥ 0)
  }
}
```

### App — `CartItem`
```js
{ productId, title, image, price, quantity }  // quantity: 1–50
```

### Redux State
```js
// cart slice — persisted
{ items: CartItem[], isOpen: Boolean }

// products slice — NOT persisted
{ activeCategory: String, sortBy: String, selectedProductId: Number|null }
```

---

## API Contracts

See [contracts/api.md](./contracts/api.md) for full contracts.

| Endpoint | Method | Auth | Timeout | Validated By |
|----------|--------|------|---------|-------------|
| `https://fakestoreapi.com/products` | GET | None | 10 000 ms | `parseProducts()` (plain JS filter) |

RTK Query hook: `useGetProductsQuery()` — exposes `{ data, isLoading, isFetching, isError, error, refetch }`.

---

## Key Implementation Notes

1. **Category tabs**: `[...new Set(products.map(p => p.category))]` — no hardcoded list. The "All Categories" tab is always prepended.

3. **Floating-point safe totals**: `cartSelectors.js` rounds at `Math.round(raw * 100) / 100`. `formatPrice()` uses `Intl.NumberFormat` — formatted strings are never stored in state.

4. **Lazy loading**: `App.jsx` uses `React.lazy(() => import('./components/CartDrawer/CartDrawer'))` and `React.lazy(() => import('./components/ProductDetailModal/ProductDetailModal'))` with `<Suspense>` fallback spinners. Neither is in the initial bundle (FR-037).

5. **Accessibility**: Cart badge → `aria-label="Cart, {n} items"`. Toast → `role="status"` + `aria-live="polite"`. Modal → `role="dialog"` + `aria-modal="true"` + focus trap on open. Category tabs → `role="tablist"` + `role="tab"`.

6. **Vercel**: `vercel.json` at root:
   ```json
   { "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
   ```

---

## Verification

After `/speckit.tasks` + `/speckit.implement`:

1. `npm run dev` → product grid loads within 3 s (SC-001)
2. Disconnect network → error + retry appears ≤ 500 ms of failure or at 10 s timeout (SC-008)
3. Add product qty 4, add same product qty 2 → cart shows qty 6 (FR-018)
4. Refresh page → cart items preserved (SC-007)
5. Select category tab → grid updates, 0 network requests (SC-010)
6. Enter qty 51 → inline validation blocks add (SC-009)
7. `npm test -- --coverage` → all layer thresholds pass
8. Lighthouse → Performance ≥ 90, Accessibility 100
9. `vercel --prod` → SPA loads and routes correctly
