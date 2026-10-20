import type { CreatorDraftProgress } from "../../creatorDrafts/api/creatorDrafts.types";
import { PANELS } from "./startCommunity.data";

/**
 * What the community draft tells our team about how far the founder got: the
 * keys of the panels still invalid, and the chapter reached out of every panel.
 */
export function communityDraftProgress(
  missingByStep: Record<number, string[]>,
  step: number,
): { progress: CreatorDraftProgress; missing: string[] } {
  const missing = PANELS.filter(
    (_panel, panelIndex) => (missingByStep[panelIndex]?.length ?? 0) > 0,
  ).map((panel) => panel.key);
  return {
    progress: {
      done: Math.min(step + 1, PANELS.length),
      total: PANELS.length,
    },
    missing,
  };
}
