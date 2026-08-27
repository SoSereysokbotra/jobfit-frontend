"use client";

import React from "react";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react";
import { useToastStore, toast, type ToastType, type ToastMessage } from "@/stores/toast-store";
import { cn } from "@/shared/utils/cn";
import { motion, AnimatePresence } from "framer-motion";

const ICONS: Record<ToastType, React.ElementType> = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const BORDER_COLORS: Record<ToastType, string> = {
  success: "border-green-500/20",
  error: "border-red-500/20",
  warning: "border-amber-500/20",
  info: "border-blue-500/20",
};

const BG_COLORS: Record<ToastType, string> = {
  success: "bg-green-50",
  error: "bg-red-50",
  warning: "bg-amber-50",
  info: "bg-blue-50",
};

const ICON_COLORS: Record<ToastType, string> = {
  success: "text-green-500",
  error: "text-red-500",
  warning: "text-amber-500",
  info: "text-blue-500",
};

function ToastItem({ item }: { item: ToastMessage }) {
  const Icon = ICONS[item.type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      role="status"
      aria-live="polite"
      className={cn(
        "pointer-events-auto flex w-full min-w-[300px] max-w-sm items-start gap-3 rounded-xl border p-4",
        "bg-white", // Solid light base
        BORDER_COLORS[item.type],
        BG_COLORS[item.type]
      )}
    >
      <div className={cn("mt-0.5 shrink-0", ICON_COLORS[item.type])}>
        <Icon size={20} className="animate-in zoom-in duration-300" />
      </div>
      
      <div className="flex-1 min-w-0 space-y-1">
        {item.title && (
          <h4 className="text-sm font-semibold text-neutral-900">
            {item.title}
          </h4>
        )}
        <p className="text-sm text-neutral-600 leading-relaxed">
          {item.message}
        </p>
      </div>

      <button
        onClick={() => toast.dismiss(item.id)}
        aria-label="Dismiss notification"
        className="shrink-0 rounded-md p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
      >
        <X size={16} />
      </button>
    </motion.div>
  );
}

export function ToastContainer() {
  const toasts = useToastStore();

  return (
    <div
      className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-50 flex max-h-screen w-full max-w-md flex-col justify-end gap-2 p-4 pointer-events-none"
      style={{ zIndex: "var(--z-toast, 400)" as unknown as number }}
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => (
          <ToastItem key={t.id} item={t} />
        ))}
      </AnimatePresence>
    </div>
  );
}
