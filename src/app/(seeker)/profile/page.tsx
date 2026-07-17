"use client";

import React, { useState } from "react";
import {
  User, Mail, Phone, MapPin, Briefcase, GraduationCap,
  Award, Star, Edit2, Check, X, Plus, Trash2,
  Camera, ChevronRight, TrendingUp, Target, FileText,
  Globe, Linkedin, Github, ExternalLink, ChevronDown, ChevronUp,
  DollarSign, Clock, Wifi, Building2, BookOpen, Shield,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/utils/cn";

/* ─────────────────────────── MOCK DATA ─────────────────────── */
const MOCK_USER = {
  firstName: "Demo",
  lastName: "Seeker",
  email: "test@jobfits.co",
  phone: "+1 (415) 555-0182",
  location: "San Francisco, CA",
  title: "Senior Software Engineer",
  summary: "Passionate software engineer with 5+ years of experience building scalable web applications. Experienced in full-stack development with a focus on React, Node.js, and cloud infrastructure.",
  avatarUrl: "",
  linkedin: "linkedin.com/in/demoseeker",
  github: "github.com/demoseeker",
  website: "demoseeker.dev",
  completeness: 75,
  completenessBreakdown: [
    { label: "Basic Info", pct: 100, done: true },
    { label: "Work Experience", pct: 100, done: true },
    { label: "Education", pct: 90, done: true },
    { label: "Skills", pct: 80, done: true },
    { label: "Cover Letter", pct: 0, done: false },
  ],
};

const MOCK_EXPERIENCE = [
  {
    id: 1,
    title: "Senior Software Engineer",
    company: "DataTech Systems",
    location: "San Francisco, CA",
    type: "Full-time",
    from: "Jan 2022",
    to: "Present",
    desc: "Led development of microservices architecture serving 2M+ daily users. Reduced API latency by 40% through query optimization and caching strategies.",
  },
  {
    id: 2,
    title: "Software Engineer",
    company: "Innovate Labs",
    location: "Remote",
    type: "Full-time",
    from: "Mar 2020",
    to: "Dec 2021",
    desc: "Built React-based dashboard used by 500+ enterprise clients. Implemented real-time data pipelines using Kafka and PostgreSQL.",
  },
  {
    id: 3,
    title: "Junior Developer",
    company: "ByteSized Co.",
    location: "New York, NY",
    type: "Full-time",
    from: "Jun 2018",
    to: "Feb 2020",
    desc: "Developed internal tooling and REST APIs. Contributed to CI/CD pipeline setup with GitHub Actions and Docker.",
  },
];

const MOCK_EDUCATION = [
  {
    id: 1,
    degree: "B.S. Computer Science",
    school: "Stanford University",
    location: "Stanford, CA",
    from: "2014",
    to: "2018",
    gpa: "3.8 / 4.0",
  },
];

const MOCK_SKILLS = [
  "Python", "TypeScript", "React", "Node.js", "AWS", "Docker",
  "Kubernetes", "PostgreSQL", "Redis", "GraphQL", "CI/CD", "REST APIs",
  "SQL", "Git", "Agile",
];

const MOCK_CERTS = [
  { id: 1, name: "AWS Solutions Architect – Associate", issuer: "Amazon Web Services", date: "Mar 2023", expiry: "Mar 2026" },
  { id: 2, name: "Google Cloud Professional", issuer: "Google", date: "Sep 2022", expiry: "Sep 2024" },
];

const MOCK_PREFS = {
  jobTitle: "Senior Software Engineer",
  locations: ["San Francisco, CA", "Remote"],
  salary: "$150K – $200K",
  types: ["Full-time", "Contract"],
  remote: "Hybrid",
  industries: ["Technology", "Finance", "Healthcare"],
};

/* ─────────────────────────── COMPONENTS ────────────────────── */

/** Reusable section card wrapper */
function SectionCard({
  title,
  icon: Icon,
  children,
  onEdit,
  className,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  onEdit?: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn("rounded-xl border p-6 transition-all duration-200", className)}
      style={{
        background: "var(--color-card)",
        borderColor: "var(--color-border)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "var(--color-primary-50)" }}
          >
            <Icon className="w-4 h-4" style={{ color: "var(--color-primary-600)" }} />
          </div>
          <h2 className="text-base font-bold" style={{ color: "var(--color-text-primary)" }}>
            {title}
          </h2>
        </div>
        {onEdit && (
          <button
            onClick={onEdit}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md transition-all duration-200"
            style={{ color: "var(--color-primary-600)", background: "var(--color-primary-50)" }}
          >
            <Edit2 className="w-3.5 h-3.5" />
            Edit
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

/** Inline editable text field */
function EditableField({
  label,
  value,
  placeholder,
  multiline = false,
}: {
  label: string;
  value: string;
  placeholder?: string;
  multiline?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value);
  const [saved, setSaved] = useState(value);

  const save = () => { setSaved(val); setEditing(false); };
  const cancel = () => { setVal(saved); setEditing(false); };

  return (
    <div className="space-y-1">
      <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-tertiary)" }}>
        {label}
      </label>
      {editing ? (
        <div className="flex items-start gap-2">
          {multiline ? (
            <textarea
              value={val}
              onChange={e => setVal(e.target.value)}
              rows={3}
              autoFocus
              className="flex-1 text-sm rounded-md border px-3 py-2 resize-none focus:outline-none focus:ring-2"
              style={{
                borderColor: "var(--color-border)",
                background: "var(--color-surface)",
                color: "var(--color-text-primary)",
              }}
            />
          ) : (
            <input
              type="text"
              value={val}
              onChange={e => setVal(e.target.value)}
              autoFocus
              className="flex-1 text-sm rounded-md border px-3 py-2 focus:outline-none focus:ring-2"
              style={{
                borderColor: "var(--color-border)",
                background: "var(--color-surface)",
                color: "var(--color-text-primary)",
              }}
            />
          )}
          <button onClick={save} className="mt-1 p-1.5 rounded-md transition-colors" style={{ color: "var(--color-success-600)", background: "var(--color-success-50)" }}>
            <Check className="w-4 h-4" />
          </button>
          <button onClick={cancel} className="mt-1 p-1.5 rounded-md transition-colors" style={{ color: "var(--color-text-tertiary)", background: "var(--color-bg-secondary)" }}>
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setEditing(true)}
          className="group w-full text-left text-sm px-3 py-2 rounded-md border transition-all duration-200 hover:border-primary-300"
          style={{
            borderColor: "var(--color-border)",
            color: saved ? "var(--color-text-primary)" : "var(--color-text-tertiary)",
            background: "var(--color-surface)",
          }}
        >
          <span className={saved ? "" : "italic"}>{saved || placeholder || `Add ${label}…`}</span>
          <Edit2 className="w-3 h-3 inline ml-2 opacity-0 group-hover:opacity-60 transition-opacity" style={{ color: "var(--color-text-tertiary)" }} />
        </button>
      )}
    </div>
  );
}

/** Skill chip with delete */
function SkillChip({ label, onDelete }: { label: string; onDelete: () => void }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-all duration-200 group"
      style={{ background: "var(--color-primary-50)", color: "var(--color-primary-700)" }}
    >
      {label}
      <button
        onClick={onDelete}
        className="opacity-0 group-hover:opacity-100 transition-opacity rounded-full hover:bg-primary-200 p-0.5"
      >
        <X className="w-2.5 h-2.5" />
      </button>
    </span>
  );
}

/** Profile completeness ring/bar */
function CompletenessCard({ pct, breakdown }: { pct: number; breakdown: typeof MOCK_USER.completenessBreakdown }) {
  const color = pct >= 80 ? "var(--color-success-500)" : pct >= 50 ? "var(--color-warning-500)" : "var(--color-error-500)";
  const r = 36;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;

  return (
    <div
      className="rounded-xl border p-6"
      style={{ background: "var(--color-card)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-sm)" }}
    >
      <div className="flex items-center gap-4 mb-5">
        {/* Circular gauge */}
        <div className="relative flex-shrink-0">
          <svg width="88" height="88" viewBox="0 0 88 88">
            <circle cx="44" cy="44" r={r} fill="none" stroke="var(--color-border)" strokeWidth="8" />
            <circle
              cx="44" cy="44" r={r} fill="none"
              stroke={color}
              strokeWidth="8"
              strokeDasharray={`${dash} ${circ}`}
              strokeLinecap="round"
              transform="rotate(-90 44 44)"
              style={{ transition: "stroke-dasharray 0.6s ease" }}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-lg font-bold" style={{ color }}>
            {pct}%
          </span>
        </div>
        <div>
          <p className="text-sm font-bold" style={{ color: "var(--color-text-primary)" }}>Profile Strength</p>
          <p className="text-xs mt-0.5" style={{ color: "var(--color-text-tertiary)" }}>
            {pct >= 80 ? "Looking great! 🎉" : `Complete your profile for ${pct < 50 ? "50%" : "25%"} more matches`}
          </p>
          <span
            className="inline-block mt-2 text-xs font-semibold px-2.5 py-0.5 rounded-full"
            style={{ background: pct >= 80 ? "var(--color-success-50)" : "var(--color-warning-50)", color: pct >= 80 ? "var(--color-success-600)" : "var(--color-warning-600)" }}
          >
            {pct >= 80 ? "Strong" : pct >= 50 ? "Good" : "Needs Work"}
          </span>
        </div>
      </div>

      <div className="space-y-2.5">
        {breakdown.map(b => (
          <div key={b.label} className="flex items-center gap-3">
            <div className={cn("w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0", b.done ? "" : "")}
              style={{ background: b.done ? "var(--color-success-50)" : "var(--color-bg-secondary)" }}
            >
              {b.done
                ? <Check className="w-2.5 h-2.5" style={{ color: "var(--color-success-600)" }} />
                : <Plus className="w-2.5 h-2.5" style={{ color: "var(--color-text-tertiary)" }} />
              }
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-xs font-medium" style={{ color: "var(--color-text-primary)" }}>{b.label}</span>
                <span className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>{b.pct}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full" style={{ background: "var(--color-border)" }}>
                <div
                  className="h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${b.pct}%`, background: b.pct === 100 ? "var(--color-success-500)" : "var(--color-primary-500)" }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────── PAGE ──────────────────────────── */
export default function ProfilePage() {
  const [skills, setSkills] = useState(MOCK_SKILLS);
  const [newSkill, setNewSkill] = useState("");
  const [addingSkill, setAddingSkill] = useState(false);
  const [expandedExp, setExpandedExp] = useState<number | null>(1);

  const addSkill = () => {
    const trimmed = newSkill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills(prev => [...prev, trimmed]);
    }
    setNewSkill("");
    setAddingSkill(false);
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">

      {/* ── PAGE HEADER ── */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--color-text-primary)" }}>My Profile</h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--color-text-tertiary)" }}>
          Manage your professional information and job preferences
        </p>
      </div>

      {/* ── TWO-COLUMN GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── LEFT COLUMN ── */}
        <div className="lg:col-span-1 space-y-6">

          {/* Avatar & Identity card */}
          <div
            className="rounded-xl border p-6 flex flex-col items-center text-center"
            style={{ background: "var(--color-card)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-sm)" }}
          >
            {/* Avatar */}
            <div className="relative mb-4">
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold text-white border-4"
                style={{
                  background: "linear-gradient(135deg, var(--color-primary-700), var(--color-primary-500))",
                  borderColor: "var(--color-primary-100)",
                }}
              >
                {MOCK_USER.firstName[0]}{MOCK_USER.lastName[0]}
              </div>
              <button
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-200 hover:scale-110"
                style={{ background: "var(--color-card)", borderColor: "var(--color-border)" }}
                title="Change photo"
              >
                <Camera className="w-3.5 h-3.5" style={{ color: "var(--color-primary-600)" }} />
              </button>
            </div>

            <h2 className="text-lg font-bold" style={{ color: "var(--color-text-primary)" }}>
              {MOCK_USER.firstName} {MOCK_USER.lastName}
            </h2>
            <p className="text-sm mt-0.5" style={{ color: "var(--color-text-secondary)" }}>{MOCK_USER.title}</p>
            <div className="flex items-center gap-1.5 mt-1.5">
              <MapPin className="w-3.5 h-3.5" style={{ color: "var(--color-text-tertiary)" }} />
              <span className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>{MOCK_USER.location}</span>
            </div>

            {/* Social Links */}
            <div className="w-full border-t mt-4 pt-4 space-y-2" style={{ borderColor: "var(--color-border)" }}>
              {[
                { icon: Linkedin, label: MOCK_USER.linkedin, href: "#" },
                { icon: Github, label: MOCK_USER.github, href: "#" },
                { icon: Globe, label: MOCK_USER.website, href: "#" },
              ].map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  className="flex items-center gap-2 text-xs px-2 py-1.5 rounded-md transition-all duration-200 hover:bg-primary-50 group"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  <Icon className="w-3.5 h-3.5 flex-shrink-0 group-hover:text-primary-600 transition-colors" />
                  <span className="truncate">{label}</span>
                  <ExternalLink className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-60 transition-opacity flex-shrink-0" />
                </a>
              ))}
            </div>

            <Button variant="outline" className="mt-4 w-full text-xs" onClick={() => {}}>
              <FileText className="w-3.5 h-3.5" /> View Public Profile
            </Button>
          </div>

          {/* Completeness */}
          <CompletenessCard pct={MOCK_USER.completeness} breakdown={MOCK_USER.completenessBreakdown} />

          {/* Quick Stats */}
          <div
            className="rounded-xl border p-5"
            style={{ background: "var(--color-card)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-sm)" }}
          >
            <h3 className="text-sm font-bold mb-4" style={{ color: "var(--color-text-primary)" }}>Job Preferences</h3>
            <div className="space-y-3">
              {[
                { icon: Briefcase, label: "Title", value: MOCK_PREFS.jobTitle },
                { icon: DollarSign, label: "Salary", value: MOCK_PREFS.salary },
                { icon: Wifi, label: "Remote", value: MOCK_PREFS.remote },
                { icon: MapPin, label: "Locations", value: MOCK_PREFS.locations.join(", ") },
                { icon: Clock, label: "Type", value: MOCK_PREFS.types.join(", ") },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: "var(--color-primary-50)" }}>
                    <Icon className="w-3.5 h-3.5" style={{ color: "var(--color-primary-600)" }} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>{label}</p>
                    <p className="text-xs font-semibold truncate" style={{ color: "var(--color-text-primary)" }}>{value}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="secondary" className="mt-4 w-full text-xs" onClick={() => {}}>
              <Edit2 className="w-3 h-3" /> Edit Preferences
            </Button>
          </div>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Basic Info */}
          <SectionCard title="Basic Information" icon={User} onEdit={() => {}}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <EditableField label="First Name" value={MOCK_USER.firstName} />
              <EditableField label="Last Name" value={MOCK_USER.lastName} />
              <EditableField label="Email" value={MOCK_USER.email} />
              <EditableField label="Phone" value={MOCK_USER.phone} />
              <EditableField label="Location" value={MOCK_USER.location} />
              <EditableField label="Job Title" value={MOCK_USER.title} />
            </div>
            <div className="mt-4">
              <EditableField label="Professional Summary" value={MOCK_USER.summary} multiline />
            </div>
          </SectionCard>

          {/* Work Experience */}
          <SectionCard title="Work Experience" icon={Briefcase} onEdit={() => {}}>
            <div className="space-y-4">
              {MOCK_EXPERIENCE.map((exp) => {
                const isExpanded = expandedExp === exp.id;
                return (
                  <div
                    key={exp.id}
                    className="border rounded-lg overflow-hidden transition-all duration-200"
                    style={{ borderColor: "var(--color-border)" }}
                  >
                    {/* Header row */}
                    <button
                      className="w-full flex items-start gap-4 p-4 text-left hover:bg-primary-50/40 transition-colors duration-200"
                      onClick={() => setExpandedExp(isExpanded ? null : exp.id)}
                    >
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: "var(--color-primary-50)" }}
                      >
                        <Building2 className="w-5 h-5" style={{ color: "var(--color-primary-600)" }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold" style={{ color: "var(--color-text-primary)" }}>{exp.title}</p>
                        <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>{exp.company} · {exp.location}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="neutral">{exp.type}</Badge>
                          <span className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>{exp.from} – {exp.to}</span>
                        </div>
                      </div>
                      <div className="flex-shrink-0 mt-1">
                        {isExpanded
                          ? <ChevronUp className="w-4 h-4" style={{ color: "var(--color-text-tertiary)" }} />
                          : <ChevronDown className="w-4 h-4" style={{ color: "var(--color-text-tertiary)" }} />
                        }
                      </div>
                    </button>

                    {/* Expanded body */}
                    {isExpanded && (
                      <div className="px-4 pb-4 border-t" style={{ borderColor: "var(--color-border)" }}>
                        <p className="text-sm mt-3 leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>{exp.desc}</p>
                        <div className="flex items-center gap-2 mt-3">
                          <button className="text-xs font-semibold flex items-center gap-1 transition-colors"
                            style={{ color: "var(--color-primary-600)" }}>
                            <Edit2 className="w-3 h-3" /> Edit
                          </button>
                          <span style={{ color: "var(--color-border)" }}>·</span>
                          <button className="text-xs font-semibold flex items-center gap-1 transition-colors"
                            style={{ color: "var(--color-error-500)" }}>
                            <Trash2 className="w-3 h-3" /> Remove
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Add experience button */}
              <button
                className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border-2 border-dashed transition-all duration-200 hover:border-primary-400 hover:bg-primary-50/40 text-sm font-semibold"
                style={{ borderColor: "var(--color-border)", color: "var(--color-text-tertiary)" }}
              >
                <Plus className="w-4 h-4" /> Add Experience
              </button>
            </div>
          </SectionCard>

          {/* Education */}
          <SectionCard title="Education" icon={GraduationCap} onEdit={() => {}}>
            <div className="space-y-4">
              {MOCK_EDUCATION.map((edu) => (
                <div key={edu.id} className="flex items-start gap-4 p-4 rounded-lg border"
                  style={{ borderColor: "var(--color-border)" }}>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: "var(--color-primary-50)" }}>
                    <BookOpen className="w-5 h-5" style={{ color: "var(--color-primary-600)" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold" style={{ color: "var(--color-text-primary)" }}>{edu.degree}</p>
                    <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>{edu.school} · {edu.location}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>{edu.from} – {edu.to}</span>
                      <Badge variant="success">GPA: {edu.gpa}</Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-1.5 rounded-md hover:bg-primary-50 transition-colors">
                      <Edit2 className="w-3.5 h-3.5" style={{ color: "var(--color-primary-600)" }} />
                    </button>
                    <button className="p-1.5 rounded-md hover:bg-error-50 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" style={{ color: "var(--color-error-500)" }} />
                    </button>
                  </div>
                </div>
              ))}
              <button
                className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border-2 border-dashed transition-all duration-200 hover:border-primary-400 hover:bg-primary-50/40 text-sm font-semibold"
                style={{ borderColor: "var(--color-border)", color: "var(--color-text-tertiary)" }}
              >
                <Plus className="w-4 h-4" /> Add Education
              </button>
            </div>
          </SectionCard>

          {/* Skills */}
          <SectionCard title="Skills" icon={Star}>
            <div className="flex flex-wrap gap-2 mb-4">
              {skills.map(skill => (
                <SkillChip key={skill} label={skill} onDelete={() => setSkills(s => s.filter(x => x !== skill))} />
              ))}
            </div>

            {addingSkill ? (
              <div className="flex items-center gap-2 mt-2">
                <input
                  autoFocus
                  type="text"
                  placeholder="Add a skill…"
                  value={newSkill}
                  onChange={e => setNewSkill(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") addSkill(); if (e.key === "Escape") setAddingSkill(false); }}
                  className="flex-1 text-sm rounded-md border px-3 py-2 focus:outline-none focus:ring-2"
                  style={{ borderColor: "var(--color-border)", background: "var(--color-surface)", color: "var(--color-text-primary)" }}
                />
                <Button variant="primary" className="text-xs py-2" onClick={addSkill}>Add</Button>
                <Button variant="ghost" className="text-xs py-2" onClick={() => setAddingSkill(false)}>Cancel</Button>
              </div>
            ) : (
              <button
                onClick={() => setAddingSkill(true)}
                className="flex items-center gap-1.5 text-xs font-semibold transition-all duration-200 px-3 py-1.5 rounded-md hover:bg-primary-50"
                style={{ color: "var(--color-primary-600)" }}
              >
                <Plus className="w-3.5 h-3.5" /> Add Skill
              </button>
            )}
          </SectionCard>

          {/* Certifications */}
          <SectionCard title="Certifications" icon={Award} onEdit={() => {}}>
            <div className="space-y-3">
              {MOCK_CERTS.map(cert => (
                <div key={cert.id} className="flex items-start gap-3 p-4 rounded-lg border"
                  style={{ borderColor: "var(--color-border)" }}>
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: "var(--color-primary-50)" }}>
                    <Shield className="w-4.5 h-4.5" style={{ color: "var(--color-primary-600)" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>{cert.name}</p>
                    <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>{cert.issuer}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <Badge variant="primary">Issued {cert.date}</Badge>
                      <span className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>Expires {cert.expiry}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-1.5 rounded-md hover:bg-primary-50 transition-colors">
                      <Edit2 className="w-3.5 h-3.5" style={{ color: "var(--color-primary-600)" }} />
                    </button>
                    <button className="p-1.5 rounded-md hover:bg-error-50 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" style={{ color: "var(--color-error-500)" }} />
                    </button>
                  </div>
                </div>
              ))}
              <button
                className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border-2 border-dashed transition-all duration-200 hover:border-primary-400 hover:bg-primary-50/40 text-sm font-semibold"
                style={{ borderColor: "var(--color-border)", color: "var(--color-text-tertiary)" }}
              >
                <Plus className="w-4 h-4" /> Add Certification
              </button>
            </div>
          </SectionCard>

          {/* Industries */}
          <SectionCard title="Industries of Interest" icon={Target} onEdit={() => {}}>
            <div className="flex flex-wrap gap-2">
              {MOCK_PREFS.industries.map(ind => (
                <Badge key={ind} variant="primary">{ind}</Badge>
              ))}
              <button
                className="text-xs font-semibold px-3 py-1 rounded-full border-2 border-dashed transition-all duration-200 hover:border-primary-400 hover:bg-primary-50"
                style={{ borderColor: "var(--color-border)", color: "var(--color-text-tertiary)" }}
              >
                <Plus className="w-3 h-3 inline mr-1" />Add
              </button>
            </div>
          </SectionCard>

        </div>
      </div>
    </div>
  );
}
