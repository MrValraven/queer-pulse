import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  closeOpportunity,
  createOpportunity,
  signUpForOpportunity,
  withdrawSignup,
  type CreateOpportunityDto,
} from "./volunteering.api";

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
      queryClient.invalidateQueries({ queryKey: ["opportunities"] });
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
      queryClient.invalidateQueries({ queryKey: ["opportunity", slug] });
      queryClient.invalidateQueries({ queryKey: ["opportunities"] });
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
      queryClient.invalidateQueries({ queryKey: ["opportunity", slug] });
      queryClient.invalidateQueries({
        queryKey: ["opportunity-signups", slug],
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
      queryClient.invalidateQueries({ queryKey: ["opportunity", slug] });
      queryClient.invalidateQueries({
        queryKey: ["opportunity-signups", slug],
      });
    },
  });
}
