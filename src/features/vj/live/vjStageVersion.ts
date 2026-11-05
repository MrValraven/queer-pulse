/**
 * Stage versions (contract 6.5.1): a client keeps the last applied
 * `(stageEpoch, revision)`. A frame from the same epoch at or below that
 * revision is stale and dropped; a different epoch is always applied.
 */
import type { VjStageState } from "../../../shared/contracts/vj";

export interface VjAppliedVersion {
  stageEpoch: string;
  revision: number;
}

export function shouldApplyVjStageState(
  last: VjAppliedVersion | null,
  incoming: Pick<VjStageState, "stageEpoch" | "revision">,
): boolean {
  if (last === null) return true;
  if (incoming.stageEpoch !== last.stageEpoch) return true;
  return incoming.revision > last.revision;
}

export function vjVersionOf(
  state: Pick<VjStageState, "stageEpoch" | "revision">,
): VjAppliedVersion {
  return { stageEpoch: state.stageEpoch, revision: state.revision };
}
