"use client";

import React, { useEffect, useState } from "react";
import { Loader2, CheckCircle2, X } from "lucide-react";
import { GoogleIcon } from "./brand-icons";

export interface MockGoogleAccount {
  email: string;
  firstName: string;
  lastName: string;
  initials: string;
  /** Token-backed avatar background class. */
  color: string;
}

export interface OAuthProcessingStep {
  label: string;
  desc: string;
}

/** Preset accounts for the simulated Google chooser. */
export const MOCK_ACCOUNTS: MockGoogleAccount[] = [
  { email: "sereysokbotra.so@gmail.com", firstName: "Sereysokbotra", lastName: "So", initials: "SS", color: "bg-primary-600" },
  { email: "john.doe@gmail.com", firstName: "John", lastName: "Doe", initials: "JD", color: "bg-info-600" },
];

interface GoogleOAuthModalProps {
  open: boolean;
  onClose: () => void;
  /** Animated backend log lines shown during the processing step. */
  processingSteps: OAuthProcessingStep[];
  /** Terminal file name shown in the processing view. */
  fileName?: string;
  successTitle: string;
  successSubtitle?: string;
  redirectLabel: string;
  accounts?: MockGoogleAccount[];
  /** Called when an account is chosen (e.g. persist a mock session). */
  onSelectAccount?: (account: MockGoogleAccount) => void;
  /** Called after the success screen; use to redirect. */
  onComplete: () => void;
}

type Step = "chooser" | "processing" | "success";

/**
 * Simulated Google OAuth flow (account chooser → animated backend log → success).
 * Shared by login and signup so the OAuth experience stays consistent.
 */
