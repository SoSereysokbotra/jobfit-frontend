"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

// Mail client definitions
const MAIL_CLIENTS = [
  {
    id: "outlook",
    label: "Outlook",
    url: "https://outlook.live.com",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <rect x="2" y="3" width="20" height="18" rx="2" />
        <path d="M9 3v18" />
        <path d="M2 8h7" />
        <path d="M2 13h7" />
        <path d="M14 10l3 3-3 3" />
      </svg>
    ),
  },
  {
    id: "gmail",
    label: "Gmail",
    url: "https://mail.google.com",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <polyline points="2,7 12,14 22,7" />
      </svg>
    ),
  },
  {
    id: "mail",
    label: "Mail",
    url: "mailto:",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <polygon points="12 2 2 7 12 12 22 7 12 2" />
        <polyline points="2 17 12 22 22 17" />
        <polyline points="2 12 12 17 22 12" />
      </svg>
    ),
  },
];

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "your email address";

  const [isVerified, setIsVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(3);

  useEffect(() => {
    if (!isVerified) return;
    if (redirectCountdown <= 0) {
      router.push("/onboarding/resume");
      return;
    }
    const t = setInterval(() => setRedirectCountdown((p) => p - 1), 1000);
    return () => clearInterval(t);
  }, [isVerified, redirectCountdown, router]);

  const simulateVerification = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setIsVerified(true);
    }, 1500);
  };

  const handleMailClick = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
    if (!isVerified && !isVerifying) simulateVerification();
  };

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center p-6 font-sans"
      style={{
        background: "linear-gradient(135deg, var(--color-primary-900) 0%, var(--color-primary-800) 40%, var(--color-primary-700) 100%)",
      }}
    >
      {/* Decorative blobs matching onboarding page */}
      <div className="fixed top-0 right-0 w-96 h-96 rounded-full opacity-10 pointer-events-none" style={{ background: "var(--color-primary-400)", filter: "blur(100px)" }} />
      <div className="fixed bottom-0 left-0 w-72 h-72 rounded-full opacity-10 pointer-events-none" style={{ background: "var(--color-primary-300)", filter: "blur(80px)" }} />

      {/* Logo at top */}
      <div className="relative z-10 flex flex-col items-center mb-8">
        <div className="w-14 h-14 rounded-xl bg-white shadow-lg flex items-center justify-center p-1.5 border border-white/25 mb-3 hover:scale-105 transition-transform duration-300">
          <img src="/logo.png" alt="JobFits Logo" className="w-full h-full object-contain" />
        </div>
        <span className="text-lg font-extrabold text-white tracking-tight">JobFits</span>
      </div>

      {/* Card */}
      <div
        className="relative z-10 w-full max-w-md rounded-2xl overflow-hidden animate-fade-in"
        style={{ background: "var(--color-card)", boxShadow: "0 25px 50px rgba(0,0,0,0.3)" }}
      >
        <div className="p-8 sm:p-10">

          {isVerifying ? (
            /* ── VERIFYING STATE ── */
            <div className="space-y-5 text-center py-6">
              <div className="flex justify-center">
                <div className="w-12 h-12 rounded-full border-4 border-primary-500 border-t-transparent animate-spin" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
                  Verifying your link…
                </h1>
                <p className="text-sm text-neutral-500 mt-1">
                  Connecting to the auth server
                </p>
              </div>
            </div>

          ) : isVerified ? (
            /* ── SUCCESS STATE ── */
            <div className="space-y-5 text-center py-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-success-50 border border-success-100 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-success-600 animate-bounce" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
                  Email Verified!
                </h1>
                <p className="text-sm text-neutral-500 mt-1">
                  Your account is ready. Let&apos;s set up your profile.
                </p>
              </div>
              <Button fullWidth onClick={() => router.push("/onboarding/resume")}>
                Continue to Onboarding <ArrowRight className="w-4 h-4" />
              </Button>
              <p className="text-xs text-neutral-400">
                Redirecting automatically in {redirectCountdown}s…
              </p>
            </div>

          ) : (
            /* ── DEFAULT: CHECK YOUR INBOX ── */
            <div className="space-y-6">

              {/* Title block */}
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
                  Check your inbox
                </h1>
                <p className="text-sm text-neutral-500 leading-relaxed">
                  We&apos;ve sent a magic link to{" "}
                  <span className="font-semibold text-neutral-900 break-all">
                    {email}
                  </span>
                  .<br />
                  Please click the link to confirm your address.
                </p>
              </div>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-neutral-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-3 text-neutral-400 tracking-wider">
                    Open your email app
                  </span>
                </div>
              </div>

              {/* Mail Client Cards */}
              <div className="grid grid-cols-3 gap-3">
                {MAIL_CLIENTS.map((client) => (
                  <button
                    key={client.id}
                    onClick={() => handleMailClick(client.url)}
                    className="group flex flex-col items-center gap-2 p-4 rounded-lg border border-neutral-200 bg-white hover:border-primary-300 hover:bg-primary-50 transition-all duration-200 active:scale-[0.97]"
                  >
                    <span className="text-neutral-500 group-hover:text-primary-700 transition-colors duration-200">
                      {client.icon}
                    </span>
                    <span className="text-xs font-medium text-neutral-600 group-hover:text-primary-700 transition-colors duration-200">
                      {client.label}
                    </span>
                  </button>
                ))}
              </div>

              {/* Divider */}
              <div className="w-full border-t border-neutral-200" />

              {/* Help text */}
              <div className="space-y-1 text-center">
                <p className="text-sm text-neutral-500">
                  Can&apos;t see the e-mail? Please check the spam folder.
                </p>
                <p className="text-sm text-neutral-500">
                  Wrong e-mail?{" "}
                  <Link href="/signup" className="font-semibold text-primary-600 hover:underline">
                    Please re-enter your address.
                  </Link>
                </p>
              </div>

              {/* Dev simulator */}
              <div className="text-center">
                <button
                  onClick={simulateVerification}
                  className="text-xs text-neutral-400 hover:text-primary-600 transition-colors font-medium"
                >
                  [ Simulate magic link click ]
                </button>
              </div>

            </div>
          )}

        </div>
      </div>

      {/* Footer note */}
      <p className="relative z-10 text-center text-xs text-white/40 mt-6">
        Your data is secure and encrypted. JobFits never sells your information.
      </p>
    </div>
  );
}

// Suspense required for useSearchParams() in Next.js 15
export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div
        className="min-h-screen w-full flex items-center justify-center"
        style={{ background: "linear-gradient(135deg, var(--color-primary-900) 0%, var(--color-primary-800) 40%, var(--color-primary-700) 100%)" }}
      >
        <div className="w-10 h-10 rounded-full border-4 border-white/30 border-t-white animate-spin" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
