/**
 * Resume Builder endpoints (backend module: `resume-builder`).
 *
 * Shapes below are read off the backend DTOs, not the prose docs, because the two
 * disagree in one place that would silently break the editor:
 *
 *   READ  `GET /documents/:id` returns `experiences` / `educations` (PLURAL)
 *   WRITE `PUT /documents/:id/experience` and `/education` (SINGULAR)
 *
 * `SECTION_PATH` below is the single place that mapping lives.
 *
 * Other things that bite:
 *   - Every array section is REPLACE, not merge. A shorter array deletes rows;
 *     `{ items: [] }` clears the section.
 *   - `startDate` (experience, education) and `issueDate` (certifications) are
 *     REQUIRED, so a blank new row cannot be saved — the editors seed today.
 *   - `POST .../export` returns a SIGNED, time-limited `downloadUrl`. The
 *     `Resume.fileUrl` you see elsewhere is a storage pointer and is not fetchable.
 *   - Every id-scoped route 404s for a document you don't own — never 403.
 */

import { apiClient } from "@/lib/api/client";
import type { DegreeLevel, ProficiencyLevel } from "@/features/user-profile/api/profile.api";

export type ResumeLineSpacing = "SINGLE" | "DEFAULT" | "WIDE";
export type ResumeMargin = "NARROW" | "NORMAL" | "WIDE";
export type ResumeDocumentStatus = "DRAFT" | "FINALIZED";

/**
 * Preset KEYS, not hex. The DTO validates against exactly this list and 400s on
 * anything else — including a raw hex value. The colour behind each key lives in
 * the backend renderer.
 */
export const COLOR_SCHEMES = ["default", "navy", "forest", "burgundy", "slate"] as const;
export type ColorScheme = (typeof COLOR_SCHEMES)[number];

/**
 * Swatch colours for the picker only. These approximate the renderer's palette so
 * the circles are distinguishable; the backend owns the real values and never
 * accepts one from us. Sourced from our own tokens where a sensible match exists.
 */
export const COLOR_SCHEME_SWATCH: Record<ColorScheme, string> = {
  default: "var(--color-primary-700)",
  navy: "#1B3A6B",
  forest: "#1F5132",
  burgundy: "#6B1F32",
  slate: "#3E4A59",
};

export const COLOR_SCHEME_LABEL: Record<ColorScheme, string> = {
  default: "Default",
  navy: "Navy",
  forest: "Forest",
  burgundy: "Burgundy",
  slate: "Slate",
};

export const LINE_SPACING_LABEL: Record<ResumeLineSpacing, string> = {
  SINGLE: "Single",
  DEFAULT: "Default",
  WIDE: "Wide",
};

export const MARGIN_LABEL: Record<ResumeMargin, string> = {
  NARROW: "Narrow",
  NORMAL: "Normal",
  WIDE: "Wide",
};

// ── Templates ────────────────────────────────────────────────────────────────

export interface ResumeTemplateLayoutConfig {
  sections?: string[];
  rules?: {
    columns?: number;
    headingStyle?: string;
    bullet?: string;
    accent?: string;
  };
}

export interface ResumeTemplateDto {
  id: string;
  name: string;
  category: string;
  /**
   * Root-relative and resolved against the FRONTEND origin — this API serves no
   * static assets. The files live in `jobfit-frontend/public/templates/`.
   */
  thumbnailUrl: string;
  isAtsFriendly: boolean;
  layoutConfig?: ResumeTemplateLayoutConfig;
}

// ── Documents ────────────────────────────────────────────────────────────────

