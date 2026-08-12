/**
 * Push-side sync: local mutations → server.
 *
 * Every write goes through `perform`, which applies the change to IndexedDB
 * first so the UI is instant either way, then either calls the live endpoint or
 * parks the action in `pendingActions` for the next flush.
 *
 * Three contract details drive the shape of this file:
 *
 *  - **Idempotency keys are minted at queue time, once**, and reused on every
 *    retry. Regenerating per attempt is what turns a retried save into a
 *    duplicate application. (PWA_SYNC_API.md §1.)
 *  - **`POST /sync/batch` always returns 200**, with a per-action `results`
 *    array. A non-2xx would mean "retry everything", re-running work that
 *    already succeeded, so the status code carries no per-action meaning.
 *  - **Order is the array order**, not `clientTimestamp` — "save X" then
 *    "unsave X" is only correct one way round. The queue is ordered by `seq`.
 */
import { ApiError, apiClient, getAccessToken } from "@/lib/api/client";
import { applicationApi } from "@/features/application/api/application.api";
import { savedJobsApi } from "@/features/saved-jobs/api/saved-jobs.api";
import {
  db,
  type JobFitsOfflineDb,
  type PendingAction,
  type PendingActionPayload,
  type PendingActionType,
} from "./db";
import { isNetworkError } from "./sync-engine";

/** Server cap for one flush (`MAX_BATCH_ACTIONS`). */
export const MAX_BATCH_ACTIONS = 50;

export type BatchErrorCode =
  | "CONFLICT"
  | "VERSION_CONFLICT"
  | "IDEMPOTENCY_CONFLICT"
  | "INVALID_PAYLOAD"
  | "NOT_FOUND"
  | "FAILED";

export interface BatchResult {
  idempotencyKey: string;
  status: "success" | "error" | "conflict";
  data?: unknown;
  error?: string;
  code?: BatchErrorCode;
  replayed?: boolean;
  serverVersion?: unknown;
  clientAttempted?: unknown;
}

export interface FlushReport {
  /** Actions accepted by the server (including replays). */
  succeeded: number;
  /** Dropped as permanently failed; each message is worth surfacing. */
  failed: { type: PendingActionType; message: string }[];
  /** Still queued, awaiting the user's decision. */
  conflicts: PendingAction[];
  /** True when the flush stopped because the network went away mid-batch. */
  interrupted: boolean;
}

/** `FAILED` is the only code the contract marks retryable. */
function isRetryable(code: BatchErrorCode | undefined): boolean {
  return code === "FAILED";
}

// ── Session gate ─────────────────────────────────────────────────────────────

interface JwtClaims {
  exp?: number;
}

function decodeJwt(token: string): JwtClaims | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json) as JwtClaims;
  } catch {
    return null;
  }
}

/**
 * Whether a write may be accepted at all.
 *
 * Offline + expired (or absent) access token is the case
 * PWA_OFFLINE_KNOWN_GAPS.md §2.7 flags: refreshing needs the network, so a
 * queued write would be authorised against a session that is already dead and
 * fail in a batch the user has long forgotten about. Reads keep working from
 * the local cache; writes are refused at the point of action, while there is
 * still someone to tell.
 */
export function canAcceptWrite(now: number = Date.now()): boolean {
  const token = getAccessToken();
  if (!token) return false;
  const claims = decodeJwt(token);
  // No `exp` claim: nothing to check, let the server decide.
  if (!claims?.exp) return true;
  return claims.exp * 1000 > now;
}

/** Thrown when the write gate refuses an action. */
export class SessionExpiredError extends Error {
  constructor() {
    super("Your session expired while you were offline. Reconnect and sign in to make changes.");
    this.name = "SessionExpiredError";
  }
}

// ── Optimistic local application ─────────────────────────────────────────────

/**
 * Apply an action to the local tables so the UI reflects it immediately.
 *
 * Exported for tests. Note `recommendations` is keyed by the JOB id (the DTO
 * mirrors JobDto), which is also what DISMISS_RECOMMENDATION targets.
 */
