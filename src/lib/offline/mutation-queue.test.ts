/**
 * Online/offline branching and flush handling for the mutation queue.
 *
 * The behaviours pinned here are the ones that cost real data when wrong:
 * the optimistic write landing regardless of connectivity, idempotency keys
 * surviving a retry unchanged, and each batch result status routing correctly.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { JobFitsOfflineDb } from "./db";

// Declared inside `vi.hoisted` because `vi.mock` factories are hoisted above
// every top-level statement — a class declared normally is not initialised yet
// when the factory runs.
const { getMock, postMock, deleteMock, tokenMock, FakeApiError } = vi.hoisted(() => ({
  getMock: vi.fn(),
  postMock: vi.fn(),
  deleteMock: vi.fn(),
  tokenMock: vi.fn(),
  FakeApiError: class FakeApiError extends Error {
    statusCode: number;
    constructor(statusCode: number) {
      super("api error");
      this.statusCode = statusCode;
    }
  },
}));

vi.mock("@/lib/api/client", () => ({
  apiClient: { get: getMock, post: postMock, delete: deleteMock },
  ApiError: FakeApiError,
  getAccessToken: tokenMock,
}));

import {
  applyLocally,
  canAcceptWrite,
  flushQueue,
  perform,
  SessionExpiredError,
} from "./mutation-queue";

let db: JobFitsOfflineDb;
let dbCounter = 0;

/** A JWT whose only meaningful claim is `exp`. */
function tokenExpiring(atMs: number): string {
  const payload = btoa(JSON.stringify({ exp: Math.floor(atMs / 1000) }));
  return `header.${payload}.signature`;
}

function setOnline(online: boolean) {
  Object.defineProperty(navigator, "onLine", { value: online, configurable: true });
}

beforeEach(async () => {
  vi.clearAllMocks();
  db = new JobFitsOfflineDb(`queue-db-${dbCounter++}`);
  await db.open();
  tokenMock.mockReturnValue(tokenExpiring(Date.now() + 60 * 60_000));
  setOnline(true);
  postMock.mockResolvedValue({ jobIds: [] });
});

afterEach(async () => {
  await db.delete();
});

describe("canAcceptWrite", () => {
  it("refuses when there is no token at all", () => {
    tokenMock.mockReturnValue(null);
    expect(canAcceptWrite()).toBe(false);
  });

  it("refuses an expired token", () => {
    tokenMock.mockReturnValue(tokenExpiring(Date.now() - 60_000));
    expect(canAcceptWrite()).toBe(false);
  });

  it("accepts a live token", () => {
    expect(canAcceptWrite()).toBe(true);
  });

  it("accepts a token with no exp claim rather than guessing", () => {
    tokenMock.mockReturnValue(`header.${btoa(JSON.stringify({ sub: "u1" }))}.sig`);
    expect(canAcceptWrite()).toBe(true);
  });
});

describe("perform — offline branch", () => {
  it("applies the change locally and queues it when navigator reports offline", async () => {
    setOnline(false);

    const outcome = await perform("SAVE_JOB", { jobId: "job-A" }, { database: db });

    expect(outcome.mode).toBe("queued");
    expect(await db.savedJobs.get("job-A")).toBeTruthy();
    expect(await db.pendingActions.count()).toBe(1);
    expect(postMock).not.toHaveBeenCalled();
  });

  it("queues when the request fails for a network reason, having already written locally", async () => {
    // navigator.onLine lies (captive portals), so the catch is the real test.
    postMock.mockRejectedValueOnce(new TypeError("Failed to fetch"));

    const outcome = await perform("SAVE_JOB", { jobId: "job-A" }, { database: db });

    expect(outcome.mode).toBe("queued");
    expect(await db.savedJobs.get("job-A")).toBeTruthy();
    expect(await db.pendingActions.count()).toBe(1);
  });

  it("does not queue a server-side rejection — a retry would not fix it", async () => {
    postMock.mockRejectedValueOnce(new FakeApiError(409));

    await expect(perform("SAVE_JOB", { jobId: "job-A" }, { database: db })).rejects.toBeInstanceOf(
      FakeApiError,
    );
    expect(await db.pendingActions.count()).toBe(0);
  });

  it("refuses the write outright when the session expired offline", async () => {
    tokenMock.mockReturnValue(tokenExpiring(Date.now() - 1000));
    setOnline(false);

    await expect(
      perform("SAVE_JOB", { jobId: "job-A" }, { database: db }),
    ).rejects.toBeInstanceOf(SessionExpiredError);

    // Nothing queued and nothing written: the user is told now, not after a
    // flush that was always going to fail.
    expect(await db.pendingActions.count()).toBe(0);
    expect(await db.savedJobs.count()).toBe(0);
  });

  it("succeeds online without queueing", async () => {
    const outcome = await perform("SAVE_JOB", { jobId: "job-A" }, { database: db });

    expect(outcome.mode).toBe("online");
    expect(await db.pendingActions.count()).toBe(0);
    expect(await db.savedJobs.get("job-A")).toBeTruthy();
  });
});

