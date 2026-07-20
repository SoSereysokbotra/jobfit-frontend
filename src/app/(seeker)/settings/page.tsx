"use client";

import React, { useState, useEffect } from "react";
import {
  Settings, User, Lock, Link2, Shield, Trash2, Key,
  Check, Mail, Phone, Eye, EyeOff, Loader2, AlertCircle,
  Bell, HelpCircle, History, Info, Laptop, Smartphone,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/utils/cn";

/* ─────────────────────────── MOCK DATA ─────────────────────── */
const MOCK_SESSIONS = [
  {
    id: 1,
    device: "Windows 11 · Chrome Browser",
    ip: "192.168.1.14",
    location: "San Francisco, CA",
    current: true,
    lastActive: "Active now",
    icon: Laptop,
  },
  {
    id: 2,
    device: "iPhone 15 Pro · Chrome Mobile",
    ip: "172.56.21.88",
    location: "San Francisco, CA",
    current: false,
    lastActive: "2 hours ago",
    icon: Smartphone,
  },
  {
    id: 3,
    device: "macOS Sonoma · Safari Browser",
    ip: "198.51.100.42",
    location: "Oakland, CA",
    current: false,
    lastActive: "3 days ago",
    icon: Laptop,
  },
];

const MOCK_ACTIVITY_LOG = [
  { action: "Password changed successfully", time: "Jul 14, 2026 at 2:30 PM", ip: "192.168.1.14" },
  { action: "Logged in via Google OAuth", time: "Jul 10, 2026 at 9:15 AM", ip: "192.168.1.14" },
  { action: "Two-Factor Authentication enabled", time: "Jun 28, 2026 at 4:10 PM", ip: "172.56.21.88" },
  { action: "Email address verified", time: "Jun 15, 2026 at 11:04 AM", ip: "192.168.1.14" },
];

/* ─────────────────────────── COMPONENT ─────────────────────── */

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<"account" | "security" | "integrations" | "sessions">("account");

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
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);

  // OAuth status states
  const [googleConnected, setGoogleConnected] = useState(true);
  const [linkedinConnected, setLinkedinConnected] = useState(false);

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
      alert("New passwords do not match!");
      return;
    }
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
    { id: "integrations", label: "Connected Accounts", icon: Link2, desc: "Linked OAuth applications" },
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

      {/* ── TWO COLUMN LAYOUT ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

        {/* ── SIDE BAR MENU ── */}
        <div className="md:col-span-1 space-y-2">
          {menuItems.map(item => {
            const Icon = item.icon;
            const active = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={cn(
                  "w-full text-left p-3.5 rounded-xl border flex items-start gap-3 transition-all duration-200",
                  active ? "shadow-sm" : "hover:bg-neutral-50"
                )}
                style={{
                  background: active ? "var(--color-card)" : "transparent",
                  borderColor: active ? "var(--color-border)" : "transparent",
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
                  Update your contact email and registered phone number
                </p>
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

          {/* 3. INTEGRATIONS PANEL */}
          {activeSection === "integrations" && (
            <div className="rounded-xl border p-6 space-y-6"
              style={{ background: "var(--color-card)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-sm)" }}>
              <div>
                <h2 className="text-base font-bold" style={{ color: "var(--color-text-primary)" }}>Connected Apps</h2>
                <p className="text-xs mt-0.5" style={{ color: "var(--color-text-tertiary)" }}>
                  Link single sign-on providers to login rapidly
                </p>
              </div>

              <div className="space-y-4">
                {[
                  {
                    id: "google",
                    name: "Google Account",
                    connected: googleConnected,
                    set: setGoogleConnected,
                    icon: (
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                      </svg>
                    ),
                  },
                  {
                    id: "linkedin",
                    name: "LinkedIn Profile",
                    connected: linkedinConnected,
                    set: setLinkedinConnected,
                    icon: (
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#0077B5">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                      </svg>
                    ),
                  },
                ].map(app => (
                  <div
                    key={app.id}
                    className="flex items-center justify-between p-4 rounded-xl border"
                    style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center border"
                        style={{ background: "var(--color-bg-secondary)", borderColor: "var(--color-border)" }}>
                        {app.icon}
                      </div>
                      <div>
                        <p className="text-sm font-bold" style={{ color: "var(--color-text-primary)" }}>{app.name}</p>
                        <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
                          {app.connected ? "Used for fast single sign-on" : "Not connected"}
                        </p>
                      </div>
                    </div>

                    {app.connected ? (
                      <div className="flex items-center gap-3">
                        <Badge variant="success">Connected</Badge>
                        <Button
                          variant="ghost"
                          className="text-xs py-1.5 text-error-600 hover:bg-error-50"
                          onClick={() => app.set(false)}
                        >
                          Disconnect
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        className="text-xs py-1.5"
                        onClick={() => app.set(true)}
                      >
                        Connect
                      </Button>
                    )}
                  </div>
                ))}
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
