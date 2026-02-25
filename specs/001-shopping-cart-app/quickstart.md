# Quickstart: Modern Shopping Cart Web Application

**Feature**: `001-shopping-cart-app` | **Date**: 2026-02-23

This guide describes how to scaffold, install, run, and test the Kibo shopping cart application.

---

## Prerequisites

| Tool | Version | Check |
|------|---------|-------|
| Node.js | ≥ 18.x | `node --version` |
| npm | ≥ 9.x | `npm --version` |
| Git | Any | `git --version` |

---

## 1. Scaffold the Project

Run from the repository root (`c:/Users/rishi/Downloads/Projects/Kibo`):

```bash
npm create vite@latest . -- --template react
```

> Select: **React** → **JavaScript** (not TypeScript) when prompted.

This creates:
```
index.html
package.json
vite.config.js
src/
  App.jsx
  main.jsx
  ...
```

---

## 2. Install Dependencies

```bash
# Core
npm install react react-dom

# Redux + state management
npm install @reduxjs/toolkit react-redux redux-persist

# Styling
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Testing (unit + integration)
npm install -D jest @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-axe jest-environment-jsdom babel-jest @babel/core @babel/preset-env @babel/preset-react msw

# E2E testing
npm install -D @playwright/test
npx playwright install --with-deps chromium
```

---

## 3. Configure Tailwind CSS

**`tailwind.config.js`** — design tokens:
```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary:   { DEFAULT: '#2563eb', hover: '#1d4ed8' },
        surface:   { DEFAULT: '#ffffff', muted: '#f9fafb' },
        border:    '#e5e7eb',
        text:      { DEFAULT: '#111827', muted: '#6b7280' },
        error:     '#ef4444',
        success:   '#22c55e',
        warning:   '#f59e0b',
        'out-of-stock': '#9ca3af',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '0.75rem',
        btn:  '0.5rem',
      },
    },
  },
  plugins: [],
};
```

Add to **`src/index.css`**:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

## 4. Configure Jest

> **Note**: All Jest/Babel config files use `.cjs` extension because `"type": "module"` in `package.json` makes `.js` files ESM, but Jest requires CJS config loaders.

**`jest.config.cjs`**:
```js
module.exports = {
  testEnvironment: 'jsdom',
  testEnvironmentOptions: {
    customExportConditions: ['node', 'require', 'default'],
  },
  setupFiles: ['<rootDir>/jest.polyfills.cjs'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.cjs'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|svg|ico|webp)$': '<rootDir>/__mocks__/fileMock.cjs',
  },
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(msw|@mswjs|until-async|outvariant|strict-event-emitter|is-node-process|@open-draft)/)',
  ],
  coverageThreshold: {
    global: { statements: 85, branches: 80, functions: 90 },
    './src/hooks/**': { statements: 90, branches: 85, functions: 95 },
    './src/features/**': { statements: 90, branches: 85, functions: 95 },
    './src/utils/**': { statements: 95, branches: 90, functions: 100 },
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/main.jsx',
    '!src/app/store.js',
    '!src/constants/index.js',
  ],
  testMatch: [
    '<rootDir>/src/**/*.test.{js,jsx}',
    '<rootDir>/tests/**/*.test.{js,jsx}',
  ],
};
```

**`jest.setup.cjs`**:
```js
require('@testing-library/jest-dom');
const { configureAxe } = require('jest-axe');
const { server } = require('./tests/msw-setup.cjs');

// Configure axe with color-contrast rule enabled (WCAG 2.1 AA)
global.axe = configureAxe({
  rules: {
    'color-contrast': { enabled: true },
  },
});

// MSW shared server lifecycle
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

**`babel.config.cjs`**:
```js
module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    ['@babel/preset-react', { runtime: 'automatic' }],
  ],
};
```

---

## 5. Configure `jsconfig.json`

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    },
    "checkJs": false,
    "jsx": "react-jsx"
  },
  "include": ["src"]
}
```

---

## 6. Configure Vercel

**`vercel.json`** (at repo root):
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

This ensures direct URL access and browser refreshes work correctly for the SPA.

---

## 7. `package.json` Scripts

```json
{
  "scripts": {
    "dev":      "vite",
    "build":    "vite build",
    "preview":  "vite preview",
    "test":     "jest",
    "test:watch":    "jest --watch",
    "test:coverage": "jest --coverage",
    "lint":     "eslint src --ext .js,.jsx",
    "lint:fix": "eslint src --ext .js,.jsx --fix",
    "format":   "prettier --write \"src/**/*.{js,jsx,css}\""
  }
}
```

---

## 8. Source Bootstrapping Order

Implement files in this dependency order to avoid import errors:

1. `src/constants/index.js` — constants (no imports)
2. `src/utils/currency.js` — pure utility (no imports)
3. `src/utils/validation.js` — pure utility (imports constants)
4. `src/features/products/productsApi.js` — RTK Query API (plain JS filter in transformResponse)
6. `src/features/products/productsSlice.js` — UI state slice
7. `src/features/cart/cartSlice.js` — cart state slice (imports constants)
8. `src/features/cart/cartSelectors.js` — selectors (imports slice)
9. `src/app/store.js` — Redux store (imports all slices + api)
10. `src/app/hooks.js` — typed hooks (imports store)
11. `src/hooks/useFilteredProducts.js` — custom hook (imports hooks + selectors)
12. UI components (atoms → molecules → organisms)
13. `src/App.jsx` — layout shell (imports organisms)
14. `src/main.jsx` — entry point (imports store + App)

---

## 9. Run the App

```bash
# Development server (hot reload)
npm run dev
# → http://localhost:5173

# Production build
npm run build
# → dist/

# Preview production build locally
npm run preview
```

---

## 10. Run Tests

```bash
# Run all tests
npm test

# Watch mode (TDD)
npm run test:watch

# Coverage report
npm run test:coverage
# → coverage/ directory + console table
```

### Coverage Thresholds

| Layer | Files | Statement | Branch | Function |
|-------|-------|-----------|--------|----------|
| Components | `src/components/**` | 85% | 80% | 90% |
| Hooks / Services | `src/hooks/**`, `src/features/**` | 90% | 85% | 95% |
| Utilities | `src/utils/**` | 95% | 90% | 100% |

---

## 11. Deploy to Vercel

```bash
# Install Vercel CLI (once)
npm install -g vercel

# Deploy (first time — follow prompts)
vercel

# Deploy to production
vercel --prod
```

**Environment Variables**: None required — FakeStore API is public and needs no credentials.

---

## 12. Key File Reference

| File | Purpose |
|------|---------|
| [plan.md](./plan.md) | Implementation plan (this feature) |
| [data-model.md](./data-model.md) | Entity shapes, state |
| [contracts/api.md](./contracts/api.md) | FakeStore API + RTK Query contracts |
| [contracts/redux-store.md](./contracts/redux-store.md) | Redux store shape + slice actions |
| [contracts/component-interfaces.md](./contracts/component-interfaces.md) | Component prop contracts |
| [../../.specify/memory/constitution.md](../../.specify/memory/constitution.md) | Project governance constitution |
| [../../developer-log.md](../../developer-log.md) | AI session audit trail |
