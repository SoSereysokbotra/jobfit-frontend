"use client";

import React, { useState } from "react";
import { Building2, CheckCircle2, Upload, Globe } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { Badge } from "@/shared/components/data-display/badge";
import { COMPANY_PROFILE } from "@/features/employer/api/employer.api";

const INDUSTRIES = ["Technology", "Software", "Consulting", "Services", "Healthcare", "Finance"];
const SIZES = ["Startup (1–50)", "Small (51–200)", "Mid-Size (201–1000)", "Enterprise (1000+)"];

export default function CompanyProfilePage() {
  const [description, setDescription] = useState(COMPANY_PROFILE.description);
  const [industries, setIndustries] = useState<string[]>(COMPANY_PROFILE.industries);
  const [size, setSize] = useState(COMPANY_PROFILE.size);
  const [website, setWebsite] = useState(COMPANY_PROFILE.website);

  const toggleIndustry = (name: string) =>
    setIndustries((prev) => (prev.includes(name) ? prev.filter((i) => i !== name) : [...prev, name]));

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-content">Company Profile</h1>
          <p className="text-sm mt-1 text-content-secondary">How candidates see your company on JobFits.</p>
        </div>
        {COMPANY_PROFILE.verified && <Badge tone="success" dot>Verified {COMPANY_PROFILE.verifiedDate}</Badge>}
      </div>

      {/* Identity */}
      <div className="rounded-lg border border-border bg-card shadow-sm p-5 sm:p-6 space-y-5">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl flex items-center justify-center text-white shrink-0 bg-gradient-primary">
            <Building2 size={26} />
          </div>
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2 text-content">
              {COMPANY_PROFILE.name}
              {COMPANY_PROFILE.verified && <CheckCircle2 size={16} className="text-success-500" />}
            </h2>
            <button className="text-xs font-semibold inline-flex items-center gap-1.5 mt-1 text-primary-600 transition-colors hover:underline">
              <Upload size={13} /> Upload logo
            </button>
          </div>
        </div>

        <Field label="Company Description">
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2.5 rounded-md border border-border bg-background text-content text-sm outline-none resize-y transition-all focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </Field>

        <Field label="Industries">
          <div className="flex flex-wrap gap-2">
            {INDUSTRIES.map((name) => {
              const on = industries.includes(name);
              return (
                <button key={name} onClick={() => toggleIndustry(name)} className={cn("px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors", on ? "bg-primary-50 border-primary-200 text-primary-700" : "bg-background border-border text-content-secondary")}>
                  {name}
                </button>
              );
            })}
          </div>
        </Field>

        <Field label="Company Size">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {SIZES.map((s) => (
              <label key={s} className={cn("flex items-center gap-2 px-3 py-2 rounded-md border cursor-pointer text-sm text-content transition-colors", size === s ? "border-primary-300 bg-primary-50" : "border-border bg-background")}>
                <input type="radio" name="size" checked={size === s} onChange={() => setSize(s)} className="w-4 h-4 accent-primary-600" />
                {s}
              </label>
            ))}
          </div>
        </Field>

        <Field label="Website">
          <div className="relative">
            <Globe size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-content-tertiary" />
            <input
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 rounded-md border border-border bg-background text-content text-sm outline-none transition-all focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </Field>
      </div>

      <div className="flex justify-end gap-3">
        <button className="px-5 py-2.5 rounded-md text-sm font-bold border border-border bg-background text-content transition-colors hover:bg-neutral-50">Cancel</button>
        <button className="px-5 py-2.5 rounded-md text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 transition-all active:scale-[0.98]">Save Changes</button>
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
