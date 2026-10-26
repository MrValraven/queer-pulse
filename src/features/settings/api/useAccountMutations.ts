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
import { beginReauth, getCachedReauthToken } from "./useReauthToken";

const DAY_MS = 24 * 60 * 60 * 1000;
const GRACE_DAYS = 30;

/** now + `days`, ISO — used to fabricate believable demo timestamps. */
function daysFromNow(days: number): string {
  return new Date(Date.now() + days * DAY_MS).toISOString();
}

/**
 * Step-up re-auth, the same on demo and live. `getReauthToken()` reads the
 * cache FRESH on each call. The code dialog and the Google landing (an effect
 * in `useReauthCompletion`) both write that cache after this hook has
 * rendered, so a value snapshotted at render time could read stale-null on
 * the very render where the token just became available.
 * `getReauthToken()` reads whatever `useReauthToken.ts` has cached in
 * `qp_reauth_token` (`null` until the member confirms); `beginReauth()` opens
 * the dialog that emails a code (`/auth/email-code/reauth/*`), where members
 * with Google can still pick the redirect. Demo runs the same dialog on its
 * mock answers (`emailCode.data.ts`), which caches `demo-reauth-code` in that
 * slot, so the prototype shows the whole step-up end to end.
 *
 * Every gated call site (DeleteAccountSection, AccountDataStepAway,
 * AccountDataExport, useDsar, useExportFlow) follows the same shape, called
 * fresh inside the action itself, at click time:
 * `const reauthToken = getReauthToken(); if (!reauthToken) { beginReauth(); return; }`.
 * A promise-based action throws `ReauthRequiredError` in place of that
 * `return`, so its caller resets quietly. That first click opens the dialog
 * and ends the action with no success panel, no error toast and the button
 * enabled again; once the code is accepted the member presses the same
 * button again and the cached token is used. That second press is
 * deliberate: nothing destructive ever fires as a side effect of the
 * confirmation itself.
 */
export function useReauth() {
  const getReauthToken = useCallback(
    (): string | null => getCachedReauthToken(),
    [],
  );
  const startReauth = useCallback(() => beginReauth(), []);
  return { getReauthToken, beginReauth: startReauth };
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
