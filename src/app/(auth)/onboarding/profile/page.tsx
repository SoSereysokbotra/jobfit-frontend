"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  User, Briefcase, MapPin, Phone, FileText, ArrowRight, Check, Loader2,
} from "lucide-react";

interface UserProfile {
  email: string;
  firstName: string;
  lastName: string;
  profilePhotoUrl?: string;
  role: string;
}

const STEPS = [
  { num: 1, label: "Profile" },
  { num: 2, label: "Resume" },
  { num: 3, label: "Matches" },
];

function StepTracker({ current }: { current: number }) {
  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between relative">
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-neutral-200 -z-10" />
        <div
          className="absolute top-4 left-0 h-0.5 transition-all duration-500 -z-10"
          style={{
            width: `${((current - 1) / (STEPS.length - 1)) * 100}%`,
            background: "var(--color-primary-600)",
          }}
        />
        {STEPS.map((s) => {
          const done = current > s.num;
          const active = current === s.num;
          return (
            <div key={s.num} className="flex flex-col items-center bg-white px-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300 ${
                  done
                    ? "bg-primary-600 border-primary-600 text-white"
                    : active
                    ? "bg-primary-800 border-primary-800 text-white ring-4 ring-primary-100"
                    : "bg-white border-neutral-300 text-neutral-400"
                }`}
              >
                {done ? <Check size={14} strokeWidth={3} /> : s.num}
              </div>
              <span
                className={`mt-2 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-colors ${
                  active || done ? "text-primary-800" : "text-neutral-400"
                }`}
              >
                {s.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function OnboardingProfilePage() {
  const router = useRouter();

  // Initialize all state with empty strings — no localStorage read during render
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [headline, setHeadline] = useState("");
  const [location, setLocation] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("mid");
  const [bio, setBio] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Read localStorage only on client, after mount — no mounted flag needed
  useEffect(() => {
    const storedUser = localStorage.getItem("jobfits_user");
    if (storedUser) {
      try {
        const parsed: UserProfile = JSON.parse(storedUser);
        setFirstName(parsed.firstName || "");
        setLastName(parsed.lastName || "");
        setEmail(parsed.email || "");
      } catch (e) {
        console.error("Failed to parse stored user", e);
      }
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccess(true);
      setTimeout(() => {
        router.push("/onboarding/resume");
      }, 1200);
    }, 1500);
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center px-4 py-12"
      style={{
        background:
          "linear-gradient(135deg, var(--color-primary-900) 0%, var(--color-primary-800) 40%, var(--color-primary-600) 100%)",
      }}
    >
      {/* Decorative blobs */}
      <div
        className="fixed top-0 right-0 w-96 h-96 rounded-full opacity-10 pointer-events-none"
        style={{ background: "var(--color-primary-400)", filter: "blur(100px)" }}
      />
      <div
        className="fixed bottom-0 left-0 w-72 h-72 rounded-full opacity-10 pointer-events-none"
        style={{ background: "var(--color-primary-300)", filter: "blur(80px)" }}
      />

      {/* Centered Card */}
      <div className="relative z-10 w-full max-w-3xl">
        {/* Logo & Brand */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-3 mb-3">
            <img
              src="/logo.png"
              alt="JobFits Logo"
              className="w-10 h-10 rounded-xl object-contain bg-white/10 p-1.5 shadow-lg border border-white/25 backdrop-blur-sm"
            />
            <span className="text-xl font-extrabold text-white tracking-tight">JobFits</span>
          </div>
          <p className="text-sm text-white/60">
            Set up your profile to unlock personalized job matches
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl shadow-2xl overflow-hidden"
          style={{ background: "var(--color-card)", boxShadow: "0 25px 50px rgba(0,0,0,0.3)" }}
        >
          <div className="p-6 sm:p-8">
            {/* Step Tracker */}
            <StepTracker current={1} />

            {showSuccess ? (
              <div className="py-12 text-center animate-fade-in">
                <div className="flex justify-center mb-4">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center"
                    style={{
                      background: "var(--color-success-100)",
                      border: "1px solid var(--color-success-500)",
                    }}
                  >
                    <Check className="w-8 h-8" style={{ color: "var(--color-success-500)" }} />
                  </div>
                </div>
                <h3 className="text-xl font-bold" style={{ color: "var(--color-text-primary)" }}>
                  Profile Saved!
                </h3>
                <p className="text-sm mt-2" style={{ color: "var(--color-text-secondary)" }}>
                  Redirecting to resume upload…
                </p>
                <div
                  className="mt-4 flex items-center justify-center gap-2 text-xs"
                  style={{ color: "var(--color-primary-600)" }}
                >
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Loading…</span>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <h2
                    className="text-2xl font-extrabold tracking-tight"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    Set Up Your Profile
                  </h2>
                  <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
                    Step 1 of 3 — Tell us a bit about yourself
                  </p>
                </div>

                {/* OAuth info banner — only shown when email is populated after useEffect */}
                <div
                  className="flex items-center gap-3 p-3 rounded-xl border mb-6"
                  style={{
                    background: "var(--color-primary-50)",
                    borderColor: "var(--color-primary-100)",
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                    style={{ background: "var(--color-primary-600)" }}
                  >
                    {firstName ? firstName[0].toUpperCase() : "U"}
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "var(--color-primary-800)" }}>
                      OAuth Provider Sync
                    </p>
                    <p className="text-xs" style={{ color: "var(--color-primary-700)" }}>
                      Imported profile information from your Google login.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Name row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        className="block text-xs font-bold uppercase tracking-wider mb-1.5"
                        style={{ color: "var(--color-text-secondary)" }}
                      >
                        First Name
                      </label>
                      <div className="relative">
                        <User
                          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
                          style={{ color: "var(--color-text-disabled)" }}
                        />
                        <input
                          type="text"
                          required
                          placeholder="First name"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="block w-full pl-10 pr-3 py-2.5 border rounded-lg text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          style={{ borderColor: "var(--color-border)", background: "var(--color-bg)" }}
                        />
                      </div>
                    </div>
                    <div>
                      <label
                        className="block text-xs font-bold uppercase tracking-wider mb-1.5"
                        style={{ color: "var(--color-text-secondary)" }}
                      >
                        Last Name
                      </label>
                      <div className="relative">
                        <User
                          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
                          style={{ color: "var(--color-text-disabled)" }}
                        />
                        <input
                          type="text"
                          required
                          placeholder="Last name"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="block w-full pl-10 pr-3 py-2.5 border rounded-lg text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          style={{ borderColor: "var(--color-border)", background: "var(--color-bg)" }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Contact row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        className="block text-xs font-bold uppercase tracking-wider mb-1.5"
                        style={{ color: "var(--color-text-secondary)" }}
                      >
                        Email Address
                      </label>
                      <div className="relative">
                        <User
                          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
                          style={{ color: "var(--color-text-disabled)" }}
                        />
                        <input
                          type="email"
                          disabled
                          value={email}
                          className="block w-full pl-10 pr-3 py-2.5 border rounded-lg text-sm cursor-not-allowed opacity-60"
                          style={{
                            borderColor: "var(--color-border)",
                            background: "var(--color-neutral-100)",
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <label
                        className="block text-xs font-bold uppercase tracking-wider mb-1.5"
                        style={{ color: "var(--color-text-secondary)" }}
                      >
                        Phone Number
                      </label>
                      <div className="relative">
                        <Phone
                          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
                          style={{ color: "var(--color-text-disabled)" }}
                        />
                        <input
                          type="tel"
                          placeholder="+1 (555) 000-0000"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="block w-full pl-10 pr-3 py-2.5 border rounded-lg text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          style={{ borderColor: "var(--color-border)", background: "var(--color-bg)" }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Professional row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        className="block text-xs font-bold uppercase tracking-wider mb-1.5"
                        style={{ color: "var(--color-text-secondary)" }}
                      >
                        Professional Headline <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Briefcase
                          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
                          style={{ color: "var(--color-text-disabled)" }}
                        />
                        <input
                          type="text"
                          required
                          placeholder="e.g. Senior Software Engineer"
                          value={headline}
                          onChange={(e) => setHeadline(e.target.value)}
                          className="block w-full pl-10 pr-3 py-2.5 border rounded-lg text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          style={{ borderColor: "var(--color-border)", background: "var(--color-bg)" }}
                        />
                      </div>
                    </div>
                    <div>
                      <label
                        className="block text-xs font-bold uppercase tracking-wider mb-1.5"
                        style={{ color: "var(--color-text-secondary)" }}
                      >
                        Location <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <MapPin
                          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
                          style={{ color: "var(--color-text-disabled)" }}
                        />
                        <input
                          type="text"
                          required
                          placeholder="e.g. San Francisco, CA"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          className="block w-full pl-10 pr-3 py-2.5 border rounded-lg text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          style={{ borderColor: "var(--color-border)", background: "var(--color-bg)" }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Experience Level */}
                  <div>
                    <label
                      className="block text-xs font-bold uppercase tracking-wider mb-1.5"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      Experience Level
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { val: "entry", label: "Entry-Level" },
                        { val: "mid", label: "Mid-Level" },
                        { val: "senior", label: "Senior" },
                        { val: "lead", label: "Lead / Manager" },
                      ].map((level) => (
                        <button
                          key={level.val}
                          type="button"
                          onClick={() => setExperienceLevel(level.val)}
                          className="py-2 px-3 text-xs font-semibold rounded-lg border transition-all duration-150 text-center"
                          style={
                            experienceLevel === level.val
                              ? {
                                  background: "var(--color-primary-600)",
                                  borderColor: "var(--color-primary-600)",
                                  color: "white",
                                }
                              : {
                                  background: "white",
                                  borderColor: "var(--color-border)",
                                  color: "var(--color-text-secondary)",
                                }
                          }
                        >
                          {level.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Bio */}
                  <div>
                    <label
                      className="block text-xs font-bold uppercase tracking-wider mb-1.5"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      Short Bio / Summary
                    </label>
                    <div className="relative">
                      <FileText
                        className="absolute top-3 left-3 h-4 w-4 pointer-events-none"
                        style={{ color: "var(--color-text-disabled)" }}
                      />
                      <textarea
                        rows={4}
                        placeholder="Briefly describe your career objectives and what roles you fit best…"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2.5 border rounded-lg text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                        style={{ borderColor: "var(--color-border)", background: "var(--color-bg)" }}
                      />
                    </div>
                  </div>

                  <div
                    className="flex items-center justify-between pt-2 border-t"
                    style={{ borderColor: "var(--color-neutral-100)" }}
                  >
                    <button
                      type="button"
                      onClick={() => router.push("/signup")}
                      className="text-xs font-medium transition-colors"
                      style={{ color: "var(--color-text-secondary)" }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.color = "var(--color-text-primary)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.color = "var(--color-text-secondary)")
                      }
                    >
                      ← Back to Sign Up
                    </button>

                    <button
                      type="submit"
                      disabled={isSubmitting || !firstName || !lastName || !headline || !location}
                      className="flex items-center gap-2 py-2.5 px-5 rounded-lg text-sm text-white font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                      style={{
                        background:
                          "linear-gradient(135deg, var(--color-primary-700), var(--color-primary-500))",
                      }}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Saving…</span>
                        </>
                      ) : (
                        <>
                          <span>Save &amp; Continue</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-white/40 mt-5">
          Your data is secure and encrypted. JobFits never sells your information.
        </p>
      </div>
    </div>
  );
}
