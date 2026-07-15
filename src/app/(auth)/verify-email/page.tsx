"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowLeft,
  RefreshCw,
  Mail,
} from "lucide-react";

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
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-white font-sans overflow-hidden">

      {/* LEFT — BRANDING */}
      <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col items-center justify-center text-center text-white relative min-h-screen" style={{ background: "linear-gradient(135deg, var(--color-primary-900), var(--color-primary-800), var(--color-primary-700))" }}>

        <div className="relative z-10 flex flex-col items-center max-w-sm">
          <img
            src="/logo.png"
            alt="JobFits Logo"
            className="w-32 h-32 rounded-full border-2 border-white/20 shadow-2xl bg-white/5 backdrop-blur-sm p-4 object-contain hover:scale-105 transition-transform duration-300"
          />
          <h1 className="text-3xl font-extrabold tracking-tight text-white mt-6">JobFits</h1>
          <p className="text-sm text-primary-200 mt-2">Discover your perfect career matches</p>

          <div className="w-16 h-0.5 bg-primary-500/30 my-8 rounded" />

          <blockquote className="space-y-2">
            <p className="text-base italic text-primary-100 font-medium leading-relaxed">
              "Your inbox is the gateway to your next big opportunity."
            </p>
            <cite className="block text-xs font-semibold text-primary-300 not-italic uppercase tracking-wider">
              — JobFits Team
            </cite>
          </blockquote>
        </div>
      </div>

      {/* RIGHT — FORM */}
      <div className="w-full md:w-1/2 bg-white flex flex-col justify-center items-center p-8 sm:p-12 md:p-16 min-h-screen">
        <div className="w-full max-w-md space-y-6">

          {/* SUCCESS STATE */}
          {isVerified ? (
            <div className="space-y-6 text-center">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center border border-green-200">
                  <CheckCircle2 className="w-8 h-8 text-green-600 animate-bounce" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-neutral-900">Email Verified!</h2>
                <p className="text-sm text-neutral-500 mt-2">
                  Your account is ready. Let&apos;s set up your profile.
                </p>
              </div>
              <div className="pt-2">
                <button
                  onClick={() => router.push("/onboarding/resume")}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-5 rounded-md text-sm text-white font-semibold transition-all duration-200"
                style={{ background: "var(--color-primary-600)" }}
                >
                  Continue to Onboarding
                </button>
                <p className="text-xs text-neutral-400 mt-3">Redirecting in {redirectCountdown}s…</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary-50 border border-primary-100 mb-4">
                  <Mail className="w-6 h-6 text-primary-700" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-neutral-900">Verify Your Email</h2>
                <p className="text-sm text-neutral-500 mt-1">
                  Enter the 6-digit code sent to your email address
                </p>
                <p className="text-xs text-primary-800 bg-primary-50 p-2 border border-primary-100 rounded-md mt-3">
                  Demo code: <strong className="font-bold">123456</strong>
                </p>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-md border text-xs flex items-center gap-2" style={{ background: "var(--color-error-50)", borderColor: "var(--color-error-100)", color: "var(--color-error-600)" }}>
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form className="space-y-4" onSubmit={handleVerify}>
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                      Verification Code
                    </label>
                    <span className={`text-xs font-medium ${timeLeft < 60 ? "text-red-600" : "text-neutral-500"}`}>
                      {timeLeft > 0 ? `Expires in ${formatTime(timeLeft)}` : "Code expired"}
                    </span>
                  </div>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    maxLength={6}
                    placeholder="• • • • • •"
                    value={code}
                    disabled={isLocked || timeLeft <= 0}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                    className="block w-full px-4 py-3 border border-neutral-200 bg-white rounded-md text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-center tracking-widest font-mono text-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading || code.length !== 6 || isLocked || timeLeft <= 0}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-5 rounded-md text-sm text-white font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: "var(--color-primary-600)" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--color-primary-700)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "var(--color-primary-600)")} 
                >
                  {isLoading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /><span>Verifying…</span></>
                  ) : (
                    <span>Verify Code</span>
                  )}
                </button>
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

        </div>
      </div>
    </div>
  );
}
