import { useMutation } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  decideFlatmate,
  type FlatmateDecideResult,
  type FlatmateDecision,
} from "./flatmateProfile.api";

export interface DecisionInput {
  slug: string;
  decision: FlatmateDecision;
  /** Demo-only: whether this like should resolve as a mutual match. Live mode
   * ignores it — the backend decides from real reciprocal likes. */
  demoMatched?: boolean;
}

/** POST /flatmate-directory/:slug/decide — records a like/pass from the
 * discovery deck and reports a mutual match. Demo fakes the network and derives
 * `matched` from the caller's `demoMatched` hint. */
export function useFlatmateDecision() {
  const { demoMode } = useDemoMode();
  return useMutation<FlatmateDecideResult, Error, DecisionInput>({
    meta: { silentError: true },
    mutationFn: async ({ slug, decision, demoMatched }) => {
      if (demoMode) {
        await new Promise((resolve) => setTimeout(resolve, 350));
        return {
          decision,
          matched: decision === "like" && Boolean(demoMatched),
        };
      }
      return decideFlatmate(slug, decision);
    },
  });
}
