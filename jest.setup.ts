import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';

configure({
  throwSuggestions: true,
});

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
