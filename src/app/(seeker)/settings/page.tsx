"use client";
import React, { useState } from "react";
import { User, Lock, Check, Mail, Phone, Eye, EyeOff, Palette, Sun, Moon, Laptop } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/utils/cn";
import { useTheme } from "@/providers/theme-provider";
import { toast } from "@/stores/toast-store";
import { useProfile } from "@/features/user-profile/hooks/use-profile";
import { useSession, displayName } from "@/features/auth/hooks/use-session";
import { ProfileAvatar } from "@/features/user-profile/components/profile-avatar";

/* ─────────────────────────── MOCK DATA ─────────────────────── */
/* ─────────────────────────── COMPONENT ─────────────────────── */

export default function SettingsPage() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { user } = useSession();
  const { profile } = useProfile();
  const [activeSection, setActiveSection] = useState<"account" | "security" | "appearance">("account");

  // Profile Form State
  const [email, setEmail] = useState("test@jobfits.co");
  const [phone, setPhone] = useState("+1 (415) 555-0182");

  // Password Change Form State
  const [currPassword, setCurrPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [passStrength, setPassStrength] = useState(0);

  // 2FA state

  // OAuth status states

  // Success states
  const [successMsg, setSuccessMsg] = useState("");

  const checkStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score += 25;
    if (/[A-Z]/.test(pass)) score += 25;
    if (/[0-9]/.test(pass)) score += 25;
    if (/[^A-Za-z0-9]/.test(pass)) score += 25;
    setPassStrength(score);
  };

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg("Account details updated successfully!");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match!");
      return;
    }
    toast.success("Password changed successfully!");
    setSuccessMsg("Password changed successfully!");
    setCurrPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPassStrength(0);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const menuItems = [
    { id: "account", label: "Account Settings", icon: User, desc: "Email, phone & profile context" },
    { id: "security", label: "Sign-In & Security", icon: Lock, desc: "Password, 2FA & protection" },
    { id: "appearance", label: "Appearance", icon: Palette, desc: "Theme & visual preferences" },
  ] as const;

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">

      {/* ── HEADER ── */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--color-text-primary)" }}>Settings</h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--color-text-tertiary)" }}>
          Manage your login credentials, safety options, and linked apps
        </p>
      </div>

      {/* ── ALERT MESSAGE ── */}
      {successMsg && (
        <div className="p-4 rounded-xl border flex items-center gap-3 animate-fade-in"
          style={{ background: "var(--color-success-50)", borderColor: "var(--color-success-100)" }}>
          <Check className="w-5 h-5 flex-shrink-0" style={{ color: "var(--color-success-600)" }} />
          <span className="text-sm font-semibold" style={{ color: "var(--color-success-700)" }}>
            {successMsg}
          </span>
        </div>
      )}

      {/* ── TWO COLUMN / MOBILE TABBED LAYOUT ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

        {/* ── MOBILE SUB-TABS (<md) ── */}
        <div className="md:hidden flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4 no-scrollbar">
          {menuItems.map(item => {
            const Icon = item.icon;
            const active = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={cn(
                  "flex items-center gap-2 px-3.5 py-2 rounded-lg border text-xs font-bold whitespace-nowrap shrink-0 transition-all duration-200 active:scale-95",
                  active ? "shadow-sm" : ""
                )}
                style={{
                  background: active ? "var(--color-primary-50)" : "var(--color-card)",
                  borderColor: active ? "var(--color-primary-300)" : "var(--color-border)",
                  color: active ? "var(--color-primary-700)" : "var(--color-text-secondary)",
                }}
              >
                <Icon className="w-3.5 h-3.5" style={{ color: active ? "var(--color-primary-600)" : "var(--color-text-tertiary)" }} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* ── DESKTOP SIDEBAR MENU (>=md) ── */}
        <div className="hidden md:block md:col-span-1 space-y-2">
          {menuItems.map(item => {
            const Icon = item.icon;
            const active = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={cn(
                  "w-full text-left p-3.5 rounded-xl border flex items-start gap-3 transition-all duration-200",
                  active ? "shadow-sm" : "hover:bg-[var(--color-surface-hover)]"
                )}
                style={{
                  background: active ? "var(--color-card)" : "transparent",
                  borderColor: active ? "var(--color-border)" : "transparent"
                }}
              >
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: active ? "var(--color-primary-50)" : "var(--color-neutral-100)" }}>
                  <Icon className="w-4 h-4" style={{ color: active ? "var(--color-primary-600)" : "var(--color-text-secondary)" }} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold leading-tight"
                    style={{ color: active ? "var(--color-primary-800)" : "var(--color-text-primary)" }}>
                    {item.label}
                  </p>
                  <p className="text-[10px] mt-0.5 leading-none" style={{ color: "var(--color-text-tertiary)" }}>
                    {item.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* ── CONTENT PANEL ── */}
        <div className="md:col-span-3 space-y-6">

          {/* 1. ACCOUNT PANEL */}
          {activeSection === "account" && (
            <div className="rounded-xl border p-6 space-y-6"
              style={{ background: "var(--color-card)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-sm)" }}>
              <div>
                <h2 className="text-base font-bold" style={{ color: "var(--color-text-primary)" }}>Account Settings</h2>
                <p className="text-xs mt-0.5" style={{ color: "var(--color-text-tertiary)" }}>
                  Update your profile picture, contact email, and registered phone number
                </p>
              </div>

              {/* Profile Photo Section */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pb-6 border-b" style={{ borderColor: "var(--color-border)" }}>
                <ProfileAvatar
                  photoUrl={profile?.photoUrl}
                  name={profile?.fullName || displayName(user).fullName || "User"}
                  initials={displayName(user).initials}
                  size="xl"
                  editable={true}
                  showBorder={true}
                />
                <div>
                  <h3 className="text-sm font-bold" style={{ color: "var(--color-text-primary)" }}>Profile Picture</h3>
                  <p className="text-xs mt-0.5" style={{ color: "var(--color-text-tertiary)" }}>
                    Click your avatar or the camera icon to upload a custom profile image.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSaveAccount} className="space-y-4 max-w-md">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--color-text-secondary)" }}>
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full text-sm rounded-md border py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      style={{ borderColor: "var(--color-border)", background: "var(--color-surface)", color: "var(--color-text-primary)" }}
                    />
                    <Mail className="absolute left-3.5 top-3 w-4 h-4" style={{ color: "var(--color-text-tertiary)" }} />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--color-text-secondary)" }}>
                    Phone Number
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="w-full text-sm rounded-md border py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      style={{ borderColor: "var(--color-border)", background: "var(--color-surface)", color: "var(--color-text-primary)" }}
                    />
                    <Phone className="absolute left-3.5 top-3 w-4 h-4" style={{ color: "var(--color-text-tertiary)" }} />
                  </div>
                </div>

                <Button type="submit" className="text-xs">
                  Save Settings
                </Button>
              </form>
            </div>
          )}

          {/* 2. SECURITY PANEL */}
          {activeSection === "security" && (
            <div className="space-y-6">

              {/* Password card */}
              <div className="rounded-xl border p-6 space-y-6"
                style={{ background: "var(--color-card)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-sm)" }}>
                <div>
                  <h2 className="text-base font-bold" style={{ color: "var(--color-text-primary)" }}>Update Password</h2>
                  <p className="text-xs mt-0.5" style={{ color: "var(--color-text-tertiary)" }}>
                    Change your password frequently to protect your profile details
                  </p>
                </div>

                <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-md">
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--color-text-secondary)" }}>
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={currPassword}
                      onChange={e => setCurrPassword(e.target.value)}
                      className="w-full text-sm rounded-md border py-2.5 px-3.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--color-text-secondary)" }}>
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPass ? "text" : "password"}
                        value={newPassword}
                        onChange={e => { setNewPassword(e.target.value); checkStrength(e.target.value); }}
                        className="w-full text-sm rounded-md border py-2.5 pl-3.5 pr-10 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass(!showPass)}
                        className="absolute right-3 top-3 hover:text-primary-600 transition-colors"
                      >
                        {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Password strength bar */}
                    {newPassword && (
                      <div className="space-y-1 mt-1.5">
                        <div className="flex justify-between items-center text-[10px] font-bold">
                          <span style={{ color: "var(--color-text-tertiary)" }}>Password strength</span>
                          <span style={{
                            color: passStrength >= 75 ? "var(--color-success-600)" : passStrength >= 50 ? "var(--color-warning-600)" : "var(--color-error-600)"
                          }}>
                            {passStrength >= 75 ? "Strong" : passStrength >= 50 ? "Fair" : "Weak"}
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full" style={{ background: "var(--color-border)" }}>
                          <div className="h-1.5 rounded-full transition-all duration-300"
                            style={{
                              width: `${passStrength}%`,
                              background: passStrength >= 75 ? "var(--color-success-500)" : passStrength >= 50 ? "var(--color-warning-500)" : "var(--color-error-500)"
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--color-text-secondary)" }}>
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      className="w-full text-sm rounded-md border py-2.5 px-3.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
                    />
                  </div>

                  <Button type="submit" className="text-xs">
                    Change Password
                  </Button>
                </form>
              </div>
            </div>
          )}

          {/* 3. APPEARANCE PANEL */}
          {activeSection === "appearance" && (
            <div
              className="rounded-xl border p-6 space-y-6"
              style={{ background: "var(--color-card)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-sm)" }}
            >
              <div>
                <h2 className="text-base font-bold" style={{ color: "var(--color-text-primary)" }}>Appearance</h2>
                <p className="text-xs mt-0.5" style={{ color: "var(--color-text-tertiary)" }}>
                  Customize how JobFits looks on your device
                </p>
              </div>

              <div className="space-y-4">
                <label className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--color-text-secondary)" }}>
                  Theme Preference
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    {
                      id: "light" as const,
                      label: "Light Mode",
                      desc: "Clean light background with purple accents",
                      icon: Sun,
                    },
                    {
                      id: "dark" as const,
                      label: "Dark Mode",
                      desc: "Easy on the eyes in low-light environments",
                      icon: Moon,
                    },
                    {
                      id: "system" as const,
                      label: "System Default",
                      desc: `Automatically match OS (${resolvedTheme === "dark" ? "Dark" : "Light"})`,
                      icon: Laptop,
                    },
                  ].map((opt) => {
                    const isSelected = theme === opt.id;
                    const Icon = opt.icon;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setTheme(opt.id)}
                        className={cn(
                          "flex flex-col text-left p-4 rounded-xl border transition-all duration-200 cursor-pointer relative",
                          isSelected
                            ? "border-primary-500 ring-2 ring-primary-500/20 shadow-sm"
                            : "hover:border-neutral-300"
                        )}
                        style={{
                          background: isSelected ? "var(--color-primary-50)" : "var(--color-surface)",
                          borderColor: isSelected ? "var(--color-primary-500)" : "var(--color-border)",
                        }}
                      >
                        <div className="flex items-center justify-between w-full mb-3">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{
                              background: isSelected ? "var(--color-primary-100)" : "var(--color-neutral-100)",
                              color: isSelected ? "var(--color-primary-700)" : "var(--color-text-secondary)",
                            }}
                          >
                            <Icon size={16} />
                          </div>
                          {isSelected && (
                            <Badge variant="primary" className="text-[10px] py-0.5 px-2">Active</Badge>
                          )}
                        </div>
                        <p
                          className="text-sm font-bold"
                          style={{ color: isSelected ? "var(--color-primary-900)" : "var(--color-text-primary)" }}
                        >
                          {opt.label}
                        </p>
                        <p className="text-xs mt-1" style={{ color: "var(--color-text-tertiary)" }}>
                          {opt.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* DANGER: ACCOUNT DELETION CARD (always visible at bottom) */}
          <div className="rounded-xl border p-6 border-error-200 space-y-4"
            style={{ background: "var(--color-error-50)", boxShadow: "var(--shadow-sm)" }}>
            <div>
              <h2 className="text-base font-bold text-error-700">Delete Workspace</h2>
              <p className="text-xs mt-0.5 text-error-600">
                Permanently remove this account, resumes, and data from our active database.
              </p>
            </div>
            <Button variant="danger" className="text-xs">
              Delete Account
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
}
