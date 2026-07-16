import React from "react";
import { ExternalLink, Star } from "lucide-react";
import { Job } from "@/shared/types/shared.types";

interface JobCompanyInfoProps {
  job: Job;
}

export function JobCompanyInfo({ job }: JobCompanyInfoProps) {
  return (
    <div
      className="p-6 rounded-lg border mb-6"
      style={{
        background: "var(--color-card)",
        borderColor: "var(--color-border)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <h3 className="text-lg font-bold mb-4" style={{ color: "var(--color-text-primary)" }}>
        About {job.company}
      </h3>
      <div className="flex items-center gap-3 mb-5">
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center text-white text-lg font-bold shrink-0"
          style={{ background: job.logoBg }}
        >
          {job.logo}
        </div>
        <div>
          <p className="font-semibold" style={{ color: "var(--color-text-primary)" }}>
            {job.company}
          </p>
          <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
            Technology & Software
          </p>
        </div>
      </div>

      <div className="space-y-4 text-sm" style={{ color: "var(--color-text-secondary)" }}>
        <div className="flex justify-between border-b pb-2" style={{ borderColor: "var(--color-border)" }}>
          <span style={{ color: "var(--color-text-tertiary)" }}>Company size</span>
          <span className="font-medium">500-1000 employees</span>
        </div>
        <div className="flex justify-between border-b pb-2" style={{ borderColor: "var(--color-border)" }}>
          <span style={{ color: "var(--color-text-tertiary)" }}>Funding</span>
          <span className="font-medium">Series C, $120M</span>
        </div>
        <div className="flex justify-between border-b pb-2" style={{ borderColor: "var(--color-border)" }}>
          <span style={{ color: "var(--color-text-tertiary)" }}>Locations</span>
          <span className="font-medium">SF, NYC, London, Remote</span>
        </div>
        
        <div className="pt-2">
          <div className="flex items-center gap-2 mb-1">
            <span style={{ color: "var(--color-text-primary)" }} className="font-medium">Glassdoor Rating</span>
            <div className="flex items-center">
              {[1, 2, 3, 4].map((star) => (
                <Star key={star} size={14} fill="var(--color-warning-400)" color="var(--color-warning-400)" />
              ))}
              <Star size={14} fill="transparent" color="var(--color-neutral-300)" />
            </div>
            <span className="text-xs ml-1" style={{ color: "var(--color-text-tertiary)" }}>(4.2/5)</span>
          </div>
          <a
            href="#"
            className="text-xs hover:underline inline-flex items-center gap-1"
            style={{ color: "var(--color-primary-600)" }}
          >
            Read 234 reviews <ExternalLink size={12} />
          </a>
        </div>

        <div className="flex flex-col gap-2 pt-2">
          <a
            href="#"
            className="text-xs hover:underline inline-flex items-center gap-1"
            style={{ color: "var(--color-primary-600)" }}
          >
            Visit website <ExternalLink size={12} />
          </a>
          <a
            href="#"
            className="text-xs hover:underline inline-flex items-center gap-1"
            style={{ color: "var(--color-primary-600)" }}
          >
            View LinkedIn profile <ExternalLink size={12} />
          </a>
        </div>
      </div>
    </div>
  );
}
