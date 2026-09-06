import { useMutation } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { logInfo } from "../../../shared/observability/logger";
import {
  submitAppeal,
  type SubmitAppealInput,
  type SubmittedAppealDTO,
} from "./appeals.api";
import { APPEAL_DECISION_WINDOW_DAYS } from "../../system/accountWindows";

/** How long the demo mode pretends the round-trip takes, to keep the UX honest. */
const DEMO_LATENCY_MS = 700;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function demoAppeal(): SubmittedAppealDTO {
  const filedAt = new Date();
  return {
    id: `demo-appeal-${Date.now()}`,
    status: "awaiting",
    createdAt: filedAt.toISOString(),
    // The demo stands in for the server's `appealDecisionDueAt(filedAt)`, so
    // the confirmation panel shows a plausible deadline offline instead of a
    // blank row. Live mode always uses the date the server actually stored.
    slaDueAt: new Date(
      filedAt.getTime() + APPEAL_DECISION_WINDOW_DAYS * MS_PER_DAY,
    ).toISOString(),
  };
}

/**
 * Submit an appeal against a moderation decision. Demo mode resolves after a
 * short simulated delay and never touches the network, so the suspended /
 * banned screens still demo their appeal flow offline. Live mode POSTs
 * `/appeals`; the backend resolves the appealed action, enforces one open
 * appeal per action (409 on a duplicate), and files it into the same queue the
 * moderators review. Both modes resolve with a `SubmittedAppealDTO`, so the
 * success UI never has to branch on mode; on failure the caller surfaces the
 * specific backend reason rather than faking a success.
 */
export function useSubmitAppeal() {
  const { demoMode } = useDemoMode();
  return useMutation<SubmittedAppealDTO, Error, SubmitAppealInput>({
    // `AppealSubmitPage` renders this write's failure itself: a toast for a
    // retryable refusal, and an in-place panel for the one that is permanent
    // (the filing window has closed — see `api/appealSubmissionError.ts`).
    // Without this opt-out the MutationCache handler ALSO toasts
    // `messageFor(error)`, so a member appealing a suspension got the backend's
    // English sentence twice over, and the window-closed panel was announced
    // under a toast repeating the very prose it exists to replace.
    meta: { silentError: true },
    mutationFn: async (body) => {
      if (demoMode) {
        await new Promise((resolve) => setTimeout(resolve, DEMO_LATENCY_MS));
        logInfo("appeal.submit (demo — no network)", {
          hasActionId: Boolean(body.actionId),
        });
        return demoAppeal();
      }
      return submitAppeal(body);
    },
  });
}
