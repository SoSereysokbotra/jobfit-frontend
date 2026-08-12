/**
 * JobFits service worker (Serwist).
 *
 * Caching mirrors the `Cache-Control` / ETag policy the backend already sends
 * (PWA_SYNC_API.md §5) rather than inventing a parallel one. Where the backend
 * advertises `stale-while-revalidate`, so do we.
 *
 * Deliberately NOT handled here: falling back to IndexedDB when a `/sync/*`
 * call fails. The SW answers with the network result (or lets it fail) and the
 * sync engine decides what to do — a worker that silently synthesised a
 * response would hide "we are offline" from the code that needs to know it.
 */
import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, RuntimeCaching, SerwistGlobalConfig } from "serwist";
import {
  CacheFirst,
  ExpirationPlugin,
  NetworkOnly,
  Serwist,
  StaleWhileRevalidate,
} from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope & { __SW_MANIFEST: (PrecacheEntry | string)[] | undefined };

/** Inlined at build time; same value the api client uses. */
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";
const apiOrigin = API_BASE ? new URL(API_BASE).origin : self.location.origin;

/** Path within the API, ignoring the `/api/v1` prefix baked into API_BASE. */
function apiPath(url: URL): string | null {
  if (url.origin !== apiOrigin) return null;
  const prefix = API_BASE ? new URL(API_BASE).pathname.replace(/\/$/, "") : "";
  return url.pathname.startsWith(prefix) ? url.pathname.slice(prefix.length) : null;
}

const OFFLINE_URL = "/offline";

const runtimeCaching: RuntimeCaching[] = [
  /* ── /sync/* — network-only. ───────────────────────────────────────────
     A cached delta is worse than no delta: replaying yesterday's `upserts`
     against today's watermark silently skips everything in between. The sync
     engine falls back to IndexedDB when this rejects. */
  {
    matcher: ({ url }) => apiPath(url)?.startsWith("/sync/") ?? false,
    handler: new NetworkOnly(),
  },

  /* ── ETag-backed GETs — stale-while-revalidate. ────────────────────────
     Exactly the four routes that carry ETag + Cache-Control (§5). Serwist
     revalidates in the background; the conditional GET usually 304s, so the
     refresh costs headers rather than a payload. */
  {
    matcher: ({ url, request, sameOrigin: _sameOrigin }) => {
      if (request.method !== "GET") return false;
      const path = apiPath(url);
      if (!path) return false;
      return (
        /^\/jobs\/[^/]+$/.test(path) ||
        /^\/skills\/[^/]+\/learning-resources$/.test(path) ||
        /^\/profiles\/[^/]+\/(experience|education)$/.test(path)
      );
    },
    handler: new StaleWhileRevalidate({
      cacheName: "jobfits-api-swr",
      plugins: [
        // `Vary: Authorization` is on these responses, so the Cache API already
        // keys them per token — no risk of serving one user's copy to another.
        new ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: 24 * 60 * 60 }),
      ],
    }),
  },

  /* ── Everything else on the API — never cached. ────────────────────────
     Mutations and un-ETagged reads (notably `GET /jobs` search, deliberately
     uncached server-side) must not be served from a cache. */
  {
    matcher: ({ url }) => apiPath(url) !== null,
    handler: new NetworkOnly(),
  },

  /* ── Static build output + fonts — cache-first. ────────────────────────
     Content-hashed by Next, so a cached hit is always correct. */
  {
    matcher: ({ url, sameOrigin }) =>
      sameOrigin && (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/logo/")),
    handler: new CacheFirst({
      cacheName: "jobfits-static",
      plugins: [new ExpirationPlugin({ maxEntries: 300, maxAgeSeconds: 365 * 24 * 60 * 60 })],
    }),
  },
  {
    matcher: ({ request }) => request.destination === "font",
    handler: new CacheFirst({
      cacheName: "jobfits-fonts",
      plugins: [new ExpirationPlugin({ maxEntries: 30, maxAgeSeconds: 365 * 24 * 60 * 60 })],
    }),
  },

  // Next-aware defaults (RSC payloads, images, pages) for everything else.
  ...defaultCache,
];

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching,
  fallbacks: {
    entries: [
      {
        url: OFFLINE_URL,
        matcher: ({ request }) => request.destination === "document",
      },
    ],
  },
});

serwist.addEventListeners();