export async function applyLocally(
  type: PendingActionType,
  payload: PendingActionPayload,
  options: { idempotencyKey?: string; database?: JobFitsOfflineDb } = {},
): Promise<void> {
  const { idempotencyKey, database = db } = options;

  switch (type) {
    case "SAVE_JOB":
      if (payload.jobId) await database.savedJobs.put({ jobId: payload.jobId });
      return;

    case "UNSAVE_JOB":
      if (payload.jobId) await database.savedJobs.delete(payload.jobId);
      return;

    case "DISMISS_RECOMMENDATION":
      if (payload.jobId) await database.recommendations.delete(payload.jobId);
      return;

    case "SUBMIT_APPLICATION": {
      if (!payload.jobId || !idempotencyKey) return;
      const nowIso = new Date().toISOString();
      // Provisional row under a synthetic id, replaced by the server's row on
      // flush. Prefixed so nothing mistakes it for a real application id.
      await database.applications.put({
        id: `pending:${idempotencyKey}`,
        userId: "",
        jobId: payload.jobId,
        status: "SUBMITTED",
        appliedAt: nowIso,
        resumeId: payload.resumeId,
        coverLetter: payload.coverLetter,
        notes: payload.notes,
        createdAt: nowIso,
        updatedAt: nowIso,
      });
      return;
    }

    case "UPDATE_PROFILE": {
      const existing = await database.profile.toCollection().first();
      if (existing) {
        await database.profile.put({ ...existing, ...(payload.changes ?? {}) } as any);
      }
      return;
    }

    case "UPDATE_EXPERIENCE": {
      if (!payload.id) return;
      const existing = await database.experiences.get(payload.id);
      if (existing) {
        await database.experiences.put({ ...existing, ...(payload.changes ?? {}) } as any);
      }
      return;
    }

    case "UPDATE_EDUCATION": {
      if (!payload.id) return;
      const existing = await database.education.get(payload.id);
      if (existing) {
        await database.education.put({ ...existing, ...(payload.changes ?? {}) } as any);
      }
      return;
    }
  }
}

// ── Queueing ─────────────────────────────────────────────────────────────────

async function enqueue(
  type: PendingActionType,
  payload: PendingActionPayload,
  idempotencyKey: string,
  database: JobFitsOfflineDb,
): Promise<PendingAction> {
  const action: PendingAction = {
    idempotencyKey,
    type,
    payload,
    // When the user TOOK the action, not when it is flushed.
    clientTimestamp: new Date().toISOString(),
    status: "pending",
  };
  const seq = await database.pendingActions.add(action);
  return { ...action, seq: seq as number };
}

/**
 * Run an action against the live endpoint.
 *
 * `DISMISS_RECOMMENDATION` has no REST route of its own — the backend exposes
 * `RecommendationDismissService` only through the batch endpoint — so its
 * online path is a batch of one. That is a real constraint of the current API,
 * not a shortcut.
 */
async function executeOnline(
  type: PendingActionType,
  payload: PendingActionPayload,
  idempotencyKey: string,
): Promise<BatchResult[] | void> {
  switch (type) {
    case "SAVE_JOB":
      await savedJobsApi.save(payload.jobId!, idempotencyKey);
      return;
    case "UNSAVE_JOB":
      await savedJobsApi.remove(payload.jobId!, idempotencyKey);
      return;
    case "SUBMIT_APPLICATION":
      await applicationApi.submit(
        {
          jobId: payload.jobId!,
          resumeId: payload.resumeId,
          coverLetter: payload.coverLetter,
          notes: payload.notes,
        },
        idempotencyKey,
      );
      return;
    default:
      // DISMISS_* and every UPDATE_* go through the batch endpoint.
      return postBatch([
        { idempotencyKey, type, payload, clientTimestamp: new Date().toISOString(), status: "pending" },
      ]);
  }
}

export interface PerformOutcome {
  /** How the action was handled. */
  mode: "online" | "queued";
  /** Present when the server answered with a conflict for this action. */
  conflict?: PendingAction;
}

