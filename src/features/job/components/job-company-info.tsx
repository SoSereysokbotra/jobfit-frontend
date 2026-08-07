import React from "react";
import { ExternalLink, MapPin, Star } from "lucide-react";
import { Job } from "@/shared/types/shared.types";

interface JobCompanyInfoProps {
  job: Job;
}

const SIZE_LABELS: Record<string, string> = {
  STARTUP: "Startup (1-10)",
  SMALL: "Small (11-50)",
  MEDIUM: "Medium (51-250)",
  LARGE: "Large (251-1000)",
  ENTERPRISE: "Enterprise (1000+)",
};

/**
 * What is actually recorded about the posting company.
 *
 * Each row renders only when the database has a value. This panel previously hardcoded
 * "Technology & Software", "500-1000 employees", "Series C, $120M", "SF, NYC, London,
 * Remote" and "Glassdoor 4.2/5 (234 reviews)" for every employer, with dead "#" links —
 * publishing invented facts about real businesses. G&W Electric, an electrical equipment
 * manufacturer whose row is null for all of those, was shown as a Series C software
 * startup.
 *
 * Most companies still have little recorded (`size` is populated 0 times across the
 * table), so an empty panel is the correct output for them. It is better to show a name
 * than a fiction.
 */
export function JobCompanyInfo({ job }: JobCompanyInfoProps) {
  const c = job.companyProfile;
  const rows: { label: string; value: string }[] = [];

  if (c?.industry) rows.push({ label: "Industry", value: c.industry });
  if (c?.size && SIZE_LABELS[c.size]) rows.push({ label: "Company size", value: SIZE_LABELS[c.size] });
  if (c?.foundedYear) rows.push({ label: "Founded", value: String(c.foundedYear) });
  if (c?.location) rows.push({ label: "Headquarters", value: c.location });

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

      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center text-white text-lg font-bold shrink-0"
          style={{ background: job.logoBg }}
        >
          {job.logo}
        </div>
        <div className="min-w-0">
          <p className="font-semibold truncate" style={{ color: "var(--color-text-primary)" }}>
            {job.company}
          </p>
          {job.location && job.location !== "—" && (
            <p className="text-xs flex items-center gap-1" style={{ color: "var(--color-text-tertiary)" }}>
              <MapPin size={11} /> {job.location}
            </p>
          )}
        </div>
      </div>

      {c?.description && (
        <p className="text-sm mb-4 leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
          {c.description}
        </p>
      )}

      {rows.length > 0 && (
        <div className="space-y-3 text-sm" style={{ color: "var(--color-text-secondary)" }}>
          {rows.map((row) => (
            <div
              key={row.label}
              className="flex justify-between border-b pb-2"
              style={{ borderColor: "var(--color-border)" }}
            >
              <span style={{ color: "var(--color-text-tertiary)" }}>{row.label}</span>
              <span className="font-medium">{row.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Only rendered when a real rating exists — no company currently has one, so this
          stays hidden rather than showing an invented 4.2/5. */}
      {typeof c?.glassdoorRating === "number" && (
        <div className="pt-3">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm" style={{ color: "var(--color-text-primary)" }}>
              Glassdoor Rating
            </span>
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={14}
                  fill={star <= Math.round(c.glassdoorRating!) ? "var(--color-warning-400)" : "transparent"}
                  color={star <= Math.round(c.glassdoorRating!) ? "var(--color-warning-400)" : "var(--color-neutral-300)"}
                />
              ))}
            </div>
            <span className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
              ({c.glassdoorRating.toFixed(1)}/5
              {c.glassdoorReviews ? `, ${c.glassdoorReviews} reviews` : ""})
            </span>
          </div>
        </div>
      )}

      {/* A real URL or nothing — never a "#" that goes nowhere. */}
      {c?.website && (
        <a
          href={c.website}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs hover:underline inline-flex items-center gap-1 mt-3"
          style={{ color: "var(--color-primary-600)" }}
        >
          Visit website <ExternalLink size={12} />
        </a>
      )}
    </div>
  );
}
