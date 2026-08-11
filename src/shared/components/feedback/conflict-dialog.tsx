"use client";

import React, { useState } from "react";
import { Modal } from "@/shared/components/ui/modal";
import { Button } from "@/shared/components/ui/button";
import {
  resolveDiscardMine,
  resolveKeepMine,
} from "@/lib/offline/mutation-queue";
import type { PendingAction } from "@/lib/offline/db";

interface ConflictDialogProps {
  action: PendingAction | null;
  onClose: () => void;
  onResolved: () => void;
}

/** Fields worth showing side by side — metadata would be noise. */
const HIDDEN_FIELDS = new Set([
  "id",
  "userId",
  "createdAt",
  "deletedAt",
  "expectedUpdatedAt",
]);

function readableLabel(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (c) => c.toUpperCase())
    .trim();
}

function displayValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

/**
 * Resolution UI for `status: "conflict"` from `POST /sync/batch`.
 *
 * Shows the server's record beside what the user tried to change. Both come
 * from the batch result (`serverVersion` / `clientAttempted`), which is why
 * this works even though the queue entry holds only the attempted change.
 *
 * There is deliberately no auto-retry: resending with a refreshed
 * `expectedUpdatedAt` without asking is last-write-wins with extra steps, and
 * silently discarding the user's edit is worse. Someone has to choose.
 */
export function ConflictDialog({ action, onClose, onResolved }: ConflictDialogProps) {
  const [busy, setBusy] = useState<"keep" | "discard" | null>(null);

  if (!action) return null;

  const serverVersion = (action.serverVersion ?? {}) as Record<string, unknown>;
  const clientAttempted = (action.clientAttempted ?? {}) as Record<string, unknown>;

  // Only the fields the user actually tried to change are worth comparing;
  // showing every column would bury the one that differs.
  const fields = Object.keys(clientAttempted).filter((key) => !HIDDEN_FIELDS.has(key));

  const run = async (which: "keep" | "discard") => {
    if (action.seq === undefined) return;
    setBusy(which);
    try {
      if (which === "keep") await resolveKeepMine(action.seq);
      else await resolveDiscardMine(action.seq);
      onResolved();
    } finally {
      setBusy(null);
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="This changed somewhere else"
      subtitle={
        action.conflictMessage ??
        "Someone updated this record after you made your change, so it wasn't applied."
      }
      footer={
        <>
          <Button
            variant="outline"
            onClick={() => run("discard")}
            loading={busy === "discard"}
            disabled={busy !== null}
          >
            Discard my change
          </Button>
          <Button
            variant="primary"
            onClick={() => run("keep")}
            loading={busy === "keep"}
            disabled={busy !== null}
          >
            Keep my version
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-3">
        <div className="text-xs font-semibold" style={{ color: "var(--color-text-tertiary)" }}>
          On the server now
        </div>
        <div className="text-xs font-semibold" style={{ color: "var(--color-text-tertiary)" }}>
          Your change
        </div>

        {fields.length === 0 && (
          <p className="col-span-2 text-xs" style={{ color: "var(--color-text-secondary)" }}>
            No field-level detail was returned for this change.
          </p>
        )}

        {fields.map((key) => (
          <React.Fragment key={key}>
            <div className="col-span-2 pt-2 text-xs font-semibold" style={{ color: "var(--color-text-secondary)" }}>
              {readableLabel(key)}
            </div>
            <div
              className="text-xs rounded-md border p-2 break-words"
              style={{
                borderColor: "var(--color-border)",
                background: "var(--color-bg-secondary)",
                color: "var(--color-text-primary)",
              }}
            >
              {displayValue(serverVersion[key])}
            </div>
            <div
              className="text-xs rounded-md border p-2 break-words"
              style={{
                borderColor: "var(--color-primary-200)",
                background: "var(--color-primary-50)",
                color: "var(--color-primary-900)",
              }}
            >
              {displayValue(clientAttempted[key])}
            </div>
          </React.Fragment>
        ))}
      </div>
    </Modal>
  );
}
