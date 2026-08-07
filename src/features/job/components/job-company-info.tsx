import React from "react";
import { MapPin } from "lucide-react";
import { Job } from "@/shared/types/shared.types";

interface JobCompanyInfoProps {
  job: Job;
}

/**
 * What we actually know about the posting company.
 *
 * This panel previously displayed "Technology & Software", "500-1000 employees",
 * "Series C, $120M", "SF, NYC, London, Remote" and a "Glassdoor 4.2/5 (234 reviews)"
 * rating — all hardcoded, shown for every company. That is not placeholder styling: it
 * published invented facts about REAL businesses. G&W Electric, an electrical equipment
 * manufacturer, was being described as a Series C software startup.
 *
 * The database backs none of it. Across 34 companies: `size` populated 0 times,
 * `glassdoorRating` 0, `website` 3. So the fabricated rows are gone rather than wired up,
 * and this renders only fields that come from the job itself. Add rows back when the
 * Company table actually carries the data — and only then.
 */
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

      <div className="flex items-center gap-3">
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
            <p
              className="text-xs flex items-center gap-1"
              style={{ color: "var(--color-text-tertiary)" }}
            >
              <MapPin size={11} /> {job.location}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
