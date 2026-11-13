/**
 * What plays next, for the mirror band: a clip armed in cue mode first, then
 * the next step of the active sequence (sequences contract 8.1), then the
 * lead screen's shuffle pick.
 */
import type {
  VjSetlistDTO,
  VjSetlistItemDTO,
  VjStageState,
} from "../../../../shared/contracts/vj";
import { vjSetlistNextIndex } from "./vjSetlistPlayback";

export type VjNextUp =
  | { kind: "cue"; clipId: string }
  | {
      kind: "setlist";
      /** A scene or a clip step; the shell names it by its scene or clip. */
      item: VjSetlistItemDTO;
      /** 1-based for display ("3 of 8"). */
      position: number;
      total: number;
    }
  /** The step on screen is the sequence's last and Loop is off. */
  | { kind: "setlistLast" }
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

/**
 * The next step wraps to step 1 with Loop on; without Loop the last step
 * reads "Last step". After a takeover it always wraps, since Resume plays
 * step 1 from the last step (design 13.1). A finished or empty sequence
 * says nothing, so shuffle or none shows.
 */
function setlistNextUpOf(
  state: VjStageState,
  activeSetlist: VjSetlistDTO | null,
): VjNextUp | null {
  if (activeSetlist === null) return null;
  if (state.activeSetlistId !== activeSetlist.id) return null;
  const playback = state.setlistPlayback;
  if (playback.status === "finished") return null;
  const total = activeSetlist.items.length;
  if (total === 0) return null;
  const nextIndex = vjSetlistNextIndex(
    state.setlistIndex,
    total,
    playback.isLooping || playback.status === "takenOver",
  );
  if (nextIndex === null) return { kind: "setlistLast" };
  const nextItem = activeSetlist.items[nextIndex];
  if (nextItem === undefined) return null;
  return { kind: "setlist", item: nextItem, position: nextIndex + 1, total };
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
