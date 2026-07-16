"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, ArrowRight, ShieldAlert } from "lucide-react";
import {
  AuthShell,
  AuthHeading,
  TextField,
  SocialAuthButtons,
  GoogleOAuthModal,
  MOCK_ACCOUNTS,
  type MockGoogleAccount,
  type OAuthProcessingStep,
} from "@/features/auth/components";
import { Alert } from "@/shared/components/feedback/alert";
import { Button } from "@/shared/components/ui/button";

const OAUTH_STEPS: OAuthProcessingStep[] = [
  { label: "Verifying session with OAuth provider...", desc: "Received email, firstName, lastName, profilePhotoUrl" },
  { label: "Backend: Checking if user exists in database...", desc: "SELECT * FROM users WHERE email = ?" },
  { label: "Backend: Syncing user record & updating login timestamp...", desc: "UPDATE users SET lastLoginAt = NOW() WHERE id = ?" },
  { label: "Backend: Generating JWT Session token...", desc: "Created 30-day expiry authentication token" },
  { label: "Backend: Registering Refresh token...", desc: "CREATE refresh_tokens (userId, token, expiresAt=NOW+30days)" },
  { label: "Authentication complete. Finalizing session...", desc: "Redirecting to seeker dashboard..." },
];

export default function LoginPage() {
  const router = useRouter();

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Failed attempts & account lock simulation
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [unlockCode, setUnlockCode] = useState("");
  const [unlockError, setUnlockError] = useState("");
  const [isUnlocking, setIsUnlocking] = useState(false);

  // OAuth modal
  const [showOAuthModal, setShowOAuthModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<MockGoogleAccount | null>(null);

  const persistSession = (user: { email: string; firstName: string; lastName: string }) => {
    if (typeof window === "undefined") return;
    localStorage.setItem(
      "jobfits_user",
      JSON.stringify({ ...user, role: "USER", onboardingComplete: true }),
    );
    localStorage.setItem("jobfits_token", "mock-jwt-session-token-30-day");
  };

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;

    setIsLoading(true);
    setErrorMessage("");

    setTimeout(() => {
      setIsLoading(false);
      const isSuccess = email.trim() === "test@jobfits.co" && password === "password123";

      if (isSuccess) {
        persistSession({ email, firstName: "Demo", lastName: "Seeker" });
        router.push("/dashboard");
      } else {
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

  return (
    <AuthShell
      quote="Choose a job you love, and you will never have to work a day in your life."
      author="Confucius"
    >
      {isLocked ? (
        /* ACCOUNT LOCKED VIEW */
        <div className="space-y-6 animate-fade-in">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-error-100 mb-4">
              <ShieldAlert className="w-6 h-6 text-error-600" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-neutral-900">Account Locked</h2>
            <p className="text-sm text-neutral-500 mt-2">
              Locked due to 5+ failed attempts. We&apos;ve sent a 6-digit code to your email. Enter{" "}
              <strong className="text-neutral-900">123456</strong> to unlock.
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleUnlockVerify}>
            <TextField
              label="6-Digit Unlock Code"
              required
              maxLength={6}
              placeholder="Enter code"
              value={unlockCode}
              onChange={(e) => setUnlockCode(e.target.value.replace(/\D/g, ""))}
              className="text-center tracking-widest font-mono"
            />

            {unlockError && <Alert variant="error">{unlockError}</Alert>}

            <Button
              type="submit"
              variant="danger"
              fullWidth
              loading={isUnlocking}
              loadingText="Unlocking..."
              disabled={unlockCode.length !== 6}
            >
              Unlock Account
            </Button>
          </form>
        </div>
      ) : (
        <>
          <AuthHeading
            title="Sign in to your account"
            subtitle="Enter your credentials to access your dashboard"
          />
          <div className="p-3 rounded-md border text-xs bg-primary-50 border-primary-100 text-primary-800">
            Demo credentials: <strong className="font-semibold">test@jobfits.co</strong> /{" "}
            <strong className="font-semibold">password123</strong>
          </div>

          {errorMessage && (
            <Alert variant="error" className="animate-fade-in">{errorMessage}</Alert>
          )}

          <form className="space-y-4" onSubmit={handleEmailLogin}>
            <TextField
              label="Email Address"
              icon={Mail}
              type="email"
              required
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <TextField
              label="Password"
              icon={Lock}
              passwordToggle
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {/* Remember Me & Forgot Password */}
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
              <Link href="/forgot-password" className="text-xs text-primary-600 hover:underline font-semibold">
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              fullWidth
              loading={isLoading}
              loadingText="Signing in..."
              disabled={!email || !password}
            >
              Sign In <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          {/* DIVIDER */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-neutral-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-neutral-500">Or continue with</span>
            </div>
          </div>

          <SocialAuthButtons onGoogle={() => setShowOAuthModal(true)} />

          {/* SIGN UP LINK */}
          <div className="text-center text-xs mt-4">
            <span className="text-neutral-500">Don&apos;t have an account? </span>
            <Link href="/signup" className="text-primary-600 font-semibold hover:underline">
              Sign up
            </Link>
          </div>
        </>
      )}

      <GoogleOAuthModal
        open={showOAuthModal}
        onClose={() => setShowOAuthModal(false)}
        processingSteps={OAUTH_STEPS}
        fileName="oauth_login_handler.py"
        successTitle="Signed in Successfully!"
        successSubtitle="Session Token generated (expires in 30 days)"
        redirectLabel="Redirecting to Seekers Dashboard..."
        accounts={MOCK_ACCOUNTS}
        onSelectAccount={setSelectedAccount}
        onComplete={() => {
          setShowOAuthModal(false);
          persistSession({
            email: selectedAccount?.email || "user@jobfits.co",
            firstName: selectedAccount?.firstName || "Member",
            lastName: selectedAccount?.lastName || "",
          });
          router.push("/dashboard");
        }}
      />
    </AuthShell>
  );
}
