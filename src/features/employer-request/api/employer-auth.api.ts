/**
 * The employer portal's own sign-in and activation.
 *
 * Separate from `authApi` because these are separate endpoints with separate rules: the
 * login refuses a non-EMPLOYER account with 403, and activation is the only way an
 * approved-but-unactivated account becomes usable.
 */

import { apiClient } from "@/lib/api/client";

/** Public endpoints: no bearer, and never trigger the refresh dance. */
const PUBLIC = { skipAuth: true, skipRefresh: true } as const;

export interface EmployerLoginInput {
  email: string;
  password: string;
}

export interface ActivateEmployerInput {
  email: string;
  /** The 6-digit code emailed on approval. */
  code: string;
  /** Chosen by the employer — no password is ever sent to them. */
  password: string;
}

export const employerAuthApi = {
  /**
   * POST /employer/auth/login — access token in the body, refresh token in an httpOnly
   * cookie. 403 (not 401) when the credentials were right but the account is not an
   * employer, so the UI can point them at the correct portal.
   */
  login: (input: EmployerLoginInput) =>
    apiClient.post<{ accessToken: string }>(
      "/employer/auth/login",
      input,
      PUBLIC,
    ),

  /**
   * POST /employer-requests/activate — exchange the code for a working account.
   *
   * Lives under employer-requests rather than employer/auth because the onboarding ticket
   * is what holds the code. It does NOT sign the employer in; they land on the login page
   * with the password they just chose.
   */
  activate: (input: ActivateEmployerInput) =>
    apiClient.post<{ message: string }>(
      "/employer-requests/activate",
      input,
      PUBLIC,
    ),
};
