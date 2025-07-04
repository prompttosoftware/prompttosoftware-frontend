// jest.setup.js

// Polyfill TextEncoder and TextDecoder
if (typeof global.TextEncoder === 'undefined') {
  const { TextEncoder } = require('util');
  global.TextEncoder = TextEncoder;
}
if (typeof global.TextDecoder === 'undefined') {
  const { TextDecoder } = require('util');
  global.TextDecoder = TextDecoder;
}

// Ensure Web Streams API are polyfilled and available globally
// specifically for MSW's needs.
// web-streams-polyfill often attaches to globalThis, but explicit assignment
// can prevent timing issues or ensure proper binding in Jest's environment.
// Explicitly get the polyfills and assign them if not already present.
// This handles cases where automatic global attachment by the polyfill
// might not happen or might be overridden in some test environments,
// ensuring Robustness for MSW's requirements.
const {
  ReadableStream,
  WritableStream,
  TransformStream
} = require('web-streams-polyfill'); // Use the main entry point to get the ponyfills directly.

if (typeof global.ReadableStream === 'undefined' && ReadableStream) {
  global.ReadableStream = ReadableStream;
}
if (typeof global.WritableStream === 'undefined' && WritableStream) {
  global.WritableStream = WritableStream;
}
if (typeof global.TransformStream === 'undefined' && TransformStream) {
  global.TransformStream = TransformStream;
}


// Polyfill Fetch API, Request, Response, and Headers using undici.
// Undici provides a spec-compliant implementation that works well with Web Streams.
const { fetch, Request, Response, Headers } = require('undici');

if (typeof global.fetch === 'undefined') { // Check if fetch is already defined (e.g., by JSDOM or other polyfills)
  global.fetch = fetch;
  global.Request = Request;
  global.Response = Response;
  global.Headers = Headers;
} else {
  // If fetch is already defined, log a warning or ensure it's compatible.
  // We prioritize Undici's Request, Response, and Headers for stream compatibility.
  if (typeof global.Request === 'undefined') global.Request = Request;
  if (typeof global.Response === 'undefined') global.Response = Response;
  if (typeof global.Headers === 'undefined') global.Headers = Headers;
}
