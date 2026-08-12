/**
 * Pull-side sync: server → IndexedDB.
 *
 * Follows the two rules PWA_SYNC_API.md §2 calls out as the ones that actually
 * bite:
 *
 *  1. The next `since` is the server's `serverTime`, never our own clock. A
 *     client clock a few seconds fast would ask for changes after an instant
 *     the server has not reached and skip those rows forever.
 *  2. Pagination is drained before the watermark advances. While `nextCursor`
 *     is non-null we keep the SAME `since` and pass the new cursor; the
 *     watermark is only persisted once a page comes back with a null cursor.
 *     Advancing early loses everything past page one.
 *
 * Route shape is `/sync/{resource}`, not `/{resource}/sync` — the latter
 * collides with the `@Get(':id')` routes on those controllers.
 */
import { apiClient, ApiError } from "@/lib/api/client";
import {
  db,
  tableFor,
  type JobFitsOfflineDb,
  type SyncMeta,
  type SyncResource,
} from "./db";

/** The envelope every `/sync/*` route returns. */
export interface SyncEnvelope<T = unknown> {
  since: string | null;
  serverTime: string;
  upserts: T[];
  deletes: string[];
  nextCursor: string | null;
  /** saved-jobs only: replace the local collection wholesale, do not merge. */
  fullReplace?: boolean;
}

export interface BootstrapResponse {
  serverTime: string;
  resources: Record<SyncResource, SyncEnvelope>;
}

/** Path segment per resource — `savedJobs` is `saved-jobs` on the wire. */
const ROUTE: Record<SyncResource, string> = {
  applications: "applications",
  profile: "profile",
  experiences: "experiences",
  education: "education",
  certifications: "certifications",
  skills: "skills",
  savedJobs: "saved-jobs",
  recommendations: "recommendations",
};

export const SYNC_RESOURCES = Object.keys(ROUTE) as SyncResource[];

/**
 * Apply one page of a delta to the local table.
 *
 * Deletes are applied after upserts: within a single page the server can report
 * a row as both (created then soft-deleted between two syncs), and the delete
 * is the later truth.
 *
 * Exported for tests — this is the merge logic worth pinning down.
 */
export async function applyDelta(
  resource: SyncResource,
  envelope: SyncEnvelope,
  options: { isFirstPage?: boolean; database?: JobFitsOfflineDb } = {},
): Promise<void> {
  const { isFirstPage = true, database = db } = options;
  const table = tableFor(resource, database);

  await database.transaction("rw", table, async () => {
    // fullReplace means the server sent the complete set and cannot express
    // deletions — anything not in `upserts` is gone. Clear once, on page one,
    // so a paginated full replace would not wipe the pages before it.
    if (envelope.fullReplace && isFirstPage) {
      await table.clear();
    }

    if (envelope.upserts.length > 0) {
      // bulkPut is create-or-replace, which is exactly what "upsert" means here.
      await table.bulkPut(envelope.upserts as any[]);
    }

    if (!envelope.fullReplace && envelope.deletes.length > 0) {
      await table.bulkDelete(envelope.deletes);
    }
  });
}

async function readMeta(
  resource: SyncResource,
  database: JobFitsOfflineDb,
): Promise<SyncMeta | undefined> {
  return database.syncMeta.get(resource);
}

async function writeWatermark(
  resource: SyncResource,
  serverTime: string,
  database: JobFitsOfflineDb,
): Promise<void> {
  await database.syncMeta.put({
    resource,
    serverTime,
    lastSyncedAt: new Date().toISOString(),
  });
}

/**
 * Drain one resource: page until `nextCursor` is null, then persist the
 * watermark. Returns the number of pages fetched (1 for the common case).
 */
