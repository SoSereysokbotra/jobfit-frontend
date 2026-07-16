"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, ArrowLeft, RefreshCw, Mail } from "lucide-react";
import { AuthShell, AuthHeading, OtpInput } from "@/features/auth/components";
import { Alert } from "@/shared/components/feedback/alert";
import { Button } from "@/shared/components/ui/button";

export default function VerifyEmailPage() {
  const router = useRouter();

  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [isLocked, setIsLocked] = useState(false);

  // 10-minute expiry timer
  const [timeLeft, setTimeLeft] = useState(600);

  // Resend button cooldown
  const [resendTimer, setResendTimer] = useState(30);
  const [resendDisabled, setResendDisabled] = useState(true);

  // Redirect countdown after success
  const [redirectCountdown, setRedirectCountdown] = useState(2);

  // Code expiry countdown
  useEffect(() => {
    if (isVerified || isLocked) return;
    if (timeLeft <= 0) return;
    const t = setInterval(() => setTimeLeft((p) => p - 1), 1000);
    return () => clearInterval(t);
  }, [isVerified, isLocked, timeLeft]);

  // Resend cooldown
  useEffect(() => {
    if (resendTimer <= 0) { setResendDisabled(false); return; }
    const t = setInterval(() => setResendTimer((p) => p - 1), 1000);
    return () => clearInterval(t);
  }, [resendTimer]);

  // Auto-redirect after success
  useEffect(() => {
    if (!isVerified) return;
    if (redirectCountdown <= 0) { router.push("/onboarding/resume"); return; }
    const t = setInterval(() => setRedirectCountdown((p) => p - 1), 1000);
    return () => clearInterval(t);
  }, [isVerified, redirectCountdown, router]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (timeLeft <= 0) {
      setErrorMsg("Code expired. Please request a new code.");
      return;
    }
    setIsLoading(true);
    setErrorMsg("");

    setTimeout(() => {
      setIsLoading(false);
      // Demo: correct code is 123456
      if (code === "123456") {
        setIsVerified(true);
      } else {
        const nextAttempts = attemptsLeft - 1;
        setAttemptsLeft(nextAttempts);
        if (nextAttempts <= 0) {
          setIsLocked(true);
          setErrorMsg("Too many incorrect attempts. Request a new code.");
        } else {
          setErrorMsg(`Incorrect code. ${nextAttempts} attempt${nextAttempts === 1 ? "" : "s"} remaining.`);
        }
      }
    }, 1200);
  };

  const handleResend = () => {
    setResendTimer(30);
    setResendDisabled(true);
    setTimeLeft(600);
    setCode("");
    setErrorMsg("");
    setAttemptsLeft(3);
    setIsLocked(false);
    alert("Demo System: A new verification code '123456' has been resent!");
  };

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
            subtitle="Enter the 6-digit code sent to your email address"
          />
          <p className="text-xs text-primary-800 bg-primary-50 p-2 border border-primary-100 rounded-md">
            Demo code: <strong className="font-bold">123456</strong>
          </p>

          {errorMsg && <Alert variant="error">{errorMsg}</Alert>}

          <form className="space-y-4" onSubmit={handleVerify}>
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                  Verification Code
                </label>
                <span className={`text-xs font-medium ${timeLeft < 60 ? "text-error-600" : "text-neutral-500"}`}>
                  {timeLeft > 0 ? `Expires in ${formatTime(timeLeft)}` : "Code expired"}
                </span>
              </div>
              <OtpInput
                value={code}
                onChange={(v) => { setCode(v); if (errorMsg) setErrorMsg(""); }}
                disabled={isLocked || timeLeft <= 0 || isLoading}
                autoFocus
                fullWidth
              />
            </div>

            <Button
              type="submit"
              fullWidth
              loading={isLoading}
              loadingText="Verifying…"
              disabled={code.length !== 6 || isLocked || timeLeft <= 0}
            >
              Verify Code
            </Button>
          </form>

          <div className="flex flex-col items-center gap-3 pt-2">
            <button
              type="button"
              disabled={resendDisabled}
              onClick={handleResend}
              className="inline-flex items-center gap-1.5 text-xs text-primary-600 font-semibold hover:underline disabled:opacity-40 disabled:no-underline"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              {resendDisabled ? `Resend Code in ${resendTimer}s` : "Resend Code"}
            </button>

            <Link href="/signup" className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:underline">
              <ArrowLeft className="w-3.5 h-3.5" />
              Change email address
            </Link>
          </div>
        </div>
      )}
    </AuthShell>
  );
}
