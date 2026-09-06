import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  DEMO_ADMIN_NOMINATIONS,
  DEMO_NOMINATION_AUDIT,
} from "../safeSpaceGovernance.data";
import {
  acknowledgeNomination,
  assignNomination,
  decideNomination,
  getAdminNominationAudit,
  getAdminNominations,
  reopenNomination,
  type AdminNominationsQueryInput,
  type AdminSafeSpaceNominationDTO,
  type DecideNominationInput,
  type SafeSpaceAuditDTO,
} from "./safeSpaceGovernance.api";

export const ADMIN_SAFE_SPACE_NOMINATIONS_KEY = "admin-safe-space-nominations";
export const ADMIN_SAFE_SPACE_NOMINATION_AUDIT_KEY =
  "admin-safe-space-nomination-audit";

/** The open queue, filtered by the demo fixture the same way the API filters. */
function filterDemoNominations(
  query: AdminNominationsQueryInput,
): AdminSafeSpaceNominationDTO[] {
  const scope = query.scope ?? "open";
  return DEMO_ADMIN_NOMINATIONS.filter((nomination) => {
    if (query.status && nomination.status !== query.status) return false;
    if (
      scope === "open" &&
      !["pending", "acknowledged", "in_review"].includes(nomination.status)
    ) {
      return false;
    }
    if (
      scope === "decided" &&
      !["approved", "rejected"].includes(nomination.status)
    ) {
      return false;
    }
    if (query.breachedOnly && !nomination.hasBreachedAcknowledgement)
      return false;
    if (query.assignedOnly && !nomination.listingId) return false;
    if (
      query.search &&
      !nomination.placeName.toLowerCase().includes(query.search.toLowerCase())
    ) {
      return false;
    }
    return true;
  }).sort((first, second) =>
    query.sort === "newest"
      ? second.receivedAt.localeCompare(first.receivedAt)
      : first.receivedAt.localeCompare(second.receivedAt),
  );
}

/**
 * The moderator's safe-space nomination queue. Demo mode serves the colocated
 * fixture and never hits the network: this is a Moderator/Admin-only endpoint
 * that 403s for anyone else, and the fixture is invented data that must never
 * read as platform truth.
 */
export function useAdminSafeSpaceNominations(
  query: AdminNominationsQueryInput,
) {
  const { demoMode } = useDemoMode();
  const result = useQuery<{
    items: AdminSafeSpaceNominationDTO[];
    total: number;
  }>({
    queryKey: [ADMIN_SAFE_SPACE_NOMINATIONS_KEY, query, demoMode],
    queryFn: async () => {
      if (demoMode) {
        const items = filterDemoNominations(query);
        return { items, total: items.length };
      }
      return getAdminNominations(query);
    },
  });
  return {
    ...result,
    nominations: result.data?.items ?? [],
    total: result.data?.total ?? 0,
  };
}

/** The audit trail for one nomination: every act on it, newest first. */
export function useAdminSafeSpaceNominationAudit(id: string | null) {
  const { demoMode } = useDemoMode();
  const result = useQuery<SafeSpaceAuditDTO[]>({
    queryKey: [ADMIN_SAFE_SPACE_NOMINATION_AUDIT_KEY, id, demoMode],
    enabled: Boolean(id),
    queryFn: async () => {
      if (demoMode) {
        return DEMO_NOMINATION_AUDIT.filter((row) => row.subjectId === id);
      }
      return getAdminNominationAudit(id ?? "");
    },
  });
  return { ...result, trail: result.data ?? [] };
}

export type NominationAction =
  | { kind: "acknowledge"; id: string; note?: string }
  | { kind: "assign"; id: string; listingRef: string; note?: string }
  | ({ kind: "decide"; id: string } & DecideNominationInput)
  | { kind: "reopen"; id: string; reason: string };

/**
 * Every write the review queue can make, behind one mutation so each caller
 * gets the same cache invalidation. Demo mode resolves without a network call
 * and without mutating the fixture: the operator sees the toast, and the
 * static tour stays static.
 */
export function useAdminSafeSpaceNominationAction() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<
    AdminSafeSpaceNominationDTO | null,
    Error,
    NominationAction
  >({
    mutationFn: async (action) => {
      if (demoMode) {
        await new Promise((resolve) => setTimeout(resolve, 400));
        return null;
      }
      if (action.kind === "acknowledge") {
        return acknowledgeNomination(action.id, { note: action.note });
      }
      if (action.kind === "assign") {
        return assignNomination(action.id, {
          listingRef: action.listingRef,
          note: action.note,
        });
      }
      if (action.kind === "reopen") {
        return reopenNomination(action.id, { reason: action.reason });
      }
      return decideNomination(action.id, {
        outcome: action.outcome,
        reason: action.reason,
        tier: action.tier,
        verifierLabel: action.verifierLabel,
        belowVisitBarReason: action.belowVisitBarReason,
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [ADMIN_SAFE_SPACE_NOMINATIONS_KEY],
      });
      void queryClient.invalidateQueries({
        queryKey: [ADMIN_SAFE_SPACE_NOMINATION_AUDIT_KEY],
      });
    },
  });
}
