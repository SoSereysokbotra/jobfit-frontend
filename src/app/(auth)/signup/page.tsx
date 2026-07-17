"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, ArrowRight, AlertCircle } from "lucide-react";
import {
  AuthShell,
  AuthHeading,
  TextField,
  SocialAuthButtons,
  PasswordStrengthMeter,
} from "@/features/auth/components";
import { authApi } from "@/features/auth/api/auth.api";
import { ApiError } from "@/lib/api/client";
import { Alert } from "@/shared/components/feedback/alert";
import { Button } from "@/shared/components/ui/button";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // RegisterDto requires @MinLength(8); mirror it so the user sees it before submitting.
  const passwordTooShort = password.length > 0 && password.length < 8;

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      await authApi.register({
        email: email.trim(),
        password,
        name: name.trim() || undefined,
        agreeToTerms: agreeTerms,
      });
      // The 6-digit code is tied to an httpOnly cookie the browser now holds, but
      // the *email* is not readable from JS — pass it along so the verify page can
      // offer "resend", which needs it in the request body.
      router.push(`/verify-email?email=${encodeURIComponent(email.trim())}`);
    } catch (error) {
      const err = error as ApiError;
      setErrorMessage(
        err instanceof ApiError
          ? // Validation failures return one message per field.
            err.messages.join(" ")
          : "Something went wrong. Please try again.",
      );
      setIsSubmitting(false);
    }
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

      {errorMessage && (
        <Alert variant="error" className="animate-fade-in">
          {errorMessage}
        </Alert>
      )}

      {/* EMAIL/PASSWORD FORM */}
      <form className="space-y-4" onSubmit={handleEmailSignup}>
        <TextField
          label="Full Name"
          icon={User}
          type="text"
          maxLength={120}
          placeholder="Jane Doe"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

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
          {passwordTooShort && (
            <p className="mt-1 text-xs text-error-500 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> Password must be at least 8 characters
            </p>
          )}
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

        {/* Terms checkbox — RegisterDto @Equals(true), so this gates submission. */}
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
          disabled={!agreeTerms || !email || !password || password !== confirmPassword || passwordTooShort}
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

      {/* TODO(backend): no OAuth endpoints exist. Kept visible but disabled. */}
      <SocialAuthButtons onGoogle={() => {}} onLinkedIn={() => {}} disabled />
      <p className="text-center text-xs text-neutral-400 mt-2">
        Social sign-up is coming soon.
      </p>

      {/* SIGN IN LINK */}
      <div className="text-center text-xs mt-4">
        <span className="text-neutral-500">Already have an account? </span>
        <Link href="/login" className="text-primary-600 font-semibold hover:underline">
          Log In
        </Link>
      </div>
    </AuthShell>
  );
}