/**
 * The single entry point for an offline-capable mutation.
 *
 * Order of operations matters: the local write lands FIRST, so the UI updates
 * whether or not the network call is about to fail. If the call then fails for
 * a network reason we queue; if it fails for a server reason we roll nothing
 * back here and let the caller surface the error — a 409 "already applied" is
 * not something a retry fixes.
 */
export async function perform(
  type: PendingActionType,
  payload: PendingActionPayload,
  options: { database?: JobFitsOfflineDb } = {},
): Promise<PerformOutcome> {
  const { database = db } = options;

  if (!canAcceptWrite()) throw new SessionExpiredError();

  const idempotencyKey = crypto.randomUUID();
  await applyLocally(type, payload, { idempotencyKey, database });

  // navigator.onLine only ever reliably reports the FALSE case (a captive
  // portal reads as online), so it is a fast path, not the actual test — the
  // catch below is.
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    await enqueue(type, payload, idempotencyKey, database);
    return { mode: "queued" };
  }

  try {
    const results = await executeOnline(type, payload, idempotencyKey);
    const conflict = results?.find((r) => r.status === "conflict");
    if (conflict) {
      const queued = await enqueue(type, payload, idempotencyKey, database);
      const stored: PendingAction = {
        ...queued,
        status: "conflict",
        serverVersion: conflict.serverVersion,
        clientAttempted: conflict.clientAttempted,
        conflictMessage: conflict.error,
      };
      await database.pendingActions.put(stored);
      return { mode: "online", conflict: stored };
    }
    return { mode: "online" };
  } catch (error) {
    if (isNetworkError(error)) {
      await enqueue(type, payload, idempotencyKey, database);
      return { mode: "queued" };
    }
    throw error;
  }
}

// ── Flushing ─────────────────────────────────────────────────────────────────

function toWireAction(action: PendingAction) {
  return {
    idempotencyKey: action.idempotencyKey,
    type: action.type,
    payload: action.payload,
    clientTimestamp: action.clientTimestamp,
  };
}

async function postBatch(actions: PendingAction[]): Promise<BatchResult[]> {
  const response = await apiClient.post<{ results: BatchResult[] }>("/sync/batch", {
    actions: actions.map(toWireAction),
  });
  return response.results ?? [];
}

/** Everything awaiting flush, oldest first. Conflicts are excluded — they need a decision. */
export async function pendingCount(database: JobFitsOfflineDb = db): Promise<number> {
  return database.pendingActions.count();
}

export async function listConflicts(database: JobFitsOfflineDb = db): Promise<PendingAction[]> {
  return database.pendingActions.where("status").equals("conflict").toArray();
}

/**
 * Flush the queue to `POST /sync/batch`, in `seq` order, in chunks of 50.
 *
 * Actions already parked as conflicts are skipped: resending them unchanged
 * would produce the same conflict, and auto-retrying with a refreshed
 * `expectedUpdatedAt` is last-write-wins with extra steps — precisely what the
 * optimistic-concurrency check exists to prevent.
 */
export async function flushQueue(
  options: { database?: JobFitsOfflineDb } = {},
): Promise<FlushReport> {
  const { database = db } = options;
  const report: FlushReport = { succeeded: 0, failed: [], conflicts: [], interrupted: false };

  if (!canAcceptWrite()) {
    // Nothing is dropped — the queue waits for a real session.
    report.interrupted = true;
    return report;
  }

  const queued = await database.pendingActions
    .where("status")
    .equals("pending")
    .sortBy("seq");
  if (queued.length === 0) return report;

  for (let i = 0; i < queued.length; i += MAX_BATCH_ACTIONS) {
    const chunk = queued.slice(i, i + MAX_BATCH_ACTIONS);

    let results: BatchResult[];
    try {
      results = await postBatch(chunk);
    } catch (error) {
      // Network died mid-flush: leave this chunk and everything after it
      // queued. The same keys go out next time, so anything that did land is
      // replayed rather than re-applied.
      report.interrupted = true;
      if (!isNetworkError(error) && !(error instanceof ApiError)) throw error;
      break;
    }

    const byKey = new Map(results.map((r) => [r.idempotencyKey, r]));

    for (const action of chunk) {
      const result = byKey.get(action.idempotencyKey);
      // No result for a submitted action shouldn't happen; keep it queued
      // rather than assume either outcome.
      if (!result) continue;

      if (result.status === "success") {
        await onSuccess(action, result, database);
        await database.pendingActions.delete(action.seq!);
        report.succeeded += 1;
        continue;
      }

      if (result.status === "conflict") {
        const stored: PendingAction = {
          ...action,
          status: "conflict",
          serverVersion: result.serverVersion,
          clientAttempted: result.clientAttempted,
          conflictMessage: result.error,
        };
        await database.pendingActions.put(stored);
        report.conflicts.push(stored);
        continue;
      }

      // status === "error"
      if (isRetryable(result.code)) continue; // FAILED — leave queued for later.
      await database.pendingActions.delete(action.seq!);
      report.failed.push({
        type: action.type,
        message: result.error ?? "That change could not be saved.",
      });
    }
  }

  return report;
}

