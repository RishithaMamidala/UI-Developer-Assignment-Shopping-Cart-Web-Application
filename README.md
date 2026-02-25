# Kibo Store— Shopping Cart App

A single-page shopping cart application built with React. Browse a product catalogue from the [FakeStore API](https://fakestoreapi.com), filter by category, sort by price or rating, and manage a cart that persists across page refreshes within the same browser session.

Live demo: [https://ui-developer-assignment-shopping-ca.vercel.app/](https://ui-developer-assignment-shopping-ca.vercel.app/)

<p align="center">
  <img src="Images/Kibo store front.png" width="32%" alt="Store front" />
  <img src="Images/Kibo product details.png" width="32%" alt="Product details" />
  <img src="Images/Kibo cart.png" width="32%" alt="Cart" />
</p>

---

## Framework & Library Versions

| Category | Package | Version |
|---|---|---|
| **Runtime** | Node.js | ≥ 18 |
| **Framework** | React | ^19.2.4 |
| **Bundler** | Vite | ^6.4.1 |
| **Styling** | Tailwind CSS | ^3.4.19 |
| **State — Cart** | Redux Toolkit | ^2.11.2 |
| **State — Cart** | react-redux | ^9.2.0 |
| **State — Cart** | redux-persist | ^6.0.0 |
| **API Layer** | RTK Query (bundled with Redux Toolkit) | ^2.11.2 |
| **Testing** | Jest | ^30.2.0 |
| **Testing** | React Testing Library | ^16.3.2 |
| **Testing** | jest-axe | ^10.0.0 |
| **Testing** | MSW (Mock Service Worker) | ^2.12.10 |
| **E2E** | Playwright | ^1.58.2 |

---

## Project Structure

```
src/
├── app/               # Redux store & typed hooks
├── components/
│   ├── ui/            # Atoms (Button, Badge, StarRating, Spinner…)
│   │   └── *.test.jsx # Unit tests co-located with each component
│   ├── ProductCard/   # Product listing card + ProductCard.test.jsx
│   ├── CategoryTabs/  # Category filter tabs + CategoryTabs.test.jsx
│   ├── SortSelect/    # Sort dropdown + SortSelect.test.jsx
│   ├── ProductGrid/   # Product grid + ProductGrid.test.jsx
│   ├── Header/        # Site header + Header.test.jsx
│   ├── ProductDetailModal/  # Product detail (lazy) + test
│   └── CartDrawer/    # Cart drawer (lazy) + CartLineItem + tests
├── features/
│   ├── products/      # RTK Query API + slice + tests
│   └── cart/          # Cart slice + selectors + tests
├── hooks/             # useFilteredProducts + test
└── utils/             # currency, validation + tests
tests/integration/     # Cross-component integration tests
e2e/                   # Playwright end-to-end tests
```

---

## Setup & Run Instructions

### Prerequisites

- Node.js 18 or later
- npm 9 or later

### Install dependencies

```bash
npm install
```

### Start the development server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for production

```bash
npm run build
```

The output is written to `dist/`. Serve it with:

```bash
npm run preview
```

The preview server runs at [http://localhost:4173](http://localhost:4173).

### Lint & format

```bash
npm run lint        # ESLint
npm run lint:fix    # ESLint with auto-fix
npm run format      # Prettier
```

---

## Testing Instructions

### Unit & integration tests (Jest)

```bash
npm run test             # Run all tests once
npm run test:watch       # Watch mode — re-runs on file changes
npm run test:coverage    # Run tests and generate a coverage report
```

### End-to-end tests (Playwright)

First build the app and start the preview server:

```bash
npm run build
npm run preview
```

Then in a separate terminal run:

```bash
npx playwright test
```

E2E tests cover two flows:

- **Browse catalogue** — skeleton loading, product rendering, no horizontal overflow at mobile/tablet/desktop viewports
- **Add to cart** — quantity selector, cart badge increment, drawer contents, order total

---

## Live Deployment URL

Live Deployment URL [https://ui-developer-assignment-shopping-ca.vercel.app/](https://ui-developer-assignment-shopping-ca.vercel.app/)

The app is configured for Vercel out of the box via `vercel.json`:

- A rewrite rule sends all paths to `index.html` (required for the client-side router).
- Content Security Policy headers restrict network requests to `fakestoreapi.com` only.

To deploy:

```bash
npx vercel --prod
```

---

## Key Constraints

- No checkout or payment flow — the cart is for review only.
- Cart persists in `sessionStorage` only — cleared when the tab is closed.
- Max quantity per product: **50**.
- No text search — category tabs and sort order only.
