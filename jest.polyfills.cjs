/**
 * Polyfills for MSW v2 in Jest + jsdom environment.
 * MSW v2 requires Web Fetch API globals and Web Streams API.
 * Must set TextEncoder/TextDecoder BEFORE requiring undici.
 */
const { TextDecoder, TextEncoder } = require('node:util');
const { ReadableStream, WritableStream, TransformStream } = require('node:stream/web');

// Set encoding and stream globals FIRST (undici depends on them being available globally)
Object.assign(globalThis, {
  TextDecoder,
  TextEncoder,
  ReadableStream,
  WritableStream,
  TransformStream,
});

// BroadcastChannel (needed by MSW ws.ts)
if (!globalThis.BroadcastChannel) {
  globalThis.BroadcastChannel = class BroadcastChannel {
    constructor() {}
    postMessage() {}
    close() {}
    addEventListener() {}
    removeEventListener() {}
    dispatchEvent() { return true; }
  };
}

// Now require undici (it will find TextEncoder/TextDecoder in globalThis)
const { fetch, Headers, FormData, Request, Response } = require('undici');

Object.assign(globalThis, {
  fetch,
  Headers,
  FormData,
  Request,
  Response,
});
