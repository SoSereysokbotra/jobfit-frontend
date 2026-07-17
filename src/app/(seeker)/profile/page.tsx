"use client";

import React, { useState } from "react";
import Link from "next/link";
import { UserCircle2, MapPin, Mail, Phone, Linkedin, Github, Globe } from "lucide-react";
import {
  ProfileForm,
  CareerPreferencesForm,
  SkillsEditor,
  ExperienceList,
  EducationList,
  formValuesToInput,
} from "@/features/user-profile/components";
import {
  useProfile,
  useCreateProfile,
  useUpdateProfile,
  useUpdatePreferences,
  useUpdateSalary,
  useExperience,
  useExperienceMutations,
  useEducation,
  useEducationMutations,
  useSkills,
  useSkillMutations,
} from "@/features/user-profile/hooks/use-profile";
import { profileCompleteness } from "@/features/user-profile/api/profile.mappers";
import { useSession, displayName } from "@/features/auth/hooks/use-session";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Skeleton } from "@/shared/components/feedback/skeleton";
import { Alert } from "@/shared/components/feedback/alert";
import { cn } from "@/shared/utils/cn";

type TabId = "about" | "experience" | "education" | "skills" | "preferences";

const TABS: { id: TabId; label: string }[] = [
  { id: "about", label: "About" },
  { id: "experience", label: "Experience" },
  { id: "education", label: "Education" },
  { id: "skills", label: "Skills" },
  { id: "preferences", label: "Preferences" },
];

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-card p-5 sm:p-6 shadow-sm">{children}</div>
  );
}

