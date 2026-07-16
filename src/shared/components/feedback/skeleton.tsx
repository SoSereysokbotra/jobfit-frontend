import React from "react";
import { cn } from "@/shared/utils/cn";

/** Pulsing placeholder block for loading states (dev rules §4.2). */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-md", className)}
      style={{ background: "var(--color-neutral-100)" }}
    />
  );
}

/** Skeleton shaped like a JobCard list row. */
export function JobCardSkeleton() {
  return (
    <div className="flex items-start gap-4 px-5 py-4">
      <Skeleton className="w-11 h-11 rounded-lg shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-2/5" />
        <Skeleton className="h-3 w-1/4" />
        <Skeleton className="h-3 w-3/5" />
      </div>
      <div className="flex flex-col gap-1.5 shrink-0">
        <Skeleton className="h-7 w-16" />
        <Skeleton className="h-7 w-16" />
      </div>
    </div>
  );
}
