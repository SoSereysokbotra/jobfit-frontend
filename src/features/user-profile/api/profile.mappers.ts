/**
 * Backend DTO -> frontend view adapters for the profile feature.
 *
 * The backend speaks SCREAMING_SNAKE enums and nested value objects; the UI wants
 * readable labels and flat fields. Keeping the translation here means the forms
 * and lists never hard-code an enum spelling.
 */

import type {
  DegreeLevel,
  EmploymentType,
  ExperienceDto,
  JobLevel,
  LocationDto,
  ProfileDto,
  ProficiencyLevel,
  RemoteType,
  EducationDto,
} from "./profile.api";

// ---- Enum label tables (single source of truth for every dropdown) ----

export const JOB_LEVEL_LABELS: Record<JobLevel, string> = {
  INTERN: "Intern",
  ENTRY: "Entry-level",
  MID: "Mid-level",
  SENIOR: "Senior",
  LEAD: "Lead",
  MANAGER: "Manager",
  DIRECTOR: "Director",
  C_LEVEL: "C-level",
};

export const REMOTE_TYPE_LABELS: Record<RemoteType, string> = {
  ON_SITE: "On-site",
  HYBRID: "Hybrid",
  REMOTE: "Remote",
};

export const EMPLOYMENT_TYPE_LABELS: Record<EmploymentType, string> = {
  FULL_TIME: "Full-time",
  PART_TIME: "Part-time",
  CONTRACT: "Contract",
  TEMPORARY: "Temporary",
  FREELANCE: "Freelance",
};

export const DEGREE_LEVEL_LABELS: Record<DegreeLevel, string> = {
  HIGH_SCHOOL: "High school",
  ASSOCIATE: "Associate",
  BACHELOR: "Bachelor's",
  MASTER: "Master's",
  DOCTORATE: "Doctorate",
  CERTIFICATION: "Certification",
};

export const PROFICIENCY_LABELS: Record<ProficiencyLevel, string> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
  EXPERT: "Expert",
};

/** Ordered options for a <select>, derived from the label tables above. */
export const asOptions = <T extends string>(labels: Record<T, string>) =>
  (Object.entries(labels) as [T, string][]).map(([value, label]) => ({ value, label }));

// ---- Formatting ----

/** "Phnom Penh, Cambodia" — skips the parts the backend left blank. */
export function formatLocation(location: LocationDto | null | undefined): string {
  if (!location) return "";
  return [location.city, location.state, location.country].filter(Boolean).join(", ");
}

/**
 * Parse a single free-text location field into a LocationDto.
 *
 * The onboarding step collects one "City, Country" input, but LocationDto
 * requires city AND country — so anything less resolves to undefined and the
 * location is simply omitted rather than sent and rejected with a 400.
 *   "Phnom Penh, Cambodia"        -> { city, country }
 *   "San Francisco, CA, USA"      -> { city, state, country }
 */
export function parseLocationInput(text: string): LocationDto | undefined {
  const parts = text.split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length < 2) return undefined;
  if (parts.length === 2) return { city: parts[0], country: parts[1] };
  return { city: parts[0], state: parts.slice(1, -1).join(", "), country: parts[parts.length - 1] };
}

/** ISO -> the `yyyy-MM-dd` that <input type="date"> requires. */
export function toDateInputValue(iso: string | undefined | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
}

/** `yyyy-MM-dd` -> ISO for the backend's @IsDate DTOs. */
export function fromDateInputValue(value: string): string | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

/** "Mar 2022 — Present" */
export function formatDateRange(startDate: string, endDate?: string, isCurrent?: boolean): string {
  const fmt = (iso: string) => {
    const date = new Date(iso);
    return Number.isNaN(date.getTime())
      ? ""
      : date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  };
  const start = fmt(startDate);
  const end = isCurrent || !endDate ? "Present" : fmt(endDate);
  return start ? `${start} — ${end}` : end;
}

export function formatSalaryRange(range: ProfileDto["salaryRange"]): string {
  if (!range) return "";
  const fmt = (n: number) => `${Math.round(n / 1000)}K`;
  return `${range.currency} ${fmt(range.min)} – ${fmt(range.max)}`;
}

// ---- View models ----

export interface ProfileView {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  headline: string;
  bio: string;
  phone: string;
  photoUrl: string;
  locationLabel: string;
  location: LocationDto | null;
  desiredJobLevels: JobLevel[];
  desiredRemoteTypes: RemoteType[];
  desiredEmploymentTypes: EmploymentType[];
  desiredIndustries: string[];
  salaryRange: ProfileDto["salaryRange"];
  salaryLabel: string;
  linkedinUrl: string;
  githubUrl: string;
  portfolioUrl: string;
}

export function toProfileView(dto: ProfileDto): ProfileView {
  return {
    id: dto.id,
    userId: dto.userId,
    firstName: dto.firstName,
    lastName: dto.lastName,
    fullName: [dto.firstName, dto.lastName].filter(Boolean).join(" "),
    headline: dto.headline ?? "",
    bio: dto.bio ?? "",
    phone: dto.phone ?? "",
    photoUrl: dto.photoUrl ?? "",
    locationLabel: formatLocation(dto.location),
    location: dto.location,
    desiredJobLevels: dto.desiredJobLevels ?? [],
    desiredRemoteTypes: dto.desiredRemoteTypes ?? [],
    desiredEmploymentTypes: dto.desiredEmploymentTypes ?? [],
    desiredIndustries: dto.desiredIndustries ?? [],
    salaryRange: dto.salaryRange,
    salaryLabel: formatSalaryRange(dto.salaryRange),
    linkedinUrl: dto.linkedinUrl ?? "",
    githubUrl: dto.githubUrl ?? "",
    portfolioUrl: dto.portfolioUrl ?? "",
  };
}

export interface ExperienceView extends ExperienceDto {
  dateRangeLabel: string;
  jobLevelLabel: string;
  employmentTypeLabel: string;
}

export function toExperienceView(dto: ExperienceDto): ExperienceView {
  return {
    ...dto,
    dateRangeLabel: formatDateRange(dto.startDate, dto.endDate, dto.isCurrentJob),
    jobLevelLabel: JOB_LEVEL_LABELS[dto.jobLevel] ?? dto.jobLevel,
    employmentTypeLabel: EMPLOYMENT_TYPE_LABELS[dto.employmentType] ?? dto.employmentType,
  };
}

export interface EducationView extends EducationDto {
  dateRangeLabel: string;
  degreeLevelLabel: string;
}

export function toEducationView(dto: EducationDto): EducationView {
  return {
    ...dto,
    dateRangeLabel: formatDateRange(dto.startDate, dto.endDate),
    degreeLevelLabel: DEGREE_LEVEL_LABELS[dto.degreeLevel] ?? dto.degreeLevel,
  };
}

/**
 * Rough completeness score for the profile page's progress meter.
 * Deliberately frontend-only: the backend exposes no completeness field.
 */
export function profileCompleteness(profile: ProfileView | null): number {
  if (!profile) return 0;
  const checks = [
    Boolean(profile.firstName && profile.lastName),
    Boolean(profile.headline),
    Boolean(profile.bio),
    Boolean(profile.locationLabel),
    Boolean(profile.phone),
    profile.desiredJobLevels.length > 0,
    profile.desiredRemoteTypes.length > 0,
    Boolean(profile.salaryRange),
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}
