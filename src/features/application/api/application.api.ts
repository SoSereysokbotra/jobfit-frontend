import type { Job } from "@/shared/types/shared.types";
import { MOCK_JOBS } from "@/features/job/api/job.api";
import type { BadgeVariant } from "@/shared/components/ui/badge";

/* Application tracking (FR-APP-001..004) — Flow 3A of the User Flows Guide.
   An application wraps a Job with the user's pipeline state: status,
   timeline milestones, submitted documents, and notes. */

export type ApplicationStatus =
  | "Submitted"
  | "Viewed"
  | "Interview"
  | "Offer"
  | "Rejected"
  | "Withdrawn";

export type InterviewType = "Video" | "Phone" | "On-site" | "Panel";

export interface Application {
  id: string;
  job: Job;
  status: ApplicationStatus;
  appliedDaysAgo: number;
  /** File name of the resume version submitted. */
  resume: string;
  coverLetter: boolean;
  /** Set once a recruiter viewed the application. */
  viewedDaysAgo?: number;
  /** Set when an interview is scheduled. */
  interview?: {
    inDays: number;
    time: string;
    type: InterviewType;
    interviewer?: string;
  };
  /** Set when an offer was received. */
  offer?: { respondBy: string };
  /** Expected next update for in-progress applications. */
  nextUpdateInDays?: number;
  notes: string;
}

/* Status system per spec: Blue (waiting), Yellow (reviewed), Green (interview),
   Gold (offer — mapped to the brand primary token), Red (rejected). */
export const APPLICATION_STATUSES: ApplicationStatus[] = [
  "Submitted", "Viewed", "Interview", "Offer", "Rejected",
];

export const STATUS_CONFIG: Record<
  ApplicationStatus,
  { label: string; badge: BadgeVariant; dot: string; hint: string }
> = {
  Submitted: { label: "Submitted", badge: "info", dot: "var(--color-info-500)", hint: "Waiting for review" },
  Viewed: { label: "Viewed", badge: "warning", dot: "var(--color-warning-500)", hint: "Recruiter reviewed" },
  Interview: { label: "Interview", badge: "success", dot: "var(--color-success-500)", hint: "Scheduled or completed" },
  Offer: { label: "Offer", badge: "primary", dot: "var(--color-primary-500)", hint: "Offer received" },
  Rejected: { label: "Rejected", badge: "error", dot: "var(--color-error-500)", hint: "Application rejected" },
  Withdrawn: { label: "Withdrawn", badge: "neutral", dot: "var(--color-neutral-400)", hint: "Withdrawn by you" },
};

/** Withdrawal reasons offered in the confirmation modal (Flow 3A-3). */
export const WITHDRAWAL_REASONS = [
  "Found another role",
  "Not interested anymore",
  "Accepted another offer",
  "Role doesn't match expectations",
  "Better opportunity elsewhere",
  "Other",
] as const;

const byId = (id: string): Job => {
  const job = MOCK_JOBS.find((j) => j.id === id);
  if (!job) throw new Error(`Unknown mock job id: ${id}`);
  return job;
};

/* Mock pipeline — reuses the shared job dataset so the dashboard,
   /jobs, /saved-jobs and /applications stay consistent. */
export const MOCK_APPLICATIONS: Application[] = [
  {
    id: "a1",
    job: byId("j1"),
    status: "Interview",
    appliedDaysAgo: 14,
    resume: "Resume_v3.pdf",
    coverLetter: true,
    viewedDaysAgo: 12,
    interview: { inDays: 2, time: "2:00 PM PT", type: "Video", interviewer: "Sarah Chen, Hiring Manager" },
    notes: "Follow up on Friday — recruiter said they'd decide by EOW.",
  },
  {
    id: "a2",
    job: byId("j5"),
    status: "Interview",
    appliedDaysAgo: 10,
    resume: "Resume_v3.pdf",
    coverLetter: false,
    viewedDaysAgo: 8,
    interview: { inDays: 1, time: "2:00 PM PT", type: "Video" },
    notes: "Review Kubernetes notes before the call.",
  },
  {
    id: "a3",
    job: byId("j6"),
    status: "Offer",
    appliedDaysAgo: 21,
    resume: "Resume_v2.pdf",
    coverLetter: true,
    viewedDaysAgo: 19,
    offer: { respondBy: "Jun 30" },
    notes: "Base is solid — ask about equity refresh before responding.",
  },
  {
    id: "a4",
    job: byId("j2"),
    status: "Submitted",
    appliedDaysAgo: 3,
    resume: "Resume_v3.pdf",
    coverLetter: true,
    nextUpdateInDays: 7,
    notes: "",
  },
  {
    id: "a5",
    job: byId("j3"),
    status: "Submitted",
    appliedDaysAgo: 5,
    resume: "Resume_v3.pdf",
    coverLetter: false,
    nextUpdateInDays: 5,
    notes: "",
  },
  {
    id: "a6",
    job: byId("j8"),
    status: "Submitted",
    appliedDaysAgo: 1,
    resume: "Resume_v1.pdf",
    coverLetter: false,
    nextUpdateInDays: 10,
    notes: "",
  },
  {
    id: "a7",
    job: byId("j4"),
    status: "Viewed",
    appliedDaysAgo: 6,
    resume: "Resume_v3.pdf",
    coverLetter: true,
    viewedDaysAgo: 4,
    nextUpdateInDays: 4,
    notes: "Team seems great. Glassdoor reviews are 4.5/5.",
  },
  {
    id: "a8",
    job: byId("j9"),
    status: "Viewed",
    appliedDaysAgo: 4,
    resume: "Resume_v3.pdf",
    coverLetter: false,
    viewedDaysAgo: 2,
    nextUpdateInDays: 6,
    notes: "",
  },
  {
    id: "a9",
    job: byId("j10"),
    status: "Rejected",
    appliedDaysAgo: 30,
    resume: "Resume_v2.pdf",
    coverLetter: true,
    viewedDaysAgo: 25,
    notes: "",
  },
  {
    id: "a10",
    job: byId("j11"),
    status: "Withdrawn",
    appliedDaysAgo: 20,
    resume: "Resume_v2.pdf",
    coverLetter: false,
    notes: "",
  },
];

/** Simulated network fetch for the user's applications. */
export async function fetchApplications(): Promise<Application[]> {
  await new Promise((r) => setTimeout(r, 600));
  return MOCK_APPLICATIONS;
}
