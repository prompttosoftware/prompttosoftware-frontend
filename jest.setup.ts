// All polyfills previously here have been moved to jest.config.js for earlier loading
// or are no longer needed due to polyfills provided by web-streams-polyfill.

import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';

configure({
  throwSuggestions: true,
});



// For properties that might be read-only on the prototype,
// explicitly make them writable and configurable.
Object.defineProperty(Location.prototype, 'assign', { writable: true, configurable: true, value: jest.fn() });
Object.defineProperty(Location.prototype, 'replace', { writable: true, configurable: true, value: jest.fn() });
Object.defineProperty(Location.prototype, 'reload', { writable: true, configurable: true, value: jest.fn() });
Object.defineProperty(Location.prototype, 'href', { writable: true, configurable: true, value: '' });
Object.defineProperty(Location.prototype, 'pathname', { writable: true, configurable: true, value: '' });
Object.defineProperty(Location.prototype, 'search', { writable: true, configurable: true, value: '' });




// All polyfills previously here have been moved to jest.config.js for earlier loading
// or are no longer needed due to polyfills provided by web-streams-polyfill.

import { setupServer } from 'msw/node';
import { handlers } from './src/mocks/handlers';

// Set up the MSW server globally
export const server = setupServer(...handlers);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' })); // Report unhandled requests as errors
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
