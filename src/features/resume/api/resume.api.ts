/**
 * Resume endpoints (backend module: `resume`).
 *
 * Shapes below were read off the running backend, not guessed — the ones that
 * bite:
 *   - `GET /{id}/parsing-status` returns `{ status, error }`, NOT a bare string.
 *   - The score endpoints 400 with "Resume has not been parsed yet" until
 *     parsing reaches SUCCESS, so never fetch them before then.
 *
 * TODO(backend): PARSED DATA IS MOCKED. `ParsedResumeData` (fullName, email,
 * skills, experiences, …) exists in the database but no endpoint returns it:
 * ResumeResponseDto has no `parsedData` field and none of the 10 resume routes
 * expose it. Per INTEGRATION_PLAN.md locked decision #3, `getParsedData` below
 * serves mock data behind this interface — swap it when the backend exposes it.
 */

import { apiClient, uploadWithProgress, type UploadProgress } from "@/lib/api/client";

export type ResumeFileType = "PDF" | "DOCX";
export type ResumeParsingStatus = "PENDING" | "PROCESSING" | "SUCCESS" | "FAILED";

/** Mirrors MAX_FILE_SIZE in the backend's resume.service.ts. */
export const MAX_RESUME_BYTES = 5 * 1024 * 1024;

/** The only two mime types MIME_TO_TYPE accepts. */
export const ACCEPTED_RESUME_MIME: Record<string, ResumeFileType> = {
  "application/pdf": "PDF",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "DOCX",
};

export const RESUME_ACCEPT_ATTR = ".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export interface ResumeDto {
  id: string;
  userId: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  fileType: ResumeFileType;
  title?: string;
  isDefault: boolean;
  parsingStatus: ResumeParsingStatus;
  parsingError?: string;
  atsScore?: number;
  qualityScore?: number;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface ParsingStatusDto {
  status: ResumeParsingStatus;
  error?: string;
}

export interface ScoresDto {
  atsScore: number;
  qualityScore: number;
  /** Average of the two, rounded. */
  total: number;
}

/** Shape of ParsedResumeData — mock-only until an endpoint exposes it. */
export interface ParsedResumeDataDto {
  fullName?: string;
  email?: string;
  phone?: string;
  location?: string;
  summary?: string;
  skills: string[];
  experiences: { company: string; title: string; dates?: string }[];
  educations: { institution: string; degree: string; dates?: string }[];
  certifications: string[];
}

/** Client-side guard so an oversized/wrong file never costs an upload round-trip. */
export function validateResumeFile(file: File): string | null {
  const byMime = ACCEPTED_RESUME_MIME[file.type];
  // Some browsers report an empty type for .docx; fall back to the extension.
  const byExtension = /\.(pdf|docx)$/i.test(file.name);
  if (!byMime && !byExtension) return "Only PDF and DOCX resumes are supported.";
  if (file.size <= 0) return "That file looks empty.";
  if (file.size > MAX_RESUME_BYTES) return "Resumes must be 5 MB or smaller.";
  return null;
}

export const resumeApi = {
  /** GET /resumes — the current user's resumes, newest first. */
  list: () => apiClient.get<ResumeDto[]>("/resumes"),

  /** GET /resumes/{id} */
  get: (resumeId: string) => apiClient.get<ResumeDto>(`/resumes/${resumeId}`),

  /**
   * POST /resumes — multipart, PDF/DOCX, max 5 MB.
   *
   * NOTE: the backend awaits a BullMQ enqueue after storing the file, so with
   * Redis down this request never returns even though the resume IS created.
   */
  upload: (
    file: File,
    title: string | undefined,
    onProgress?: (progress: UploadProgress) => void,
    signal?: AbortSignal,
  ) => {
    const form = new FormData();
    form.append("file", file);
    // UploadResumeDto: optional, @MinLength(2) — omit rather than send "".
    if (title && title.trim().length >= 2) form.append("title", title.trim());
    return uploadWithProgress<ResumeDto>("/resumes", form, { onProgress, signal });
  },

  /** DELETE /resumes/{id} */
  remove: (resumeId: string) => apiClient.delete<void>(`/resumes/${resumeId}`),

  /** PATCH /resumes/{id}/set-default */
  setDefault: (resumeId: string) => apiClient.patch<ResumeDto>(`/resumes/${resumeId}/set-default`),

  /** GET /resumes/{id}/parsing-status */
  parsingStatus: (resumeId: string) =>
    apiClient.get<ParsingStatusDto>(`/resumes/${resumeId}/parsing-status`),

  /** GET /resumes/{id}/scores — 400s unless parsingStatus is SUCCESS. */
  scores: (resumeId: string) => apiClient.get<ScoresDto>(`/resumes/${resumeId}/scores`),

  /** GET /resumes/{id}/ats-score — 400s unless parsingStatus is SUCCESS. */
  atsScore: (resumeId: string) =>
    apiClient.get<{ resumeId: string; atsScore: number }>(`/resumes/${resumeId}/ats-score`),

  /** GET /resumes/{id}/quality-score — 400s unless parsingStatus is SUCCESS. */
  qualityScore: (resumeId: string) =>
    apiClient.get<{ resumeId: string; qualityScore: number }>(`/resumes/${resumeId}/quality-score`),

  /** POST /resumes/{id}/score — recalculates and persists onto the resume. */
  calculateScore: (resumeId: string) =>
    apiClient.post<{ atsScore: number; qualityScore: number }>(`/resumes/${resumeId}/score`),

  /**
   * TODO(backend): no endpoint returns ParsedResumeData. Mock until one exists;
   * the return shape already matches the DB model so the swap is one function.
   */
  getParsedData: (_resumeId: string): Promise<ParsedResumeDataDto> =>
    new Promise((resolve) =>
      setTimeout(
        () =>
          resolve({
            fullName: "Jane Doe",
            email: "jane.doe@example.com",
            phone: "+855 12 345 678",
            location: "Phnom Penh, Cambodia",
            summary:
              "Frontend engineer with 6 years building accessible, performant web applications.",
            skills: ["React", "TypeScript", "Node.js", "GraphQL", "Testing Library"],
            experiences: [
              { company: "Acme Inc", title: "Senior Frontend Engineer", dates: "2022 — Present" },
              { company: "Globex", title: "Frontend Engineer", dates: "2019 — 2022" },
            ],
            educations: [
              {
                institution: "Royal University of Phnom Penh",
                degree: "BSc Computer Science",
                dates: "2015 — 2019",
              },
            ],
            certifications: ["AWS Certified Developer"],
          }),
        200,
      ),
    ),
};
