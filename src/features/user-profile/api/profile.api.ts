/**
 * Profile endpoints (backend module: `user`).
 *
 * Live: profile CRUD, preferences, salary, experience, education.
 *
 * TODO(backend): SKILLS ARE MOCKED. Two gaps make them unwireable today:
 *   1. There is no skill catalogue endpoint (no `GET /skills`), so the UI cannot
 *      discover a `skillId` — and `POST /profiles/{userId}/skills` requires one
 *      as an FK.
 *   2. `SkillResponseDto` returns `skillId` (a uuid) with no skill `name`, so a
 *      live list could only render uuids.
 * Per INTEGRATION_PLAN.md locked decision #3 the whole skills sub-feature runs on
 * mock data behind this interface. When the backend adds a catalogue + name, only
 * the `*Skill*` functions below change.
 */

import { apiClient } from "@/lib/api/client";

// ---- Backend enums (verified against src/shared/kernel/enums) ----

export type JobLevel =
  | "INTERN" | "ENTRY" | "MID" | "SENIOR" | "LEAD" | "MANAGER" | "DIRECTOR" | "C_LEVEL";
export type RemoteType = "ON_SITE" | "HYBRID" | "REMOTE";
export type EmploymentType = "FULL_TIME" | "PART_TIME" | "CONTRACT" | "TEMPORARY" | "FREELANCE";
export type DegreeLevel =
  | "HIGH_SCHOOL" | "ASSOCIATE" | "BACHELOR" | "MASTER" | "DOCTORATE" | "CERTIFICATION";
export type ProficiencyLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";

// ---- Backend DTOs ----

export interface LocationDto {
  city: string;
  state?: string;
  country: string;
  latitude?: number;
  longitude?: number;
}

export interface ProfileDto {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  phone?: string;
  photoUrl?: string;
  bio?: string;
  headline?: string;
  location: LocationDto | null;
  desiredJobLevels: JobLevel[];
  desiredRemoteTypes: RemoteType[];
  desiredEmploymentTypes: EmploymentType[];
  desiredIndustries: string[];
  salaryRange: { min: number; max: number; currency: string } | null;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  createdAt: string;
  updatedAt: string;
}

/** CreateProfileDto — firstName/lastName are the only required fields. */
export interface CreateProfileInput {
  firstName: string;
  lastName: string;
  phone?: string;
  photoUrl?: string;
  bio?: string;
  headline?: string;
  location?: LocationDto;
  minSalary?: number;
  maxSalary?: number;
  salaryCurrency?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
}

/** UpdateProfileDto — preferences and salary are NOT updatable here. */
export type UpdateProfileInput = Partial<
  Pick<
    CreateProfileInput,
    | "firstName" | "lastName" | "phone" | "bio" | "headline"
    | "location" | "linkedinUrl" | "githubUrl" | "portfolioUrl"
  >
>;

/** Body of PATCH /profiles/{userId}/preferences (WorkPreferences). */
export interface WorkPreferencesInput {
  jobLevels?: JobLevel[];
  remoteTypes?: RemoteType[];
  employmentTypes?: EmploymentType[];
  industries?: string[];
}

export interface ExperienceDto {
  id: string;
  userId: string;
  company: string;
  title: string;
  jobLevel: JobLevel;
  employmentType: EmploymentType;
  industry: string;
  description?: string;
  isCurrentJob: boolean;
  startDate: string;
  endDate?: string;
  technologies?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AddExperienceInput {
  company: string;
  title: string;
  jobLevel: JobLevel;
  employmentType: EmploymentType;
  industry: string;
  description?: string;
  isCurrentJob?: boolean;
  /** ISO string; the backend's @Type(() => Date) parses it. */
  startDate: string;
  endDate?: string;
  technologies?: string[];
}

export interface EducationDto {
  id: string;
  userId: string;
  institution: string;
  degreeLevel: DegreeLevel;
  fieldOfStudy: string;
  description?: string;
  startDate: string;
  endDate?: string;
  gpa?: number;
  createdAt: string;
  updatedAt: string;
}

export interface AddEducationInput {
  institution: string;
  degreeLevel: DegreeLevel;
  fieldOfStudy: string;
  description?: string;
  startDate: string;
  endDate?: string;
  /** 0–4 per the DTO. */
  gpa?: number;
}

export interface UserSkillDto {
  id: string;
  userId: string;
  skillId: string;
  /** TODO(backend): not returned by SkillResponseDto; mock-only for now. */
  name: string;
  endorsementCount: number;
  proficiencyLevel: ProficiencyLevel;
  yearsOfExperience?: number;
}

export interface CatalogueSkill {
  id: string;
  name: string;
}

export interface AddSkillInput {
  skillId: string;
  proficiencyLevel?: ProficiencyLevel;
  yearsOfExperience?: number;
}

// ---- Mock skills (TODO(backend) — see the file header) ----

/** Mirrors the names seeded in jobfit-backend/prisma/seed.ts. */
const MOCK_CATALOGUE: CatalogueSkill[] = [
  { id: "mock-typescript", name: "TypeScript" },
  { id: "mock-react", name: "React" },
  { id: "mock-nodejs", name: "Node.js" },
  { id: "mock-postgresql", name: "PostgreSQL" },
  { id: "mock-python", name: "Python" },
  { id: "mock-docker", name: "Docker" },
  { id: "mock-aws", name: "AWS" },
  { id: "mock-graphql", name: "GraphQL" },
];

/** Module-level so add/remove survive re-renders within a session. */
let mockUserSkills: UserSkillDto[] = [];

const delay = <T>(value: T): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), 150));

