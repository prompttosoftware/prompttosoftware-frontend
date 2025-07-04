const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const { TextEncoder, TextDecoder } = require('util');
const { ReadableStream, WritableStream, TransformStream } = require('web-streams-polyfill');

const customJestConfig = {
  globals: {
    TextEncoder: TextEncoder,
    TextDecoder: TextDecoder,
    ReadableStream: ReadableStream,
    WritableStream: WritableStream,
    TransformStream: TransformStream,
  },
  testMatch: ['<rootDir>/src/**/?(*.)+(spec|test).[jt]s?(x)'],
  setupFiles: ['<rootDir>/jest.setup.js'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'], // This might be redundant if setupFiles is enough
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@xenova/transformers$': '<rootDir>/__mocks__/@xenova/transformers.js',
  },
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest', // Use ts-jest for TypeScript files
    '^.+\\.(js|jsx)$': ['babel-jest', { presets: ['next/babel'] }], // Use babel-jest for JS/JSX
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(?:@xenova/transformers)/)',
    '^.+\\.module\\.(css|sass|scss)$',
  ],
};

module.exports = createJestConfig(customJestConfig);
