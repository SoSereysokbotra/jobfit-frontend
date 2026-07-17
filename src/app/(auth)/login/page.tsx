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

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

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
    <AuthShell
      quote="Choose a job you love, and you will never have to work a day in your life."
      author="Confucius"
    >
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
            <h2 className="text-2xl font-bold tracking-tight text-neutral-900">Account Locked</h2>
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
              Back to Sign In
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
            title="Sign in to your account"
            subtitle="Enter your credentials to access your dashboard"
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
              label="Email Address"
              icon={Mail}
              type="email"
              required
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <TextField
              label="Password"
              icon={Lock}
              passwordToggle
              required
              placeholder="••••••••"
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
                  Remember me on this device
                </label>
              </div>
              <Link href="/forgot-password" className="text-xs text-primary-600 hover:underline font-semibold">
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              fullWidth
              loading={isLoading}
              loadingText="Signing in..."
              disabled={!email || !password}
            >
              Sign In <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          {/* DIVIDER */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-neutral-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-neutral-500">Or continue with</span>
            </div>
          </div>

          {/* TODO(backend): no OAuth endpoints exist. Kept visible but disabled
              rather than removed, so the UI is ready when they land. */}
          <SocialAuthButtons onGoogle={() => {}} onLinkedIn={() => {}} disabled />
          <p className="text-center text-xs text-neutral-400 mt-2">
            Social sign-in is coming soon.
          </p>

          {/* SIGN UP LINK */}
          <div className="text-center text-xs mt-4">
            <span className="text-neutral-500">Don&apos;t have an account? </span>
            <Link href="/signup" className="text-primary-600 font-semibold hover:underline">
              Sign up
            </Link>
          </div>
        </>
      )}
    </AuthShell>
  );
}
