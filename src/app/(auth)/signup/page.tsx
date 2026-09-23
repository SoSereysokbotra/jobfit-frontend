"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { homeForRole } from "@/features/auth/hooks/use-session";
import { toast } from "@/stores/toast-store";
import { Mail, Lock, User, ArrowRight, AlertCircle, Check } from "lucide-react";
import {
  AuthShell,
  AuthHeading,
  TextField,
  GoogleSignInButton,
  GOOGLE_SIGN_IN_ENABLED,
  PasswordStrengthMeter,
} from "@/features/auth/components";
import { authApi } from "@/features/auth/api/auth.api";
import { ApiError } from "@/lib/api/client";
import { Alert } from "@/shared/components/feedback/alert";
import { Button } from "@/shared/components/ui/button";
import { useTranslation } from "@/providers/locale-provider";

export default function SignupPage() {
  const router = useRouter();
  const { t } = useTranslation();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const passwordTooShort = password.length > 0 && password.length < 8;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms || !email || !password || password !== confirmPassword || passwordTooShort) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      await authApi.register({
        email: email.trim(),
        password,
        name: name.trim(),
        agreeToTerms: true,
      });

      // The backend does not auto-login on register; send them to verify their email.
      router.push(`/verify-email?email=${encodeURIComponent(email.trim())}`);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setErrorMessage(err.messages.join(" ") || "Registration failed. Please try again.");
      } else {
        setErrorMessage("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell
      quote="The secret of getting ahead is getting started."
      author="Mark Twain"
    >
      <AuthHeading
        title={t("auth.createAccount")}
        subtitle={t("auth.signupSubtitle")}
      />

      {errorMessage && (
        <Alert variant="error" className="animate-fade-in">
          {errorMessage}
        </Alert>
      )}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <TextField
          label={t("auth.fullNameLabel")}
          icon={User}
          required
          placeholder={t("auth.fullNamePlaceholder")}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <TextField
          label={t("auth.emailLabel")}
          icon={Mail}
          type="email"
          required
          placeholder={t("auth.emailPlaceholder")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div>
          <TextField
            label={t("auth.passwordLabel")}
            icon={Lock}
            passwordToggle
            required
            placeholder={t("auth.passwordPlaceholder")}
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
            label={t("auth.confirmPasswordLabel")}
            icon={Lock}
            type="password"
            required
            placeholder={t("auth.passwordPlaceholder")}
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
          <label htmlFor="terms" className="flex items-start gap-2.5 cursor-pointer select-none">
            <input
              id="terms"
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="sr-only"
            />
            <span
              className="flex items-center justify-center w-4 h-4 rounded border transition-all duration-150 shrink-0 mt-0.5"
              style={{
                background: agreeTerms ? "var(--color-primary-600)" : "var(--color-bg)",
                borderColor: agreeTerms ? "var(--color-primary-600)" : "var(--color-border)",
              }}
            >
              {agreeTerms && <Check size={11} style={{ color: "#ffffff" }} />}
            </span>
            <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
              I agree to the{" "}
              <a href="/terms" target="_blank" rel="noopener" className="text-primary-600 dark:text-primary-400 hover:underline">Terms of Service</a> and{" "}
              <a href="/privacy" target="_blank" rel="noopener" className="text-primary-600 dark:text-primary-400 hover:underline">Privacy Policy</a>
            </span>
          </label>
        </div>

        <Button
          type="submit"
          fullWidth
          loading={isSubmitting}
          loadingText={t("auth.signingUp")}
          disabled={!agreeTerms || !email || !password || password !== confirmPassword || passwordTooShort}
        >
          {t("auth.signUp")} <ArrowRight className="w-4 h-4" />
        </Button>
      </form>

      {GOOGLE_SIGN_IN_ENABLED && (
        <>
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t" style={{ borderColor: "var(--color-border)" }} />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span
                className="px-3"
                style={{ background: "var(--color-card)", color: "var(--color-text-tertiary)" }}
              >
                Or continue with
              </span>
            </div>
          </div>

          <GoogleSignInButton
            text="signup_with"
            onSignedIn={({ user, isNewUser }) => {
              // No verification-code step: Google has already verified the address, and
              // the backend created the account verified. Straight to onboarding.
              toast.success(isNewUser ? "Welcome to JobFits!" : "Welcome back!");
              router.push(isNewUser ? "/onboarding/resume" : homeForRole(user.role));
            }}
            onError={(message) => setErrorMessage(message)}
          />
          {/* The Google flow has no checkbox, so the acceptance the backend records
              (termsVersion + time + IP) has to be stated here, next to the button. */}
          <p className="text-center text-xs mt-2" style={{ color: "var(--color-text-tertiary)" }}>
            By continuing with Google you agree to the{" "}
            <a href="/terms" target="_blank" rel="noopener" className="text-primary-600 dark:text-primary-400 hover:underline">Terms of Service</a>{" "}
            and <a href="/privacy" target="_blank" rel="noopener" className="text-primary-600 dark:text-primary-400 hover:underline">Privacy Policy</a>.
          </p>
        </>
      )}

      {/* SIGN IN LINK */}
      <div className="text-center text-xs mt-4">
        <span style={{ color: "var(--color-text-tertiary)" }}>{t("auth.alreadyHaveAccount")} </span>
        <Link href="/login" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">
          {t("auth.signIn")}
        </Link>
      </div>
    </AuthShell>
  );
}
