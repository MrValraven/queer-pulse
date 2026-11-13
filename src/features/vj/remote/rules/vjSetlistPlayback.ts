/**
 * Pure rules for a sequence on the remote (sequences contract 8.3): which
 * step flashes, where "Skip the flashing step" lands, which step the timer
 * plays next, and what the active controls and the status line show for
 * each playback status. Code names stay `setlist`; copy says sequence and
 * step.
 */
import {
  vjSceneLookFlashes,
  type VjClipDTO,
  type VjSceneDTO,
  type VjSetlistDTO,
  type VjSetlistItemDTO,
  type VjSetlistItemKind,
  type VjSetlistPlaybackStatus,
  type VjStageState,
} from "../../../../shared/contracts/vj";

/**
 * Whether recalling the step can flash. A clip step never flashes. A scene
 * step whose scene the library has not loaded counts as flashing: nothing
 * shows its look is calm, so the warning asks.
 */
export function vjSetlistItemFlashes(
  item: VjSetlistItemDTO,
  scenesById: ReadonlyMap<string, VjSceneDTO>,
): boolean {
  if (item.kind === "clip" || item.sceneId === null) return false;
  const scene = scenesById.get(item.sceneId);
  return scene === undefined || vjSceneLookFlashes(scene.look);
}

/** Whether any scene step of the sequence flashes (Play, Resume and Play again ask the warning once). */
export function vjSetlistHasFlashingStep(
  setlist: VjSetlistDTO,
  scenesById: ReadonlyMap<string, VjSceneDTO>,
): boolean {
  return setlist.items.some((item) => vjSetlistItemFlashes(item, scenesById));
}

/** The first step after `flashingIndex` (wrapping with Loop) that does not flash; null when none. */
export function vjSetlistSkipTargetIndex(
  setlist: VjSetlistDTO,
  scenesById: ReadonlyMap<string, VjSceneDTO>,
  flashingIndex: number,
  isLooping: boolean,
): number | null {
  const itemCount = setlist.items.length;
  if (flashingIndex < 0 || flashingIndex >= itemCount) return null;
  const stepsAhead = isLooping ? itemCount - 1 : itemCount - 1 - flashingIndex;
  for (let offset = 1; offset <= stepsAhead; offset += 1) {
    const candidateIndex = (flashingIndex + offset) % itemCount;
    const candidate = setlist.items[candidateIndex];
    if (candidate !== undefined && !vjSetlistItemFlashes(candidate, scenesById))
      return candidateIndex;
  }
  return null;
}

/** The index the timer would play after the step on screen, with Loop; null past the end. */
export function vjSetlistNextIndex(
  setlistIndex: number | null,
  itemCount: number,
  isLooping: boolean,
): number | null {
  const nextIndex = (setlistIndex ?? -1) + 1;
  if (nextIndex < itemCount) return nextIndex;
  return isLooping && itemCount > 0 ? 0 : null;
}

/** The index Previous step lands on: the last step from the first with Loop; null at the start without. */
export function vjSetlistPreviousIndex(
  setlistIndex: number | null,
  itemCount: number,
  isLooping: boolean,
): number | null {
  if (setlistIndex === null || setlistIndex === 0) {
    return isLooping && itemCount > 0 ? itemCount - 1 : null;
  }
  const previousIndex = setlistIndex - 1;
  return previousIndex < itemCount ? previousIndex : null;
}

export type VjSetlistReasonLine =
  | "takenOverPick"
  | "takenOverShuffle"
  | "finished"
  | "flashWaiting"
  | "paused"
  | null;

/** The status line under the active controls; takenOver reads shuffle.isOn to name its reason. */
export function vjSetlistReasonLineOf(
  state: VjStageState,
): VjSetlistReasonLine {
  if (state.activeSetlistId === null) return null;
  switch (state.setlistPlayback.status) {
    case "takenOver":
      return state.shuffle.isOn ? "takenOverShuffle" : "takenOverPick";
    case "finished":
      return "finished";
    case "needsFlashConsent":
      return "flashWaiting";
    case "paused":
      return "paused";
    case "manual":
    case "playing":
      return null;
  }
}

