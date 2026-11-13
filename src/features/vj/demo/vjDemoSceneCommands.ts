// Contract 3.7 recall, the 7.5 row of `stage:recallScene` and the sequences
// contract 5.3 rows of `stage:setlistSelect`, `stage:setlistNext`,
// `stage:setlistPrevious`, `stage:setlistSetPlaying` and
// `stage:setlistSetLooping` for the demo server. Mirrors
// queerpulse-backend/src/vj/stage/vj-scene-recall.ts in the same check
// order: the field rules (or the state rules of a step), isImmediate, then
// the set list read at the position the contract's read-position helper
// names, handed to the pure transition of vj.sequence.ts. The accepted
// transition shows its step (a scene through the recall, a clip through
// withVjLiveClip only) and carries the transition's clock stamp to the
// landing. Every recall writes `overlay.hideAt: null`. The demo reads the
// library synchronously, so the position a self-checked command reads is
// always the one the state names and `vj_stale_setlist` cannot arise here
// (plan ambiguity 9).

import {
  VJ_LIMITS,
  vjSetlistLoopingState,
  vjSetlistSelectReadPosition,
  vjSetlistSelectTransition,
  vjSetlistSetPlayingReadPosition,
  vjSetlistSetPlayingTransition,
  vjSetlistStepReadPosition,
  vjSetlistStepTransition,
  type VjEffectSettings,
  type VjSceneLook,
  type VjSetlistClockStamp,
  type VjSetlistRead,
  type VjSetlistShow,
  type VjSetlistTransition,
  type VjSetlistTransitionResult,
  type VjSocketErrorCode,
  type VjStageState,
} from "../../../shared/contracts/vj";
import {
  NO_VJ_DEMO_STAMPS,
  vjDemoChange,
  withVjLiveClip,
  withVjLiveGenerator,
  type VjDemoCommandContext,
  type VjDemoCommandOutcome,
  type VjDemoStamps,
} from "./vjDemoCommandKit";
import { isVjUuid } from "./vjDemoRules";
import { readVjImmediateFlag } from "./vjDemoStageCommands";

/** Saves Loop on a set list the way the demo PATCH does (sequences contract
 *  5.6): null when the write landed, else the code the command refuses with. */
export type VjDemoSetlistLoopingWrite = (
  setlistId: string,
  isLooping: boolean,
) => "vj_setlist_not_found" | "vj_server_error" | null;

/** The command context of the set list rules: `writeSetlistLooping` saves
 *  Loop before `stage:setlistSetLooping` lands. A context without it lands
 *  the Loop copy alone. */
export type VjDemoSetlistCommandContext = VjDemoCommandContext & {
  writeSetlistLooping?: VjDemoSetlistLoopingWrite;
};

/** What a set list rule adds to an accepted outcome (sequences contract 5.3). */
export interface VjDemoSetlistOutcomeFields {
  /** Whether the change puts a step on screen (C 7.4 step 2 look switch). */
  isLookSwitch?: boolean;
  /** The clock the landing stamps (sequences contract 3.5); keep when absent. */
  setlistClock?: VjSetlistClockStamp;
  /** The set list reads the rule made, for the stage's setlistItemIds. */
  setlistReads?: readonly (VjSetlistRead | null)[];
}

/** A rule outcome, set list fields included. */
export type VjDemoSetlistOutcome = VjDemoCommandOutcome &
  VjDemoSetlistOutcomeFields;

/** A copy of each effect setting, so the state never shares an entry with a look. */
function copyVjEffectSettings(settings: VjEffectSettings): VjEffectSettings {
  const copied: VjEffectSettings = {};
  for (const [effectId, setting] of Object.entries(settings)) {
    if (setting !== undefined) {
      copied[effectId as keyof VjEffectSettings] = { ...setting };
    }
  }
  return copied;
}

/** The state with the look's source live; a null source keeps what is live. */
function withVjSceneSource(
  state: VjStageState,
  look: VjSceneLook,
): VjStageState {
  const { source } = look;
  if (source === null) return state;
  if (source.kind === "clip") return withVjLiveClip(state, source.clipId);
  return withVjLiveGenerator(
    state,
    source.generatorId,
    source.generatorVariant,
  );
}

/** C 3.7 recall on the state alone: effects speed and settings, transition,
 *  overlay (hideAt null) and mix are replaced whole. Pack, blackout, strobe,
 *  tempo, shuffle, countdown, logo, event card, overrides and the set list
 *  stay as they are. */
