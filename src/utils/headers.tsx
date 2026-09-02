import { createMiddleware } from "hono/factory";

const contentSecurityPolicy = (nonce: string): string =>
  [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}'`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https://avatars.githubusercontent.com https://*.githubusercontent.com",
    "connect-src 'self'",
    "manifest-src 'self'",
    "base-uri 'none'",
    "object-src 'none'",
    "form-action 'self' https://github.com",
    "frame-ancestors 'none'",
  ].join("; ");

/**
 * Sets a Content-Security-Policy for the HTML page routes. Applied per-route so it
 * does not touch the JSON API or the CDN-backed Swagger UI. A per-request nonce is
 * stashed on the context for the streaming renderer's Suspense scripts.
 * @function pageCsp
 */
export const pageCsp = createMiddleware(async (c, next) => {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  const nonce = btoa(String.fromCharCode(...bytes));
  c.set("cspNonce", nonce);
  c.header("Content-Security-Policy", contentSecurityPolicy(nonce));
  await next();
});