export default function ProfilePage() {
  const { user } = useSession();
  const { profile, isLoading, hasProfile } = useProfile();
  const [tab, setTab] = useState<TabId>("about");

  const createProfile = useCreateProfile();
  const updateProfile = useUpdateProfile();
  const updatePreferences = useUpdatePreferences();
  const updateSalary = useUpdateSalary();

  const { experience, isLoading: experienceLoading } = useExperience();
  const experienceMutations = useExperienceMutations();
  const { education, isLoading: educationLoading } = useEducation();
  const educationMutations = useEducationMutations();
  const { skills, catalogue, isLoading: skillsLoading } = useSkills();
  const skillMutations = useSkillMutations();

  const [savedMessage, setSavedMessage] = useState("");
  const flashSaved = (message: string) => {
    setSavedMessage(message);
    setTimeout(() => setSavedMessage(""), 2500);
  };

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        <Skeleton className="h-32 w-full rounded-lg" />
        <Skeleton className="h-10 w-full max-w-md rounded-md" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    );
  }

  const completeness = profileCompleteness(profile);
  const { initials } = displayName(user);

  // No profile yet: the page doubles as the create form rather than showing an
  // empty shell. POST /profiles, not PATCH.
  if (!hasProfile) {
    const fallback = displayName(user);
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Create your profile</h1>
          <p className="text-sm text-neutral-500 mt-1">
            This is what employers see when you apply. You can refine it any time.
          </p>
        </div>
        <SectionCard>
          <ProfileForm
            fallbackName={{ firstName: fallback.firstName, lastName: fallback.lastName }}
            onSubmit={async (values) => {
              await createProfile.mutateAsync(formValuesToInput(values));
              flashSaved("Profile created.");
            }}
            isSubmitting={createProfile.isPending}
            error={createProfile.error}
            submitLabel="Create profile"
          />
        </SectionCard>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      {savedMessage && <Alert variant="success">{savedMessage}</Alert>}

      {/* ── HEADER ─────────────────────────────────────────── */}
      <SectionCard>
        <div className="flex flex-col sm:flex-row sm:items-start gap-5">
          <div
            className="w-20 h-20 rounded-full shrink-0 flex items-center justify-center text-2xl font-bold"
            style={{ background: "var(--color-primary-100)", color: "var(--color-primary-700)" }}
          >
            {initials}
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-neutral-900 truncate">
              {profile!.fullName}
            </h1>
            {profile!.headline && (
              <p className="text-sm text-neutral-600 mt-0.5">{profile!.headline}</p>
            )}

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 text-xs text-neutral-500">
              {profile!.locationLabel && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> {profile!.locationLabel}
                </span>
              )}
              {user?.email && (
                <span className="inline-flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" /> {user.email}
                </span>
              )}
              {profile!.phone && (
                <span className="inline-flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" /> {profile!.phone}
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-2 mt-3">
              {profile!.linkedinUrl && (
                <Link href={profile!.linkedinUrl} target="_blank" className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-600 hover:underline">
                  <Linkedin className="w-3.5 h-3.5" /> LinkedIn
                </Link>
              )}
              {profile!.githubUrl && (
                <Link href={profile!.githubUrl} target="_blank" className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-600 hover:underline">
                  <Github className="w-3.5 h-3.5" /> GitHub
                </Link>
              )}
              {profile!.portfolioUrl && (
                <Link href={profile!.portfolioUrl} target="_blank" className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-600 hover:underline">
                  <Globe className="w-3.5 h-3.5" /> Portfolio
                </Link>
              )}
            </div>
          </div>

          {/* Completeness meter — derived client-side; the backend has no such field. */}
          <div className="sm:w-40 shrink-0">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                Complete
              </span>
              <span className="text-xs font-bold text-primary-700">{completeness}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-neutral-100 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${completeness}%`, background: "var(--color-primary-500)" }}
              />
            </div>
            {profile!.salaryLabel && (
              <div className="mt-3">
                <Badge variant="primary">{profile!.salaryLabel}</Badge>
              </div>
            )}
          </div>
        </div>
      </SectionCard>

      {/* ── TABS ───────────────────────────────────────────── */}
      <div
        className="flex gap-1 overflow-x-auto border-b"
        style={{ borderColor: "var(--color-border)" }}
        role="tablist"
      >
        {TABS.map((item) => (
          <button
            key={item.id}
            role="tab"
            aria-selected={tab === item.id}
            onClick={() => setTab(item.id)}
            className={cn(
              "px-4 py-2.5 text-sm font-semibold whitespace-nowrap border-b-2 -mb-px transition-all duration-200",
              tab === item.id
                ? "border-primary-500 text-primary-700"
                : "border-transparent text-neutral-500 hover:text-neutral-700",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* ── PANELS ─────────────────────────────────────────── */}
      {tab === "about" && (
        <SectionCard>
          <ProfileForm
            initial={profile}
            onSubmit={async (values) => {
              await updateProfile.mutateAsync(formValuesToInput(values));
              flashSaved("Profile updated.");
            }}
            isSubmitting={updateProfile.isPending}
            error={updateProfile.error}
          />
        </SectionCard>
      )}

      {tab === "experience" && (
        <SectionCard>
          <ExperienceList
            experience={experience}
            isLoading={experienceLoading}
            onAdd={(input) => experienceMutations.add.mutateAsync(input)}
            onUpdate={(expId, input) => experienceMutations.update.mutateAsync({ expId, input })}
            onRemove={(expId) => experienceMutations.remove.mutateAsync(expId)}
            isMutating={
              experienceMutations.add.isPending ||
              experienceMutations.update.isPending ||
              experienceMutations.remove.isPending
            }
            error={experienceMutations.add.error ?? experienceMutations.update.error}
          />
        </SectionCard>
      )}

      {tab === "education" && (
        <SectionCard>
          <EducationList
            education={education}
            isLoading={educationLoading}
            onAdd={(input) => educationMutations.add.mutateAsync(input)}
            onUpdate={(eduId, input) => educationMutations.update.mutateAsync({ eduId, input })}
            onRemove={(eduId) => educationMutations.remove.mutateAsync(eduId)}
            isMutating={
              educationMutations.add.isPending ||
              educationMutations.update.isPending ||
              educationMutations.remove.isPending
            }
            error={educationMutations.add.error ?? educationMutations.update.error}
          />
        </SectionCard>
      )}

      {tab === "skills" && (
        <SectionCard>
          <SkillsEditor
            skills={skills}
            catalogue={catalogue}
            isLoading={skillsLoading}
            onAdd={(input) => skillMutations.add.mutateAsync(input)}
            onRemove={(skillId) => skillMutations.remove.mutateAsync(skillId)}
            onEndorse={(skillId) => skillMutations.endorse.mutateAsync(skillId)}
            isMutating={
              skillMutations.add.isPending ||
              skillMutations.remove.isPending ||
              skillMutations.endorse.isPending
            }
          />
        </SectionCard>
      )}

      {tab === "preferences" && (
        <SectionCard>
          <CareerPreferencesForm
            profile={profile}
            onSavePreferences={async (prefs) => {
              await updatePreferences.mutateAsync(prefs);
              flashSaved("Preferences updated.");
            }}
            onSaveSalary={(range) => updateSalary.mutateAsync(range)}
            isSubmitting={updatePreferences.isPending || updateSalary.isPending}
            error={updatePreferences.error ?? updateSalary.error}
          />
        </SectionCard>
      )}
    </div>
  );
}
