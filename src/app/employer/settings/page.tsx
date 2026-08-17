"use client";

import React, { useState, useEffect } from "react";
import {
  Building2,
  Users,
  Bell,
  CreditCard,
  Sliders,
  Shield,
  Plus,
  Trash2,
  ShieldCheck,
  Save,
  Loader2,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/data-display/badge";
import { Modal } from "@/shared/components/ui/modal";
import { Skeleton } from "@/shared/components/feedback/skeleton";
import { toast } from "@/stores/toast-store";
import {
  useEmployerCompany,
  useUpdateCompany,
  useVerifyCompanyEmail,
} from "@/features/employer/hooks/use-employer";

type Section = "profile" | "preferences" | "team" | "notifications" | "billing";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Lead Recruiter" | "Hiring Manager";
  status: "Active" | "Invited";
}

const INITIAL_TEAM: TeamMember[] = [
  {
    id: "tm-1",
    name: "Sarah Jenkins",
    email: "sarah.j@company.com",
    role: "Admin",
    status: "Active",
  },
  {
    id: "tm-2",
    name: "Marcus Vance",
    email: "marcus.v@company.com",
    role: "Lead Recruiter",
    status: "Active",
  },
  {
    id: "tm-3",
    name: "Emily Wong",
    email: "emily.w@company.com",
    role: "Hiring Manager",
    status: "Invited",
  },
];

