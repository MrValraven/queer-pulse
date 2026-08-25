import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  closeOpportunity,
  createOpportunity,
  decideSignup,
  signUpForOpportunity,
  updateOpportunity,
  withdrawSignup,
  type CreateOpportunityDto,
  type UpdateOpportunityDto,
} from "./volunteering.api";
import type { SignupRow } from "./volunteering.adapters";
import { opportunityKeys } from "./opportunityKeys";

/**
 * Every mutation branches on `demoMode`: in demo it's a no-op (the calling
 * component keeps its optimistic local state / shows the success panel exactly
 * as the prototype already does), and in live mode it calls the API then
 * invalidates the affected query keys. Demo mode must never hit the network.
 */

/** POST /volunteering — the "Post an opportunity" create flow submit. */
export function useCreateOpportunity() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<{ slug?: string }, Error, CreateOpportunityDto>({
    // PostVolunteerOpportunityPage toasts its own error, so silence the global
    // duplicate.
    meta: { silentError: true },
    mutationFn: async (dto) => {
      if (demoMode) {
        // Preserve the "publishing…" beat, no network.
        await new Promise((r) => setTimeout(r, 650));
        return {};
      }
      const res = await createOpportunity(dto);
      return { slug: res.slug };
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: opportunityKeys.listRoot,
      });
    },
  });
}

/** PATCH /volunteering/:slug — poster edits an opportunity they posted. Demo
 * mode keeps the "saving…" beat with no network; the calling page applies
 * the draft to its own local view of the opportunity either way (there's no
 * mock store to refetch from), matching `useCloseOpportunity`'s reliance on
 * mutation state rather than query data for the demo-mode reflection. */
export function useUpdateOpportunity(slug: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<void, Error, UpdateOpportunityDto>({
    mutationFn: async (dto) => {
      if (demoMode) {
        await new Promise((r) => setTimeout(r, 500));
        return;
      }
      await updateOpportunity(slug, dto);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: opportunityKeys.detailRoot,
      });
      void queryClient.invalidateQueries({
        queryKey: opportunityKeys.listRoot,
      });
    },
  });
}

/** POST /volunteering/:slug/close — poster closes the opportunity. */
export function useCloseOpportunity(slug: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<void, Error, void>({
    mutationFn: async () => {
      if (demoMode) return;
      await closeOpportunity(slug);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: opportunityKeys.detailRoot,
      });
      void queryClient.invalidateQueries({
        queryKey: opportunityKeys.listRoot,
      });
    },
  });
}

/**
 * POST /volunteering/:slug/signups — the apply/express-interest action. The
 * server returns 409 when the opportunity is full OR the member already signed
 * up; the calling component reads `ApiError.status` to surface the right copy.
 * Demo keeps a short "sending…" beat and resolves so the success panel shows.
 */
export function useSignup(slug: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<void, Error, { note?: string }>({
    mutationFn: async (vars) => {
      if (demoMode) {
        await new Promise((r) => setTimeout(r, 700));
        return;
      }
      await signUpForOpportunity(slug, vars.note);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: opportunityKeys.detailRoot,
      });
      void queryClient.invalidateQueries({
        queryKey: opportunityKeys.signupsRoot,
      });
    },
  });
}

/** DELETE /volunteering/:slug/signups — withdraw the viewer's own signup. */
export function useWithdrawSignup(slug: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<void, Error, void>({
    mutationFn: async () => {
      if (demoMode) return;
      await withdrawSignup(slug);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: opportunityKeys.detailRoot,
      });
      void queryClient.invalidateQueries({
        queryKey: opportunityKeys.signupsRoot,
      });
    },
  });
}

export interface DecideSignupVars {
  signupId: string;
  status: "accepted" | "declined";
}

/**
 * PATCH /volunteering/:slug/signups/:signupId — a poster accepts/declines an
 * applicant from the manage-applicants dashboard. Optimistically patches the
 * row's status in the cached signups list and rolls back on failure; demo
 * mode never calls the network (the optimistic patch is its whole result).
 */
export function useDecideSignup(slug: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const queryKey = opportunityKeys.signups(slug, demoMode);

  return useMutation<void, Error, DecideSignupVars, { previous?: SignupRow[] }>(
    {
      mutationFn: async ({ signupId, status }) => {
        if (demoMode) return;
        await decideSignup(slug, signupId, status);
      },
      onMutate: ({ signupId, status }) => {
        void queryClient.cancelQueries({ queryKey });
        const previous = queryClient.getQueryData<SignupRow[]>(queryKey);
        queryClient.setQueryData<SignupRow[]>(queryKey, (rows) =>
          rows?.map((row) => (row.id === signupId ? { ...row, status } : row)),
        );
        return { previous };
      },
      onError: (_err, _vars, context) => {
        if (context?.previous) {
          queryClient.setQueryData(queryKey, context.previous);
        }
      },
      onSettled: () => {
        if (!demoMode) {
          void queryClient.invalidateQueries({
            queryKey: opportunityKeys.signupsRoot,
          });
          void queryClient.invalidateQueries({
            queryKey: ["my-opportunities"],
          });
        }
      },
    },
  );
}
