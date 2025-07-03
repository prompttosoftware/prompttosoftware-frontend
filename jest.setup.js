// Provide global Fetch API polyfills using undici for Node.js environment compatibility with MSW.
// This must happen before any modules that might rely on these globals are initialized.
import { fetch, Request, Response, Headers } from 'undici';
if (typeof global.fetch === 'undefined') {
  global.fetch = fetch;
}
if (typeof global.Request === 'undefined') {
  global.Request = Request;
}
if (typeof global.Response === 'undefined') {
  global.Response = Response;
}
if (typeof global.Headers === 'undefined') {
  global.Headers = Headers;
}
