// Contract 3.7 recall and the 7.5 rows of `stage:recallScene`,
// `stage:setlistSelect`, `stage:setlistNext` and `stage:setlistPrevious` for
// the demo server, pure. Mirrors queerpulse-backend/src/vj/stage/
// vj-scene-recall.ts in the same check order: the field rules (or the state
// rules of a step), isImmediate, then the library read. Every recall is a
// look switch (contract 7.4 step 2, the dispatcher marks it) and writes
// `overlay.hideAt: null`. The demo reads the library synchronously, so a
// step never reads an item for a stale target and `vj_stale_setlist` cannot
// arise here (plan ambiguity 9).

import {
  VJ_LIMITS,
  type VjEffectSettings,
  type VjSceneLook,
  type VjSocketErrorCode,
  type VjStageState,
} from "../../../shared/contracts/vj";
import {
  vjDemoChange,
  withVjLiveClip,
  withVjLiveGenerator,
  type VjDemoCommandContext,
  type VjDemoCommandOutcome,
} from "./vjDemoCommandKit";
import { isVjUuid } from "./vjDemoRules";
import { readVjImmediateFlag } from "./vjDemoStageCommands";

/** One item read of a set list, as the library lookup answers it. */
type VjDemoSetlistItemRead = NonNullable<
  ReturnType<VjDemoCommandContext["library"]["readSetlistItem"]>
>;

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

/** The `stage:setlistSelect` fields in the frame table's order, or the code
 *  that refuses them. */
function readVjSetlistSelection(
  record: Record<string, unknown>,
):
  | { setlistId: string | null; index: number | null }
  | { error: VjSocketErrorCode } {
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
  return {
    setlistId: setlistId === null ? null : setlistId.toLowerCase(),
    index,
  };
}

/** The look at an index of a read set list, or the code that refuses it. */
function lookAtSetlistIndex(
  read: VjDemoSetlistItemRead,
  index: number,
  pastEndCode: "vj_setlist_end" | "vj_setlist_index_invalid",
): { look: VjSceneLook } | { error: VjSocketErrorCode } {
  if (read.itemCount === 0) return { error: "vj_setlist_empty" };
  if (index >= read.itemCount) return { error: pastEndCode };
  if (read.look === null) return { error: "vj_setlist_index_invalid" };
  return { look: read.look };
}

/** `stage:setlistSelect`: null clears the set list; a set list with a null
 *  index arms it; a number recalls that item's scene. */
export function applySetlistSelect(
  state: VjStageState,
  record: Record<string, unknown>,
  context: VjDemoCommandContext,
): VjDemoCommandOutcome {
  const selection = readVjSetlistSelection(record);
  if ("error" in selection) return selection;
  const immediate = readVjImmediateFlag("stage:setlistSelect", record);
  if ("error" in immediate) return immediate;
  const { setlistId, index } = selection;
  if (setlistId === null) {
    return vjDemoChange({
      ...state,
      activeSetlistId: null,
      setlistIndex: null,
    });
  }
  const read = context.library.readSetlistItem(setlistId, index);
  if (read === null) return { error: "vj_setlist_not_found" };
  if (index === null) {
    return vjDemoChange({
      ...state,
      activeSetlistId: setlistId,
      setlistIndex: null,
    });
  }
  const item = lookAtSetlistIndex(read, index, "vj_setlist_index_invalid");
  if ("error" in item) return item;
  return vjRecallChange(
    {
      ...recallVjSceneState(state, item.look),
      activeSetlistId: setlistId,
      setlistIndex: index,
    },
    item.look,
  );
}

/** Which way a set list step moves. */
type VjSetlistStepDirection = "next" | "previous";

/** The item a step targets from the state, or the state rule that refuses it.
 *  Previous from an armed set list (`setlistIndex` null) targets a count-only
 *  read (index null): vj_setlist_empty for an empty set list and
 *  vj_setlist_start otherwise, in the contract's order. */
function vjSetlistStepTarget(
  state: VjStageState,
  direction: VjSetlistStepDirection,
):
  | { error: "vj_setlist_none" | "vj_setlist_start" }
  | { setlistId: string; index: number | null } {
  if (state.activeSetlistId === null) return { error: "vj_setlist_none" };
  if (direction === "next") {
    return {
      setlistId: state.activeSetlistId,
      index: (state.setlistIndex ?? -1) + 1,
    };
  }
  if (state.setlistIndex === null) {
    return { setlistId: state.activeSetlistId, index: null };
  }
  if (state.setlistIndex === 0) return { error: "vj_setlist_start" };
  return {
    setlistId: state.activeSetlistId,
    index: state.setlistIndex - 1,
  };
}

/** One set list step: the state rules, isImmediate, the item read, recall. */
function applyVjSetlistStep(
  state: VjStageState,
  direction: VjSetlistStepDirection,
  context: VjDemoCommandContext,
  record: Record<string, unknown>,
): VjDemoCommandOutcome {
  const target = vjSetlistStepTarget(state, direction);
  if ("error" in target) return target;
  const immediate = readVjImmediateFlag(
    direction === "next" ? "stage:setlistNext" : "stage:setlistPrevious",
    record,
  );
  if ("error" in immediate) return immediate;
  const read = context.library.readSetlistItem(target.setlistId, target.index);
  if (read === null) return { error: "vj_setlist_not_found" };
  if (target.index === null) {
    return {
      error: read.itemCount === 0 ? "vj_setlist_empty" : "vj_setlist_start",
    };
  }
  const item = lookAtSetlistIndex(
    read,
    target.index,
    direction === "next" ? "vj_setlist_end" : "vj_setlist_index_invalid",
  );
  if ("error" in item) return item;
  return vjRecallChange(
    { ...recallVjSceneState(state, item.look), setlistIndex: target.index },
    item.look,
  );
}

/** `stage:setlistNext`: vj_setlist_none, isImmediate, vj_setlist_not_found,
 *  vj_setlist_empty, vj_setlist_end; recalls `(setlistIndex ?? -1) + 1` and
 *  sets `setlistIndex`. Pass the payload record so isImmediate is checked
 *  before the item read (the dispatcher checks it again after the rule). */
export function applySetlistNext(
  state: VjStageState,
  context: VjDemoCommandContext,
  record: Record<string, unknown> = {},
): VjDemoCommandOutcome {
  return applyVjSetlistStep(state, "next", context, record);
}

/** `stage:setlistPrevious`: vj_setlist_none, vj_setlist_start, isImmediate,
 *  vj_setlist_not_found, vj_setlist_empty; recalls `setlistIndex - 1`. */
export function applySetlistPrevious(
  state: VjStageState,
  context: VjDemoCommandContext,
  record: Record<string, unknown> = {},
): VjDemoCommandOutcome {
  return applyVjSetlistStep(state, "previous", context, record);
}
