"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, Check, AlertTriangle } from "lucide-react";
import { Job } from "@/shared/types/shared.types";
import { JobSalaryBadges } from "./job-salary-badges";

interface JobDescriptionSectionsProps {
  job: Job;
}

export function JobDescriptionSections({ job }: JobDescriptionSectionsProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    summary: true,
    responsibilities: true,
    skills: true,
    benefits: true,
  });

  const toggleSection = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const SectionHeader = ({ id, title }: { id: string; title: string }) => (
    <button
      onClick={() => toggleSection(id)}
      className="flex items-center justify-between w-full py-4 bg-transparent border-none cursor-pointer focus:outline-none"
    >
      <h3 className="text-lg font-bold" style={{ color: "var(--color-text-primary)" }}>
        {title}
      </h3>
      {expanded[id] ? (
        <ChevronUp size={20} style={{ color: "var(--color-text-tertiary)" }} />
      ) : (
        <ChevronDown size={20} style={{ color: "var(--color-text-tertiary)" }} />
      )}
    </button>
  );

  return (
    <div
      className="rounded-lg border overflow-hidden"
      style={{
        background: "var(--color-card)",
        borderColor: "var(--color-border)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      {/* 1. Job Summary */}
      <div className="border-b px-6" style={{ borderColor: "var(--color-border)" }}>
        <SectionHeader id="summary" title="Job Summary" />
        {expanded["summary"] && (
          <div className="pb-6 text-sm" style={{ color: "var(--color-text-secondary)", lineHeight: "1.65" }}>
            {job.description}
            <br />
            <br />
            As a key member of our growing team, you will collaborate closely with cross-functional partners
            to deliver high-quality solutions that impact millions of users. If you are passionate about building scalable
            systems and elegant user experiences, we want to hear from you.
          </div>
        )}
      </div>

      {/* 2. Responsibilities */}
      <div className="border-b px-6" style={{ borderColor: "var(--color-border)" }}>
        <SectionHeader id="responsibilities" title="Responsibilities" />
        {expanded["responsibilities"] && (
          <div className="pb-6 text-sm" style={{ color: "var(--color-text-secondary)", lineHeight: "1.65" }}>
            <ul className="list-disc pl-5 space-y-2">
              <li>Design, build, and maintain scalable architecture for high-traffic services.</li>
              <li>Write clean, testable, and efficient code following best practices.</li>
              <li>Collaborate with product managers and designers to define and implement new features.</li>
              <li>Participate in code reviews and mentor junior engineers on the team.</li>
              <li>Identify and resolve performance bottlenecks in production systems.</li>
            </ul>
          </div>
        )}
      </div>

      {/* 3. Required Skills (with match highlighted) */}
      <div className="border-b px-6" style={{ borderColor: "var(--color-border)" }}>
        <SectionHeader id="skills" title="Required Skills & Qualifications" />
        {expanded["skills"] && (
          <div className="pb-6 text-sm space-y-3" style={{ color: "var(--color-text-secondary)", lineHeight: "1.65" }}>
            <div className="flex items-start gap-2">
              <Check size={16} className="mt-0.5" style={{ color: "var(--color-success-600)" }} />
              <span><strong>React & TypeScript</strong> (You have 4+ years of experience)</span>
            </div>
            <div className="flex items-start gap-2">
              <Check size={16} className="mt-0.5" style={{ color: "var(--color-success-600)" }} />
              <span><strong>Node.js / Express</strong> (You have used this in recent projects)</span>
            </div>
            <div className="flex items-start gap-2">
              <Check size={16} className="mt-0.5" style={{ color: "var(--color-success-600)" }} />
              <span><strong>RESTful API Design</strong> (Matches your profile)</span>
            </div>
            <div className="flex items-start gap-2">
              <AlertTriangle size={16} className="mt-0.5" style={{ color: "var(--color-warning-600)" }} />
              <div>
                <span className="line-through opacity-70">GraphQL Experience</span>
                <span className="ml-2 font-medium" style={{ color: "var(--color-warning-700)" }}>
                  You don't have this, but it's learnable on the job.
                </span>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Check size={16} className="mt-0.5" style={{ color: "var(--color-success-600)" }} />
              <span><strong>Agile Methodologies</strong> (Strong match)</span>
            </div>
          </div>
        )}
      </div>

      {/* 4. Benefits & Compensation */}
      <div className="px-6">
        <SectionHeader id="benefits" title="Benefits & Compensation" />
        {expanded["benefits"] && (
          <div className="pb-6 text-sm" style={{ color: "var(--color-text-secondary)", lineHeight: "1.65" }}>
            {job.salaryMin && job.salaryMax ? (
              <JobSalaryBadges baseMin={job.salaryMin} baseMax={job.salaryMax} bonus={15} />
            ) : null}
            
            <ul className="list-disc pl-5 space-y-2 mt-4">
              <li>Comprehensive Health, Dental, and Vision insurance plans.</li>
              <li>401(k) matching up to 5% of your base salary.</li>
              <li>Generous PTO policy (20 days) + 11 paid company holidays.</li>
              <li>Flexible working hours and remote-friendly culture.</li>
              <li>$2,000 annual budget for professional development and learning.</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
