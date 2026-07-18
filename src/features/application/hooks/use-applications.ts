"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { qk } from "@/lib/api/query-keys";
import type { Job } from "@/shared/types/shared.types";
import { jobApi } from "@/features/job/api/job.api";
import { toJobView } from "@/features/job/api/job.mappers";
import {
  applicationApi,
  type ApplicationStatus,
  type ContactPersonInput,
  type SubmitApplicationInput,
} from "../api/application.api";
import { toApplicationView, toTimelineView } from "../api/application.mappers";

/**
 * Resolve the public jobs referenced by a set of applications. There is no
 * batch jobs-by-ids endpoint, so we fan out one GET /jobs/{id} per unique id and
 * tolerate misses (a closed/removed posting) by mapping it to null.
 */
async function resolveJobs(jobIds: string[]): Promise<Map<string, Job | null>> {
  const ids = [...new Set(jobIds)];
  const entries = await Promise.all(
    ids.map(async (id) => {
      try {
        return [id, toJobView(await jobApi.get(id))] as const;
      } catch {
        return [id, null] as const;
      }
    }),
  );
  return new Map(entries);
}

/** The current user's applications (optionally filtered), enriched with job info. */
export function useApplications(status?: ApplicationStatus) {
  return useQuery({
    queryKey: qk.applications.list({ status: status ?? null }),
    queryFn: async () => {
      const apps = await applicationApi.list(status);
      const jobs = await resolveJobs(apps.map((a) => a.jobId));
      return apps.map((a) => toApplicationView(a, jobs.get(a.jobId) ?? null));
    },
    staleTime: 30_000,
  });
}

/** A single application by id, enriched with its job. */
export function useApplication(id: string | undefined) {
  return useQuery({
    queryKey: qk.applications.detail(id ?? ""),
    queryFn: async () => {
      const app = await applicationApi.get(id as string);
      const job = await jobApi
        .get(app.jobId)
        .then(toJobView)
        .catch(() => null);
      return toApplicationView(app, job);
    },
    enabled: Boolean(id),
  });
}

/** Timeline entries for an application. */
export function useApplicationTimeline(id: string | undefined) {
  return useQuery({
    queryKey: qk.applications.timeline(id ?? ""),
    queryFn: async () => (await applicationApi.timeline(id as string)).map(toTimelineView),
    enabled: Boolean(id),
  });
}

/** Submit an application to a job. Invalidates the list on success. */
export function useSubmitApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: SubmitApplicationInput) => applicationApi.submit(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.applications.all });
    },
  });
}

/** Move an application to a new pipeline status. */
export function useUpdateApplicationStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, newStatus }: { id: string; newStatus: ApplicationStatus }) =>
      applicationApi.updateStatus(id, newStatus),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: qk.applications.detail(id) });
      qc.invalidateQueries({ queryKey: qk.applications.timeline(id) });
      qc.invalidateQueries({ queryKey: qk.applications.lists() });
    },
  });
}

/** Attach a contact person to an application. */
export function useAddContactPerson(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ContactPersonInput) => applicationApi.addContactPerson(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.applications.detail(id) });
    },
  });
}
