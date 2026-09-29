import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useAuth } from "../../../app/providers/authContext";
import {
  getPartnerApplications,
  triagePartnerApplication,
  type PartnerApplicationDTO,
  type TriagePartnerApplicationDto,
} from "./partners.api";

export type { PartnerApplicationDTO } from "./partners.api";
export {
  applicationToView,
  type PartnerApplicationView,
} from "./partners.adapters";

/**
 * The staff queue of partner applications. Demo mode returns the mock pending
 * queue with no network; live mode calls GET /admin/partners/applications,
 * which admits an admin or a holder of the `partnerships` staff grant and
 * 403s for everyone else (the caller surfaces that as a permission notice).
 *
 * `assignedTo` is OPS-04's "Assigned to me" narrowing. Live mode sends it to
 * the server, because the queue is capped at a page size and filtering after
 * the fetch would hide claimed rows that had simply not loaded. Demo mode has
 * no server, so its fixture is narrowed here against the signed-in demo user,
 * which is enough to make the control do something with no network.
 *
 * Called without `assignedTo` (the sidebar badge) the key is unchanged from
 * before, so the rail and the page still share one cache entry.
 *
 * `isEnabled: false` mounts the hook without fetching, and stays out of the
 * key. The rail passes it for a viewer who is neither an admin nor a holder of
 * the `partnerships` grant, the two the endpoint admits.
 */
export function usePartnerApplications(
  options: { assignedTo?: "me" | "unassigned"; isEnabled?: boolean } = {},
) {
  const { demoMode } = useDemoMode();
  const { user } = useAuth();
  const { assignedTo, isEnabled = true } = options;
  return useQuery<PartnerApplicationDTO[]>({
    queryKey: ["partner-applications", demoMode, assignedTo],
    enabled: isEnabled,
    queryFn: async () => {
      if (demoMode) {
        const { MOCK_PARTNER_APPLICATIONS } =
          await import("./partnerApplications.mock.data");
        if (assignedTo === "unassigned") {
          return MOCK_PARTNER_APPLICATIONS.filter(
            (application) => application.assignedStaffId === null,
          );
        }
        if (assignedTo === "me") {
          const demoStaffId = user?.id ?? "demo-staff";
          return MOCK_PARTNER_APPLICATIONS.filter(
            (application) => application.assignedStaffId === demoStaffId,
          );
        }
        return MOCK_PARTNER_APPLICATIONS;
      }
      return getPartnerApplications(assignedTo ? { assignedTo } : {});
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
    // AdminPartnerApplicationsPage toasts its own error, so silence the global
    // duplicate.
    meta: { silentError: true },
    mutationFn: async ({ id, action, note }) => {
      if (demoMode) return null;
      return triagePartnerApplication(id, {
        action,
        ...(note ? { note } : {}),
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["partner-applications"],
      });
      // An approval turns into a public partner → refresh the public listing too.
      void queryClient.invalidateQueries({ queryKey: ["partners"] });
    },
  });
}
