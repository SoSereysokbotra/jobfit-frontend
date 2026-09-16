"use client";
import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { Briefcase, CheckCircle2, Star, ArrowRight, Search, Upload, BarChart3, ChevronRight } from "lucide-react";
import { JobCard } from "@/features/job/components";
import { useSession, displayName } from "@/features/auth/hooks/use-session";
import { useRecommendations } from "@/features/matching/hooks/use-recommendations";
import { useMatchReadiness } from "@/features/matching/hooks/use-match-readiness";
import { toast } from "@/stores/toast-store";
import { useMyStats } from "@/features/insights/hooks/use-insights";
import { useSavedJobIds, useToggleSavedJob } from "@/features/saved-jobs/hooks/use-saved-jobs";
import { useProfile } from "@/features/user-profile/hooks/use-profile";
import { profileCompleteness } from "@/features/user-profile/api/profile.mappers";
import { SectionCard } from "@/shared/components/layout/section-card";
import { formatDate } from "@/shared/utils/formatters";
import { Reveal } from "@/shared/components/motion/reveal";
import { useCountUp } from "@/shared/hooks/use-count-up";
import { ProfileAvatar } from "@/features/user-profile/components";

const quickActions = [
  { icon: <Search size={20} />, label: "Search Jobs", href: "/jobs", color: "var(--color-info-600)", bg: "var(--color-info-50)" },
  { icon: <Upload size={20} />, label: "Upload Resume", href: "/resumes", color: "var(--color-primary-600)", bg: "var(--color-primary-50)" },
  { icon: <Star size={20} />, label: "View Matches", href: "/recommendations", color: "var(--color-warning-600)", bg: "var(--color-warning-50)" },
  { icon: <BarChart3 size={20} />, label: "Career Insights", href: "/insights", color: "var(--color-success-600)", bg: "var(--color-success-50)" },
];

/* ═══════════════════════════════════════════════════════════════
   PAGE ROOT
   ═══════════════════════════════════════════════════════════════ */
