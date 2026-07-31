import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  applyToJob,
  createJob,
  type CreateJobApplicationDto,
  type CreateJobDto,
} from "./jobs.api";

/**
 * Each mutation branches on `demoMode`: demo is a no-op (the calling component
 * keeps its optimistic local state — e.g. PostedJobsProvider stays the demo
 * source for posted jobs), and live calls the API then invalidates the affected
 * query keys. Demo mode never hits the network.
 */

/** POST /jobs — Post-a-Job wizard submit. */
export function useCreateJob() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<{ slug?: string }, Error, CreateJobDto>({
    // PostJobComposer awaits mutateAsync and toasts its own error in a catch;
    // the global MutationCache handler still fires, so silence its duplicate.
    meta: { silentError: true },
    mutationFn: async (dto) => {
      if (demoMode) return {};
      const res = await createJob(dto);
      return { slug: res.slug };
    },
    onSuccess: (_res, dto) => {
      void queryClient.invalidateQueries({ queryKey: ["jobs"] });
      void queryClient.invalidateQueries({ queryKey: ["companies"] });
      if (dto.companySlug) {
        void queryClient.invalidateQueries({
          queryKey: ["company", dto.companySlug],
        });
      }
    },
  });
}

/**
 * POST /jobs/:slug/applications — apply flow. On a duplicate application the API
 * answers 409; the error propagates as an `ApiError` so the caller can surface a
 * clear "you've already applied" state.
 */
export function useApplyToJob(slug: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<void, Error, CreateJobApplicationDto>({
    // JobApplyPage toasts its own error (incl. the 409 "already applied"), so
    // silence the global duplicate.
    meta: { silentError: true },
    mutationFn: async (dto) => {
      if (demoMode) return;
      await applyToJob(slug, dto);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["job", slug] });
      void queryClient.invalidateQueries({ queryKey: ["my-applications"] });
    },
  });
}
