/**
 * Where `expectedUpdatedAt` comes from.
 *
 * The optimistic-concurrency check needs the `updatedAt` this client last saw
 * (PWA_SYNC_API.md §4). The local mirror holds the server's raw DTOs, so it is
 * the honest source: it is literally the last version this device was told
 * about. The TanStack cache holds view models, which have already dropped it.
 */
import { db, type JobFitsOfflineDb } from "./db";

export type VersionedKind = "profile" | "experience" | "education";

export async function localUpdatedAt(
  kind: VersionedKind,
  id?: string,
  database: JobFitsOfflineDb = db,
): Promise<string | undefined> {
  try {
    if (kind === "profile") {
      const row = await database.profile.toCollection().first();
      return row?.updatedAt;
    }
    if (!id) return undefined;
    const row =
      kind === "experience"
        ? await database.experiences.get(id)
        : await database.education.get(id);
    return row?.updatedAt;
  } catch {
    // IndexedDB unavailable (private mode, SSR): the caller falls back to a
    // live read rather than sending a guess.
    return undefined;
  }
}