function recallVjSceneState(
  state: VjStageState,
  look: VjSceneLook,
): VjStageState {
  const withSource = withVjSceneSource(state, look);
  return {
    ...withSource,
    effects: {
      ...withSource.effects,
      speed: look.effects.speed,
      settings: copyVjEffectSettings(look.effects.settings),
    },
    transition: {
      mode: look.transition.mode,
      length: {
        unit: look.transition.length.unit,
        value: look.transition.length.value,
      },
    },
    overlay: { ...look.overlay, hideAt: null },
    mix: {
      clipId: look.mix.clipId === null ? null : look.mix.clipId.toLowerCase(),
      amount: look.mix.amount,
      blendMode: look.mix.blendMode,
    },
  };
}

/** The outcome of a recall onto `next` (the recalled state with any set list
 *  fields already set): a non-null source sets the live source, so the
 *  sequence grows and the change always lands; hideAt is cleared. */
function vjRecallChange(
  next: VjStageState,
  look: VjSceneLook,
): VjDemoCommandOutcome {
  const isSourceSet = look.source !== null;
  return vjDemoChange(next, {
    isAlwaysChange: isSourceSet,
    stamps: { isLiveSourceSet: isSourceSet, overlayHideAfterMs: null },
  });
}

/** C 3.7 recall of one look as a command outcome. */
export function recallVjSceneLook(
  state: VjStageState,
  look: VjSceneLook,
): VjDemoCommandOutcome {
  return vjRecallChange(recallVjSceneState(state, look), look);
}

/** `stage:recallScene`: a malformed or unknown id answers vj_scene_not_found. */
export function applyRecallScene(
  state: VjStageState,
  record: Record<string, unknown>,
  context: VjDemoCommandContext,
): VjDemoCommandOutcome {
  const { sceneId } = record;
  if (!isVjUuid(sceneId)) return { error: "vj_scene_not_found" };
  const immediate = readVjImmediateFlag("stage:recallScene", record);
  if ("error" in immediate) return immediate;
  const look = context.library.readSceneLook(sceneId.toLowerCase());
  if (look === null) return { error: "vj_scene_not_found" };
  return recallVjSceneLook(state, look);
}

/** What putting a step on screen changes: the state, its stamps and whether
 *  it is a look switch. */
export interface VjDemoSetlistShownState {
  next: VjStageState;
  isAlwaysChange: boolean;
  stamps: VjDemoStamps;
  isLookSwitch: boolean;
}

/** Puts a transition's step on screen (sequences contract 5.3, backend
 *  showVjSetlistStep): a scene goes through the recall (overlay hideAt
 *  cleared); a clip through withVjLiveClip only (overlay hideAt kept, pack
 *  and activePackId as they are, any pack), like goClip with the pack rule
 *  skipped. Both are look switches; show null changes nothing and lands as
 *  no look switch. */
export function showVjDemoSetlistStep(
  state: VjStageState,
  show: VjSetlistShow | null,
): VjDemoSetlistShownState {
  if (show === null) {
    return {
      next: state,
      isAlwaysChange: false,
      stamps: NO_VJ_DEMO_STAMPS,
      isLookSwitch: false,
    };
  }
  if (show.kind === "scene") {
    const isSourceSet = show.look.source !== null;
    return {
      next: recallVjSceneState(state, show.look),
      isAlwaysChange: isSourceSet,
      stamps: {
        ...NO_VJ_DEMO_STAMPS,
        isLiveSourceSet: isSourceSet,
        overlayHideAfterMs: null,
      },
      isLookSwitch: true,
    };
  }
  return {
    next: withVjLiveClip(state, show.clipId),
    isAlwaysChange: true,
    stamps: { ...NO_VJ_DEMO_STAMPS, isLiveSourceSet: true },
    isLookSwitch: true,
  };
}

/** An accepted transition as a rule outcome: the step shown, the
 *  transition's clock, and the read the rule made. */
export function vjDemoSetlistTransitionOutcome(
  transition: VjSetlistTransition,
  setlistReads: readonly (VjSetlistRead | null)[],
): VjDemoSetlistOutcome {
  const shown = showVjDemoSetlistStep(transition.nextState, transition.show);
  return {
    next: shown.next,
    isAlwaysChange: shown.isAlwaysChange,
    stamps: shown.stamps,
    isLookSwitch: shown.isLookSwitch,
    setlistClock: transition.clock,
    setlistReads,
  };
}

