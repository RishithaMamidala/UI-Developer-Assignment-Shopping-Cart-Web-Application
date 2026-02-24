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