export default function DashboardPage() {
  // Personalize the greeting from the real session (GET /auth/me). `name` is
  // optional at registration, so fall back to a neutral greeting.
  const { user } = useSession();
  const firstName = displayName(user).firstName || "there";

  const hasToasted = useRef(false);

  useEffect(() => {
    if (!hasToasted.current) {
      toast.success(`Welcome back, ${firstName}!`, {
        title: "Login Successful",
      });
      hasToasted.current = true;
    }
  }, [firstName]);

  // Real seeker funnel stats (GET /analytics/my-stats) drive the stat tiles.
  const { data: stats } = useMyStats();
  // Saved jobs are now backend-backed; the count feeds the "Saved Jobs" tile.
  const { ids: savedIds } = useSavedJobIds();
  const toggleSaved = useToggleSavedJob();
  const toggleSave = (id: string) => {
    toast.success(savedIds.has(id) ? "Job removed from saved list" : "Job saved successfully!");
    toggleSaved.mutate(id);
  };
  // THE MATCHES, not the newest postings. This screen is where a seeker lands after
  // login and after onboarding, and until now it opened on four zeros and a chart of an
  // imaginary job hunt while the one thing they came for — jobs scored against their own
  // profile — sat behind a click. `useRecommendations` is the same query the
  // /recommendations page runs, so the cache is shared and this costs no extra request.
  const { data: recommendations = [], isLoading: matchesLoading } = useRecommendations();
  // Only consulted when the list is empty: [] is a real answer that can mean "no profile
  // embedding yet", and saying "no matches" to someone mid-onboarding would be a lie.
  const { data: readiness } = useMatchReadiness();
  const topMatches = recommendations.slice(0, 5);
  // Real profile drives the completeness score + checklist.
  const { profile } = useProfile();
  const rawProfileScore = profileCompleteness(profile);
  const animatedProfileScore = useCountUp(rawProfileScore, 800);
  const profileScore = rawProfileScore;

  const num = (n: number | undefined) => (typeof n === "number" ? String(n) : "—");

  // Checklist derived from the real profile (skills/resume/cover-letter have no
  // reliable field here, so we track the profile fields the backend does store).
  const profileChecklist = [
    { label: "Name", done: Boolean(profile?.firstName && profile?.lastName) },
    { label: "Headline", done: Boolean(profile?.headline) },
    { label: "Bio", done: Boolean(profile?.bio) },
    { label: "Location", done: Boolean(profile?.locationLabel) },
    { label: "Job preferences", done: (profile?.desiredJobLevels.length ?? 0) > 0 },
    { label: "Salary range", done: Boolean(profile?.salaryRange) },
  ];
  const checklistDone = profileChecklist.filter((c) => c.done).length;

  const today = formatDate(new Date(), {
    weekday: "long", month: "long", day: "numeric"
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 min-h-full" style={{ background: "var(--color-bg-secondary)" }}>

      {/* ── WELCOME BANNER ────────────────────────────────── */}
      <Reveal variant="fade" delay={0}>
        <div
          className="rounded-2xl p-6 sm:p-8 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, var(--color-primary-900) 0%, var(--color-primary-700) 60%, var(--color-primary-600) 100%)" }}
        >
        {/* Decorative blobs */}
        <div
          className="absolute -top-10 -right-10 w-56 h-56 rounded-full opacity-10"
          style={{ background: "var(--color-primary-300)", filter: "blur(60px)" }}
        />
        <div
          className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full opacity-10"
          style={{ background: "var(--color-primary-200)", filter: "blur(50px)" }}
        />
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <ProfileAvatar
              photoUrl={profile?.photoUrl}
              name={profile?.fullName || firstName}
              initials={displayName(user).initials}
              size="xl"
              editable={true}
              showBorder={true}
              className="shrink-0"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-on-primary-muted uppercase tracking-wider mb-1">{today}</p>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-on-primary tracking-tight">
                Welcome back, {firstName}!
              </h1>
              <p className="text-sm text-on-primary-muted mt-1.5">
                You have <span className="text-on-primary font-bold">{num(stats?.totalInterviews)} interviews</span> in progress and{" "}
                <span className="text-on-primary font-bold">{num(stats?.totalApplications)} applications</span> submitted.
              </p>
              <div className="flex flex-wrap gap-2 mt-4">
                <Link
                  href="/recommendations"
                  onClick={() => toast.info("Opening your job matches...")}
                  className="px-4 py-2 rounded-md text-xs font-bold bg-on-primary text-primary-800 hover:bg-primary-50 transition-all duration-200 active:scale-[0.98] inline-flex items-center gap-1.5"
                >
                  <Star size={13} /> View New Matches
                </Link>
                <Link
                  href="/applications"
                  onClick={() => toast.info("Viewing your applications...")}
                  className="px-4 py-2 rounded-md text-xs font-bold text-on-primary border border-on-primary-border hover:bg-on-primary-surface transition-all duration-200 active:scale-[0.98] inline-flex items-center gap-1.5"
                >
                  <Briefcase size={13} /> Track Applications
                </Link>
              </div>
            </div>
          </div>

          {/* Profile completeness */}
          <div className="sm:shrink-0 flex flex-row w-full sm:w-auto items-center text-left gap-4 rounded-xl px-4 sm:px-5 py-3.5 sm:py-4 bg-on-primary-surface border border-on-primary-border backdrop-blur-sm">
            <div className="relative w-14 h-14">
              <svg width={56} height={56} className="-rotate-90" viewBox="0 0 56 56">
                <circle cx={28} cy={28} r={22} fill="none" stroke="var(--color-border-on-primary)" strokeWidth={6} />
                <circle
                  cx={28} cy={28} r={22} fill="none" stroke="var(--color-text-on-primary)" strokeWidth={6}
                  strokeDasharray={`${(profileScore / 100) * 2 * Math.PI * 22} ${2 * Math.PI * 22}`}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-on-primary font-extrabold text-sm">{animatedProfileScore}%</span>
            </div>
            <div>
              <p className="text-on-primary font-bold text-sm">Profile Score</p>
              <p className="text-on-primary-muted text-xs mt-0.5">
                {profileScore >= 100 ? "Profile complete" : "Add details to reach 90%+"}
              </p>
              <Link
                href="/profile"
                onClick={() => toast.info("Opening profile editor...")}
                className="text-xs font-bold text-on-primary-muted hover:text-on-primary mt-1 inline-flex items-center gap-1 transition-colors"
              >
                Complete profile <ChevronRight size={12} />
              </Link>
            </div>
          </div>
        </div>
      </div>
      </Reveal>


      {/* ── MAIN 2-COLUMN GRID ────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* LEFT COLUMN (2/3) */}
        <div className="xl:col-span-2 space-y-6">

          {/* THE MATCHES — first thing on the page, because it is the reason the user
              logged in. It replaces a "Recent Openings" list built from `useJobs()`,
              which showed whatever was published most recently, ranked by nothing and
              personalised to nobody. */}
          <Reveal variant="up" delay={160}>
          <SectionCard
            title="Your Top Matches"
            subtitle="Jobs scored against your profile, best first"
            flush
            action={
              <Link
                href="/recommendations"
                className="text-xs font-bold flex items-center gap-1 transition-colors hover:opacity-80"
                style={{ color: "var(--color-primary-600)" }}
              >
                View all <ArrowRight size={13} />
              </Link>
            }
          >
            {matchesLoading ? (
              <p className="p-5 text-sm text-center" style={{ color: "var(--color-text-tertiary)" }}>
                Finding your matches...
              </p>
            ) : topMatches.length === 0 ? (
              // An empty list is a REAL answer with more than one cause, and the two must
              // not be told the same way: a candidate still being embedded has no matches
              // YET, while a failed embedding has none until something is fixed. Saying
              // "no matches found" to the first is simply false.
              <div className="p-5 text-sm text-center" style={{ color: "var(--color-text-tertiary)" }}>
                {readiness?.state === "READY" ? (
                  <>No matches yet. Try widening your preferences.</>
                ) : (
                  <>
                    We&apos;re still building your matches.{" "}
                    <Link href="/profile" className="font-bold" style={{ color: "var(--color-primary-600)" }}>
                      Complete your profile
                    </Link>{" "}
                    to speed this up.
                  </>
                )}
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: "var(--color-neutral-100)" }}>
                {topMatches.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    variant="list"
                    compact
                    saved={savedIds.has(job.id)}
                    onToggleSave={toggleSave}
                  />
                ))}
              </div>
            )}
          </SectionCard>
          </Reveal>

        </div>

        {/* RIGHT COLUMN (1/3) */}
        <div className="space-y-6">

          {/* Quick Actions */}
          <Reveal variant="up" delay={180}>
          <SectionCard title="Quick Actions">
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action) => (
                <Link
                  key={action.label}
                  href={action.href}
                  onClick={() => toast.info(`Navigating to ${action.label}...`)}
                  className="flex flex-col items-center gap-2.5 p-4 rounded-lg border transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 group"
                  style={{ borderColor: "var(--color-border)", background: "var(--color-bg-secondary)" }}
                >
                  <div
                    className="w-10 h-10 rounded-md flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
                    style={{ background: action.bg, color: action.color }}
                  >
                    {action.icon}
                  </div>
                  <span className="text-xs font-semibold text-center leading-tight" style={{ color: "var(--color-text-secondary)" }}>
                    {action.label}
                  </span>
                </Link>
              ))}
            </div>
          </SectionCard>
          </Reveal>

          {/* Profile Completion */}
          <Reveal variant="up" delay={260}>
          <SectionCard
            title="Profile Checklist"
            action={<span className="text-xs font-bold shrink-0" style={{ color: "var(--color-primary-600)" }}>{checklistDone} / {profileChecklist.length} done</span>}
          >
            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 mb-5">
              <div className="relative w-16 h-16 shrink-0">
                <svg width={64} height={64} className="-rotate-90" viewBox="0 0 64 64">
                  <circle cx={32} cy={32} r={26} fill="none" stroke="var(--color-neutral-100)" strokeWidth={7} />
                  <circle
                    cx={32} cy={32} r={26} fill="none" stroke="var(--color-primary-500)" strokeWidth={7}
                    strokeDasharray={`${(profileScore / 100) * 2 * Math.PI * 26} ${2 * Math.PI * 26}`}
                    strokeLinecap="round"
                  />
                </svg>
                <span
                  className="absolute inset-0 flex items-center justify-center text-sm font-extrabold"
                  style={{ color: "var(--color-primary-600)" }}
                >{profileScore}%</span>
              </div>
              <div>
                <p className="text-sm font-bold" style={{ color: "var(--color-text-primary)" }}>
                  {profileScore >= 100 ? "Profile complete!" : "Almost there!"}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "var(--color-text-tertiary)" }}>
                  {profileScore >= 100
                    ? "Your profile is fully set up."
                    : `Complete ${profileChecklist.length - checklistDone} more item${profileChecklist.length - checklistDone === 1 ? "" : "s"} to unlock better matches`}
                </p>
              </div>
            </div>

            <div className="space-y-2.5">
              {profileChecklist.map((item) => (
                <div key={item.label} className="flex items-center gap-2.5">
                  {item.done ? (
                    <CheckCircle2 size={16} className="shrink-0" style={{ color: "var(--color-success-500)" }} />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 shrink-0" style={{ borderColor: "var(--color-neutral-300)" }} />
                  )}
                  <span
                    className={`text-sm ${item.done ? "line-through font-normal" : "font-semibold"}`}
                    style={{ color: item.done ? "var(--color-text-tertiary)" : "var(--color-text-primary)" }}
                  >
                    {item.label}
                  </span>
                </div>
              ))}
            </div>

            <Link
              href="/profile"
              onClick={() => toast.info("Opening profile editor...")}
              className="mt-5 w-full flex items-center justify-center gap-2 py-2.5 rounded-md text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 transition-all duration-200 active:scale-95"
            >
              Complete Profile <ArrowRight size={13} />
            </Link>
          </SectionCard>
          </Reveal>
        </div>
      </div>

    </div>
  );
}
