"use client";

import React, { useMemo, useState } from "react";
import {
  Search,
  Briefcase,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  Trash2,
  Star,
  MapPin,
  ShieldAlert,
} from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { Badge } from "@/shared/components/data-display/badge";
import { EmptyState } from "@/shared/components/data-display/empty-state";
import { Button } from "@/shared/components/ui/button";
import { Modal } from "@/shared/components/ui/modal";
import { useDebounce } from "@/shared/hooks/use-debounce";
import { toast } from "@/stores/toast-store";

interface AdminJob {
  id: string;
  title: string;
  companyName: string;
  location: string;
  remoteType: "REMOTE" | "HYBRID" | "ON_SITE";
  employmentType: "FULL_TIME" | "PART_TIME" | "CONTRACT";
  salaryMin: number;
  salaryMax: number;
  currency: string;
  status: "PUBLISHED" | "DRAFT" | "CLOSED" | "FLAGGED";
  isFeatured: boolean;
  applicantsCount: number;
  createdAt: string;
  description: string;
  requirements: string[];
  skills: string[];
}

const INITIAL_JOBS: AdminJob[] = [
  {
    id: "job-1",
    title: "Senior Full Stack Engineer",
    companyName: "Stripe",
    location: "San Francisco, CA",
    remoteType: "HYBRID",
    employmentType: "FULL_TIME",
    salaryMin: 165000,
    salaryMax: 195000,
    currency: "USD",
    status: "PUBLISHED",
    isFeatured: true,
    applicantsCount: 38,
    createdAt: "2026-02-10T10:00:00Z",
    description: "Lead architecture and scaling for our core developer checkout and payments infrastructure.",
    requirements: ["5+ years React and TypeScript", "Strong backend experience with Node or Go", "PostgreSQL tuning"],
    skills: ["React", "TypeScript", "Node.js", "PostgreSQL", "Next.js"],
  },
  {
    id: "job-2",
    title: "Frontend Platform Engineer",
    companyName: "Figma",
    location: "San Francisco, CA",
    remoteType: "REMOTE",
    employmentType: "FULL_TIME",
    salaryMin: 150000,
    salaryMax: 180000,
    currency: "USD",
    status: "PUBLISHED",
    isFeatured: true,
    applicantsCount: 45,
    createdAt: "2026-02-12T14:30:00Z",
    description: "Build robust UI component systems, web performance benchmarks, and designer-developer workflows.",
    requirements: ["Expert knowledge of DOM performance and Canvas/WebGL", "4+ years in modern frontend architectures"],
    skills: ["React", "TypeScript", "Tailwind CSS", "Web Performance"],
  },
  {
    id: "job-3",
    title: "Senior Product Designer",
    companyName: "Linear Technologies",
    location: "San Francisco, CA",
    remoteType: "REMOTE",
    employmentType: "FULL_TIME",
    salaryMin: 140000,
    salaryMax: 175000,
    currency: "USD",
    status: "PUBLISHED",
    isFeatured: false,
    applicantsCount: 22,
    createdAt: "2026-02-14T09:15:00Z",
    description: "Shape the next evolution of project tracking, keyboard-first UX, and developer tooling interactions.",
    requirements: ["Proven portfolio of product design craft", "Figma expertise and frontend code literacy"],
    skills: ["Product Design", "Figma", "UI/UX", "Prototyping"],
  },
  {
    id: "job-4",
    title: "AI Research Scientist",
    companyName: "Apex AI Labs",
    location: "Austin, TX",
    remoteType: "HYBRID",
    employmentType: "FULL_TIME",
    salaryMin: 180000,
    salaryMax: 220000,
    currency: "USD",
    status: "DRAFT",
    isFeatured: false,
    applicantsCount: 0,
    createdAt: "2026-02-15T11:00:00Z",
    description: "Research and optimize foundation models for autonomous multi-step reasoning agents.",
    requirements: ["PhD or equivalent research track in Machine Learning", "PyTorch and distributed training experience"],
    skills: ["PyTorch", "LLMs", "Python", "Distributed Systems"],
  },
  {
    id: "job-5",
    title: "Lead Infrastructure Architect",
    companyName: "Nexus Cloud Systems",
    location: "Seattle, WA",
    remoteType: "ON_SITE",
    employmentType: "FULL_TIME",
    salaryMin: 170000,
    salaryMax: 210000,
    currency: "USD",
    status: "FLAGGED",
    isFeatured: false,
    applicantsCount: 7,
    createdAt: "2026-02-08T16:20:00Z",
    description: "Review pending: Candidate reported ambiguous compensation terms.",
    requirements: ["Kubernetes, AWS/GCP, Terraform", "Security compliance standards"],
    skills: ["AWS", "Kubernetes", "Terraform", "Security"],
  },
];

