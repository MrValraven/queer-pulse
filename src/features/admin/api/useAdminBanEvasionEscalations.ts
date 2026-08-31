import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useDemoAwareMutation } from "./demoAwareMutation";
import {
  getBanEvasionEscalations,
  resolveBanEvasionEscalation,
  type BanEvasionEscalationDTO,
  type BanEvasionEscalationStatus,
} from "./adminBanEvasionEscalations.api";

/** Shared prefix for the escalation queue. The full key also carries `demoMode`
 *  and the status being read. Mirrors the `["ban-evasion", ...]` prefix the
 *  per-request and per-user assessment queries already use. */
export const BAN_EVASION_ESCALATIONS_KEY = [
  "ban-evasion",
  "escalations",
] as const;

/**
 * The escalation queue at one status, newest first (the backend owns that
 * sort).
 *
 * Demo mode serves the colocated fixture and never touches the network:
 * `/admin/ban-evasion/escalations` is `@Roles(Moderator, Admin)` and 403s
 * otherwise, and the fixture is fabricated data that must not surface as
 * platform truth.
 *
 * The whole query is returned, `isError` included, and `retry: false` so a
 * failed read reaches the reviewer as a failure straight away. A queue that
 * collapsed a failed fetch into an empty array would tell a moderator that
 * nobody is waiting on them, which is the one thing this screen must never say
 * by accident.
 */
export function useBanEvasionEscalations(status: BanEvasionEscalationStatus) {
  const { demoMode } = useDemoMode();
  return useQuery<BanEvasionEscalationDTO[]>({
    queryKey: [...BAN_EVASION_ESCALATIONS_KEY, demoMode, status],
    retry: false,
    queryFn: async () => {
      if (demoMode) {
        const { ADMIN_BAN_EVASION_ESCALATIONS_DEMO } =
          await import("../adminBanEvasionEscalations.data");
        return ADMIN_BAN_EVASION_ESCALATIONS_DEMO.filter(
          (escalation) => escalation.status === status,
        );
      }
      return getBanEvasionEscalations(status);
    },
  });
}

export interface ResolveEscalationVars {
  escalation: BanEvasionEscalationDTO;
  resolutionNote: string | null;
}

/**
 * Close one escalation.
 *
 * This is the queue's only write, and it still bans nobody: it records that a
 * staff member looked, and it releases the "one open escalation per (community,
 * join request)" lock so the community can ask again later.
 *
 * `resolutionNote` stays on this console. It is never returned on any
 * community-scoped surface, which is what keeps the one-bit boundary the whole
 * feature rests on intact.
 *
 * The cache is invalidated from the RESULT rather than patched optimistically:
 * a row only leaves the open queue once the write is real.
 */
export function useResolveBanEvasionEscalation() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useDemoAwareMutation<
    BanEvasionEscalationDTO,
    Error,
    ResolveEscalationVars
  >({
    demoMode,
    demoLatencyMs: 0,
    meta: { silentError: true }, // AdminBanEvasionEscalationsPage toasts locally
    demoResult: ({ escalation, resolutionNote }) => ({
      ...escalation,
      status: "resolved" as const,
      resolvedAt: new Date().toISOString(),
      resolutionNote,
      resolvedBy: escalation.resolvedBy,
    }),
    live: ({ escalation, resolutionNote }) =>
      resolveBanEvasionEscalation(escalation.id, resolutionNote),
    logLabel: "admin.banEvasionEscalation.resolve",
    logContext: ({ escalation }) => ({ id: escalation.id }),
    onLiveSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: BAN_EVASION_ESCALATIONS_KEY,
      });
    },
  });
}
