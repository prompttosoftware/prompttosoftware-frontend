// Polyfill Global Objects for Jest JSDOM Environment
// These polyfills are loaded via `setupFiles` in jest.config.js
// to ensure they are available before any test files or other setup env files.

// Polyfill for fetch API and other web standards (Request, Response, Headers globals)
// This is crucial for MSW to work correctly in Jest.
import 'whatwg-fetch';

// Polyfill TextEncoder and TextDecoder
// Required by environments like JSDOM where these are not natively available,
// but expected by libraries like MSW and its interceptors.
import { TextEncoder, TextDecoder } from 'util';
if (typeof global !== 'undefined') {
  if (typeof global.TextEncoder === 'undefined') {
    global.TextEncoder = TextEncoder;
  }
  if (typeof global.TextDecoder === 'undefined') {
    global.TextDecoder = TextDecoder as any; // Cast for potential type mismatch with web standard TextDecoder
  }
}

// Polyfill for `web-streams-polyfill` for ReadableStream, WritableStream etc.
// This might be required by newer versions of `node-fetch` or `msw` internals.
import 'web-streams-polyfill/polyfill';



// Mock BroadcastChannel for MSW in JSDOM environment
// This is often needed because JSDOM does not fully implement BroadcastChannel
// which MSW uses for coordination between mocked requests.
// See https://github.com/microsoft/playwright/issues/21438#issuecomment-1432263156
// See https://github.com/jsdom/jsdom/issues/3002
class BroadcastChannel {
  name: string; // Declare the name property
  listeners: any[]; // Declare listeners property
  onmessage: ((this: BroadcastChannel, ev: MessageEvent) => any) | null = null;
  onmessageerror: ((this: BroadcastChannel, ev: MessageEvent) => any) | null = null;

  constructor(name: string) {
    this.name = name;
    this.listeners = [];
  }

  postMessage(message: any) {
    this.listeners.forEach((listener) => listener.call(this, { data: message }));
  }

  addEventListener(event: any, listener: any) {
    if (event === 'message') {
      this.listeners.push(listener);
    }
  }

  removeEventListener(event: any, listener: any) {
    if (event === 'message') {
      this.listeners = this.listeners.filter((l) => l !== listener);
    }
  }

  close() {
    this.listeners = [];
  }

  dispatchEvent(event: Event): boolean {
    // A simple mock for dispatchEvent, might need to be more sophisticated
    // depending on test requirements.
    if (this.onmessage && event.type === 'message') {
      this.onmessage(event as MessageEvent);
    }
    if (this.onmessageerror && event.type === 'messageerror') {
      this.onmessageerror(event as MessageEvent);
    }
    return true;
  }
}

// Not available globally in JSDOM
if (typeof globalThis.BroadcastChannel === 'undefined') {
  globalThis.BroadcastChannel = BroadcastChannel as any;
}
