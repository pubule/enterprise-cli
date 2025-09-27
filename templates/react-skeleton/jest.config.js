{{#hasTypeScript}}/** @type {import('jest').Config} */{{/hasTypeScript}}
const config = {
  // Test environment
  testEnvironment: 'jsdom',

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.{{#hasTypeScript}}ts{{/hasTypeScript}}{{^hasTypeScript}}js{{/hasTypeScript}}'],

  // Module paths
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@pages/(.*)$': '<rootDir>/src/pages/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@contexts/(.*)$': '<rootDir>/src/contexts/$1',
    '^@store/(.*)$': '<rootDir>/src/store/$1',
    '^@assets/(.*)$': '<rootDir>/src/assets/$1',

    // Handle CSS modules
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',

    // Handle static assets
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/src/__mocks__/fileMock.js',
  },

  // Transform files
  transform: {
    {{#hasTypeScript}}
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
    }],
    {{/hasTypeScript}}
    '^.+\\.(js|jsx)$': ['babel-jest', {
      presets: [
        ['@babel/preset-env', { targets: { node: 'current' } }],
        ['@babel/preset-react', { runtime: 'automatic' }],
        {{#hasTypeScript}}'@babel/preset-typescript',{{/hasTypeScript}}
      ],
      plugins: [
        '@babel/plugin-transform-runtime',
      ],
    }],
  },

  // File extensions to consider
  moduleFileExtensions: [
    'js',
    'jsx',
    {{#hasTypeScript}}'ts',
    'tsx',{{/hasTypeScript}}
    'json',
    'node',
  ],

  // Test file patterns
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx{{#hasTypeScript}},ts,tsx{{/hasTypeScript}}}',
    '<rootDir>/src/**/*.(test|spec).{js,jsx{{#hasTypeScript}},ts,tsx{{/hasTypeScript}}}',
  ],

  // Files to ignore
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/build/',
    '<rootDir>/dist/',
  ],

  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.{js,jsx{{#hasTypeScript}},ts,tsx{{/hasTypeScript}}}',
    '!src/**/*.d.ts',
    '!src/index.{{#hasTypeScript}}tsx{{/hasTypeScript}}{{^hasTypeScript}}jsx{{/hasTypeScript}}',
    '!src/serviceWorker.{{#hasTypeScript}}ts{{/hasTypeScript}}{{^hasTypeScript}}js{{/hasTypeScript}}',
    '!src/reportWebVitals.{{#hasTypeScript}}ts{{/hasTypeScript}}{{^hasTypeScript}}js{{/hasTypeScript}}',
    '!src/**/*.stories.{js,jsx{{#hasTypeScript}},ts,tsx{{/hasTypeScript}}}',
    '!src/**/*.config.{js,{{#hasTypeScript}}ts{{/hasTypeScript}}}',
    '!src/**/__mocks__/**',
    '!src/**/__tests__/**',
    '!src/**/types.{{#hasTypeScript}}ts{{/hasTypeScript}}{{^hasTypeScript}}js{{/hasTypeScript}}',
  ],

  coverageDirectory: 'coverage',

  coverageReporters: [
    'text',
    'lcov',
    'html',
    'json-summary',
  ],

  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },

  // Globals
  globals: {
    {{#hasTypeScript}}
    'ts-jest': {
      tsconfig: 'tsconfig.json',
    },
    {{/hasTypeScript}}
  },

  // Clear mocks between tests
  clearMocks: true,

  // Restore mocks after each test
  restoreMocks: true,

  // Reset modules before each test
  resetModules: true,

  // Verbose output
  verbose: true,

  // Timeout for tests
  testTimeout: 10000,

  // Maximum number of concurrent workers
  maxWorkers: '50%',

  // Error handling
  errorOnDeprecated: true,

  // Watch plugins
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],

  // Reporters
  reporters: [
    'default',
    [
      'jest-html-reporters',
      {
        publicPath: './coverage/html-report',
        filename: 'report.html',
        expand: true,
      },
    ],
    [
      'jest-junit',
      {
        outputDirectory: './coverage',
        outputName: 'junit.xml',
      },
    ],
  ],

  // Snapshot serializers
  snapshotSerializers: [
    '@emotion/jest/serializer',
  ],

  // Custom test environment options
  testEnvironmentOptions: {
    url: 'http://localhost:3000',
  },

  // Mock specific modules globally
  moduleNameMapping: {
    ...config.moduleNameMapping,

    // Mock external dependencies that don't work well in tests
    '^uuid$': '<rootDir>/src/__mocks__/uuid.js',
    '^axios$': '<rootDir>/src/__mocks__/axios.js',
  },
};

module.exports = config;