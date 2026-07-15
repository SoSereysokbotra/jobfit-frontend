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
  ShieldAlert,
} from "lucide-react";

// Mock user options for simulated Google Account Chooser
interface MockGoogleAccount {
  email: string;
  firstName: string;
  lastName: string;
  profilePhotoUrl: string;
  initials: string;
  color: string;
}

const MOCK_ACCOUNTS: MockGoogleAccount[] = [
  {
    email: "sereysokbotra.so@gmail.com",
    firstName: "Sereysokbotra",
    lastName: "So",
    profilePhotoUrl: "",
    initials: "SS",
    color: "bg-primary-600",
  },
  {
    email: "john.doe@gmail.com",
    firstName: "John",
    lastName: "Doe",
    profilePhotoUrl: "",
    initials: "JD",
    color: "bg-blue-600",
  },
];

export default function LoginPage() {
  const router = useRouter();

  // State Management
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Failed Attempts & Account Lock simulation
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [unlockCode, setUnlockCode] = useState("");
  const [unlockError, setUnlockError] = useState("");
  const [isUnlocking, setIsUnlocking] = useState(false);

  // Simulated OAuth States
  const [showOAuthModal, setShowOAuthModal] = useState(false);
  const [oauthStep, setOauthStep] = useState<"chooser" | "processing" | "success">("chooser");
  const [selectedAccount, setSelectedAccount] = useState<MockGoogleAccount | null>(null);

  // Animation steps for processing backend code
  const [activeProcessingStep, setActiveProcessingStep] = useState(0);
  const processingSteps = [
    { label: "Verifying session with OAuth provider...", desc: "Received email, firstName, lastName, profilePhotoUrl" },
    { label: "Backend: Checking if user exists in database...", desc: "SELECT * FROM users WHERE email = ?" },
    { label: "Backend: Syncing user record & updating login timestamp...", desc: "UPDATE users SET lastLoginAt = NOW() WHERE id = ?" },
    { label: "Backend: Generating JWT Session token...", desc: "Created 30-day expiry authentication token" },
    { label: "Backend: Registering Refresh token...", desc: "CREATE refresh_tokens (userId, token, expiresAt=NOW+30days)" },
    { label: "Authentication complete. Finalizing session...", desc: "Redirecting to seeker dashboard..." }
  ];

  // Run the animated processing step sequence
  useEffect(() => {
    if (oauthStep !== "processing") return;

    const timer = setInterval(() => {
      setActiveProcessingStep((prev) => {
        if (prev >= processingSteps.length - 1) {
          clearInterval(timer);
          setTimeout(() => {
            setOauthStep("success");
          }, 600);
          return prev;
        }
        return prev + 1;
      });
    }, 800);

    return () => clearInterval(timer);
  }, [oauthStep]);

  // Handle successful login redirection
  useEffect(() => {
    if (oauthStep === "success") {
      const redirectTimer = setTimeout(() => {
        setShowOAuthModal(false);
        if (typeof window !== "undefined") {
          localStorage.setItem("jobfits_user", JSON.stringify({
            email: selectedAccount?.email || "user@jobfits.co",
            firstName: selectedAccount?.firstName || "Member",
            lastName: selectedAccount?.lastName || "",
            role: "USER",
            onboardingComplete: true // Login goes straight to dashboard
          }));
          localStorage.setItem("jobfits_token", "mock-jwt-session-token-30-day");
        }
        router.push("/dashboard");
      }, 1500);
      return () => clearTimeout(redirectTimer);
    }
  }, [oauthStep, router, selectedAccount]);

  const handleGoogleLoginClick = () => {
    if (isLocked) return;
    setSelectedAccount(null);
    setOauthStep("chooser");
    setActiveProcessingStep(0);
    setShowOAuthModal(true);
  };

  // Mock Form Submit
  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;

    setIsLoading(true);
    setErrorMessage("");

    setTimeout(() => {
      // Demo logic: Success if email is test@jobfits.co and password is password123
      const isSuccess = email.trim() === "test@jobfits.co" && password === "password123";

      if (isSuccess) {
        setIsLoading(false);
        if (typeof window !== "undefined") {
          localStorage.setItem("jobfits_user", JSON.stringify({
            email: email,
            firstName: "Demo",
            lastName: "Seeker",
            role: "USER",
            onboardingComplete: true // Login bypasses onboarding
          }));
          localStorage.setItem("jobfits_token", "mock-jwt-session-token-30-day");
        }
        router.push("/dashboard");
      } else {
        setIsLoading(false);
        const newAttempts = failedAttempts + 1;
        setFailedAttempts(newAttempts);

        if (newAttempts >= 5) {
          setIsLocked(true);
          setErrorMessage("Account temporarily locked for security. Please verify your unlock code.");
        } else {
          setErrorMessage(`Email or password incorrect. (${5 - newAttempts} attempts remaining)`);
        }
      }
    }, 1000);
  };

  // Mock Unlock Verification
  const handleUnlockVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setIsUnlocking(true);
    setUnlockError("");

    setTimeout(() => {
      if (unlockCode === "123456") {
        setIsLocked(false);
        setFailedAttempts(0);
        setErrorMessage("");
        setUnlockCode("");
        setIsUnlocking(false);
        alert("Account unlocked successfully! You can now log in.");
      } else {
        setIsUnlocking(false);
        setUnlockError("Invalid code. Please enter 123456 to unlock.");
      }
    }, 1200);
  };

  const handleAccountSelect = (account: MockGoogleAccount) => {
    setSelectedAccount(account);
    setOauthStep("processing");
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-white font-sans overflow-hidden">
      
      {/* LEFT PANEL - LOGO / BRANDING (FULL SCREEN SPLIT) */}
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
          
          {/* Divider */}
          <div className="w-16 h-0.5 bg-primary-500/30 my-8 rounded" />
          
          {/* Quote Block */}
          <blockquote className="space-y-2">
            <p className="text-base italic text-primary-100 font-medium leading-relaxed">
              "Choose a job you love, and you will never have to work a day in your life."
            </p>
            <cite className="block text-xs font-semibold text-primary-300 not-italic uppercase tracking-wider">
              — Confucius
            </cite>
          </blockquote>
        </div>
      </div>

      {/* RIGHT PANEL - FORM */}
      <div className="w-full md:w-1/2 bg-white flex flex-col justify-center items-center p-8 sm:p-12 md:p-16 min-h-screen">
        <div className="w-full max-w-md space-y-6">
          
          {/* Locked View */}
          {isLocked ? (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-4">
                  <ShieldAlert className="w-6 h-6 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
                  Account Locked
                </h2>
                <p className="text-sm text-neutral-500 mt-2">
                  Locked due to 5+ failed attempts. We've sent a 6-digit code to your email. Enter <strong className="text-neutral-900">123456</strong> to unlock.
                </p>
              </div>

              <form className="space-y-4" onSubmit={handleUnlockVerify}>
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 uppercase tracking-wider mb-1.5">
                    6-Digit Unlock Code
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="Enter code"
                    value={unlockCode}
                    onChange={(e) => setUnlockCode(e.target.value.replace(/\D/g, ""))}
                    className="block w-full px-4 py-2.5 border border-neutral-200 bg-white rounded-md text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm transition-all duration-200 text-center tracking-widest font-mono"
                  />
                </div>

                {unlockError && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" /> {unlockError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={unlockCode.length !== 6 || isUnlocking}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-5 rounded-md text-sm text-white font-semibold transition-all duration-200 bg-error-500 hover:bg-error-600 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none"
                >
                  {isUnlocking ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Unlocking...</span>
                    </>
                  ) : (
                    <span>Unlock Account</span>
                  )}
                </button>
              </form>
            </div>
          ) : (
            <>
              {/* Regular Login Form */}
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
                  Sign in to your account
                </h2>
                <p className="text-sm text-neutral-500 mt-1">
                  Enter your credentials to access your dashboard
                </p>
                <div className="p-3 rounded-md mt-4 border text-xs" style={{ background: "var(--color-primary-50)", borderColor: "var(--color-primary-100)", color: "var(--color-primary-800)" }}>
                  Demo credentials: <strong className="font-semibold">test@jobfits.co</strong> / <strong className="font-semibold">password123</strong>
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-md border text-xs flex items-center gap-2 animate-fade-in" style={{ background: "var(--color-error-50)", borderColor: "var(--color-error-100)", color: "var(--color-error-600)" }}>
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form className="space-y-4" onSubmit={handleEmailLogin}>
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 uppercase tracking-wider mb-1.5">
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

                <div>
                  <label className="block text-xs font-semibold text-neutral-600 uppercase tracking-wider mb-1.5">
                    Password
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
                </div>

                {/* Remember Me & Forgot Password Row */}
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
                  <Link
                    href="/forgot-password"
                    className="text-xs text-primary-600 hover:underline font-semibold"
                  >
                    Forgot password?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !email || !password}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-5 rounded-md text-sm text-white font-semibold transition-all duration-200 bg-primary-600 hover:bg-primary-700 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none"
                >
                  {isLoading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /><span>Signing in...</span></>
                  ) : (
                    <><span>Sign In</span><ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              </form>

              {/* DIVIDER */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-neutral-200"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-3 text-neutral-500">Or continue with</span>
                </div>
              </div>

              {/* SOCIAL SIGNIN BUTTONS */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleGoogleLoginClick}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 border border-neutral-200 rounded-md bg-white hover:bg-neutral-50 text-neutral-700 font-medium transition-all duration-200 text-sm group"
                  style={{ boxShadow: "var(--shadow-sm)" }}
                >
                  <svg className="w-4 h-4 group-hover:scale-105 transition-transform" viewBox="0 0 24 24">
                    <path
                      d="M21.35,11.1H12v2.7h5.38C16.88,15.73,14.77,17,12,17c-3.37,0-6.1-2.73-6.1-6.1S8.63,4.8,12,4.8c1.67,0,3.12,0.67,4.2,1.76l2.1-2.1C16.5,2.75,14.4,2,12,2C7.03,2,3,6.03,3,11s4.03,9,9,9c4.8,0,8.65-3.4,8.65-8.4C20.65,11.45,21.35,11.1,21.35,11.1z"
                      fill="#EA4335"
                    />
                    <path
                      d="M12,20c4.8,0,8.65-3.4,8.65-8.4H12v2.7h5.38C16.88,15.73,14.77,17,12,17"
                      fill="#4285F4"
                    />
                    <path
                      d="M20.65,11.6c0-0.2-.05-.45-.1-.7H12v2.7h5.38c-.2,1-.85,1.9-1.7,2.5"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12,20c2.7,0,4.95-1,6.55-2.6l-2.2-1.8c-.85.6-2,1-4.35,1-3.37,0-6.1-2.73-6.1-6.1"
                      fill="#34A853"
                    />
                  </svg>
                  <span>Google</span>
                </button>

                <button
                  type="button"
                  onClick={() => alert("LinkedIn login clicked. Only Google login is active in this simulation.")}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 border border-neutral-200 rounded-md bg-white hover:bg-neutral-50 text-neutral-700 font-medium transition-all duration-200 text-sm group"
                  style={{ boxShadow: "var(--shadow-sm)" }}
                >
                  <svg className="w-4 h-4 group-hover:scale-105 transition-transform" fill="#0077B5" viewBox="0 0 24 24">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.8v8.37h2.8v-4.67c0-.25.02-.5.1-.68a1.14 1.14 0 0 1 1-.77c.76 0 1 .56 1 1.39v4.73h2.8M7.11 9.83a1.43 1.43 0 0 0 1.41-1.43 1.42 1.42 0 0 0-1.41-1.42 1.43 1.43 0 0 0-1.4 1.42 1.44 1.44 0 0 0 1.4 1.43M5.7 18.5h2.8v-8.37H5.7v8.37z" />
                  </svg>
                  <span>LinkedIn</span>
                </button>
              </div>

              {/* SIGN UP LINK */}
              <div className="text-center text-xs mt-4">
                <span className="text-neutral-500">Don't have an account? </span>
                <Link href="/signup" className="text-primary-600 font-semibold hover:underline">
                  Sign up
                </Link>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────
          INTERACTIVE GOOGLE OAUTH FLOW MODAL
          ────────────────────────────────────────────────────────── */}
      {showOAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md overflow-hidden rounded-lg border border-neutral-200 bg-white text-neutral-900 animate-slide-up" style={{ boxShadow: "var(--shadow-xl)" }}>
            {/* GOOGLE ACC CHOOSER HEADER */}
            <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path
                    d="M21.35,11.1H12v2.7h5.38C16.88,15.73,14.77,17,12,17c-3.37,0-6.1-2.73-6.1-6.1S8.63,4.8,12,4.8c1.67,0,3.12,0.67,4.2,1.76l2.1-2.1C16.5,2.75,14.4,2,12,2C7.03,2,3,6.03,3,11s4.03,9,9,9c4.8,0,8.65-3.4,8.65-8.4C20.65,11.45,21.35,11.1,21.35,11.1z"
                    fill="#EA4335"
                  />
                  <path
                    d="M12,20c4.8,0,8.65-3.4,8.65-8.4H12v2.7h5.38C16.88,15.73,14.77,17,12,17"
                    fill="#4285F4"
                  />
                  <path
                    d="M20.65,11.6c0-0.2-.05-.45-.1-.7H12v2.7h5.38c-.2,1-.85,1.9-1.7,2.5"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12,20c2.7,0,4.95-1,6.55-2.6l-2.2-1.8c-.85.6-2,1-4.35,1-3.37,0-6.1-2.73-6.1-6.1"
                    fill="#34A853"
                  />
                </svg>
                <span className="font-semibold text-sm">Sign in with Google</span>
              </div>
              <button
                type="button"
                onClick={() => setShowOAuthModal(false)}
                className="text-neutral-400 hover:text-neutral-600 text-sm font-medium"
              >
                Cancel
              </button>
            </div>

            {/* STEP 1: ACCOUNT CHOOSER */}
            {oauthStep === "chooser" && (
              <div className="p-6 space-y-4">
                <p className="text-xs text-neutral-500">to continue to JobFits</p>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {MOCK_ACCOUNTS.map((account) => (
                    <button
                      key={account.email}
                      onClick={() => handleAccountSelect(account)}
                      className="w-full flex items-center justify-between p-3 rounded-md border border-neutral-200 hover:bg-neutral-50 transition-all duration-200 text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full ${account.color} flex items-center justify-center text-white font-bold text-sm`}>
                          {account.initials}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-neutral-800">
                            {account.firstName} {account.lastName}
                          </p>
                          <p className="text-xs text-neutral-500">{account.email}</p>
                        </div>
                      </div>
                      <span className="text-xs text-neutral-400 uppercase tracking-wider font-semibold">
                        Choose
                      </span>
                    </button>
                  ))}
                </div>
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => alert("Use another account flow. Enter email in main screen.")}
                    className="text-xs text-primary-600 font-semibold hover:underline"
                  >
                    Use another account
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: PROCESSING LOGIC LOG */}
            {oauthStep === "processing" && (
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-500">Establishing Secure OAuth Session</span>
                  <Loader2 className="w-5 h-5 text-primary-600 animate-spin" />
                </div>
                <div className="bg-neutral-950 rounded-lg p-4 font-mono text-xs space-y-3 max-h-64 overflow-y-auto text-primary-400" style={{ boxShadow: "var(--shadow-sm) inset" }}>
                  {processingSteps.map((step, idx) => {
                    const isCompleted = idx < activeProcessingStep;
                    const isCurrent = idx === activeProcessingStep;
                    return (
                      <div
                        key={step.label}
                        className={`transition-opacity duration-300 ${
                          isCompleted ? "text-green-400 opacity-90" : isCurrent ? "text-primary-300 opacity-100" : "text-neutral-600 opacity-40"
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <span className="font-semibold select-none">
                            {isCompleted ? "✓" : isCurrent ? "⚡" : "○"}
                          </span>
                          <div>
                            <div className={isCurrent ? "font-bold" : ""}>
                              {step.label}
                            </div>
                            {isCurrent && (
                              <div className="text-xs text-neutral-500 mt-0.5 italic">
                                {step.desc}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 3: SUCCESS AND REDIRECT */}
            {oauthStep === "success" && (
              <div className="p-8 text-center bg-neutral-900 text-white">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500 flex items-center justify-center animate-pulse">
                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white">Signed in Successfully!</h3>
                <p className="text-sm text-neutral-400 mt-2">
                  Session Token generated (expires in 30 days)
                </p>
                <div className="mt-6 flex items-center justify-center gap-2 text-xs text-primary-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Redirecting to Seekers Dashboard...</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
