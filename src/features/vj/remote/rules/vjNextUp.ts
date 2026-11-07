/**
 * What plays next, for the mirror band: a clip armed in cue mode first, then
 * the next scene of the armed set list, then the lead screen's shuffle pick.
 */
import type {
  VjSetlistDTO,
  VjStageState,
} from "../../../../shared/contracts/vj";

export type VjNextUp =
  | { kind: "cue"; clipId: string }
  /** `position` is 1-based for display ("3 of 8"). */
  | { kind: "setlist"; sceneId: string; position: number; total: number }
  | { kind: "shuffle"; clipId: string }
  | { kind: "none" };

export interface VjNextUpInput {
  isCueMode: boolean;
  armedClipId: string | null;
  state: VjStageState;
  /** The lead screen's `VjScreenStatus.nextClipId`. */
  leadNextClipId: string | null;
  /** The set list `state.activeSetlistId` names; null when none is armed or it is not loaded. */
  activeSetlist: VjSetlistDTO | null;
}

function setlistNextUpOf(
  state: VjStageState,
  activeSetlist: VjSetlistDTO | null,
): VjNextUp | null {
  if (activeSetlist === null) return null;
  if (state.activeSetlistId !== activeSetlist.id) return null;
  const nextIndex = (state.setlistIndex ?? -1) + 1;
  const nextItem = activeSetlist.items[nextIndex];
  if (nextItem === undefined) return null;
  return {
    kind: "setlist",
    sceneId: nextItem.sceneId,
    position: nextIndex + 1,
    total: activeSetlist.items.length,
  };
}

export function vjNextUpOf(input: VjNextUpInput): VjNextUp {
  if (input.isCueMode && input.armedClipId !== null) {
    return { kind: "cue", clipId: input.armedClipId };
  }
  const setlistNextUp = setlistNextUpOf(input.state, input.activeSetlist);
  if (setlistNextUp !== null) return setlistNextUp;
  if (input.state.shuffle.isOn && input.leadNextClipId !== null) {
    return { kind: "shuffle", clipId: input.leadNextClipId };
  }
  return { kind: "none" };
}
