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
    global: {
      statements: 85,
      branches: 80,
      functions: 90,
    },
    './src/hooks/**': {
      statements: 90,
      branches: 85,
      functions: 95,
    },
    './src/features/**': {
      statements: 90,
      branches: 85,
      functions: 95,
    },
    './src/utils/**': {
      statements: 95,
      branches: 90,
      functions: 100,
    },
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
