import { useCallback } from "react";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  cancelDeletionRequest,
  deactivateAccount,
  getDeletionRequest,
  reauth,
  requestAccountDeletion,
  simulateOr,
  type DeletionRequest,
  type ReauthResult,
} from "./account.api";

const DAY_MS = 24 * 60 * 60 * 1000;
const GRACE_DAYS = 30;

/** now + `days`, ISO — used to fabricate believable demo timestamps. */
function daysFromNow(days: number): string {
  return new Date(Date.now() + days * DAY_MS).toISOString();
}

/**
 * Step-up re-auth. In live mode this verifies the password server-side and
 * returns a single-purpose token the destructive/export routes require; in demo
 * it resolves a fake token so the flow still gates on the field being filled.
 */
export function useReauth() {
  const { demoMode } = useDemoMode();
  return useCallback(
    (password: string): Promise<ReauthResult> =>
      simulateOr(
        demoMode,
        { reauthToken: "demo-reauth", expiresAt: daysFromNow(0) },
        () => reauth({ password }),
      ),
    [demoMode],
  );
}

/**
 * POST /account/deletion-request — opens the 30-day grace period and kills the
 * session server-side. Demo returns a simulated `grace` request without hitting
 * the network, preserving the prototype experience.
 */
export function useRequestDeletion() {
  const { demoMode } = useDemoMode();
  return useCallback(
    (reauthToken: string, reason?: string): Promise<DeletionRequest> =>
      simulateOr(
        demoMode,
        {
          id: "demo-del",
          status: "grace",
          requestedAt: daysFromNow(0),
          scheduledErasureAt: daysFromNow(GRACE_DAYS),
          gracePeriodDays: GRACE_DAYS,
        },
        () => requestAccountDeletion({ reason, reauthToken }),
      ),
    [demoMode],
  );
}

/** POST /account/deactivate — the reversible, non-erasure path. */
export function useDeactivate() {
  const { demoMode } = useDemoMode();
  return useCallback(
    (reauthToken: string): Promise<void> =>
      simulateOr(demoMode, undefined, async () => {
        await deactivateAccount({ reauthToken });
      }),
    [demoMode],
  );
}

/** DELETE /account/deletion-request — cancel during grace, reactivate. */
export function useCancelDeletion() {
  const { demoMode } = useDemoMode();
  return useCallback(
    (): Promise<void> => simulateOr(demoMode, undefined, cancelDeletionRequest),
    [demoMode],
  );
}

/**
 * GET /account/deletion-request — a pending request (or null). Demo has no
 * persisted request, so it resolves null and the delete form renders normally.
 */
export function useGetDeletionRequest() {
  const { demoMode } = useDemoMode();
  return useCallback(
    (): Promise<DeletionRequest | null> =>
      simulateOr(demoMode, null, getDeletionRequest, 0),
    [demoMode],
  );
}