export default function EmployerSettingsPage() {
  const [activeSection, setActiveSection] = useState<Section>("profile");
  const { data: company, isLoading: isCompanyLoading } = useEmployerCompany();
  const updateCompanyMutation = useUpdateCompany();
  const verifyCompanyMutation = useVerifyCompanyEmail();

  // Profile Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [website, setWebsite] = useState("");
  const [industry, setIndustry] = useState("");
  const [size, setSize] = useState("");
  const [foundedYear, setFoundedYear] = useState<number | string>("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");

  // Hiring Preferences State
  const [minMatchThreshold, setMinMatchThreshold] = useState(70);
  const [defaultRemoteType, setDefaultRemoteType] = useState("HYBRID");
  const [autoArchiveUnfit, setAutoArchiveUnfit] = useState(false);
  const [allowExternalLinks, setAllowExternalLinks] = useState(true);

  // Notification Preferences State
  const [emailNewApplicant, setEmailNewApplicant] = useState(true);
  const [emailDailyDigest, setEmailDailyDigest] = useState(true);
  const [emailOfferUpdates, setEmailOfferUpdates] = useState(true);
  const [weeklyAnalyticsSummary, setWeeklyAnalyticsSummary] = useState(false);

  // Team State
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(INITIAL_TEAM);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<TeamMember["role"]>("Lead Recruiter");

  useEffect(() => {
    if (company) {
      setName(company.name || "");
      setDescription(company.description || "");
      setWebsite(company.website || "");
      setIndustry(company.industry || "");
      setSize(company.size || "");
      setFoundedYear(company.foundedYear || "");
      setCity(company.city || "");
      setState(company.state || "");
      setCountry(company.country || "");
    }
  }, [company]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!company) {
      toast.success("Organization profile settings saved!");
      return;
    }

    updateCompanyMutation.mutate(
      {
        companyId: company.id,
        input: {
          name,
          description: description || undefined,
          website: website || undefined,
          industry: industry || undefined,
          size: size || undefined,
          foundedYear: foundedYear ? Number(foundedYear) : undefined,
          city: city || undefined,
          state: state || undefined,
          country: country || undefined,
        },
      },
      {
        onSuccess: () => {
          toast.success("Company profile updated successfully!");
        },
        onError: (err) => {
          toast.error(err instanceof Error ? err.message : "Failed to update profile.");
        },
      }
    );
  };

  const handleInviteMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    const newMember: TeamMember = {
      id: `tm-${Date.now()}`,
      name: inviteEmail.split("@")[0],
      email: inviteEmail,
      role: inviteRole,
      status: "Invited",
    };

    setTeamMembers((prev) => [...prev, newMember]);
    setInviteEmail("");
    setIsInviteModalOpen(false);
    toast.success(`Invitation sent to ${inviteEmail}!`);
  };

  const handleRemoveMember = (id: string, memberName: string) => {
    setTeamMembers((prev) => prev.filter((m) => m.id !== id));
    toast.info(`Removed ${memberName} from team.`);
  };

  const handleTriggerEmailVerification = () => {
    if (!company) {
      toast.success("Verification link sent to your registered work email.");
      return;
    }
    verifyCompanyMutation.mutate(company.id, {
      onSuccess: () => {
        toast.success("Domain verification email dispatched!");
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : "Could not send verification email.");
      },
    });
  };

  const SECTIONS = [
    { id: "profile", label: "Company Profile", icon: Building2, desc: "Organization identity & brand" },
    { id: "preferences", label: "Hiring Preferences", icon: Sliders, desc: "Matching rules & defaults" },
    { id: "team", label: "Team & Permissions", icon: Users, desc: "Recruiters & access roles" },
    { id: "notifications", label: "Notifications", icon: Bell, desc: "Email digests & candidate alerts" },
    { id: "billing", label: "Plan & Billing", icon: CreditCard, desc: "Subscription tier & credits" },
  ] as const;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* ── Header ── */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-content">Company Settings</h1>
        <p className="text-sm mt-0.5 text-content-secondary">
          Manage your organization details, automated screening criteria, and recruiter permissions.
        </p>
      </div>

      {/* ── Two-Column Layout ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* ── Nav List ── */}
        <div className="md:col-span-1 space-y-1.5">
          {SECTIONS.map((s) => {
            const Icon = s.icon;
            const isActive = activeSection === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-3 ${
                  isActive
                    ? "bg-primary-50 border-primary-200 text-primary-700 dark:bg-primary-950 dark:border-primary-800 dark:text-primary-300 shadow-sm"
                    : "bg-card border-border text-content-secondary hover:bg-neutral-50 dark:hover:bg-neutral-800/40"
                }`}
              >
                <Icon size={18} className={`mt-0.5 shrink-0 ${isActive ? "text-primary-600" : ""}`} />
                <div className="min-w-0">
                  <div className="text-xs font-bold">{s.label}</div>
                  <div className="text-[11px] opacity-75 truncate">{s.desc}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* ── Content Card ── */}
        <div className="md:col-span-3">
          {/* Profile Section */}
          {activeSection === "profile" && (
            <div className="p-6 sm:p-8 rounded-2xl border border-border bg-card shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <h2 className="text-lg font-bold text-content">Organization Profile</h2>
                  <p className="text-xs text-content-secondary mt-0.5">
                    This information appears on public job postings and candidate invitations.
                  </p>
                </div>
                {company?.isVerified ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-success-50 text-success-700 border border-success-200 dark:bg-success-950 dark:text-success-300">
                    <ShieldCheck size={14} />
                    <span>Verified Employer</span>
                  </span>
                ) : (
                  <Button variant="outline" size="sm" onClick={handleTriggerEmailVerification}>
                    <Shield size={13} className="mr-1.5" />
                    <span>Verify Work Domain</span>
                  </Button>
                )}
              </div>

              {isCompanyLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-10 rounded-lg" />
                  <Skeleton className="h-24 rounded-lg" />
                  <div className="grid grid-cols-2 gap-4">
                    <Skeleton className="h-10 rounded-lg" />
                    <Skeleton className="h-10 rounded-lg" />
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-content uppercase tracking-wider mb-1.5">
                        Company Name
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Acme Corporation"
                        className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-card text-content text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-content uppercase tracking-wider mb-1.5">
                        Official Website
                      </label>
                      <input
                        type="url"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        placeholder="https://example.com"
                        className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-card text-content text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-content uppercase tracking-wider mb-1.5">
                      Company Overview & Bio
                    </label>
                    <textarea
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Briefly describe your company mission, culture, and core technologies…"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-card text-content text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-content uppercase tracking-wider mb-1.5">
                        Industry
                      </label>
                      <input
                        type="text"
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                        placeholder="e.g. Fintech, Healthcare"
                        className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-card text-content text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-content uppercase tracking-wider mb-1.5">
                        Company Size
                      </label>
                      <select
                        value={size}
                        onChange={(e) => setSize(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-card text-content text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                      >
                        <option value="">Select size</option>
                        <option value="1-10 employees">1-10 employees</option>
                        <option value="11-50 employees">11-50 employees</option>
                        <option value="51-200 employees">51-200 employees</option>
                        <option value="201-1,000 employees">201-1,000 employees</option>
                        <option value="1,000+ employees">1,000+ employees</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-content uppercase tracking-wider mb-1.5">
                        Founded Year
                      </label>
                      <input
                        type="number"
                        value={foundedYear}
                        onChange={(e) => setFoundedYear(e.target.value)}
                        placeholder="e.g. 2021"
                        className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-card text-content text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-content uppercase tracking-wider mb-1.5">
                        City
                      </label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="San Francisco"
                        className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-card text-content text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-content uppercase tracking-wider mb-1.5">
                        State / Province
                      </label>
                      <input
                        type="text"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        placeholder="CA"
                        className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-card text-content text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-content uppercase tracking-wider mb-1.5">
                        Country
                      </label>
                      <input
                        type="text"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        placeholder="United States"
                        className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-card text-content text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={updateCompanyMutation.isPending}
                    >
                      {updateCompanyMutation.isPending ? (
                        <Loader2 size={16} className="animate-spin mr-2" />
                      ) : (
                        <Save size={16} className="mr-2" />
                      )}
                      <span>Save Changes</span>
                    </Button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Hiring Preferences Section */}
          {activeSection === "preferences" && (
            <div className="p-6 sm:p-8 rounded-2xl border border-border bg-card shadow-sm space-y-6">
              <div className="border-b border-border pb-4">
                <h2 className="text-lg font-bold text-content">Hiring & Screening Defaults</h2>
                <p className="text-xs text-content-secondary mt-0.5">
                  Configure how AI screening algorithms evaluate incoming candidate resumes.
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-content uppercase tracking-wider">
                      Minimum Match Score for Fast-Track
                    </label>
                    <span className="text-sm font-bold text-primary-600">
                      {minMatchThreshold}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="95"
                    step="5"
                    value={minMatchThreshold}
                    onChange={(e) => setMinMatchThreshold(Number(e.target.value))}
                    className="w-full accent-primary-600 cursor-pointer"
                  />
                  <p className="text-[11px] text-content-tertiary mt-1">
                    Candidates scoring at or above this threshold receive automated recommendation flags.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-content uppercase tracking-wider mb-1.5">
                      Default Work Model
                    </label>
                    <select
                      value={defaultRemoteType}
                      onChange={(e) => setDefaultRemoteType(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-card text-content text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                    >
                      <option value="REMOTE">Remote (Work from Anywhere)</option>
                      <option value="HYBRID">Hybrid (Flexible Office / Home)</option>
                      <option value="ON_SITE">On-Site (Office Required)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoArchiveUnfit}
                      onChange={(e) => setAutoArchiveUnfit(e.target.checked)}
                      className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500"
                    />
                    <div>
                      <div className="text-xs font-semibold text-content">
                        Auto-categorize below 40% match
                      </div>
                      <div className="text-[11px] text-content-tertiary">
                        Moves highly mismatched applications directly to review bucket.
                      </div>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={allowExternalLinks}
                      onChange={(e) => setAllowExternalLinks(e.target.checked)}
                      className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500"
                    />
                    <div>
                      <div className="text-xs font-semibold text-content">
                        Allow external applicant URLs
                      </div>
                      <div className="text-[11px] text-content-tertiary">
                        Direct candidates to an external ATS if needed.
                      </div>
                    </div>
                  </label>
                </div>

                <div className="pt-4 flex justify-end">
                  <Button
                    variant="primary"
                    onClick={() => toast.success("Hiring preferences updated!")}
                  >
                    <Save size={16} className="mr-2" />
                    <span>Update Preferences</span>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Team Section */}
          {activeSection === "team" && (
            <div className="p-6 sm:p-8 rounded-2xl border border-border bg-card shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <h2 className="text-lg font-bold text-content">Team & Recruiter Access</h2>
                  <p className="text-xs text-content-secondary mt-0.5">
                    Manage team members who can post jobs and review applicant pipelines.
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsInviteModalOpen(true)}
                >
                  <Plus size={14} className="mr-1.5" />
                  <span>Invite Member</span>
                </Button>
              </div>

              <div className="divide-y divide-border border border-border rounded-xl overflow-hidden">
                {teamMembers.map((member) => (
                  <div
                    key={member.id}
                    className="p-4 flex items-center justify-between gap-4 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs text-white shrink-0"
                        style={{
                          background:
                            "linear-gradient(135deg, var(--color-primary-700), var(--color-primary-500))",
                        }}
                      >
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-content">{member.name}</div>
                        <div className="text-xs text-content-secondary">{member.email}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge tone={member.role === "Admin" ? "primary" : "neutral"}>
                        {member.role}
                      </Badge>
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                          member.status === "Active"
                            ? "bg-success-50 text-success-700 dark:bg-success-950 dark:text-success-300"
                            : "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                        }`}
                      >
                        {member.status}
                      </span>
                      {member.role !== "Admin" && (
                        <button
                          onClick={() => handleRemoveMember(member.id, member.name)}
                          className="text-neutral-400 hover:text-rose-600 p-1 transition-colors"
                          title="Remove Member"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notifications Section */}
          {activeSection === "notifications" && (
            <div className="p-6 sm:p-8 rounded-2xl border border-border bg-card shadow-sm space-y-6">
              <div className="border-b border-border pb-4">
                <h2 className="text-lg font-bold text-content">Recruiting Notifications</h2>
                <p className="text-xs text-content-secondary mt-0.5">
                  Control alert frequencies for new applications and candidate pipeline events.
                </p>
              </div>

              <div className="space-y-4">
                {[
                  {
                    title: "Instant Candidate Application Alerts",
                    desc: "Receive an email as soon as a qualified candidate submits their resume.",
                    state: emailNewApplicant,
                    setter: setEmailNewApplicant,
                  },
                  {
                    title: "Daily Applicant Pipeline Digest",
                    desc: "A summary email every morning with candidate counts and high-match highlights.",
                    state: emailDailyDigest,
                    setter: setEmailDailyDigest,
                  },
                  {
                    title: "Offer & Negotiation Updates",
                    desc: "Get notified when a candidate views, responds to, or discusses an offer.",
                    state: emailOfferUpdates,
                    setter: setEmailOfferUpdates,
                  },
                  {
                    title: "Weekly Hiring Analytics Report",
                    desc: "Performance breakdown of views, conversion rates, and time-to-hire metrics.",
                    state: weeklyAnalyticsSummary,
                    setter: setWeeklyAnalyticsSummary,
                  },
                ].map((item, i) => (
                  <label
                    key={i}
                    className="p-4 rounded-xl border border-border bg-card flex items-start justify-between gap-4 cursor-pointer hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition-colors"
                  >
                    <div>
                      <div className="text-xs font-bold text-content">{item.title}</div>
                      <div className="text-xs text-content-secondary mt-0.5">{item.desc}</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={item.state}
                      onChange={(e) => item.setter(e.target.checked)}
                      className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500 mt-1"
                    />
                  </label>
                ))}

                <div className="pt-2 flex justify-end">
                  <Button
                    variant="primary"
                    onClick={() => toast.success("Notification preferences saved!")}
                  >
                    <Save size={16} className="mr-2" />
                    <span>Save Notifications</span>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Billing & Plan Section */}
          {activeSection === "billing" && (
            <div className="p-6 sm:p-8 rounded-2xl border border-border bg-card shadow-sm space-y-6">
              <div className="border-b border-border pb-4">
                <h2 className="text-lg font-bold text-content">Subscription & Billing</h2>
                <p className="text-xs text-content-secondary mt-0.5">
                  Manage active job slots, recruiter seats, and payment methods.
                </p>
              </div>

              <div className="p-5 rounded-xl border border-primary-200 bg-primary-50/50 dark:bg-primary-950/20 dark:border-primary-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2">
                    <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-primary-600 text-white">
                      GROWTH PLAN
                    </span>
                    <span className="text-xs text-content-secondary">• Renews on March 1, 2026</span>
                  </div>
                  <div className="text-sm font-bold text-content mt-1.5">
                    10 Active Job Slots • Unlimited AI Screening • 5 Recruiter Seats
                  </div>
                </div>
                <Button
                  variant="primary"
                  onClick={() => toast.info("Opening subscription upgrade dialog…")}
                >
                  Upgrade Plan
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-border bg-card">
                  <div className="text-xs font-semibold uppercase text-content-tertiary">
                    Active Job Slots
                  </div>
                  <div className="text-xl font-bold text-content mt-1">4 / 10 used</div>
                </div>
                <div className="p-4 rounded-xl border border-border bg-card">
                  <div className="text-xs font-semibold uppercase text-content-tertiary">
                    AI Match Credits
                  </div>
                  <div className="text-xl font-bold text-success-600 mt-1">Unlimited</div>
                </div>
                <div className="p-4 rounded-xl border border-border bg-card">
                  <div className="text-xs font-semibold uppercase text-content-tertiary">
                    Direct Contact Credits
                  </div>
                  <div className="text-xl font-bold text-primary-600 mt-1">85 / 100 left</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Invite Team Member Modal ── */}
      {isInviteModalOpen && (
        <Modal
          open={isInviteModalOpen}
          onClose={() => setIsInviteModalOpen(false)}
          title="Invite Team Member"
        >
          <form onSubmit={handleInviteMember} className="space-y-4 text-sm">
            <div>
              <label className="block text-xs font-bold text-content uppercase tracking-wider mb-1.5">
                Colleague Work Email
              </label>
              <input
                type="email"
                required
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="colleague@yourcompany.com"
                className="w-full px-3.5 py-2 rounded-lg border border-border bg-card text-content text-sm focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-content uppercase tracking-wider mb-1.5">
                Role & Permission Level
              </label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as TeamMember["role"])}
                className="w-full px-3.5 py-2 rounded-lg border border-border bg-card text-content text-sm focus:ring-2 focus:ring-primary-500 outline-none"
              >
                <option value="Lead Recruiter">Lead Recruiter (Create jobs, manage applicants)</option>
                <option value="Hiring Manager">Hiring Manager (Review applicants & notes)</option>
                <option value="Admin">Admin (Full billing & team access)</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsInviteModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Send Invitation
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
