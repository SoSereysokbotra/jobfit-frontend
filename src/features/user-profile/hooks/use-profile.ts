"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { qk } from "@/lib/api/query-keys";
import { ApiError } from "@/lib/api/client";
import { useSession } from "@/features/auth/hooks/use-session";
import {
  profileApi,
  type AddEducationInput,
  type AddExperienceInput,
  type AddSkillInput,
  type CreateProfileInput,
  type UpdateProfileInput,
  type WorkPreferencesInput,
} from "../api/profile.api";
import {
  toEducationView,
  toExperienceView,
  toProfileView,
  type ProfileView,
} from "../api/profile.mappers";

/** The current user's id, or undefined before the session resolves. */
function useUserId(): string | undefined {
  const { user } = useSession();
  return user?.id;
}

/**
 * The current user's profile. A 404 is a normal state — it means "not created
 * yet" — so it resolves to `null` rather than an error, and is not retried.
 */
export function useProfile() {
  const userId = useUserId();

  const query = useQuery({
    queryKey: qk.profiles.detail(userId ?? "anonymous"),
    queryFn: async (): Promise<ProfileView | null> => {
      try {
        return toProfileView(await profileApi.get(userId!));
      } catch (error) {
        if (error instanceof ApiError && error.statusCode === 404) return null;
        throw error;
      }
    },
    enabled: Boolean(userId),
  });

  return {
    profile: query.data ?? null,
    isLoading: query.isPending && Boolean(userId),
    error: query.error,
    /** False once loaded with no profile — drives the onboarding redirect. */
    hasProfile: Boolean(query.data),
  };
}

/**
 * Whether the user has completed onboarding, i.e. has a profile.
 *
 * This replaces the mock session's `onboardingComplete` flag: the backend has no
 * such field on the user, so "onboarded" is derived from the profile existing.
 * `isResolved` guards redirects — never bounce while this is false.
 */
export function useProfileComplete() {
  const { user } = useSession();
  const { profile, isLoading, hasProfile } = useProfile();

  return {
    hasProfile,
    isResolved: Boolean(user) && !isLoading,
    profile,
  };
}

export function useCreateProfile() {
  const userId = useUserId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateProfileInput) => profileApi.create(input),
    onSuccess: (dto) => {
      // Seed the cache so the redirect that follows sees the profile immediately
      // instead of flashing the "no profile" state.
      queryClient.setQueryData(qk.profiles.detail(userId ?? dto.userId), toProfileView(dto));
    },
  });
}

export function useUpdateProfile() {
  const userId = useUserId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateProfileInput) => profileApi.update(userId!, input),
    onSuccess: (dto) => {
      queryClient.setQueryData(qk.profiles.detail(userId!), toProfileView(dto));
    },
  });
}

/** PATCH /profiles/{userId}/preferences — separate endpoint from the profile PATCH. */
export function useUpdatePreferences() {
  const userId = useUserId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (prefs: WorkPreferencesInput) => profileApi.updatePreferences(userId!, prefs),
    onSuccess: (dto) => {
      queryClient.setQueryData(qk.profiles.detail(userId!), toProfileView(dto));
    },
  });
}

/** PATCH /profiles/{userId}/salary — also its own endpoint. */
export function useUpdateSalary() {
  const userId = useUserId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ minSalary, maxSalary }: { minSalary: number; maxSalary: number }) =>
      profileApi.updateSalary(userId!, minSalary, maxSalary),
    onSuccess: (dto) => {
      queryClient.setQueryData(qk.profiles.detail(userId!), toProfileView(dto));
    },
  });
}

// ---- Experience ----

export function useExperience() {
  const userId = useUserId();

  const query = useQuery({
    queryKey: qk.profiles.experience(userId ?? "anonymous"),
    queryFn: async () => (await profileApi.listExperience(userId!)).map(toExperienceView),
    enabled: Boolean(userId),
  });

  return {
    experience: query.data ?? [],
    isLoading: query.isPending && Boolean(userId),
    error: query.error,
  };
}

export function useExperienceMutations() {
  const userId = useUserId();
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: qk.profiles.experience(userId!) });

  const add = useMutation({
    mutationFn: (input: AddExperienceInput) => profileApi.addExperience(userId!, input),
    onSuccess: invalidate,
  });
  const update = useMutation({
    mutationFn: ({ expId, input }: { expId: string; input: Partial<AddExperienceInput> }) =>
      profileApi.updateExperience(userId!, expId, input),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: (expId: string) => profileApi.deleteExperience(userId!, expId),
    onSuccess: invalidate,
  });

  return { add, update, remove };
}

// ---- Education ----

export function useEducation() {
  const userId = useUserId();

  const query = useQuery({
    queryKey: qk.profiles.education(userId ?? "anonymous"),
    queryFn: async () => (await profileApi.listEducation(userId!)).map(toEducationView),
    enabled: Boolean(userId),
  });

  return {
    education: query.data ?? [],
    isLoading: query.isPending && Boolean(userId),
    error: query.error,
  };
}

export function useEducationMutations() {
  const userId = useUserId();
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: qk.profiles.education(userId!) });

  const add = useMutation({
    mutationFn: (input: AddEducationInput) => profileApi.addEducation(userId!, input),
    onSuccess: invalidate,
  });
  const update = useMutation({
    mutationFn: ({ eduId, input }: { eduId: string; input: Partial<AddEducationInput> }) =>
      profileApi.updateEducation(userId!, eduId, input),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: (eduId: string) => profileApi.deleteEducation(userId!, eduId),
    onSuccess: invalidate,
  });

  return { add, update, remove };
}

// ---- Skills (mock-backed; see profile.api.ts TODO(backend)) ----

export function useSkills() {
  const userId = useUserId();

  const query = useQuery({
    queryKey: qk.profiles.skills(userId ?? "anonymous"),
    queryFn: () => profileApi.listSkills(userId!),
    enabled: Boolean(userId),
  });

  const catalogue = useQuery({
    queryKey: [...qk.profiles.all, "skill-catalogue"] as const,
    queryFn: () => profileApi.listSkillCatalogue(),
    // The catalogue is effectively static; don't refetch it per mount.
    staleTime: Infinity,
  });

  return {
    skills: query.data ?? [],
    catalogue: catalogue.data ?? [],
    isLoading: query.isPending && Boolean(userId),
  };
}

export function useSkillMutations() {
  const userId = useUserId();
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: qk.profiles.skills(userId!) });

  const add = useMutation({
    mutationFn: (input: AddSkillInput) => profileApi.addSkill(userId!, input),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: (skillId: string) => profileApi.removeSkill(userId!, skillId),
    onSuccess: invalidate,
  });
  const endorse = useMutation({
    mutationFn: (skillId: string) => profileApi.endorseSkill(userId!, skillId),
    onSuccess: invalidate,
  });

  return { add, remove, endorse };
}