describe("applyLocally", () => {
  it("removes the bookmark on UNSAVE_JOB", async () => {
    await db.savedJobs.put({ jobId: "job-A" });
    await applyLocally("UNSAVE_JOB", { jobId: "job-A" }, { database: db });
    expect(await db.savedJobs.get("job-A")).toBeUndefined();
  });

  it("removes the recommendation by job id on DISMISS_RECOMMENDATION", async () => {
    await db.recommendations.put({ id: "job-A", match: 90 } as any);
    await applyLocally("DISMISS_RECOMMENDATION", { jobId: "job-A" }, { database: db });
    expect(await db.recommendations.get("job-A")).toBeUndefined();
  });

  it("writes a provisional application under a synthetic id", async () => {
    await applyLocally(
      "SUBMIT_APPLICATION",
      { jobId: "job-C" },
      { idempotencyKey: "key-1", database: db },
    );
    expect(await db.applications.get("pending:key-1")).toMatchObject({ jobId: "job-C" });
  });

  it("merges changes into the existing record on UPDATE_EXPERIENCE", async () => {
    await db.experiences.put({ id: "e1", title: "Staff Engineer", company: "Acme" } as any);
    await applyLocally(
      "UPDATE_EXPERIENCE",
      { id: "e1", changes: { title: "Principal Engineer" } },
      { database: db },
    );
    expect(await db.experiences.get("e1")).toMatchObject({
      title: "Principal Engineer",
      company: "Acme",
    });
  });
});

