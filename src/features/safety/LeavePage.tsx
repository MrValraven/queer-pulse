import { useCallback, useState } from "react";
import { Footer } from "../../shared/components/layout";
import { useToast } from "../../shared/components/feedback/useToast";
import { useAuth } from "../../app/providers/authContext";
import { logError } from "../../shared/observability/logger";
import { DestructiveActionFlow } from "../settings/DestructiveActionFlow";
import { DESTRUCTIVE_FLOW } from "../settings/destructiveFlows.data";
import {
  useDeactivate,
  useReauth,
  useRequestDeletion,
} from "../settings/api/useAccountMutations";
import type { LeaveState } from "./leave.data";
import { LeaveConsidering, LeavePaused, LeavePausing } from "./LeaveScreens";
import s from "./flows.module.css";

/**
 * Safety off-ramp. Deletion and pause share the SAME erasure/deactivation path
 * as Settings (`useAccountMutations` + the shared `DestructiveActionFlow`) — no
 * second, simulation-only deletion route. Pause maps to the reversible
 * deactivate endpoint; delete opens the plum-panel destructive flow.
 */
export function LeavePage() {
  const { showToast } = useToast();
  const { signOut } = useAuth();
  const reauth = useReauth();
  const requestDeletion = useRequestDeletion();
  const deactivate = useDeactivate();

  const [state, setState] = useState<LeaveState>("considering");
  const [dur, setDur] = useState("1 month");
  const [flowOpen, setFlowOpen] = useState(false);

  const runDeletion = useCallback(async () => {
    const { reauthToken } = await reauth("");
    await requestDeletion(reauthToken);
  }, [reauth, requestDeletion]);

  async function handlePause() {
    try {
      const { reauthToken } = await reauth("");
      await deactivate(reauthToken);
      setState("paused");
    } catch (err) {
      logError(err, { where: "LeavePage.pause" });
      showToast("We couldn't pause your account just now. Try again.", "error");
    }
  }

  return (
    <>
      <div className={s.page}>
        {state === "considering" && (
          <LeaveConsidering
            onPause={() => setState("pausing")}
            onDelete={() => setFlowOpen(true)}
          />
        )}

        {state === "pausing" && (
          <LeavePausing
            dur={dur}
            onDur={setDur}
            onBack={() => setState("considering")}
            onPaused={handlePause}
            onDelete={() => setFlowOpen(true)}
          />
        )}

        {state === "paused" && (
          <LeavePaused dur={dur} onSettings={() => setState("considering")} />
        )}
      </div>
      <Footer />

      {flowOpen && (
        <DestructiveActionFlow
          content={DESTRUCTIVE_FLOW.delete}
          action={runDeletion}
          onDone={signOut}
          onClose={() => setFlowOpen(false)}
        />
      )}
    </>
  );
}
