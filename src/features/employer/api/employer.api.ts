/* Mock data for the employer dashboard (jobs, applicants, analytics, company).
   Stands in for the /api/employer/* and /api/companies/* endpoints. */

export type JobStatus = "Published" | "Draft" | "Closed";
export type ApplicationStage = "Applied" | "Interview" | "Offer" | "Hired" | "Rejected";

export interface EmployerJob {
  id: string;
  title: string;
  status: JobStatus;
  postedAt: string;
  location: string;
  salaryMin: number;
  salaryMax: number;
  employmentType: string;
  remote: string;
  skills: string[];
  views: number;
  applications: number;
  avgMatch: number;
}

export interface Applicant {
  id: string;
  jobId: string;
  name: string;
  initials: string;
  email: string;
  location: string;
  match: number;
  stage: ApplicationStage;
  appliedAt: string;
}

export interface CompanyProfile {
  name: string;
  verified: boolean;
  verifiedDate: string;
  description: string;
  industries: string[];
  size: string;
  website: string;
}

export const COMPANY_PROFILE: CompanyProfile = {
  name: "TechCorp Inc",
  verified: true,
  verifiedDate: "Jan 15, 2026",
  description: "Leading software company focused on AI-powered developer tools and platform infrastructure.",
  industries: ["Software", "Technology"],
  size: "Mid-Size (201–1000)",
  website: "https://techcorp.com",
};

export const EMPLOYER_JOBS: EmployerJob[] = [
  {
    id: "ej1", title: "Senior Software Engineer", status: "Published", postedAt: "Jan 15, 2026",
    location: "San Francisco, CA", salaryMin: 150, salaryMax: 190, employmentType: "Full-time", remote: "Hybrid",
    skills: ["Python", "SQL", "AWS"], views: 456, applications: 23, avgMatch: 82,
  },
  {
    id: "ej2", title: "Product Manager", status: "Draft", postedAt: "Jan 20, 2026",
    location: "Remote (US)", salaryMin: 140, salaryMax: 175, employmentType: "Full-time", remote: "Remote",
    skills: ["Roadmapping", "Analytics", "Agile"], views: 0, applications: 0, avgMatch: 0,
  },
  {
    id: "ej3", title: "Data Scientist", status: "Published", postedAt: "Dec 20, 2025",
    location: "New York, NY", salaryMin: 145, salaryMax: 185, employmentType: "Full-time", remote: "Hybrid",
    skills: ["Python", "ML", "Statistics"], views: 812, applications: 45, avgMatch: 79,
  },
  {
    id: "ej4", title: "UX Designer", status: "Closed", postedAt: "Nov 2, 2025",
    location: "Boston, MA", salaryMin: 110, salaryMax: 145, employmentType: "Full-time", remote: "On-site",
    skills: ["Figma", "Research", "Prototyping"], views: 340, applications: 18, avgMatch: 74,
  },
];

export const APPLICANTS: Applicant[] = [
  { id: "ap1", jobId: "ej1", name: "John Smith", initials: "JS", email: "john@example.com", location: "San Francisco, CA", match: 92, stage: "Applied", appliedAt: "1h ago" },
  { id: "ap2", jobId: "ej1", name: "Alice Cooper", initials: "AC", email: "alice@example.com", location: "Remote", match: 78, stage: "Applied", appliedAt: "3h ago" },
  { id: "ap3", jobId: "ej1", name: "Priya Sharma", initials: "PS", email: "priya@example.com", location: "Austin, TX", match: 84, stage: "Applied", appliedAt: "6h ago" },
  { id: "ap4", jobId: "ej1", name: "Jane Doe", initials: "JD", email: "jane@example.com", location: "New York, NY", match: 87, stage: "Interview", appliedAt: "5d ago" },
  { id: "ap5", jobId: "ej3", name: "Charlie Kim", initials: "CK", email: "charlie@example.com", location: "Seattle, WA", match: 80, stage: "Interview", appliedAt: "3d ago" },
  { id: "ap6", jobId: "ej1", name: "Bob Johnson", initials: "BJ", email: "bob@example.com", location: "Chicago, IL", match: 85, stage: "Offer", appliedAt: "2d ago" },
  { id: "ap7", jobId: "ej3", name: "David Lee", initials: "DL", email: "david@example.com", location: "Portland, OR", match: 88, stage: "Hired", appliedAt: "1w ago" },
  { id: "ap8", jobId: "ej1", name: "Emma Wilson", initials: "EW", email: "emma@example.com", location: "Denver, CO", match: 72, stage: "Rejected", appliedAt: "4d ago" },
];

/** 7-month applications-vs-views trend for the analytics chart. */
export const EMPLOYER_TREND = [
  { month: "Jan", applications: 8, views: 120 },
  { month: "Feb", applications: 14, views: 210 },
  { month: "Mar", applications: 22, views: 340 },
  { month: "Apr", applications: 18, views: 290 },
  { month: "May", applications: 31, views: 460 },
  { month: "Jun", applications: 27, views: 410 },
  { month: "Jul", applications: 38, views: 540 },
];

export function jobById(id: string): EmployerJob | undefined {
  return EMPLOYER_JOBS.find((j) => j.id === id);
}
