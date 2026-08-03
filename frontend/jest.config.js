/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  testMatch: ['**/*.test.{ts,tsx}'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.test.{ts,tsx}',
  ],
  transform: {
    // .js is included so the ESM-only d3 v7 packages are compiled to CJS in tests.
    '^.+\\.(ts|tsx|js)$': ['ts-jest', {
      tsconfig: { jsx: 'react-jsx', esModuleInterop: true, module: 'commonjs', moduleResolution: 'node', target: 'es2020', strict: true, allowJs: true, paths: { '@/*': ['./src/*'] }, baseUrl: '.' },
      useESM: false,
    }],
  },
  transformIgnorePatterns: [
    // ESM-only d3 v7 packages plus their ESM-only transitive deps
    // (internmap, delaunator, robust-predicates — the full d3 v7 tree).
    '/node_modules/(?!(d3|d3-.*|internmap|delaunator|robust-predicates)/)',
  ],
};