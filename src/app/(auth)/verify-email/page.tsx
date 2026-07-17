"use client";

import React, { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, ArrowLeft, RefreshCw, Mail } from "lucide-react";
import { AuthShell, AuthHeading, OtpInput } from "@/features/auth/components";
import { authApi } from "@/features/auth/api/auth.api";
import { ApiError } from "@/lib/api/client";
import { Alert } from "@/shared/components/feedback/alert";
import { Button } from "@/shared/components/ui/button";

/** Mirrors VERIFICATION_CODE_TTL_MINUTES on the backend. */
const CODE_TTL_SECONDS = 15 * 60;
const RESEND_COOLDOWN_SECONDS = 30;

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // The email lives in an httpOnly cookie the browser holds but JS cannot read,
  // so signup passes it through the URL purely so "resend" has a body to send.
  const email = searchParams.get("email") ?? "";

  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isExpired, setIsExpired] = useState(false);

  const [timeLeft, setTimeLeft] = useState(CODE_TTL_SECONDS);
  const [resendTimer, setResendTimer] = useState(RESEND_COOLDOWN_SECONDS);
  const [redirectCountdown, setRedirectCountdown] = useState(2);

  // Code expiry countdown
  useEffect(() => {
    if (isVerified || timeLeft <= 0) return;
    const t = setInterval(() => setTimeLeft((p) => p - 1), 1000);
    return () => clearInterval(t);
  }, [isVerified, timeLeft]);

  // Resend cooldown
  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setInterval(() => setResendTimer((p) => p - 1), 1000);
    return () => clearInterval(t);
  }, [resendTimer]);

  // Auto-redirect after success
  useEffect(() => {
    if (!isVerified) return;
    if (redirectCountdown <= 0) {
      router.push("/onboarding/resume");
      return;
    }
    const t = setInterval(() => setRedirectCountdown((p) => p - 1), 1000);
    return () => clearInterval(t);
  }, [isVerified, redirectCountdown, router]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      await authApi.verifyEmail(code);
      setIsVerified(true);
    } catch (error) {
      const err = error as ApiError;
      if (err instanceof ApiError && err.code === "CODE_EXPIRED") setIsExpired(true);
      setErrorMsg(
        err instanceof ApiError
          ? err.messages.join(" ")
          : "Something went wrong. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = useCallback(async () => {
    if (!email) return;
    setResendTimer(RESEND_COOLDOWN_SECONDS);
    setErrorMsg("");
    try {
      await authApi.resendEmailVerification(email);
      setTimeLeft(CODE_TTL_SECONDS);
      setIsExpired(false);
      setCode("");
    } catch (error) {
      const err = error as ApiError;
      setErrorMsg(err instanceof ApiError ? err.message : "Could not resend the code.");
    }
  }, [email]);

  const expired = isExpired || timeLeft <= 0;

  return (
    <AuthShell
      quote="Your inbox is the gateway to your next big opportunity."
      author="JobFits Team"
    >
      {isVerified ? (
        /* SUCCESS STATE */
        <div className="space-y-6 text-center">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-success-100 flex items-center justify-center border border-success-100">
              <CheckCircle2 className="w-8 h-8 text-success-600 animate-bounce" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-neutral-900">Email Verified!</h2>
            <p className="text-sm text-neutral-500 mt-2">
              Your account is ready. Let&apos;s set up your profile.
            </p>
          </div>
          <div className="pt-2">
            <Button fullWidth onClick={() => router.push("/onboarding/resume")}>
              Continue to Onboarding
            </Button>
            <p className="text-xs text-neutral-400 mt-3">Redirecting in {redirectCountdown}s…</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <AuthHeading
            icon={<Mail className="w-6 h-6 text-primary-700" />}
            title="Verify Your Email"
            subtitle={
              email ? (
                <>
                  Enter the 6-digit code sent to{" "}
                  <strong className="text-neutral-900">{email}</strong>
                </>
              ) : (
                "Enter the 6-digit code sent to your email address"
              )
            }
          />

          {errorMsg && <Alert variant="error">{errorMsg}</Alert>}

          <form className="space-y-4" onSubmit={handleVerify}>
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                  Verification Code
                </label>
                <span
                  className={`text-xs font-medium ${expired ? "text-error-600" : "text-neutral-500"}`}
                >
                  {expired ? "Code expired" : `Expires in ${formatTime(timeLeft)}`}
                </span>
              </div>
              <OtpInput
                value={code}
                onChange={(v) => {
                  setCode(v);
                  if (errorMsg) setErrorMsg("");
                }}
                disabled={expired || isLoading}
                autoFocus
                fullWidth
              />
            </div>

            <Button
              type="submit"
              fullWidth
              loading={isLoading}
              loadingText="Verifying…"
              disabled={code.length !== 6 || expired}
            >
              Verify Code
            </Button>
          </form>

          <div className="flex flex-col items-center gap-3 pt-2">
            {email ? (
              <button
                type="button"
                disabled={resendTimer > 0}
                onClick={handleResend}
                className="inline-flex items-center gap-1.5 text-xs text-primary-600 font-semibold hover:underline disabled:opacity-40 disabled:no-underline"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                {resendTimer > 0 ? `Resend Code in ${resendTimer}s` : "Resend Code"}
              </button>
            ) : (
              // Without the email we cannot call resend — send them back rather
              // than showing a button that can only fail.
              <p className="text-xs text-neutral-500">
                Need a new code?{" "}
                <Link href="/signup" className="text-primary-600 font-semibold hover:underline">
                  Start over
                </Link>
              </p>
            )}

            <Link
              href="/signup"
              className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Change email address
            </Link>
          </div>
        </div>
      )}
    </AuthShell>
  );
}

export default function VerifyEmailPage() {
  // useSearchParams needs a Suspense boundary to prerender.
  return (
    <Suspense fallback={null}>
      <VerifyEmailContent />
    </Suspense>
  );
}
