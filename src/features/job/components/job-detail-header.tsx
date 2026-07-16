import React from "react";
import { DollarSign, Clock, Building2 } from "lucide-react";
import { Job, formatSalaryRange, formatPostedDate } from "@/shared/types/shared.types";

interface JobDetailHeaderProps {
  job: Job;
}

export function JobDetailHeader({ job }: JobDetailHeaderProps) {
  return (
    <div
      className="p-6 rounded-lg border"
      style={{
        background: "var(--color-card)",
        borderColor: "var(--color-border)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div className="flex items-start gap-4">
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center text-white text-lg font-bold shrink-0"
          style={{ background: job.logoBg }}
        >
          {job.logo}
        </div>
        <div className="flex-1 min-w-0">
          <h1
            className="text-2xl font-bold truncate mb-1"
            style={{ color: "var(--color-text-primary)" }}
          >
            {job.title}
          </h1>
          <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
            {job.company} · {job.location}
          </p>
          <div className="flex flex-wrap gap-4 mt-3">
            <span
              className="flex items-center gap-1.5 text-xs font-medium"
              style={{ color: "var(--color-success-600)" }}
            >
              <DollarSign size={14} />
              {formatSalaryRange(job)}
            </span>
            <span
              className="flex items-center gap-1.5 text-xs font-medium"
              style={{ color: "var(--color-text-tertiary)" }}
            >
              <Clock size={14} />
              {formatPostedDate(job.postedDaysAgo)}
            </span>
            <span
              className="flex items-center gap-1.5 text-xs font-medium"
              style={{ color: "var(--color-text-tertiary)" }}
            >
              <Building2 size={14} />
              {job.industry}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
