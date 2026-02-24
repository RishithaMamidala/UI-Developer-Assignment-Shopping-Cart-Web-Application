# Tasks: Modern Shopping Cart Web Application

**Input**: Design documents from `/specs/001-shopping-cart-app/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

**Tests**: Included — Constitution Principle V mandates TDD (NON-NEGOTIABLE). Failing tests are written before every implementation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Scaffold the Vite project, install all dependencies, and configure tooling so the codebase is ready for feature implementation.

- [X] T001 Scaffold Vite + React project at repo root: run `npm create vite@latest . -- --template react` (select React → JavaScript when prompted); confirm index.html, vite.config.js, src/App.jsx, src/main.jsx are generated
- [X] T002 Install state management and validation deps: `npm install @reduxjs/toolkit react-redux redux-persist zod`
- [X] T003 [P] Install Tailwind CSS deps: `npm install -D tailwindcss postcss autoprefixer` then `npx tailwindcss init -p`
- [X] T004 [P] Install testing deps: `npm install -D jest @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-axe jest-environment-jsdom babel-jest @babel/core @babel/preset-env @babel/preset-react identity-obj-proxy msw`; also install E2E tooling: `npm install -D @playwright/test` then `npx playwright install --with-deps chromium`; create `playwright.config.js` at repo root with baseURL: 'http://localhost:5173', testDir: './e2e', use: { browserName: 'chromium' }
- [X] T005 Configure tailwind.config.js with design tokens: colors (primary #2563eb/hover #1d4ed8, surface #ffffff/muted #f9fafb, border #e5e7eb, text #111827/muted #6b7280, error #ef4444, success #22c55e, warning #f59e0b), fontFamily Inter, borderRadius card 0.75rem / btn 0.5rem; content: ['./index.html', './src/**/*.{js,jsx}']
- [X] T006 Replace src/index.css with Tailwind directives: `@tailwind base; @tailwind components; @tailwind utilities;`
- [X] T007 Create jest.config.js with testEnvironment: 'jsdom', setupFilesAfterFramework: ['./jest.setup.js'], moduleNameMapper for `^@/(.*)$` → `<rootDir>/src/$1` and CSS → identity-obj-proxy, transform with babel-jest, coverageThreshold (per-layer per Constitution V): `{ global: { statements: 85, branches: 80, functions: 90 }, './src/hooks/**': { statements: 90, branches: 85, functions: 95 }, './src/features/**': { statements: 90, branches: 85, functions: 95 }, './src/utils/**': { statements: 95, branches: 90, functions: 100 } }`, collectCoverageFrom ['src/**/*.{js,jsx}', '!src/main.jsx', '!src/app/store.js', '!src/constants/index.js']
- [X] T008 [P] Create jest.setup.js importing `@testing-library/jest-dom` and exporting configured `axe` from `jest-axe` with color-contrast rule enabled (WCAG 2.1 AA)
- [X] T009 [P] Create babel.config.js exporting presets: ['@babel/preset-env', { targets: { node: 'current' } }] and ['@babel/preset-react', { runtime: 'automatic' }]
- [X] T010 [P] Create jsconfig.json with compilerOptions: baseUrl ".", paths "@/*": ["src/*"], checkJs: false, jsx: "react-jsx"; include: ["src"]
- [X] T011 [P] Update vite.config.js to add resolve.alias: { '@': path.resolve(__dirname, 'src') } and import path from 'path'
- [X] T012 [P] Create vercel.json at repo root with SPA rewrite AND CSP headers (Constitution IX.5): `{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }], "headers": [{ "source": "/(.*)", "headers": [{ "key": "Content-Security-Policy", "value": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' https://fakestoreapi.com data:; connect-src https://fakestoreapi.com; font-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com" }] }] }`
- [X] T013 Update package.json scripts section: dev (vite), build (vite build), preview (vite preview), test (jest), test:watch (jest --watch), test:coverage (jest --coverage), lint (eslint src --ext .js,.jsx), lint:fix (eslint src --ext .js,.jsx --fix), format (prettier --write "src/**/*.{js,jsx,css}")
- [X] T014 [P] Create .eslintrc.cjs with extends: ['plugin:react/recommended', 'plugin:react-hooks/recommended'], parserOptions: { ecmaVersion: 2022, sourceType: 'module', ecmaFeatures: { jsx: true } }, rules: no-unused-vars warn, no-undef error, react/prop-types off (JSDoc used instead), react/react-in-jsx-scope off
- [X] T015 [P] Create .prettierrc.json: singleQuote true, semi true, tabWidth 2, trailingComma 'es5', printWidth 100

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Implement the core Redux store, RTK Query API, Zod schema, utility functions, and the custom filter/sort hook. These are shared across ALL user stories and MUST be complete before any story begins.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T016 [P] Create src/constants/index.js exporting: `MAX_QUANTITY = 50`, `API_TIMEOUT = 10000`
- [X] T017 [P] Write src/utils/currency.test.js (TDD — must FAIL before T019): test cases: formatPrice(109.95) → '$109.95', formatPrice(0) → '$0.00', formatPrice(3 * 0.1) → '$0.30' (floating-point guard), formatPrice(1999.99) → '$1,999.99'
- [X] T018 [P] Write src/utils/validation.test.js (TDD — must FAIL before T020): test cases: validateQuantity(1) → true, validateQuantity(50) → true, validateQuantity(0) → false, validateQuantity(51) → false, validateQuantity(-1) → false, validateQuantity(1.5) → false, validateQuantity('2') → false, validateQuantity(NaN) → false
- [X] T019 [P] Implement src/utils/currency.js exporting `formatPrice(n)` using `new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)`; verify T017 tests pass
- [X] T020 [P] Implement src/utils/validation.js exporting `validateQuantity(n)` returning true only when `Number.isInteger(n) && n >= 1 && n <= MAX_QUANTITY` (import MAX_QUANTITY from constants); verify T018 tests pass
- [X] T021 [P] Write src/features/products/productSchema.test.js (TDD — must FAIL before T022): test cases: valid product object passes ProductSchema.parse, product with missing price throws ZodError, ProductArraySchema.parse filters out product with empty string image (returns array without that item), ProductArraySchema.parse filters out product with price: 0, valid products in same array are preserved
- [X] T022 [P] Implement src/features/products/productSchema.js with Zod: ProductSchema (id: z.number().int().positive(), title: z.string().min(1), price: z.number().nonnegative(), description: z.string(), category: z.string(), image: z.string().url(), rating: z.object({ rate: z.number().min(0).max(5), count: z.number().int().nonnegative() })), ProductArraySchema = z.array(ProductSchema).transform(arr => arr.filter(p => p.price > 0 && p.image)); export JSDoc @typedef Product; verify T021 tests pass
- [X] T023 Implement src/features/products/productsApi.js: import `retry` from `@reduxjs/toolkit/query`; create `const staggeredBase = retry(fetchBaseQuery({ baseUrl: 'https://fakestoreapi.com', timeout: 10000 }), { maxRetries: 3 })` (Constitution VIII — automatic retry on transient GET failures); createApi with reducerPath 'productsApi', baseQuery: staggeredBase, getProducts endpoint: query: () => '/products', transformResponse: raw => ProductArraySchema.parse(raw); export useGetProductsQuery
- [X] T024 [P] Implement src/features/products/productsSlice.js: initialState { activeCategory: 'all', sortBy: 'none', selectedProductId: null, productQuantities: {} }; reducers: setActiveCategory, setSortBy, setSelectedProduct, clearSelectedProduct, resetFilters, setProductQuantity(state, action) { state.productQuantities[action.payload.productId] = action.payload.quantity }; export selectProductQuantity = (state, productId) => state.products.productQuantities[productId] ?? 1
- [X] T025 Write src/features/cart/cartSlice.test.js (TDD — must FAIL before T026): test cases: addToCart with new product adds item to empty cart, addToCart with existing productId accumulates quantity (not duplicate), addToCart caps accumulated quantity at MAX_QUANTITY (50), updateQuantity sets new quantity, updateQuantity with quantity 0 removes the item, removeItem removes item by productId, removeItem is a no-op if productId not found, openCart sets isOpen true, closeCart sets isOpen false; **rapid-dispatch edge case**: dispatch addToCart for the same product 10× sequentially with qty 1 each — assert final quantity is 10 (no skipped updates, reducer is synchronous so no race condition possible); **large-cart edge case**: dispatch addToCart for 30 distinct products (unique productIds 1–30) — assert items.length is 30 and selectCartCount returns 30, confirming no item deduplication across different products
- [X] T026 Implement src/features/cart/cartSlice.js: CartItem shape { productId, title, image, price, quantity }; initialState { items: [], isOpen: false }; reducers per redux-store.md contract: addToCart merges or appends, updateQuantity handles 0-removal and MAX_QUANTITY cap, removeItem filters, openCart/closeCart toggle; export all action creators and default reducer
- [X] T027 Write src/features/cart/cartSelectors.test.js (TDD — must FAIL before T028): test cases: selectCartItems returns items array, selectCartCount returns sum of all quantities, selectCartTotal returns Math.round(sum * 100) / 100 (includes floating-point test with prices summing to imprecise float), selectIsCartOpen returns boolean, selectCartItemByProductId returns correct item or undefined
- [X] T028 Implement src/features/cart/cartSelectors.js exporting: selectCartItems(state) = state.cart.items, selectCartCount(state) = items.reduce((s, i) => s + i.quantity, 0), selectCartTotal(state) = Math.round(items.reduce((s, i) => s + i.price * i.quantity, 0) * 100) / 100, selectIsCartOpen(state) = state.cart.isOpen, selectCartItemByProductId(state, productId) = items.find(i => i.productId === productId); verify T027 tests pass
- [X] T029 Implement src/app/store.js: import persistReducer, persistStore, storage from 'redux-persist/lib/storage/session'; cartPersistConfig { key: 'cart', storage, whitelist: ['items', 'isOpen'] }; configureStore with reducers { [productsApi.reducerPath]: productsApi.reducer, products: productsReducer, cart: persistedCartReducer }; middleware: getDefaultMiddleware({ serializableCheck: { ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER] } }).concat(productsApi.middleware); export store, persistor, default store
- [X] T030 Implement src/app/hooks.js exporting `useAppDispatch = () => useDispatch()` and `useAppSelector = useSelector` with JSDoc @returns comments
- [X] T031 Write src/hooks/useFilteredProducts.test.js (TDD — must FAIL before T032): test cases: returns all products when activeCategory is 'all' and sortBy is 'none', filters to matching category, returns empty array when no products match category, sorts price_asc (lowest first), sorts price_desc (highest first), sorts rating_desc (highest first), applies combined category filter AND sort simultaneously
- [X] T032 Implement src/hooks/useFilteredProducts.js: reads activeCategory and sortBy from Redux via useAppSelector, reads products from useGetProductsQuery().data ?? [], computes filtered+sorted result via useMemo; filter: activeCategory === 'all' ? all : products matching category; sort: price_asc/price_desc compare price, rating_desc compare rating.rate; returns memoized array; verify T031 tests pass
- [X] T085 Create tests/msw-setup.js: export `server = setupServer(rest.get('https://fakestoreapi.com/products', (req, res, ctx) => res(ctx.json([...10 mock products covering all FakeStore categories...]))))` as the default shared fixture; update jest.setup.js to import `server` from `./tests/msw-setup.js` and add `beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }))`, `afterEach(() => server.resetHandlers())`, `afterAll(() => server.close())` — integration tests import `server` and call `server.use(...)` to override handlers; they do NOT call `setupServer()` themselves (H1 resolved: single shared server architecture)

**Checkpoint**: Foundation ready — store, API, schema, selectors, utils all tested and passing; shared MSW server configured. User story implementation can begin.

---

## Phase 3: User Story 1 — Browse Product Catalogue (Priority: P1) 🎯 MVP

**Goal**: Landing page fetches products from FakeStore API and renders a responsive product grid. Skeleton cards appear during loading. Error state with retry appears on API failure. Empty state appears when API returns zero products. Image fallback prevents broken-image icons.

**Independent Test**: Disable cart and modal features, load the app, verify the product grid loads with product info, skeleton cards appear first, the API error state shows a "Try Again" button, the API zero-results state shows a meaningful message.

### Tests for User Story 1 (TDD — write before implementation) ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T033 [P] [US1] Write src/components/ui/Spinner/Spinner.test.jsx: renders div with role="status" and aria-label prop (default "Loading..."), size sm/md/lg applies different width/height classes, axe audit passes (jest-axe toHaveNoViolations)
- [X] T034 [P] [US1] Write src/components/ui/Badge/Badge.test.jsx: renders children text, variant 'error' applies error color class, variant 'neutral' is default, extra className prop merges, axe audit passes
- [X] T035 [P] [US1] Write src/components/ui/StarRating/StarRating.test.jsx: has aria-label="Rated {rate} out of 5 ({count} reviews)", renders review count as visible text, axe audit passes
- [X] T036 [P] [US1] Write src/components/ui/Button/Button.test.jsx: renders children, 'primary' is default variant, 'sm'/'md'/'lg' sizes render, disabled prop makes button disabled and applies disabled styles, loading prop shows Spinner child and disables button, extra HTML attributes spread to <button>, axe audit passes
- [X] T037 [P] [US1] Write src/components/ProductSkeleton/ProductSkeleton.test.jsx: renders with aria-hidden="true", contains animate-pulse class (Tailwind skeleton animation), does not render any text content
- [X] T038 [P] [US1] Write src/components/ProductCard/ProductCard.test.jsx (basic read-only version): renders product.title, renders product image with alt=product.title, renders price via formatPrice (e.g. "$109.95"), renders StarRating component, renders truncated description, onerror on image triggers placeholder src swap, axe audit passes
- [X] T039 [P] [US1] Write src/components/ProductGrid/ProductGrid.test.jsx: isLoading renders 8 ProductSkeleton components, isError renders error message text and a retry button that calls onRetry, isEmpty with emptyVariant='api-error' renders appropriate message, isEmpty with emptyVariant='filter-empty' renders "Clear Filters" button that calls onClearFilters, renders one ProductCard per product when not loading/error/empty, axe audit passes
- [X] T040 [P] [US1] Write src/components/Header/Header.test.jsx: renders a cart button with aria-label="Cart, 0 items" when cartCount=0, aria-label updates to "Cart, 3 items" when cartCount=3, clicking cart button calls onOpenCart, axe audit passes

### Implementation for User Story 1

- [X] T041 [P] [US1] Implement src/components/ui/Spinner/Spinner.jsx: div role="status" aria-label={label}, size-mapped Tailwind w/h classes (sm: w-4 h-4, md: w-8 h-8, lg: w-12 h-12), border-4 border-primary border-t-transparent rounded-full animate-spin; export with JSDoc @param
- [X] T042 [P] [US1] Implement src/components/ui/Badge/Badge.jsx: span with variant-mapped bg+text color Tailwind classes (error: bg-error/10 text-error, warning: bg-warning/10 text-warning, success: bg-success/10 text-success, neutral: bg-gray-100 text-text-muted), px-2 py-0.5 rounded-full text-xs font-medium, className merge; export with JSDoc @param
- [X] T043 [P] [US1] Implement src/components/ui/StarRating/StarRating.jsx: span with aria-label="Rated {rate} out of 5 ({count} reviews)", render 5 star icons (filled vs outline based on rate value using Math.round), show count as "({count})" text beside stars; export with JSDoc @param
- [X] T044 [P] [US1] Implement src/components/ui/Button/Button.jsx: <button> element, variant-mapped Tailwind classes (primary: bg-primary text-white hover:bg-primary-hover, secondary: border border-primary text-primary, ghost: text-text hover:bg-gray-100, danger: bg-error text-white), size-mapped padding/text classes, disabled opacity-50 cursor-not-allowed, loading renders <Spinner size="sm" /> and sets disabled, ...rest spread; export with JSDoc @param
- [X] T045 [P] [US1] Implement src/components/ProductSkeleton/ProductSkeleton.jsx: div aria-hidden="true" animate-pulse, child divs with rounded/bg-gray-200 heights mimicking ProductCard: tall image area, short title line, medium price line, two description lines; export with JSDoc @param
- [X] T046 [P] [US1] Implement src/components/ProductCard/ProductCard.jsx (basic read-only — add-to-cart wired in US4): img with src=product.image, alt=product.title, onerror sets src to a placeholder SVG data URL; h2 with product.title truncated (line-clamp-2); formatPrice(product.price); StarRating component; p with product.description truncated (line-clamp-3); card body div onClick calls onOpenDetail(product.id) (prop wired in US3); export with JSDoc @param
- [X] T047 [US1] Implement src/components/ProductGrid/ProductGrid.jsx: if isLoading render grid of 8 ProductSkeleton; if isError render centered error message + Button "Try Again" calling onRetry; if isEmpty and emptyVariant='filter-empty' render empty state + Button "Clear Filters" calling onClearFilters; if isEmpty and emptyVariant='api-error' render API error empty state; else render responsive CSS grid (grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4) mapping products to ProductCard with onOpenDetail prop passthrough; add aria-live="polite" region announcing loading/error/count states
- [X] T048 [US1] Implement src/components/Header/Header.jsx: sticky top-0 z-50 nav, logo/brand text on left, cart button on right with aria-label=`Cart, ${cartCount} items`, numeric badge (absolute positioned span) shown when cartCount > 0, onOpenCart prop called on button click; min touch target h-11 w-11; export with JSDoc @param
- [X] T049 [US1] Create src/App.jsx: imports Header (eager), ProductGrid (eager), CategoryTabs and SortSelect as regular imports (placeholder stubs until US2); lazy-loads CartDrawer and ProductDetailModal via React.lazy; uses useGetProductsQuery for data/isLoading/isError/refetch; uses useAppSelector for selectedProductId and isCartOpen; uses useAppDispatch for openCart, setSelectedProduct, clearSelectedProduct, closeCart; derives isEmpty, emptyVariant; renders Header + filter/sort area + ProductGrid inside main; wraps lazy components in Suspense with Spinner fallback; handles onOpenDetail by dispatching setSelectedProduct
- [X] T050 [US1] Create src/main.jsx: ReactDOM.createRoot(document.getElementById('root')).render with StrictMode > Provider store={store} > PersistGate loading={<Spinner />} persistor={persistor} > App

**Checkpoint**: US1 fully functional — product grid loads from FakeStore API, skeleton cards during fetch, error state with retry, products display name/image/price/rating/description, empty state shown on zero results.

---

## Phase 4: User Story 2 — Filter & Sort Products (Priority: P2)

**Goal**: Category filter tabs derived from API data narrow the product grid client-side. Sort-by control reorders by price or rating. Combined filter+sort works together. Empty-filter state with "Clear Filters" action resets both controls.

**Independent Test**: Load app, let products load, click a category tab → verify only matching products shown. Change sort order → verify products reorder within 300 ms. Click "All Categories" → verify full grid restored. No network requests occur during any filter/sort interaction.

### Tests for User Story 2 (TDD — write before implementation) ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T051 [P] [US2] Write src/components/CategoryTabs/CategoryTabs.test.jsx: renders ul with role="tablist", renders one button role="tab" per category plus "All Categories", active tab has aria-selected="true", clicking a non-active tab calls onChange with the category string, clicking "All Categories" calls onChange with 'all', container has overflow-x-auto for horizontal scroll, axe audit passes
- [X] T052 [P] [US2] Write src/components/SortSelect/SortSelect.test.jsx: renders <label> associated with <select> via htmlFor/id, select has 4 options (none/price_asc/price_desc/rating_desc), current value matches props.value, onChange fires with new value on change event, axe audit passes

### Implementation for User Story 2

- [X] T053 [P] [US2] Implement src/components/CategoryTabs/CategoryTabs.jsx: ul role="tablist" flex overflow-x-auto, render "All Categories" tab first (value 'all') then map categories prop; each button role="tab" aria-selected={activeCategory===value} with onClick calling onChange(value); active tab has distinct visual style (border-b-2 border-primary text-primary); min touch target h-11; export with JSDoc @param
- [X] T054 [P] [US2] Implement src/components/SortSelect/SortSelect.jsx: <label htmlFor="sort-select">Sort by</label> and <select id="sort-select" value={value} onChange={e => onChange(e.target.value)}>; options: { value: 'none', label: 'Default' }, price_asc 'Price: Low to High', price_desc 'Price: High to Low', rating_desc 'Rating: Highest First'; styled Tailwind select input; export with JSDoc @param
- [X] T055 [US2] Update src/App.jsx to: (1) derive categories from API data as [...new Set(products.map(p => p.category))], (2) read activeCategory/sortBy from productsSlice via useAppSelector, (3) render CategoryTabs with categories/activeCategory/onChange=dispatch(setActiveCategory), (4) render SortSelect with value/onChange=dispatch(setSortBy), (5) replace raw products with useFilteredProducts hook result passed to ProductGrid, (6) ensure onClearFilters dispatches resetFilters()
- [X] T056 [US2] Write tests/integration/filter-sort.test.jsx: import `server` from `tests/msw-setup.js` (global server started/stopped by jest.setup.js); in beforeEach call `server.use(rest.get('https://fakestoreapi.com/products', (req, res, ctx) => res(ctx.json([5 mock products across 2 categories]))))` to override the default fixture; render App inside Provider+PersistGate; wait for products to load; click category tab → assert only matching products rendered; change sort to price_asc → assert products in price-ascending order; click "All Categories" → assert all 5 products shown; set category that matches 0 products → assert "Clear Filters" button visible; click "Clear Filters" → assert all products shown; assert no additional network requests fired during filter/sort (network spy); afterEach calls server.resetHandlers() to restore default fixture

**Checkpoint**: US2 fully functional — category tabs filter grid, sort-by reorders, combined filter+sort works, empty filter state with "Clear Filters" resets both controls. No extra API calls.

---

## Phase 5: User Story 3 — View Product Details (Priority: P3)

**Goal**: Clicking a product card body opens a full product detail modal overlay. Modal shows all product attributes, a quantity selector (min 1, max 50), and an "Add to Cart" button. Modal is closeable and restores listing state.

**Independent Test**: Click any product card body. Verify detail modal opens with full product data. QuantitySelector defaults to 1, can be incremented/decremented, rejects values < 1 or > 50. Close modal via close button, Escape key, or backdrop click — listing restores with filters unchanged.

### Tests for User Story 3 (TDD — write before implementation) ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T057 [P] [US3] Write src/components/ui/QuantitySelector/QuantitySelector.test.jsx: decrement button has aria-label="Decrease quantity", increment button has aria-label="Increase quantity", input has associated <label> via htmlFor/id, clicking decrement calls onChange with value-1, clicking increment calls onChange with value+1, typing value calls onChange, value below min (1) shows role="alert" error message with aria-live="assertive", value above max (50) shows role="alert" error, error message clears when focus leaves the component (onBlur with relatedTarget outside component), disabled prop disables all three controls, axe audit passes
- [X] T058 [P] [US3] Write src/components/ProductDetailModal/ProductDetailModal.test.jsx: has role="dialog" aria-modal="true" aria-labelledby pointing to title, displays product.title, product.description, formatPrice(product.price), product.category, product.image with correct alt, StarRating with rate/count, QuantitySelector defaults to value=1, clicking Add to Cart dispatches addToCart with { product, quantity } and calls onClose, pressing Escape calls onClose, clicking backdrop calls onClose, clicking close button calls onClose, productId not in RTK Query cache renders fallback (not crash), disables Add to Cart + QuantitySelector when cart has MAX_QUANTITY of product, shows "Already at max quantity in cart" message at MAX_QUANTITY, does not call onClose when button clicked at MAX_QUANTITY, axe audit passes

### Implementation for User Story 3

- [X] T059 [P] [US3] Implement src/components/ui/QuantitySelector/QuantitySelector.jsx: label htmlFor={inputId} with label prop (default 'Quantity'); input id={inputId} type="number" value={value} min={min} max={max} onChange validates and calls onChange(n); decrement button aria-label="Decrease quantity" onClick calls onChange(value - 1) if value > min; increment button aria-label="Increase quantity" onClick calls onChange(value + 1) if value < max; boundary error div role="alert" aria-live="assertive" shown when attempted value out of range; onBlur on wrapper div clears error when focus moves outside the component (e.currentTarget.contains(e.relatedTarget) guard); disabled prop applies to all three controls; export with JSDoc @param
- [X] T060 [US3] Implement src/components/ProductDetailModal/ProductDetailModal.jsx: role="dialog" aria-modal="true" aria-labelledby={titleId}; reads product from useGetProductsQuery().data?.find(p => p.id === productId); quantity from useAppSelector(selectProductQuantity) — shared Redux state synced with listing card; uses selectCartItemByProductId + MAX_QUANTITY to derive isAtMax; QuantitySelector onChange dispatches setProductQuantity; Add to Cart Button guards on isAtMax, dispatches addToCart, dispatches setProductQuantity reset to 1, then calls onClose; QuantitySelector and button both disabled={isAtMax}; inline "Already at max quantity in cart" message (role="status") when isAtMax; Escape keydown + backdrop + close button all call onClose; wrap in fixed inset-0 overlay; NOTE: declared as React.lazy export in App.jsx; export with JSDoc @param
- [X] T061 [US3] Update src/App.jsx to render ProductDetailModal in Suspense boundary when selectedProductId !== null, passing productId={selectedProductId} onClose={() => dispatch(clearSelectedProduct())}; update onOpenDetail handler in ProductGrid to dispatch setSelectedProduct(id)
- [X] T062 [US3] Update src/components/ProductCard/ProductCard.jsx to make the card body (the area excluding add-to-cart button and quantity selector) clickable: wrap content in a div/button with onClick={e => { e.stopPropagation(); onOpenDetail(product.id); }}; keyboard accessible (role="button" tabIndex=0 onKeyDown for Enter/Space)

**Checkpoint**: US3 fully functional — product card click opens modal overlay, all product attributes shown, QuantitySelector enforces 1–50, Add to Cart from modal works, modal closes and restores listing.

---

## Phase 6: User Story 4 — Add to Cart with Quantity Control (Priority: P4)

**Goal**: Each product card on the listing exposes a QuantitySelector (default 1) and "Add to Cart" button. Adding increases cumulative quantity for existing items. Cart badge in Header updates in real time. Success Toast notification appears on each add.

**Independent Test**: Set quantity selector on a product card to 4 and click "Add to Cart". Verify cart badge shows 4. Set quantity to 2 on the same product and add again. Verify badge shows 6 and no duplicate cart entries exist.

### Tests for User Story 4 (TDD — write before implementation) ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T063 [P] [US4] Write src/components/ui/Toast/Toast.test.jsx: renders div role="status" aria-live="polite", displays message prop, success variant has success styling, error variant has error styling, onDismiss called after 3 seconds (jest fake timers), onDismiss called when dismiss button clicked, axe audit passes
- [X] T064 [P] [US4] Write full src/components/ProductCard/ProductCard.test.jsx (extended): renders QuantitySelector with default value 1, Add to Cart Button is present and enabled, clicking Add to Cart calls onAddToCart with correct product and quantity, quantity resets to 1 after successful add, shows inline role="alert" "Already at max quantity in cart" message when clicked at MAX_QUANTITY (cart pre-populated via preloadedState), does not call onAddToCart when at MAX_QUANTITY, axe audit passes; makeStore/renderCard accept cartItems param for preloadedState
- [X] T065 [P] [US4] Write tests/integration/add-to-cart.test.jsx: import `server` from `tests/msw-setup.js`; in beforeEach call `server.use(http.get('https://fakestoreapi.com/products', () => HttpResponse.json([2 mock products])))` to override the default fixture; render App; wait for product cards; set quantity selector on first product to 3, click Add to Cart, assert cart badge shows 3, assert Toast success message visible; set quantity on same product to 2, click Add to Cart again, assert badge shows 5 (cumulative), assert cart has one line item for that product with quantity 5; afterEach calls server.resetHandlers() to restore default fixture

### Implementation for User Story 4

- [X] T066 [P] [US4] Implement src/components/ui/Toast/Toast.jsx: div role="status" aria-live="polite" fixed bottom-4 right-4 z-50, variant-based bg color (success: bg-success, error: bg-error) with white text, message text, optional X dismiss button calling onDismiss; useEffect sets setTimeout(onDismiss, 3000) on mount, clears on unmount; export with JSDoc @param
- [X] T067 [US4] Update src/components/ProductCard/ProductCard.jsx to add: (1) showMaxError state (useState(false)); (2) quantity from useAppSelector(selectProductQuantity) — shared Redux state; (3) useAppSelector(selectCartItemByProductId) to derive isAtMax; (4) useEffect clears showMaxError when isAtMax becomes false; (5) QuantitySelector with value=quantity onChange=dispatch(setProductQuantity) min=1 max=MAX_QUANTITY; (6) Add to Cart Button — if isAtMax sets showMaxError and returns early, otherwise calls onAddToCart then dispatches setProductQuantity({productId, quantity: 1}); (7) inline role="alert" "Already at max quantity in cart" shown when showMaxError; (8) onBlur on add-to-cart div clears showMaxError; (9) stopPropagation on add-to-cart area
- [X] T068 [US4] Update src/components/Header/Header.jsx to show numeric cart badge overlay: absolute-positioned span over the cart icon, displays cartCount, hidden when cartCount === 0; cartCount prop sourced from selectCartCount in App.jsx; aria-label remains dynamic
- [X] T069 [US4] Update src/App.jsx to: (1) read cartCount from selectCartCount and pass to Header, (2) add local state `const [toast, setToast] = useState({ visible: false, message: '', variant: 'success' })`, (3) create `handleAddToCart(product, quantity)` that dispatches `addToCart({ product, quantity })` then shows success toast (variant: 'success'); max-cart guard is handled inside ProductCard itself — App.jsx is not called when at max, (4) pass `handleAddToCart` down to ProductGrid → ProductCard, (5) render `<Toast message variant onDismiss>` at the App root

**Checkpoint**: US4 fully functional — quantity selector on listing card, Add to Cart increments real-time badge, cumulative add for same product, success toast on each add.

---

## Phase 7: User Story 5 — View and Manage the Cart (Priority: P5)

**Goal**: Cart drawer slides in from right showing all line items with name, thumbnail, unit price, quantity controls, line subtotal, and remove button. Order total recalculates immediately. Cart persists across page refresh (sessionStorage). Empty cart state has CTA back to browsing.

**Independent Test**: Add 3 different products via listing with different quantities. Open cart drawer. Verify all items shown with correct subtotals and order total. Increase one quantity → total updates. Remove one item → total updates, item disappears. Refresh page → cart contents still present.

### Tests for User Story 5 (TDD — write before implementation) ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T070 [P] [US5] Write src/components/CartDrawer/CartLineItem/CartLineItem.test.jsx: renders product thumbnail with alt text, renders product name, renders unit price via formatPrice, renders QuantitySelector with item.quantity, renders line subtotal (formatPrice(price * quantity)), renders remove button, clicking remove button calls onRemove, changing QuantitySelector calls onQuantityChange with new value, axe audit passes
- [X] T071 [P] [US5] Write src/components/CartDrawer/CartDrawer.test.jsx: has role="dialog" aria-modal="true" aria-label="Shopping cart", renders one CartLineItem per cart item, renders order total using selectCartTotal, clicking backdrop calls onClose, clicking close button calls onClose, empty cart shows empty state with "Continue Shopping" CTA, isOpen=false does not render drawer content (or renders hidden), axe audit passes

### Implementation for User Story 5

- [X] T072 [P] [US5] Implement src/components/CartDrawer/CartLineItem/CartLineItem.jsx: flex row layout, img thumbnail src=item.image alt=item.title w-16 h-16 object-cover rounded, item.title (truncated), formatPrice(item.price), QuantitySelector with value=item.quantity onChange=onQuantityChange min=1 max=MAX_QUANTITY, formatPrice(item.price * item.quantity) as subtotal, remove Button variant="ghost" with trash icon calling onRemove; export with JSDoc @param
- [X] T073 [US5] Implement src/components/CartDrawer/CartDrawer.jsx: fixed right-0 top-0 h-full w-80 sm:w-96 bg-white shadow-xl z-50 transform transition-transform, translated off-screen when !isOpen (translate-x-full) and on-screen when isOpen (translate-x-0); role="dialog" aria-modal="true" aria-label="Shopping cart"; header with title + close button calling onClose; scrollable CartLineItem list with items from selectCartItems (passed via props); if empty: empty state div with "Your cart is empty" + Button "Continue Shopping" calling onClose; footer with order total from selectCartTotal via formatPrice; semi-transparent backdrop div onClick=onClose; NOTE: declared as React.lazy export in App.jsx; export with JSDoc @param
- [X] T074 [US5] Wire CartDrawer into src/App.jsx: import via React.lazy, read isOpen from selectIsCartOpen, read cartItems from selectCartItems, read cartTotal from selectCartTotal, dispatch updateQuantity on quantity change, dispatch removeItem on remove, dispatch closeCart on close, wrap in Suspense with Spinner fallback; ensure PersistGate in main.jsx delays render until sessionStorage rehydration
- [X] T075 [US5] Write tests/integration/cart-management.test.jsx: import `server` from `tests/msw-setup.js`; in beforeEach call `server.use(rest.get(..., 3 mock products))` to override fixture; render App; add product A (qty 2) and product B (qty 1) from listing; open cart drawer; assert 2 CartLineItems with correct names, prices, subtotals; assert total = formatPrice(2*priceA + 1*priceB); increase product A qty to 3 via QuantitySelector in cart; assert subtotal and total updated; click remove on product B; assert only product A remains; assert total updated; afterEach calls server.resetHandlers(); **timeout + SC-008 (500ms)**:  after initial load succeeds, call `server.use(rest.get(..., ctx.delay(11000)))`, call RTK Query's `refetch()`, then `await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument(), { timeout: 11500 })` — confirms error appears ≤ 500ms after the 11s delayed response fails the 10s timeout; **offline edge case**: after products load, call `server.close()`, perform cart qty change and remove actions, assert they complete without errors and totals update correctly — cart MUST remain fully operable with already-loaded data
- [X] T076 [US5] Write tests/integration/cart-persistence.test.jsx: import `server` from `tests/msw-setup.js` (default fixture used — no override needed, server.listen/close handled globally by jest.setup.js); pre-populate sessionStorage with serialized redux-persist cart state containing 2 items before mounting; mount App inside Provider+PersistGate; assert cart badge immediately shows persisted count (PersistGate rehydrates before API resolves); wait for API to respond (default fixture returns 10 products); open cart drawer; assert persisted items visible and product loading skeleton shown simultaneously; verify no race condition corrupts cart count

**Checkpoint**: US5 fully functional — cart drawer shows all items with correct data, quantity/remove controls update totals in real time, empty state shown when cart emptied, cart survives page refresh.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Accessibility verification, ESLint/Prettier pass, coverage report, responsive audit, security checks, and deployment validation.

- [X] T077 [P] Run npm run lint and fix all ESLint violations across src/ — ensure no no-unused-vars errors, no-undef errors, or react-hooks/rules-of-hooks violations
- [X] T078 [P] Run npm run test:coverage and verify all per-layer thresholds pass: global (statements ≥ 85, branches ≥ 80, functions ≥ 90), hooks+features (statements ≥ 90, branches ≥ 85, functions ≥ 95), utils (statements ≥ 95, branches ≥ 90, functions ≥ 100); identify and add missing tests for any failing coverage paths
- [X] T079 [P] Verify WCAG 2.1 AA compliance: confirm all jest-axe toHaveNoViolations assertions pass in every component test; spot-check focus ring visibility on Button, CategoryTabs, QuantitySelector, ProductDetailModal close button, CartDrawer close button
- [X] T080 [P] Verify responsive layouts at 320 px (mobile), 768 px (tablet), 1200 px (desktop): product grid reflows correctly, Header cart badge visible, CategoryTabs scroll horizontally on mobile, CartDrawer is full-height on mobile, touch targets ≥ 44 px throughout
- [X] T081 Verify security requirements: grep src/ for dangerouslySetInnerHTML (should be zero matches), verify all external link renders use rel="noopener noreferrer", verify no API keys or sensitive values in src/ or .env files
- [X] T082 Run npm run build and verify: dist/ directory created, no build errors, bundle analysis (vite-bundle-visualizer optional) confirms CartDrawer and ProductDetailModal are separate chunks (lazy loading confirmed), no secrets in built output
- [X] T083 Validate quickstart.md steps 1–10 against actual project state: confirm scaffold command matches, npm scripts match package.json, tailwind.config.js matches tokens spec, jest.config.js matches actual config, src bootstrapping order is accurate
- [X] T084 Update developer-log.md with implementation session entry covering tasks completed, any human corrections applied, and edge cases encountered during implementation
- [X] T086 [P] Write e2e/browse-catalogue.spec.js Playwright E2E: navigate to http://localhost:5173, assert skeleton cards visible, wait for product cards to appear (max 5s), assert at least 1 product card renders with title/price text; assert page has no horizontal overflow at 375px (mobile), 768px (tablet), and 1280px (desktop) — all 3 canonical viewports per Constitution III; for each viewport: `page.setViewportSize({ width, height: 900 })` then assert `document.documentElement.scrollWidth <= document.documentElement.clientWidth`
- [X] T087 [P] Write e2e/add-to-cart.spec.js Playwright E2E: navigate to http://localhost:5173, wait for product cards, set first product quantity to 2, click Add to Cart, assert cart badge shows "2", click second product Add to Cart (default qty 1), assert badge shows "3", click cart icon, assert drawer slides in with 2 line items, assert order total is correct
- [X] T088 Create .github/workflows/ci.yml: trigger on push/PR to main; jobs: (1) lint — runs `npm run lint`; (2) test — runs `npm run test:coverage`, fails if any per-layer threshold missed; (3) build — runs `npm run build`; (4) audit — runs `npm audit --audit-level=high`; (5) e2e — starts `npm run preview &` then runs `npx playwright test`; (6) lighthouse — installs `@lhci/cli`, runs `npm run build && npm run preview &` then `lhci autorun` with assertions: `categories.performance >= 0.9`, `categories.accessibility >= 1.0`, `categories.best-practices >= 0.9` (Constitution VI: Lighthouse score ≥ 90 in CI); all 6 jobs must pass before merge is permitted

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup (Phase 1) completion — BLOCKS all user stories
- **User Stories (Phase 3–7)**: All depend on Foundational (Phase 2) completion
  - Stories proceed in priority order (P1 → P2 → P3 → P4 → P5)
  - US2 depends on US1 (CategoryTabs plugs into App.jsx built in US1)
  - US3 depends on US1 (ProductDetailModal triggered by ProductCard click)
  - US4 depends on US1 (extends ProductCard), US3 (QuantitySelector atom reused)
  - US5 depends on US4 (cart items must exist)
- **Polish (Phase 8)**: Depends on all user stories complete

### User Story Dependencies

- **US1 (P1)**: Can start after Foundational — no dependencies on other stories ✅
- **US2 (P2)**: Requires US1 ProductGrid + App.jsx shell ← starts filtering already-loaded data
- **US3 (P3)**: Requires US1 ProductCard (click handler added) + US2 filter state preserved on modal close
- **US4 (P4)**: Requires US1 ProductCard (add-to-cart added) + US3 QuantitySelector atom
- **US5 (P5)**: Requires US4 (cart must contain items to manage), cartSlice (Phase 2), CartDrawer (new)

### Within Each User Story

- **TDD order MANDATORY (Constitution V)**: Test file written + run to confirm FAIL → implement → run to confirm PASS
- Components: atoms before molecules before organisms (import dependency order)
- Foundational slices/selectors before UI that reads from them
- `App.jsx` wiring tasks always last in each user story phase

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel (different files, no dependencies)
- T017+T018 (write util tests) and T019+T020 (implement utils) are fully parallel pairs
- T021+T022 (productSchema test+impl) parallel with T025+T026 (cartSlice test+impl)
- Within US1: all test-writing tasks T033–T040 can run in parallel
- Within US1: all atom implementation tasks T041–T045 can run in parallel
- Within US2: T051+T052 (tests) and T053+T054 (implementations) are parallel pairs
- Within US3: T057+T058 can run in parallel
- Within US4: T063+T064+T065 tests can run in parallel
- Within US5: T070+T071 tests can run in parallel

---

## Parallel Execution Examples

### Parallel Example: Phase 2 Foundational Utils

```bash
# Launch in parallel (different files, no deps):
Task: "Write src/utils/currency.test.js"          # T017
Task: "Write src/utils/validation.test.js"        # T018

# Then in parallel:
Task: "Implement src/utils/currency.js"           # T019
Task: "Implement src/utils/validation.js"         # T020
```

### Parallel Example: User Story 1 Atoms

```bash
# Launch all atom tests in parallel:
Task: "Write src/components/ui/Spinner/Spinner.test.jsx"           # T033
Task: "Write src/components/ui/Badge/Badge.test.jsx"               # T034
Task: "Write src/components/ui/StarRating/StarRating.test.jsx"     # T035
Task: "Write src/components/ui/Button/Button.test.jsx"             # T036
Task: "Write src/components/ProductSkeleton/ProductSkeleton.test.jsx" # T037

# Then launch all atom implementations in parallel:
Task: "Implement src/components/ui/Spinner/Spinner.jsx"            # T041
Task: "Implement src/components/ui/Badge/Badge.jsx"                # T042
Task: "Implement src/components/ui/StarRating/StarRating.jsx"      # T043
Task: "Implement src/components/ui/Button/Button.jsx"              # T044
Task: "Implement src/components/ProductSkeleton/ProductSkeleton.jsx" # T045
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001–T015)
2. Complete Phase 2: Foundational (T016–T032) — CRITICAL, blocks all stories
3. Complete Phase 3: User Story 1 (T033–T050)
4. **STOP and VALIDATE**: `npm run dev` → products load at localhost:5173; `npm test` → all passing
5. Deploy MVP: `vercel` → shareable product catalogue

### Incremental Delivery

1. **Phase 1+2** → Foundation ready
2. **+ Phase 3 (US1)** → MVP: browsable product catalogue ← deploy/demo
3. **+ Phase 4 (US2)** → Filter + sort added ← deploy/demo
4. **+ Phase 5 (US3)** → Product detail modal ← deploy/demo
5. **+ Phase 6 (US4)** → Add to cart from listing ← deploy/demo
6. **+ Phase 7 (US5)** → Full cart management + persistence ← deploy/demo
7. **+ Phase 8** → Production-hardened SPA

### Validation Checkpoints

After each user story phase, validate independently:

| After | Validate |
|-------|----------|
| US1 | `npm run dev` → product grid loads, skeleton → cards, error state works |
| US2 | Click category tab → grid filters; change sort → reorders; "Clear Filters" resets |
| US3 | Click product card → modal opens with full info; QuantitySelector 1–50; close restores filters |
| US4 | Add qty 4 from card → badge shows 4; add qty 2 more → badge shows 6 |
| US5 | Open drawer → items with subtotals; adjust qty → total updates; refresh → cart preserved |

---

## Notes

- `[P]` tasks operate on different files and have no incomplete task dependencies — safe to parallelize
- `[USn]` label maps each task to a specific user story for independent traceability
- TDD is NON-NEGOTIABLE (Constitution Principle V): always run the test file before implementation and confirm FAIL
- All atoms must pass `jest-axe toHaveNoViolations` — accessibility is a gate, not an afterthought
- `formatPrice()` from `src/utils/currency.js` is the ONLY way to display prices — never template literals
- Cart state in sessionStorage — clears on browser close, survives refresh
- `React.lazy` for CartDrawer + ProductDetailModal — never eager-import these (FR-037)
- Commit after each checkpoint or logical task group
- Stop at any checkpoint to demo/deploy the completed user story increment
