"use client";

import React, { useState } from "react";
import { Archive, Plus, RotateCcw, Trash2 } from "lucide-react";
import { ApiError } from "@/lib/api/client";
import { Alert } from "@/shared/components/feedback/alert";
import { EmptyState } from "@/shared/components/data-display/empty-state";
import { TrackerBoard } from "@/features/job-tracker/components/tracker-board";
import { TrackerCardModal } from "@/features/job-tracker/components/tracker-card-modal";
import {
  emptyBoard,
  type TrackedJob,
  type TrackerStage,
} from "@/features/job-tracker/api/tracker.api";
import {
  useAddTrackedJob,
  useArchivedTrackedJobs,
  useMoveTrackedJob,
  useTrackedJobActions,
  useTrackerBoard,
  useUpdateTrackedJob,
} from "@/features/job-tracker/hooks/use-tracker";

/**
 * Job Tracker — the board for jobs applied to on other sites.
 *
 * Separate from /applications on purpose: an application is a record of what an EMPLOYER
 * decided and its status is theirs to set, while everything here is the user's own note
 * about a hunt happening somewhere JobFits cannot see.
 */
export default function TrackerPage() {
  const { data: board = emptyBoard(), isPending, error } = useTrackerBoard();
  const move = useMoveTrackedJob();
  const add = useAddTrackedJob();
  const update = useUpdateTrackedJob();
  const actions = useTrackedJobActions();

  const [showArchived, setShowArchived] = useState(false);
  const { data: archived = [] } = useArchivedTrackedJobs(showArchived);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<TrackedJob | null>(null);

  const openAdd = () => {
    setEditing(null);
    setModalOpen(true);
  };
  const openEdit = (job: TrackedJob) => {
    setEditing(job);
    setModalOpen(true);
  };

  /** The backend's own words when it refuses — "That job is already on your tracker." */
  const message = (e: unknown): string | null =>
    e ? (e instanceof ApiError ? e.message : "Something went wrong. Please try again.") : null;

  const formError = message(add.error) ?? message(update.error);
  const boardError = message(move.error) ?? message(error);

  return (
    <div
      className="p-4 sm:p-6 lg:p-8 space-y-5 min-h-full"
      style={{ background: "var(--color-bg-secondary)" }}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ color: "var(--color-text-primary)" }}
          >
            Job Tracker
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
            Jobs you are chasing elsewhere. Drag a card to move it as things progress.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowArchived((v) => !v)}
            className="px-3 py-2 rounded-md text-xs font-semibold border inline-flex items-center gap-1.5 transition-colors"
            style={{
              borderColor: "var(--color-border)",
              background: showArchived ? "var(--color-primary-50)" : "var(--color-card)",
              color: "var(--color-text-secondary)",
            }}
          >
            <Archive size={14} /> Archived
            {archived.length > 0 && ` (${archived.length})`}
          </button>
          <button
            onClick={openAdd}
            className="px-4 py-2 rounded-md text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 transition-all active:scale-95 inline-flex items-center gap-1.5"
          >
            <Plus size={14} /> Add Job
          </button>
        </div>
      </div>

      {/* A refused move is shown rather than swallowed — the optimistic card has already
          snapped back, so without this the board just twitches for no visible reason. */}
      {boardError && <Alert variant="error">{boardError}</Alert>}

      {showArchived ? (
        <ArchivedList
          jobs={archived}
          onRestore={actions.restore}
          onRemove={actions.remove}
        />
      ) : isPending ? (
        <p className="text-sm" style={{ color: "var(--color-text-tertiary)" }}>
          Loading your board…
        </p>
      ) : board.total === 0 ? (
        <EmptyState
          icon={<Plus size={26} />}
          title="Nothing on your tracker yet"
          description="Applied for something on bongthom, JobNet or anywhere else? Add it here and move it along as you hear back."
          action={
            <button
              onClick={openAdd}
              className="px-4 py-2 rounded-md text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 transition-all inline-flex items-center gap-1.5"
            >
              <Plus size={13} /> Add your first job
            </button>
          }
        />
      ) : (
        <TrackerBoard
          board={board}
          onMove={(id, stage, position) => move.mutate({ id, stage, position })}
          onEdit={openEdit}
          onArchive={actions.archive}
          onRemove={actions.remove}
        />
      )}

      <TrackerCardModal
        open={modalOpen}
        job={editing}
        error={formError}
        onClose={() => setModalOpen(false)}
        onAdd={(input) =>
          add.mutate(input, {
            // Only close on success — a refusal must leave the form up with what they typed.
            onSuccess: () => setModalOpen(false),
          })
        }
        onSave={(id, input) =>
          update.mutate({ id, input }, { onSuccess: () => setModalOpen(false) })
        }
        onMoveStage={(id, stage: TrackerStage) => move.mutate({ id, stage })}
      />
    </div>
  );
}

function ArchivedList({
  jobs,
  onRestore,
  onRemove,
}: {
  jobs: TrackedJob[];
  onRestore: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  if (jobs.length === 0) {
    return (
      <EmptyState
        icon={<Archive size={26} />}
        title="Nothing archived"
        description="Cards you archive are kept here instead of being deleted, so you can put them back."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {jobs.map((job) => (
        <div
          key={job.id}
          className="rounded-lg border p-3 flex items-start justify-between gap-2"
          style={{ background: "var(--color-card)", borderColor: "var(--color-border)" }}
        >
          <div className="min-w-0">
            <p className="text-xs truncate" style={{ color: "var(--color-text-tertiary)" }}>
              {job.title}
            </p>
            <p
              className="text-sm font-bold truncate"
              style={{ color: "var(--color-text-primary)" }}
            >
              {job.companyName}
            </p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => onRestore(job.id)}
              aria-label="Put this card back on the board"
              title="Restore"
              className="p-1.5 rounded hover:bg-neutral-100"
              style={{ color: "var(--color-text-secondary)" }}
            >
              <RotateCcw size={14} />
            </button>
            <button
              onClick={() => onRemove(job.id)}
              aria-label="Delete permanently"
              title="Delete"
              className="p-1.5 rounded hover:bg-error-50"
              style={{ color: "var(--color-error-500)" }}
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
