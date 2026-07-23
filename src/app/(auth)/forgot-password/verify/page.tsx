"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowRight, ArrowLeft, ShieldCheck } from "lucide-react";
import {
  AuthShell,
  AuthHeading,
  OtpInput,
} from "@/features/auth/components";
import { authApi } from "@/features/auth/api/auth.api";
import { ApiError } from "@/lib/api/client";
import { Alert } from "@/shared/components/feedback/alert";
import { Button } from "@/shared/components/ui/button";

/** Mirrors PASSWORD_RESET_CODE_TTL_MINUTES on the backend. */
const CODE_TTL_SECONDS = 15 * 60;
const RESEND_COOLDOWN_SECONDS = 30;

const toMessage = (error: unknown, fallback: string) =>
  error instanceof ApiError ? error.messages.join(" ") : fallback;

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    const fromQuery = searchParams.get("email");
    const fromStorage = typeof window !== "undefined" ? sessionStorage.getItem("reset_email") : null;
    if (fromStorage) {
      setEmail(fromStorage);
    } else if (fromQuery) {
      setEmail(fromQuery);
      if (typeof window !== "undefined") {
        sessionStorage.setItem("reset_email", fromQuery);
      }
    }
    // Clean up query parameters from the browser address bar
    if (typeof window !== "undefined" && window.location.search) {
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [searchParams]);

  const [verificationCode, setVerificationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [timeLeft, setTimeLeft] = useState(CODE_TTL_SECONDS);
  const [resendTimer, setResendTimer] = useState(RESEND_COOLDOWN_SECONDS);

  // Code expiry countdown
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((p) => p - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  // Resend cooldown
  useEffect(() => {
    if (resendTimer <= 0) return;
    const timer = setInterval(() => setResendTimer((p) => p - 1), 1000);
    return () => clearInterval(timer);
  }, [resendTimer]);

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");
    try {
      await authApi.verifyPasswordReset(verificationCode);
      router.push("/forgot-password/reset");
    } catch (error) {
      setErrorMsg(toMessage(error, "Could not verify that code. Please try again."));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResendTimer(RESEND_COOLDOWN_SECONDS);
    setErrorMsg("");
    try {
      await authApi.resendPasswordReset(email);
      setTimeLeft(CODE_TTL_SECONDS);
      setVerificationCode("");
    } catch (error) {
      setErrorMsg(toMessage(error, "Could not resend the code. Please try again."));
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <AuthHeading
        title="Verify Your Email"
        subtitle={
          <>
            Enter the 6-digit code sent to{" "}
            <strong className="text-neutral-900">{email || "your email"}</strong>
          </>
        }
        icon={<ShieldCheck className="w-5 h-5 text-primary-600" />}
      />

      <p className="text-xs text-neutral-500">
        If an account exists for that address, a code is on its way.
      </p>

      {errorMsg && <Alert variant="error">{errorMsg}</Alert>}

      <form className="space-y-4" onSubmit={handleVerifyCode}>
        {/* Code field with expiry timer */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider">
              Verification Code
            </label>
            <span
              className={`text-xs font-medium ${
                timeLeft <= 0 ? "text-error-600" : "text-neutral-500"
              }`}
            >
              {timeLeft > 0 ? `Expires in ${formatTime(timeLeft)}` : "Code expired"}
            </span>
          </div>
          <OtpInput
            value={verificationCode}
            onChange={(v) => {
              setVerificationCode(v);
              if (errorMsg) setErrorMsg("");
            }}
            disabled={isLoading || timeLeft <= 0}
            autoFocus
            fullWidth
          />
        </div>

        <Button
          type="submit"
          fullWidth
          loading={isLoading}
          loadingText="Verifying code…"
          disabled={verificationCode.length !== 6 || timeLeft <= 0}
        >
          Verify Code <ArrowRight className="w-4 h-4" />
        </Button>
      </form>

      {/* Secondary actions */}
      <div className="flex flex-col items-center gap-3 pt-1">
        <button
          type="button"
          disabled={resendTimer > 0}
          onClick={handleResendCode}
          className="text-xs text-primary-600 font-semibold hover:underline disabled:opacity-40 disabled:no-underline transition-opacity"
        >
          {resendTimer > 0 ? `Resend Code in ${resendTimer}s` : "Resend Code"}
        </button>

        <Link
          href="/forgot-password"
          className="text-xs text-neutral-500 hover:underline"
        >
          <span className="inline-flex items-center gap-1">
            <ArrowLeft className="w-3 h-3" />
            Change Email
          </span>
        </Link>
      </div>
    </div>
  );
}

export default function ForgotPasswordVerifyPage() {
  return (
    <AuthShell
      quote="A small step forward is still a step in the right direction."
      author="JobFits Team"
    >
      {/* Suspense required because useSearchParams() suspends during SSR */}
      <Suspense fallback={<div className="h-64 animate-pulse rounded-lg bg-neutral-100" />}>
        <VerifyContent />
      </Suspense>
    </AuthShell>
  );
}
