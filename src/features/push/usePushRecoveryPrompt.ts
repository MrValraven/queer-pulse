import { useCallback, useEffect, useState } from "react";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useAuth } from "../../app/providers/authContext";
import { readPushEnabledMemberIds } from "../../pushSubStore";
import {
  decidePushRecoveryPrompt,
  type PushRecoveryReason,
} from "./pushResyncDecision";
import {
  readPushRecoveryDismissedAt,
  writePushRecoveryDismissedAt,
} from "./pushRecoveryDismissal";
import { usePushSyncOutcome } from "./pushSyncOutcomeStore";
import { hasPushApis } from "./pushSupport";

export interface PushRecoveryPrompt {
  /** Why push stopped, or `null` when no prompt should show. */
  reason: PushRecoveryReason | null;
  dismiss: () => void;
}

/**
 * Reads the health pass outcome and decides whether to tell the member push
 * stopped on this device. Live, active members only: demo mode has no server,
 * and a pending or signed-out visitor has no push to lose.
 */
export function usePushRecoveryPrompt(): PushRecoveryPrompt {
  const { demoMode } = useDemoMode();
  const { loggedIn, checking, status, user } = useAuth();
  const memberId =
    !demoMode && !checking && loggedIn && status === "active"
      ? (user?.id ?? null)
      : null;
  const outcome = usePushSyncOutcome(memberId);
  const [reason, setReason] = useState<PushRecoveryReason | null>(null);

  // Re-decided whenever a pass reports. Everything impure (the clock, storage,
  // IndexedDB, the live permission) is read here, then handed to the pure
  // decision.
  useEffect(() => {
    let isStale = false;
    async function decide() {
      const pushEnabledMemberIds = memberId
        ? await readPushEnabledMemberIds()
        : [];
      if (isStale) return;
      setReason(
        decidePushRecoveryPrompt({
          memberId,
          hasPushApis: hasPushApis(),
          pushEnabledMemberIds,
          outcome,
          permission: hasPushApis() ? Notification.permission : "denied",
          lastDismissedAt: memberId
            ? readPushRecoveryDismissedAt(memberId)
            : null,
          now: Date.now(),
        }),
      );
    }
    void decide();
    return () => {
      isStale = true;
    };
  }, [memberId, outcome]);

  const dismiss = useCallback(() => {
    if (memberId) writePushRecoveryDismissedAt(memberId, Date.now());
    setReason(null);
  }, [memberId]);

  return { reason, dismiss };
}