/**
 * Reconcile local state with what the server actually returned.
 *
 * Only SUBMIT_APPLICATION needs it: the provisional row was written under a
 * synthetic id and has to be swapped for the real one, or the next delta sync
 * would add the server's copy alongside the placeholder.
 */
async function onSuccess(
  action: PendingAction,
  result: BatchResult,
  database: JobFitsOfflineDb,
): Promise<void> {
  if (action.type !== "SUBMIT_APPLICATION") return;
  await database.applications.delete(`pending:${action.idempotencyKey}`);
  const data = result.data as { id?: string } | undefined;
  if (data?.id) await database.applications.put(data as any);
}

// ── Conflict resolution ──────────────────────────────────────────────────────

/**
 * "Keep my version": resend the same change with `expectedUpdatedAt` advanced
 * to the server's current `updatedAt`.
 *
 * There is no force/overwrite flag in the API — this is the documented
 * resolution path (§4.3), and it is deliberate: the user has now SEEN the
 * server's version and chosen, which is the difference between a considered
 * overwrite and a blind one. A brand-new idempotency key is correct here
 * because the payload changed, and the old key is bound to the old body.
 */
export async function resolveKeepMine(
  seq: number,
  options: { database?: JobFitsOfflineDb } = {},
): Promise<BatchResult | undefined> {
  const { database = db } = options;
  const action = await database.pendingActions.get(seq);
  if (!action) return;

  const serverVersion = action.serverVersion as { updatedAt?: string } | undefined;
  const retry: PendingAction = {
    ...action,
    idempotencyKey: crypto.randomUUID(),
    payload: { ...action.payload, expectedUpdatedAt: serverVersion?.updatedAt },
    status: "pending",
    serverVersion: undefined,
    clientAttempted: undefined,
    conflictMessage: undefined,
  };
  await database.pendingActions.put(retry);

  const [result] = await postBatch([retry]);
  if (!result) return;

  if (result.status === "success") {
    await database.pendingActions.delete(seq);
  } else if (result.status === "conflict") {
    await database.pendingActions.put({
      ...retry,
      status: "conflict",
      serverVersion: result.serverVersion,
      clientAttempted: result.clientAttempted,
      conflictMessage: result.error,
    });
  } else {
    await database.pendingActions.delete(seq);
  }
  return result;
}

/**
 * "Discard my change": drop the queued action and adopt the server's record
 * locally, so the UI stops showing an edit that was never applied.
 */
export async function resolveDiscardMine(
  seq: number,
  options: { database?: JobFitsOfflineDb } = {},
): Promise<void> {
  const { database = db } = options;
  const action = await database.pendingActions.get(seq);
  if (!action) return;

  const serverVersion = action.serverVersion as Record<string, unknown> | undefined;
  if (serverVersion) {
    if (action.type === "UPDATE_PROFILE") await database.profile.put(serverVersion as any);
    if (action.type === "UPDATE_EXPERIENCE") await database.experiences.put(serverVersion as any);
    if (action.type === "UPDATE_EDUCATION") await database.education.put(serverVersion as any);
  }
  await database.pendingActions.delete(seq);
}
