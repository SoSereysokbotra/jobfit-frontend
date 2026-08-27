/**
 * Silent-refresh behaviour of the api client.
 *
 * These pin the four rules the session depends on, each of which was a real defect:
 *   1. concurrent 401s share ONE refresh (parallel rotations of a single-use cookie are
 *      read by the backend as token theft, which revokes every session),
 *   2. a transient failure (offline, 5xx, throttled) never logs the user out,
 *   3. a 409 rotation race is retried rather than treated as a dead session,
 *   4. only a definitive 401/403 from the refresh endpoint ends the session.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  ApiError,
  apiClient,
  refreshSession,
  registerAuthBridge,
  resetRefreshLatch,
} from "./client";

/** One entry per fetch call the client made, in order. */
type Call = { url: string; init?: RequestInit };

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

/** The backend's success envelope (TransformInterceptor). */
const enveloped = (data: unknown, status = 200) =>
  json({ success: true, statusCode: status, timestamp: "", data }, status);

const errorBody = (statusCode: number, code: string) =>
  json({ statusCode, code, message: code, path: "/x" }, statusCode);

const authHeader = (init?: RequestInit): string | undefined =>
  (init?.headers as Record<string, string> | undefined)?.Authorization;

describe("api client — silent refresh", () => {
  let calls: Call[];
  let token: string | null;
  let authFailures: number;

  /** Install a bridge that behaves like AuthProvider's (ref-backed, synchronous). */
  const installBridge = () => {
    token = "access-1";
    authFailures = 0;
    registerAuthBridge({
      getAccessToken: () => token,
      setAccessToken: (next) => {
        if (next) resetRefreshLatch();
        token = next;
      },
      onAuthFailure: () => {
        authFailures += 1;
      },
    });
  };

  const mockFetch = (
    handler: (url: string, init?: RequestInit) => Response | Promise<Response>,
  ) => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);
        calls.push({ url, init });
        return handler(url, init);
      }),
    );
  };

  const isRefresh = (url: string) => url.includes("/auth/refresh-token");
  const refreshCalls = () => calls.filter((c) => isRefresh(c.url)).length;

  beforeEach(() => {
    calls = [];
    resetRefreshLatch();
    installBridge();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("refreshes once for many simultaneous 401s, and every request then succeeds", async () => {
    mockFetch((url, init) => {
      if (isRefresh(url)) return enveloped({ accessToken: "access-2" });
      // The expired token 401s; the rotated one is accepted.
      if (authHeader(init) !== "Bearer access-2") return errorBody(401, "UNAUTHORIZED");
      return enveloped({ path: url });
    });

    const results = await Promise.all([
      apiClient.get<{ path: string }>("/a"),
      apiClient.get<{ path: string }>("/b"),
      apiClient.get<{ path: string }>("/c"),
      apiClient.get<{ path: string }>("/d"),
    ]);

    // THE POINT: four concurrent 401s, exactly one rotation.
    expect(refreshCalls()).toBe(1);
    // All four completed on the new token — the user never saw an interruption.
    expect(results.every((r) => typeof r.path === "string")).toBe(true);
    expect(token).toBe("access-2");
    expect(authFailures).toBe(0);
  });

  it("does not refresh again for a straggler whose token was already rotated", async () => {
    let served = 0;
    mockFetch((url, init) => {
      if (isRefresh(url)) return enveloped({ accessToken: "access-rotated-again" });
      served += 1;
      if (served === 1) {
        // This request went out holding access-1. While it was in flight, ANOTHER
        // request's refresh finished and installed a newer token on the bridge — so by
        // the time this 401 lands, the session has already been repaired.
        token = "access-2";
        return errorBody(401, "UNAUTHORIZED");
      }
      expect(authHeader(init)).toBe("Bearer access-2");
      return enveloped({ ok: true });
    });

    await expect(apiClient.get("/straggler")).resolves.toEqual({ ok: true });
    // THE POINT: it retried with the token that already existed instead of rotating a
    // perfectly good one. Staggered past the single-flight window, refreshing here
    // would mean one extra rotation per straggler.
    expect(refreshCalls()).toBe(0);
    expect(token).toBe("access-2");
    expect(authFailures).toBe(0);
  });

  it("keeps the user logged in when the refresh endpoint is unreachable", async () => {
    mockFetch((url) => {
      if (isRefresh(url)) throw new TypeError("Failed to fetch");
      return errorBody(401, "UNAUTHORIZED");
    });

    await expect(apiClient.get("/a")).rejects.toBeInstanceOf(ApiError);
    // Offline is not a logout.
    expect(authFailures).toBe(0);
    expect(token).toBe("access-1");
  });

  it("keeps the user logged in when the refresh endpoint 500s or is throttled", async () => {
    for (const status of [500, 429, 502]) {
      calls = [];
      installBridge();
      mockFetch((url) => {
        if (isRefresh(url)) return errorBody(status, "ERR");
        return errorBody(401, "UNAUTHORIZED");
      });

      await expect(apiClient.get("/a")).rejects.toBeInstanceOf(ApiError);
      expect(authFailures).toBe(0);
      expect(token).toBe("access-1");
    }
  });

  it("retries a 409 rotation race and recovers the session", async () => {
    let attempts = 0;
    mockFetch((url, init) => {
      if (isRefresh(url)) {
        attempts += 1;
        // First try loses the race to another tab; the winner's cookie then works.
        if (attempts === 1) return errorBody(409, "REFRESH_TOKEN_RACE");
        return enveloped({ accessToken: "access-2" });
      }
      if (authHeader(init) !== "Bearer access-2") return errorBody(401, "UNAUTHORIZED");
      return enveloped({ ok: true });
    });

    await expect(apiClient.get("/a")).resolves.toEqual({ ok: true });
    expect(attempts).toBe(2);
    // A race is not a logout.
    expect(authFailures).toBe(0);
    expect(token).toBe("access-2");
  });

  it("does not log out when a race never resolves", async () => {
    mockFetch((url) => {
      if (isRefresh(url)) return errorBody(409, "REFRESH_TOKEN_RACE");
      return errorBody(401, "UNAUTHORIZED");
    });

    await expect(apiClient.get("/a")).rejects.toBeInstanceOf(ApiError);
    // Bounded retries, and no verdict reached — so the session is left alone.
    expect(refreshCalls()).toBe(3); // initial + two bounded race retries
    expect(authFailures).toBe(0);
    expect(token).toBe("access-1");
  });

  it("logs out only when the refresh token is genuinely invalid", async () => {
    mockFetch((url) => {
      if (isRefresh(url)) return errorBody(401, "INVALID_REFRESH_TOKEN");
      return errorBody(401, "UNAUTHORIZED");
    });

    await expect(apiClient.get("/a")).rejects.toBeInstanceOf(ApiError);
    expect(authFailures).toBe(1);
    expect(token).toBeNull();
  });

  it("latches after a definitive failure so a burst does not hammer the throttler", async () => {
    mockFetch((url) => {
      if (isRefresh(url)) return errorBody(401, "INVALID_REFRESH_TOKEN");
      return errorBody(401, "UNAUTHORIZED");
    });

    await Promise.allSettled([
      apiClient.get("/a"),
      apiClient.get("/b"),
      apiClient.get("/c"),
    ]);
    expect(refreshCalls()).toBe(1);

    // A later request must not re-attempt either, until a real token exists again.
    await expect(apiClient.get("/d")).rejects.toBeInstanceOf(ApiError);
    expect(refreshCalls()).toBe(1);

    // Clearing the latch (as login does) lets a refresh be attempted again.
    resetRefreshLatch();
    await expect(refreshSession()).resolves.toEqual({ status: "invalid" });
    expect(refreshCalls()).toBe(2);
  });

  it("never refreshes for the auth endpoints themselves", async () => {
    mockFetch(() => errorBody(401, "INVALID_CREDENTIALS"));

    await expect(
      apiClient.post(
        "/auth/login",
        { email: "a@b.c", password: "x" },
        { skipAuth: true, skipRefresh: true },
      ),
    ).rejects.toBeInstanceOf(ApiError);

    // A bad password must not look like an expired session.
    expect(refreshCalls()).toBe(0);
    expect(authFailures).toBe(0);
  });
});
