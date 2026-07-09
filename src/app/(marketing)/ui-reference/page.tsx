"use client";

import React, { useState } from "react";
import {
  Search, Eye, EyeOff, Upload, ChevronDown, ChevronRight,
  Heart, Bookmark, Share2, MoreHorizontal, Bell, Settings,
  User, Briefcase, FileText, BarChart3, Star, MapPin,
  DollarSign, Clock, Building2, GraduationCap, Award,
  TrendingUp, CheckCircle2, AlertCircle, AlertTriangle,
  Info, XCircle, X, Plus, Minus, Filter, ArrowUpDown,
  Home, Mail, Lock, Calendar, Trash2, Edit, Download,
  ExternalLink, ChevronLeft, ChevronsLeft, ChevronsRight,
  Loader2, Menu, LogOut, HelpCircle, Zap, Target,
  PieChart, Activity, ArrowRight, Check, Copy, Send,
} from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, PieChart as RePieChart, Pie, Cell,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";

/* ═══════════════════════════════════════════════════════════════
   SECTION NAVIGATION DATA
   ═══════════════════════════════════════════════════════════════ */
const SECTIONS = [
  { id: "colors", label: "Colors", icon: "🎨" },
  { id: "typography", label: "Typography", icon: "🔤" },
  { id: "spacing", label: "Spacing", icon: "📐" },
  { id: "radius", label: "Border Radius", icon: "⬜" },
  { id: "shadows", label: "Shadows", icon: "🌑" },
  { id: "buttons", label: "Buttons", icon: "🔘" },
  { id: "inputs", label: "Inputs", icon: "📝" },
  { id: "cards", label: "Cards", icon: "🃏" },
  { id: "badges", label: "Badges", icon: "🏷️" },
  { id: "tables", label: "Tables", icon: "📊" },
  { id: "navigation", label: "Navigation", icon: "🧭" },
  { id: "dashboard", label: "Dashboard", icon: "📈" },
  { id: "job-components", label: "Job Components", icon: "💼" },
  { id: "user-components", label: "User Components", icon: "👤" },
  { id: "feedback", label: "Feedback", icon: "💬" },
  { id: "modals", label: "Modals", icon: "🪟" },
  { id: "charts", label: "Charts", icon: "📉" },
  { id: "icons", label: "Icons", icon: "✨" },
  { id: "layouts", label: "Layouts", icon: "🏗️" },
  { id: "responsive", label: "Responsive", icon: "📱" },
  { id: "usage-rules", label: "Usage Rules", icon: "📋" },
  { id: "principles", label: "Principles", icon: "⚡" },
];

/* ═══════════════════════════════════════════════════════════════
   CHART DATA
   ═══════════════════════════════════════════════════════════════ */
const lineData = [
  { month: "Jan", applications: 4, interviews: 1 },
  { month: "Feb", applications: 7, interviews: 2 },
  { month: "Mar", applications: 12, interviews: 4 },
  { month: "Apr", applications: 9, interviews: 3 },
  { month: "May", applications: 15, interviews: 5 },
  { month: "Jun", applications: 18, interviews: 7 },
];
const barData = [
  { name: "Tech", jobs: 120 },
  { name: "Finance", jobs: 85 },
  { name: "Health", jobs: 65 },
  { name: "Education", jobs: 40 },
  { name: "Retail", jobs: 30 },
];
const pieData = [
  { name: "Applied", value: 45 },
  { name: "Interview", value: 20 },
  { name: "Offer", value: 8 },
  { name: "Rejected", value: 27 },
];
const areaData = [
  { week: "W1", score: 72 },
  { week: "W2", score: 78 },
  { week: "W3", score: 75 },
  { week: "W4", score: 82 },
  { week: "W5", score: 88 },
  { week: "W6", score: 92 },
];
const PIE_COLORS = ["#7B2CBF", "#9D4EDD", "#10B981", "#EF4444"];

/* ═══════════════════════════════════════════════════════════════
   HELPER COMPONENTS
   ═══════════════════════════════════════════════════════════════ */

function SectionHeader({ id, title, description }: { id: string; title: string; description: string }) {
  return (
    <div id={id} className="scroll-mt-24 mb-8">
      <h2
        className="text-2xl font-bold mb-2"
        style={{ color: "var(--color-primary-700)" }}
      >
        {title}
      </h2>
      <p style={{ color: "var(--color-text-secondary)", fontSize: "var(--font-size-base)" }}>
        {description}
      </p>
      <div
        className="mt-4 h-px w-full"
        style={{ background: "linear-gradient(to right, var(--color-primary-500), transparent)" }}
      />
    </div>
  );
}

function TokenCard({ children, label }: { children: React.ReactNode; label?: string }) {
  return (
    <div
      className="p-4 rounded-lg border"
      style={{
        background: "var(--color-card)",
        borderColor: "var(--color-border)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      {label && (
        <p className="text-xs font-semibold mb-3 uppercase tracking-wider" style={{ color: "var(--color-text-tertiary)" }}>
          {label}
        </p>
      )}
      {children}
    </div>
  );
}

