"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, ArrowRight, ArrowLeft, KeyRound } from "lucide-react";
import {
  AuthShell,
  AuthHeading,
  TextField,
} from "@/features/auth/components";
import { authApi } from "@/features/auth/api/auth.api";
import { ApiError } from "@/lib/api/client";
import { Alert } from "@/shared/components/feedback/alert";
import { Button } from "@/shared/components/ui/button";

const toMessage = (error: unknown, fallback: string) =>
  error instanceof ApiError ? error.messages.join(" ") : fallback;

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // STEP 1: request a reset code. Always advances — backend hides whether
  // the account exists (enumeration protection).
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");
    try {
      await authApi.requestPasswordReset(email.trim());
      if (typeof window !== "undefined") {
        sessionStorage.setItem("reset_email", email.trim());
      }
      router.push("/forgot-password/verify");
    } catch (error) {
      setErrorMsg(toMessage(error, "Could not send a reset code. Please try again."));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell
      quote="Opportunities don't happen, you create them. Reset your password to resume your journey."
      author="Chris Grosser"
    >
      <div className="space-y-6 animate-fade-in">
        <AuthHeading
          title="Reset Your Password"
          subtitle="Enter your email to receive a 6-digit verification code"
          icon={<KeyRound className="w-5 h-5 text-primary-600" />}
        />

        {errorMsg && <Alert variant="error">{errorMsg}</Alert>}

        <form className="space-y-4" onSubmit={handleSendCode}>
          <TextField
            label="Email Address"
            icon={Mail}
            type="email"
            required
            autoFocus
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Button
            type="submit"
            fullWidth
            loading={isLoading}
            loadingText="Sending code…"
            disabled={!email.trim()}
          >
            Send Code <ArrowRight className="w-4 h-4" />
          </Button>
        </form>

        <div className="text-center pt-1">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs text-primary-600 font-semibold hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Login</span>
          </Link>
        </div>
      </div>
    </AuthShell>
  );
}
