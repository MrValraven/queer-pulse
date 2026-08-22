import { useCallback } from "react";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  cancelDeletionRequest,
  deactivateAccount,
  getDeletionRequest,
  requestAccountDeletion,
  simulateOr,
  type DeletionRequest,
} from "./account.api";
import {
  beginReauth as beginReauthRedirect,
  getCachedReauthToken,
} from "./useReauthToken";

const DAY_MS = 24 * 60 * 60 * 1000;
const GRACE_DAYS = 30;

/** now + `days`, ISO — used to fabricate believable demo timestamps. */
function daysFromNow(days: number): string {
  return new Date(Date.now() + days * DAY_MS).toISOString();
}

/**
 * Step-up re-auth, demo/live combined. `getReauthToken()` reads FRESH each
 * call — deliberately not a pre-computed value off the hook's return, since
 * the redirect landing writes the cache via an effect (`useReauthCompletion`)
 * that commits after this hook's own render; a snapshotted value could read
 * stale-null on the very render where the token just became available.
 * Live: reads whatever `useReauthToken.ts`'s redirect flow has cached (`null`
 * until the member completes it); `beginReauth()` starts that OAuth round
 * trip. Demo: a fixed fake token is always "already valid" — there's no real
 * backend to step up against — and `beginReauth()` is a no-op, so the flow
 * runs end-to-end without ever leaving the prototype.
 *
 * Every gated call site (DeleteAccountSection, AccountDataStepAway,
 * AccountDataExport, useDsar, useExportFlow) follows the same shape, called
 * fresh inside the action itself (never hoisted to render time):
 * `const reauthToken = getReauthToken(); if (!reauthToken) { beginReauth(); return; }`.
 * On live, that first click redirects away and the member has to press
 * confirm again after landing back — deliberate: nothing destructive ever
 * fires as a side effect of the redirect itself.
 */
export function useReauth() {
  const { demoMode } = useDemoMode();
  const getReauthToken = useCallback(
    (): string | null => (demoMode ? "demo-reauth" : getCachedReauthToken()),
    [demoMode],
  );
  const beginReauth = useCallback(() => {
    if (demoMode) return;
    beginReauthRedirect();
  }, [demoMode]);
  return { getReauthToken, beginReauth };
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