/** The one play control the active controls show for a status. */
export type VjSetlistPlayControl = "play" | "pause" | "resume" | "playAgain";

export function vjSetlistPlayControlOf(
  status: VjSetlistPlaybackStatus,
): VjSetlistPlayControl {
  switch (status) {
    case "manual":
      return "play";
    case "playing":
      return "pause";
    case "paused":
    case "takenOver":
    case "needsFlashConsent":
      return "resume";
    case "finished":
      return "playAgain";
  }
}

/** The scenes sheet's label for each play control. */
export const VJ_SETLIST_PLAY_CONTROL_KEYS: Readonly<
  Record<VjSetlistPlayControl, string>
> = {
  play: "vj:scenes.playSetlist",
  pause: "vj:scenes.pauseSetlist",
  resume: "vj:scenes.resumeSetlist",
  playAgain: "vj:scenes.playAgain",
};

/** The scenes strip's label for each play control. */
export const VJ_SETLIST_STRIP_PLAY_CONTROL_KEYS: Readonly<
  Record<VjSetlistPlayControl, string>
> = {
  play: "vj:strip.setlistPlay",
  pause: "vj:strip.setlistPause",
  resume: "vj:strip.setlistResume",
  playAgain: "vj:scenes.playAgain",
};

/** A sequence holds Play sequence and Step through until it has a step. */
export function isVjSetlistPlayable(setlist: VjSetlistDTO): boolean {
  return setlist.items.length > 0;
}

/** The set list `state.activeSetlistId` names; null when none is active or it is not loaded. */
export function vjActiveSetlistOf(
  state: VjStageState | null,
  setlists: readonly VjSetlistDTO[],
): VjSetlistDTO | null {
  const activeSetlistId = state?.activeSetlistId ?? null;
  if (activeSetlistId === null) return null;
  return setlists.find((setlist) => setlist.id === activeSetlistId) ?? null;
}

/** The step the timer stopped before while it waits on the flash warning; null in any other status. */
export function vjSetlistFlashingIndexOf(
  state: VjStageState,
  setlist: VjSetlistDTO,
): number | null {
  if (state.activeSetlistId !== setlist.id) return null;
  if (state.setlistPlayback.status !== "needsFlashConsent") return null;
  return vjSetlistNextIndex(
    state.setlistIndex,
    setlist.items.length,
    state.setlistPlayback.isLooping,
  );
}

/** Where "Skip the flashing step" lands; null when no step after it plays without flashing. */
export function vjSetlistSkipFlashingIndexOf(
  state: VjStageState,
  setlist: VjSetlistDTO,
  scenesById: ReadonlyMap<string, VjSceneDTO>,
): number | null {
  const flashingIndex = vjSetlistFlashingIndexOf(state, setlist);
  if (flashingIndex === null) return null;
  return vjSetlistSkipTargetIndex(
    setlist,
    scenesById,
    flashingIndex,
    state.setlistPlayback.isLooping,
  );
}

/** A step's name: its scene's name or its clip's title; null when the library has not loaded it. */
export function vjSetlistStepNameOf(
  item: VjSetlistItemDTO,
  scenesById: ReadonlyMap<string, Pick<VjSceneDTO, "name">>,
  clipsById: ReadonlyMap<string, Pick<VjClipDTO, "title">>,
): string | null {
  if (item.kind === "clip") {
    return item.clipId === null
      ? null
      : (clipsById.get(item.clipId)?.title ?? null);
  }
  return item.sceneId === null
    ? null
    : (scenesById.get(item.sceneId)?.name ?? null);
}

/** What a step reads as when its scene or clip left the library. */
export const VJ_SETLIST_STEP_GONE_KEYS: Readonly<
  Record<VjSetlistItemKind, string>
> = {
  scene: "vj:setlistItems.sceneGone",
  clip: "vj:setlistItems.clipGone",
};