export interface ResumeDocumentListItemDto {
  id: string;
  userId: string;
  title: string;
  templateId: string;
  colorScheme: string;
  lineSpacing: ResumeLineSpacing;
  margin: ResumeMargin;
  fontFamily?: string;
  status: ResumeDocumentStatus;
  /** The Resume row produced by the most recent export, if any. */
  exportedResumeId?: string;
  // Header — snapshotted at creation, then owned by the document.
  fullName?: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BuilderExperienceDto {
  id: string;
  order: number;
  company: string;
  title: string;
  location?: string;
  startDate: string;
  endDate?: string;
  isCurrentJob: boolean;
  description?: string;
  technologies: string[];
}

export interface BuilderEducationDto {
  id: string;
  order: number;
  institution: string;
  degreeLevel: DegreeLevel;
  fieldOfStudy: string;
  startDate: string;
  endDate?: string;
  gpa?: number;
  description?: string;
}

export interface BuilderSkillDto {
  id: string;
  order: number;
  name: string;
  proficiencyLevel?: ProficiencyLevel;
}

export interface BuilderCertificationDto {
  id: string;
  order: number;
  name: string;
  issuer: string;
  issueDate: string;
  expirationDate?: string;
  credentialId?: string;
  credentialUrl?: string;
}

export interface BuilderProjectDto {
  id: string;
  order: number;
  name: string;
  description?: string;
  technologies: string[];
  url?: string;
}

/** Note the plurals — see the file header. */
export interface ResumeDocumentDetailDto extends ResumeDocumentListItemDto {
  summary: string;
  experiences: BuilderExperienceDto[];
  educations: BuilderEducationDto[];
  skills: BuilderSkillDto[];
  certifications: BuilderCertificationDto[];
  projects: BuilderProjectDto[];
}

export interface CreateResumeDocumentInput {
  title: string;
  templateId: string;
  colorScheme?: ColorScheme;
  lineSpacing?: ResumeLineSpacing;
  margin?: ResumeMargin;
  fontFamily?: string | null;
}

/** Everything PATCH accepts. Omitted fields are untouched. */
export interface UpdateResumeDocumentInput {
  title?: string;
  templateId?: string;
  colorScheme?: ColorScheme;
  lineSpacing?: ResumeLineSpacing;
  margin?: ResumeMargin;
  fontFamily?: string | null;
  status?: ResumeDocumentStatus;
  fullName?: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
}

// ── Section write payloads ───────────────────────────────────────────────────

export interface ExperienceItemInput {
  company: string;
  title: string;
  location?: string;
  startDate: string;
  endDate?: string;
  isCurrentJob?: boolean;
  description?: string;
  technologies?: string[];
}

export interface EducationItemInput {
  institution: string;
  degreeLevel: DegreeLevel;
  fieldOfStudy: string;
  startDate: string;
  endDate?: string;
  gpa?: number;
  description?: string;
}

export interface SkillItemInput {
  name: string;
  proficiencyLevel?: ProficiencyLevel;
}

export interface CertificationItemInput {
  name: string;
  issuer: string;
  issueDate: string;
  expirationDate?: string;
  credentialId?: string;
  credentialUrl?: string;
}

export interface ProjectItemInput {
  name: string;
  description?: string;
  technologies?: string[];
  url?: string;
}

/**
 * The five sections `import-from-profile` accepts. "projects" is deliberately
 * absent: there is no Project model to import from, and naming it is a 400
 * rather than a silent no-op.
 */
export const IMPORTABLE_SECTIONS = [
  "summary",
  "experience",
  "education",
  "skills",
  "certifications",
] as const;
export type ImportableSection = (typeof IMPORTABLE_SECTIONS)[number];

export interface ExportResumeDocumentResult {
  resumeId: string;
  /** Signed and time-limited — open it promptly, don't persist it. */
  downloadUrl: string;
  fileName: string;
  fileSize: number;
}

/**
 * Read key (on the detail DTO) → write path segment. The singular/plural split is
 * a real backend inconsistency, not a typo; keeping it in one map means no call
 * site has to remember it.
 */
export const SECTION_PATH = {
  summary: "summary",
  experiences: "experience",
  educations: "education",
  skills: "skills",
  certifications: "certifications",
  projects: "projects",
} as const;

const DOCS = "/resume-builder/documents";

export const resumeBuilderApi = {
  /** GET /resume-builder/templates — PUBLIC, no auth header needed. */
  templates: (params?: { atsOnly?: boolean; category?: string }) =>
    apiClient.get<ResumeTemplateDto[]>("/resume-builder/templates", {
      skipAuth: true,
      // `atsOnly=false` means "do not filter", so only send it when narrowing.
      query: {
        ...(params?.atsOnly ? { atsOnly: true } : {}),
        ...(params?.category ? { category: params.category } : {}),
      },
    }),

  /** GET /resume-builder/documents — settings only, most recently updated first. */
  list: () => apiClient.get<ResumeDocumentListItemDto[]>(DOCS),

  /** GET /resume-builder/documents/:id — settings, header and all six sections. */
  get: (id: string) => apiClient.get<ResumeDocumentDetailDto>(`${DOCS}/${id}`),

  /** POST /resume-builder/documents — the contact header is snapshotted server-side. */
  create: (input: CreateResumeDocumentInput) =>
    apiClient.post<ResumeDocumentListItemDto>(DOCS, input),

  /** PATCH /resume-builder/documents/:id */
  update: (id: string, input: UpdateResumeDocumentInput) =>
    apiClient.patch<ResumeDocumentListItemDto>(`${DOCS}/${id}`, input),

  /** DELETE /resume-builder/documents/:id — soft; an exported Resume survives. */
  remove: (id: string) => apiClient.delete<void>(`${DOCS}/${id}`),

  /** POST /resume-builder/documents/:id/duplicate — copy is DRAFT with no export link. */
  duplicate: (id: string) =>
    apiClient.post<ResumeDocumentListItemDto>(`${DOCS}/${id}/duplicate`),

  // ── Sections (all bulk-replace, all 204) ───────────────────────────────────

  putSummary: (id: string, content: string) =>
    apiClient.put<void>(`${DOCS}/${id}/summary`, { content }),

  putExperience: (id: string, items: ExperienceItemInput[]) =>
    apiClient.put<void>(`${DOCS}/${id}/experience`, { items }),

  putEducation: (id: string, items: EducationItemInput[]) =>
    apiClient.put<void>(`${DOCS}/${id}/education`, { items }),

  putSkills: (id: string, items: SkillItemInput[]) =>
    apiClient.put<void>(`${DOCS}/${id}/skills`, { items }),

  putCertifications: (id: string, items: CertificationItemInput[]) =>
    apiClient.put<void>(`${DOCS}/${id}/certifications`, { items }),

  putProjects: (id: string, items: ProjectItemInput[]) =>
    apiClient.put<void>(`${DOCS}/${id}/projects`, { items }),

  /** POST .../import-from-profile — returns the full document, already re-read. */
  importFromProfile: (id: string, sections: ImportableSection[]) =>
    apiClient.post<ResumeDocumentDetailDto>(`${DOCS}/${id}/import-from-profile`, {
      sections,
    }),

  /**
   * POST .../export — PDF only.
   *
   * `format` is sent explicitly rather than relying on the server default so the
   * request is self-describing. DOCX would slot in here as a second accepted
   * value once a second renderer exists; today it is a 400 at validation.
   */
  export: (id: string) =>
    apiClient.post<ExportResumeDocumentResult>(`${DOCS}/${id}/export`, { format: "pdf" }),
};
