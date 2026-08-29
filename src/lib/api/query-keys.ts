/**
 * Central query-key factory. One place to look up a key, so invalidation never
 * relies on a hand-typed string matching another hand-typed string.
 *
 * Convention: each feature exposes `all` (its root, for blanket invalidation),
 * then narrower keys built from it. Keys are `as const` so React Query infers
 * literal tuples.
 *
 * Gap features (saved-jobs, matching, payment) get keys too, even though they
 * resolve against mock data today — when the backend lands, only the fetcher
 * changes. See INTEGRATION_PLAN.md Phase 10. Notifications were one of these and
 * are now live, which is exactly the one-file swap the convention was for.
 */

export const qk = {
  auth: {
    all: ["auth"] as const,
    me: () => [...qk.auth.all, "me"] as const,
  },

  jobs: {
    all: ["jobs"] as const,
    lists: () => [...qk.jobs.all, "list"] as const,
    /** `filters` is part of the key so each filter combination caches separately. */
    list: (filters: Record<string, unknown> = {}) =>
      [...qk.jobs.lists(), filters] as const,
    details: () => [...qk.jobs.all, "detail"] as const,
    detail: (jobId: string) => [...qk.jobs.details(), jobId] as const,
  },

  profiles: {
    all: ["profiles"] as const,
    detail: (userId: string) => [...qk.profiles.all, userId] as const,
    skills: (userId: string) => [...qk.profiles.detail(userId), "skills"] as const,
    experience: (userId: string) => [...qk.profiles.detail(userId), "experience"] as const,
    education: (userId: string) => [...qk.profiles.detail(userId), "education"] as const,
  },

  resumes: {
    all: ["resumes"] as const,
    lists: () => [...qk.resumes.all, "list"] as const,
    list: () => [...qk.resumes.lists()] as const,
    details: () => [...qk.resumes.all, "detail"] as const,
    detail: (resumeId: string) => [...qk.resumes.details(), resumeId] as const,
    parsingStatus: (resumeId: string) =>
      [...qk.resumes.detail(resumeId), "parsing-status"] as const,
    atsScore: (resumeId: string) => [...qk.resumes.detail(resumeId), "ats-score"] as const,
    qualityScore: (resumeId: string) =>
      [...qk.resumes.detail(resumeId), "quality-score"] as const,
    scores: (resumeId: string) => [...qk.resumes.detail(resumeId), "scores"] as const,
  },

  /** Live: the `resume-builder` module (templates, documents, sections, export). */
  resumeBuilder: {
    all: ["resume-builder"] as const,
    /** `filters` keys the atsOnly/category variants separately. */
    templates: (filters: Record<string, unknown> = {}) =>
      [...qk.resumeBuilder.all, "templates", filters] as const,
    documents: () => [...qk.resumeBuilder.all, "documents"] as const,
    document: (documentId: string) =>
      [...qk.resumeBuilder.documents(), documentId] as const,
  },

  applications: {
    all: ["applications"] as const,
    lists: () => [...qk.applications.all, "list"] as const,
    list: (filters: Record<string, unknown> = {}) =>
      [...qk.applications.lists(), filters] as const,
    details: () => [...qk.applications.all, "detail"] as const,
    detail: (applicationId: string) =>
      [...qk.applications.details(), applicationId] as const,
    timeline: (applicationId: string) =>
      [...qk.applications.detail(applicationId), "timeline"] as const,
  },

  /** The user's own Job Tracker board — jobs applied to on other sites. */
  tracker: {
    all: ["tracker"] as const,
    board: () => [...qk.tracker.all, "board"] as const,
    archived: () => [...qk.tracker.all, "archived"] as const,
  },

  offers: {
    all: ["offers"] as const,
    list: () => [...qk.offers.all, "list"] as const,
    detail: (offerId: string) => [...qk.offers.all, "detail", offerId] as const,
  },

  employer: {
    all: ["employer"] as const,
    company: (companyId: string) => [...qk.employer.all, "company", companyId] as const,
    companyMe: () => [...qk.employer.all, "company", "me"] as const,
    jobs: () => [...qk.employer.all, "jobs"] as const,
    jobAnalytics: (jobId: string) =>
      [...qk.employer.all, "job", jobId, "analytics"] as const,
    applications: (filters: Record<string, unknown> = {}) =>
      [...qk.employer.all, "applications", filters] as const,
  },

  admin: {
    all: ["admin"] as const,
    users: (filters: Record<string, unknown> = {}) =>
      [...qk.admin.all, "users", filters] as const,
    user: (userId: string) => [...qk.admin.all, "user", userId] as const,
    systemHealth: () => [...qk.admin.all, "system", "health"] as const,
    systemMetrics: (period: string) =>
      [...qk.admin.all, "system", "metrics", period] as const,
    systemAlerts: (filters: Record<string, unknown> = {}) =>
      [...qk.admin.all, "system", "alerts", filters] as const,
    emailMetrics: () => [...qk.admin.all, "email", "metrics"] as const,
    emailBounces: () => [...qk.admin.all, "email", "bounces"] as const,
    auditLogs: (filters: Record<string, unknown> = {}) =>
      [...qk.admin.all, "audit-logs", filters] as const,
    /** Employer onboarding queue — the only path to an EMPLOYER account. */
    employerRequests: (filters: Record<string, unknown> = {}) =>
      [...qk.admin.all, "employer-requests", filters] as const,
    employerRequest: (id: string) =>
      [...qk.admin.all, "employer-request", id] as const,
    companyOptions: (search: string) =>
      [...qk.admin.all, "company-options", search] as const,
    companyMatch: (name: string, website: string) =>
      [...qk.admin.all, "company-match", name, website] as const,
  },

  analytics: {
    all: ["analytics"] as const,
    myStats: () => [...qk.analytics.all, "my-stats"] as const,
  },

  learning: {
    all: ["learning"] as const,
    gaps: (userId: string) => [...qk.learning.all, "gaps", userId] as const,
    resources: (skillId: string) => [...qk.learning.all, "resources", skillId] as const,
  },

  /** Live: GET /notifications, /unread-count, PATCH /:id/read, POST /read-all. */
  notifications: {
    all: ["notifications"] as const,
    list: () => [...qk.notifications.all, "list"] as const,
    unreadCount: () => [...qk.notifications.all, "unread-count"] as const,
  },

  // ---- Gap features: no backend endpoint yet (INTEGRATION_PLAN.md Phase 10) ----

  /** TODO(backend): no saved-jobs endpoints. */
  savedJobs: {
    all: ["saved-jobs"] as const,
    list: () => [...qk.savedJobs.all, "list"] as const,
    folders: () => [...qk.savedJobs.all, "folders"] as const,
    /** Jobs saved from the browser extension — their own list, own endpoint. */
    external: () => [...qk.savedJobs.all, "external"] as const,
  },

  /** TODO(backend): depends on the AI service, not yet wired to the backend. */
  matching: {
    all: ["matching"] as const,
    recommendations: (filters: Record<string, unknown> = {}) =>
      [...qk.matching.all, "recommendations", filters] as const,
    breakdown: (jobId: string) => [...qk.matching.all, "breakdown", jobId] as const,
    /** Why the recommendations list is empty — drives the onboarding bridge screen. */
    readiness: () => [...qk.matching.all, "readiness"] as const,
    skillGap: (jobId: string) => [...qk.matching.all, "skill-gap", jobId] as const,
    /** A stored full-page match report, generated from the browser extension. */
    report: (reportId: string) => [...qk.matching.all, "report", reportId] as const,
  },

  /** TODO(backend): no billing backend. */
  payment: {
    all: ["payment"] as const,
    billing: () => [...qk.payment.all, "billing"] as const,
    plans: () => [...qk.payment.all, "plans"] as const,
  },
} as const;
