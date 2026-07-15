"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Mail,
  Lock,
  ArrowRight,
  Shield,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
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

export default function SignupPage() {
  const router = useRouter();

  // State Management
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Simulated OAuth States
  const [showOAuthModal, setShowOAuthModal] = useState(false);
  const [oauthStep, setOauthStep] = useState<"chooser" | "processing" | "success">("chooser");
  const [selectedAccount, setSelectedAccount] = useState<MockGoogleAccount | null>(null);

  // Animation steps for processing backend code
  const [activeProcessingStep, setActiveProcessingStep] = useState(0);
  const processingSteps = [
    { label: "Verifying credentials with Google OAuth provider...", desc: "Received email, firstName, lastName, profilePhotoUrl" },
    { label: "Backend: Creating database record...", desc: "INSERT INTO users (email, firstName, lastName, isEmailVerified=true, role='USER')" },
    { label: "Backend: Generating JWT Session token...", desc: "Created 30-day expiry authentication token" },
    { label: "Backend: Registering Refresh token...", desc: "CREATE refresh_tokens (userId, token, expiresAt=NOW+30days)" },
    { label: "Trust established by OAuth provider...", desc: "Skipped email verification requirement" },
    { label: "Authentication complete. Finalizing session...", desc: "Redirecting to profile setup..." }
  ];

  // Run the animated processing step sequence
  useEffect(() => {
    if (oauthStep !== "processing") return;

    const timer = setInterval(() => {
      setActiveProcessingStep((prev) => {
        if (prev >= processingSteps.length - 1) {
          clearInterval(timer);
          // Move to success step shortly after final processing step
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

  // Handle successful signup redirection
  useEffect(() => {
    if (oauthStep === "success") {
      const redirectTimer = setTimeout(() => {
        // Close modal and navigate
        setShowOAuthModal(false);
        router.push("/onboarding/resume");
      }, 1500);
      return () => clearTimeout(redirectTimer);
    }
  }, [oauthStep, router]);

  const handleGoogleSignupClick = () => {
    setSelectedAccount(null);
    setOauthStep("chooser");
    setActiveProcessingStep(0);
    setShowOAuthModal(true);
  };

  const handleAccountSelect = (account: MockGoogleAccount) => {
    setSelectedAccount(account);
    if (typeof window !== "undefined") {
      localStorage.setItem("jobfits_user", JSON.stringify({
        email: account.email,
        firstName: account.firstName,
        lastName: account.lastName,
        profilePhotoUrl: "https://lh3.googleusercontent.com/a/mock-id",
        role: "USER"
      }));
      localStorage.setItem("jobfits_token", "mock-jwt-session-token-30-day");
    }
    setOauthStep("processing");
  };

  // Mock Form Submit — email/password path
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleEmailSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate backend call: send 6-digit verification code
    setTimeout(() => {
      setIsSubmitting(false);
      router.push("/verify-email");
    }, 1200);
  };

  // Tailwind password strength calculation
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
          <blockquote className="space-y-2 animate-fade-in">
            <p className="text-base italic text-primary-100 font-medium leading-relaxed">
              "The only way to do great work is to love what you do. Find your fit with JobFits."
            </p>
            <cite className="block text-xs font-semibold text-primary-300 not-italic uppercase tracking-wider">
              — Steve Jobs
            </cite>
          </blockquote>
        </div>
      </div>

      {/* RIGHT PANEL - FORM */}
      <div className="w-full md:w-1/2 bg-white flex flex-col justify-center items-center p-8 sm:p-12 md:p-16 min-h-screen">
        <div className="w-full max-w-md space-y-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
                Create your account
              </h2>
              <p className="text-sm text-neutral-500 mt-1">
                Enter your details to create your account
              </p>
            </div>

            {/* EMAIL/PASSWORD FORM */}
            <form className="space-y-4" onSubmit={handleEmailSignup}>
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

              <div>
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
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

              {/* Terms checkbox */}
              <div className="flex items-start mt-2">
                <div className="flex items-center h-5">
                  <input
                    id="terms"
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded bg-white"
                  />
                </div>
                <div className="ml-3 text-xs">
                  <label htmlFor="terms" className="text-neutral-500">
                    I agree to the{" "}
                    <a href="#" className="text-primary-600 hover:underline">
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a href="#" className="text-primary-600 hover:underline">
                      Privacy Policy
                    </a>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={!agreeTerms || password !== confirmPassword || !email || isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-5 rounded-md text-sm text-white font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: "var(--color-primary-600)" }}
                onMouseEnter={e => (e.currentTarget.style.background = "var(--color-primary-700)")}
                onMouseLeave={e => (e.currentTarget.style.background = "var(--color-primary-600)")} 
              >
                {isSubmitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /><span>Creating account…</span></>
                ) : (
                  <><span>Create Account</span><ArrowRight className="w-4 h-4" /></>
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

            {/* SOCIAL SIGNUP BUTTONS */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleGoogleSignupClick}
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
                onClick={() => alert("LinkedIn registration clicked. Only Google signup is active in this simulation.")}
                className="flex items-center justify-center gap-2 px-4 py-2.5 border border-neutral-200 rounded-md bg-white hover:bg-neutral-50 text-neutral-700 font-medium transition-all duration-200 text-sm group"
                style={{ boxShadow: "var(--shadow-sm)" }}
              >
                <svg className="w-4 h-4 group-hover:scale-105 transition-transform" fill="#0077B5" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.8v8.37h2.8v-4.67c0-.25.02-.5.1-.68a1.14 1.14 0 0 1 1-.77c.76 0 1 .56 1 1.39v4.73h2.8M7.11 9.83a1.43 1.43 0 0 0 1.41-1.43 1.42 1.42 0 0 0-1.41-1.42 1.43 1.43 0 0 0-1.4 1.42 1.44 1.44 0 0 0 1.4 1.43M5.7 18.5h2.8v-8.37H5.7v8.37z" />
                </svg>
                <span>LinkedIn</span>
              </button>
            </div>

            {/* SIGN IN LINK */}
            <div className="text-center text-xs mt-4">
              <span className="text-neutral-500">Already have an account? </span>
              <Link href="/login" className="text-primary-600 font-semibold hover:underline">
                Log In
              </Link>
            </div>
          </div>
        </div>

      {/* ──────────────────────────────────────────────────────────
          INTERACTIVE GOOGLE OAUTH FLOW MODAL
          ────────────────────────────────────────────────────────── */}
      {showOAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-sm animate-fade-in">
          <div
            className="w-full max-w-md overflow-hidden rounded-lg border border-neutral-200 bg-white text-neutral-900 animate-slide-up"
            style={{ boxShadow: "var(--shadow-xl)" }}
          >
            {/* GOOGLE ACC CHOOSER HEADER */}
            <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {/* Google Colored Logo */}
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
                <span className="font-semibold text-sm text-neutral-500">Sign in with Google</span>
              </div>
              <button
                type="button"
                onClick={() => setShowOAuthModal(false)}
                className="p-1 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* STEP 1: ACCOUNT CHOOSER */}
            {oauthStep === "chooser" && (
              <div className="p-6">
                <div className="mb-4 text-center">
                  <h3 className="text-lg font-bold text-neutral-900">Choose an account</h3>
                  <p className="text-xs text-neutral-500 mt-1">to continue to <span className="font-semibold text-primary-700">JobFits</span></p>
                </div>

                <div className="space-y-2 mt-6">
                  {MOCK_ACCOUNTS.map((account) => (
                    <button
                      key={account.email}
                      onClick={() => handleAccountSelect(account)}
                      className="w-full flex items-center justify-between p-3 rounded-md border border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300 transition-all duration-200 text-left group"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full ${account.color} flex items-center justify-center text-white font-bold text-sm shadow-inner`}>
                          {account.initials}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-neutral-900">{account.firstName} {account.lastName}</div>
                          <div className="text-xs text-neutral-500">{account.email}</div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  ))}

                  <button
                    onClick={() => alert("Only the preset mock profiles are active for this validation demo.")}
                    className="w-full flex items-center gap-3 p-3 rounded-md border border-dashed border-neutral-300 hover:bg-neutral-50 transition-all duration-200 text-left text-neutral-500 text-xs font-medium"
                  >
                    <div className="w-10 h-10 rounded-full border border-dashed border-neutral-300 flex items-center justify-center bg-neutral-50 text-neutral-400">
                      +
                    </div>
                    Use another account
                  </button>
                </div>

                <div className="mt-8 text-xs text-neutral-400 leading-relaxed">
                  To continue, Google will share your name, email address, language preference, and profile picture with JobFits. Before using JobFits, you can review their <a href="#" className="text-primary-600 hover:underline">privacy policy</a> and <a href="#" className="text-primary-600 hover:underline">terms of service</a>.
                </div>
              </div>
            )}

            {/* STEP 2: PROCESSING (OAUTH CALLBACK AND DB RECORD CREATION) */}
            {oauthStep === "processing" && (
              <div className="p-6 bg-neutral-950 text-white font-mono text-xs leading-relaxed">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-4">
                  <span className="text-primary-400 font-bold">oauth_callback_handler.py</span>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                  </div>
                </div>

                {/* USER METADATA FROM OAUTH PROVIDER */}
                <div className="bg-neutral-900 rounded-lg p-3 border border-neutral-800 mb-4">
                  <div className="text-neutral-400 font-bold mb-1">// Received Identity Claims:</div>
                  <div><span className="text-blue-400">email:</span> &quot;{selectedAccount?.email}&quot;</div>
                  <div><span className="text-blue-400">firstName:</span> &quot;{selectedAccount?.firstName}&quot;</div>
                  <div><span className="text-blue-400">lastName:</span> &quot;{selectedAccount?.lastName}&quot;</div>
                  <div><span className="text-blue-400">profilePhotoUrl:</span> &quot;https://lh3.googleusercontent.com/a/mock-id&quot;</div>
                </div>

                {/* BACKEND ACTIONS SIMULATED LOGS */}
                <div className="space-y-3" style={{ minHeight: "220px" }}>
                  {processingSteps.map((step, idx) => {
                    const isCompleted = activeProcessingStep > idx;
                    const isCurrent = activeProcessingStep === idx;
                    const isPending = activeProcessingStep < idx;

                    return (
                      <div
                        key={idx}
                        className={`transition-opacity duration-300 ${isPending ? "opacity-30" : "opacity-100"
                          }`}
                      >
                        <div className="flex items-start gap-2">
                          {isCompleted ? (
                            <span className="text-green-500 font-bold mt-0.5">✓</span>
                          ) : isCurrent ? (
                            <Loader2 className="w-3.5 h-3.5 text-primary-400 animate-spin mt-0.5" />
                          ) : (
                            <span className="text-neutral-600 font-bold mt-0.5">·</span>
                          )}
                          <div>
                            <div className={`${isCurrent ? "text-primary-400 font-semibold" : "text-neutral-200"}`}>
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
                  <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500 flex items-center justify-center animate-pulse-soft">
                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white">Registration Successful!</h3>
                <p className="text-sm text-neutral-400 mt-2">
                  Session Token generated (expires in 30 days)
                </p>
                <div className="mt-6 flex items-center justify-center gap-2 text-xs text-primary-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Redirecting to Profile Setup onboarding...</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Simple Helper Icon
function ChevronRight(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      viewBox="0 0 24 24"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}
