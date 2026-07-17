"use client";

import React, { useEffect, useState } from "react";
import { User, Phone, MapPin, Briefcase, Linkedin, Github, Globe } from "lucide-react";
import { TextField } from "@/shared/components/ui/text-field";
import { Textarea } from "@/shared/components/ui/form-controls";
import { Button } from "@/shared/components/ui/button";
import { Alert } from "@/shared/components/feedback/alert";
import { ApiError } from "@/lib/api/client";
import type { CreateProfileInput } from "../api/profile.api";
import type { ProfileView } from "../api/profile.mappers";

export interface ProfileFormValues {
  firstName: string;
  lastName: string;
  phone: string;
  headline: string;
  bio: string;
  city: string;
  state: string;
  country: string;
  linkedinUrl: string;
  githubUrl: string;
  portfolioUrl: string;
}

const EMPTY: ProfileFormValues = {
  firstName: "", lastName: "", phone: "", headline: "", bio: "",
  city: "", state: "", country: "", linkedinUrl: "", githubUrl: "", portfolioUrl: "",
};

export function profileToFormValues(profile: ProfileView | null): ProfileFormValues {
  if (!profile) return EMPTY;
  return {
    firstName: profile.firstName,
    lastName: profile.lastName,
    phone: profile.phone,
    headline: profile.headline,
    bio: profile.bio,
    city: profile.location?.city ?? "",
    state: profile.location?.state ?? "",
    country: profile.location?.country ?? "",
    linkedinUrl: profile.linkedinUrl,
    githubUrl: profile.githubUrl,
    portfolioUrl: profile.portfolioUrl,
  };
}

/**
 * Form values -> CreateProfileDto/UpdateProfileDto.
 *
 * `location` is all-or-nothing: LocationDto requires city AND country, so a
 * half-filled address is omitted rather than sent and rejected with a 400.
 */
export function formValuesToInput(values: ProfileFormValues): CreateProfileInput {
  const blankToUndefined = (v: string) => (v.trim() ? v.trim() : undefined);
  const hasLocation = Boolean(values.city.trim() && values.country.trim());

  return {
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    phone: blankToUndefined(values.phone),
    headline: blankToUndefined(values.headline),
    bio: blankToUndefined(values.bio),
    location: hasLocation
      ? {
          city: values.city.trim(),
          state: blankToUndefined(values.state),
          country: values.country.trim(),
        }
      : undefined,
    linkedinUrl: blankToUndefined(values.linkedinUrl),
    githubUrl: blankToUndefined(values.githubUrl),
    portfolioUrl: blankToUndefined(values.portfolioUrl),
  };
}

interface ProfileFormProps {
  initial?: ProfileView | null;
  /** Prefill used when the profile doesn't exist yet (from the session name). */
  fallbackName?: { firstName: string; lastName: string };
  onSubmit: (values: ProfileFormValues) => Promise<unknown>;
  isSubmitting?: boolean;
  error?: unknown;
  submitLabel?: string;
  /** Hidden on the onboarding step to keep it short. */
  showSocialLinks?: boolean;
  footer?: React.ReactNode;
}

/** Identity, contact, location and social links — POST /profiles, PATCH /profiles/{userId}. */
export function ProfileForm({
  initial,
  fallbackName,
  onSubmit,
  isSubmitting = false,
  error,
  submitLabel = "Save changes",
  showSocialLinks = true,
  footer,
}: ProfileFormProps) {
  const [values, setValues] = useState<ProfileFormValues>(() => ({
    ...profileToFormValues(initial ?? null),
    firstName: initial?.firstName || fallbackName?.firstName || "",
    lastName: initial?.lastName || fallbackName?.lastName || "",
  }));

  // Re-sync when the profile arrives after the first render.
  useEffect(() => {
    if (!initial) return;
    setValues(profileToFormValues(initial));
  }, [initial]);

  const set = <K extends keyof ProfileFormValues>(key: K) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setValues((prev) => ({ ...prev, [key]: e.target.value }));

  const canSubmit = Boolean(values.firstName.trim() && values.lastName.trim()) && !isSubmitting;
  // Validation errors return one message per field; show them all.
  const errorMessage =
    error instanceof ApiError
      ? error.messages.join(" ")
      : error
        ? "Could not save your profile."
        : "";

  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        void onSubmit(values);
      }}
    >
      {errorMessage && <Alert variant="error">{errorMessage}</Alert>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextField
          id="firstName"
          label="First Name"
          icon={User}
          required
          placeholder="Jane"
          value={values.firstName}
          onChange={set("firstName")}
        />
        <TextField
          id="lastName"
          label="Last Name"
          required
          placeholder="Doe"
          value={values.lastName}
          onChange={set("lastName")}
        />
      </div>

      <TextField
        id="headline"
        label="Headline"
        icon={Briefcase}
        placeholder="Senior Frontend Engineer"
        value={values.headline}
        onChange={set("headline")}
        hint="A short professional title shown on your profile."
      />

      <TextField
        id="phone"
        label="Phone"
        icon={Phone}
        type="tel"
        placeholder="+855 12 345 678"
        value={values.phone}
        onChange={set("phone")}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <TextField
          id="city"
          label="City"
          icon={MapPin}
          placeholder="Phnom Penh"
          value={values.city}
          onChange={set("city")}
        />
        <TextField
          id="state"
          label="State / Region"
          placeholder="Optional"
          value={values.state}
          onChange={set("state")}
        />
        <TextField
          id="country"
          label="Country"
          placeholder="Cambodia"
          value={values.country}
          onChange={set("country")}
          hint="City and country save together."
        />
      </div>

      <Textarea
        id="bio"
        label="About"
        rows={4}
        placeholder="A few sentences about your experience and what you're looking for…"
        value={values.bio}
        onChange={set("bio")}
      />

      {showSocialLinks && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <TextField
            id="linkedinUrl"
            label="LinkedIn"
            icon={Linkedin}
            placeholder="https://linkedin.com/in/…"
            value={values.linkedinUrl}
            onChange={set("linkedinUrl")}
          />
          <TextField
            id="githubUrl"
            label="GitHub"
            icon={Github}
            placeholder="https://github.com/…"
            value={values.githubUrl}
            onChange={set("githubUrl")}
          />
          <TextField
            id="portfolioUrl"
            label="Portfolio"
            icon={Globe}
            placeholder="https://…"
            value={values.portfolioUrl}
            onChange={set("portfolioUrl")}
          />
        </div>
      )}

      {footer ?? (
        <div className="flex justify-end">
          <Button type="submit" loading={isSubmitting} loadingText="Saving…" disabled={!canSubmit}>
            {submitLabel}
          </Button>
        </div>
      )}
    </form>
  );
}
