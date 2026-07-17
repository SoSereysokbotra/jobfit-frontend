/**
 * Auth endpoints (backend module: `auth`).
 *
 * Two things drive the shapes here and are easy to get wrong:
 *
 * 1. The multi-step flows carry the *email* in an httpOnly cookie set by the
 *    previous step — `verifyEmail`, `verifyPasswordReset` and `resetPassword`
 *    therefore take no email. The browser must be allowed to send that cookie,
 *    which is why every call goes through apiClient (credentials: "include").
 * 2. These are the endpoints that mint/reject sessions, so they all pass
 *    skipRefresh: a 401 from `login` means "wrong password", not "go refresh".
 */

import { apiClient } from "@/lib/api/client";
import type { AuthUser } from "@/providers/auth-provider";

/** Public endpoints: no bearer, and never trigger the refresh dance. */
const PUBLIC = { skipAuth: true, skipRefresh: true } as const;

export interface RegisterInput {
  email: string;
  password: string;
  /** Optional per RegisterDto; the backend defaults it to "". */
  name?: string;
  /** RegisterDto @Equals(true) — the request 400s unless this is literally true. */
  agreeToTerms: boolean;
}

export interface LoginInput {
  email: string;
  password: string;
}

interface AccessTokenResponse {
  accessToken: string;
}

export const authApi = {
  /** POST /auth/register — emails a 6-digit code, sets registration_verification. */
  register: (input: RegisterInput) =>
    apiClient.post<{ message: string }>("/auth/register", input, PUBLIC),

  /** POST /auth/verify-email — email comes from the registration_verification cookie. */
  verifyEmail: (code: string) =>
    apiClient.post<{ success: boolean }>("/auth/verify-email", { code }, PUBLIC),

  /** POST /auth/resend-email-verification — always succeeds (enumeration protection). */
  resendEmailVerification: (email: string) =>
    apiClient.post<{ success: boolean }>(
      "/auth/resend-email-verification",
      { email },
      PUBLIC,
    ),

  /** POST /auth/login — access token in the body, refresh token in an httpOnly cookie. */
  login: (input: LoginInput) =>
    apiClient.post<AccessTokenResponse>("/auth/login", input, PUBLIC),

  /** POST /auth/logout — needs a valid access token, so no skipAuth. */
  logout: () => apiClient.post<{ success: boolean }>("/auth/logout", undefined, {
    skipRefresh: true,
  }),

  /** POST /auth/refresh-token — reads + rotates the refresh cookie. */
  refreshToken: () =>
    apiClient.post<AccessTokenResponse>("/auth/refresh-token", undefined, PUBLIC),

  /** GET /auth/me — the current user (User.toSafe()). */
  me: () => apiClient.get<AuthUser>("/auth/me"),

  // ---- Password reset: request -> verify -> reset ----

  /** POST /auth/request-password-reset — always succeeds (enumeration protection). */
  requestPasswordReset: (email: string) =>
    apiClient.post<{ success: boolean }>(
      "/auth/request-password-reset",
      { email },
      PUBLIC,
    ),

  /** POST /auth/verify-password-reset — swaps the verification cookie for a reset session. */
  verifyPasswordReset: (code: string) =>
    apiClient.post<{ success: boolean }>(
      "/auth/verify-password-reset",
      { code },
      PUBLIC,
    ),

  /** POST /auth/reset-password — reads the password_reset_session cookie; revokes all sessions. */
  resetPassword: (password: string) =>
    apiClient.post<{ success: boolean }>("/auth/reset-password", { password }, PUBLIC),

  /** POST /auth/resend-password-reset-verification */
  resendPasswordReset: (email: string) =>
    apiClient.post<{ success: boolean }>(
      "/auth/resend-password-reset-verification",
      { email },
      PUBLIC,
    ),
};