function CodeTag({ children }: { children: React.ReactNode }) {
  return (
    <code
      className="text-xs px-1.5 py-0.5 rounded font-mono"
      style={{
        background: "var(--color-primary-50)",
        color: "var(--color-primary-700)",
        border: "1px solid var(--color-primary-100)",
      }}
    >
      {children}
    </code>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE COMPONENT
   ═══════════════════════════════════════════════════════════════ */

export default function UIReferencePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("colors");
  const [showPassword, setShowPassword] = useState(false);
  const [modalOpen, setModalOpen] = useState<string | null>(null);
  const [switchOn, setSwitchOn] = useState(true);
  const [sliderValue, setSliderValue] = useState(65);
  const [tabActive, setTabActive] = useState("all");

  return (
    <div className="min-h-screen" style={{ background: "var(--color-bg-secondary)" }}>
      {/* ─── HERO HEADER ──────────────────────────────────── */}
      <header
        className="sticky top-0 z-50 border-b backdrop-blur-xl"
        style={{
          background: "rgba(255,255,255,0.85)",
          borderColor: "var(--color-border)",
        }}
      >
        <div className="max-w-[1440px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-neutral-100"
            >
              <Menu size={20} />
            </button>
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
              style={{ background: "linear-gradient(135deg, var(--color-primary-700), var(--color-primary-500))" }}
            >
              JF
            </div>
            <div>
              <h1 className="text-lg font-bold" style={{ color: "var(--color-primary-900)" }}>
                JobFits Design System
              </h1>
              <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
                Master UI Reference — v1.0
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="text-xs px-3 py-1 rounded-full font-medium"
              style={{
                background: "var(--color-success-100)",
                color: "var(--color-success-600)",
              }}
            >
              22 Sections
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-[1440px] mx-auto flex">
        {/* ─── SIDEBAR NAVIGATION ─────────────────────────── */}
        <aside
          className={`
            fixed lg:sticky top-[73px] left-0 z-40 h-[calc(100vh-73px)]
            w-64 overflow-y-auto border-r p-4
            transition-transform duration-300
            lg:translate-x-0
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          `}
          style={{
            background: "var(--color-bg)",
            borderColor: "var(--color-border)",
          }}
        >
          <nav className="space-y-1">
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                onClick={() => {
                  setActiveSection(s.id);
                  setSidebarOpen(false);
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                style={{
                  background: activeSection === s.id ? "var(--color-primary-50)" : "transparent",
                  color: activeSection === s.id ? "var(--color-primary-700)" : "var(--color-text-secondary)",
                  borderLeft: activeSection === s.id ? "3px solid var(--color-primary-500)" : "3px solid transparent",
                }}
              >
                <span className="text-base">{s.icon}</span>
                {s.label}
              </a>
            ))}
          </nav>
        </aside>

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/30 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ─── MAIN CONTENT ───────────────────────────────── */}
        <main className="flex-1 min-w-0 p-6 lg:p-10 space-y-16">

          {/* ─── HERO BANNER ─────────────────────────────── */}
          <section
            className="rounded-2xl p-8 lg:p-12 text-white relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, var(--color-primary-900), var(--color-primary-700), var(--color-primary-500))",
            }}
          >
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-96 h-96 rounded-full" style={{ background: "var(--color-primary-400)", filter: "blur(100px)" }} />
              <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full" style={{ background: "var(--color-primary-300)", filter: "blur(80px)" }} />
            </div>
            <div className="relative z-10">
              <p className="text-sm font-medium opacity-80 mb-2 uppercase tracking-wider">Visual Source of Truth</p>
              <h1 className="text-3xl lg:text-4xl font-extrabold mb-4">
                JobFits Master UI Reference
              </h1>
              <p className="text-lg opacity-90 max-w-2xl mb-6">
                Every color, component, and pattern used across the JobFits platform.
                Built from the User Flows Guide v2.1 — this page is the canonical reference
                for consistent, reusable UI development.
              </p>
              <div className="flex flex-wrap gap-3">
                {["22 Sections", "5 Brand Colors", "100+ Components", "Fully Responsive"].map((t) => (
                  <span
                    key={t}
                    className="px-4 py-1.5 rounded-full text-sm font-medium"
                    style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(10px)" }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* ═══════════════════════════════════════════════════
             SECTION 1: COLOR SYSTEM
             ═══════════════════════════════════════════════════ */}
          <section>
            <SectionHeader
              id="colors"
              title="1. Color System"
              description="Every approved color in the JobFits design system. All values are defined as CSS custom properties in globals.css."
            />

            {/* Brand Primary */}
            <TokenCard label="Brand Primary — Sacred Colors">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {[
                  { name: "primary-900", hex: "#240046", var: "--color-primary-900" },
                  { name: "primary-800", hex: "#3C096C", var: "--color-primary-800" },
                  { name: "primary-700", hex: "#5A189A", var: "--color-primary-700" },
                  { name: "primary-600", hex: "#7B2CBF", var: "--color-primary-600" },
                  { name: "primary-500", hex: "#9D4EDD", var: "--color-primary-500" },
                ].map((c) => (
                  <div key={c.name} className="text-center">
                    <div
                      className="w-full h-20 rounded-lg mb-2 border"
                      style={{ background: c.hex, borderColor: "rgba(0,0,0,0.05)" }}
                    />
                    <p className="text-xs font-semibold" style={{ color: "var(--color-text-primary)" }}>{c.name}</p>
                    <p className="text-xs font-mono" style={{ color: "var(--color-text-tertiary)" }}>{c.hex}</p>
                    <CodeTag>{c.var}</CodeTag>
                  </div>
                ))}
              </div>
            </TokenCard>

            <div className="h-6" />

            {/* Extended Primary */}
            <TokenCard label="Extended Primary Tints">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {[
                  { name: "primary-400", hex: "#B185DB", var: "--color-primary-400" },
                  { name: "primary-300", hex: "#C9A7EB", var: "--color-primary-300" },
                  { name: "primary-200", hex: "#DCC8F5", var: "--color-primary-200" },
                  { name: "primary-100", hex: "#EDE0FA", var: "--color-primary-100" },
                  { name: "primary-50", hex: "#F8F4FE", var: "--color-primary-50" },
                ].map((c) => (
                  <div key={c.name} className="text-center">
                    <div
                      className="w-full h-20 rounded-lg mb-2 border"
                      style={{ background: c.hex, borderColor: "var(--color-border)" }}
                    />
                    <p className="text-xs font-semibold" style={{ color: "var(--color-text-primary)" }}>{c.name}</p>
                    <p className="text-xs font-mono" style={{ color: "var(--color-text-tertiary)" }}>{c.hex}</p>
                    <CodeTag>{c.var}</CodeTag>
                  </div>
                ))}
              </div>
            </TokenCard>

            <div className="h-6" />

            {/* Neutral */}
            <TokenCard label="Neutral Scale">
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {[
                  { name: "950", hex: "#0A0A0F" }, { name: "900", hex: "#1A1A2E" },
                  { name: "800", hex: "#2D2D44" }, { name: "700", hex: "#44445A" },
                  { name: "600", hex: "#5C5C72" }, { name: "500", hex: "#78788A" },
                  { name: "400", hex: "#9898A8" }, { name: "300", hex: "#B8B8C5" },
                  { name: "200", hex: "#D4D4DE" }, { name: "100", hex: "#EDEDF2" },
                  { name: "50", hex: "#F7F7FA" },
                ].map((c) => (
                  <div key={c.name} className="text-center">
                    <div
                      className="w-full h-14 rounded-lg mb-1 border"
                      style={{ background: c.hex, borderColor: "var(--color-border)" }}
                    />
                    <p className="text-xs font-mono" style={{ color: "var(--color-text-tertiary)" }}>
                      {c.name} · {c.hex}
                    </p>
                  </div>
                ))}
              </div>
            </TokenCard>

            <div className="h-6" />

            {/* Semantic */}
            <TokenCard label="Semantic Colors">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Success", colors: [
                    { n: "600", h: "#059669" }, { n: "500", h: "#10B981" },
                    { n: "100", h: "#D1FAE5" }, { n: "50", h: "#ECFDF5" },
                  ]},
                  { label: "Warning", colors: [
                    { n: "600", h: "#D97706" }, { n: "500", h: "#F59E0B" },
                    { n: "100", h: "#FEF3C7" }, { n: "50", h: "#FFFBEB" },
                  ]},
                  { label: "Error", colors: [
                    { n: "600", h: "#DC2626" }, { n: "500", h: "#EF4444" },
                    { n: "100", h: "#FEE2E2" }, { n: "50", h: "#FEF2F2" },
                  ]},
                  { label: "Info", colors: [
                    { n: "600", h: "#2563EB" }, { n: "500", h: "#3B82F6" },
                    { n: "100", h: "#DBEAFE" }, { n: "50", h: "#EFF6FF" },
                  ]},
                ].map((group) => (
                  <div key={group.label}>
                    <p className="text-xs font-semibold mb-2" style={{ color: "var(--color-text-secondary)" }}>{group.label}</p>
                    <div className="flex gap-1">
                      {group.colors.map((c) => (
                        <div key={c.n} className="flex-1">
                          <div className="h-10 rounded border" style={{ background: c.h, borderColor: "var(--color-border)" }} />
                          <p className="text-[10px] text-center mt-1 font-mono" style={{ color: "var(--color-text-tertiary)" }}>{c.n}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </TokenCard>

            <div className="h-6" />

            {/* Semantic Aliases */}
            <TokenCard label="Semantic Aliases">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {[
                  { name: "Background", var: "--color-bg", preview: "#FFFFFF" },
                  { name: "Surface", var: "--color-surface", preview: "#FFFFFF" },
                  { name: "Card", var: "--color-card", preview: "#FFFFFF" },
                  { name: "Card Hover", var: "--color-card-hover", preview: "#F8F4FE" },
                  { name: "Border", var: "--color-border", preview: "#D4D4DE" },
                  { name: "Border Focus", var: "--color-border-focus", preview: "#9D4EDD" },
                  { name: "Text Primary", var: "--color-text-primary", preview: "#1A1A2E" },
                  { name: "Text Secondary", var: "--color-text-secondary", preview: "#5C5C72" },
                  { name: "Text Disabled", var: "--color-text-disabled", preview: "#9898A8" },
                  { name: "Disabled", var: "--color-disabled", preview: "#B8B8C5" },
                  { name: "Hover", var: "--color-hover", preview: "#7B2CBF" },
                  { name: "Active", var: "--color-active", preview: "#3C096C" },
                ].map((c) => (
                  <div key={c.name} className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded border shrink-0" style={{ background: c.preview, borderColor: "var(--color-border)" }} />
                    <div>
                      <p className="text-xs font-medium" style={{ color: "var(--color-text-primary)" }}>{c.name}</p>
                      <p className="text-[10px] font-mono" style={{ color: "var(--color-text-tertiary)" }}>{c.var}</p>
                    </div>
                  </div>
                ))}
              </div>
            </TokenCard>
          </section>

          {/* ═══════════════════════════════════════════════════
             SECTION 2: TYPOGRAPHY
             ═══════════════════════════════════════════════════ */}
          <section>
            <SectionHeader
              id="typography"
              title="2. Typography"
              description="Inter font family with a consistent type scale. All sizes use CSS custom properties."
            />
            <TokenCard>
              <div className="space-y-6">
                {[
                  { name: "Hero Title", size: "var(--font-size-5xl)", weight: "800", lh: "1.2", example: "Find Your Perfect Career Match" },
                  { name: "Page Title", size: "var(--font-size-4xl)", weight: "700", lh: "1.2", example: "Your Dashboard" },
                  { name: "Section Title", size: "var(--font-size-2xl)", weight: "700", lh: "1.2", example: "Personalized Recommendations" },
                  { name: "Card Title", size: "var(--font-size-xl)", weight: "600", lh: "1.3", example: "Senior Software Engineer" },
                  { name: "Subtitle", size: "var(--font-size-lg)", weight: "500", lh: "1.4", example: "AI-Powered Job Matching" },
                  { name: "Body Large", size: "var(--font-size-lg)", weight: "400", lh: "1.65", example: "We analyze your resume to find opportunities that truly match your skills and career goals." },
                  { name: "Body", size: "var(--font-size-base)", weight: "400", lh: "1.5", example: "Your application has been submitted successfully. You'll receive updates via email." },
                  { name: "Small Text", size: "var(--font-size-sm)", weight: "400", lh: "1.5", example: "Last updated 2 hours ago • 234 results found" },
                  { name: "Caption", size: "var(--font-size-xs)", weight: "400", lh: "1.5", example: "Posted 3 days ago • San Francisco, CA" },
                  { name: "Button Text", size: "var(--font-size-sm)", weight: "600", lh: "1", example: "Apply Now" },
                  { name: "Label", size: "var(--font-size-xs)", weight: "600", lh: "1", example: "EMAIL ADDRESS" },
                ].map((t) => (
                  <div key={t.name} className="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-6 pb-4 border-b" style={{ borderColor: "var(--color-neutral-100)" }}>
                    <div className="w-36 shrink-0">
                      <p className="text-xs font-semibold" style={{ color: "var(--color-primary-600)" }}>{t.name}</p>
                      <p className="text-[10px] font-mono" style={{ color: "var(--color-text-tertiary)" }}>
                        {t.size.replace("var(--font-size-", "").replace(")", "")} / {t.weight} / {t.lh}
                      </p>
                    </div>
                    <p
                      style={{
                        fontSize: t.size,
                        fontWeight: t.weight as unknown as number,
                        lineHeight: t.lh,
                        color: "var(--color-text-primary)",
                      }}
                    >
                      {t.example}
                    </p>
                  </div>
                ))}
              </div>
            </TokenCard>
          </section>

          {/* ═══════════════════════════════════════════════════
             SECTION 3: SPACING
             ═══════════════════════════════════════════════════ */}
          <section>
            <SectionHeader
              id="spacing"
              title="3. Spacing System"
              description="Consistent spacing scale used for padding, margin, and gaps throughout the application."
            />
            <TokenCard>
              <div className="space-y-4">
                {[
                  { name: "xs", value: "4px", var: "--spacing-xs", usage: "Tight inline spacing, icon gaps" },
                  { name: "sm", value: "8px", var: "--spacing-sm", usage: "Form element internal padding, compact gaps" },
                  { name: "md", value: "16px", var: "--spacing-md", usage: "Default padding, card internal spacing" },
                  { name: "lg", value: "24px", var: "--spacing-lg", usage: "Section spacing, card padding" },
                  { name: "xl", value: "32px", var: "--spacing-xl", usage: "Major section gaps, page padding" },
                  { name: "2xl", value: "48px", var: "--spacing-2xl", usage: "Hero section padding, large gaps" },
                  { name: "3xl", value: "64px", var: "--spacing-3xl", usage: "Page-level vertical rhythm" },
                ].map((s) => (
                  <div key={s.name} className="flex items-center gap-4">
                    <div className="w-16 text-right">
                      <p className="text-sm font-semibold" style={{ color: "var(--color-primary-600)" }}>{s.name}</p>
                      <p className="text-[10px] font-mono" style={{ color: "var(--color-text-tertiary)" }}>{s.value}</p>
                    </div>
                    <div
                      className="h-6 rounded"
                      style={{
                        width: s.value,
                        background: "linear-gradient(135deg, var(--color-primary-500), var(--color-primary-300))",
                      }}
                    />
                    <div className="flex-1">
                      <CodeTag>{s.var}</CodeTag>
                      <p className="text-xs mt-1" style={{ color: "var(--color-text-tertiary)" }}>{s.usage}</p>
                    </div>
                  </div>
                ))}
              </div>
            </TokenCard>
          </section>

          {/* ═══════════════════════════════════════════════════
             SECTION 4: BORDER RADIUS
             ═══════════════════════════════════════════════════ */}
          <section>
            <SectionHeader
              id="radius"
              title="4. Border Radius"
              description="Approved border radius values. Never invent new radii — use only these tokens."
            />
            <TokenCard>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
                {[
                  { name: "sm", value: "6px", var: "--radius-sm", usage: "Buttons, Inputs" },
                  { name: "md", value: "8px", var: "--radius-md", usage: "Cards, Dropdowns" },
                  { name: "lg", value: "12px", var: "--radius-lg", usage: "Modals, Panels" },
                  { name: "xl", value: "16px", var: "--radius-xl", usage: "Hero sections" },
                  { name: "2xl", value: "24px", var: "--radius-2xl", usage: "Feature cards" },
                  { name: "full", value: "9999px", var: "--radius-full", usage: "Avatars, Badges" },
                ].map((r) => (
                  <div key={r.name} className="text-center">
                    <div
                      className="w-20 h-20 mx-auto mb-2 border-2"
                      style={{
                        borderRadius: r.value,
                        borderColor: "var(--color-primary-500)",
                        background: "var(--color-primary-50)",
                      }}
                    />
                    <p className="text-xs font-semibold" style={{ color: "var(--color-primary-600)" }}>{r.name}</p>
                    <p className="text-[10px] font-mono" style={{ color: "var(--color-text-tertiary)" }}>{r.value}</p>
                    <p className="text-[10px]" style={{ color: "var(--color-text-tertiary)" }}>{r.usage}</p>
                  </div>
                ))}
              </div>
            </TokenCard>
          </section>

          {/* ═══════════════════════════════════════════════════
             SECTION 5: SHADOWS
             ═══════════════════════════════════════════════════ */}
          <section>
            <SectionHeader
              id="shadows"
              title="5. Shadow System"
              description="Brand-tinted shadows for consistent elevation. Shadows use the primary color for cohesion."
            />
            <TokenCard>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { name: "None", var: "--shadow-none" },
                  { name: "Small", var: "--shadow-sm" },
                  { name: "Medium", var: "--shadow-md" },
                  { name: "Large", var: "--shadow-lg" },
                ].map((s) => (
                  <div key={s.name} className="text-center">
                    <div
                      className="w-full h-24 rounded-lg mb-3 border"
                      style={{
                        background: "var(--color-card)",
                        borderColor: "var(--color-border)",
                        boxShadow: `var(${s.var})`,
                      }}
                    />
                    <p className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>{s.name}</p>
                    <CodeTag>{s.var}</CodeTag>
                  </div>
                ))}
              </div>
            </TokenCard>
          </section>

          {/* ═══════════════════════════════════════════════════
             SECTION 6: BUTTONS
             ═══════════════════════════════════════════════════ */}
          <section>
            <SectionHeader
              id="buttons"
              title="6. Buttons"
              description="Every button variant and state used across JobFits. Buttons use brand colors with consistent padding and radius."
            />
            <TokenCard label="Button Variants">
              <div className="flex flex-wrap gap-3 mb-6">
                <button className="px-5 py-2.5 rounded-md text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 active:scale-[0.97]" style={{ background: "var(--color-primary-600)" }}>
                  Primary
                </button>
                <button className="px-5 py-2.5 rounded-md text-sm font-semibold transition-all duration-200 hover:opacity-90 active:scale-[0.97]" style={{ background: "var(--color-primary-100)", color: "var(--color-primary-700)" }}>
                  Secondary
                </button>
                <button className="px-5 py-2.5 rounded-md text-sm font-semibold border-2 transition-all duration-200 hover:bg-primary-50 active:scale-[0.97]" style={{ borderColor: "var(--color-primary-500)", color: "var(--color-primary-600)", background: "transparent" }}>
                  Outline
                </button>
                <button className="px-5 py-2.5 rounded-md text-sm font-semibold transition-all duration-200 active:scale-[0.97]" style={{ color: "var(--color-primary-600)", background: "transparent" }}>
                  Ghost
                </button>
                <button className="px-5 py-2.5 rounded-md text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 active:scale-[0.97]" style={{ background: "var(--color-error-500)" }}>
                  Destructive
                </button>
                <button className="p-2.5 rounded-md transition-all duration-200 hover:opacity-90" style={{ background: "var(--color-primary-600)", color: "white" }}>
                  <Heart size={18} />
                </button>
              </div>
            </TokenCard>

            <div className="h-4" />

            <TokenCard label="Button States">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                <div className="text-center">
                  <button className="w-full px-4 py-2.5 rounded-md text-sm font-semibold text-white" style={{ background: "var(--color-primary-600)" }}>Default</button>
                  <p className="text-xs mt-2" style={{ color: "var(--color-text-tertiary)" }}>Normal</p>
                </div>
                <div className="text-center">
                  <button className="w-full px-4 py-2.5 rounded-md text-sm font-semibold text-white" style={{ background: "var(--color-primary-700)" }}>Hover</button>
                  <p className="text-xs mt-2" style={{ color: "var(--color-text-tertiary)" }}>:hover</p>
                </div>
                <div className="text-center">
                  <button className="w-full px-4 py-2.5 rounded-md text-sm font-semibold text-white" style={{ background: "var(--color-primary-800)" }}>Active</button>
                  <p className="text-xs mt-2" style={{ color: "var(--color-text-tertiary)" }}>:active</p>
                </div>
                <div className="text-center">
                  <button className="w-full px-4 py-2.5 rounded-md text-sm font-semibold text-white cursor-not-allowed opacity-50" style={{ background: "var(--color-primary-600)" }} disabled>Disabled</button>
                  <p className="text-xs mt-2" style={{ color: "var(--color-text-tertiary)" }}>:disabled</p>
                </div>
                <div className="text-center">
                  <button className="w-full px-4 py-2.5 rounded-md text-sm font-semibold text-white flex items-center justify-center gap-2" style={{ background: "var(--color-primary-600)" }}>
                    <Loader2 size={16} className="animate-spin" /> Loading
                  </button>
                  <p className="text-xs mt-2" style={{ color: "var(--color-text-tertiary)" }}>Loading</p>
                </div>
              </div>
            </TokenCard>

            <div className="h-4" />

            <TokenCard label="Button Sizes">
              <div className="flex flex-wrap items-end gap-3">
                <button className="px-3 py-1.5 rounded text-xs font-semibold text-white" style={{ background: "var(--color-primary-600)" }}>Small</button>
                <button className="px-5 py-2.5 rounded-md text-sm font-semibold text-white" style={{ background: "var(--color-primary-600)" }}>Medium</button>
                <button className="px-7 py-3 rounded-md text-base font-semibold text-white" style={{ background: "var(--color-primary-600)" }}>Large</button>
              </div>
            </TokenCard>
          </section>

          {/* ═══════════════════════════════════════════════════
             SECTION 7: INPUTS
             ═══════════════════════════════════════════════════ */}
          <section>
            <SectionHeader
              id="inputs"
              title="7. Inputs"
              description="Form components for every data entry pattern in JobFits — search, authentication, profiles, and filtering."
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Text Input */}
              <TokenCard label="Text Input">
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider mb-1 block" style={{ color: "var(--color-text-secondary)" }}>Full Name</label>
                    <input type="text" placeholder="John Doe" className="w-full px-3 py-2.5 rounded-md border text-sm outline-none transition-all" style={{ borderColor: "var(--color-border)", background: "var(--color-bg)" }} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider mb-1 block" style={{ color: "var(--color-text-secondary)" }}>Focused</label>
                    <input type="text" defaultValue="John Doe" className="w-full px-3 py-2.5 rounded-md border-2 text-sm outline-none" style={{ borderColor: "var(--color-primary-500)", background: "var(--color-bg)" }} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider mb-1 block" style={{ color: "var(--color-error-500)" }}>Error</label>
                    <input type="text" defaultValue="jo" className="w-full px-3 py-2.5 rounded-md border-2 text-sm outline-none" style={{ borderColor: "var(--color-error-500)", background: "var(--color-error-50)" }} />
                    <p className="text-xs mt-1" style={{ color: "var(--color-error-500)" }}>Name must be at least 3 characters</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider mb-1 block" style={{ color: "var(--color-text-disabled)" }}>Disabled</label>
                    <input type="text" placeholder="Not editable" disabled className="w-full px-3 py-2.5 rounded-md border text-sm cursor-not-allowed opacity-60" style={{ borderColor: "var(--color-border)", background: "var(--color-neutral-100)" }} />
                  </div>
                </div>
              </TokenCard>

              {/* Search Input */}
              <TokenCard label="Search Input">
                <div className="space-y-3">
                  <div className="relative">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--color-text-tertiary)" }} />
                    <input type="text" placeholder="Search job titles, skills, companies..." className="w-full pl-10 pr-4 py-2.5 rounded-md border text-sm outline-none" style={{ borderColor: "var(--color-border)", background: "var(--color-bg)" }} />
                  </div>
                </div>
              </TokenCard>

              {/* Password */}
              <TokenCard label="Password Input">
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--color-text-tertiary)" }} />
                  <input type={showPassword ? "text" : "password"} defaultValue="MySecurePassword" className="w-full pl-10 pr-10 py-2.5 rounded-md border text-sm outline-none" style={{ borderColor: "var(--color-border)", background: "var(--color-bg)" }} />
                  <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "var(--color-text-tertiary)" }}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <div className="flex gap-1 mt-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-1 flex-1 rounded-full" style={{ background: i <= 3 ? "var(--color-success-500)" : "var(--color-neutral-200)" }} />
                  ))}
                </div>
                <p className="text-xs mt-1" style={{ color: "var(--color-success-500)" }}>Strong password</p>
              </TokenCard>

              {/* Email */}
              <TokenCard label="Email Input">
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--color-text-tertiary)" }} />
                  <input type="email" placeholder="john@example.com" className="w-full pl-10 pr-4 py-2.5 rounded-md border text-sm outline-none" style={{ borderColor: "var(--color-border)", background: "var(--color-bg)" }} />
                </div>
              </TokenCard>

              {/* Textarea */}
              <TokenCard label="Textarea">
                <textarea rows={3} placeholder="Tell us about your experience..." className="w-full px-3 py-2.5 rounded-md border text-sm outline-none resize-y" style={{ borderColor: "var(--color-border)", background: "var(--color-bg)" }} />
              </TokenCard>

              {/* Select */}
              <TokenCard label="Select">
                <div className="relative">
                  <select className="w-full px-3 py-2.5 rounded-md border text-sm outline-none appearance-none cursor-pointer" style={{ borderColor: "var(--color-border)", background: "var(--color-bg)" }}>
                    <option>Select industry...</option>
                    <option>Technology</option>
                    <option>Finance</option>
                    <option>Healthcare</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--color-text-tertiary)" }} />
                </div>
              </TokenCard>

              {/* Checkbox & Radio */}
              <TokenCard label="Checkbox & Radio">
                <div className="space-y-3">
                  <p className="text-xs font-semibold" style={{ color: "var(--color-text-tertiary)" }}>Checkboxes</p>
                  {["Full-time", "Contract", "Part-time"].map((opt, i) => (
                    <label key={opt} className="flex items-center gap-2 cursor-pointer text-sm" style={{ color: "var(--color-text-primary)" }}>
                      <input type="checkbox" defaultChecked={i === 0} className="w-4 h-4 rounded accent-[#7B2CBF]" />
                      {opt}
                    </label>
                  ))}
                  <div className="h-2" />
                  <p className="text-xs font-semibold" style={{ color: "var(--color-text-tertiary)" }}>Radio Buttons</p>
                  {["On-site", "Hybrid", "Remote"].map((opt, i) => (
                    <label key={opt} className="flex items-center gap-2 cursor-pointer text-sm" style={{ color: "var(--color-text-primary)" }}>
                      <input type="radio" name="remote" defaultChecked={i === 1} className="w-4 h-4 accent-[#7B2CBF]" />
                      {opt}
                    </label>
                  ))}
                </div>
              </TokenCard>

              {/* Switch & Slider */}
              <TokenCard label="Switch & Slider">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: "var(--color-text-primary)" }}>Email notifications</span>
                    <button
                      onClick={() => setSwitchOn(!switchOn)}
                      className="relative w-11 h-6 rounded-full transition-colors duration-200"
                      style={{ background: switchOn ? "var(--color-primary-600)" : "var(--color-neutral-300)" }}
                    >
                      <span
                        className="absolute top-1 w-4 h-4 rounded-full bg-white transition-transform duration-200 shadow-sm"
                        style={{ left: switchOn ? "calc(100% - 20px)" : "4px" }}
                      />
                    </button>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1" style={{ color: "var(--color-text-tertiary)" }}>
                      <span>Match Score Filter</span>
                      <span className="font-semibold" style={{ color: "var(--color-primary-600)" }}>{sliderValue}%</span>
                    </div>
                    <input
                      type="range" min="0" max="100" value={sliderValue}
                      onChange={(e) => setSliderValue(Number(e.target.value))}
                      className="w-full h-2 rounded-full appearance-none cursor-pointer accent-[#7B2CBF]"
                      style={{ background: `linear-gradient(to right, var(--color-primary-500) ${sliderValue}%, var(--color-neutral-200) ${sliderValue}%)` }}
                    />
                  </div>
                </div>
              </TokenCard>

              {/* File Upload */}
              <TokenCard label="File Upload">
                <div
                  className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors hover:border-primary-500"
                  style={{ borderColor: "var(--color-primary-300)", background: "var(--color-primary-50)" }}
                >
                  <Upload size={32} className="mx-auto mb-2" style={{ color: "var(--color-primary-500)" }} />
                  <p className="text-sm font-medium" style={{ color: "var(--color-primary-700)" }}>
                    Drag your resume here
                  </p>
                  <p className="text-xs mt-1" style={{ color: "var(--color-text-tertiary)" }}>
                    or <span style={{ color: "var(--color-primary-600)" }} className="font-medium">choose file</span> · PDF, DOCX (max 10MB)
                  </p>
                </div>
              </TokenCard>

              {/* OTP Input */}
              <TokenCard label="OTP Input (6-digit verification)">
                <div className="flex gap-2 justify-center">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <input
                      key={i}
                      type="text"
                      maxLength={1}
                      defaultValue={i <= 4 ? String(i + 2) : ""}
                      className="w-11 h-12 text-center text-lg font-bold rounded-md border-2 outline-none"
                      style={{
                        borderColor: i <= 4 ? "var(--color-primary-500)" : "var(--color-border)",
                        color: "var(--color-primary-700)",
                        background: i <= 4 ? "var(--color-primary-50)" : "var(--color-bg)",
                      }}
                    />
                  ))}
                </div>
                <p className="text-xs text-center mt-2" style={{ color: "var(--color-text-tertiary)" }}>
                  Code expires in <span className="font-semibold" style={{ color: "var(--color-primary-600)" }}>9:42</span>
                </p>
              </TokenCard>

              {/* Date Picker */}
              <TokenCard label="Date Picker">
                <div className="relative">
                  <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--color-text-tertiary)" }} />
                  <input type="date" className="w-full pl-10 pr-4 py-2.5 rounded-md border text-sm outline-none" style={{ borderColor: "var(--color-border)", background: "var(--color-bg)" }} />
                </div>
              </TokenCard>
            </div>
          </section>

          {/* ═══════════════════════════════════════════════════
             SECTION 8: CARDS
             ═══════════════════════════════════════════════════ */}
          <section>
            <SectionHeader id="cards" title="8. Cards" description="Every card style used in JobFits. All cards share the same visual language: consistent radius, shadow, padding, and borders." />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Job Card */}
              <div className="rounded-lg border p-5 transition-all duration-200 hover:shadow-md cursor-pointer" style={{ background: "var(--color-card)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-sm)" }}>
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0" style={{ background: "var(--color-primary-600)" }}>TC</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold truncate" style={{ color: "var(--color-text-primary)" }}>Senior Software Engineer</h3>
                    <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>TechCorp · San Francisco, CA</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-lg font-bold" style={{ color: "var(--color-primary-600)" }}>92%</span>
                    <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>Match</p>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap mb-3">
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "var(--color-primary-50)", color: "var(--color-primary-700)" }}>Full-time</span>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "var(--color-neutral-100)", color: "var(--color-neutral-600)" }}>Hybrid</span>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "var(--color-success-100)", color: "var(--color-success-600)" }}>$150K–$190K</span>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 px-3 py-2 rounded-md text-xs font-semibold text-white" style={{ background: "var(--color-primary-600)" }}>Apply Now</button>
                  <button className="p-2 rounded-md border" style={{ borderColor: "var(--color-border)", color: "var(--color-text-tertiary)" }}><Heart size={16} /></button>
                  <button className="p-2 rounded-md border" style={{ borderColor: "var(--color-border)", color: "var(--color-text-tertiary)" }}><Bookmark size={16} /></button>
                </div>
                <p className="text-[10px] mt-2 text-right" style={{ color: "var(--color-text-tertiary)" }}>Job Card</p>
              </div>

              {/* Recommendation Card */}
              <div className="rounded-lg border p-5 relative overflow-hidden" style={{ background: "var(--color-card)", borderColor: "var(--color-primary-200)", boxShadow: "var(--shadow-sm)" }}>
                <div className="absolute top-0 right-0 w-20 h-20 rounded-bl-full" style={{ background: "var(--color-primary-50)" }} />
                <span className="absolute top-2 right-3 text-2xl font-bold" style={{ color: "var(--color-primary-500)" }}>⭐</span>
                <div className="mb-3">
                  <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--color-primary-500)" }}>AI Recommended</p>
                  <h3 className="text-base font-semibold" style={{ color: "var(--color-text-primary)" }}>Data Scientist</h3>
                  <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>InnovateLab · Remote</p>
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex-1 h-2 rounded-full" style={{ background: "var(--color-neutral-100)" }}>
                    <div className="h-2 rounded-full" style={{ width: "88%", background: "linear-gradient(to right, var(--color-primary-700), var(--color-primary-500))" }} />
                  </div>
                  <span className="text-sm font-bold" style={{ color: "var(--color-primary-600)" }}>88%</span>
                </div>
                <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>Skills 95% · Experience 82% · Location 88%</p>
                <p className="text-[10px] mt-3 text-right" style={{ color: "var(--color-text-tertiary)" }}>Recommendation Card</p>
              </div>

              {/* Dashboard Stat Card */}
              <div className="rounded-lg border p-5" style={{ background: "var(--color-card)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-sm)" }}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>Total Applications</p>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--color-primary-50)" }}>
                    <Briefcase size={16} style={{ color: "var(--color-primary-600)" }} />
                  </div>
                </div>
                <p className="text-3xl font-bold" style={{ color: "var(--color-text-primary)" }}>247</p>
                <p className="text-xs mt-1 flex items-center gap-1" style={{ color: "var(--color-success-600)" }}>
                  <TrendingUp size={12} /> +12% from last month
                </p>
                <p className="text-[10px] mt-3 text-right" style={{ color: "var(--color-text-tertiary)" }}>Dashboard Stat Card</p>
              </div>

              {/* Resume Card */}
              <div className="rounded-lg border p-5" style={{ background: "var(--color-card)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-sm)" }}>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "var(--color-primary-50)" }}>
                    <FileText size={20} style={{ color: "var(--color-primary-600)" }} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>Resume_v3.pdf</h3>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: "var(--color-primary-100)", color: "var(--color-primary-700)" }}>Default</span>
                    </div>
                    <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>Updated 2 days ago · 2.3 MB</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs font-medium" style={{ color: "var(--color-success-600)" }}>ATS Score: 92/100</span>
                    </div>
                  </div>
                  <button className="p-1.5 rounded" style={{ color: "var(--color-text-tertiary)" }}><MoreHorizontal size={16} /></button>
                </div>
                <p className="text-[10px] mt-3 text-right" style={{ color: "var(--color-text-tertiary)" }}>Resume Card</p>
              </div>

              {/* Company Card */}
              <div className="rounded-lg border p-5" style={{ background: "var(--color-card)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-sm)" }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold" style={{ background: "linear-gradient(135deg, var(--color-primary-700), var(--color-primary-500))" }}>TC</div>
                  <div>
                    <h3 className="text-base font-semibold" style={{ color: "var(--color-text-primary)" }}>TechCorp Inc.</h3>
                    <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>Technology · 500-1000 employees</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs" style={{ color: "var(--color-text-tertiary)" }}>
                  <span className="flex items-center gap-1"><MapPin size={12} /> San Francisco</span>
                  <span className="flex items-center gap-1"><Star size={12} style={{ color: "var(--color-warning-500)" }} /> 4.2/5</span>
                  <span className="flex items-center gap-1"><Briefcase size={12} /> 15 open roles</span>
                </div>
                <p className="text-[10px] mt-3 text-right" style={{ color: "var(--color-text-tertiary)" }}>Company Card</p>
              </div>

              {/* Interview Card */}
              <div className="rounded-lg border p-5 border-l-4" style={{ background: "var(--color-card)", borderColor: "var(--color-border)", borderLeftColor: "var(--color-primary-500)", boxShadow: "var(--shadow-sm)" }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: "var(--color-info-100)", color: "var(--color-info-600)" }}>Interview in 2 days</span>
                  <Calendar size={16} style={{ color: "var(--color-text-tertiary)" }} />
                </div>
                <h3 className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>Video Interview — TechCorp</h3>
                <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>Senior Engineer · Jun 18, 2:00 PM PT</p>
                <div className="flex items-center gap-2 mt-3">
                  <button className="px-3 py-1.5 rounded text-xs font-semibold text-white" style={{ background: "var(--color-success-600)" }}>Prep for Interview</button>
                  <button className="px-3 py-1.5 rounded text-xs font-semibold border" style={{ borderColor: "var(--color-border)", color: "var(--color-text-secondary)" }}>Add to Calendar</button>
                </div>
                <p className="text-[10px] mt-3 text-right" style={{ color: "var(--color-text-tertiary)" }}>Interview Card</p>
              </div>

              {/* Notification Card */}
              <div className="rounded-lg border p-4 flex items-start gap-3" style={{ background: "var(--color-primary-50)", borderColor: "var(--color-primary-200)" }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: "var(--color-primary-100)" }}>
                  <Bell size={16} style={{ color: "var(--color-primary-600)" }} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>New recommendation available</p>
                  <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>20 new jobs match your profile · 2 hours ago</p>
                </div>
                <button style={{ color: "var(--color-text-tertiary)" }}><X size={14} /></button>
              </div>

              {/* Empty State Card */}
              <div className="rounded-lg border p-8 text-center" style={{ background: "var(--color-card)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-sm)" }}>
                <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: "var(--color-primary-50)" }}>
                  <Briefcase size={28} style={{ color: "var(--color-primary-400)" }} />
                </div>
                <h3 className="text-base font-semibold mb-1" style={{ color: "var(--color-text-primary)" }}>No applications yet</h3>
                <p className="text-sm mb-4" style={{ color: "var(--color-text-tertiary)" }}>Start applying to jobs to see them here</p>
                <button className="px-5 py-2 rounded-md text-sm font-semibold text-white" style={{ background: "var(--color-primary-600)" }}>Search for Jobs</button>
                <p className="text-[10px] mt-4" style={{ color: "var(--color-text-tertiary)" }}>Empty State Card</p>
              </div>
            </div>
          </section>

          {/* ═══════════════════════════════════════════════════
             SECTION 9: BADGES
             ═══════════════════════════════════════════════════ */}
          <section>
            <SectionHeader id="badges" title="9. Badges" description="Status badges, tags, and pills used throughout JobFits for categorization and status indication." />
            <TokenCard>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold mb-2" style={{ color: "var(--color-text-tertiary)" }}>Semantic Badges</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ background: "var(--color-success-100)", color: "var(--color-success-600)" }}>✓ Applied</span>
                    <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ background: "var(--color-warning-100)", color: "var(--color-warning-600)" }}>⏳ Pending</span>
                    <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ background: "var(--color-error-100)", color: "var(--color-error-600)" }}>✕ Rejected</span>
                    <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ background: "var(--color-info-100)", color: "var(--color-info-600)" }}>ℹ Interview</span>
                    <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ background: "var(--color-neutral-100)", color: "var(--color-neutral-600)" }}>Neutral</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold mb-2" style={{ color: "var(--color-text-tertiary)" }}>Match Score Badges</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-bold text-white" style={{ background: "var(--color-primary-600)" }}>92% Match</span>
                    <span className="px-3 py-1 rounded-full text-xs font-bold text-white" style={{ background: "var(--color-primary-500)" }}>78% Match</span>
                    <span className="px-3 py-1 rounded-full text-xs font-bold text-white" style={{ background: "var(--color-warning-500)" }}>65% Match</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold mb-2" style={{ color: "var(--color-text-tertiary)" }}>Job Type & Status Badges</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2.5 py-0.5 rounded text-xs font-medium" style={{ background: "var(--color-primary-50)", color: "var(--color-primary-700)" }}>Full-time</span>
                    <span className="px-2.5 py-0.5 rounded text-xs font-medium" style={{ background: "var(--color-neutral-100)", color: "var(--color-neutral-700)" }}>Contract</span>
                    <span className="px-2.5 py-0.5 rounded text-xs font-medium" style={{ background: "var(--color-success-50)", color: "var(--color-success-600)" }}>Remote</span>
                    <span className="px-2.5 py-0.5 rounded text-xs font-medium" style={{ background: "var(--color-info-50)", color: "var(--color-info-600)" }}>Hybrid</span>
                    <span className="px-2.5 py-0.5 rounded text-xs font-medium" style={{ background: "var(--color-warning-50)", color: "var(--color-warning-600)" }}>Urgent</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold mb-2" style={{ color: "var(--color-text-tertiary)" }}>Skill Tags</p>
                  <div className="flex flex-wrap gap-1.5">
                    {["Python", "React", "SQL", "AWS", "Kubernetes", "Machine Learning"].map((s, i) => (
                      <span key={s} className="px-2 py-0.5 rounded text-xs font-medium" style={{
                        background: i < 4 ? "var(--color-success-50)" : "var(--color-warning-50)",
                        color: i < 4 ? "var(--color-success-600)" : "var(--color-warning-600)",
                      }}>
                        {i < 4 ? "✓" : "⚠"} {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </TokenCard>
          </section>

          {/* ═══════════════════════════════════════════════════
             SECTION 10: TABLES
             ═══════════════════════════════════════════════════ */}
          <section>
            <SectionHeader id="tables" title="10. Tables" description="Standard table component for listing applications, users, and data across the platform." />
            <TokenCard>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: "2px solid var(--color-border)" }}>
                      {["Company", "Role", "Match", "Status", "Applied", "Actions"].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-tertiary)" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { company: "TechCorp", role: "Senior Engineer", match: "92%", status: "Interview", date: "Jun 10", statusColor: "success" },
                      { company: "InnovateLab", role: "Data Scientist", match: "88%", status: "Submitted", date: "Jun 12", statusColor: "info" },
                      { company: "CloudBase", role: "DevOps Lead", match: "76%", status: "Rejected", date: "Jun 8", statusColor: "error" },
                      { company: "DataFlow", role: "ML Engineer", match: "95%", status: "Offer", date: "Jun 5", statusColor: "warning" },
                    ].map((r, i) => (
                      <tr key={i} className="transition-colors duration-150 cursor-pointer" style={{ borderBottom: "1px solid var(--color-neutral-100)", background: i === 1 ? "var(--color-primary-50)" : "transparent" }}>
                        <td className="px-4 py-3 font-medium" style={{ color: "var(--color-text-primary)" }}>{r.company}</td>
                        <td className="px-4 py-3" style={{ color: "var(--color-text-secondary)" }}>{r.role}</td>
                        <td className="px-4 py-3 font-semibold" style={{ color: "var(--color-primary-600)" }}>{r.match}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{
                            background: `var(--color-${r.statusColor}-100)`,
                            color: `var(--color-${r.statusColor}-600)`,
                          }}>{r.status}</span>
                        </td>
                        <td className="px-4 py-3" style={{ color: "var(--color-text-tertiary)" }}>{r.date}</td>
                        <td className="px-4 py-3"><MoreHorizontal size={16} style={{ color: "var(--color-text-tertiary)" }} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between mt-4 pt-4 border-t" style={{ borderColor: "var(--color-neutral-100)" }}>
                <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>Showing 1–4 of 15 applications</p>
                <div className="flex gap-1">
                  <button className="p-1.5 rounded border" style={{ borderColor: "var(--color-border)", color: "var(--color-text-tertiary)" }}><ChevronLeft size={14} /></button>
                  <button className="w-8 h-8 rounded text-xs font-semibold text-white" style={{ background: "var(--color-primary-600)" }}>1</button>
                  <button className="w-8 h-8 rounded text-xs font-medium border" style={{ borderColor: "var(--color-border)", color: "var(--color-text-secondary)" }}>2</button>
                  <button className="w-8 h-8 rounded text-xs font-medium border" style={{ borderColor: "var(--color-border)", color: "var(--color-text-secondary)" }}>3</button>
                  <button className="p-1.5 rounded border" style={{ borderColor: "var(--color-border)", color: "var(--color-text-tertiary)" }}><ChevronRight size={14} /></button>
                </div>
              </div>
            </TokenCard>
          </section>

          {/* ═══════════════════════════════════════════════════
             SECTION 11: NAVIGATION
             ═══════════════════════════════════════════════════ */}
          <section>
            <SectionHeader id="navigation" title="11. Navigation" description="Sidebar, top bar, mobile bottom nav, breadcrumbs, tabs, and pagination patterns." />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Sidebar Mini */}
              <TokenCard label="Sidebar Navigation">
                <div className="rounded-lg border p-3 w-56" style={{ background: "var(--color-bg)", borderColor: "var(--color-border)" }}>
                  <div className="flex items-center gap-2 mb-4 px-2">
                    <div className="w-7 h-7 rounded-md text-white flex items-center justify-center text-xs font-bold" style={{ background: "var(--color-primary-600)" }}>JF</div>
                    <span className="text-sm font-bold" style={{ color: "var(--color-primary-900)" }}>JobFits</span>
                  </div>
                  {[
                    { icon: <Home size={16} />, label: "Dashboard", active: true },
                    { icon: <Search size={16} />, label: "Search Jobs" },
                    { icon: <Star size={16} />, label: "Recommendations" },
                    { icon: <Bookmark size={16} />, label: "Saved Jobs" },
                    { icon: <Briefcase size={16} />, label: "Applications", badge: "2" },
                    { icon: <User size={16} />, label: "My Profile" },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center gap-2 px-3 py-2 rounded-md text-sm mb-0.5"
                      style={{
                        background: item.active ? "var(--color-primary-50)" : "transparent",
                        color: item.active ? "var(--color-primary-700)" : "var(--color-text-secondary)",
                        fontWeight: item.active ? 600 : 400,
                      }}
                    >
                      {item.icon}
                      <span className="flex-1">{item.label}</span>
                      {item.badge && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full text-white font-bold" style={{ background: "var(--color-primary-500)" }}>{item.badge}</span>
                      )}
                    </div>
                  ))}
                </div>
              </TokenCard>

              {/* Mobile Bottom Nav */}
              <TokenCard label="Mobile Bottom Navigation">
                <div className="rounded-xl border flex items-center justify-around py-2 px-1" style={{ background: "var(--color-bg)", borderColor: "var(--color-border)" }}>
                  {[
                    { icon: <Home size={20} />, label: "Home", active: true },
                    { icon: <Search size={20} />, label: "Search" },
                    { icon: <Bookmark size={20} />, label: "Saved" },
                    { icon: <Briefcase size={20} />, label: "Apps" },
                    { icon: <User size={20} />, label: "Profile" },
                  ].map((item) => (
                    <div key={item.label} className="flex flex-col items-center gap-0.5 px-3 py-1" style={{ color: item.active ? "var(--color-primary-600)" : "var(--color-text-tertiary)" }}>
                      {item.icon}
                      <span className="text-[10px] font-medium">{item.label}</span>
                    </div>
                  ))}
                </div>
              </TokenCard>

              {/* Breadcrumb */}
              <TokenCard label="Breadcrumb">
                <nav className="flex items-center gap-1.5 text-sm">
                  <a href="#" style={{ color: "var(--color-text-tertiary)" }}>Dashboard</a>
                  <ChevronRight size={14} style={{ color: "var(--color-text-tertiary)" }} />
                  <a href="#" style={{ color: "var(--color-text-tertiary)" }}>Search Jobs</a>
                  <ChevronRight size={14} style={{ color: "var(--color-text-tertiary)" }} />
                  <span className="font-medium" style={{ color: "var(--color-primary-600)" }}>Senior Engineer</span>
                </nav>
              </TokenCard>

              {/* Tabs */}
              <TokenCard label="Tabs">
                <div className="flex gap-0 border-b" style={{ borderColor: "var(--color-border)" }}>
                  {["All (15)", "Submitted (5)", "Interview (2)", "Offer (1)", "Rejected (3)"].map((t, i) => (
                    <button
                      key={t}
                      onClick={() => setTabActive(t)}
                      className="px-4 py-2.5 text-xs font-medium border-b-2 transition-colors -mb-px"
                      style={{
                        borderColor: i === 0 ? "var(--color-primary-500)" : "transparent",
                        color: i === 0 ? "var(--color-primary-600)" : "var(--color-text-tertiary)",
                      }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </TokenCard>
            </div>
          </section>

          {/* ═══════════════════════════════════════════════════
             SECTION 12: DASHBOARD COMPONENTS
             ═══════════════════════════════════════════════════ */}
          <section>
            <SectionHeader id="dashboard" title="12. Dashboard Components" description="Reusable dashboard widgets: stats, activity feed, progress trackers, quick actions." />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {[
                { label: "Applications", value: "15", change: "+3 this week", icon: <Briefcase size={18} />, color: "primary" },
                { label: "Interviews", value: "2", change: "Next: Tomorrow", icon: <Calendar size={18} />, color: "info" },
                { label: "Offers", value: "1", change: "Respond by Jun 30", icon: <Award size={18} />, color: "success" },
                { label: "Profile Score", value: "75%", change: "+25% to complete", icon: <Target size={18} />, color: "warning" },
              ].map((stat) => (
                <div key={stat.label} className="rounded-lg border p-4" style={{ background: "var(--color-card)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-sm)" }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium" style={{ color: "var(--color-text-secondary)" }}>{stat.label}</span>
                    <div className="w-7 h-7 rounded flex items-center justify-center" style={{ background: `var(--color-${stat.color}-50)`, color: `var(--color-${stat.color}-${stat.color === "primary" ? 600 : 600})` }}>
                      {stat.icon}
                    </div>
                  </div>
                  <p className="text-2xl font-bold" style={{ color: "var(--color-text-primary)" }}>{stat.value}</p>
                  <p className="text-xs mt-1" style={{ color: "var(--color-text-tertiary)" }}>{stat.change}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Recent Activity */}
              <TokenCard label="Recent Activity">
                <div className="space-y-3">
                  {[
                    { icon: <CheckCircle2 size={16} />, text: "Applied to TechCorp — Senior Engineer", time: "2 hours ago", color: "var(--color-success-500)" },
                    { icon: <Eye size={16} />, text: "InnovateLab viewed your application", time: "5 hours ago", color: "var(--color-info-500)" },
                    { icon: <Star size={16} />, text: "20 new recommendations available", time: "1 day ago", color: "var(--color-primary-500)" },
                    { icon: <Calendar size={16} />, text: "Interview scheduled with CloudBase", time: "2 days ago", color: "var(--color-warning-500)" },
                  ].map((a, i) => (
                    <div key={i} className="flex items-start gap-3 pb-3 border-b last:border-b-0" style={{ borderColor: "var(--color-neutral-100)" }}>
                      <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: "var(--color-neutral-50)", color: a.color }}>
                        {a.icon}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm" style={{ color: "var(--color-text-primary)" }}>{a.text}</p>
                        <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>{a.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </TokenCard>

              {/* Profile Completion */}
              <TokenCard label="Profile Completion">
                <div className="text-center mb-4">
                  <div className="relative w-24 h-24 mx-auto mb-3">
                    <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="42" fill="none" stroke="var(--color-neutral-100)" strokeWidth="8" />
                      <circle cx="50" cy="50" r="42" fill="none" stroke="var(--color-primary-500)" strokeWidth="8" strokeDasharray={`${75 * 2.64} ${100 * 2.64}`} strokeLinecap="round" />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-xl font-bold" style={{ color: "var(--color-primary-600)" }}>75%</span>
                  </div>
                </div>
                <div className="space-y-2">
                  {[
                    { label: "Basic Info", done: true },
                    { label: "Experience", done: true },
                    { label: "Skills", done: true },
                    { label: "Education", done: false },
                    { label: "Cover Letter", done: false },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-2 text-sm">
                      {item.done ? <CheckCircle2 size={14} style={{ color: "var(--color-success-500)" }} /> : <div className="w-3.5 h-3.5 rounded-full border-2" style={{ borderColor: "var(--color-neutral-300)" }} />}
                      <span style={{ color: item.done ? "var(--color-text-secondary)" : "var(--color-text-primary)", textDecoration: item.done ? "line-through" : "none" }}>{item.label}</span>
                    </div>
                  ))}
                </div>
              </TokenCard>
            </div>

            <div className="h-4" />

            {/* Quick Actions */}
            <TokenCard label="Quick Actions">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { icon: <Search size={20} />, label: "Search Jobs" },
                  { icon: <Upload size={20} />, label: "Upload Resume" },
                  { icon: <Star size={20} />, label: "View Matches" },
                  { icon: <BarChart3 size={20} />, label: "Career Insights" },
                ].map((a) => (
                  <button
                    key={a.label}
                    className="flex flex-col items-center gap-2 p-4 rounded-lg border transition-all duration-200"
                    style={{ borderColor: "var(--color-border)", background: "var(--color-bg)" }}
                  >
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "var(--color-primary-50)", color: "var(--color-primary-600)" }}>{a.icon}</div>
                    <span className="text-xs font-medium" style={{ color: "var(--color-text-secondary)" }}>{a.label}</span>
                  </button>
                ))}
              </div>
            </TokenCard>
          </section>

          {/* ═══════════════════════════════════════════════════
             SECTION 13: JOB COMPONENTS
             ═══════════════════════════════════════════════════ */}
          <section>
            <SectionHeader id="job-components" title="13. Job Components" description="Reusable job-related components: match scores, skill tags, salary badges, and company info blocks." />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Match Score Widget */}
              <TokenCard label="Match Score Widget">
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative w-20 h-20">
                    <svg className="w-20 h-20 -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="42" fill="none" stroke="var(--color-neutral-100)" strokeWidth="8" />
                      <circle cx="50" cy="50" r="42" fill="none" stroke="var(--color-primary-500)" strokeWidth="8" strokeDasharray={`${92 * 2.64} ${100 * 2.64}`} strokeLinecap="round" />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-lg font-bold" style={{ color: "var(--color-primary-600)" }}>92%</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>Excellent Match</p>
                    <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>Your profile aligns well with this role</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {[
                    { label: "Skills", score: 95 },
                    { label: "Experience", score: 88 },
                    { label: "Location", score: 95 },
                    { label: "Seniority", score: 90 },
                  ].map((s) => (
                    <div key={s.label} className="flex items-center gap-3">
                      <span className="text-xs w-20" style={{ color: "var(--color-text-secondary)" }}>{s.label}</span>
                      <div className="flex-1 h-2 rounded-full" style={{ background: "var(--color-neutral-100)" }}>
                        <div className="h-2 rounded-full transition-all" style={{ width: `${s.score}%`, background: s.score > 85 ? "var(--color-primary-500)" : "var(--color-warning-500)" }} />
                      </div>
                      <span className="text-xs font-semibold w-8 text-right" style={{ color: "var(--color-primary-600)" }}>{s.score}%</span>
                    </div>
                  ))}
                </div>
              </TokenCard>

              {/* Job Details Section */}
              <TokenCard label="Job Detail Header">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center text-white text-lg font-bold shrink-0" style={{ background: "linear-gradient(135deg, var(--color-primary-700), var(--color-primary-500))" }}>TC</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold" style={{ color: "var(--color-text-primary)" }}>Senior Software Engineer</h3>
                    <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>TechCorp · San Francisco, CA</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="flex items-center gap-1 text-xs" style={{ color: "var(--color-success-600)" }}><DollarSign size={12} />$150K–$190K</span>
                      <span className="flex items-center gap-1 text-xs" style={{ color: "var(--color-text-tertiary)" }}><Clock size={12} />Posted 3 days ago</span>
                      <span className="flex items-center gap-1 text-xs" style={{ color: "var(--color-text-tertiary)" }}><Building2 size={12} />500+ employees</span>
                    </div>
                  </div>
                </div>
              </TokenCard>

              {/* Salary Badge */}
              <TokenCard label="Salary Badge">
                <div className="flex flex-wrap gap-3">
                  <div className="px-4 py-2 rounded-lg border" style={{ borderColor: "var(--color-success-100)", background: "var(--color-success-50)" }}>
                    <p className="text-xs" style={{ color: "var(--color-success-600)" }}>Base Salary</p>
                    <p className="text-lg font-bold" style={{ color: "var(--color-success-600)" }}>$155,000</p>
                  </div>
                  <div className="px-4 py-2 rounded-lg border" style={{ borderColor: "var(--color-primary-100)", background: "var(--color-primary-50)" }}>
                    <p className="text-xs" style={{ color: "var(--color-primary-600)" }}>Total Comp</p>
                    <p className="text-lg font-bold" style={{ color: "var(--color-primary-700)" }}>$201,000</p>
                  </div>
                  <div className="px-4 py-2 rounded-lg border" style={{ borderColor: "var(--color-warning-100)", background: "var(--color-warning-50)" }}>
                    <p className="text-xs" style={{ color: "var(--color-warning-600)" }}>Bonus</p>
                    <p className="text-lg font-bold" style={{ color: "var(--color-warning-600)" }}>20%</p>
                  </div>
                </div>
              </TokenCard>

              {/* Job Status */}
              <TokenCard label="Job Status Pipeline">
                <div className="flex items-center gap-1">
                  {[
                    { label: "Submitted", done: true },
                    { label: "Viewed", done: true },
                    { label: "Interview", active: true },
                    { label: "Offer", done: false },
                  ].map((s, i) => (
                    <React.Fragment key={s.label}>
                      <div className="flex flex-col items-center flex-1">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${s.done ? "text-white" : ""}`} style={{
                          background: s.done ? "var(--color-primary-600)" : s.active ? "var(--color-primary-100)" : "var(--color-neutral-100)",
                          color: s.done ? "white" : s.active ? "var(--color-primary-700)" : "var(--color-text-tertiary)",
                          border: s.active ? "2px solid var(--color-primary-500)" : "none",
                        }}>
                          {s.done ? <Check size={14} /> : i + 1}
                        </div>
                        <span className="text-[10px] mt-1 font-medium" style={{ color: s.done || s.active ? "var(--color-primary-600)" : "var(--color-text-tertiary)" }}>{s.label}</span>
                      </div>
                      {i < 3 && <div className="flex-1 h-0.5 -mt-4" style={{ background: s.done ? "var(--color-primary-500)" : "var(--color-neutral-200)" }} />}
                    </React.Fragment>
                  ))}
                </div>
              </TokenCard>
            </div>
          </section>

          {/* ═══════════════════════════════════════════════════
             SECTION 14: USER COMPONENTS
             ═══════════════════════════════════════════════════ */}
          <section>
            <SectionHeader id="user-components" title="14. User Components" description="Profile cards, avatars, experience timelines, education cards, and skill chips." />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* User Profile Card */}
              <TokenCard label="User Profile Card">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full mx-auto mb-3 flex items-center justify-center text-white text-2xl font-bold" style={{ background: "linear-gradient(135deg, var(--color-primary-700), var(--color-primary-500))" }}>JD</div>
                  <h3 className="text-lg font-bold" style={{ color: "var(--color-text-primary)" }}>John Doe</h3>
                  <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>Senior Software Engineer</p>
                  <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>john@example.com</p>
                  <div className="flex justify-center gap-4 mt-3">
                    <div className="text-center"><p className="text-lg font-bold" style={{ color: "var(--color-primary-600)" }}>15</p><p className="text-[10px]" style={{ color: "var(--color-text-tertiary)" }}>Applied</p></div>
                    <div className="text-center"><p className="text-lg font-bold" style={{ color: "var(--color-primary-600)" }}>2</p><p className="text-[10px]" style={{ color: "var(--color-text-tertiary)" }}>Interviews</p></div>
                    <div className="text-center"><p className="text-lg font-bold" style={{ color: "var(--color-primary-600)" }}>1</p><p className="text-[10px]" style={{ color: "var(--color-text-tertiary)" }}>Offers</p></div>
                  </div>
                </div>
              </TokenCard>

              {/* Avatar Sizes */}
              <TokenCard label="Avatar Sizes">
                <div className="flex items-end gap-4 flex-wrap">
                  {[
                    { size: 32, label: "xs" }, { size: 40, label: "sm" }, { size: 48, label: "md" },
                    { size: 64, label: "lg" }, { size: 80, label: "xl" },
                  ].map((a) => (
                    <div key={a.label} className="text-center">
                      <div className="rounded-full flex items-center justify-center text-white font-bold mx-auto" style={{ width: a.size, height: a.size, fontSize: a.size * 0.35, background: "linear-gradient(135deg, var(--color-primary-700), var(--color-primary-500))" }}>JD</div>
                      <p className="text-[10px] mt-1" style={{ color: "var(--color-text-tertiary)" }}>{a.label} ({a.size}px)</p>
                    </div>
                  ))}
                </div>
              </TokenCard>

              {/* Experience Timeline */}
              <TokenCard label="Experience Timeline">
                <div className="relative pl-6 space-y-4">
                  <div className="absolute left-2 top-1 bottom-1 w-0.5" style={{ background: "var(--color-primary-200)" }} />
                  {[
                    { title: "Senior Software Engineer", company: "TechCorp", period: "2023 – Present", current: true },
                    { title: "Software Engineer", company: "StartupXYZ", period: "2020 – 2023" },
                    { title: "Junior Developer", company: "WebAgency", period: "2018 – 2020" },
                  ].map((exp, i) => (
                    <div key={i} className="relative">
                      <div className="absolute -left-[18px] top-1 w-3 h-3 rounded-full border-2" style={{
                        background: exp.current ? "var(--color-primary-500)" : "var(--color-bg)",
                        borderColor: "var(--color-primary-500)",
                      }} />
                      <h4 className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>{exp.title}</h4>
                      <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>{exp.company}</p>
                      <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>{exp.period}</p>
                    </div>
                  ))}
                </div>
              </TokenCard>

              {/* Education Card */}
              <TokenCard label="Education Card">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: "var(--color-primary-50)" }}>
                    <GraduationCap size={20} style={{ color: "var(--color-primary-600)" }} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>BS Computer Science</h4>
                    <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>Stanford University</p>
                    <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>2014 – 2018 · GPA 3.8</p>
                  </div>
                </div>
              </TokenCard>
            </div>
          </section>

          {/* ═══════════════════════════════════════════════════
             SECTION 15: FEEDBACK COMPONENTS
             ═══════════════════════════════════════════════════ */}
          <section>
            <SectionHeader id="feedback" title="15. Feedback Components" description="Toasts, alerts, messages, empty states, loading skeletons, spinners, and progress bars." />
            <div className="space-y-4">
              {/* Toasts */}
              <TokenCard label="Toast Notifications">
                <div className="space-y-2">
                  {[
                    { icon: <CheckCircle2 size={18} />, text: "Application submitted successfully!", bg: "var(--color-success-50)", border: "var(--color-success-100)", color: "var(--color-success-600)" },
                    { icon: <AlertTriangle size={18} />, text: "Resume parsing may take longer than usual", bg: "var(--color-warning-50)", border: "var(--color-warning-100)", color: "var(--color-warning-600)" },
                    { icon: <XCircle size={18} />, text: "Failed to upload resume. Please try again.", bg: "var(--color-error-50)", border: "var(--color-error-100)", color: "var(--color-error-600)" },
                    { icon: <Info size={18} />, text: "New recommendations will be available tomorrow.", bg: "var(--color-info-50)", border: "var(--color-info-100)", color: "var(--color-info-600)" },
                  ].map((toast, i) => (
                    <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-lg border" style={{ background: toast.bg, borderColor: toast.border, color: toast.color }}>
                      {toast.icon}
                      <span className="flex-1 text-sm font-medium">{toast.text}</span>
                      <X size={14} className="cursor-pointer opacity-60" />
                    </div>
                  ))}
                </div>
              </TokenCard>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Loading Skeleton */}
                <TokenCard label="Loading Skeleton">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg" style={{ background: "linear-gradient(90deg, var(--color-neutral-100), var(--color-neutral-50), var(--color-neutral-100))", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 rounded w-3/4" style={{ background: "var(--color-neutral-100)" }} />
                        <div className="h-2.5 rounded w-1/2" style={{ background: "var(--color-neutral-100)" }} />
                      </div>
                    </div>
                    <div className="h-2 rounded w-full" style={{ background: "var(--color-neutral-100)" }} />
                    <div className="h-2 rounded w-5/6" style={{ background: "var(--color-neutral-100)" }} />
                    <div className="h-8 rounded w-1/3" style={{ background: "var(--color-neutral-100)" }} />
                  </div>
                </TokenCard>

                {/* Spinners & Progress */}
                <TokenCard label="Spinners & Progress Bars">
                  <div className="space-y-4">
                    <div className="flex items-center gap-6">
                      <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: "var(--color-neutral-200)", borderTopColor: "var(--color-primary-500)" }} />
                      <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: "var(--color-neutral-200)", borderTopColor: "var(--color-primary-500)" }} />
                      <div className="w-10 h-10 border-3 rounded-full animate-spin" style={{ borderColor: "var(--color-neutral-200)", borderTopColor: "var(--color-primary-500)", borderWidth: 3 }} />
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1" style={{ color: "var(--color-text-tertiary)" }}>
                        <span>Uploading resume...</span>
                        <span>45%</span>
                      </div>
                      <div className="h-2 rounded-full" style={{ background: "var(--color-neutral-100)" }}>
                        <div className="h-2 rounded-full transition-all" style={{ width: "45%", background: "linear-gradient(to right, var(--color-primary-700), var(--color-primary-500))" }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1" style={{ color: "var(--color-text-tertiary)" }}>
                        <span>Parsing complete</span>
                        <span>100%</span>
                      </div>
                      <div className="h-2 rounded-full" style={{ background: "var(--color-neutral-100)" }}>
                        <div className="h-2 rounded-full" style={{ width: "100%", background: "var(--color-success-500)" }} />
                      </div>
                    </div>
                  </div>
                </TokenCard>
              </div>
            </div>
          </section>

          {/* ═══════════════════════════════════════════════════
             SECTION 16: MODALS
             ═══════════════════════════════════════════════════ */}
          <section>
            <SectionHeader id="modals" title="16. Modal Components" description="Confirmation, delete, upload, and settings modal dialogs." />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Confirmation Modal */}
              <TokenCard label="Confirmation Modal">
                <div className="rounded-xl border p-6 text-center" style={{ background: "var(--color-card)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-lg)" }}>
                  <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ background: "var(--color-primary-50)" }}>
                    <AlertCircle size={24} style={{ color: "var(--color-primary-600)" }} />
                  </div>
                  <h3 className="text-base font-bold mb-1" style={{ color: "var(--color-text-primary)" }}>Withdraw Application?</h3>
                  <p className="text-sm mb-5" style={{ color: "var(--color-text-secondary)" }}>Are you sure? You can&apos;t undo this action.</p>
                  <div className="flex gap-3 justify-center">
                    <button className="px-5 py-2 rounded-md text-sm font-semibold border" style={{ borderColor: "var(--color-border)", color: "var(--color-text-secondary)" }}>Cancel</button>
                    <button className="px-5 py-2 rounded-md text-sm font-semibold text-white" style={{ background: "var(--color-primary-600)" }}>Confirm</button>
                  </div>
                </div>
              </TokenCard>

              {/* Delete Modal */}
              <TokenCard label="Delete Modal">
                <div className="rounded-xl border p-6 text-center" style={{ background: "var(--color-card)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-lg)" }}>
                  <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ background: "var(--color-error-50)" }}>
                    <Trash2 size={24} style={{ color: "var(--color-error-500)" }} />
                  </div>
                  <h3 className="text-base font-bold mb-1" style={{ color: "var(--color-text-primary)" }}>Delete Resume?</h3>
                  <p className="text-sm mb-5" style={{ color: "var(--color-text-secondary)" }}>This action cannot be undone.</p>
                  <div className="flex gap-3 justify-center">
                    <button className="px-5 py-2 rounded-md text-sm font-semibold border" style={{ borderColor: "var(--color-border)", color: "var(--color-text-secondary)" }}>Cancel</button>
                    <button className="px-5 py-2 rounded-md text-sm font-semibold text-white" style={{ background: "var(--color-error-500)" }}>Delete</button>
                  </div>
                </div>
              </TokenCard>
            </div>
          </section>

          {/* ═══════════════════════════════════════════════════
             SECTION 17: CHARTS
             ═══════════════════════════════════════════════════ */}
          <section>
            <SectionHeader id="charts" title="17. Charts" description="Recharts-based data visualizations for dashboards and career insights." />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TokenCard label="Line Chart — Application Trend">
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={lineData}><CartesianGrid strokeDasharray="3 3" stroke="var(--color-neutral-100)" />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: "var(--color-text-tertiary)" }} /><YAxis tick={{ fontSize: 12, fill: "var(--color-text-tertiary)" }} />
                    <Tooltip /><Legend wrapperStyle={{ fontSize: 12 }} />
                    <Line type="monotone" dataKey="applications" stroke="#7B2CBF" strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="interviews" stroke="#9D4EDD" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </TokenCard>

              <TokenCard label="Bar Chart — Jobs by Industry">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={barData}><CartesianGrid strokeDasharray="3 3" stroke="var(--color-neutral-100)" />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: "var(--color-text-tertiary)" }} /><YAxis tick={{ fontSize: 12, fill: "var(--color-text-tertiary)" }} />
                    <Tooltip /><Bar dataKey="jobs" fill="#5A189A" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </TokenCard>

              <TokenCard label="Donut Chart — Application Status">
                <ResponsiveContainer width="100%" height={220}>
                  <RePieChart><Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                    {pieData.map((_, i) => (<Cell key={i} fill={PIE_COLORS[i]} />))}
                  </Pie><Tooltip /><Legend wrapperStyle={{ fontSize: 12 }} /></RePieChart>
                </ResponsiveContainer>
              </TokenCard>

              <TokenCard label="Area Chart — Match Score Trend">
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={areaData}><CartesianGrid strokeDasharray="3 3" stroke="var(--color-neutral-100)" />
                    <XAxis dataKey="week" tick={{ fontSize: 12, fill: "var(--color-text-tertiary)" }} /><YAxis tick={{ fontSize: 12, fill: "var(--color-text-tertiary)" }} domain={[60, 100]} />
                    <Tooltip /><Area type="monotone" dataKey="score" stroke="#7B2CBF" fill="rgba(123, 44, 191, 0.15)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </TokenCard>
            </div>
          </section>

          {/* ═══════════════════════════════════════════════════
             SECTION 18: ICONS
             ═══════════════════════════════════════════════════ */}
          <section>
            <SectionHeader id="icons" title="18. Icons" description="Lucide React icons with consistent sizing and color. Use semantic colors for context." />
            <TokenCard>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4">
                {[
                  { icon: <Home size={22} />, name: "Home" }, { icon: <Search size={22} />, name: "Search" },
                  { icon: <Star size={22} />, name: "Star" }, { icon: <Bookmark size={22} />, name: "Bookmark" },
                  { icon: <Briefcase size={22} />, name: "Briefcase" }, { icon: <Calendar size={22} />, name: "Calendar" },
                  { icon: <User size={22} />, name: "User" }, { icon: <FileText size={22} />, name: "FileText" },
                  { icon: <BarChart3 size={22} />, name: "BarChart" }, { icon: <Bell size={22} />, name: "Bell" },
                  { icon: <Settings size={22} />, name: "Settings" }, { icon: <Heart size={22} />, name: "Heart" },
                  { icon: <Share2 size={22} />, name: "Share" }, { icon: <Upload size={22} />, name: "Upload" },
                  { icon: <Download size={22} />, name: "Download" }, { icon: <Mail size={22} />, name: "Mail" },
                  { icon: <Lock size={22} />, name: "Lock" }, { icon: <Edit size={22} />, name: "Edit" },
                  { icon: <Trash2 size={22} />, name: "Trash" }, { icon: <Filter size={22} />, name: "Filter" },
                  { icon: <MapPin size={22} />, name: "MapPin" }, { icon: <DollarSign size={22} />, name: "Dollar" },
                  { icon: <TrendingUp size={22} />, name: "Trending" }, { icon: <Zap size={22} />, name: "Zap" },
                ].map((item) => (
                  <div key={item.name} className="flex flex-col items-center gap-1 p-2 rounded-lg" style={{ color: "var(--color-text-secondary)" }}>
                    {item.icon}
                    <span className="text-[10px]" style={{ color: "var(--color-text-tertiary)" }}>{item.name}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t" style={{ borderColor: "var(--color-neutral-100)" }}>
                <p className="text-xs font-semibold mb-2" style={{ color: "var(--color-text-tertiary)" }}>Icon Sizes</p>
                <div className="flex items-end gap-6">
                  {[14, 16, 18, 20, 24, 28, 32].map((s) => (
                    <div key={s} className="text-center">
                      <Briefcase size={s} style={{ color: "var(--color-primary-600)" }} />
                      <p className="text-[10px] mt-1" style={{ color: "var(--color-text-tertiary)" }}>{s}px</p>
                    </div>
                  ))}
                </div>
              </div>
            </TokenCard>
          </section>

          {/* ═══════════════════════════════════════════════════
             SECTION 19: LAYOUT EXAMPLES
             ═══════════════════════════════════════════════════ */}
          <section>
            <SectionHeader id="layouts" title="19. Layout Examples" description="Standard page layout patterns used across JobFits: authentication, dashboard, detail, list, and form pages." />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { name: "Authentication Page", desc: "Centered card, no sidebar", layout: (
                  <div className="h-28 rounded border flex items-center justify-center" style={{ background: "var(--color-bg-secondary)", borderColor: "var(--color-border)" }}>
                    <div className="w-24 h-16 rounded border" style={{ background: "var(--color-card)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-md)" }} />
                  </div>
                )},
                { name: "Dashboard Page", desc: "Sidebar + grid cards", layout: (
                  <div className="h-28 rounded border flex" style={{ background: "var(--color-bg-secondary)", borderColor: "var(--color-border)" }}>
                    <div className="w-8 h-full border-r" style={{ background: "var(--color-card)", borderColor: "var(--color-border)" }} />
                    <div className="flex-1 p-2 grid grid-cols-2 gap-1">
                      {[1,2,3,4].map(i => <div key={i} className="rounded border" style={{ background: "var(--color-card)", borderColor: "var(--color-border)" }} />)}
                    </div>
                  </div>
                )},
                { name: "Detail Page", desc: "Sidebar + content + side panel", layout: (
                  <div className="h-28 rounded border flex" style={{ background: "var(--color-bg-secondary)", borderColor: "var(--color-border)" }}>
                    <div className="w-8 h-full border-r" style={{ background: "var(--color-card)", borderColor: "var(--color-border)" }} />
                    <div className="flex-1 p-2"><div className="h-full rounded border" style={{ background: "var(--color-card)", borderColor: "var(--color-border)" }} /></div>
                    <div className="w-16 h-full border-l p-1" style={{ background: "var(--color-card)", borderColor: "var(--color-border)" }}><div className="h-full rounded" style={{ background: "var(--color-neutral-50)" }} /></div>
                  </div>
                )},
                { name: "List Page", desc: "Sidebar + filters + results", layout: (
                  <div className="h-28 rounded border flex" style={{ background: "var(--color-bg-secondary)", borderColor: "var(--color-border)" }}>
                    <div className="w-8 h-full border-r" style={{ background: "var(--color-card)", borderColor: "var(--color-border)" }} />
                    <div className="w-12 h-full border-r p-1 space-y-0.5" style={{ background: "var(--color-card)", borderColor: "var(--color-border)" }}>
                      {[1,2,3,4,5].map(i => <div key={i} className="h-2 rounded" style={{ background: "var(--color-neutral-100)" }} />)}
                    </div>
                    <div className="flex-1 p-1.5 space-y-1">
                      {[1,2,3].map(i => <div key={i} className="h-6 rounded border" style={{ background: "var(--color-card)", borderColor: "var(--color-border)" }} />)}
                    </div>
                  </div>
                )},
                { name: "Form Page", desc: "Sidebar + centered form", layout: (
                  <div className="h-28 rounded border flex" style={{ background: "var(--color-bg-secondary)", borderColor: "var(--color-border)" }}>
                    <div className="w-8 h-full border-r" style={{ background: "var(--color-card)", borderColor: "var(--color-border)" }} />
                    <div className="flex-1 flex items-center justify-center p-2">
                      <div className="w-28 space-y-1">
                        {[1,2,3].map(i => <div key={i} className="h-3 rounded" style={{ background: "var(--color-neutral-100)" }} />)}
                        <div className="h-4 w-16 rounded mt-1" style={{ background: "var(--color-primary-200)" }} />
                      </div>
                    </div>
                  </div>
                )},
                { name: "Settings Page", desc: "Sidebar + vertical tabs + content", layout: (
                  <div className="h-28 rounded border flex" style={{ background: "var(--color-bg-secondary)", borderColor: "var(--color-border)" }}>
                    <div className="w-8 h-full border-r" style={{ background: "var(--color-card)", borderColor: "var(--color-border)" }} />
                    <div className="w-14 h-full border-r p-1 space-y-0.5" style={{ background: "var(--color-card)", borderColor: "var(--color-border)" }}>
                      <div className="h-3 rounded" style={{ background: "var(--color-primary-100)" }} />
                      {[1,2,3].map(i => <div key={i} className="h-3 rounded" style={{ background: "var(--color-neutral-50)" }} />)}
                    </div>
                    <div className="flex-1 p-2"><div className="h-full rounded border" style={{ background: "var(--color-card)", borderColor: "var(--color-border)" }} /></div>
                  </div>
                )},
              ].map((l) => (
                <div key={l.name}>
                  {l.layout}
                  <p className="text-sm font-semibold mt-2" style={{ color: "var(--color-text-primary)" }}>{l.name}</p>
                  <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>{l.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ═══════════════════════════════════════════════════
             SECTION 20: RESPONSIVE PREVIEW
             ═══════════════════════════════════════════════════ */}
          <section>
            <SectionHeader id="responsive" title="20. Responsive Preview" description="The same UI adapts across breakpoints. Below are the approved breakpoints." />
            <TokenCard>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { name: "Mobile", width: "375px", bp: "< 640px", icon: "📱" },
                  { name: "Tablet", width: "768px", bp: "640–1024px", icon: "📱" },
                  { name: "Laptop", width: "1280px", bp: "1024–1440px", icon: "💻" },
                  { name: "Desktop", width: "1440px+", bp: "> 1440px", icon: "🖥️" },
                ].map((d) => (
                  <div key={d.name} className="text-center p-4 rounded-lg border" style={{ borderColor: "var(--color-border)", background: "var(--color-bg)" }}>
                    <span className="text-3xl">{d.icon}</span>
                    <p className="text-sm font-semibold mt-2" style={{ color: "var(--color-text-primary)" }}>{d.name}</p>
                    <p className="text-xs font-mono" style={{ color: "var(--color-primary-600)" }}>{d.width}</p>
                    <p className="text-[10px]" style={{ color: "var(--color-text-tertiary)" }}>{d.bp}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t" style={{ borderColor: "var(--color-neutral-100)" }}>
                <p className="text-xs font-semibold mb-2" style={{ color: "var(--color-text-tertiary)" }}>Responsive Behaviors</p>
                <ul className="text-sm space-y-1" style={{ color: "var(--color-text-secondary)" }}>
                  <li>• <strong>Sidebar</strong> collapses to hamburger menu on mobile</li>
                  <li>• <strong>Bottom nav</strong> appears on mobile (5 tabs: Home, Search, Saved, Apps, Profile)</li>
                  <li>• <strong>Cards</strong> stack vertically on mobile, grid on desktop</li>
                  <li>• <strong>Tables</strong> become scrollable or card-based on mobile</li>
                  <li>• <strong>Touch targets</strong> minimum 44×44px on mobile</li>
                  <li>• <strong>Modals</strong> become bottom sheets on mobile</li>
                </ul>
              </div>
            </TokenCard>
          </section>

          {/* ═══════════════════════════════════════════════════
             SECTION 21: COMPONENT USAGE RULES
             ═══════════════════════════════════════════════════ */}
          <section>
            <SectionHeader id="usage-rules" title="21. Component Usage Rules" description="Guidelines for when and how to use each component category." />
            <TokenCard>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: "2px solid var(--color-border)" }}>
                      {["Component", "Purpose", "When to Use", "When NOT to Use"].map((h) => (
                        <th key={h} className="px-3 py-2 text-left text-xs font-semibold uppercase" style={{ color: "var(--color-text-tertiary)" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { comp: "Primary Button", purpose: "Main actions", when: "Apply, Submit, Confirm", not: "Cancel, secondary actions" },
                      { comp: "Ghost Button", purpose: "Subtle actions", when: "Navigation, tertiary options", not: "Primary CTA, destructive actions" },
                      { comp: "Job Card", purpose: "Display job listing", when: "Search results, recommendations", not: "Dashboard stats, user profiles" },
                      { comp: "Stat Card", purpose: "Show metrics", when: "Dashboard overview, analytics", not: "Job listings, user profiles" },
                      { comp: "Toast", purpose: "Feedback notification", when: "Action confirmation, errors", not: "Permanent content, critical warnings" },
                      { comp: "Modal", purpose: "Focused interaction", when: "Confirmations, forms", not: "Page-level content, navigation" },
                      { comp: "Badge", purpose: "Status indicator", when: "Status labels, counts, tags", not: "Long descriptions, paragraphs" },
                      { comp: "Table", purpose: "Structured data", when: "Applications list, admin panel", not: "Visual cards, dashboard widgets" },
                    ].map((r, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid var(--color-neutral-100)" }}>
                        <td className="px-3 py-2 font-medium" style={{ color: "var(--color-primary-600)" }}>{r.comp}</td>
                        <td className="px-3 py-2" style={{ color: "var(--color-text-primary)" }}>{r.purpose}</td>
                        <td className="px-3 py-2" style={{ color: "var(--color-success-600)" }}>{r.when}</td>
                        <td className="px-3 py-2" style={{ color: "var(--color-error-500)" }}>{r.not}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TokenCard>
          </section>

          {/* ═══════════════════════════════════════════════════
             SECTION 22: DESIGN PRINCIPLES
             ═══════════════════════════════════════════════════ */}
          <section>
            <SectionHeader id="principles" title="22. Design Principles" description="The guiding philosophy behind every design decision in JobFits." />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { icon: "🎯", title: "Consistency over Creativity", desc: "Every page must feel like it belongs to the same product. Use existing patterns before inventing new ones." },
                { icon: "♻️", title: "Reuse Before Creating", desc: "Check this reference page first. Every component here is designed to be composed into any page." },
                { icon: "🎨", title: "One Color System", desc: "5 brand purples + neutrals + semantics. Never hardcode hex values. Always use CSS variables." },
                { icon: "📐", title: "One Spacing System", desc: "xs (4px) through 3xl (64px). No arbitrary margins or padding outside this scale." },
                { icon: "🔤", title: "One Typography Scale", desc: "Inter font, 11 defined styles from Hero (3rem) to Caption (0.75rem). No custom font sizes." },
                { icon: "⬜", title: "One Border Radius System", desc: "6 approved radii from sm (6px) to full (9999px). Match component type to radius." },
                { icon: "🌑", title: "One Shadow System", desc: "Brand-tinted shadows: None → SM → MD → LG. Use elevation consistently." },
                { icon: "🖱️", title: "One Interaction Pattern", desc: "Transitions use --transition-fast/base/slow. Hover, focus, active states are uniform." },
                { icon: "📱", title: "Mobile-First Responsive", desc: "All layouts work on 375px+. Sidebar collapses. Bottom nav appears. Touch targets ≥ 44px." },
              ].map((p) => (
                <div
                  key={p.title}
                  className="rounded-lg border p-5 transition-all duration-200 hover:shadow-md"
                  style={{ background: "var(--color-card)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-sm)" }}
                >
                  <span className="text-2xl">{p.icon}</span>
                  <h3 className="text-sm font-bold mt-2 mb-1" style={{ color: "var(--color-primary-700)" }}>{p.title}</h3>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>{p.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-xl p-8 text-center text-white" style={{ background: "linear-gradient(135deg, var(--color-primary-900), var(--color-primary-700))" }}>
              <h2 className="text-2xl font-extrabold mb-2">Every Future Page Starts Here</h2>
              <p className="text-base opacity-90 max-w-xl mx-auto">
                This Master UI Reference is the single source of truth.
                No new styles should be introduced without updating this page first.
              </p>
            </div>
          </section>

          {/* Footer */}
          <footer className="text-center py-8 border-t" style={{ borderColor: "var(--color-neutral-100)" }}>
            <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
              JobFits Design System v1.0 · Based on User Flows Guide v2.1 · Last Updated: July 2026
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}
