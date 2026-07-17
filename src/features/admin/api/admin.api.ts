/* Mock data for the admin dashboard (system health, users, email tracking).
   Stands in for the /api/admin/* endpoints described in the flows doc. */

export interface SystemHealth {
  uptimePercent: number;
  apiLatencyMs: number;
  databaseCpuPercent: number;
  memoryPercent: number;
  emailDeliveryRate: number;
  activeUsers: number;
}

export interface SystemAlert {
  id: string;
  severity: "info" | "warning" | "error";
  message: string;
  createdAt: string;
  acknowledged: boolean;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  initials: string;
  status: "active" | "inactive" | "locked";
  emailVerified: boolean;
  lastLogin: string;
  signupDate: string;
  location: string;
  salaryExpectation: string;
  profileCompleteness: number;
  applications: number;
  resumes: { id: string; filename: string; uploadedAt: string; current: boolean }[];
}

export interface EmailMetrics {
  sent: number;
  delivered: number;
  bounced: number;
  deliveryRate: number;
  byType: { type: string; sent: number; delivered: number }[];
}

export interface EmailBounce {
  id: string;
  email: string;
  kind: "Hard" | "Soft";
  reason: string;
  bouncedAt: string;
}

export const SYSTEM_HEALTH: SystemHealth = {
  uptimePercent: 99.8,
  apiLatencyMs: 145,
  databaseCpuPercent: 32,
  memoryPercent: 54,
  emailDeliveryRate: 99.4,
  activeUsers: 245,
};

export const SYSTEM_ALERTS: SystemAlert[] = [
  { id: "a1", severity: "info", message: "Nightly backup completed successfully", createdAt: "2 hours ago", acknowledged: false },
  { id: "a2", severity: "warning", message: "API latency briefly exceeded 500ms (14:32)", createdAt: "5 hours ago", acknowledged: false },
  { id: "a3", severity: "info", message: "Email delivery rate holding at 99.4%", createdAt: "8 hours ago", acknowledged: true },
];

/** 24h time-series for the system-health chart. */
export const METRICS_SERIES = [
  { t: "00:00", latency: 140, activeUsers: 180 },
  { t: "04:00", latency: 132, activeUsers: 120 },
  { t: "08:00", latency: 158, activeUsers: 240 },
  { t: "12:00", latency: 172, activeUsers: 310 },
  { t: "16:00", latency: 145, activeUsers: 290 },
  { t: "20:00", latency: 138, activeUsers: 245 },
  { t: "Now", latency: 145, activeUsers: 245 },
];

export const ADMIN_USERS: AdminUser[] = [
  {
    id: "u1", name: "John Smith", email: "john@example.com", initials: "JS", status: "active", emailVerified: true,
    lastLogin: "2 hours ago", signupDate: "Jan 15, 2026", location: "San Francisco, CA", salaryExpectation: "$100K – $150K",
    profileCompleteness: 85, applications: 12,
    resumes: [
      { id: "r1", filename: "Resume_v1.pdf", uploadedAt: "Jan 15", current: false },
      { id: "r2", filename: "Resume_v2.pdf", uploadedAt: "Feb 1", current: true },
    ],
  },
  {
    id: "u2", name: "Jane Doe", email: "jane@example.com", initials: "JD", status: "active", emailVerified: true,
    lastLogin: "5 minutes ago", signupDate: "Feb 3, 2026", location: "Remote (US)", salaryExpectation: "$130K – $180K",
    profileCompleteness: 92, applications: 8,
    resumes: [{ id: "r3", filename: "JaneDoe_CV.pdf", uploadedAt: "Feb 3", current: true }],
  },
  {
    id: "u3", name: "Bob Johnson", email: "bob@example.com", initials: "BJ", status: "locked", emailVerified: true,
    lastLogin: "Yesterday", signupDate: "Dec 20, 2025", location: "Austin, TX", salaryExpectation: "$90K – $120K",
    profileCompleteness: 60, applications: 3,
    resumes: [{ id: "r4", filename: "bob_resume.pdf", uploadedAt: "Dec 20", current: true }],
  },
  {
    id: "u4", name: "Alice Cooper", email: "alice@example.com", initials: "AC", status: "active", emailVerified: false,
    lastLogin: "3 days ago", signupDate: "Feb 10, 2026", location: "Boston, MA", salaryExpectation: "$110K – $145K",
    profileCompleteness: 40, applications: 1,
    resumes: [],
  },
  {
    id: "u5", name: "David Lee", email: "david@example.com", initials: "DL", status: "inactive", emailVerified: true,
    lastLogin: "3 weeks ago", signupDate: "Nov 2, 2025", location: "Seattle, WA", salaryExpectation: "$160K – $210K",
    profileCompleteness: 78, applications: 22,
    resumes: [{ id: "r5", filename: "David_Lee_2026.pdf", uploadedAt: "Nov 2", current: true }],
  },
];

export const EMAIL_METRICS: EmailMetrics = {
  sent: 1234,
  delivered: 1227,
  bounced: 7,
  deliveryRate: 99.4,
  byType: [
    { type: "Recommendation digest", sent: 567, delivered: 564 },
    { type: "Application updates", sent: 345, delivered: 342 },
    { type: "Interview reminders", sent: 234, delivered: 234 },
    { type: "Offer notifications", sent: 88, delivered: 88 },
    { type: "Password resets", sent: 45, delivered: 45 },
  ],
};

export const EMAIL_BOUNCES: EmailBounce[] = [
  { id: "b1", email: "john@oldjob.com", kind: "Hard", reason: "Invalid recipient", bouncedAt: "3h ago" },
  { id: "b2", email: "jane@company.com", kind: "Soft", reason: "Mailbox temporarily unavailable", bouncedAt: "6h ago" },
  { id: "b3", email: "bob@test.com", kind: "Hard", reason: "Domain does not exist", bouncedAt: "Yesterday" },
];

/** 7-day delivery-rate trend for the email chart. */
export const EMAIL_TREND = [
  { day: "Mon", rate: 99.1 },
  { day: "Tue", rate: 99.3 },
  { day: "Wed", rate: 98.9 },
  { day: "Thu", rate: 99.5 },
  { day: "Fri", rate: 99.4 },
  { day: "Sat", rate: 99.6 },
  { day: "Sun", rate: 99.4 },
];