/** A catalog key and what it interpolates. */
export interface VjSetlistCopy {
  key: string;
  values: Record<string, string | number>;
}

/**
 * A takeover's line names what Resume plays: the step after the one on
 * screen, wrapping to step 1 from the last step (design 13.1, Resume from
 * takenOver). Without a readable step it names only the reason.
 */
function vjTakenOverCopyOf(
  state: VjStageState,
  setlist: VjSetlistDTO | null,
  reasonLine: "takenOverPick" | "takenOverShuffle",
  stepNameOf: (item: VjSetlistItemDTO | null) => string,
): VjSetlistCopy {
  const itemCount = setlist?.items.length ?? 0;
  const resumeIndex = vjSetlistNextIndex(state.setlistIndex, itemCount, true);
  const resumeItem =
    resumeIndex === null ? undefined : setlist?.items[resumeIndex];
  if (resumeIndex === null || resumeItem === undefined) {
    return { key: `vj:scenes.${reasonLine}`, values: {} };
  }
  return {
    key: `vj:scenes.${reasonLine}Next`,
    values: { position: resumeIndex + 1, step: stepNameOf(resumeItem) },
  };
}

/**
 * The status line's copy. `stepNameOf` names a step in the page's language
 * (vjSetlistStepNameOf, else VJ_SETLIST_STEP_GONE_KEYS), so the flash line
 * names the step that waits. It gets null when the step cannot be read (the
 * set list is not loaded, or the index fell past the end): name the
 * sequence there, so the line still says why it paused.
 */
export function vjSetlistReasonCopyOf(
  state: VjStageState,
  setlist: VjSetlistDTO | null,
  stepNameOf: (item: VjSetlistItemDTO | null) => string,
): VjSetlistCopy | null {
  const reasonLine = vjSetlistReasonLineOf(state);
  switch (reasonLine) {
    case null:
      return null;
    case "takenOverPick":
    case "takenOverShuffle":
      return vjTakenOverCopyOf(state, setlist, reasonLine, stepNameOf);
    case "finished":
      return { key: "vj:scenes.finished", values: {} };
    case "paused": {
      const remainingMs = state.setlistPlayback.pausedRemainingMs ?? 0;
      return {
        key: "vj:scenes.pausedLine",
        values: { seconds: Math.ceil(remainingMs / 1000) },
      };
    }
    case "flashWaiting": {
      const flashingIndex =
        setlist === null ? null : vjSetlistFlashingIndexOf(state, setlist);
      const flashingItem =
        flashingIndex === null ? undefined : setlist?.items[flashingIndex];
      return {
        key: "vj:scenes.flashWaiting",
        values: { step: stepNameOf(flashingItem ?? null) },
      };
    }
  }
}

/**
 * "Step 3 of 8" for the active sequence, or "Ready at step 1" while armed.
 * An index past the end (a step removed elsewhere, the next read not in
 * yet) shows the last step; an empty sequence shows no position.
 */
export type VjSetlistStepPosition =
  | { kind: "armed"; total: number }
  /** `position` is 1-based. */
  | { kind: "step"; position: number; total: number };

export function vjSetlistStepPositionOf(
  state: VjStageState,
  setlist: VjSetlistDTO,
): VjSetlistStepPosition | null {
  if (state.activeSetlistId !== setlist.id) return null;
  const total = setlist.items.length;
  if (total === 0) return null;
  if (state.setlistIndex === null) return { kind: "armed", total };
  const position = Math.min(Math.max(state.setlistIndex, 0) + 1, total);
  return { kind: "step", position, total };
}

/** The catalog copy for a step position. */
export function vjSetlistStepPositionCopy(
  position: VjSetlistStepPosition,
): VjSetlistCopy {
  if (position.kind === "armed") {
    return { key: "vj:scenes.stepArmed", values: {} };
  }
  return {
    key: "vj:scenes.stepPosition",
    values: { position: position.position, total: position.total },
  };
}