export const profileApi = {
  // ---- Profile ----

  /** POST /profiles — creates the current user's profile. */
  create: (input: CreateProfileInput) => apiClient.post<ProfileDto>("/profiles", input),

  /** GET /profiles/{userId} — 404 when the user has no profile yet. */
  get: (userId: string) => apiClient.get<ProfileDto>(`/profiles/${userId}`),

  /** PATCH /profiles/{userId} — identity/location/social only. */
  update: (userId: string, input: UpdateProfileInput) =>
    apiClient.patch<ProfileDto>(`/profiles/${userId}`, input),

  /** PATCH /profiles/{userId}/preferences */
  updatePreferences: (userId: string, prefs: WorkPreferencesInput) =>
    apiClient.patch<ProfileDto>(`/profiles/${userId}/preferences`, prefs),

  /** PATCH /profiles/{userId}/salary */
  updateSalary: (userId: string, minSalary: number, maxSalary: number) =>
    apiClient.patch<ProfileDto>(`/profiles/${userId}/salary`, { minSalary, maxSalary }),

  // ---- Experience ----

  listExperience: (userId: string) =>
    apiClient.get<ExperienceDto[]>(`/profiles/${userId}/experience`),
  addExperience: (userId: string, input: AddExperienceInput) =>
    apiClient.post<ExperienceDto>(`/profiles/${userId}/experience`, input),
  updateExperience: (userId: string, expId: string, input: Partial<AddExperienceInput>) =>
    apiClient.patch<ExperienceDto>(`/profiles/${userId}/experience/${expId}`, input),
  deleteExperience: (userId: string, expId: string) =>
    apiClient.delete<void>(`/profiles/${userId}/experience/${expId}`),

  // ---- Education ----

  listEducation: (userId: string) =>
    apiClient.get<EducationDto[]>(`/profiles/${userId}/education`),
  addEducation: (userId: string, input: AddEducationInput) =>
    apiClient.post<EducationDto>(`/profiles/${userId}/education`, input),
  updateEducation: (userId: string, eduId: string, input: Partial<AddEducationInput>) =>
    apiClient.patch<EducationDto>(`/profiles/${userId}/education/${eduId}`, input),
  deleteEducation: (userId: string, eduId: string) =>
    apiClient.delete<void>(`/profiles/${userId}/education/${eduId}`),

  // ---- Skills — MOCK. See the TODO(backend) note in the file header. ----

  /** TODO(backend): replace with GET /skills once a catalogue endpoint exists. */
  listSkillCatalogue: (): Promise<CatalogueSkill[]> => delay(MOCK_CATALOGUE),

  /** TODO(backend): live call would be GET /profiles/{userId}/skills (lacks `name`). */
  listSkills: (_userId: string): Promise<UserSkillDto[]> => delay([...mockUserSkills]),

  /** TODO(backend): live call would be POST /profiles/{userId}/skills. */
  addSkill: (userId: string, input: AddSkillInput): Promise<UserSkillDto> => {
    const catalogue = MOCK_CATALOGUE.find((s) => s.id === input.skillId);
    const created: UserSkillDto = {
      id: `mock-user-skill-${Date.now()}`,
      userId,
      skillId: input.skillId,
      name: catalogue?.name ?? "Unknown skill",
      endorsementCount: 0,
      proficiencyLevel: input.proficiencyLevel ?? "INTERMEDIATE",
      yearsOfExperience: input.yearsOfExperience,
    };
    mockUserSkills = [...mockUserSkills, created];
    return delay(created);
  },

  /** TODO(backend): live call would be DELETE /profiles/{userId}/skills/{skillId}. */
  removeSkill: (_userId: string, skillId: string): Promise<void> => {
    mockUserSkills = mockUserSkills.filter((s) => s.skillId !== skillId);
    return delay(undefined);
  },

  /** TODO(backend): live call would be PATCH /profiles/{userId}/skills/{skillId}/endorse. */
  endorseSkill: (_userId: string, skillId: string): Promise<UserSkillDto | undefined> => {
    mockUserSkills = mockUserSkills.map((s) =>
      s.skillId === skillId ? { ...s, endorsementCount: s.endorsementCount + 1 } : s,
    );
    return delay(mockUserSkills.find((s) => s.skillId === skillId));
  },
};