/** A transition result as a rule outcome: a code refuses with it. */
function vjSetlistTransitionRule(
  result: VjSetlistTransitionResult,
  setlistReads: readonly (VjSetlistRead | null)[],
): VjDemoSetlistOutcome {
  if (result.code !== null) return { error: result.code };
  return vjDemoSetlistTransitionOutcome(result.transition, setlistReads);
}

/** Whether a value is a set list index: a whole number in
 *  `0..setlistItemsMax - 1`, since no set list holds more items. */
function isVjSetlistIndex(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isSafeInteger(value) &&
    value >= 0 &&
    value < VJ_LIMITS.setlistItemsMax
  );
}

/** An optional boolean field: absent reads as false; anything else but a
 *  boolean is refused (sequences contract 5.2). */
function readOptionalVjFlag(value: unknown): boolean | null {
  if (value === undefined) return false;
  return typeof value === "boolean" ? value : null;
}

/** The `stage:setlistSelect` fields once their shape is checked. */
interface VjSetlistSelection {
  setlistId: string | null;
  index: number | null;
  isPlaying: boolean;
  isFlashConfirmed: boolean;
}

/** Field rules of `stage:setlistSelect`, in the frame table's order:
 *  setlistId, index, a null id with an index, the two flags, a null id with
 *  isPlaying true, isImmediate. */
function readVjSetlistSelection(
  record: Record<string, unknown>,
): VjSetlistSelection | { error: VjSocketErrorCode } {
  const { setlistId, index } = record;
  if (setlistId !== null && !isVjUuid(setlistId)) {
    return { error: "vj_setlist_not_found" };
  }
  if (index !== null && !isVjSetlistIndex(index)) {
    return { error: "vj_setlist_index_invalid" };
  }
  if (setlistId === null && index !== null) {
    return { error: "vj_setlist_index_invalid" };
  }
  const isPlaying = readOptionalVjFlag(record.isPlaying);
  const isFlashConfirmed = readOptionalVjFlag(record.isFlashConfirmed);
  if (isPlaying === null || isFlashConfirmed === null) {
    return { error: "vj_effect_flag_invalid" };
  }
  if (setlistId === null && isPlaying) return { error: "vj_setlist_none" };
  const immediate = readVjImmediateFlag("stage:setlistSelect", record);
  if ("error" in immediate) return immediate;
  return {
    setlistId: setlistId === null ? null : setlistId.toLowerCase(),
    index,
    isPlaying,
    isFlashConfirmed,
  };
}

/** `stage:setlistSelect`: null clears the set list (Stop); a set list with a
 *  null index and no isPlaying arms it; an index shows that step by hand;
 *  isPlaying true plays from the index (null reads as 0) after the flash
 *  check. Every select starts a fresh run. */
export function applySetlistSelect(
  state: VjStageState,
  record: Record<string, unknown>,
  context: VjDemoCommandContext,
): VjDemoSetlistOutcome {
  const selection = readVjSetlistSelection(record);
  if ("error" in selection) return selection;
  const { setlistId, index, isPlaying, isFlashConfirmed } = selection;
  const read =
    setlistId === null
      ? null
      : context.library.readSetlist(
          setlistId,
          vjSetlistSelectReadPosition(index, isPlaying),
        );
  return vjSetlistTransitionRule(
    vjSetlistSelectTransition(state, {
      setlistId,
      index,
      isPlaying,
      isFlashConfirmed,
      read,
    }),
    setlistId === null ? [] : [read],
  );
}

/** Which way a set list step moves. */
type VjSetlistStepDirection = "next" | "previous";

/** One set list step (Next or Previous): the state rule, isFlashConfirmed
 *  (a boolean or absent, else vj_effect_flag_invalid), isImmediate, one read
 *  at vjSetlistStepReadPosition (Loop wraps Next past the last step to step 1
 *  and Previous from step 1 to the last step), then the step transition,
 *  which refuses a flashing step nobody confirmed with
 *  vj_setlist_flash_unconfirmed. */
