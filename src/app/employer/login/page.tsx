"use client";

/**
 * The employer portal sign-in (employer_logic.md v2.1 §5.1).
 *
 * Separate from /login because the roles are separate, and because the backend enforces
 * it: POST /employer/auth/login answers 403 for a non-employer account. Until this page
 * existed, role enforcement for the whole employer area was client-side only.
 */

import React, { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, ArrowRight } from "lucide-react";

import { employerAuthApi } from "@/features/employer-request/api/employer-auth.api";
import { useAuth, type AuthUser } from "@/providers/auth-provider";
import { apiClient } from "@/lib/api/client";
import { qk } from "@/lib/api/query-keys";
import { ApiError } from "@/lib/api/client";
import { Alert } from "@/shared/components/feedback/alert";
import {
  Field,
  PortalFrame,
} from "@/features/employer-request/components/portal-frame";

export default function EmployerLoginPage() {
  return (
    <Suspense fallback={<PortalFrame title="Employer sign-in"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></PortalFrame>}>
      <EmployerLoginForm />
    </Suspense>
  );
}

function EmployerLoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { setAccessToken } = useAuth();
  const queryClient = useQueryClient();

  // Carried over from activation, so a freshly activated employer does not retype it.
  const [email, setEmail] = useState(params.get("email") ?? "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [wrongPortal, setWrongPortal] = useState(false);
  const [busy, setBusy] = useState(false);

  const justActivated = params.get("activated") === "1";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setWrongPortal(false);
    setBusy(true);
    try {
      const { accessToken } = await employerAuthApi.login({ email, password });

      // A new identity must inherit NOTHING from the previous one — the same rule
      // AuthProvider.login follows, and skipping it is a real bug rather than an
      // optimisation. /auth/me is cached with a 5-minute staleTime, so signing in here
      // while an ADMIN session was cached left the provider still reporting ADMIN. The
      // employer layout then saw the wrong role and bounced to the admin dashboard.
      queryClient.clear();
      setAccessToken(accessToken);

      // Fetch eagerly with staleTime 0, so the layout guard sees the REAL role on its
      // first render instead of routing on a stale one.
      await queryClient.fetchQuery({
        queryKey: qk.auth.me(),
        queryFn: () => apiClient.get<AuthUser>("/auth/me"),
        staleTime: 0,
      });

      router.replace("/employer/dashboard");
    } catch (err) {
      // 403 means the password was RIGHT and the account is simply not an employer. That
      // is a wrong-door mistake, not a failure, so it gets a way out rather than red text.
      if (err instanceof ApiError && err.statusCode === 403) {
        setWrongPortal(true);
        setError(err.message);
      } else {
        setError(
          err instanceof Error ? err.message : "Could not sign you in. Please try again.",
        );
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <PortalFrame title="Employer sign-in" subtitle="Post jobs and review applicants.">
      {justActivated && (
        <Alert variant="success">
          Your account is active. Sign in with the password you just set.
        </Alert>
      )}

      {error && (
        <Alert variant={wrongPortal ? "warning" : "error"}>
          {error}
          {wrongPortal && (
            <>
              {" "}
              <Link href="/login" className="underline font-semibold">
                Go to the main sign-in
              </Link>
              .
            </>
          )}
        </Alert>
      )}

      <form onSubmit={submit} className="space-y-4">
        <Field
          id="email"
          label="Work email"
          type="email"
          value={email}
          onChange={setEmail}
          autoComplete="username"
          required
        />
        <Field
          id="password"
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          autoComplete="current-password"
          required
        />

        <button
          type="submit"
          disabled={busy}
          className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-bold text-white transition-all duration-200 disabled:opacity-50 bg-primary-600 hover:bg-primary-700"
        >
          {busy ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Signing in…
            </>
          ) : (
            <>
              Sign in <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="space-y-2 text-center text-xs" style={{ color: "var(--color-text-tertiary)" }}>
        <p>
          Approved but not set up yet?{" "}
          <Link href="/employer/activate" className="underline font-semibold" style={{ color: "var(--color-primary-600)" }}>
            Activate your account
          </Link>
        </p>
        <p>
          Looking for a job instead?{" "}
          <Link href="/login" className="underline" style={{ color: "var(--color-primary-600)" }}>
            Sign in as a job seeker
          </Link>
        </p>
      </div>
    </PortalFrame>
  );
}
