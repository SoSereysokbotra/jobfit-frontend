import type { Job } from "@/shared/types/shared.types";
import { MOCK_JOBS } from "@/features/job/api/job.api";

/* Saved Jobs feature (FR-SAVED-001/002) — Path 2C of the User Flows Guide.
   A saved job wraps a Job with the user's personal layer: tags, notes,
   pipeline status, and when it was saved. */

export type SavedJobStatus = "Applied" | "Waiting" | "Interview" | "Rejected";

export interface SavedJob {
  job: Job;
  savedDaysAgo: number;
  /** Pipeline status if the user already applied (undefined = not applied yet). */
  status?: SavedJobStatus;
  tags: string[];
  notes: string;
}

/** Predefined tags from the flows guide (custom tags are also allowed). */
export const PRESET_TAGS = [
  "Dream company",
  "Ready to apply",
  "Backup option",
  "Learning opportunity",
] as const;

const byId = (id: string): Job => {
  const job = MOCK_JOBS.find((j) => j.id === id);
  if (!job) throw new Error(`Unknown mock job id: ${id}`);
  return job;
};

/* Mock saved collection — reuses the shared job dataset so /jobs,
   /dashboard and /saved-jobs all reference the same listings. */
export const MOCK_SAVED_JOBS: SavedJob[] = [
  {
    job: byId("j1"),
    savedDaysAgo: 3,
    status: "Interview",
    tags: ["Dream company"],
    notes: "Recruiter said they'd decide by EOW — follow up on Friday.",
  },
  {
    job: byId("j9"),
    savedDaysAgo: 1,
    tags: ["Ready to apply"],
    notes: "Salary is 10% above my expectation — room to negotiate?",
  },
  {
    job: byId("j2"),
    savedDaysAgo: 5,
    status: "Applied",
    tags: ["Dream company"],
    notes: "",
  },
  {
    job: byId("j4"),
    savedDaysAgo: 6,
    status: "Waiting",
    tags: [],
    notes: "Team seems great. Glassdoor reviews are 4.5/5.",
  },
  {
    job: byId("j5"),
    savedDaysAgo: 8,
    status: "Interview",
    tags: [],
    notes: "Video interview tomorrow 2:00 PM — review Kubernetes notes.",
  },
  {
    job: byId("j12"),
    savedDaysAgo: 2,
    tags: ["Learning opportunity"],
    notes: "",
  },
  {
    job: byId("j7"),
    savedDaysAgo: 10,
    tags: ["Backup option"],
    notes: "",
  },
  {
    job: byId("j10"),
    savedDaysAgo: 14,
    status: "Rejected",
    tags: [],
    notes: "",
  },
];

/** Simulated network fetch for the user's saved jobs. */
export async function fetchSavedJobs(): Promise<SavedJob[]> {
  await new Promise((r) => setTimeout(r, 600));
  return MOCK_SAVED_JOBS;
}
