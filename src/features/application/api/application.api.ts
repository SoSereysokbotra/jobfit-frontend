/**
 * Application endpoints (backend module: `application`). All require auth; every
 * id-scoped route enforces ownership server-side (403 if you don't own it).
 *
 * Contract read off the backend, not guessed:
 *   - ApplicationResponseDto carries only `jobId` — NOT the job title/company. The
 *     UI joins the public job (GET /jobs/{id}) client-side; see application.mappers.
 *   - `POST /applications` returns 201 with the created ApplicationResponseDto.
 *   - `PATCH /applications/{id}/status` takes `{ newStatus }` (not `{ status }`).
 *   - `GET /applications/{id}/timeline` returns raw entries (no envelope fields),
 *     each `{ id, status, eventType, description?, eventDate }`.
 *
 * TODO(backend): there is no interview-scheduling endpoint. InterviewScheduler is
 * presentational only (INTEGRATION_PLAN.md Phase 10).
 */

import { apiClient } from "@/lib/api/client";

/** Mirrors the backend ApplicationStatus enum (10 states). */
export type ApplicationStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "SCREENING"
  | "INTERVIEW"
  | "OFFER"
  | "ACCEPTED"
  | "NEGOTIATING"
  | "REJECTED"
  | "WITHDRAWN"
  | "ARCHIVED";

/** Mirrors ApplicationResponseDto (dates arrive as ISO strings over JSON). */
export interface ApplicationDto {
  id: string;
  userId: string;
  jobId: string;
  resumeId?: string;
  status: ApplicationStatus;
  appliedAt: string;
  notes?: string;
  coverLetter?: string;
  createdAt: string;
  updatedAt: string;
}

/** One row from GET /applications/{id}/timeline. */
export interface TimelineEntryDto {
  id: string;
  status: ApplicationStatus;
  eventType: string;
  description?: string;
  eventDate: string;
}

/** Body for POST /applications (SubmitApplicationDto). */
export interface SubmitApplicationInput {
  jobId: string;
  resumeId?: string;
  coverLetter?: string;
  notes?: string;
}

/** Body for POST /applications/{id}/contact-person (AddContactPersonDto). */
export interface ContactPersonInput {
  name: string;
  email?: string;
  phone?: string;
  title?: string;
  linkedinUrl?: string;
}

export const applicationApi = {
  /** POST /applications — submit an application to a job. */
  submit: (input: SubmitApplicationInput) =>
    apiClient.post<ApplicationDto>("/applications", input),

  /** GET /applications — the current user's applications (optionally by status). */
  list: (status?: ApplicationStatus) =>
    apiClient.get<ApplicationDto[]>("/applications", {
      query: status ? { status } : undefined,
    }),

  /** GET /applications/{id} */
  get: (id: string) => apiClient.get<ApplicationDto>(`/applications/${id}`),

  /** PATCH /applications/{id}/status */
  updateStatus: (id: string, newStatus: ApplicationStatus) =>
    apiClient.patch<ApplicationDto>(`/applications/${id}/status`, { newStatus }),

  /** GET /applications/{id}/timeline — newest-or-oldest order per backend. */
  timeline: (id: string) =>
    apiClient.get<TimelineEntryDto[]>(`/applications/${id}/timeline`),

  /** POST /applications/{id}/contact-person — returns { id }. */
  addContactPerson: (id: string, input: ContactPersonInput) =>
    apiClient.post<{ id: string }>(`/applications/${id}/contact-person`, input),

  /**
   * POST /applications/{id}/cover-letter — generate + persist an AI cover letter
   * (heuristic template fallback if the AI service is down). Premium-only (403 for FREE).
   */
  generateCoverLetter: (id: string, tone?: string) =>
    apiClient.post<{ coverLetter: string; generatedBy: "ai" | "template" }>(
      `/applications/${id}/cover-letter`,
      tone ? { tone } : {},
    ),
};
