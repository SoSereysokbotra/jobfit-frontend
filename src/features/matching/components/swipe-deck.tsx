"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  Heart,
  X,
  RotateCcw,
  MapPin,
  DollarSign,
  ExternalLink,
  Sparkles,
  Layers,
} from "lucide-react";
import type { Job } from "@/shared/types/shared.types";
import { formatSalaryRange } from "@/shared/types/shared.types";
import { AppliedPill } from "@/features/application/components/applied-pill";
import { useMatchFeedback } from "../hooks/use-match-feedback";

interface SwipeDeckProps {
  jobs: Job[];
  onApply?: (id: string) => void;
  onViewList?: () => void;
}

const SWIPE_THRESHOLD = 110;

export function SwipeDeck({ jobs, onApply, onViewList }: SwipeDeckProps) {
  const { handleSwipe, handleUndo, canUndo, history } = useMatchFeedback();

  // Track swiped indices in this session
  const [swipedIndices, setSwipedIndices] = useState<Set<number>>(new Set());

  // Drag physics state
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [flyOutDirection, setFlyOutDirection] = useState<"left" | "right" | null>(null);

  // Reduced motion preference
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      setPrefersReducedMotion(mediaQuery.matches);
      const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
      mediaQuery.addEventListener("change", listener);
      return () => mediaQuery.removeEventListener("change", listener);
    }
  }, []);

  const cardRef = useRef<HTMLDivElement>(null);
  const startPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Get active unswiped jobs list
  const activeJobs = jobs.filter((_, idx) => !swipedIndices.has(idx));
  const currentJob = activeJobs[0];

  // Perform swipe action
  const triggerSwipe = useCallback(
    (action: "save" | "dismiss") => {
      if (!currentJob) return;

      const targetJob = currentJob;
      const targetJobOriginalIndex = jobs.findIndex((j) => j.id === targetJob.id);

      if (prefersReducedMotion) {
        handleSwipe(targetJob.id, action);
        if (targetJobOriginalIndex !== -1) {
          setSwipedIndices((prev) => new Set(prev).add(targetJobOriginalIndex));
        }
        setDragOffset({ x: 0, y: 0 });
        setFlyOutDirection(null);
        return;
      }

      setFlyOutDirection(action === "save" ? "right" : "left");

      setTimeout(() => {
        handleSwipe(targetJob.id, action);
        if (targetJobOriginalIndex !== -1) {
          setSwipedIndices((prev) => new Set(prev).add(targetJobOriginalIndex));
        }
        setDragOffset({ x: 0, y: 0 });
        setFlyOutDirection(null);
      }, 220);
    },
    [currentJob, jobs, prefersReducedMotion, handleSwipe]
  );

  // Perform undo action
  const triggerUndo = useCallback(() => {
    const lastEntry = handleUndo();
    if (!lastEntry) return;

    const originalIdx = jobs.findIndex((j) => j.id === lastEntry.jobId);
    if (originalIdx !== -1) {
      setSwipedIndices((prev) => {
        const next = new Set(prev);
        next.delete(originalIdx);
        return next;
      });
    }
  }, [handleUndo, jobs]);

  // Pointer event handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    if (flyOutDirection) return;
    setIsDragging(true);
    startPosRef.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || flyOutDirection) return;
    const dx = e.clientX - startPosRef.current.x;
    const dy = e.clientY - startPosRef.current.y;
    setDragOffset({ x: dx, y: dy * 0.4 }); // Dampen vertical movement
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging || flyOutDirection) return;
    setIsDragging(false);

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }

    if (dragOffset.x > SWIPE_THRESHOLD) {
      triggerSwipe("save");
    } else if (dragOffset.x < -SWIPE_THRESHOLD) {
      triggerSwipe("dismiss");
    } else {
      // Snap back
      setDragOffset({ x: 0, y: 0 });
    }
  };

  const handlePointerCancel = () => {
    setIsDragging(false);
    setDragOffset({ x: 0, y: 0 });
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        triggerSwipe("dismiss");
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        triggerSwipe("save");
      } else if ((e.key === "z" || e.key === "Z") && (e.metaKey || e.ctrlKey || canUndo)) {
        e.preventDefault();
        triggerUndo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [triggerSwipe, triggerUndo, canUndo]);

  // Compute transform & stamps opacity
  const rotation = (dragOffset.x / 300) * 14;
  const saveOpacity = Math.min(1, Math.max(0, (dragOffset.x - 20) / (SWIPE_THRESHOLD - 20)));
  const passOpacity = Math.min(1, Math.max(0, (-dragOffset.x - 20) / (SWIPE_THRESHOLD - 20)));

  // Deck finished empty state
  if (activeJobs.length === 0) {
    const savedCount = history.filter((h) => h.action === "save").length;
    const dismissedCount = history.filter((h) => h.action === "dismiss").length;

    return (
      <div
        className="w-full max-w-md mx-auto rounded-2xl border p-8 text-center animate-fade-in"
        style={{
          background: "var(--color-card)",
          borderColor: "var(--color-border)",
          boxShadow: "var(--shadow-lg)",
        }}
      >
        <div
          className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4"
          style={{
            background: "linear-gradient(135deg, var(--color-primary-50), var(--color-primary-100))",
          }}
        >
          <Sparkles size={32} style={{ color: "var(--color-primary-600)" }} />
        </div>
        <h2 className="text-xl font-extrabold" style={{ color: "var(--color-text-primary)" }}>
          You&apos;re All Caught Up!
        </h2>
        <p className="text-sm mt-2" style={{ color: "var(--color-text-secondary)" }}>
          You&apos;ve reviewed all recommended jobs in your deck.
        </p>

        {history.length > 0 && (
          <div
            className="grid grid-cols-2 gap-3 my-6 p-4 rounded-xl border"
            style={{
              background: "var(--color-bg-secondary)",
              borderColor: "var(--color-border)",
            }}
          >
            <div>
              <p className="text-2xl font-extrabold" style={{ color: "var(--color-success-600)" }}>
                {savedCount}
              </p>
              <p className="text-xs font-semibold" style={{ color: "var(--color-text-tertiary)" }}>
                Jobs Saved
              </p>
            </div>
            <div>
              <p className="text-2xl font-extrabold" style={{ color: "var(--color-text-tertiary)" }}>
                {dismissedCount}
              </p>
              <p className="text-xs font-semibold" style={{ color: "var(--color-text-tertiary)" }}>
                Passed
              </p>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {canUndo && (
            <button
              onClick={triggerUndo}
              className="w-full py-2.5 rounded-lg border text-sm font-semibold flex items-center justify-center gap-2 hover:bg-neutral-50 transition-colors"
              style={{
                borderColor: "var(--color-border)",
                color: "var(--color-text-primary)",
              }}
            >
              <RotateCcw size={16} /> Undo last card
            </button>
          )}

          <button
            onClick={() => {
              setSwipedIndices(new Set());
            }}
            className="w-full py-2.5 rounded-lg text-sm font-bold text-white transition-all hover:opacity-90 active:scale-98"
            style={{ background: "var(--color-primary-600)" }}
          >
            Review deck again
          </button>

          {onViewList && (
            <button
              onClick={onViewList}
              className="w-full py-2 rounded-lg text-xs font-semibold hover:underline"
              style={{ color: "var(--color-text-tertiary)" }}
            >
              Switch back to list view
            </button>
          )}
        </div>
      </div>
    );
  }

  // Get preview cards behind current
  const backgroundCard1 = activeJobs[1];
  const backgroundCard2 = activeJobs[2];

  let transformStyle = "none";
  const transitionStyle = isDragging ? "none" : "transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)";

  if (flyOutDirection === "right") {
    transformStyle = "translate3d(500px, 40px, 0) rotate(25deg)";
  } else if (flyOutDirection === "left") {
    transformStyle = "translate3d(-500px, 40px, 0) rotate(-25deg)";
  } else if (isDragging || dragOffset.x !== 0 || dragOffset.y !== 0) {
    transformStyle = `translate3d(${dragOffset.x}px, ${dragOffset.y}px, 0) rotate(${rotation}deg)`;
  }

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center select-none pb-6">
      {/* Top Session / Feature Notice */}
      <div
        className="w-full flex items-center justify-between px-4 py-2 mb-4 rounded-lg border text-xs"
        style={{
          background: "var(--color-primary-50)",
          borderColor: "var(--color-primary-200)",
          color: "var(--color-primary-700)",
        }}
      >
        <span className="flex items-center gap-1.5 font-medium">
          <Layers size={14} /> Card Deck Triage
        </span>
        <span className="text-[11px] font-bold">
          {activeJobs.length} remaining
        </span>
      </div>

      {/* Card Stack Container */}
      <div className="relative w-full h-[510px] flex items-center justify-center">
        {/* Layer 3: Background card 2 */}
        {backgroundCard2 && (
          <div
            className="absolute inset-x-4 top-6 bottom-0 rounded-2xl border pointer-events-none transition-all duration-300"
            style={{
              background: "var(--color-card)",
              borderColor: "var(--color-border)",
              transform: "scale(0.90) translateY(18px)",
              opacity: 0.45,
              zIndex: 1,
            }}
          />
        )}

        {/* Layer 2: Background card 1 */}
        {backgroundCard1 && (
          <div
            className="absolute inset-x-2 top-3 bottom-0 rounded-2xl border p-6 pointer-events-none transition-all duration-300 overflow-hidden"
            style={{
              background: "var(--color-card)",
              borderColor: "var(--color-border)",
              transform: "scale(0.95) translateY(9px)",
              opacity: 0.75,
              boxShadow: "var(--shadow-md)",
              zIndex: 2,
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-extrabold text-lg shrink-0"
                  style={{ background: backgroundCard1.logoBg }}
                >
                  {backgroundCard1.logo}
                </div>
                <div>
                  <h3 className="text-base font-bold truncate max-w-[200px]" style={{ color: "var(--color-text-primary)" }}>
                    {backgroundCard1.title}
                  </h3>
                  <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
                    {backgroundCard1.company}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Layer 1: Active Interactive Top Card */}
        <div
          ref={cardRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          className="absolute inset-0 rounded-2xl border p-6 flex flex-col justify-between cursor-grab active:cursor-grabbing touch-none z-10"
          style={{
            background: "var(--color-card)",
            borderColor: "var(--color-border)",
            boxShadow: "var(--shadow-xl)",
            transform: transformStyle,
            transition: transitionStyle,
          }}
        >
          {/* Stamp Badges (Visible during drag) */}
          <div
            className="absolute top-6 left-6 px-4 py-1.5 rounded-lg border-2 font-black text-sm tracking-wider uppercase transform -rotate-12 pointer-events-none transition-opacity"
            style={{
              borderColor: "var(--color-success-600)",
              color: "var(--color-success-600)",
              background: "rgba(235, 248, 238, 0.9)",
              opacity: saveOpacity,
            }}
          >
            SAVE ✓
          </div>

          <div
            className="absolute top-6 right-6 px-4 py-1.5 rounded-lg border-2 font-black text-sm tracking-wider uppercase transform rotate-12 pointer-events-none transition-opacity"
            style={{
              borderColor: "var(--color-neutral-400)",
              color: "var(--color-neutral-600)",
              background: "rgba(245, 245, 245, 0.9)",
              opacity: passOpacity,
            }}
          >
            PASS ✕
          </div>

          {/* Card Header: Company, Title, and Match Ring */}
          <div>
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-extrabold text-xl shrink-0 shadow-sm"
                  style={{ background: currentJob.logoBg }}
                >
                  {currentJob.logo}
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-tertiary)" }}>
                    {currentJob.company}
                  </span>
                  <Link
                    href={`/jobs/${currentJob.id}`}
                    className="block text-lg font-extrabold leading-tight hover:underline truncate mt-0.5"
                    style={{ color: "var(--color-text-primary)" }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {currentJob.title}
                  </Link>
                </div>
              </div>

              {/* Match Score Badge Widget */}
              <div className="flex flex-col items-center shrink-0">
                <div className="relative w-14 h-14">
                  <svg className="w-14 h-14 -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-neutral-100"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      style={{
                        color:
                          currentJob.match >= 90
                            ? "var(--color-success-600)"
                            : currentJob.match >= 75
                            ? "var(--color-primary-500)"
                            : "var(--color-warning-600)",
                      }}
                      strokeWidth="3.5"
                      strokeDasharray={`${currentJob.match}, 100`}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xs font-black leading-none" style={{ color: "var(--color-text-primary)" }}>
                      {currentJob.match}%
                    </span>
                    <span className="text-[8px] font-bold uppercase tracking-tighter" style={{ color: "var(--color-text-secondary)" }}>
                      Fit
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Key Meta Pills */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span
                className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full"
                style={{ background: "var(--color-success-50)", color: "var(--color-success-600)" }}
              >
                <DollarSign size={12} /> {formatSalaryRange(currentJob)}
              </span>
              <span
                className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full"
                style={{ background: "var(--color-neutral-100)", color: "var(--color-text-secondary)" }}
              >
                <MapPin size={12} /> {currentJob.location}
              </span>
              <span
                className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full"
                style={{
                  background: currentJob.remote === "Remote" ? "var(--color-primary-50)" : "var(--color-neutral-100)",
                  color: currentJob.remote === "Remote" ? "var(--color-primary-700)" : "var(--color-text-secondary)",
                }}
              >
                {currentJob.remote}
              </span>
              {currentJob.type && (
                <span
                  className="text-xs font-medium px-2 py-0.5 rounded-full"
                  style={{ background: "var(--color-neutral-100)", color: "var(--color-text-secondary)" }}
                >
                  {currentJob.type}
                </span>
              )}
            </div>

            {/* Match Reason or Highlights */}
            {currentJob.matchReason && (
              <div
                className="p-3 rounded-lg border text-xs mb-3 flex items-start gap-2"
                style={{
                  background: "var(--color-bg-secondary)",
                  borderColor: "var(--color-border)",
                  color: "var(--color-text-secondary)",
                }}
              >
                <Sparkles size={14} className="text-primary-600 mt-0.5 shrink-0" />
                <span className="line-clamp-2 leading-relaxed">{currentJob.matchReason}</span>
              </div>
            )}

            {/* Description snippet */}
            <p className="text-xs line-clamp-3 leading-relaxed" style={{ color: "var(--color-text-tertiary)" }}>
              {currentJob.description}
            </p>
          </div>

          {/* Card Footer Info */}
          <div className="pt-4 border-t" style={{ borderColor: "var(--color-neutral-100)" }}>
            <div className="flex items-center justify-between">
              <Link
                href={`/jobs/${currentJob.id}`}
                className="text-xs font-bold flex items-center gap-1 hover:underline"
                style={{ color: "var(--color-primary-600)" }}
                onClick={(e) => e.stopPropagation()}
              >
                Full details <ExternalLink size={12} />
              </Link>
              {onApply && (
                <AppliedPill jobId={currentJob.id}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onApply(currentJob.id);
                    }}
                    className="px-3 py-1 rounded-md text-xs font-bold text-white transition-opacity hover:opacity-90"
                    style={{ background: "var(--color-primary-600)" }}
                  >
                    Quick Apply
                  </button>
                </AppliedPill>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action Controls Bar */}
      <div className="flex items-center justify-center gap-5 mt-6">
        {/* Pass Button (Swipe Left) */}
        <button
          onClick={() => triggerSwipe("dismiss")}
          className="w-14 h-14 rounded-full border flex items-center justify-center text-neutral-500 hover:text-red-600 hover:border-red-300 hover:bg-red-50 active:scale-95 transition-all shadow-sm"
          style={{ background: "var(--color-card)", borderColor: "var(--color-border)" }}
          aria-label="Pass / Dismiss job (Left arrow)"
          title="Pass / Dismiss (←)"
        >
          <X size={24} />
        </button>

        {/* Undo Button */}
        <button
          onClick={triggerUndo}
          disabled={!canUndo}
          className="w-10 h-10 rounded-full border flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-neutral-100 active:scale-95"
          style={{
            background: "var(--color-card)",
            borderColor: "var(--color-border)",
            color: "var(--color-text-secondary)",
          }}
          aria-label="Undo last swipe (Z)"
          title="Undo last swipe (Z)"
        >
          <RotateCcw size={16} />
        </button>

        {/* Save Button (Swipe Right) */}
        <button
          onClick={() => triggerSwipe("save")}
          className="w-14 h-14 rounded-full border flex items-center justify-center text-primary-600 hover:text-white hover:bg-primary-600 hover:border-primary-600 active:scale-95 transition-all shadow-md"
          style={{
            background: "var(--color-card)",
            borderColor: "var(--color-primary-300)",
          }}
          aria-label="Save job (Right arrow)"
          title="Save job (→)"
        >
          <Heart size={24} className="fill-current" />
        </button>
      </div>

      {/* Keyboard Shortcuts Hint */}
      <div className="flex items-center gap-4 mt-4 text-[11px] text-neutral-400">
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 bg-neutral-100 border rounded font-mono text-[10px]">←</kbd> Pass
        </span>
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 bg-neutral-100 border rounded font-mono text-[10px]">Z</kbd> Undo
        </span>
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 bg-neutral-100 border rounded font-mono text-[10px]">→</kbd> Save
        </span>
      </div>
    </div>
  );
}
