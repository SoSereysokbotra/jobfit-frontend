"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, ArrowRight, AlertCircle } from "lucide-react";
import {
  AuthShell,
  AuthHeading,
  TextField,
  SocialAuthButtons,
  PasswordStrengthMeter,
  GoogleOAuthModal,
  MOCK_ACCOUNTS,
  type MockGoogleAccount,
  type OAuthProcessingStep,
} from "@/features/auth/components";
import { Button } from "@/shared/components/ui/button";

const OAUTH_STEPS: OAuthProcessingStep[] = [
  { label: "Verifying credentials with Google OAuth provider...", desc: "Received email, firstName, lastName, profilePhotoUrl" },
  { label: "Backend: Creating database record...", desc: "INSERT INTO users (email, firstName, lastName, isEmailVerified=true, role='USER')" },
  { label: "Backend: Generating JWT Session token...", desc: "Created 30-day expiry authentication token" },
  { label: "Backend: Registering Refresh token...", desc: "CREATE refresh_tokens (userId, token, expiresAt=NOW+30days)" },
  { label: "Trust established by OAuth provider...", desc: "Skipped email verification requirement" },
  { label: "Authentication complete. Finalizing session...", desc: "Redirecting to profile setup..." },
];

export default function SignupPage() {
  const router = useRouter();

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // OAuth modal
  const [showOAuthModal, setShowOAuthModal] = useState(false);

  const persistSession = (account: MockGoogleAccount) => {
    if (typeof window === "undefined") return;
    localStorage.setItem(
      "jobfits_user",
      JSON.stringify({
        email: account.email,
        firstName: account.firstName,
        lastName: account.lastName,
        profilePhotoUrl: "https://lh3.googleusercontent.com/a/mock-id",
        role: "USER",
      }),
    );
    localStorage.setItem("jobfits_token", "mock-jwt-session-token-30-day");
  };

  // Email/password path — sends a magic link
  const handleEmailSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      router.push(`/verify-email?email=${encodeURIComponent(email)}`);
    }, 1200);
  };

  return (
    <AuthShell
      quote="The only way to do great work is to love what you do. Find your fit with JobFits."
      author="Steve Jobs"
    >
      <AuthHeading
        title="Create your account"
        subtitle="Enter your details to create your account"
      />

      {/* EMAIL/PASSWORD FORM */}
      <form className="space-y-4" onSubmit={handleEmailSignup}>
        <TextField
          label="Email Address"
          icon={Mail}
          type="email"
          required
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div>
          <TextField
            label="Password"
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
              <a href="#" className="text-primary-600 hover:underline">Terms of Service</a> and{" "}
              <a href="#" className="text-primary-600 hover:underline">Privacy Policy</a>
            </label>
          </div>
        </div>

        <Button
          type="submit"
          fullWidth
          loading={isSubmitting}
          loadingText="Creating account…"
          disabled={!agreeTerms || password !== confirmPassword || !email}
        >
          Create Account <ArrowRight className="w-4 h-4" />
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

      {/* SIGN IN LINK */}
      <div className="text-center text-xs mt-4">
        <span className="text-neutral-500">Already have an account? </span>
        <Link href="/login" className="text-primary-600 font-semibold hover:underline">
          Log In
        </Link>
      </div>

      <GoogleOAuthModal
        open={showOAuthModal}
        onClose={() => setShowOAuthModal(false)}
        processingSteps={OAUTH_STEPS}
        successTitle="Registration Successful!"
        successSubtitle="Session Token generated (expires in 30 days)"
        redirectLabel="Redirecting to Profile Setup onboarding..."
        accounts={MOCK_ACCOUNTS}
        onSelectAccount={persistSession}
        onComplete={() => {
          setShowOAuthModal(false);
          router.push("/onboarding/resume");
        }}
      />
    </AuthShell>
  );
}