export function GoogleOAuthModal({
  open,
  onClose,
  processingSteps,
  fileName = "oauth_callback_handler.py",
  successTitle,
  successSubtitle,
  redirectLabel,
  accounts = MOCK_ACCOUNTS,
  onSelectAccount,
  onComplete,
}: GoogleOAuthModalProps) {
  const [step, setStep] = useState<Step>("chooser");
  const [selected, setSelected] = useState<MockGoogleAccount | null>(null);
  const [activeStep, setActiveStep] = useState(0);

  // Reset internal state each time the modal opens.
  useEffect(() => {
    if (open) {
      setStep("chooser");
      setSelected(null);
      setActiveStep(0);
    }
  }, [open]);

  // Drive the animated processing log.
  useEffect(() => {
    if (step !== "processing") return;
    const timer = setInterval(() => {
      setActiveStep((prev) => {
        if (prev >= processingSteps.length - 1) {
          clearInterval(timer);
          setTimeout(() => setStep("success"), 600);
          return prev;
        }
        return prev + 1;
      });
    }, 800);
    return () => clearInterval(timer);
  }, [step, processingSteps.length]);

  // Redirect after the success screen.
  useEffect(() => {
    if (step !== "success") return;
    const timer = setTimeout(onComplete, 1500);
    return () => clearTimeout(timer);
  }, [step, onComplete]);

  if (!open) return null;

  const handleSelect = (account: MockGoogleAccount) => {
    setSelected(account);
    onSelectAccount?.(account);
    setStep("processing");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-scrim backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-md overflow-hidden rounded-lg border border-neutral-200 bg-white text-neutral-900 animate-slide-up"
        style={{ boxShadow: "var(--shadow-xl)" }}
      >
        {/* HEADER */}
        <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GoogleIcon className="w-6 h-6" />
            <span className="font-semibold text-sm text-neutral-500">Sign in with Google</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP 1: CHOOSER */}
        {step === "chooser" && (
          <div className="p-6">
            <div className="mb-4 text-center">
              <h3 className="text-lg font-bold text-neutral-900">Choose an account</h3>
              <p className="text-xs text-neutral-500 mt-1">
                to continue to <span className="font-semibold text-primary-700">JobFits</span>
              </p>
            </div>

            <div className="space-y-2 mt-6">
              {accounts.map((account) => (
                <button
                  key={account.email}
                  onClick={() => handleSelect(account)}
                  className="w-full flex items-center justify-between p-3 rounded-md border border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300 transition-all duration-200 text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full ${account.color} flex items-center justify-center text-white font-bold text-sm shadow-inner`}>
                      {account.initials}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-neutral-900">
                        {account.firstName} {account.lastName}
                      </div>
                      <div className="text-xs text-neutral-500">{account.email}</div>
                    </div>
                  </div>
                  <span className="text-xs text-neutral-400 uppercase tracking-wider font-semibold group-hover:text-primary-600">
                    Choose
                  </span>
                </button>
              ))}

              <button
                onClick={() => alert("Only the preset mock profiles are active in this demo.")}
                className="w-full flex items-center gap-3 p-3 rounded-md border border-dashed border-neutral-300 hover:bg-neutral-50 transition-all duration-200 text-left text-neutral-500 text-xs font-medium"
              >
                <div className="w-10 h-10 rounded-full border border-dashed border-neutral-300 flex items-center justify-center bg-neutral-50 text-neutral-400">
                  +
                </div>
                Use another account
              </button>
            </div>

            <p className="mt-8 text-xs text-neutral-400 leading-relaxed">
              To continue, Google will share your name, email address, language preference, and profile picture with
              JobFits. Before using JobFits, you can review their{" "}
              <a href="#" className="text-primary-600 hover:underline">privacy policy</a> and{" "}
              <a href="#" className="text-primary-600 hover:underline">terms of service</a>.
            </p>
          </div>
        )}

        {/* STEP 2: PROCESSING */}
        {step === "processing" && (
          <div className="p-6 bg-neutral-950 text-white font-mono text-xs leading-relaxed">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-4">
              <span className="text-primary-400 font-bold">{fileName}</span>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-error-500" />
                <span className="w-2.5 h-2.5 rounded-full bg-warning-500" />
                <span className="w-2.5 h-2.5 rounded-full bg-success-500" />
              </div>
            </div>

            {selected && (
              <div className="bg-neutral-900 rounded-lg p-3 border border-neutral-800 mb-4">
                <div className="text-neutral-400 font-bold mb-1">// Received Identity Claims:</div>
                <div><span className="text-info-500">email:</span> &quot;{selected.email}&quot;</div>
                <div><span className="text-info-500">firstName:</span> &quot;{selected.firstName}&quot;</div>
                <div><span className="text-info-500">lastName:</span> &quot;{selected.lastName}&quot;</div>
                <div><span className="text-info-500">profilePhotoUrl:</span> &quot;https://lh3.googleusercontent.com/a/mock-id&quot;</div>
              </div>
            )}

            <div className="space-y-3" style={{ minHeight: "220px" }}>
              {processingSteps.map((s, idx) => {
                const isCompleted = activeStep > idx;
                const isCurrent = activeStep === idx;
                return (
                  <div key={s.label} className={`transition-opacity duration-300 ${activeStep < idx ? "opacity-30" : "opacity-100"}`}>
                    <div className="flex items-start gap-2">
                      {isCompleted ? (
                        <span className="text-success-500 font-bold mt-0.5">✓</span>
                      ) : isCurrent ? (
                        <Loader2 className="w-3.5 h-3.5 text-primary-400 animate-spin mt-0.5" />
                      ) : (
                        <span className="text-neutral-600 font-bold mt-0.5">·</span>
                      )}
                      <div>
                        <div className={isCurrent ? "text-primary-400 font-semibold" : "text-neutral-200"}>{s.label}</div>
                        {isCurrent && <div className="text-xs text-neutral-500 mt-0.5 italic">{s.desc}</div>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 3: SUCCESS */}
        {step === "success" && (
          <div className="p-8 text-center bg-neutral-900 text-white">
            <div className="flex justify-center mb-4">
              <div
                className="w-16 h-16 rounded-full border border-success-500 flex items-center justify-center animate-pulse-soft"
                style={{ background: "var(--color-success-glow)" }}
              >
                <CheckCircle2 className="w-8 h-8 text-success-500" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-white">{successTitle}</h3>
            {successSubtitle && <p className="text-sm text-neutral-400 mt-2">{successSubtitle}</p>}
            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-primary-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{redirectLabel}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
