/** Backend DTO -> view adapter for the job feature. */

import type { JobDto } from "./job.api";
import type {
  EmploymentType, ExperienceLevel, Job, RemoteType,
} from "@/shared/types/shared.types";
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

const EMPLOYMENT_LABELS: Record<string, EmploymentType> = {
  FULL_TIME: "Full-time",
  PART_TIME: "Part-time",
  CONTRACT: "Contract",
  TEMPORARY: "Temporary",
  FREELANCE: "Freelance",
};

const LEVEL_LABELS: Record<string, ExperienceLevel> = {
  INTERN: "Intern",
  ENTRY: "Entry-level",
  MID: "Mid-level",
  SENIOR: "Senior",
  LEAD: "Lead",
  MANAGER: "Manager",
  DIRECTOR: "Director",
  C_LEVEL: "C-level",
};

/**
 * Look a token up, returning undefined for anything absent or unrecognised.
 *
 * `?? someDefault` is exactly what this file used to do, and it is the bug: an
 * unrecognised token means we do not know, and "we do not know" has to survive all the
 * way to the pixel or the card asserts something nobody said.
 */
function labelOf<T extends string>(
  labels: Record<string, T>,
  token: string | undefined,
): T | undefined {
  return token ? labels[token.toUpperCase()] : undefined;
}

/**
 * JobDto -> Job.
 *
 * `type`, `level` and `industry` used to be hardcoded to "Full-time", "Mid-level" and
 * "Technology" because the backend had no such columns. Job cards render the first two
 * as pills, so every card claimed "Full-time · Mid-level" regardless of the posting —
 * including the part-time teaching one. The backend now has `employmentType` and
 * `experienceLevel` (nullable, and null on every job posted before they existed), and
 * `industry` comes off the company profile on the detail response.
 *
 * All three are now UNDEFINED when unknown, and every consumer renders nothing for them.
 *
 *   TODO(backend): `match` — needs the AI matching service (Phase 10). 0 until then.
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
    type: labelOf(EMPLOYMENT_LABELS, dto.employmentType),
    remote: toRemote(dto.remoteType),
    level: labelOf(LEVEL_LABELS, dto.experienceLevel),
    // The company's industry, resolved to a name by the backend. Only the DETAIL
    // response carries `company`, so this is undefined in list results — which is
    // correct: we genuinely do not know it there.
    industry: dto.company?.industry,
    postedDaysAgo: daysSince(dto.createdAt),
    description: dto.description,
    responsibilities: dto.responsibilities ?? [],
    requirements: dto.requirements ?? [],
    benefits: dto.benefits ?? [],
    bonusPct: dto.bonusPct ?? undefined,
    // Decides "Apply Now" vs "Apply Externally". Absent on an older backend, in which case
    // the job is treated as INTERNAL — the server stays the real gate either way.
    sourceType: dto.sourceType,
    externalUrl: dto.externalUrl,
    companyProfile: dto.company,
  };
}

export function toJobViews(dtos: JobDto[]): Job[] {
  return dtos.map(toJobView);
}
