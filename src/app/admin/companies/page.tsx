"use client";

import React, { useMemo, useState } from "react";
import {
  Search,
  Building2,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldCheck,
  MapPin,
  Eye,
} from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { Badge } from "@/shared/components/data-display/badge";
import { EmptyState } from "@/shared/components/data-display/empty-state";
import { Button } from "@/shared/components/ui/button";
import { Modal } from "@/shared/components/ui/modal";
import { useDebounce } from "@/shared/hooks/use-debounce";
import { toast } from "@/stores/toast-store";

interface AdminCompany {
  id: string;
  name: string;
  website: string;
  industry: string;
  size: string;
  location: string;
  isVerified: boolean;
  verificationMethod: string | null;
  activeJobsCount: number;
  createdAt: string;
  contactEmail: string;
  description: string;
}

const INITIAL_COMPANIES: AdminCompany[] = [
  {
    id: "comp-1",
    name: "Stripe",
    website: "https://stripe.com",
    industry: "Fintech & Payments",
    size: "5,000+ employees",
    location: "San Francisco, CA",
    isVerified: true,
    verificationMethod: "DOMAIN_DNS",
    activeJobsCount: 14,
    createdAt: "2025-09-15T08:30:00Z",
    contactEmail: "recruiting@stripe.com",
    description: "Financial infrastructure platform for the internet.",
  },
  {
    id: "comp-2",
    name: "Figma",
    website: "https://figma.com",
    industry: "Design & Software",
    size: "1,000-5,000 employees",
    location: "San Francisco, CA",
    isVerified: true,
    verificationMethod: "MANUAL_REVIEW",
    activeJobsCount: 8,
    createdAt: "2025-10-02T11:20:00Z",
    contactEmail: "talent@figma.com",
    description: "Collaborative interface design tool and creative ecosystem.",
  },
  {
    id: "comp-3",
    name: "Linear Technologies",
    website: "https://linear.app",
    industry: "Productivity Software",
    size: "50-200 employees",
    location: "San Francisco, CA",
    isVerified: true,
    verificationMethod: "DOMAIN_DNS",
    activeJobsCount: 5,
    createdAt: "2025-11-18T14:10:00Z",
    contactEmail: "hiring@linear.app",
    description: "Issue tracking and project management built for high-performance software teams.",
  },
  {
    id: "comp-4",
    name: "Apex AI Labs",
    website: "https://apexailabs.io",
    industry: "Artificial Intelligence",
    size: "10-50 employees",
    location: "Austin, TX",
    isVerified: false,
    verificationMethod: null,
    activeJobsCount: 3,
    createdAt: "2026-01-20T09:45:00Z",
    contactEmail: "founders@apexailabs.io",
    description: "Autonomous agent infrastructure for enterprise workflows.",
  },
  {
    id: "comp-5",
    name: "Nexus Cloud Systems",
    website: "https://nexuscloud.example",
    industry: "Cloud Infrastructure",
    size: "200-500 employees",
    location: "Seattle, WA",
    isVerified: false,
    verificationMethod: null,
    activeJobsCount: 2,
    createdAt: "2026-02-05T16:00:00Z",
    contactEmail: "hr@nexuscloud.example",
    description: "Enterprise multi-cloud orchestration and observability.",
  },
];

