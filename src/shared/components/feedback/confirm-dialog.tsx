"use client";

import React, { useState } from "react";
import { Modal } from "@/shared/components/ui/modal";
import { Button } from "@/shared/components/ui/button";
import { Alert } from "@/shared/components/feedback/alert";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  /** Secondary line under the title — say what actually happens, not "are you sure". */
  subtitle?: string;
  children?: React.ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  /** `danger` for destructive confirms, matching Button's own variants. */
  variant?: "primary" | "danger";
  onConfirm: () => void | Promise<unknown>;
}

/**
 * Confirmation modal for actions that destroy or overwrite something.
 *
 * There was no shared confirm before this — the two existing Modal callers each
 * hand-rolled a footer — so this is the pattern extracted rather than a third
 * variation. It owns the pending state so callers cannot leave a stuck spinner,
 * and it surfaces a failed confirm inline instead of closing as if it worked.
 */
export function ConfirmDialog({
  open,
  onClose,
  title,
  subtitle,
  children,
  confirmLabel,
  cancelLabel = "Cancel",
  variant = "primary",
  onConfirm,
}: ConfirmDialogProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const handleConfirm = async () => {
    setBusy(true);
    setError("");
    try {
      await onConfirm();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "That didn't work. Try again.");
    } finally {
      setBusy(false);
    }
  };

  const handleClose = () => {
    if (busy) return;
    setError("");
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={title}
      subtitle={subtitle}
      footer={
        <>
          <Button variant="ghost" onClick={handleClose} disabled={busy}>
            {cancelLabel}
          </Button>
          <Button
            variant={variant}
            onClick={handleConfirm}
            loading={busy}
            loadingText={confirmLabel}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        {children}
        {error && <Alert variant="error">{error}</Alert>}
      </div>
    </Modal>
  );
}
