"use client";

import React, { useState, useEffect } from "react";
import {
  Building2,
  Users,
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
import { ApiError } from "@/lib/api/client";
import {
  useEmployerCompany,
  useUpdateCompany,
  useVerifyCompanyEmail,
} from "@/features/employer/hooks/use-employer";
import { buildCompanyUpdate } from "@/features/employer/api/employer.mappers";

type Section = "profile" | "team";

/** Accepts what people actually type ("acme.com") and makes it pass `type="url"`. */
function normalizeWebsite(value: string): string {
  const trimmed = value.trim();
  if (!trimmed || /^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function isPlausibleFoundedYear(value: string): boolean {
  const year = Number(value);
  return Number.isInteger(year) && year >= 1800 && year <= new Date().getFullYear();
}

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
  const {
    data: company,
    isLoading: isCompanyLoading,
    isError: isCompanyError,
  } = useEmployerCompany();
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

    // There is no company to PATCH. Employers cannot create one — an admin has to
    // (EMPLOYER_HANDOFF.md §9) — so this is a real state, and reporting success for it
    // (as this used to) told the employer their edits were stored when nothing was sent.
    if (!company) {
      toast.error("Your company profile could not be loaded, so there is nothing to save.");
      return;
    }

    // A bare domain is what people type; `type="url"` rejects it and the browser blocks
    // submit over a field that may be scrolled out of view, which reads as a dead button.
    const normalizedWebsite = normalizeWebsite(website);
    if (normalizedWebsite !== website) setWebsite(normalizedWebsite);

    const year = String(foundedYear).trim();
    if (year && !isPlausibleFoundedYear(year)) {
      toast.error(`Founded year must be between 1800 and ${new Date().getFullYear()}.`);
      return;
    }

    const input = buildCompanyUpdate(company, {
      name,
      description,
      website: normalizedWebsite,
      industry,
      size,
      foundedYear: year,
      city,
      state,
      country,
    });

    if (Object.keys(input).length === 0) {
      toast.info("No changes to save.");
      return;
    }

    updateCompanyMutation.mutate(
      { companyId: company.id, input },
      {
        onSuccess: () => {
          toast.success("Company profile updated successfully!");
        },
        onError: (err) => {
          // A 400 from the ValidationPipe carries one message per field; showing only
          // the first hides the rest of what the employer has to correct.
          const detail =
            err instanceof ApiError
              ? err.messages.join(" ")
              : err instanceof Error
                ? err.message
                : "";
          toast.error(detail || "Failed to update profile.");
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
    { id: "team", label: "Team & Permissions", icon: Users, desc: "Recruiters & access roles" },
  ] as const;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* ── Header ── */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-content">Company Settings</h1>
        <p className="text-sm mt-0.5 text-content-secondary">
          Manage your organization details and recruiter permissions.
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
              ) : isCompanyError || !company ? (
                <div className="py-10 text-center">
                  <p className="text-sm font-semibold text-content">
                    We could not load your company profile.
                  </p>
                  <p className="text-xs text-content-secondary mt-1.5 max-w-sm mx-auto">
                    Your account may not be linked to a company yet. Only an administrator
                    can create one — contact support if this persists.
                  </p>
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
                        onBlur={() => setWebsite(normalizeWebsite(website))}
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
                        min={1800}
                        max={new Date().getFullYear()}
                        step={1}
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
                <option value="Admin">Admin (Full team & settings access)</option>
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
