"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, ArrowRight, ShieldAlert, Check } from "lucide-react";
import { AuthShell, AuthHeading, TextField, SocialAuthButtons } from "@/features/auth/components";
import { homeForRole } from "@/features/auth/hooks/use-session";
import { useAuth } from "@/providers/auth-provider";
import { ApiError } from "@/lib/api/client";
import { Alert } from "@/shared/components/feedback/alert";
import { Button } from "@/shared/components/ui/button";
import { useTranslation } from "@/providers/locale-provider";
import { toast } from "@/stores/toast-store";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { t } = useTranslation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    setErrorMessage("");
    setIsBlocked(false);
    setNeedsVerification(false);

    try {
      const user = await login(email.trim(), password);

      toast.success(t("auth.welcomeBack") || "Welcome back!");

      // Role-based routing
      router.push(homeForRole(user.role));
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.statusCode === 403) {
          setIsBlocked(true);
          setErrorMessage(err.messages.join(" ") || "Your account has been suspended or is inactive.");
        } else if (err.statusCode === 401 && err.messages.some((m: string) => m.toLowerCase().includes("verify"))) {
          setNeedsVerification(true);
          setErrorMessage(err.messages.join(" ") || "Please verify your email address before logging in.");
        } else {
          const msg = err.messages.join(" ") || "Invalid email or password.";
          setErrorMessage(msg);
          toast.error(msg);
        }
      } else {
        const msg = "An unexpected error occurred. Please try again.";
        setErrorMessage(msg);
        toast.error(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell
      quote="Choose a job you love, and you will never have to work a day in your life."
      author="Confucius"
    >
      {isBlocked ? (
        <div className="space-y-4 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-error-50 flex items-center justify-center">
            <ShieldAlert className="w-6 h-6 text-error-600" />
          </div>
          <h2 className="text-xl font-bold" style={{ color: "var(--color-text-primary)" }}>Account Access Suspended</h2>
          <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
            {errorMessage || "Your account has been deactivated or suspended. Please contact support if you believe this is an error."}
          </p>
          <div className="pt-2">
            <Button
              variant="outline"
              fullWidth
              onClick={() => {
                setIsBlocked(false);
                setErrorMessage("");
                setPassword("");
              }}
            >
              Back to Login
            </Button>
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
              <label htmlFor="remember-me" className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="sr-only"
                />
                <span
                  className="flex items-center justify-center w-4 h-4 rounded border transition-all duration-150 shrink-0"
                  style={{
                    background: rememberMe ? "var(--color-primary-600)" : "var(--color-bg)",
                    borderColor: rememberMe ? "var(--color-primary-600)" : "var(--color-border)",
                  }}
                >
                  {rememberMe && <Check size={11} style={{ color: "#ffffff" }} />}
                </span>
                <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
                  {t("auth.rememberMe")}
                </span>
              </label>
              <Link href="/forgot-password" className="text-xs text-primary-600 dark:text-primary-400 hover:underline font-semibold">
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
            <span style={{ color: "var(--color-text-tertiary)" }}>{t("auth.dontHaveAccount")} </span>
            <Link href="/signup" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">
              {t("auth.createAccount")}
            </Link>
          </div>
        </>
      )}
    </AuthShell>
  );
}
