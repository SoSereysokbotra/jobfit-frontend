"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Job } from "@/shared/types/shared.types";
import { JobSalaryBadges } from "./job-salary-badges";

interface JobDescriptionSectionsProps {
  job: Job;
}

/**
 * Job posting body — all content is employer-authored (from the backend). Sections
 * with no content are hidden rather than filled with placeholder text.
 */
export function JobDescriptionSections({ job }: JobDescriptionSectionsProps) {
  const responsibilities = job.responsibilities ?? [];
  const requirements = job.requirements ?? [];
  const benefits = job.benefits ?? [];
  const hasSalary = Boolean(job.salaryMin && job.salaryMax);

  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    summary: true,
    responsibilities: true,
    requirements: true,
    benefits: true,
  });
  const toggle = (id: string) => setExpanded((p) => ({ ...p, [id]: !p[id] }));

  const Header = ({ id, title }: { id: string; title: string }) => (
    <button
      onClick={() => toggle(id)}
      className="flex items-center justify-between w-full py-4 bg-transparent border-none cursor-pointer focus:outline-none"
    >
      <h3 className="text-lg font-bold" style={{ color: "var(--color-text-primary)" }}>{title}</h3>
      {expanded[id] ? (
        <ChevronUp size={20} style={{ color: "var(--color-text-tertiary)" }} />
      ) : (
        <ChevronDown size={20} style={{ color: "var(--color-text-tertiary)" }} />
      )}
    </button>
  );

  const Bullets = ({ items }: { items: string[] }) => (
    <ul className="list-disc pl-5 space-y-2">
      {items.map((t, i) => (
        <li key={i}>{t}</li>
      ))}
    </ul>
  );

  return (
    <div
      className="rounded-lg border overflow-hidden"
      style={{ background: "var(--color-card)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-sm)" }}
    >
      {/* Job Summary — the employer's real description */}
      <div className="border-b px-6" style={{ borderColor: "var(--color-border)" }}>
        <Header id="summary" title="Job Summary" />
        {expanded["summary"] && (
          <div className="pb-6 text-sm whitespace-pre-line" style={{ color: "var(--color-text-secondary)", lineHeight: "1.65" }}>
            {job.description}
          </div>
        )}
      </div>

      {/* Responsibilities */}
      {responsibilities.length > 0 && (
        <div className="border-b px-6" style={{ borderColor: "var(--color-border)" }}>
          <Header id="responsibilities" title="Responsibilities" />
          {expanded["responsibilities"] && (
            <div className="pb-6 text-sm" style={{ color: "var(--color-text-secondary)", lineHeight: "1.65" }}>
              <Bullets items={responsibilities} />
            </div>
          )}
        </div>
      )}

      {/* Requirements */}
      {requirements.length > 0 && (
        <div className="border-b px-6" style={{ borderColor: "var(--color-border)" }}>
          <Header id="requirements" title="Requirements & Qualifications" />
          {expanded["requirements"] && (
            <div className="pb-6 text-sm" style={{ color: "var(--color-text-secondary)", lineHeight: "1.65" }}>
              <Bullets items={requirements} />
            </div>
          )}
        </div>
      )}

      {/* Benefits & Compensation */}
      {(hasSalary || benefits.length > 0) && (
        <div className="px-6">
          <Header id="benefits" title="Benefits & Compensation" />
          {expanded["benefits"] && (
            <div className="pb-6 text-sm" style={{ color: "var(--color-text-secondary)", lineHeight: "1.65" }}>
              {hasSalary && (
                <JobSalaryBadges baseMin={job.salaryMin} baseMax={job.salaryMax} bonus={job.bonusPct ?? 0} />
              )}
              {benefits.length > 0 && (
                <div className="mt-4">
                  <Bullets items={benefits} />
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