export async function syncResource(
  resource: SyncResource,
  options: { database?: JobFitsOfflineDb; signal?: AbortSignal } = {},
): Promise<number> {
  const { database = db, signal } = options;
  const meta = await readMeta(resource, database);
  const since = meta?.serverTime;

  let cursor: string | null | undefined;
  let pages = 0;
  // Every page of one drain reports the same serverTime; keep the first.
  let watermark: string | undefined;

  do {
    const envelope = await apiClient.get<SyncEnvelope>(`/sync/${ROUTE[resource]}`, {
      query: { since, cursor: cursor ?? undefined },
      signal,
    });

    await applyDelta(resource, envelope, { isFirstPage: pages === 0, database });

    watermark ??= envelope.serverTime;
    cursor = envelope.nextCursor;
    pages += 1;
  } while (cursor);

  // Only now — the drain completed, so nothing after page one was lost.
  if (watermark) await writeWatermark(resource, watermark, database);
  return pages;
}

/**
 * First load / fresh install: one round trip for all eight resources.
 *
 * A resource whose bootstrap page reports a non-null `nextCursor` is drained on
 * its own route before its watermark is written, per §2.
 */
export async function bootstrap(
  options: { database?: JobFitsOfflineDb; signal?: AbortSignal } = {},
): Promise<void> {
  const { database = db, signal } = options;
  const response = await apiClient.get<BootstrapResponse>("/sync/bootstrap", { signal });

  for (const resource of SYNC_RESOURCES) {
    const envelope = response.resources[resource];
    if (!envelope) continue;

    await applyDelta(resource, envelope, { isFirstPage: true, database });

    if (envelope.nextCursor) {
      // Incomplete: finish this resource on its own route. The watermark is
      // written by syncResource only once that drain completes.
      await drainFrom(resource, envelope.nextCursor, envelope.since ?? undefined, {
        database,
        signal,
      });
      await writeWatermark(resource, envelope.serverTime, database);
    } else {
      await writeWatermark(resource, envelope.serverTime, database);
    }
  }
}

/** Continue a drain that bootstrap started, from a cursor it handed back. */
async function drainFrom(
  resource: SyncResource,
  startCursor: string,
  since: string | undefined,
  options: { database?: JobFitsOfflineDb; signal?: AbortSignal },
): Promise<void> {
  const { database = db, signal } = options;
  let cursor: string | null = startCursor;

  while (cursor) {
    const envelope: SyncEnvelope = await apiClient.get<SyncEnvelope>(
      `/sync/${ROUTE[resource]}`,
      { query: { since, cursor }, signal },
    );
    // Never page one — a fullReplace clear here would discard the bootstrap page.
    await applyDelta(resource, envelope, { isFirstPage: false, database });
    cursor = envelope.nextCursor;
  }
}

/** True when no resource has ever completed a sync on this device. */
export async function isLocalStoreEmpty(database: JobFitsOfflineDb = db): Promise<boolean> {
  return (await database.syncMeta.count()) === 0;
}

export interface SyncOutcome {
  ok: boolean;
  /** Resources that failed, with the reason, so callers can log a real cause. */
  failures: { resource: SyncResource | "bootstrap"; error: unknown }[];
}

/**
 * The entry point: bootstrap on a cold store, otherwise a delta per resource.
 *
 * One resource failing does not abort the rest — a 500 on recommendations
 * should not cost the user their applications. Each resource's watermark only
 * moves on its own success, so a failure re-fetches the same window next time.
 */
export async function sync(
  options: { database?: JobFitsOfflineDb; signal?: AbortSignal } = {},
): Promise<SyncOutcome> {
  const { database = db, signal } = options;
  const failures: SyncOutcome["failures"] = [];

  if (await isLocalStoreEmpty(database)) {
    try {
      await bootstrap({ database, signal });
      return { ok: true, failures };
    } catch (error) {
      // Fall through to per-resource sync: a bootstrap that fails wholesale
      // still lets each route be tried on its own.
      failures.push({ resource: "bootstrap", error });
    }
  }

  for (const resource of SYNC_RESOURCES) {
    try {
      await syncResource(resource, { database, signal });
    } catch (error) {
      failures.push({ resource, error });
    }
  }

  return { ok: failures.length === 0, failures };
}

/** A failure that means "no network", as opposed to a real server response. */
export function isNetworkError(error: unknown): boolean {
  // The api client turns fetch rejections into a TypeError; ApiError with
  // status 0 is its own "never reached the server" signal.
  if (error instanceof ApiError) return error.statusCode === 0;
  return error instanceof TypeError;
}
