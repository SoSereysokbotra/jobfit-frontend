"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, X, Plus } from "lucide-react";
import { cn } from "@/shared/utils/cn";

const EMPLOYMENT_TYPES = ["Full-time", "Part-time", "Contract", "Internship"];
const REMOTE_TYPES = ["On-site", "Hybrid", "Remote"];
const LEVELS = ["Entry", "Mid", "Senior", "Lead"];

const INPUT = "w-full px-3 py-2.5 rounded-md border border-border bg-background text-content text-sm outline-none transition-all focus:ring-2 focus:ring-primary-500 focus:border-transparent";

export default function CreateJobPage() {
  const [skills, setSkills] = useState<string[]>(["Python", "SQL"]);
  const [skillInput, setSkillInput] = useState("");
  const [type, setType] = useState("Full-time");
  const [remote, setRemote] = useState("Hybrid");
  const [level, setLevel] = useState("Senior");

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !skills.includes(s)) setSkills((prev) => [...prev, s]);
    setSkillInput("");
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
      <Link href="/employer/jobs" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 transition-colors hover:underline">
        <ArrowLeft size={15} /> Back to Jobs
      </Link>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-content">Create New Job</h1>
        <p className="text-sm mt-1 text-content-secondary">Fill in the details. Save as draft or publish when ready.</p>
      </div>

      <div className="rounded-lg border border-border bg-card shadow-sm p-5 sm:p-6 space-y-5">
        <Field label="Job Title"><input placeholder="e.g. Senior Software Engineer" className={INPUT} /></Field>
        <Field label="Job Description"><textarea rows={4} placeholder="Describe the role, team, and mission…" className={cn(INPUT, "resize-y")} /></Field>
        <Field label="Requirements"><textarea rows={3} placeholder="e.g. 5+ years experience, strong Python skills…" className={cn(INPUT, "resize-y")} /></Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Salary Min ($K)"><input type="number" placeholder="150" className={INPUT} /></Field>
          <Field label="Salary Max ($K)"><input type="number" placeholder="190" className={INPUT} /></Field>
        </div>

        <Field label="Location"><input placeholder="e.g. San Francisco, CA" className={INPUT} /></Field>

        <Field label="Employment Type"><Segmented options={EMPLOYMENT_TYPES} value={type} onChange={setType} /></Field>
        <Field label="Remote Type"><Segmented options={REMOTE_TYPES} value={remote} onChange={setRemote} /></Field>
        <Field label="Experience Level"><Segmented options={LEVELS} value={level} onChange={setLevel} /></Field>

        <Field label="Required Skills">
          <div className="flex flex-wrap gap-2 mb-2">
            {skills.map((s) => (
              <span key={s} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary-50 text-primary-700">
                {s}
                <button onClick={() => setSkills((prev) => prev.filter((x) => x !== s))} aria-label={`Remove ${s}`}><X size={11} /></button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }}
              placeholder="Add a skill and press Enter"
              className={INPUT}
            />
            <button onClick={addSkill} className="px-3 py-2.5 rounded-md border border-border text-content-secondary transition-colors hover:bg-neutral-50"><Plus size={16} /></button>
          </div>
        </Field>
      </div>

      <div className="flex justify-end gap-3">
        <button className="px-5 py-2.5 rounded-md text-sm font-bold border border-border bg-background text-content transition-colors hover:bg-neutral-50">Save Draft</button>
        <button className="px-5 py-2.5 rounded-md text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 transition-all active:scale-[0.98]">Publish Job</button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-content-tertiary">{label}</label>
      {children}
    </div>
  );
}

function Segmented({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button key={o} onClick={() => onChange(o)} className={cn("px-3.5 py-1.5 rounded-md text-xs font-semibold border transition-colors", value === o ? "bg-primary-50 border-primary-200 text-primary-700" : "bg-background border-border text-content-secondary")}>
          {o}
        </button>
      ))}
    </div>
  );
}
