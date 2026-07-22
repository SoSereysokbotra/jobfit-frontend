/** Backend DTO -> view adapter for the job feature. */

import type { JobDto } from "./job.api";
import type { Job, RemoteType } from "@/shared/types/shared.types";
import { daysSince, initialsFrom, logoBgFor, toSalaryK } from "@/lib/utils/format";

/** Backend remoteType tokens -> the frontend's display union. */
const REMOTE_LABELS: Record<string, RemoteType> = {
  REMOTE: "Remote",
  HYBRID: "Hybrid",
  ON_SITE: "On-site",
  ONSITE: "On-site",
};

function toRemote(token: string | undefined): RemoteType {
  return REMOTE_LABELS[(token ?? "").toUpperCase()] ?? "On-site";
}

/**
 * JobDto -> Job. Faithful for the fields the backend has; the rest are DEFAULTED
 * because the Job model does not carry them yet:
 *
 *   TODO(backend): `match`    — needs the AI matching service (Phase 10). 0 until then.
 *   TODO(backend): `type`     — no employmentType column. Defaults to "Full-time".
 *   TODO(backend): `level`    — no experienceLevel column. Defaults to "Mid-level".
 *   TODO(backend): `industry` — Job has none; Company.industry is an id, not exposed.
 *                               Defaults to "Technology".
 *
 * These defaults keep the existing UI (cards, filter facets, sorts) working; they
 * are the single place to change when the backend grows the fields.
 */
export function toJobView(dto: JobDto): Job {
  const company = dto.companyName?.trim() || "Company";
  return {
    id: dto.id,
    title: dto.title,
    company,
    logo: initialsFrom(dto.companyName ?? dto.title),
    logoBg: logoBgFor(dto.companyId),
    location: dto.location?.trim() || (toRemote(dto.remoteType) === "Remote" ? "Remote" : "—"),
    salaryMin: toSalaryK(dto.salaryRange?.min),
    salaryMax: toSalaryK(dto.salaryRange?.max),
    match: 0, // TODO(backend): AI match score not available yet.
    type: "Full-time", // TODO(backend)
    remote: toRemote(dto.remoteType),
    level: "Mid-level", // TODO(backend)
    industry: "Technology", // TODO(backend)
    postedDaysAgo: daysSince(dto.createdAt),
    description: dto.description,
    responsibilities: dto.responsibilities ?? [],
    requirements: dto.requirements ?? [],
    benefits: dto.benefits ?? [],
    bonusPct: dto.bonusPct ?? undefined,
  };
}

export function toJobViews(dtos: JobDto[]): Job[] {
  return dtos.map(toJobView);
}
