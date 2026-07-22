"use client";

import React from "react";
import Link from "next/link";
import { GraduationCap, Sparkles } from "lucide-react";
import { useLearningPath } from "@/features/learning/hooks/use-learning";
import { LearningPathCard } from "@/features/learning/components/learning-path-card";
import { ProgressTracker } from "@/features/learning/components/progress-tracker";
import { EmptyState } from "@/shared/components/data-display/empty-state";
import { Skeleton } from "@/shared/components/feedback/skeleton";
import { Alert } from "@/shared/components/feedback/alert";

export default function LearningPage() {
  const { data, isLoading, isError, error } = useLearningPath();

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 min-h-full" style={{ background: "var(--color-bg-secondary)" }}>
      <div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--color-text-primary)" }}>
          Learning Path
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
          Close your skill gaps with curated resources for in-demand skills.
        </p>
      </div>

      {isError && <Alert variant="error">{error instanceof Error ? error.message : "Could not load your learning path."}</Alert>}

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-40 rounded-lg" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-48 rounded-lg" />)}</div>
        </div>
      ) : !data ? null : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* <div className="lg:col-span-1">
              <ProgressTracker currentCount={data.currentSkills.length} gapCount={data.gapSkills.length} />
            </div> */}

            {/* Current skills */}
            <div
              className="lg:col-span-2 rounded-lg border p-5"
              style={{ background: "var(--color-card)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-sm)" }}
            >
              <div className="flex items-center gap-2 mb-3">
                <GraduationCap size={18} style={{ color: "var(--color-primary-600)" }} />
                <h2 className="text-base font-bold" style={{ color: "var(--color-text-primary)" }}>Your Skills</h2>
              </div>
              {data.currentSkills.length === 0 ? (
                <p className="text-sm" style={{ color: "var(--color-text-tertiary)" }}>
                  You haven&apos;t added any skills yet.{" "}
                  <Link href="/profile" className="font-semibold hover:underline" style={{ color: "var(--color-primary-600)" }}>
                    Add skills to your profile
                  </Link>{" "}
                  for tailored recommendations.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {data.currentSkills.map((s) => (
                    <span key={s} className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: "var(--color-primary-50)", color: "var(--color-primary-700)" }}>
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recommended gaps */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-base font-bold" style={{ color: "var(--color-text-primary)" }}>Recommended for you</h2>
            </div>
            {data.gapSkills.length === 0 ? (
              <EmptyState
                icon={<GraduationCap size={26} />}
                title="You're all caught up!"
                description="You already have all the in-demand skills we track. Great work."
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.gapSkills.map((rec) => (
                  <LearningPathCard key={rec.skill} recommendation={rec} />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
