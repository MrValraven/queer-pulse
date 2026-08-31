import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useDemoAwareMutation } from "./demoAwareMutation";
import {
  applyMemberRelink,
  dismissMemberRelink,
  getMemberAccountRecovery,
  liftEmailSuppression,
  lookupEmailSuppression,
  reactivateMember,
  type EmailSuppressionLiftedDTO,
  type EmailSuppressionLookupDTO,
  type MemberAccountRecoveryDTO,
  type ReactivatedMemberDTO,
  type RelinkDecisionDTO,
} from "./adminIdentity.api";

/**
 * The three account-recovery levers, demo/live dual-mode like every other admin
 * hook here.
 *
 * DEMO MODE ANSWERS "NOTHING TO RECOVER" AND STOPS THERE. The fixtures model a
 * healthy roster: no member in them has a re-created Google identity, a
 * stranded deactivation or an erasure on file. Synthesising one would put three
 * controls into the demo that map to nothing real, and the most dangerous of
 * the three would be a button that appears to hand an account to someone.
 * The panel therefore renders its "no candidates" state in demo, which is the
 * honest picture of a roster with no locked-out members.
 */

/** Query key prefix, kept off `["admin-members"]` on purpose: the roster
 *  invalidates that prefix constantly, and this panel is a separate read whose
 *  data does not change when a role or a staff grant does. */
const ACCOUNT_RECOVERY_KEY = "admin-account-recovery";

/** What demo mode reports for any member: both levers closed, nothing waiting. */
const DEMO_RECOVERY = (memberId: string): MemberAccountRecoveryDTO => ({
  memberId,
  slug: "",
  relink: { isAvailable: false, blockedReason: null, candidates: [] },
  reactivation: {
    isApplicable: false,
    isAvailable: false,
    blockedReason: null,
  },
});

/**
 * One member's account-recovery panel.
 *
 * The error is deliberately NOT swallowed into an empty panel: a failed read
 * here must not look like "this member has nothing wrong", so the caller
 * renders the error state and `isError` is part of the contract.
 */
export function useMemberAccountRecovery(memberId: string) {
  const { demoMode } = useDemoMode();
  return useQuery<MemberAccountRecoveryDTO>({
    queryKey: [ACCOUNT_RECOVERY_KEY, memberId, demoMode],
    queryFn: () => getMemberAccountRecovery(memberId),
    enabled: !demoMode && Boolean(memberId),
    initialData: demoMode ? DEMO_RECOVERY(memberId) : undefined,
  });
}

interface RelinkVars {
  memberId: string;
  candidateId: string;
  reason: string;
}

/**
 * Re-point a member's account at a candidate Google identity.
 *
 * Live mode invalidates this member's panel AND the shared `["admin-members"]`
 * prefix: a re-link ends every session the member had, so anything the console
 * shows about them should be re-read rather than trusted.
 */
export function useApplyMemberRelink() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useDemoAwareMutation<RelinkDecisionDTO, unknown, RelinkVars>({
    demoMode,
    demoLatencyMs: 0,
    mutationKey: [ACCOUNT_RECOVERY_KEY, "relink"],
    demoResult: ({ memberId, candidateId }) => ({
      memberId,
      candidateId,
      status: "applied",
      decidedAt: new Date().toISOString(),
    }),
    live: ({ memberId, candidateId, reason }) =>
      applyMemberRelink(memberId, candidateId, reason),
    onLiveSuccess: (_data, { memberId }) => {
      void queryClient.invalidateQueries({
        queryKey: [ACCOUNT_RECOVERY_KEY, memberId],
      });
      void queryClient.invalidateQueries({ queryKey: ["admin-members"] });
    },
  });
}

/** Refuse a candidate. Same shape as the apply above; only this member's panel
 *  needs re-reading, since nothing about the account itself changed. */
export function useDismissMemberRelink() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useDemoAwareMutation<RelinkDecisionDTO, unknown, RelinkVars>({
    demoMode,
    demoLatencyMs: 0,
    mutationKey: [ACCOUNT_RECOVERY_KEY, "dismiss-relink"],
    demoResult: ({ memberId, candidateId }) => ({
      memberId,
      candidateId,
      status: "dismissed",
      decidedAt: new Date().toISOString(),
    }),
    live: ({ memberId, candidateId, reason }) =>
      dismissMemberRelink(memberId, candidateId, reason),
    onLiveSuccess: (_data, { memberId }) => {
      void queryClient.invalidateQueries({
        queryKey: [ACCOUNT_RECOVERY_KEY, memberId],
      });
    },
  });
}

/** Reactivate a member stranded in `deactivated`. The backend refuses every
 *  other case with a 409 whose message the global mutation-error toast shows. */
export function useReactivateMember() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useDemoAwareMutation<
    ReactivatedMemberDTO,
    unknown,
    { memberId: string; slug: string; reason: string }
  >({
    demoMode,
    demoLatencyMs: 0,
    mutationKey: [ACCOUNT_RECOVERY_KEY, "reactivate"],
    demoResult: ({ memberId, slug }) => ({
      memberId,
      slug,
      status: "active",
      reactivatedAt: new Date().toISOString(),
    }),
    live: ({ memberId, reason }) => reactivateMember(memberId, reason),
    onLiveSuccess: (_data, { memberId }) => {
      void queryClient.invalidateQueries({
        queryKey: [ACCOUNT_RECOVERY_KEY, memberId],
      });
      void queryClient.invalidateQueries({ queryKey: ["admin-members"] });
    },
  });
}

/**
 * Look one address up on the erasure suppression list.
 *
 * A MUTATION rather than a query, even though it changes nothing. It is a POST
 * (the address must stay out of URLs), it runs on an explicit operator action
 * instead of on mount, and it must never be cached: a cached "suppressed"
 * answer would keep saying so after the lift beside it removed the row.
 */
export function useLookupEmailSuppression() {
  const { demoMode } = useDemoMode();
  return useMutation<EmailSuppressionLookupDTO, unknown, { email: string }>({
    mutationKey: [ACCOUNT_RECOVERY_KEY, "suppression-lookup"],
    mutationFn: ({ email }) => {
      if (demoMode) {
        // Demo has no suppression list. Reporting "not suppressed" is the
        // truthful answer for fixtures, and it keeps the operator from
        // reaching a Lift button that would map to nothing.
        return Promise.resolve({
          email,
          isSuppressed: false,
          emailHashPrefix: "",
          reason: null,
          suppressedAt: null,
        });
      }
      return lookupEmailSuppression(email);
    },
  });
}

/** Lift a suppression. Restores nothing: it stops the platform refusing a new
 *  signup on that address. */
export function useLiftEmailSuppression() {
  const { demoMode } = useDemoMode();
  return useDemoAwareMutation<
    EmailSuppressionLiftedDTO,
    unknown,
    { email: string; reason: string }
  >({
    demoMode,
    demoLatencyMs: 0,
    mutationKey: [ACCOUNT_RECOVERY_KEY, "suppression-lift"],
    demoResult: ({ email }) => ({
      email,
      isSuppressed: false,
      emailHashPrefix: "",
      liftedAt: new Date().toISOString(),
    }),
    live: ({ email, reason }) => liftEmailSuppression(email, reason),
  });
}
