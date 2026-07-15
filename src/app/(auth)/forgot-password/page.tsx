"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Mail,
  Lock,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowLeft,
  Key,
} from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();

  // Wizard Steps: 1 = Email Entry, 2 = Code Entry, 3 = New Password, 4 = Success
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form Fields
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // UI States
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Code Expiry Timer (Step 2)
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [resendDisabled, setResendDisabled] = useState(true);
  const [resendTimer, setResendTimer] = useState(30);

  // Attempt Tracking
  const [attemptsRemaining, setAttemptsRemaining] = useState(3);

  // Countdown timer for Step 2 (Code Expiry)
  useEffect(() => {
    if (step !== 2) return;
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [step, timeLeft]);

  // Resend code countdown timer
  useEffect(() => {
    if (step !== 2) return;
    if (resendTimer <= 0) {
      setResendDisabled(false);
      return;
    }

    const timer = setInterval(() => {
      setResendTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [step, resendTimer]);

  // Step 4 Auto-redirect countdown
  const [redirectCountdown, setRedirectCountdown] = useState(3);
  useEffect(() => {
    if (step !== 4) return;

    const timer = setInterval(() => {
      setRedirectCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push("/login");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [step, router]);

  // Format seconds to MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Password strength calculation
  const getPasswordStrength = () => {
    if (!password) return { label: "", color: "bg-neutral-200", width: "w-0" };
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    switch (score) {
      case 1:
        return { label: "Weak", color: "bg-red-500", width: "w-1/4" };
      case 2:
        return { label: "Fair", color: "bg-yellow-500", width: "w-2/4" };
      case 3:
        return { label: "Good", color: "bg-purple-400", width: "w-3/4" };
      case 4:
        return { label: "Strong", color: "bg-green-500", width: "w-full" };
      default:
        return { label: "Weak", color: "bg-red-500", width: "w-1/4" };
    }
  };

  const strength = getPasswordStrength();

  // STEP 1 Submission: Send Code
  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    setTimeout(() => {
      setIsLoading(false);
      // Simulate code sent
      setTimeLeft(600);
      setResendTimer(30);
      setResendDisabled(true);
      setStep(2);
      alert("Demo System: A reset code '654321' has been simulated to your inbox!");
    }, 1200);
  };

  // STEP 2 Submission: Verify Code
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

      // Simulated code validation (expects 654321)
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

  // STEP 3 Submission: Reset Password
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

  // Resend code logic
  const handleResendCode = () => {
    setResendTimer(30);
    setResendDisabled(true);
    setTimeLeft(600);
    setVerificationCode("");
    setErrorMsg("");
    alert("Demo System: A new reset code '654321' has been resent!");
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-white font-sans overflow-hidden">
      
      {/* LEFT PANEL - LOGO / BRANDING */}
      <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col items-center justify-center text-center text-white relative min-h-screen" style={{ background: "linear-gradient(135deg, var(--color-primary-900), var(--color-primary-800), var(--color-primary-700))" }}>
        
        <div className="relative z-10 flex flex-col items-center max-w-sm">
          <img
            src="/logo.png"
            alt="JobFits Logo"
            className="w-32 h-32 rounded-full border-2 border-white/20 shadow-2xl bg-white/5 backdrop-blur-sm p-4 object-contain hover:scale-105 transition-transform duration-300"
          />
          <h1 className="text-3xl font-extrabold tracking-tight text-white mt-6">
            JobFits
          </h1>
          <p className="text-sm text-primary-200 mt-2">
            Discover your perfect career matches
          </p>
          
          <div className="w-16 h-0.5 bg-primary-500/30 my-8 rounded" />
          
          <blockquote className="space-y-2">
            <p className="text-base italic text-primary-100 font-medium leading-relaxed">
              "Opportunities don't happen, you create them. Reset your password to resume your journey."
            </p>
            <cite className="block text-xs font-semibold text-primary-300 not-italic uppercase tracking-wider">
              — Chris Grosser
            </cite>
          </blockquote>
        </div>
      </div>

      {/* RIGHT PANEL - STEP FORM CONTROLLER */}
      <div className="w-full md:w-1/2 bg-white flex flex-col justify-center items-center p-8 sm:p-12 md:p-16 min-h-screen">
        <div className="w-full max-w-md space-y-6">
          
          {/* STEP 1: EMAIL ENTRY */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
                  Reset Your Password
                </h2>
                <p className="text-sm text-neutral-500 mt-1">
                  Enter your email to receive a verification code
                </p>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-md border text-xs flex items-center gap-2" style={{ background: "var(--color-error-50)", borderColor: "var(--color-error-100)", color: "var(--color-error-600)" }}>
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form className="space-y-4" onSubmit={handleSendCode}>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-neutral-400" />
                    </div>
                    <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-10 pr-3 py-2.5 border border-neutral-200 bg-white rounded-md text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm transition-all duration-200"
              />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !email}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-5 rounded-md text-sm text-white font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: "var(--color-primary-600)" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--color-primary-700)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "var(--color-primary-600)")} 
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Requesting code...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Code</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
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
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
                  Verify Your Email
                </h2>
                <p className="text-sm text-neutral-500 mt-1">
                  Enter the 6-digit code sent to <strong className="text-neutral-900">{email || "your email"}</strong>
                </p>
                <p className="text-xs text-primary-800 bg-primary-50 p-2 border border-primary-100 rounded-md mt-3">
                Demo code: <strong className="font-bold">654321</strong>
              </p>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-md border text-xs flex items-center gap-2" style={{ background: "var(--color-error-50)", borderColor: "var(--color-error-100)", color: "var(--color-error-600)" }}>
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form className="space-y-4" onSubmit={handleVerifyCode}>
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                      Verification Code
                    </label>
                    <span className="text-xs text-red-600 font-medium">
                      Expires in {formatTime(timeLeft)}
                    </span>
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="• • • • • •"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
                    className="block w-full px-4 py-2.5 border border-neutral-200 bg-white rounded-md text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm transition-all duration-200 text-center tracking-widest font-mono"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading || verificationCode.length !== 6}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-5 rounded-md text-sm text-white font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: "var(--color-primary-600)" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--color-primary-700)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "var(--color-primary-600)")} 
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying code...</span>
                    </>
                  ) : (
                    <>
                      <span>Verify Code</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
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
                  onClick={() => {
                    setStep(1);
                    setVerificationCode("");
                    setErrorMsg("");
                  }}
                  className="text-xs text-neutral-500 hover:underline"
                >
                  Change Email
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: CREATE NEW PASSWORD */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
                  Create New Password
                </h2>
                <p className="text-sm text-neutral-500 mt-1">
                  Enter a strong password for your account
                </p>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-md border text-xs flex items-center gap-2" style={{ background: "var(--color-error-50)", borderColor: "var(--color-error-100)", color: "var(--color-error-600)" }}>
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form className="space-y-4" onSubmit={handleResetPassword}>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                    New Password
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-neutral-400" />
                    </div>
                    <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-10 py-2.5 border border-neutral-200 bg-white rounded-md text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm transition-all duration-200"
                  />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>

                  {/* Password strength bar */}
                  {password && (
                    <div className="mt-2 space-y-1">
                      <div className="h-1 w-full bg-neutral-200 rounded-full overflow-hidden">
                        <div className={`h-full ${strength.color} ${strength.width} transition-all duration-300`} />
                      </div>
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-neutral-500">Strength: {strength.label}</span>
                        <span className="text-neutral-400">Min 8 chars, 1 upper, 1 num</span>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-neutral-400" />
                    </div>
                    <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-neutral-200 bg-white rounded-md text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm transition-all duration-200"
                  />
                  </div>
                  {confirmPassword && password !== confirmPassword && (
                    <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> Passwords do not match
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !password || password !== confirmPassword || strength.label === "Weak"}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-5 rounded-md text-sm text-white font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: "var(--color-primary-600)" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--color-primary-700)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "var(--color-primary-600)")} 
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Resetting password...</span>
                    </>
                  ) : (
                    <span>Reset Password</span>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* STEP 4: SUCCESS AND REDIRECT */}
          {step === 4 && (
            <div className="space-y-6 text-center animate-fade-in">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center border border-green-200">
                  <CheckCircle2 className="w-8 h-8 text-green-600 animate-bounce" />
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
                  Password Reset Successful!
                </h2>
                <p className="text-sm text-neutral-500 mt-2">
                  Your password has been updated. You can now log in.
                </p>
              </div>

              <div className="pt-2">
                <Link
                href="/login"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-5 rounded-md text-sm text-white font-semibold transition-all duration-200"
                style={{ background: "var(--color-primary-600)" }}
              >
                  <span>Go to Login</span>
                </Link>
                <p className="text-xs text-neutral-400 mt-3">
                  Redirecting automatically in {redirectCountdown}s...
                </p>
              </div>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
}
