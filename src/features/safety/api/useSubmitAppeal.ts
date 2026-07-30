import { useMutation } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { logInfo } from "../../../shared/observability/logger";
import {
  submitAppeal,
  type SubmitAppealInput,
  type SubmittedAppealDTO,
} from "./appeals.api";

/** How long the demo mode pretends the round-trip takes, to keep the UX honest. */
const DEMO_LATENCY_MS = 700;

function demoAppeal(): SubmittedAppealDTO {
  return {
    id: `demo-appeal-${Date.now()}`,
    status: "awaiting",
    createdAt: new Date().toISOString(),
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
