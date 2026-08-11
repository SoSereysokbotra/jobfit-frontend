/**
 * Merge-logic tests for the sync engine.
 *
 * These run against a real Dexie over fake-indexeddb, so what is asserted is
 * the actual effect on the tables rather than "the right method was called".
 * The cases chosen are the ones PWA_SYNC_API.md warns about: watermark source,
 * draining before advancing, and saved-jobs' full replace.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { JobFitsOfflineDb } from "./db";
import { applyDelta, bootstrap, syncResource, type SyncEnvelope } from "./sync-engine";

const { getMock } = vi.hoisted(() => ({ getMock: vi.fn() }));

vi.mock("@/lib/api/client", () => ({
  apiClient: { get: getMock },
  ApiError: class ApiError extends Error {
    statusCode: number;
    constructor(statusCode: number) {
      super("api error");
      this.statusCode = statusCode;
    }
  },
}));

let db: JobFitsOfflineDb;
let dbCounter = 0;

function envelope<T>(over: Partial<SyncEnvelope<T>> = {}): SyncEnvelope<T> {
  return {
    since: null,
    serverTime: "2026-08-11T10:00:00.000Z",
    upserts: [],
    deletes: [],
    nextCursor: null,
    ...over,
  };
}

const application = (id: string, over: Record<string, unknown> = {}) => ({
  id,
  userId: "u1",
  jobId: `job-${id}`,
  status: "SUBMITTED",
  appliedAt: "2026-08-01T00:00:00.000Z",
  createdAt: "2026-08-01T00:00:00.000Z",
  updatedAt: "2026-08-01T00:00:00.000Z",
  ...over,
});

beforeEach(async () => {
  getMock.mockReset();
  // A fresh database per test — Dexie keeps schema state on the instance.
  db = new JobFitsOfflineDb(`test-db-${dbCounter++}`);
  await db.open();
});

afterEach(async () => {
  await db.delete();
});

describe("applyDelta", () => {
  it("inserts upserts and replaces existing rows by primary key", async () => {
    await db.applications.put(application("a1", { status: "DRAFT" }) as any);

    await applyDelta(
      "applications",
      envelope({ upserts: [application("a1", { status: "INTERVIEW" }), application("a2")] }),
      { database: db },
    );

    expect(await db.applications.count()).toBe(2);
    expect((await db.applications.get("a1"))?.status).toBe("INTERVIEW");
  });

  it("removes rows listed in deletes", async () => {
    await db.applications.bulkPut([application("a1"), application("a2")] as any);

    await applyDelta("applications", envelope({ deletes: ["a1"] }), { database: db });

    expect(await db.applications.toCollection().primaryKeys()).toEqual(["a2"]);
  });

  it("applies deletes after upserts when a page contains both for one row", async () => {
    // The server can report a row created and then soft-deleted between syncs.
    // The delete is the later truth, so the row must not survive.
    await applyDelta(
      "applications",
      envelope({ upserts: [application("a1")], deletes: ["a1"] }),
      { database: db },
    );

    expect(await db.applications.get("a1")).toBeUndefined();
  });

  it("replaces the whole collection when fullReplace is set", async () => {
    await db.savedJobs.bulkPut([{ jobId: "job-A" }, { jobId: "job-B" }]);

    // saved-jobs reports no deletes — an unsave is only visible as an absence.
    await applyDelta(
      "savedJobs",
      envelope({ upserts: [{ jobId: "job-B" }], fullReplace: true }),
      { database: db },
    );

    expect(await db.savedJobs.toCollection().primaryKeys()).toEqual(["job-B"]);
  });

  it("does not clear on later pages of a fullReplace", async () => {
    await applyDelta("savedJobs", envelope({ upserts: [{ jobId: "job-A" }], fullReplace: true }), {
      database: db,
      isFirstPage: true,
    });
    await applyDelta("savedJobs", envelope({ upserts: [{ jobId: "job-B" }], fullReplace: true }), {
      database: db,
      isFirstPage: false,
    });

    expect((await db.savedJobs.toCollection().primaryKeys()).sort()).toEqual(["job-A", "job-B"]);
  });

  it("keys saved jobs by jobId, not id", async () => {
    await applyDelta(
      "savedJobs",
      envelope({ upserts: [{ id: "sj-1", jobId: "job-A" }] }),
      { database: db },
    );

    expect(await db.savedJobs.get("job-A")).toMatchObject({ id: "sj-1", jobId: "job-A" });
  });
});

describe("syncResource", () => {
  it("stores the server's serverTime as the watermark, not the local clock", async () => {
    getMock.mockResolvedValueOnce(envelope({ serverTime: "2026-08-11T12:34:56.000Z" }));

    await syncResource("applications", { database: db });

    expect((await db.syncMeta.get("applications"))?.serverTime).toBe("2026-08-11T12:34:56.000Z");
  });

  it("sends the stored watermark as `since` on the next run", async () => {
    await db.syncMeta.put({ resource: "applications", serverTime: "2026-08-10T00:00:00.000Z" });
    getMock.mockResolvedValueOnce(envelope());

    await syncResource("applications", { database: db });

    expect(getMock).toHaveBeenCalledWith(
      "/sync/applications",
      expect.objectContaining({
        query: expect.objectContaining({ since: "2026-08-10T00:00:00.000Z" }),
      }),
    );
  });

  it("drains every page before advancing the watermark", async () => {
    getMock
      .mockResolvedValueOnce(
        envelope({ upserts: [application("a1")], nextCursor: "cursor-1", serverTime: "T1" }),
      )
      .mockResolvedValueOnce(
        envelope({ upserts: [application("a2")], nextCursor: "cursor-2", serverTime: "T2" }),
      )
      .mockResolvedValueOnce(
        envelope({ upserts: [application("a3")], nextCursor: null, serverTime: "T3" }),
      );

    const pages = await syncResource("applications", { database: db });

    expect(pages).toBe(3);
    expect(await db.applications.count()).toBe(3);
    // The FIRST page's serverTime — a later one would skip rows written during
    // the drain.
    expect((await db.syncMeta.get("applications"))?.serverTime).toBe("T1");
  });

  it("keeps the same `since` across pages and passes the new cursor", async () => {
    await db.syncMeta.put({ resource: "applications", serverTime: "S0" });
    getMock
      .mockResolvedValueOnce(envelope({ nextCursor: "cursor-1" }))
      .mockResolvedValueOnce(envelope({ nextCursor: null }));

    await syncResource("applications", { database: db });

    expect(getMock).toHaveBeenNthCalledWith(
      2,
      "/sync/applications",
      expect.objectContaining({ query: { since: "S0", cursor: "cursor-1" } }),
    );
  });

  it("leaves the watermark untouched when a page fails mid-drain", async () => {
    await db.syncMeta.put({ resource: "applications", serverTime: "S0" });
    getMock
      .mockResolvedValueOnce(envelope({ nextCursor: "cursor-1", serverTime: "T1" }))
      .mockRejectedValueOnce(new Error("network"));

    await expect(syncResource("applications", { database: db })).rejects.toThrow("network");

    // Still S0: re-fetching the same window is safe, skipping it is not.
    expect((await db.syncMeta.get("applications"))?.serverTime).toBe("S0");
  });

  it("uses the kebab-case route for saved jobs", async () => {
    getMock.mockResolvedValueOnce(envelope({ fullReplace: true }));

    await syncResource("savedJobs", { database: db });

    expect(getMock).toHaveBeenCalledWith("/sync/saved-jobs", expect.anything());
  });
});

describe("bootstrap", () => {
  it("populates every resource and records a watermark for each", async () => {
    getMock.mockResolvedValueOnce({
      serverTime: "2026-08-11T10:00:00.000Z",
      resources: {
        applications: envelope({ upserts: [application("a1")] }),
        profile: envelope({ upserts: [{ id: "p1", userId: "u1", updatedAt: "x" }] }),
        experiences: envelope(),
        education: envelope(),
        certifications: envelope(),
        skills: envelope(),
        savedJobs: envelope({ upserts: [{ jobId: "job-A" }], fullReplace: true }),
        recommendations: envelope({ upserts: [{ id: "job-A", match: 91 }] }),
      },
    });

    await bootstrap({ database: db });

    expect(await db.applications.count()).toBe(1);
    expect(await db.savedJobs.count()).toBe(1);
    expect(await db.recommendations.count()).toBe(1);
    expect(await db.syncMeta.count()).toBe(8);
  });

  it("drains a resource on its own route when bootstrap reports a cursor", async () => {
    getMock
      .mockResolvedValueOnce({
        serverTime: "2026-08-11T10:00:00.000Z",
        resources: {
          applications: envelope({ upserts: [application("a1")], nextCursor: "cursor-1" }),
          profile: envelope(),
          experiences: envelope(),
          education: envelope(),
          certifications: envelope(),
          skills: envelope(),
          savedJobs: envelope({ fullReplace: true }),
          recommendations: envelope(),
        },
      })
      .mockResolvedValueOnce(envelope({ upserts: [application("a2")], nextCursor: null }));

    await bootstrap({ database: db });

    expect(getMock).toHaveBeenNthCalledWith(2, "/sync/applications", expect.anything());
    expect(await db.applications.count()).toBe(2);
  });
});
