"use client";

import React, { useEffect, useState } from "react";
import { Building2, CheckCircle2, Globe, ShieldCheck } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { Badge } from "@/shared/components/data-display/badge";
import { Button } from "@/shared/components/ui/button";
import { Alert } from "@/shared/components/feedback/alert";
import { Skeleton } from "@/shared/components/feedback/skeleton";
import {
  useEmployerCompany,
  useUpdateCompany,
  useVerifyCompanyEmail,
} from "@/features/employer/hooks/use-employer";

/** Display label -> backend size token (Company.size). */
const SIZES: { label: string; value: string }[] = [
  { label: "Startup (1–50)", value: "STARTUP" },
  { label: "Small (51–200)", value: "SMALL" },
  { label: "Mid-Size (201–1000)", value: "MEDIUM" },
  { label: "Large (1001–5000)", value: "LARGE" },
  { label: "Enterprise (5000+)", value: "ENTERPRISE" },
];

const INPUT = "w-full px-3 py-2.5 rounded-md border border-border bg-background text-content text-sm outline-none transition-all focus:ring-2 focus:ring-primary-500 focus:border-transparent";

export default function CompanyProfilePage() {
  const { data: company, isLoading } = useEmployerCompany();
  const updateCompany = useUpdateCompany();
  const verifyEmail = useVerifyCompanyEmail();

  const [description, setDescription] = useState("");
  const [size, setSize] = useState("");
  const [website, setWebsite] = useState("");
  const [saved, setSaved] = useState(false);

  // Seed the form once the company loads.
  useEffect(() => {
    if (company) {
      setDescription(company.description);
      setSize(company.size);
      setWebsite(company.website);
    }
  }, [company]);

  if (isLoading || !company) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto space-y-5">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 rounded-lg" />
      </div>
    );
  }

  const save = () => {
    setSaved(false);
    updateCompany.mutate(
      {
        companyId: company.id,
        input: {
          description: description.trim() || undefined,
          size: size || undefined,
          website: website.trim() || undefined,
        },
      },
      { onSuccess: () => setSaved(true) },
    );
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-content">Company Profile</h1>
          <p className="text-sm mt-1 text-content-secondary">How candidates see your company on JobFits.</p>
        </div>
        {company.isVerified ? (
          <Badge tone="success" dot>Verified</Badge>
        ) : (
          <Button
            variant="outline"
            className="text-xs py-2 px-3"
            loading={verifyEmail.isPending}
            loadingText="Verifying…"
            onClick={() => verifyEmail.mutate(company.id)}
          >
            <ShieldCheck size={14} /> Verify by email domain
          </Button>
        )}
      </div>

      {verifyEmail.isError && (
        <Alert variant="error">{verifyEmail.error instanceof Error ? verifyEmail.error.message : "Verification failed."}</Alert>
      )}

      <div className="rounded-lg border border-border bg-card shadow-sm p-5 sm:p-6 space-y-5">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl flex items-center justify-center text-white shrink-0 bg-gradient-primary">
            <Building2 size={26} />
          </div>
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2 text-content">
              {company.name}
              {company.isVerified && <CheckCircle2 size={16} className="text-success-500" />}
            </h2>
            {company.industry && <p className="text-xs text-content-tertiary mt-0.5">{company.industry}</p>}
          </div>
        </div>

        <Field label="Company Description">
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={cn(INPUT, "resize-y")}
          />
        </Field>

        <Field label="Company Size">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {SIZES.map((s) => (
              <label key={s.value} className={cn("flex items-center gap-2 px-3 py-2 rounded-md border cursor-pointer text-sm text-content transition-colors", size === s.value ? "border-primary-300 bg-primary-50" : "border-border bg-background")}>
                <input type="radio" name="size" checked={size === s.value} onChange={() => setSize(s.value)} className="w-4 h-4 accent-primary-600" />
                {s.label}
              </label>
            ))}
          </div>
        </Field>

        <Field label="Website">
          <div className="relative">
            <Globe size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-content-tertiary" />
            <input
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://example.com"
              className={cn(INPUT, "pl-9")}
            />
          </div>
        </Field>

        {updateCompany.isError && (
          <Alert variant="error">{updateCompany.error instanceof Error ? updateCompany.error.message : "Could not save changes."}</Alert>
        )}
        {saved && !updateCompany.isPending && <Alert variant="success">Company profile saved.</Alert>}
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="primary" loading={updateCompany.isPending} loadingText="Saving…" onClick={save}>Save Changes</Button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-content-tertiary">{label}</label>
      {children}
    </div>
  );
}
