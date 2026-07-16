import React from "react";
import { notFound } from "next/navigation";
import { fetchJobById } from "@/features/job/api/job.api";
import { JobDetailHeader, MatchScoreWidget } from "@/features/job/components";

export default async function JobDetailPage({
  params,
}: {
  params: { jobId: string };
}) {
  const job = await fetchJobById(params.jobId);

  if (!job) {
    notFound();
  }

  return (
    <div className="min-h-screen pb-12" style={{ background: "var(--color-bg-secondary)" }}>
      {/* Spacer for a theoretical navigation bar if not globally applied */}
      <div className="h-16" />

      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content Column */}
          <div className="flex-1 space-y-6 min-w-0">
            <JobDetailHeader job={job} />

            <div
              className="p-6 rounded-lg border"
              style={{
                background: "var(--color-card)",
                borderColor: "var(--color-border)",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <h2
                className="text-xl font-bold mb-4"
                style={{ color: "var(--color-text-primary)" }}
              >
                About the role
              </h2>
              <div
                className="text-base space-y-4"
                style={{ color: "var(--color-text-secondary)", lineHeight: "1.65" }}
              >
                {/* Mock formatted description text */}
                <p>{job.description}</p>
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
                  eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                  enim ad minim veniam, quis nostrud exercitation ullamco laboris
                  nisi ut aliquip ex ea commodo consequat.
                </p>
                <h3
                  className="text-lg font-semibold mt-6 mb-2"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  Key Responsibilities
                </h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    Duis aute irure dolor in reprehenderit in voluptate velit esse
                    cillum dolore eu fugiat nulla pariatur.
                  </li>
                  <li>
                    Excepteur sint occaecat cupidatat non proident, sunt in culpa qui
                    officia deserunt mollit anim id est laborum.
                  </li>
                  <li>
                    Collaborate cross-functionally with design, product, and data
                    teams to ship impactful features.
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Sticky Sidebar Column */}
          <aside className="w-full lg:w-80 shrink-0">
            <div className="sticky top-24 space-y-6">
              <MatchScoreWidget job={job} />

              <div
                className="p-6 rounded-lg border text-center"
                style={{
                  background: "var(--color-card)",
                  borderColor: "var(--color-border)",
                  boxShadow: "var(--shadow-sm)",
                }}
              >
                <button
                  className="w-full py-3 rounded-md text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 active:scale-[0.97] mb-3"
                  style={{ background: "var(--color-primary-600)" }}
                >
                  Apply Now
                </button>
                <button
                  className="w-full py-3 rounded-md text-sm font-semibold transition-all duration-200 hover:opacity-90 active:scale-[0.97] border-2"
                  style={{
                    borderColor: "var(--color-primary-500)",
                    color: "var(--color-primary-600)",
                    background: "transparent",
                  }}
                >
                  Save Job
                </button>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
