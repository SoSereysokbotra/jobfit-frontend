"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { OtpInput } from "@/features/auth/components";
import { authApi } from "@/features/auth/api/auth.api";
import { useAuth } from "@/providers/auth-provider";
import { ApiError } from "@/lib/api/client";
import { Alert } from "@/shared/components/feedback/alert";
import { Button } from "@/shared/components/ui/button";

/** Mirrors VERIFICATION_CODE_TTL_MINUTES on the backend. */
const CODE_TTL_SECONDS = 15 * 60;
const RESEND_COOLDOWN_SECONDS = 30;

// Mail client definitions
const MAIL_CLIENTS = [
  {
    id: "outlook",
    label: "Outlook",
    url: "https://outlook.live.com",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <rect x="2" y="3" width="20" height="18" rx="2" />
        <path d="M9 3v18" />
        <path d="M2 8h7" />
        <path d="M2 13h7" />
        <path d="M14 10l3 3-3 3" />
      </svg>
    ),
  },
  {
    id: "gmail",
    label: "Gmail",
    url: "https://mail.google.com",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <polyline points="2,7 12,14 22,7" />
      </svg>
    ),
  },
  {
    id: "mail",
    label: "Mail",
    url: "mailto:",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <polygon points="12 2 2 7 12 12 22 7 12 2" />
        <polyline points="2 17 12 22 22 17" />
        <polyline points="2 12 12 17 22 12" />
      </svg>
    ),
  },
];

