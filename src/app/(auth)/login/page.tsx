"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, ArrowRight, ShieldAlert } from "lucide-react";
import { AuthShell, AuthHeading, TextField, SocialAuthButtons } from "@/features/auth/components";
import { homeForRole } from "@/features/auth/hooks/use-session";
import { useAuth } from "@/providers/auth-provider";
import { ApiError } from "@/lib/api/client";
import { Alert } from "@/shared/components/feedback/alert";
import { Button } from "@/shared/components/ui/button";
import { useTranslation } from "@/providers/locale-provider";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { t } = useTranslation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // LOGIN_BLOCKED (429) — the backend owns lockout; we only reflect it.
  const [isLocked, setIsLocked] = useState(false);
  // EMAIL_NOT_VERIFIED (403) — offer the verification flow instead of a dead end.
  const [needsVerification, setNeedsVerification] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;

    setIsLoading(true);
    setErrorMessage("");
    setNeedsVerification(false);

    try {
      const user = await login(email.trim(), password);
      // Land each role in its own area rather than assuming /dashboard.
      router.replace(homeForRole(user.role));
    } catch (error) {
      const err = error as ApiError;
      if (err instanceof ApiError && err.code === "LOGIN_BLOCKED") {
        setIsLocked(true);
      } else if (err instanceof ApiError && err.code === "EMAIL_NOT_VERIFIED") {
        setNeedsVerification(true);
      }
      setErrorMessage(
        err instanceof ApiError ? err.message : "Something went wrong. Please try again.",
      );
      setIsLoading(false);
    }
  };

  return (
    <AuthShell>
      {isLocked ? (
        /* ACCOUNT LOCKED — the backend locks after repeated failures and unlocks
           on its own timer. TODO(backend): no self-serve unlock endpoint exists
           (only the admin-only POST /admin/users/{id}/unlock), so there is
           nothing for the user to submit here. */
        <div className="space-y-6 animate-fade-in">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-error-100 mb-4">
              <ShieldAlert className="w-6 h-6 text-error-600" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-neutral-900">{t("auth.accountLockedTitle")}</h2>
            <p className="text-sm text-neutral-500 mt-2">
              {errorMessage || "Too many failed attempts. Please try again later."}
            </p>
          </div>

          <Alert variant="warning">
            For security, sign-in is paused for a short period. You can try again shortly, or
            reset your password if you&apos;ve forgotten it.
          </Alert>

          <div className="space-y-3">
            <Button
              fullWidth
              variant="secondary"
              onClick={() => {
                setIsLocked(false);
                setErrorMessage("");
                setPassword("");
              }}
            >
              {t("action.back")}
            </Button>
            <Link
              href="/forgot-password"
              className="block text-center text-xs text-primary-600 font-semibold hover:underline"
            >
              Reset your password
            </Link>
          </div>
        </div>
      ) : (
        <>
          <AuthHeading
            title={t("auth.welcomeBack")}
            subtitle={t("auth.loginSubtitle")}
          />

          {errorMessage && (
            <Alert variant="error" className="animate-fade-in">
              {errorMessage}
              {needsVerification && (
                <>
                  {" "}
                  <Link href={`/verify-email?email=${encodeURIComponent(email.trim())}`} className="font-semibold underline">
                    Verify your email
                  </Link>
                </>
              )}
            </Alert>
          )}

          <form className="space-y-4" onSubmit={handleEmailLogin}>
            <TextField
              label={t("auth.emailLabel")}
              icon={Mail}
              type="email"
              required
              placeholder={t("auth.emailPlaceholder")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <TextField
              label={t("auth.passwordLabel")}
              icon={Lock}
              passwordToggle
              required
              placeholder={t("auth.passwordPlaceholder")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between mt-2.5">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-200 rounded bg-white"
                />
                <label htmlFor="remember-me" className="ml-2 block text-xs text-neutral-500">
                  {t("auth.rememberMe")}
                </label>
              </div>
              <Link href="/forgot-password" className="text-xs text-primary-600 hover:underline font-semibold">
                {t("auth.forgotPassword")}
              </Link>
            </div>

            <Button
              type="submit"
              fullWidth
              loading={isLoading}
              loadingText={t("auth.signingIn")}
              disabled={!email || !password}
            >
              {t("auth.signIn")} <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          {/* DIVIDER */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t" style={{ borderColor: "var(--color-border)" }} />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span
                className="px-3"
                style={{ background: "var(--color-card)", color: "var(--color-text-tertiary)" }}
              >
                Or continue with
              </span>
            </div>
          </div>

          {/* TODO(backend): no OAuth endpoints exist. Kept visible but disabled
              rather than removed, so the UI is ready when they land. */}
          <SocialAuthButtons onGoogle={() => { }} onLinkedIn={() => { }} disabled />

          {/* SIGN UP LINK */}
          <div className="text-center text-xs mt-4">
            <span className="text-neutral-500">{t("auth.dontHaveAccount")} </span>
            <Link href="/signup" className="text-primary-600 font-semibold hover:underline">
              {t("auth.createAccount")}
            </Link>
          </div>
        </>
      )}
    </AuthShell>
  );
}
