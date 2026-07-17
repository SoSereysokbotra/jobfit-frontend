"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, type AuthUser, type UserRole } from "@/providers/auth-provider";

export type { AuthUser, UserRole };

export interface SessionState {
  user: AuthUser | null;
  /** True until the silent refresh + /auth/me settle. Never redirect while true. */
  isLoading: boolean;
  isAuthenticated: boolean;
}

/**
 * Read-only view of the session, backed by GET /auth/me.
 * Replaces the old `localStorage.getItem("jobfits_user")` reads.
 */
export function useSession(): SessionState {
  const { user, isLoading, isAuthenticated } = useAuth();
  return { user, isLoading, isAuthenticated };
}

export interface RequireAuthOptions {
  /** Roles allowed here. Omit to allow any authenticated user. */
  roles?: UserRole[];
  /** Where to send unauthenticated visitors. */
  redirectTo?: string;
}

export interface RequireAuthState extends SessionState {
  /** True only once the user is known AND allowed — gate content on this. */
  isAllowed: boolean;
}

/**
 * Route guard for protected layouts. Redirects unauthenticated users to
 * `redirectTo`, and users whose role doesn't belong here to their own home.
 *
 * Redirects are deferred until `isLoading` is false: during the initial silent
 * refresh we genuinely don't know yet whether there's a session, and bouncing
 * to /login before finding out is what makes a hard refresh look like a logout.
 */
export function useRequireAuth(options: RequireAuthOptions = {}): RequireAuthState {
  const { roles, redirectTo = "/login" } = options;
  const router = useRouter();
  const { user, isLoading, isAuthenticated } = useAuth();

  const isAllowed =
    isAuthenticated && Boolean(user) && (!roles || roles.includes(user!.role));

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated || !user) {
      router.replace(redirectTo);
      return;
    }

    // Signed in, wrong area: send them to their own home rather than /login,
    // which would look like a logout to someone with a valid session.
    if (roles && !roles.includes(user.role)) {
      router.replace(homeForRole(user.role));
    }
  }, [isLoading, isAuthenticated, user, roles, redirectTo, router]);

  return { user, isLoading, isAuthenticated, isAllowed };
}

/** Landing route for a role — used after login and on wrong-area redirects. */
export function homeForRole(role: UserRole): string {
  switch (role) {
    case "ADMIN":
      return "/admin";
    case "EMPLOYER":
      return "/employer/dashboard";
    case "JOB_SEEKER":
    default:
      return "/dashboard";
  }
}

/**
 * The backend User carries a single `name`; several screens want first/last and
 * initials. Kept here so every screen splits it the same way.
 */
export function displayName(user: Pick<AuthUser, "name" | "email"> | null): {
  firstName: string;
  lastName: string;
  fullName: string;
  initials: string;
} {
  const fullName = (user?.name ?? "").trim();
  const parts = fullName.split(/\s+/).filter(Boolean);
  const firstName = parts[0] ?? "";
  const lastName = parts.slice(1).join(" ");

  // Fall back to the email local-part so the UI never renders an empty avatar:
  // `name` is optional at registration and defaults to "".
  const fallback = (user?.email ?? "").split("@")[0] ?? "";
  const initialsSource = parts.length > 0 ? parts : fallback ? [fallback] : [];
  const initials =
    initialsSource.length >= 2
      ? (initialsSource[0][0] + initialsSource[1][0]).toUpperCase()
      : (initialsSource[0]?.slice(0, 2) ?? "?").toUpperCase();

  return { firstName, lastName, fullName, initials };
}
