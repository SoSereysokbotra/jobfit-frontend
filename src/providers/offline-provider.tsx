"use client";

/**
 * Runtime glue for offline mode: connectivity state, the periodic pull, the
 * flush-on-reconnect, and the surfaces that tell the user about all three.
 *
 * The periodic sync is a TanStack `useQuery` with `refetchInterval` rather than
 * a `setInterval`, matching the polling already used for resume parsing
 * (`use-resumes.ts`). That also gets the "only while the tab is active" part for
 * free: `refetchIntervalInBackground` defaults to false, so a backgrounded tab
 * stops polling instead of syncing forever in someone's other window.
 */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLiveQuery } from "dexie-react-hooks";

import { useAuth } from "@/providers/auth-provider";
import { clearOfflineData, db, type PendingAction } from "@/lib/offline/db";
import { sync } from "@/lib/offline/sync-engine";
import { flushQueue, listConflicts } from "@/lib/offline/mutation-queue";
import { OfflineBanner } from "@/shared/components/feedback/offline-banner";
import { ConflictDialog } from "@/shared/components/feedback/conflict-dialog";

/** Five minutes: often enough to feel live, rare enough to be invisible. */
const SYNC_INTERVAL_MS = 5 * 60_000;

interface OfflineContextValue {
  isOnline: boolean;
  /** Queued mutations not yet accepted by the server. */
  pendingCount: number;
  /** Actions the server refused because the record moved on. */
  conflicts: PendingAction[];
  /** Open the resolution dialog for a specific conflict. */
  openConflict: (action: PendingAction) => void;
  /** Force a pull now (used after resolving a conflict). */
  syncNow: () => void;
}

const OfflineContext = createContext<OfflineContextValue | null>(null);

export function OfflineProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  const queryClient = useQueryClient();

  // Assume online until the browser says otherwise: rendering "offline" during
  // hydration on a perfectly good connection is worse than a beat of lag.
  const [isOnline, setIsOnline] = useState(true);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [activeConflict, setActiveConflict] = useState<PendingAction | null>(null);
  const [failures, setFailures] = useState<string[]>([]);

  const pendingCount = useLiveQuery(() => db.pendingActions.count(), [], 0) ?? 0;
  // Memoised so the fallback does not mint a new array identity every render,
  // which would make the context value change on every render too.
  const liveConflicts = useLiveQuery(() => listConflicts(), [], [] as PendingAction[]);
  const conflicts = useMemo(() => liveConflicts ?? [], [liveConflicts]);

  // ── Connectivity ───────────────────────────────────────────────────────────
  useEffect(() => {
    setIsOnline(navigator.onLine);
    const goOnline = () => setIsOnline(true);
    const goOffline = () => {
      setIsOnline(false);
      setBannerDismissed(false); // a new disconnection is worth mentioning again
    };
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  // ── A cache is per-user ────────────────────────────────────────────────────
  // Same reasoning as the query cache reset in AuthProvider.login: a new
  // identity must inherit nothing. Keyed on the id so a re-render never wipes.
  const lastUserId = useRef<string | null>(null);
  useEffect(() => {
    const id = user?.id ?? null;
    if (lastUserId.current && lastUserId.current !== id) {
      void clearOfflineData();
    }
    lastUserId.current = id;
  }, [user?.id]);

  // ── Pull ───────────────────────────────────────────────────────────────────
  const { refetch } = useQuery({
    queryKey: ["offline", "sync", user?.id ?? "anon"],
    queryFn: async () => {
      const outcome = await sync();
      return outcome.failures.length;
    },
    enabled: isAuthenticated && isOnline,
    refetchInterval: SYNC_INTERVAL_MS,
    refetchOnWindowFocus: true,
    // A sync failure is handled inside `sync` per resource; retrying the whole
    // thing here would just multiply the requests.
    retry: false,
    staleTime: 60_000,
  });

  const syncNow = useCallback(() => {
    void refetch();
  }, [refetch]);

  // ── Push, on reconnect ─────────────────────────────────────────────────────
  const flushing = useRef(false);
  const runFlush = useCallback(async () => {
    if (flushing.current || !isAuthenticated) return;
    flushing.current = true;
    try {
      const report = await flushQueue();
      if (report.failed.length > 0) {
        setFailures((prev) => [...prev, ...report.failed.map((f) => f.message)]);
      }
      if (report.succeeded > 0) {
        // Adopt the server's canonical rows, then let the app re-read them.
        await sync();
        await queryClient.invalidateQueries();
      }
    } finally {
      flushing.current = false;
    }
  }, [isAuthenticated, queryClient]);

  useEffect(() => {
    if (isOnline && isAuthenticated) void runFlush();
  }, [isOnline, isAuthenticated, runFlush]);

  const value = useMemo<OfflineContextValue>(
    () => ({
      isOnline,
      pendingCount,
      conflicts,
      openConflict: setActiveConflict,
      syncNow,
    }),
    [isOnline, pendingCount, conflicts, syncNow],
  );

  return (
    <OfflineContext.Provider value={value}>
      {children}

      <OfflineBanner
        show={!isOnline && !bannerDismissed}
        failures={failures}
        onDismiss={() => setBannerDismissed(true)}
        onDismissFailures={() => setFailures([])}
      />

      <ConflictDialog
        action={activeConflict}
        onClose={() => setActiveConflict(null)}
        onResolved={() => {
          setActiveConflict(null);
          syncNow();
        }}
      />
    </OfflineContext.Provider>
  );
}

/**
 * Offline state. Returns null outside the provider rather than throwing, so a
 * component can render in isolation (Storybook, the marketing layout) without
 * being forced to mount the whole offline stack.
 */
export function useOffline(): OfflineContextValue | null {
  return useContext(OfflineContext);
}