const FILTERS = ["All", "PUBLISHED", "DRAFT", "FLAGGED", "CLOSED"] as const;

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<AdminJob[]>(INITIAL_JOBS);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [selectedJob, setSelectedJob] = useState<AdminJob | null>(null);
  const [deleteConfirmJob, setDeleteConfirmJob] = useState<AdminJob | null>(null);

  const debouncedQuery = useDebounce(query, 250);

  const filteredJobs = useMemo(() => {
    return jobs.filter((j) => {
      const matchesQuery =
        debouncedQuery.trim() === "" ||
        j.title.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
        j.companyName.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
        j.location.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
        j.skills.some((s) => s.toLowerCase().includes(debouncedQuery.toLowerCase()));

      if (!matchesQuery) return false;
      if (filter !== "All" && j.status !== filter) return false;
      return true;
    });
  }, [jobs, debouncedQuery, filter]);

  const stats = useMemo(() => {
    const total = jobs.length;
    const published = jobs.filter((j) => j.status === "PUBLISHED").length;
    const flagged = jobs.filter((j) => j.status === "FLAGGED").length;
    const totalApplicants = jobs.reduce((acc, j) => acc + j.applicantsCount, 0);
    return { total, published, flagged, totalApplicants };
  }, [jobs]);

  const updateJobStatus = (jobId: string, newStatus: AdminJob["status"]) => {
    setJobs((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, status: newStatus } : j))
    );
    toast.success(`Job status changed to ${newStatus}.`);
    if (selectedJob && selectedJob.id === jobId) {
      setSelectedJob((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  const toggleFeatured = (jobId: string) => {
    setJobs((prev) =>
      prev.map((j) => {
        if (j.id === jobId) {
          const next = !j.isFeatured;
          toast.success(next ? "Job featured on homepage!" : "Job unfeatured.");
          return { ...j, isFeatured: next };
        }
        return j;
      })
    );
  };

  const handleDeleteJob = (jobId: string) => {
    setJobs((prev) => prev.filter((j) => j.id !== jobId));
    setDeleteConfirmJob(null);
    if (selectedJob?.id === jobId) setSelectedJob(null);
    toast.success("Job posting removed from platform.");
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* ── Title Header ── */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-content">
          Job Moderation & Management
        </h1>
        <p className="text-sm mt-1 text-content-secondary">
          Monitor, verify, and moderate job postings across the JobFits ecosystem.
        </p>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-border bg-card shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-content-tertiary">
            Total Postings
          </div>
          <div className="text-2xl font-extrabold text-content mt-1.5">{stats.total}</div>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-content-tertiary">
            Published & Active
          </div>
          <div className="text-2xl font-extrabold text-success-600 mt-1.5">{stats.published}</div>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-content-tertiary">
            Flagged for Review
          </div>
          <div className="text-2xl font-extrabold text-rose-600 mt-1.5">{stats.flagged}</div>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-content-tertiary">
            Total Candidates Applied
          </div>
          <div className="text-2xl font-extrabold text-primary-600 mt-1.5">
            {stats.totalApplicants}
          </div>
        </div>
      </div>

      {/* ── Search and Filters ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-content-tertiary"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by job title, company, skills, or location…"
            className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-border bg-card text-content text-sm outline-none transition-all focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-3.5 py-2 rounded-lg text-xs font-bold border transition-colors",
                filter === f
                  ? "bg-primary-50 border-primary-200 text-primary-700 dark:bg-primary-950 dark:border-primary-800 dark:text-primary-300"
                  : "bg-card border-border text-content-secondary hover:bg-neutral-50 dark:hover:bg-neutral-800"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* ── Jobs Table ── */}
      {filteredJobs.length === 0 ? (
        <EmptyState
          icon={<Briefcase size={28} />}
          title="No jobs found"
          description="Try a different search keyword or status filter."
        />
      ) : (
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-neutral-50/50 dark:bg-neutral-800/40 text-left text-content-tertiary">
                  <th className="font-semibold text-xs uppercase tracking-wider px-5 py-3.5">
                    Job Title & Company
                  </th>
                  <th className="font-semibold text-xs uppercase tracking-wider px-5 py-3.5 hidden sm:table-cell">
                    Location & Type
                  </th>
                  <th className="font-semibold text-xs uppercase tracking-wider px-5 py-3.5 hidden md:table-cell">
                    Salary Range
                  </th>
                  <th className="font-semibold text-xs uppercase tracking-wider px-5 py-3.5 text-center">
                    Applicants
                  </th>
                  <th className="font-semibold text-xs uppercase tracking-wider px-5 py-3.5">
                    Status
                  </th>
                  <th className="font-semibold text-xs uppercase tracking-wider px-5 py-3.5 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredJobs.map((job) => (
                  <tr
                    key={job.id}
                    className="hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleFeatured(job.id)}
                          title={job.isFeatured ? "Featured Job" : "Click to Feature"}
                          className="text-neutral-300 hover:text-amber-500 transition-colors shrink-0"
                        >
                          <Star
                            size={16}
                            className={
                              job.isFeatured
                                ? "fill-amber-400 text-amber-500"
                                : "text-neutral-300"
                            }
                          />
                        </button>
                        <div>
                          <div className="font-bold text-content flex items-center gap-2">
                            <span>{job.title}</span>
                            {job.isFeatured && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                                Featured
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-content-secondary mt-0.5 flex items-center gap-1.5">
                            <span className="font-medium text-content">{job.companyName}</span>
                            <span>•</span>
                            <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 hidden sm:table-cell text-xs text-content-secondary">
                      <div className="flex items-center gap-1">
                        <MapPin size={12} className="text-content-tertiary" />
                        <span>{job.location}</span>
                      </div>
                      <div className="text-[11px] font-medium text-primary-600 mt-0.5">
                        {job.remoteType} • {job.employmentType.replace("_", " ")}
                      </div>
                    </td>

                    <td className="px-5 py-4 hidden md:table-cell text-xs text-content font-medium">
                      ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()} /yr
                    </td>

                    <td className="px-5 py-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 text-content">
                        {job.applicantsCount}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      {job.status === "PUBLISHED" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-success-50 text-success-700 border border-success-200 dark:bg-success-950 dark:border-success-800 dark:text-success-300">
                          <CheckCircle2 size={12} />
                          <span>Published</span>
                        </span>
                      )}
                      {job.status === "DRAFT" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-700 border border-neutral-200 dark:bg-neutral-800 dark:text-neutral-300">
                          <Clock size={12} />
                          <span>Draft</span>
                        </span>
                      )}
                      {job.status === "FLAGGED" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950 dark:border-rose-800 dark:text-rose-300">
                          <ShieldAlert size={12} />
                          <span>Flagged</span>
                        </span>
                      )}
                      {job.status === "CLOSED" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-neutral-200 text-neutral-600 border border-neutral-300 dark:bg-neutral-800 dark:text-neutral-400">
                          <XCircle size={12} />
                          <span>Closed</span>
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedJob(job)}
                        >
                          <Eye size={13} className="mr-1" />
                          <span>Review</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950"
                          onClick={() => setDeleteConfirmJob(job)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Job Review Modal ── */}
      {selectedJob && (
        <Modal
          open={Boolean(selectedJob)}
          onClose={() => setSelectedJob(null)}
          title={`Job Review: ${selectedJob.title}`}
        >
          <div className="space-y-5 text-sm">
            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-border space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-base text-content">{selectedJob.title}</h3>
                  <p className="text-xs text-content-secondary font-medium mt-0.5">
                    {selectedJob.companyName} • {selectedJob.location} ({selectedJob.remoteType})
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-extrabold text-content">
                    ${selectedJob.salaryMin.toLocaleString()} - ${selectedJob.salaryMax.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-content-tertiary">
                    {selectedJob.employmentType.replace("_", " ")}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-content-tertiary mb-1.5">
                Description
              </div>
              <p className="text-xs leading-relaxed text-content-secondary bg-card p-3 rounded-lg border border-border">
                {selectedJob.description}
              </p>
            </div>

            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-content-tertiary mb-2">
                Requirements & Tags
              </div>
              <ul className="text-xs space-y-1 text-content-secondary mb-3">
                {selectedJob.requirements.map((req, i) => (
                  <li key={i} className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-1.5">
                {selectedJob.skills.map((s) => (
                  <Badge key={s} tone="neutral">
                    {s}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-lg border border-border bg-card flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-content">Moderation Status</div>
                <div className="text-[11px] text-content-secondary">
                  Current state: <span className="font-bold">{selectedJob.status}</span>
                </div>
              </div>
              <div className="flex gap-2">
                {selectedJob.status !== "PUBLISHED" && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => updateJobStatus(selectedJob.id, "PUBLISHED")}
                  >
                    Approve & Publish
                  </Button>
                )}
                {selectedJob.status !== "FLAGGED" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-rose-600 border-rose-200 hover:bg-rose-50"
                    onClick={() => updateJobStatus(selectedJob.id, "FLAGGED")}
                  >
                    Flag
                  </Button>
                )}
                {selectedJob.status !== "CLOSED" && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => updateJobStatus(selectedJob.id, "CLOSED")}
                  >
                    Close Job
                  </Button>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-border">
              <Button variant="secondary" onClick={() => setSelectedJob(null)}>
                Close Review
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {deleteConfirmJob && (
        <Modal
          open={Boolean(deleteConfirmJob)}
          onClose={() => setDeleteConfirmJob(null)}
          title="Confirm Job Removal"
        >
          <div className="space-y-4 text-sm">
            <p className="text-content-secondary">
              Are you sure you want to permanently remove{" "}
              <strong className="text-content">{deleteConfirmJob.title}</strong> by{" "}
              <strong>{deleteConfirmJob.companyName}</strong>? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
              <Button variant="secondary" onClick={() => setDeleteConfirmJob(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                className="bg-rose-600 hover:bg-rose-700 text-white"
                onClick={() => handleDeleteJob(deleteConfirmJob.id)}
              >
                Delete Job
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