describe("flushQueue", () => {
  async function queueOffline(type: Parameters<typeof perform>[0], payload: object) {
    setOnline(false);
    await perform(type, payload, { database: db });
    setOnline(true);
  }

  it("sends queued actions in seq order with their original keys", async () => {
    await queueOffline("SAVE_JOB", { jobId: "job-A" });
    await queueOffline("UNSAVE_JOB", { jobId: "job-A" });

    const queued = await db.pendingActions.orderBy("seq").toArray();
    postMock.mockResolvedValueOnce({
      results: queued.map((a) => ({ idempotencyKey: a.idempotencyKey, status: "success" })),
    });

    const report = await flushQueue({ database: db });

    expect(report.succeeded).toBe(2);
    const [, body] = postMock.mock.calls.at(-1)!;
    expect(body.actions.map((a: any) => a.type)).toEqual(["SAVE_JOB", "UNSAVE_JOB"]);
    // Same keys as when queued — that is what makes the replay safe.
    expect(body.actions.map((a: any) => a.idempotencyKey)).toEqual(
      queued.map((a) => a.idempotencyKey),
    );
    expect(await db.pendingActions.count()).toBe(0);
  });

  it("treats a replayed success as a success", async () => {
    await queueOffline("SAVE_JOB", { jobId: "job-A" });
    const [action] = await db.pendingActions.toArray();
    postMock.mockResolvedValueOnce({
      results: [{ idempotencyKey: action.idempotencyKey, status: "success", replayed: true }],
    });

    const report = await flushQueue({ database: db });

    expect(report.succeeded).toBe(1);
    expect(await db.pendingActions.count()).toBe(0);
  });

  it("drops a non-retryable error and reports it", async () => {
    await queueOffline("SUBMIT_APPLICATION", { jobId: "job-C" });
    const [action] = await db.pendingActions.toArray();
    postMock.mockResolvedValueOnce({
      results: [
        {
          idempotencyKey: action.idempotencyKey,
          status: "error",
          code: "CONFLICT",
          error: "You have already applied to this job",
        },
      ],
    });

    const report = await flushQueue({ database: db });

    expect(report.failed).toEqual([
      { type: "SUBMIT_APPLICATION", message: "You have already applied to this job" },
    ]);
    expect(await db.pendingActions.count()).toBe(0);
  });

  it("keeps a FAILED action queued for a later retry", async () => {
    await queueOffline("SAVE_JOB", { jobId: "job-A" });
    const [action] = await db.pendingActions.toArray();
    postMock.mockResolvedValueOnce({
      results: [{ idempotencyKey: action.idempotencyKey, status: "error", code: "FAILED" }],
    });

    const report = await flushQueue({ database: db });

    expect(report.failed).toHaveLength(0);
    expect(await db.pendingActions.count()).toBe(1);
  });

  it("parks a conflict for the user instead of retrying it", async () => {
    await queueOffline("UPDATE_EXPERIENCE", {
      id: "e1",
      expectedUpdatedAt: "2026-08-10T09:00:00.000Z",
      changes: { title: "Staff Engineer" },
    });
    const [action] = await db.pendingActions.toArray();
    postMock.mockResolvedValueOnce({
      results: [
        {
          idempotencyKey: action.idempotencyKey,
          status: "conflict",
          code: "VERSION_CONFLICT",
          error: "This record changed on the server since you last loaded it.",
          serverVersion: { id: "e1", title: "Principal Engineer" },
          clientAttempted: { title: "Staff Engineer" },
        },
      ],
    });

    const report = await flushQueue({ database: db });

    expect(report.conflicts).toHaveLength(1);
    const stored = await db.pendingActions.get(action.seq!);
    expect(stored?.status).toBe("conflict");
    expect(stored?.serverVersion).toMatchObject({ title: "Principal Engineer" });
  });

  it("skips conflicted actions on the next flush", async () => {
    await queueOffline("SAVE_JOB", { jobId: "job-A" });
    const [action] = await db.pendingActions.toArray();
    await db.pendingActions.put({ ...action, status: "conflict" });

    const report = await flushQueue({ database: db });

    expect(postMock).not.toHaveBeenCalled();
    expect(report.succeeded).toBe(0);
  });

  it("swaps the provisional application row for the server's on success", async () => {
    await queueOffline("SUBMIT_APPLICATION", { jobId: "job-C" });
    const [action] = await db.pendingActions.toArray();
    postMock.mockResolvedValueOnce({
      results: [
        {
          idempotencyKey: action.idempotencyKey,
          status: "success",
          data: { id: "app-77", jobId: "job-C", status: "SUBMITTED" },
        },
      ],
    });

    await flushQueue({ database: db });

    expect(await db.applications.get(`pending:${action.idempotencyKey}`)).toBeUndefined();
    expect(await db.applications.get("app-77")).toMatchObject({ jobId: "job-C" });
  });

  it("leaves everything queued when the flush itself fails", async () => {
    await queueOffline("SAVE_JOB", { jobId: "job-A" });
    postMock.mockRejectedValueOnce(new TypeError("Failed to fetch"));

    const report = await flushQueue({ database: db });

    expect(report.interrupted).toBe(true);
    expect(await db.pendingActions.count()).toBe(1);
  });

  it("refuses to flush at all on an expired session, without dropping the queue", async () => {
    await queueOffline("SAVE_JOB", { jobId: "job-A" });
    tokenMock.mockReturnValue(tokenExpiring(Date.now() - 1000));

    const report = await flushQueue({ database: db });

    expect(report.interrupted).toBe(true);
    expect(postMock).not.toHaveBeenCalled();
    expect(await db.pendingActions.count()).toBe(1);
  });

  it("splits a queue larger than the server cap into chunks of 50", async () => {
    setOnline(false);
    for (let i = 0; i < 51; i++) {
      await perform("SAVE_JOB", { jobId: `job-${i}` }, { database: db });
    }
    setOnline(true);

    postMock.mockImplementation((_path: string, body: any) => ({
      results: body.actions.map((a: any) => ({
        idempotencyKey: a.idempotencyKey,
        status: "success",
      })),
    }));

    const report = await flushQueue({ database: db });

    expect(postMock).toHaveBeenCalledTimes(2);
    expect(postMock.mock.calls[0][1].actions).toHaveLength(50);
    expect(postMock.mock.calls[1][1].actions).toHaveLength(1);
    expect(report.succeeded).toBe(51);
  });
});
