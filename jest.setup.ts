// Polyfill for fetch API and other web standards if running in a Node.js environment without them.
// This is crucial for MSW to work correctly in Jest.
import 'whatwg-fetch'; // For fetch, Request, Response, Headers globals
// Ensure TextEncoder and TextDecoder are available, needed by some polyfills/libraries
import { TextEncoder, TextDecoder } from 'util';
if (typeof globalThis.TextEncoder === 'undefined') {
  globalThis.TextEncoder = TextEncoder;
}
if (typeof globalThis.TextDecoder === 'undefined') {
  globalThis.TextDecoder = TextDecoder;
}

// Polyfill for `web-streams-polyfill` if needed for ReadableStream, WritableStream etc.
// This might be required by newer versions of `node-fetch` or `msw` internals.
import 'web-streams-polyfill/polyfill';

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


// Mock BroadcastChannel for MSW in JSDOM environment
// This is often needed because JSDOM does not fully implement BroadcastChannel
// which MSW uses for coordination between mocked requests.

class MockBroadcastChannel {
  constructor(name: string) {}
  postMessage(message: any) {}
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
  ) {}
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions,
  ) {}
  dispatchEvent(event: Event): boolean {
    return true;
  }
  close() {}
}

// Declare BroadcastChannel globally if it's not already defined
if (typeof globalThis.BroadcastChannel === 'undefined') {
  globalThis.BroadcastChannel = MockBroadcastChannel as any;
}

// All polyfills previously here have been moved to jest.config.js for earlier loading
// or are no longer needed due to polyfills provided by web-streams-polyfill.
