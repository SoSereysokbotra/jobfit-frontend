"use client";

import React from "react";
import { Mail, Phone, MapPin, User } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Skeleton } from "@/shared/components/feedback/skeleton";
import { Alert } from "@/shared/components/feedback/alert";
import { EmptyState } from "@/shared/components/data-display/empty-state";
import type { ParsedResumeDataDto } from "../api/resume.api";

interface ParsedDataViewProps {
  parsed: ParsedResumeDataDto | null;
  isLoading?: boolean;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-2">
        {title}
      </h3>
      {children}
    </div>
  );
}

/**
 * What the parser extracted from the resume.
 *
 * TODO(backend): mock-backed. ParsedResumeData exists in the database but no
 * endpoint returns it (ResumeResponseDto has no `parsedData`), so this renders
 * placeholder content behind the real shape — see resume.api.ts getParsedData.
 */
export function ParsedDataView({ parsed, isLoading = false }: ParsedDataViewProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-3 w-2/3" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (!parsed) {
    return (
      <EmptyState
        icon={<User className="w-6 h-6" />}
        title="Nothing parsed yet"
        description="Once analysis finishes, the details we extracted appear here."
      />
    );
  }

  return (
    <div className="space-y-6">
      <Alert variant="info">
        Preview only — the backend doesn&apos;t expose parsed resume data yet.
      </Alert>

      <Section title="Contact">
        <div className="space-y-1.5">
          {parsed.fullName && (
            <p className="text-sm font-bold text-neutral-900">{parsed.fullName}</p>
          )}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-neutral-500">
            {parsed.email && (
              <span className="inline-flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" /> {parsed.email}
              </span>
            )}
            {parsed.phone && (
              <span className="inline-flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" /> {parsed.phone}
              </span>
            )}
            {parsed.location && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" /> {parsed.location}
              </span>
            )}
          </div>
        </div>
      </Section>

      {parsed.summary && (
        <Section title="Summary">
          <p className="text-sm text-neutral-600">{parsed.summary}</p>
        </Section>
      )}

      {parsed.skills.length > 0 && (
        <Section title="Skills">
          <div className="flex flex-wrap gap-1.5">
            {parsed.skills.map((skill) => (
              <Badge key={skill} variant="primary">{skill}</Badge>
            ))}
          </div>
        </Section>
      )}

      {parsed.experiences.length > 0 && (
        <Section title="Experience">
          <div className="space-y-2.5">
            {parsed.experiences.map((exp) => (
              <div key={`${exp.company}-${exp.title}`} className="flex justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-neutral-900 truncate">{exp.title}</p>
                  <p className="text-xs text-neutral-500 truncate">{exp.company}</p>
                </div>
                {exp.dates && (
                  <span className="text-xs text-neutral-400 shrink-0">{exp.dates}</span>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {parsed.educations.length > 0 && (
        <Section title="Education">
          <div className="space-y-2.5">
            {parsed.educations.map((edu) => (
              <div key={`${edu.institution}-${edu.degree}`} className="flex justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-neutral-900 truncate">{edu.degree}</p>
                  <p className="text-xs text-neutral-500 truncate">{edu.institution}</p>
                </div>
                {edu.dates && (
                  <span className="text-xs text-neutral-400 shrink-0">{edu.dates}</span>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {parsed.certifications.length > 0 && (
        <Section title="Certifications">
          <div className="flex flex-wrap gap-1.5">
            {parsed.certifications.map((cert) => (
              <Badge key={cert} variant="neutral">{cert}</Badge>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}
