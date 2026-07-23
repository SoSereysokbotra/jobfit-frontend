"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, AlertCircle, CheckCircle2, ArrowRight, KeyRound } from "lucide-react";
import {
  AuthShell,
  AuthHeading,
  TextField,
  PasswordStrengthMeter,
  getPasswordStrength,
} from "@/features/auth/components";
import { authApi } from "@/features/auth/api/auth.api";
import { ApiError } from "@/lib/api/client";
import { Alert } from "@/shared/components/feedback/alert";
import { Button } from "@/shared/components/ui/button";

const REDIRECT_DELAY = 3;

const toMessage = (error: unknown, fallback: string) =>
  error instanceof ApiError ? error.messages.join(" ") : fallback;

export default function ForgotPasswordResetPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(REDIRECT_DELAY);

  const strength = getPasswordStrength(password);
  const passwordTooShort = password.length > 0 && password.length < 8;
  const passwordsMatch = password === confirmPassword;

  // Auto-redirect to /login after success
  useEffect(() => {
    if (!success) return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push("/login");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [success, router]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordsMatch) {
      setErrorMsg("Passwords do not match.");
      return;
    }
    setIsLoading(true);
    setErrorMsg("");
    try {
      await authApi.resetPassword(password);
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("reset_email");
      }
      setSuccess(true);
    } catch (error) {
      setErrorMsg(toMessage(error, "Could not reset your password. Your session may have expired — please start over."));
    } finally {
      setIsLoading(false);
    }
  };

  /* ── SUCCESS STATE ── */
  if (success) {
    return (
      <AuthShell>
        <div className="space-y-6 text-center animate-fade-in">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-success-50 flex items-center justify-center border border-success-100">
              <CheckCircle2 className="w-8 h-8 text-success-600 animate-bounce" />
            </div>
          </div>

          {/* Copy */}
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
              Password Reset Successful!
            </h2>
            <p className="text-sm text-neutral-500 mt-2">
              Your password has been updated and all other sessions were signed
              out. You can now log in with your new password.
            </p>
          </div>

          {/* CTA */}
          <div className="pt-2 space-y-2">
            <Link
              href="/login"
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-5 rounded-md text-sm text-white font-semibold transition-all duration-200 bg-primary-600 hover:bg-primary-700 active:scale-[0.98]"
            >
              <span>Go to Login</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <p className="text-xs text-neutral-400">
              Redirecting automatically in {countdown}s…
            </p>
          </div>
        </div>
      </AuthShell>
    );
  }

  /* ── RESET FORM ── */
  return (
    <AuthShell
      quote="Every new beginning comes from some other beginning's end."
      author="Seneca"
    >
      <div className="space-y-6 animate-fade-in">
        <AuthHeading
          title="Create New Password"
          subtitle="Choose a strong password for your account"
          icon={<KeyRound className="w-5 h-5 text-primary-600" />}
        />

        {errorMsg && (
          <Alert variant="error">
            {errorMsg}{" "}
            {errorMsg.includes("expired") && (
              <Link href="/forgot-password" className="font-semibold underline">
                Start over
              </Link>
            )}
          </Alert>
        )}

        <form className="space-y-4" onSubmit={handleResetPassword}>
          {/* New password */}
          <div>
            <TextField
              label="New Password"
              icon={Lock}
              passwordToggle
              required
              autoFocus
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <PasswordStrengthMeter password={password} />
            {passwordTooShort && (
              <p className="mt-1 text-xs text-error-500 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                Password must be at least 8 characters
              </p>
            )}
          </div>

          {/* Confirm password */}
          <div>
            <TextField
              label="Confirm Password"
              icon={Lock}
              type="password"
              required
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {confirmPassword && !passwordsMatch && (
              <p className="mt-1 text-xs text-error-500 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                Passwords do not match
              </p>
            )}
          </div>

          <Button
            type="submit"
            fullWidth
            loading={isLoading}
            loadingText="Resetting password…"
            disabled={
              !password ||
              !passwordsMatch ||
              passwordTooShort ||
              strength.label === "Weak"
            }
          >
            Reset Password
          </Button>
        </form>

        {/* Fallback: session may have expired */}
        <p className="text-center text-xs text-neutral-400 pt-1">
          Session expired?{" "}
          <Link href="/forgot-password" className="text-primary-600 font-semibold hover:underline">
            Start over
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
