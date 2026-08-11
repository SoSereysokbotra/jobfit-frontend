/**
 * Local mirror of the server state the PWA needs offline.
 *
 * Row shapes are the backend's verbatim — the DTO types are imported from the
 * feature API modules rather than restated, so a backend field rename surfaces
 * as a type error here instead of as silently-missing data. Nothing is renamed
 * or reshaped on the way in; mapping to view models stays where it already is
 * (`features/<f>/api/<f>.mappers.ts`).
 *
 * Resource set is exactly what `GET /sync/bootstrap` returns (PWA_SYNC_API.md §2).
 * `Job` is deliberately absent — the backend does not delta-sync it; job detail
 * is cached over HTTP by ETag instead (§5).
 */
import Dexie, { type Table } from "dexie";

import type { ApplicationDto } from "@/features/application/api/application.api";
import type { RecommendedJobDto } from "@/features/matching/api/matching.api";
import type {
  EducationDto,
  ExperienceDto,
  ProfileDto,
  UserSkillDto,
} from "@/features/user-profile/api/profile.api";

/**
 * `GET /sync/certifications`. No frontend feature owns certifications yet, and
 * the backend DTO lives in its sync module pending a real certification module,
 * so the type is declared here to match `CertificationResponseDto`.
 */
export interface CertificationDto {
  id: string;
  userId: string;
  name: string;
  issuer: string;
  credentialId?: string;
  credentialUrl?: string;
  issueDate: string;
  expirationDate?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * `GET /sync/saved-jobs`. Keyed by `jobId`, not `id` — the backend is explicit
 * that jobId is the identity (unique per user, and what `GET /saved-jobs`
 * returns). `id`/`createdAt` are DB-generated and optional in its DTO.
 */
export interface SavedJobDto {
  id?: string;
  jobId: string;
  createdAt?: string;
}

/** Resources with an independent sync watermark. */
export type SyncResource =
  | "applications"
  | "profile"
  | "experiences"
  | "education"
  | "certifications"
  | "skills"
  | "savedJobs"
  | "recommendations";

/**
 * One watermark per resource.
 *
 * `serverTime` is the server's clock, never ours — PWA_SYNC_API.md §2 rule 1. A
 * client clock running fast would skip rows permanently, and the bug would look
 * like "some records just never arrive".
 */
export interface SyncMeta {
  resource: SyncResource;
  /** ISO instant to send as the next `since`. Absent until a sync completes. */
  serverTime?: string;
  /** When this client last completed a drain, for diagnostics/UI. */
  lastSyncedAt?: string;
}

/** Mirrors `BatchActionType`. */
export type PendingActionType =
  | "SAVE_JOB"
  | "UNSAVE_JOB"
  | "DISMISS_RECOMMENDATION"
  | "SUBMIT_APPLICATION"
  | "UPDATE_PROFILE"
  | "UPDATE_EXPERIENCE"
  | "UPDATE_EDUCATION";

/** Mirrors `BatchActionPayloadDto`. */
export interface PendingActionPayload {
  jobId?: string;
  id?: string;
  expectedUpdatedAt?: string;
  changes?: Record<string, unknown>;
  resumeId?: string;
  coverLetter?: string;
  notes?: string;
}

/**
 * A queued mutation awaiting flush.
 *
 * `seq` is the primary key and the execution order — the batch endpoint applies
 * actions in array order, and "save X then unsave X" is only correct in that
 * order. Ordering by `clientTimestamp` instead would reorder two actions taken
 * inside the same millisecond.
 */
export interface PendingAction {
  seq?: number;
  /** Generated once, at queue time, and reused on every retry. */
  idempotencyKey: string;
  type: PendingActionType;
  payload: PendingActionPayload;
  clientTimestamp: string;
  /**
   * `pending` — awaiting flush. `conflict` — the server refused it because the
   * record moved on; it stays queued and visible until the user resolves it.
   */
  status: "pending" | "conflict";
  /** Set with `status: "conflict"`, straight from the batch result. */
  serverVersion?: unknown;
  clientAttempted?: unknown;
  conflictMessage?: string;
}

export class JobFitsOfflineDb extends Dexie {
  applications!: Table<ApplicationDto, string>;
  profile!: Table<ProfileDto, string>;
  experiences!: Table<ExperienceDto, string>;
  education!: Table<EducationDto, string>;
  certifications!: Table<CertificationDto, string>;
  skills!: Table<UserSkillDto, string>;
  savedJobs!: Table<SavedJobDto, string>;
  recommendations!: Table<RecommendedJobDto, string>;
  syncMeta!: Table<SyncMeta, SyncResource>;
  pendingActions!: Table<PendingAction, number>;

  constructor(name = "jobfits-offline") {
    super(name);
    // Only indexed fields are listed; Dexie stores the whole record regardless.
    this.version(1).stores({
      applications: "id, jobId, status, updatedAt",
      profile: "id, userId, updatedAt",
      experiences: "id, userId, updatedAt",
      education: "id, userId, updatedAt",
      certifications: "id, userId, updatedAt",
      skills: "id, userId, skillId, updatedAt",
      savedJobs: "jobId, createdAt",
      recommendations: "id, match, updatedAt",
      syncMeta: "resource",
      pendingActions: "++seq, &idempotencyKey, status, type",
    });
  }
}

export const db = new JobFitsOfflineDb();

/** Table for a resource, so the sync engine can stay generic over the eight. */
export function tableFor(resource: SyncResource, database: JobFitsOfflineDb = db): Table<any, any> {
  switch (resource) {
    case "applications":
      return database.applications;
    case "profile":
      return database.profile;
    case "experiences":
      return database.experiences;
    case "education":
      return database.education;
    case "certifications":
      return database.certifications;
    case "skills":
      return database.skills;
    case "savedJobs":
      return database.savedJobs;
    case "recommendations":
      return database.recommendations;
  }
}

/** Wipe every local table. Used on logout — a cache is per-user. */
export async function clearOfflineData(database: JobFitsOfflineDb = db): Promise<void> {
  await database.transaction(
    "rw",
    database.tables,
    async () => {
      await Promise.all(database.tables.map((table) => table.clear()));
    },
  );
}
