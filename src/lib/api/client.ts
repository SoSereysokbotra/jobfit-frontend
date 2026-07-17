/**
 * Typed fetch wrapper for the JobFit backend.
 *
 * Contract (verified against the running backend, not assumed):
 *  - Success bodies are wrapped by the global TransformInterceptor:
 *      { success, statusCode, timestamp, data }   -> we return `data`.
 *  - Error bodies come from AllExceptionsFilter and are NOT wrapped:
 *      { statusCode, timestamp, path, message }   where `message` is a string or,
 *    for validation failures, a string[]. Auth errors add a `code` field
 *    (e.g. "INVALID_REFRESH_TOKEN").
 *  - Auth: access token in memory via the Authorization header; the refresh token
 *    is an httpOnly cookie, so every request uses credentials: "include".
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

if (!BASE_URL && typeof window !== "undefined") {
  // Surfaced once at startup rather than as a confusing "fetch failed" per call.
  console.error(
    "NEXT_PUBLIC_API_URL is not set. See docs/INTEGRATION_PLAN.md and set it in .env.local.",
  );
}

/** Shape of the backend's error body. */
interface ApiErrorBody {
  statusCode?: number;
  message?: string | string[];
  code?: string;
  path?: string;
}

export class ApiError extends Error {
  readonly statusCode: number;
  /** Backend error code where present, e.g. "INVALID_REFRESH_TOKEN". */
  readonly code?: string;
  readonly path?: string;
  /** Every message the backend returned; validation errors return several. */
  readonly messages: string[];

  constructor(statusCode: number, messages: string[], code?: string, path?: string) {
    super(messages[0] ?? "Request failed");
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.messages = messages;
    this.code = code;
    this.path = path;
  }

  /** 400 from the global ValidationPipe — `messages` holds one entry per field. */
  get isValidationError(): boolean {
    return this.statusCode === 400 && this.messages.length > 1;
  }
}

/**
 * Lets the auth provider own the access token while the client stays a plain
 * module. Registered once, on mount, by AuthProvider.
 */
export interface AuthBridge {
  getAccessToken: () => string | null;
  setAccessToken: (token: string | null) => void;
  /** Called when a request is unauthorized and refreshing could not rescue it. */
  onAuthFailure: () => void;
}

let authBridge: AuthBridge | null = null;

export function registerAuthBridge(bridge: AuthBridge): void {
  authBridge = bridge;
}

export type QueryParams = Record<
  string,
  string | number | boolean | string[] | null | undefined
>;

export interface RequestOptions {
  query?: QueryParams;
  /** Skip the Authorization header (public endpoints). */
  skipAuth?: boolean;
  /** Skip the silent-refresh-on-401 dance (the auth endpoints themselves). */
  skipRefresh?: boolean;
  signal?: AbortSignal;
}

function buildUrl(path: string, query?: QueryParams): string {
  const url = `${BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
  if (!query) return url;

  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value == null || value === "") continue;
    // Repeat the key for arrays (skillIds=a&skillIds=b) — Nest parses this into an array.
    if (Array.isArray(value)) {
      value.filter(Boolean).forEach((v) => search.append(key, String(v)));
    } else {
      search.append(key, String(value));
    }
  }
  const qs = search.toString();
  return qs ? `${url}?${qs}` : url;
}

function toMessages(message: string | string[] | undefined): string[] {
  if (Array.isArray(message)) return message;
  if (typeof message === "string") return [message];
  return [];
}

async function toApiError(response: Response): Promise<ApiError> {
  let body: ApiErrorBody = {};
  try {
    body = (await response.json()) as ApiErrorBody;
  } catch {
    // Non-JSON error (proxy error, backend down mid-request).
  }
  const messages = toMessages(body.message);
  if (messages.length === 0) messages.push(response.statusText || "Request failed");
  return new ApiError(body.statusCode ?? response.status, messages, body.code, body.path);
}

/** Unwrap the TransformInterceptor envelope, tolerating non-enveloped bodies. */
function unwrap<T>(body: unknown): T {
  if (body !== null && typeof body === "object" && "success" in body && "data" in body) {
    return (body as { data: T }).data;
  }
  return body as T;
}

/**
 * Single-flight refresh: concurrent 401s share one POST /auth/refresh-token
 * rather than each firing their own. The backend's refresh tokens are
 * single-use, so parallel refreshes would look like token reuse — which it
 * treats as theft and answers by revoking every session.
 */
let refreshInFlight: Promise<string | null> | null = null;

/**
 * Latched once a refresh fails, so a burst of in-flight requests hitting 401
 * after the session dies produces ONE refresh attempt rather than one each
 * (which would trip the backend's refreshToken throttler). Cleared by
 * `resetRefreshLatch` as soon as a real token exists again.
 */
let refreshFailed = false;

/** Call when a fresh token is obtained by any means (login, admin login). */
export function resetRefreshLatch(): void {
  refreshFailed = false;
}

function refreshAccessToken(): Promise<string | null> {
  if (refreshFailed) return Promise.resolve(null);

  refreshInFlight ??= (async () => {
    try {
      const response = await fetch(buildUrl("/auth/refresh-token"), {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) {
        refreshFailed = true;
        return null;
      }
      const body = unwrap<{ accessToken?: string }>(await response.json());
      if (!body?.accessToken) {
        refreshFailed = true;
        return null;
      }
      refreshFailed = false;
      return body.accessToken;
    } catch {
      refreshFailed = true;
      return null;
    } finally {
      refreshInFlight = null;
    }
  })();
  return refreshInFlight;
}

async function send(
  method: string,
  path: string,
  body: unknown,
  options: RequestOptions,
  isRetry = false,
): Promise<Response> {
  const headers: Record<string, string> = {};
  const isFormData = body instanceof FormData;

  // Let the browser set the multipart boundary itself.
  if (body !== undefined && !isFormData) headers["Content-Type"] = "application/json";

  if (!options.skipAuth) {
    const token = authBridge?.getAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(buildUrl(path, options.query), {
    method,
    headers,
    credentials: "include", // sends the httpOnly refresh cookie
    signal: options.signal,
    body: isFormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (response.status !== 401 || options.skipRefresh || isRetry) return response;

  // Exactly one silent refresh attempt, then one retry — or hand off to the provider.
  const token = await refreshAccessToken();
  if (!token) {
    authBridge?.setAccessToken(null);
    authBridge?.onAuthFailure();
    return response;
  }
  authBridge?.setAccessToken(token);
  return send(method, path, body, options, true);
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  options: RequestOptions = {},
): Promise<T> {
  const response = await send(method, path, body, options);
  if (!response.ok) throw await toApiError(response);
  if (response.status === 204 || response.headers.get("content-length") === "0") {
    return undefined as T;
  }
  return unwrap<T>(await response.json());
}

export const apiClient = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>("GET", path, undefined, options),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>("POST", path, body, options),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>("PATCH", path, body, options),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>("PUT", path, body, options),
  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>("DELETE", path, undefined, options),
  /** Multipart upload (resumes). Pass FormData; do not set Content-Type. */
  upload: <T>(path: string, form: FormData, options?: RequestOptions) =>
    request<T>("POST", path, form, options),
};