const FILTERS = ["All", "Verified", "Unverified", "Has Active Jobs"] as const;

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState<AdminCompany[]>(INITIAL_COMPANIES);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [selectedCompany, setSelectedCompany] = useState<AdminCompany | null>(null);

  const debouncedQuery = useDebounce(query, 250);

  const filteredCompanies = useMemo(() => {
    return companies.filter((c) => {
      const matchesQuery =
        debouncedQuery.trim() === "" ||
        c.name.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
        c.industry.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
        c.location.toLowerCase().includes(debouncedQuery.toLowerCase());

      if (!matchesQuery) return false;
      if (filter === "Verified") return c.isVerified;
      if (filter === "Unverified") return !c.isVerified;
      if (filter === "Has Active Jobs") return c.activeJobsCount > 0;
      return true;
    });
  }, [companies, debouncedQuery, filter]);

  const stats = useMemo(() => {
    const total = companies.length;
    const verified = companies.filter((c) => c.isVerified).length;
    const unverified = total - verified;
    const totalJobs = companies.reduce((acc, c) => acc + c.activeJobsCount, 0);
    return { total, verified, unverified, totalJobs };
  }, [companies]);

  const toggleVerification = (companyId: string) => {
    setCompanies((prev) =>
      prev.map((c) => {
        if (c.id === companyId) {
          const nextState = !c.isVerified;
          toast.success(
            nextState
              ? `${c.name} has been verified.`
              : `${c.name} verification has been revoked.`
          );
          return {
            ...c,
            isVerified: nextState,
            verificationMethod: nextState ? "MANUAL_ADMIN" : null,
          };
        }
        return c;
      })
    );
    if (selectedCompany && selectedCompany.id === companyId) {
      setSelectedCompany((prev) =>
        prev
          ? {
              ...prev,
              isVerified: !prev.isVerified,
              verificationMethod: !prev.isVerified ? "MANUAL_ADMIN" : null,
            }
          : null
      );
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* ── Page Title & Overview ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-content">Company Management</h1>
          <p className="text-sm mt-1 text-content-secondary">
            Review, verify, and moderate registered employer organizations.
          </p>
        </div>
      </div>

      {/* ── Stat Cards Row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-border bg-card shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-content-tertiary">
            Total Companies
          </div>
          <div className="text-2xl font-extrabold text-content mt-1.5">{stats.total}</div>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-content-tertiary">
            Verified Employers
          </div>
          <div className="text-2xl font-extrabold text-success-600 mt-1.5">{stats.verified}</div>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-content-tertiary">
            Pending / Unverified
          </div>
          <div className="text-2xl font-extrabold text-amber-600 mt-1.5">{stats.unverified}</div>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-content-tertiary">
            Active Job Postings
          </div>
          <div className="text-2xl font-extrabold text-primary-600 mt-1.5">{stats.totalJobs}</div>
        </div>
      </div>

      {/* ── Search & Filter Controls ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-content-tertiary" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by company name, industry, or location…"
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

      {/* ── Companies Table ── */}
      {filteredCompanies.length === 0 ? (
        <EmptyState
          icon={<Building2 size={28} />}
          title="No companies found"
          description="Try adjusting your search criteria or active filter."
        />
      ) : (
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-neutral-50/50 dark:bg-neutral-800/40 text-left text-content-tertiary">
                  <th className="font-semibold text-xs uppercase tracking-wider px-5 py-3.5">
                    Company
                  </th>
                  <th className="font-semibold text-xs uppercase tracking-wider px-5 py-3.5 hidden md:table-cell">
                    Industry
                  </th>
                  <th className="font-semibold text-xs uppercase tracking-wider px-5 py-3.5 hidden sm:table-cell">
                    Location
                  </th>
                  <th className="font-semibold text-xs uppercase tracking-wider px-5 py-3.5 text-center">
                    Active Jobs
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
                {filteredCompanies.map((comp) => (
                  <tr
                    key={comp.id}
                    className="hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm text-white shrink-0 shadow-sm"
                          style={{
                            background:
                              "linear-gradient(135deg, var(--color-primary-700), var(--color-primary-500))",
                          }}
                        >
                          {comp.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-content flex items-center gap-1.5">
                            <span>{comp.name}</span>
                            {comp.isVerified && (
                              <ShieldCheck size={14} className="text-success-600" />
                            )}
                          </div>
                          <a
                            href={comp.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary-600 hover:underline flex items-center gap-1 mt-0.5"
                          >
                            <span>{comp.website.replace(/^https?:\/\//, "")}</span>
                            <ExternalLink size={10} />
                          </a>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 hidden md:table-cell text-content-secondary text-xs">
                      <div>{comp.industry}</div>
                      <div className="text-[11px] text-content-tertiary mt-0.5">{comp.size}</div>
                    </td>

                    <td className="px-5 py-4 hidden sm:table-cell text-content-secondary text-xs">
                      <div className="flex items-center gap-1">
                        <MapPin size={12} className="text-content-tertiary" />
                        <span>{comp.location}</span>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 text-content">
                        {comp.activeJobsCount}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      {comp.isVerified ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-success-50 text-success-700 border border-success-200 dark:bg-success-950 dark:border-success-800 dark:text-success-300">
                          <CheckCircle2 size={12} />
                          <span>Verified</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950 dark:border-amber-800 dark:text-amber-300">
                          <Clock size={12} />
                          <span>Unverified</span>
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedCompany(comp)}
                        >
                          <Eye size={13} className="mr-1" />
                          <span>Details</span>
                        </Button>
                        <Button
                          variant={comp.isVerified ? "outline" : "primary"}
                          size="sm"
                          onClick={() => toggleVerification(comp.id)}
                        >
                          {comp.isVerified ? "Revoke" : "Verify"}
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

      {/* ── Company Detail Modal ── */}
      {selectedCompany && (
        <Modal
          open={Boolean(selectedCompany)}
          onClose={() => setSelectedCompany(null)}
          title={`Company Details: ${selectedCompany.name}`}
        >
          <div className="space-y-5 text-sm">
            <div className="flex items-start gap-4 p-4 rounded-lg bg-neutral-50 dark:bg-neutral-800/40 border border-border">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg text-white shrink-0"
                style={{
                  background:
                    "linear-gradient(135deg, var(--color-primary-700), var(--color-primary-500))",
                }}
              >
                {selectedCompany.name.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-base text-content flex items-center gap-2">
                  <span>{selectedCompany.name}</span>
                  {selectedCompany.isVerified && (
                    <Badge tone="success">
                      Verified
                    </Badge>
                  )}
                </h3>
                <p className="text-xs text-content-secondary mt-1">
                  {selectedCompany.description}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg border border-border bg-card">
                <div className="text-[11px] font-semibold text-content-tertiary uppercase">
                  Industry & Size
                </div>
                <div className="text-xs font-bold text-content mt-1">
                  {selectedCompany.industry}
                </div>
                <div className="text-xs text-content-secondary mt-0.5">
                  {selectedCompany.size}
                </div>
              </div>

              <div className="p-3 rounded-lg border border-border bg-card">
                <div className="text-[11px] font-semibold text-content-tertiary uppercase">
                  Headquarters & Website
                </div>
                <div className="text-xs font-bold text-content mt-1">
                  {selectedCompany.location}
                </div>
                <a
                  href={selectedCompany.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary-600 hover:underline flex items-center gap-1 mt-0.5"
                >
                  {selectedCompany.website}
                  <ExternalLink size={10} />
                </a>
              </div>
            </div>

            <div className="p-3 rounded-lg border border-border bg-card">
              <div className="text-[11px] font-semibold text-content-tertiary uppercase">
                Contact & Verification
              </div>
              <div className="text-xs text-content mt-1">
                <span className="font-medium text-content-secondary">Contact Email: </span>
                <span className="font-semibold">{selectedCompany.contactEmail}</span>
              </div>
              <div className="text-xs text-content mt-1">
                <span className="font-medium text-content-secondary">Verification Method: </span>
                <span className="font-semibold">
                  {selectedCompany.verificationMethod || "None"}
                </span>
              </div>
              <div className="text-xs text-content mt-1">
                <span className="font-medium text-content-secondary">Member Since: </span>
                <span>{new Date(selectedCompany.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-border">
              <Button
                variant={selectedCompany.isVerified ? "outline" : "primary"}
                onClick={() => toggleVerification(selectedCompany.id)}
              >
                {selectedCompany.isVerified ? "Revoke Verification" : "Approve & Verify Company"}
              </Button>
              <Button variant="secondary" onClick={() => setSelectedCompany(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
