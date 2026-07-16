"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, ArrowRight, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";
import {
  AuthShell,
  AuthHeading,
  TextField,
  OtpInput,
  PasswordStrengthMeter,
  getPasswordStrength,
} from "@/features/auth/components";
import { Alert } from "@/shared/components/feedback/alert";
import { Button } from "@/shared/components/ui/button";

export default function ForgotPasswordPage() {
  const router = useRouter();

  // Wizard steps: 1 = Email, 2 = Code, 3 = New Password, 4 = Success
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form fields
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Code expiry timer (Step 2)
  const [timeLeft, setTimeLeft] = useState(600);
  const [resendDisabled, setResendDisabled] = useState(true);
  const [resendTimer, setResendTimer] = useState(30);
  const [attemptsRemaining, setAttemptsRemaining] = useState(3);

  // Step 4 auto-redirect
  const [redirectCountdown, setRedirectCountdown] = useState(3);

  const strength = getPasswordStrength(password);

  // Code expiry countdown
  useEffect(() => {
    if (step !== 2 || timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((p) => p - 1), 1000);
    return () => clearInterval(timer);
  }, [step, timeLeft]);

  // Resend cooldown
  useEffect(() => {
    if (step !== 2) return;
    if (resendTimer <= 0) { setResendDisabled(false); return; }
    const timer = setInterval(() => setResendTimer((p) => p - 1), 1000);
    return () => clearInterval(timer);
  }, [step, resendTimer]);

  // Success redirect
  useEffect(() => {
    if (step !== 4) return;
    const timer = setInterval(() => {
      setRedirectCountdown((prev) => {
        if (prev <= 1) { clearInterval(timer); router.push("/login"); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [step, router]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // STEP 1: Send code
  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");
    setTimeout(() => {
      setIsLoading(false);
      setTimeLeft(600);
      setResendTimer(30);
      setResendDisabled(true);
      setStep(2);
      alert("Demo System: A reset code '654321' has been simulated to your inbox!");
    }, 1200);
  };

  // STEP 2: Verify code
  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");
    setTimeout(() => {
      setIsLoading(false);
      if (timeLeft <= 0) {
        setErrorMsg("Code expired. Please request a new code below.");
        return;
      }
      if (verificationCode === "654321") {
        setStep(3);
      } else {
        const nextAttempts = attemptsRemaining - 1;
        setAttemptsRemaining(nextAttempts);
        if (nextAttempts <= 0) {
          setErrorMsg("Too many incorrect attempts. Request a new code.");
          setStep(1);
          setAttemptsRemaining(3);
          setVerificationCode("");
        } else {
          setErrorMsg(`Incorrect code. ${nextAttempts} attempts remaining.`);
        }
      }
    }, 1200);
  };

  // STEP 3: Reset password
  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");
    setTimeout(() => {
      setIsLoading(false);
      if (password !== confirmPassword) {
        setErrorMsg("Passwords do not match.");
        return;
      }
      setStep(4);
    }, 1200);
  };

  const handleResendCode = () => {
    setResendTimer(30);
    setResendDisabled(true);
    setTimeLeft(600);
    setVerificationCode("");
    setErrorMsg("");
    alert("Demo System: A new reset code '654321' has been resent!");
  };

  return (
    <AuthShell
      quote="Opportunities don't happen, you create them. Reset your password to resume your journey."
      author="Chris Grosser"
    >
      {/* STEP 1: EMAIL ENTRY */}
      {step === 1 && (
        <div className="space-y-6 animate-fade-in">
          <AuthHeading
            title="Reset Your Password"
            subtitle="Enter your email to receive a verification code"
          />

          {errorMsg && <Alert variant="error">{errorMsg}</Alert>}

          <form className="space-y-4" onSubmit={handleSendCode}>
            <TextField
              label="Email Address"
              icon={Mail}
              type="email"
              required
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Button type="submit" fullWidth loading={isLoading} loadingText="Requesting code..." disabled={!email}>
              Send Code <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <div className="text-center pt-2">
            <Link href="/login" className="inline-flex items-center gap-1.5 text-xs text-primary-600 font-semibold hover:underline">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Login</span>
            </Link>
          </div>
        </div>
      )}

      {/* STEP 2: CODE ENTRY */}
      {step === 2 && (
        <div className="space-y-6 animate-fade-in">
          <AuthHeading
            title="Verify Your Email"
            subtitle={<>Enter the 6-digit code sent to <strong className="text-neutral-900">{email || "your email"}</strong></>}
          />
          <p className="text-xs text-primary-800 bg-primary-50 p-2 border border-primary-100 rounded-md">
            Demo code: <strong className="font-bold">654321</strong>
          </p>

          {errorMsg && <Alert variant="error">{errorMsg}</Alert>}

          <form className="space-y-4" onSubmit={handleVerifyCode}>
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
                value={verificationCode}
                onChange={(v) => { setVerificationCode(v); if (errorMsg) setErrorMsg(""); }}
                disabled={isLoading || timeLeft <= 0}
                autoFocus
                fullWidth
              />
            </div>

            <Button
              type="submit"
              fullWidth
              loading={isLoading}
              loadingText="Verifying code..."
              disabled={verificationCode.length !== 6 || timeLeft <= 0}
            >
              Verify Code <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <div className="flex flex-col items-center gap-3 pt-2">
            <button
              type="button"
              disabled={resendDisabled}
              onClick={handleResendCode}
              className="text-xs text-primary-600 font-semibold hover:underline disabled:opacity-40 disabled:no-underline"
            >
              {resendDisabled ? `Resend Code in ${resendTimer}s` : "Resend Code"}
            </button>

            <button
              type="button"
              onClick={() => { setStep(1); setVerificationCode(""); setErrorMsg(""); }}
              className="text-xs text-neutral-500 hover:underline"
            >
              Change Email
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: NEW PASSWORD */}
      {step === 3 && (
        <div className="space-y-6 animate-fade-in">
          <AuthHeading
            title="Create New Password"
            subtitle="Enter a strong password for your account"
          />

          {errorMsg && <Alert variant="error">{errorMsg}</Alert>}

          <form className="space-y-4" onSubmit={handleResetPassword}>
            <div>
              <TextField
                label="New Password"
                icon={Lock}
                passwordToggle
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <PasswordStrengthMeter password={password} />
            </div>

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
              {confirmPassword && password !== confirmPassword && (
                <p className="mt-1 text-xs text-error-500 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> Passwords do not match
                </p>
              )}
            </div>

            <Button
              type="submit"
              fullWidth
              loading={isLoading}
              loadingText="Resetting password..."
              disabled={!password || password !== confirmPassword || strength.label === "Weak"}
            >
              Reset Password
            </Button>
          </form>
        </div>
      )}

      {/* STEP 4: SUCCESS */}
      {step === 4 && (
        <div className="space-y-6 text-center animate-fade-in">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-success-100 flex items-center justify-center border border-success-100">
              <CheckCircle2 className="w-8 h-8 text-success-600 animate-bounce" />
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold tracking-tight text-neutral-900">Password Reset Successful!</h2>
            <p className="text-sm text-neutral-500 mt-2">
              Your password has been updated. You can now log in.
            </p>
          </div>

          <div className="pt-2">
            <Link
              href="/login"
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-5 rounded-md text-sm text-white font-semibold transition-all duration-200 bg-primary-600 hover:bg-primary-700"
            >
              <span>Go to Login</span>
            </Link>
            <p className="text-xs text-neutral-400 mt-3">Redirecting automatically in {redirectCountdown}s...</p>
          </div>
        </div>
      )}
    </AuthShell>
  );
}
