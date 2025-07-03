import 'whatwg-fetch';
import 'web-streams-polyfill';
import '@testing-library/jest-dom';

// Used for @testing-library/jest-dom extensions
import { TextEncoder, TextDecoder } from 'util';

// Mock TransformStream for MSW in JSDOM environment
// A minimal mock, actual implementation provided by web-streams-polyfill if it applies
class MockTransformStream {
    constructor() {
        this.readable = new ReadableStream();
        this.writable = new WritableStream();
    }
}

// Mock BroadcastChannel for MSW in JSDOM environment
class MockBroadcastChannel {
    constructor(name) {
        this.name = name;
        this.onmessage = null;
    }

    postMessage(message) {
        // Mock implementation for posting messages
    }

    close() {
        // Mock implementation for closing
    }

    addEventListener(type, listener) {
        // Mock implementation
    }

    removeEventListener(type, listener) {
        // Mock implementation
    }

    dispatchEvent(event) {
        // Mock implementation
        return true;
    }
}

// Ensure BroadcastChannel is globally available in JSDOM, using the mock.
// This assignment should happen early and unconditionally to prevent timing issues with libraries like MSW.
global.BroadcastChannel = MockBroadcastChannel;
if (typeof global.window !== 'undefined') {
  global.window.BroadcastChannel = global.BroadcastChannel;
}

// Ensure ReadableStream and WritableStream are also globally available for JSDOM
// These are typically present in browser environments but might be missing in older JSDOM versions or specific Node.js setups
// If not globally available, we provide a basic mock. The actual Web Streams API is complex,
// but a simple mock might satisfy initial checks by libraries like MSW.
if (typeof ReadableStream === 'undefined') {
  global.ReadableStream = class MockReadableStream {};
}
if (typeof WritableStream === 'undefined') {
  global.WritableStream = class MockWritableStream {};
}

// Removed: Conditional global assignments for fetch, Request, Response, Headers, URL
// as whatwg-fetch and web-streams-polyfill now handle these
// and MSW is expected to intercept the polyfilled fetch.

Object.assign(global.window, {
    TextEncoder,
    TextDecoder,
    TransformStream: typeof TransformStream !== 'undefined' ? TransformStream : MockTransformStream,
    ReadableStream: typeof ReadableStream !== 'undefined' ? ReadableStream : MockReadableStream,
    WritableStream: typeof WritableStream !== 'undefined' ? WritableStream : MockWritableStream,
    // Removed explicit assignments for fetch, Request, Response, Headers, URL
    // as whatwg-fetch and MSW should manage these.
});

Object.assign(global, {
    TextEncoder,
    TextDecoder,
    TransformStream: typeof TransformStream !== 'undefined' ? TransformStream : MockTransformStream,
    ReadableStream: typeof ReadableStream !== 'undefined' ? ReadableStream : MockReadableStream,
    WritableStream: typeof WritableStream !== 'undefined' ? WritableStream : MockWritableStream,
});