function applyVjSetlistStep(
  state: VjStageState,
  direction: VjSetlistStepDirection,
  context: VjDemoCommandContext,
  record: Record<string, unknown>,
): VjDemoSetlistOutcome {
  const setlistId = state.activeSetlistId;
  if (setlistId === null) return { error: "vj_setlist_none" };
  const isFlashConfirmed = readOptionalVjFlag(record.isFlashConfirmed);
  if (isFlashConfirmed === null) return { error: "vj_effect_flag_invalid" };
  const immediate = readVjImmediateFlag(
    direction === "next" ? "stage:setlistNext" : "stage:setlistPrevious",
    record,
  );
  if ("error" in immediate) return immediate;
  const read = context.library.readSetlist(
    setlistId,
    vjSetlistStepReadPosition(state, direction),
  );
  return vjSetlistTransitionRule(
    vjSetlistStepTransition(state, { direction, isFlashConfirmed, read }),
    [read],
  );
}

/** `stage:setlistNext`: vj_setlist_none, isFlashConfirmed, isImmediate,
 *  vj_setlist_not_found, vj_setlist_empty, vj_setlist_end,
 *  vj_setlist_flash_unconfirmed; shows `(setlistIndex ?? -1) + 1`, step 1
 *  again past the end with Loop on. Pass the payload record so isImmediate
 *  is checked before the read (the dispatcher checks it again after the rule). */
export function applySetlistNext(
  state: VjStageState,
  context: VjDemoCommandContext,
  record: Record<string, unknown> = {},
): VjDemoSetlistOutcome {
  return applyVjSetlistStep(state, "next", context, record);
}

/** `stage:setlistPrevious`: vj_setlist_none, isFlashConfirmed, isImmediate,
 *  vj_setlist_not_found, vj_setlist_empty, vj_setlist_start,
 *  vj_setlist_flash_unconfirmed; shows
 *  `setlistIndex - 1`, the last step from step 1 with Loop on. */
export function applySetlistPrevious(
  state: VjStageState,
  context: VjDemoCommandContext,
  record: Record<string, unknown> = {},
): VjDemoSetlistOutcome {
  return applyVjSetlistStep(state, "previous", context, record);
}

/** `stage:setlistSetPlaying` (Play, Pause, Resume, Play again): isPlaying (a
 *  boolean, absent refused), isFlashConfirmed, isImmediate, vj_setlist_none,
 *  then one read at vjSetlistSetPlayingReadPosition (none when it is null)
 *  and the playing transition at the command's now. */
export function applySetlistSetPlaying(
  state: VjStageState,
  record: Record<string, unknown>,
  context: VjDemoCommandContext,
): VjDemoSetlistOutcome {
  const { isPlaying } = record;
  if (typeof isPlaying !== "boolean") {
    return { error: "vj_effect_flag_invalid" };
  }
  const isFlashConfirmed = readOptionalVjFlag(record.isFlashConfirmed);
  if (isFlashConfirmed === null) return { error: "vj_effect_flag_invalid" };
  const immediate = readVjImmediateFlag("stage:setlistSetPlaying", record);
  if ("error" in immediate) return immediate;
  const setlistId = state.activeSetlistId;
  if (setlistId === null) return { error: "vj_setlist_none" };
  const position = vjSetlistSetPlayingReadPosition(state, isPlaying);
  const read =
    position === null ? null : context.library.readSetlist(setlistId, position);
  return vjSetlistTransitionRule(
    vjSetlistSetPlayingTransition(state, {
      isPlaying,
      isFlashConfirmed,
      read,
      now: context.now,
    }),
    position === null ? [] : [read],
  );
}

/** `stage:setlistSetLooping`: isLooping (a boolean, absent refused),
 *  isImmediate, vj_setlist_none; then Loop is saved on the set list through
 *  the demo PATCH (a failed write refuses with its code, sequences contract
 *  5.6), and the playback's Loop copy follows, clock kept. The
 *  `setlist_updated` the write posts lands as a noop on this stage. */
export function applySetlistSetLooping(
  state: VjStageState,
  record: Record<string, unknown>,
  context: VjDemoSetlistCommandContext,
): VjDemoSetlistOutcome {
  const { isLooping } = record;
  if (typeof isLooping !== "boolean") {
    return { error: "vj_effect_flag_invalid" };
  }
  const immediate = readVjImmediateFlag("stage:setlistSetLooping", record);
  if ("error" in immediate) return immediate;
  const setlistId = state.activeSetlistId;
  if (setlistId === null) return { error: "vj_setlist_none" };
  const writeFailure =
    context.writeSetlistLooping?.(setlistId, isLooping) ?? null;
  if (writeFailure !== null) return { error: writeFailure };
  return {
    ...vjDemoChange(vjSetlistLoopingState(state, setlistId, isLooping)),
    isLookSwitch: false,
    setlistClock: { kind: "keep" },
    setlistReads: [],
  };
}
