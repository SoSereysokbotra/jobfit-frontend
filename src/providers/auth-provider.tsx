"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient, registerAuthBridge, resetRefreshLatch } from "@/lib/api/client";
import { qk } from "@/lib/api/query-keys";

/** Backend roles (SafeUser.role). */
export type UserRole = "JOB_SEEKER" | "EMPLOYER" | "ADMIN";

/**
 * `GET /auth/me` → User.toSafe(). Note this is the backend's shape verbatim:
 * a single `name` (not firstName/lastName) and no `onboardingComplete` — profile
 * completeness is derived from the profile endpoints in Phase 3.
 */
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin: string | null;
  deletedAt: string | null;
}

interface AuthContextValue {
  user: AuthUser | null;
  /** True until the initial silent-refresh + /auth/me settle. Gate redirects on this. */
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
  /** Force a silent refresh. Returns true when a session was restored. */
  refresh: () => Promise<boolean>;
  /** Adopt a token minted by a separate flow (e.g. POST /admin/login, Phase 8). */
  setAccessToken: (token: string | null) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  // The token lives in memory only — never localStorage, so an XSS payload
  // cannot read it and it dies with the tab. The ref is what the api client
  // reads (always current, even mid-render); the state exists to re-render
  // consumers and drive the /auth/me query's `enabled`.
  const tokenRef = useRef<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Set once the initial silent refresh has resolved, either way.
  const [bootstrapped, setBootstrapped] = useState(false);

  const setAccessToken = useCallback((next: string | null) => {
    // A real token means the session is alive again — let the client retry
    // refreshes after a previous failure latched them off.
    if (next) resetRefreshLatch();
    tokenRef.current = next;
    setToken(next);
  }, []);

  // Held in a ref so the bridge (registered once) always calls the latest one.
  const authFailureRef = useRef<() => void>(() => {});
  authFailureRef.current = () => {
    tokenRef.current = null;
    setToken(null);
    queryClient.removeQueries({ queryKey: qk.auth.all });
    router.replace("/login");
  };

  // Registered during render, not in an effect: children may fire queries on
  // their first render, which is before effects run — the client must already
  // know how to reach the token by then.
  const bridgeRegistered = useRef(false);
  if (!bridgeRegistered.current) {
    bridgeRegistered.current = true;
    registerAuthBridge({
      getAccessToken: () => tokenRef.current,
      setAccessToken: (next) => {
        if (next) resetRefreshLatch();
        tokenRef.current = next;
        setToken(next);
      },
      onAuthFailure: () => authFailureRef.current(),
    });
  }

  const refresh = useCallback(async (): Promise<boolean> => {
    try {
      const { accessToken } = await apiClient.post<{ accessToken: string }>(
        "/auth/refresh-token",
        undefined,
        // This IS the refresh call — a 401 here means no session, not "go refresh".
        { skipAuth: true, skipRefresh: true },
      );
      setAccessToken(accessToken);
      return true;
    } catch {
      setAccessToken(null);
      return false;
    }
  }, [setAccessToken]);

  // On mount (and on hard refresh) try once to trade the httpOnly refresh cookie
  // for an access token, so a reload doesn't look like a logout.
  useEffect(() => {
    let cancelled = false;
    void refresh().finally(() => {
      if (!cancelled) setBootstrapped(true);
    });
    return () => {
      cancelled = true;
    };
  }, [refresh]);

  const { data: user, isPending: userPending } = useQuery({
    queryKey: qk.auth.me(),
    queryFn: () => apiClient.get<AuthUser>("/auth/me"),
    enabled: Boolean(token),
    staleTime: 5 * 60_000,
  });

  const login = useCallback(
    async (email: string, password: string): Promise<AuthUser> => {
      const { accessToken } = await apiClient.post<{ accessToken: string }>(
        "/auth/login",
        { email, password },
        { skipAuth: true, skipRefresh: true },
      );
      setAccessToken(accessToken);
      // Fetch eagerly so callers can route on role without a second render pass.
      const me = await queryClient.fetchQuery({
        queryKey: qk.auth.me(),
        queryFn: () => apiClient.get<AuthUser>("/auth/me"),
      });
      return me;
    },
    [queryClient, setAccessToken],
  );

  const logout = useCallback(async () => {
    try {
      await apiClient.post("/auth/logout", undefined, { skipRefresh: true });
    } catch {
      // Already-expired token: the local session still has to go.
    }
    setAccessToken(null);
    queryClient.clear();
    router.replace("/login");
  }, [queryClient, router, setAccessToken]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: user ?? null,
      // Loading until the refresh attempt settles, and while /auth/me is in flight.
      isLoading: !bootstrapped || (Boolean(token) && userPending),
      isAuthenticated: Boolean(token && user),
      login,
      logout,
      refresh,
      setAccessToken,
    }),
    [user, bootstrapped, token, userPending, login, logout, refresh, setAccessToken],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within <AuthProvider>");
  return context;
}
