import React from "react";
import { notFound } from "next/navigation";
import { jobApi } from "@/features/job/api/job.api";
import { toJobView } from "@/features/job/api/job.mappers";
import { ApiError } from "@/lib/api/client";
import {
  JobDetailHeader,
  MatchScoreWidget,
  JobDescriptionSections,
  JobCompanyInfo,
  JobRelatedList,
} from "@/features/job/components";
import { ApplyButton } from "@/features/application/components/apply-button";
import { SkillGapPanel } from "@/features/matching/components/skill-gap-panel";

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = await params;
  // Public endpoint. A 404 becomes Next's notFound(); anything else propagates.
  const dto = await jobApi.get(jobId).catch((err) => {
    if (err instanceof ApiError && err.statusCode === 404) return null;
    throw err;
  });

  if (!dto) {
    notFound();
  }
  const job = toJobView(dto);

  return (
    <div className="min-h-screen pb-12" style={{ background: "var(--color-bg-secondary)" }}>
      {/* Spacer for navigation */}
      <div className="h-8 lg:h-12" />

      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8 pb-24 lg:pb-0">
          {/* Main Content Column */}
          <div className="flex-1 space-y-6 min-w-0">
            <JobDetailHeader job={job} />
            <JobDescriptionSections job={job} />
            
            <div className="block lg:hidden">
              <JobCompanyInfo job={job} />
            </div>
          </div>

          {/* Sticky Sidebar Column */}
          <aside className="w-full lg:w-80 shrink-0">
            <div className="sticky top-24 space-y-6">
              {/* Desktop apply CTA (mobile uses the sticky bottom bar) */}
              <div
                className="hidden lg:block p-4 rounded-lg border"
                style={{ background: "var(--color-card)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-sm)" }}
              >
                <ApplyButton
                  jobId={job.id}
                  sourceType={job.sourceType}
                  externalUrl={job.externalUrl}
                />
              </div>

              {/* Both take jobId and fetch their own real data, rather than reading the
                  hardcoded job.match / job.industry defaults from toJobView. */}
              <MatchScoreWidget jobId={job.id} />

              <SkillGapPanel jobId={job.id} />

              <div className="hidden lg:block">
                <JobCompanyInfo job={job} />
              </div>
              
              <div className="hidden lg:block">
                <JobRelatedList currentJobId={job.id} />
              </div>
            </div>
          </aside>
        </div>
        
        {/* Mobile Action Area (Sticky Bottom) - placed above BottomTabBar */}
        <div 
          className="lg:hidden fixed bottom-16 left-0 right-0 p-3 sm:p-4 border-t shadow-lg z-30 flex gap-3 backdrop-blur-md"
          style={{
            background: "var(--color-card)",
            borderColor: "var(--color-border)",
            boxShadow: "0 -4px 16px rgba(0,0,0,0.08)",
          }}
        >
          <div className="flex-1">
            <ApplyButton
              jobId={job.id}
              sourceType={job.sourceType}
              externalUrl={job.externalUrl}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
