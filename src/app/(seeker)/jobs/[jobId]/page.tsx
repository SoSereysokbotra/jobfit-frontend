import React from "react";
import { notFound } from "next/navigation";
import { fetchJobById } from "@/features/job/api/job.api";
import {
  JobDetailHeader,
  MatchScoreWidget,
  JobDescriptionSections,
  JobCompanyInfo,
  JobRelatedList,
} from "@/features/job/components";

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = await params;
  const job = await fetchJobById(jobId);

  if (!job) {
    notFound();
  }

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
              <MatchScoreWidget job={job} />

              <div className="hidden lg:block">
                <JobCompanyInfo job={job} />
              </div>
              
              <div className="hidden lg:block">
                <JobRelatedList currentJobId={job.id} />
              </div>
            </div>
          </aside>
        </div>
        
        {/* Mobile Action Area (Sticky Bottom) */}
        <div 
          className="lg:hidden fixed bottom-0 left-0 right-0 p-4 border-t shadow-lg z-10 flex gap-3 bg-white"
          style={{ borderColor: "var(--color-border)" }}
        >
          <button
            className="flex-1 py-3 rounded-md text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 active:scale-[0.97]"
            style={{ background: "var(--color-primary-600)" }}
          >
            Apply Now
          </button>
          <button
            className="w-14 h-12 flex items-center justify-center rounded-md border-2 transition-all duration-200 hover:opacity-90 active:scale-[0.97]"
            style={{
              borderColor: "var(--color-border)",
              color: "var(--color-text-secondary)",
              background: "transparent",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </button>
        </div>
      </main>
    </div>
  );
}