function VerifyEmailContent() {
  const router = useRouter();
  const { setAccessToken } = useAuth();
  const searchParams = useSearchParams();
  // The email is passed by signup/login purely to display + power "resend" (the
  // request body needs it). Verification identity itself rides the httpOnly
  // registration_verification cookie the browser already holds.
  const email = searchParams.get("email") ?? "";

  const [code, setCode] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [timeLeft, setTimeLeft] = useState(CODE_TTL_SECONDS);
  const [resendTimer, setResendTimer] = useState(RESEND_COOLDOWN_SECONDS);
  const [redirectCountdown, setRedirectCountdown] = useState(3);

  // Code expiry countdown
  useEffect(() => {
    if (isVerified || timeLeft <= 0) return;
    const t = setInterval(() => setTimeLeft((p) => p - 1), 1000);
    return () => clearInterval(t);
  }, [isVerified, timeLeft]);

  // Resend cooldown
  useEffect(() => {
    if (isVerified || resendTimer <= 0) return;
    const t = setInterval(() => setResendTimer((p) => p - 1), 1000);
    return () => clearInterval(t);
  }, [isVerified, resendTimer]);

  // Success redirect
  useEffect(() => {
    if (!isVerified) return;
    if (redirectCountdown <= 0) {
      router.push("/onboarding/resume");
      return;
    }
    const t = setInterval(() => setRedirectCountdown((p) => p - 1), 1000);
    return () => clearInterval(t);
  }, [isVerified, redirectCountdown, router]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const toMessage = (error: unknown, fallback: string) =>
    error instanceof ApiError ? error.messages.join(" ") : fallback;

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setErrorMsg("");
    try {
      // On success the backend auto-logs-in: adopt the access token (and the
      // refresh cookie it just set) so onboarding's authenticated calls work.
      const { accessToken } = await authApi.verifyEmail(code);
      setAccessToken(accessToken);
      setIsVerified(true);
    } catch (error) {
      // 409 = already verified. There's no session to issue here, so send them
      // to log in rather than to onboarding (which would 401 without a token).
      if (error instanceof ApiError && error.statusCode === 409) {
        router.push(`/login${email ? `?email=${encodeURIComponent(email)}` : ""}`);
        return;
      }
      setErrorMsg(toMessage(error, "Could not verify that code. Please try again."));
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!email || resendTimer > 0) return;
    setResendTimer(RESEND_COOLDOWN_SECONDS);
    setErrorMsg("");
    try {
      await authApi.resendEmailVerification(email);
      setTimeLeft(CODE_TTL_SECONDS);
      setCode("");
    } catch (error) {
      setErrorMsg(toMessage(error, "Could not resend the code. Please try again."));
    }
  };

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center p-6 font-sans"
      style={{
        background: "linear-gradient(135deg, var(--color-primary-900) 0%, var(--color-primary-800) 40%, var(--color-primary-700) 100%)",
      }}
    >
      {/* Decorative blobs matching onboarding page */}
      <div className="fixed top-0 right-0 w-96 h-96 rounded-full opacity-10 pointer-events-none" style={{ background: "var(--color-primary-400)", filter: "blur(100px)" }} />
      <div className="fixed bottom-0 left-0 w-72 h-72 rounded-full opacity-10 pointer-events-none" style={{ background: "var(--color-primary-300)", filter: "blur(80px)" }} />

      {/* Logo at top */}
      <div className="relative z-10 flex flex-col items-center mb-8">
        <img
            src="/logo.png"
            alt="JobFits Logo"
            className="w-14 h-14 rounded-full object-cover shadow-lg mb-3 hover:scale-105 transition-transform duration-300"
          />
        <span className="text-lg font-extrabold text-white tracking-tight">JobFits</span>
      </div>

      {/* Card */}
      <div
        className="relative z-10 w-full max-w-md rounded-2xl overflow-hidden animate-fade-in"
        style={{ background: "var(--color-card)", boxShadow: "0 25px 50px rgba(0,0,0,0.3)" }}
      >
        <div className="p-8 sm:p-10">

          {isVerified ? (
            /* ── SUCCESS STATE ── */
            <div className="space-y-5 text-center py-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-success-50 border border-success-100 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-success-600 animate-bounce" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
                  Email Verified!
                </h1>
                <p className="text-sm text-neutral-500 mt-1">
                  Your account is ready. Let&apos;s set up your profile.
                </p>
              </div>
              <Button fullWidth onClick={() => router.push("/onboarding/resume")}>
                Continue to Onboarding <ArrowRight className="w-4 h-4" />
              </Button>
              <p className="text-xs text-neutral-400">
                Redirecting automatically in {redirectCountdown}s…
              </p>
            </div>

          ) : (
            /* ── DEFAULT: ENTER YOUR CODE ── */
            <div className="space-y-6">

              {/* Title block */}
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
                  Check your inbox
                </h1>
                <p className="text-sm text-neutral-500 leading-relaxed">
                  We&apos;ve sent a 6-digit code to{" "}
                  <span className="font-semibold text-neutral-900 break-all">
                    {email || "your email address"}
                  </span>
                  .<br />
                  Enter it below to confirm your address.
                </p>
              </div>

              {errorMsg && <Alert variant="error">{errorMsg}</Alert>}

              {/* Code entry */}
              <form className="space-y-4" onSubmit={handleVerify}>
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                      Verification Code
                    </label>
                    <span className={`text-xs font-medium ${timeLeft <= 0 ? "text-error-600" : "text-neutral-500"}`}>
                      {timeLeft > 0 ? `Expires in ${formatTime(timeLeft)}` : "Code expired"}
                    </span>
                  </div>
                  <OtpInput
                    value={code}
                    onChange={(v) => { setCode(v); if (errorMsg) setErrorMsg(""); }}
                    disabled={isVerifying || timeLeft <= 0}
                    autoFocus
                    fullWidth
                  />
                </div>

                <Button
                  type="submit"
                  fullWidth
                  loading={isVerifying}
                  loadingText="Verifying…"
                  disabled={code.length !== 6 || timeLeft <= 0}
                >
                  Verify Email <ArrowRight className="w-4 h-4" />
                </Button>
              </form>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-neutral-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-3 text-neutral-400 tracking-wider">
                    Open your email app
                  </span>
                </div>
              </div>

              {/* Mail Client Cards */}
              <div className="grid grid-cols-3 gap-3">
                {MAIL_CLIENTS.map((client) => (
                  <button
                    key={client.id}
                    type="button"
                    onClick={() => window.open(client.url, "_blank", "noopener,noreferrer")}
                    className="group flex flex-col items-center gap-2 p-4 rounded-lg border border-neutral-200 bg-white hover:border-primary-300 hover:bg-primary-50 transition-all duration-200 active:scale-[0.97]"
                  >
                    <span className="text-neutral-500 group-hover:text-primary-700 transition-colors duration-200">
                      {client.icon}
                    </span>
                    <span className="text-xs font-medium text-neutral-600 group-hover:text-primary-700 transition-colors duration-200">
                      {client.label}
                    </span>
                  </button>
                ))}
              </div>

              {/* Divider */}
              <div className="w-full border-t border-neutral-200" />

              {/* Help text */}
              <div className="space-y-1 text-center">
                <p className="text-sm text-neutral-500">
                  Can&apos;t see the e-mail? Please check the spam folder.
                </p>
                <p className="text-sm text-neutral-500">
                  <button
                    type="button"
                    disabled={!email || resendTimer > 0}
                    onClick={handleResend}
                    className="font-semibold text-primary-600 hover:underline disabled:opacity-40 disabled:no-underline disabled:cursor-not-allowed"
                  >
                    {resendTimer > 0 ? `Resend code in ${resendTimer}s` : "Resend code"}
                  </button>
                </p>
                <p className="text-sm text-neutral-500">
                  Wrong e-mail?{" "}
                  <Link href="/signup" className="font-semibold text-primary-600 hover:underline">
                    Please re-enter your address.
                  </Link>
                </p>
              </div>

            </div>
          )}

        </div>
      </div>

      {/* Footer note */}
      <p className="relative z-10 text-center text-xs text-white/40 mt-6">
        Your data is secure and encrypted. JobFits never sells your information.
      </p>
    </div>
  );
}

// Suspense required for useSearchParams() in Next.js 15
export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div
        className="min-h-screen w-full flex items-center justify-center"
        style={{ background: "linear-gradient(135deg, var(--color-primary-900) 0%, var(--color-primary-800) 40%, var(--color-primary-700) 100%)" }}
      >
        <div className="w-10 h-10 rounded-full border-4 border-white/30 border-t-white animate-spin" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
