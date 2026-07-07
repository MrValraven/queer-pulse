import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  getPartnerApplications,
  triagePartnerApplication,
  type PartnerApplicationDTO,
  type TriagePartnerApplicationDto,
} from "./partners.api";
import { MOCK_PARTNER_APPLICATIONS } from "./partnerApplications.mock.data";

export type { PartnerApplicationDTO } from "./partners.api";
export {
  applicationToView,
  type PartnerApplicationView,
} from "./partners.adapters";

/**
 * Admin-only queue of partner applications. Demo mode returns the mock pending
 * queue with no network; live mode calls GET /partner-applications, which 403s
 * for a non-admin viewer (the caller surfaces that as a permission notice).
 */
export function usePartnerApplications() {
  const { demoMode } = useDemoMode();
  return useQuery<PartnerApplicationDTO[]>({
    queryKey: ["partner-applications", demoMode],
    queryFn: async () => {
      if (demoMode) return MOCK_PARTNER_APPLICATIONS;
      return getPartnerApplications();
    },
  });
}

/**
 * PATCH /partner-applications/:id — an admin approves or rejects an application.
 * Approving surfaces the org as a live partner; rejecting closes it out with an
 * optional note. Demo mode is a no-op (the caller keeps its optimistic local
 * state); live mode calls the API then invalidates the applications query.
 */
export function useTriagePartnerApplication() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<
    PartnerApplicationDTO | null,
    Error,
    { id: string; action: TriagePartnerApplicationDto["action"]; note?: string }
  >({
    mutationFn: async ({ id, action, note }) => {
      if (demoMode) return null;
      return triagePartnerApplication(id, {
        action,
        ...(note ? { note } : {}),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partner-applications"] });
      // An approval turns into a public partner → refresh the public listing too.
      queryClient.invalidateQueries({ queryKey: ["partners"] });
    },
  });
}
