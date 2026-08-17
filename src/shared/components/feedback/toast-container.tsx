"use client";

import React from "react";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react";
import { useToastStore, toast, type ToastType, type ToastMessage } from "@/stores/toast-store";
import { cn } from "@/shared/utils/cn";

const ICONS: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 size={18} className="text-success-600 shrink-0" />,
  error: <AlertCircle size={18} className="text-error-600 shrink-0" />,
  warning: <AlertTriangle size={18} className="text-warning-600 shrink-0" />,
  info: <Info size={18} className="text-info-600 shrink-0" />,
};

const BORDER_COLORS: Record<ToastType, string> = {
  success: "var(--color-success-500)",
  error: "var(--color-error-500)",
  warning: "var(--color-warning-500)",
  info: "var(--color-info-500)",
};

function ToastItem({ item }: { item: ToastMessage }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex items-start gap-3 p-4 rounded-xl border shadow-lg transition-all duration-300 animate-slide-up min-w-[300px] max-w-md pointer-events-auto"
      )}
      style={{
        background: "var(--color-card)",
        borderColor: "var(--color-border)",
        borderLeftWidth: "4px",
        borderLeftColor: BORDER_COLORS[item.type],
        boxShadow: "var(--shadow-xl)",
      }}
    >
      {ICONS[item.type]}
      <div className="flex-1 min-w-0">
        {item.title && (
          <h4 className="text-sm font-bold leading-none mb-1" style={{ color: "var(--color-text-primary)" }}>
            {item.title}
          </h4>
        )}
        <p className="text-xs leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
          {item.message}
        </p>
      </div>
      <button
        onClick={() => toast.dismiss(item.id)}
        aria-label="Dismiss notification"
        className="p-1 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors shrink-0"
        style={{ color: "var(--color-text-tertiary)" }}
      >
        <X size={14} />
      </button>
    </div>
  );
}

export function ToastContainer() {
  const toasts = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-5 right-5 flex flex-col gap-2.5 pointer-events-none p-4 max-w-full"
      style={{ zIndex: "var(--z-toast, 400)" as unknown as number }}
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} item={t} />
      ))}
    </div>
  );
}
