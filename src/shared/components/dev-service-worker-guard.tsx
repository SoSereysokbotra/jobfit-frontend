"use client";

import { useEffect } from "react";

/**
 * Unregisters leftover service workers in development.
 *
 * `next.config.ts` sets `disable: NODE_ENV === "development"`, which stops Serwist
 * from *building and registering* a SW in dev — but it cannot unregister one that
 * is already installed in the browser. Anyone who has run `npm run build && npm run
 * start` on localhost still has that SW bound to the origin, and it keeps serving
 * precached chunks from Cache Storage on every subsequent `npm run dev`.
 *
 * That failure mode is nasty because it defeats every normal remedy: Cache Storage
 * is consulted before the network, so `Cache-Control: no-store` is irrelevant,
 * reloads and `.next` wipes change nothing, and the browser hydrates a stale bundle
 * against fresh server HTML — which React reports as a hydration mismatch and which
 * reads as "my change didn't apply".
 *
 * Rendering this in the root layout makes dev self-healing: one load and the stale
 * worker and its caches are gone for good. It compiles to a no-op in production,
 * where the real service worker must stay registered.
 */
export function DevServiceWorkerGuard() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;

    let removedSomething = false;

    void navigator.serviceWorker
      .getRegistrations()
      .then(async (registrations) => {
        for (const registration of registrations) {
          await registration.unregister();
          removedSomething = true;
        }

        // The registration is only half of it — the precached responses live in
        // Cache Storage and outlive the worker that created them.
        if (typeof caches !== "undefined") {
          for (const key of await caches.keys()) {
            await caches.delete(key);
            removedSomething = true;
          }
        }

        if (removedSomething) {
          console.warn(
            "[dev] Removed a stale service worker and its caches. " +
              "Reloading once so this page runs the current bundle.",
          );
          window.location.reload();
        }
      })
      .catch(() => {
        /* Nothing actionable in dev if the SW API rejects — leave the page alone. */
      });
  }, []);

  return null;
}
