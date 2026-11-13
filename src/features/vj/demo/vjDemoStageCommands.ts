// Contract 7.4, 7.5 and 7.6 stage command rules for the demo server, pure:
// the core commands (pack, clip, generator, transition, overlay, strobe), the
// isImmediate reader and the dispatcher every stamped command goes through.
// Mirrors queerpulse-backend/src/vj/stage/vj-source-rules.ts (setPack,
// goClip, goGenerator), vj-look-rules.ts (setTransition, setOverlay),
// vj-effects-rules.ts (setStrobe) and readVjImmediateFlag of vj-rule-kit.ts,
// in the same check order (backend plan note 19): the field rules,
// isImmediate, then the library reads. The manual picks take a running
// sequence over as stage/vj-command-rules.ts does (sequences contract 5.4).

import {
  VJ_COLOR_TOKENS,
  VJ_OVERLAY_POSITIONS,
  VJ_OVERLAY_SIZES,
  VJ_OVERLAY_STYLES,
  VJ_TRANSITION_IDS,
  isSameVjStageContent,
  vjSetlistTakeoverState,
  type VjOverlay,
  type VjSetlistClockStamp,
  type VjSetlistPlaybackStatus,
  type VjSetlistRead,
  type VjSocketErrorCode,
  type VjStageState,
  type VjTransition,
} from "../../../shared/contracts/vj";
import type { VjCommandFrameName } from "../realtime/vjFrames";
import {
  NO_VJ_DEMO_STAMPS,
  vjDemoChange,
  withVjLiveClip,
  withVjLiveGenerator,
  type VjDemoCommandContext,
  type VjDemoCommandOutcome,
  type VjDemoStamps,
} from "./vjDemoCommandKit";
import { applyResetLook, applySetEffects } from "./vjDemoEffectCommands";
import {
  applySetMix,
  applySetScreenOverride,
  applySwapMix,
} from "./vjDemoMixCommands";
import { isVjUuid } from "./vjDemoRules";
import {
  applyRecallScene,
  applySetlistNext,
  applySetlistPrevious,
  applySetlistSelect,
  applySetlistSetLooping,
  applySetlistSetPlaying,
  type VjDemoSetlistCommandContext,
  type VjDemoSetlistOutcome,
} from "./vjDemoSceneCommands";
import {
  applySetCountdown,
  applySetEventCard,
  applySetLogo,
} from "./vjDemoShowCommands";
import {
  OVERLAY_HIDE_AFTER_MS_RANGE,
  isNumberInRange,
  isOneOf,
  readOverlayText,
  readVjGeneratorChoice,
  readVjRecord,
  readVjTransitionLength,
} from "./vjDemoStageInput";
import { applySetShuffle, applySetTempo } from "./vjDemoTempoCommands";

export {
  isVjCommandFrameName,
  readVjRecord,
  readVjScreenStatusPayload,
  VJ_REMOTE_COMMAND_NAMES,
  vjDemoAckFailure,
} from "./vjDemoStageInput";

export type VjStageCommandResult =
  | {
      state: VjStageState;
      isNoop: boolean;
      stamps: VjDemoStamps;
      isLookSwitch: boolean;
      isImmediate: boolean;
      /** The clock the landing stamps (sequences contract 3.5). */
      setlistClock: VjSetlistClockStamp;
      /** The set list reads the rule made, for the stage's setlistItemIds. */
      setlistReads: readonly (VjSetlistRead | null)[];
    }
  | { error: VjSocketErrorCode };

/** Whether any of the fields is present; an undefined value counts as absent. */
function hasAnyVjField(
  record: Record<string, unknown>,
  fields: readonly string[],
): boolean {
  return fields.some((field) => record[field] !== undefined);
}

// isImmediate (contract 7.4, last paragraph).

/** The `stage:setEffects` patch fields other than `isBlackout`. */
const VJ_SET_EFFECTS_OTHER_FIELDS = ["speed", "settings"] as const;

/** Whether `isImmediate: true` is allowed for this command and payload. */
function isVjImmediateAllowed(
  name: VjCommandFrameName,
  record: Record<string, unknown>,
): boolean {
  if (name === "stage:setEffects") {
    return (
      record.isBlackout !== undefined &&
      !hasAnyVjField(record, VJ_SET_EFFECTS_OTHER_FIELDS)
    );
  }
  if (name === "stage:setStrobe") return record.isStrobing === false;
  return name === "stage:resetLook";
}

/** C 7.4: isImmediate is allowed on setEffects with isBlackout alone, setStrobe false, resetLook. */
export function readVjImmediateFlag(
  name: VjCommandFrameName,
  record: Record<string, unknown>,
): { isImmediate: boolean } | { error: VjSocketErrorCode } {
  const flag = record.isImmediate;
  if (flag === undefined) return { isImmediate: false };
  if (typeof flag !== "boolean") return { error: "vj_effect_flag_invalid" };
  if (flag && !isVjImmediateAllowed(name, record)) {
    return { error: "vj_immediate_not_allowed" };
  }
  return { isImmediate: flag };
}

/** The isImmediate refusal a rule answers before its library reads, or null. */
function immediateRefusalOf(
  name: VjCommandFrameName,
  record: Record<string, unknown>,
): { error: VjSocketErrorCode } | null {
  const immediate = readVjImmediateFlag(name, record);
  return "error" in immediate ? immediate : null;
}

// The core commands (contract 7.5 rows).

/** A uuid lowercased, or null as sent; null for anything else. */
function readNullableVjUuid(value: unknown): { id: string | null } | null {
  if (value === null) return { id: null };
  return isVjUuid(value) ? { id: value.toLowerCase() } : null;
}

/** `stage:setPack`: v1, plus a pack change empties `shuffle.excludedClipIds`
 *  and hides the event card when the new pack is null or links no event. */
export function applySetPack(
  state: VjStageState,
  record: Record<string, unknown>,
  context: VjDemoCommandContext,
): VjDemoCommandOutcome {
  const packRead = readNullableVjUuid(record.packId);
  if (packRead === null) return { error: "vj_pack_not_found" };
  const immediateRefusal = immediateRefusalOf("stage:setPack", record);
  if (immediateRefusal !== null) return immediateRefusal;
  const nextPackId = packRead.id;
  const pack =
    nextPackId === null ? null : context.library.readPackForStage(nextPackId);
  if (nextPackId !== null && pack === null) {
    return { error: "vj_pack_not_found" };
  }
  if (nextPackId === state.activePackId) return vjDemoChange(state);
  const isEventLinked = pack !== null && pack.eventId !== null;
  return vjDemoChange({
    ...state,
    activePackId: nextPackId,
    clipSequence: state.clipSequence + 1,
    shuffle: { ...state.shuffle, excludedClipIds: [] },
    eventCard: isEventLinked
      ? state.eventCard
      : { ...state.eventCard, isVisible: false },
  });
}

/** `stage:goClip`: v1 through `withVjLiveClip`, so a clip clears the
 *  generator and leads the history, and null goes to black. A re-tap always
 *  changes the stage: the sequence grows and liveSince restamps. */
export function applyGoClip(
  state: VjStageState,
  record: Record<string, unknown>,
  context: VjDemoCommandContext,
): VjDemoCommandOutcome {
  const clipRead = readNullableVjUuid(record.clipId);
  if (clipRead === null) return { error: "vj_clip_not_found" };
  const immediateRefusal = immediateRefusalOf("stage:goClip", record);
  if (immediateRefusal !== null) return immediateRefusal;
  const liveClipId = clipRead.id;
  if (liveClipId !== null && !context.library.hasClip(liveClipId)) {
    return { error: "vj_clip_not_found" };
  }
  return vjDemoChange(withVjLiveClip(state, liveClipId), {
    isAlwaysChange: true,
    stamps: { isLiveSourceSet: true },
  });
}

/** `stage:goGenerator`: an absent variant takes the catalog default, null goes
 *  to black, and the same generator again still grows the sequence. */
export function applyGoGenerator(
  state: VjStageState,
  record: Record<string, unknown>,
): VjDemoCommandOutcome {
  const { generatorId, variant } = record;
  if (generatorId === null) {
    if (variant !== undefined && variant !== null) {
      return { error: "vj_generator_variant_invalid" };
    }
    return vjDemoChange(withVjLiveGenerator(state, null, null), {
      isAlwaysChange: true,
      stamps: { isLiveSourceSet: true },
    });
  }
  const choice = readVjGeneratorChoice(
    generatorId,
    variant,
    variant !== undefined,
  );
  if ("error" in choice) return choice;
  return vjDemoChange(
    withVjLiveGenerator(state, choice.generatorId, choice.generatorVariant),
    { isAlwaysChange: true, stamps: { isLiveSourceSet: true } },
  );
}

const VJ_TRANSITION_FIELDS = ["mode", "length"] as const;

/** `stage:setTransition`: the mode, then the length. */
export function applySetTransition(
  state: VjStageState,
  record: Record<string, unknown>,
): VjDemoCommandOutcome {
  if (!hasAnyVjField(record, VJ_TRANSITION_FIELDS)) {
    return { error: "vj_patch_empty" };
  }
  const transition: VjTransition = { ...state.transition };
  if (record.mode !== undefined) {
    if (!isOneOf(VJ_TRANSITION_IDS, record.mode)) {
      return { error: "vj_transition_mode_invalid" };
    }
    transition.mode = record.mode;
  }
  if (record.length !== undefined) {
    const length = readVjTransitionLength(record.length);
    if ("error" in length) return length;
    transition.length = length;
  }
  return vjDemoChange({ ...state, transition });
}

const VJ_OVERLAY_FIELDS = [
  "text",
  "style",
  "isVisible",
  "position",
  "size",
  "colorToken",
  "hideAfterMs",
] as const;

/** The listed overlay fields after the text, in check order. */
const VJ_OVERLAY_LIST_FIELDS = [
  { field: "style", list: VJ_OVERLAY_STYLES, code: "vj_overlay_style_invalid" },
  {
    field: "position",
    list: VJ_OVERLAY_POSITIONS,
    code: "vj_overlay_position_invalid",
  },
  { field: "size", list: VJ_OVERLAY_SIZES, code: "vj_overlay_size_invalid" },
  {
    field: "colorToken",
    list: VJ_COLOR_TOKENS,
    code: "vj_color_token_invalid",
  },
] as const satisfies ReadonlyArray<{
  field: keyof VjOverlay;
  list: readonly string[];
  code: VjSocketErrorCode;
}>;

/** The overlay patch through the field rules (text, the listed fields,
 *  isVisible), or the code that refuses it. */
function readVjOverlayPatch(
  overlay: VjOverlay,
  record: Record<string, unknown>,
): VjOverlay | { error: VjSocketErrorCode } {
  const next: VjOverlay = { ...overlay };
  if (record.text !== undefined) {
    const text = readOverlayText(record.text);
    if (typeof text !== "string") return text;
    next.text = text;
  }
  for (const { field, list, code } of VJ_OVERLAY_LIST_FIELDS) {
    const value = record[field];
    if (value === undefined) continue;
    if (!isOneOf<string>(list, value)) return { error: code };
    Object.assign(next, { [field]: value });
  }
  if (record.isVisible !== undefined) {
    if (typeof record.isVisible !== "boolean") {
      return { error: "vj_effect_flag_invalid" };
    }
    next.isVisible = record.isVisible;
  }
  return next;
}

/** `stage:setOverlay`: the field rules, `hideAfterMs`, then the blank text
 *  check. A hidden result clears `hideAt`; a visible one stamps it from a
 *  `hideAfterMs` number, clears it for null and keeps it when absent. */
export function applySetOverlay(
  state: VjStageState,
  record: Record<string, unknown>,
): VjDemoCommandOutcome {
  if (!hasAnyVjField(record, VJ_OVERLAY_FIELDS)) {
    return { error: "vj_patch_empty" };
  }
  const overlay = readVjOverlayPatch(state.overlay, record);
  if ("error" in overlay) return overlay;
  const { hideAfterMs } = record;
  const isHideAfterMsValid =
    hideAfterMs === undefined ||
    hideAfterMs === null ||
    isNumberInRange(hideAfterMs, OVERLAY_HIDE_AFTER_MS_RANGE);
  if (!isHideAfterMsValid) return { error: "vj_overlay_hide_out_of_range" };
  if (overlay.isVisible && overlay.text.length === 0) {
    return { error: "vj_overlay_text_blank" };
  }
  if (!overlay.isVisible) {
    return vjDemoChange(
      { ...state, overlay: { ...overlay, hideAt: null } },
      { stamps: { overlayHideAfterMs: null } },
    );
  }
  const overlayHideAfterMs = hideAfterMs;
  return vjDemoChange(
    {
      ...state,
      overlay: {
        ...overlay,
        hideAt: overlayHideAfterMs === null ? null : overlay.hideAt,
      },
    },
    {
      // A number restamps hideAt at applyAt ?? now, so the stage changes.
      isAlwaysChange: typeof overlayHideAfterMs === "number",
      stamps: { overlayHideAfterMs },
    },
  );
}

/** `stage:setStrobe`: the v1 flag rule (isImmediate follows in the
 *  dispatcher). On while on is a noop, so the start is never extended. */
export function applySetStrobe(
  state: VjStageState,
  record: Record<string, unknown>,
): VjDemoCommandOutcome {
  const { isStrobing } = record;
  if (typeof isStrobing !== "boolean") {
    return { error: "vj_effect_flag_invalid" };
  }
  return vjDemoChange(
    { ...state, effects: { ...state.effects, isStrobing } },
    { stamps: { isStrobeStarted: isStrobing && !state.effects.isStrobing } },
  );
}

// The dispatcher.

type VjDemoCommandRule = (
  state: VjStageState,
  record: Record<string, unknown>,
  context: VjDemoSetlistCommandContext,
) => VjDemoSetlistOutcome;

/** Every stamped command (contract 9.3) to its rule. */
export const VJ_DEMO_COMMAND_RULES: Readonly<
  Record<VjCommandFrameName, VjDemoCommandRule>
> = {
  "stage:setPack": applySetPack,
  "stage:goClip": applyGoClip,
  "stage:goGenerator": applyGoGenerator,
  "stage:setTransition": applySetTransition,
  "stage:setOverlay": applySetOverlay,
  "stage:setEffects": applySetEffects,
  "stage:setStrobe": applySetStrobe,
  "stage:setShuffle": applySetShuffle,
  "stage:setTempo": applySetTempo,
  "stage:setMix": applySetMix,
  "stage:swapMix": applySwapMix,
  "stage:setScreenOverride": applySetScreenOverride,
  "stage:resetLook": applyResetLook,
  "stage:recallScene": applyRecallScene,
  "stage:setlistSelect": applySetlistSelect,
  "stage:setlistNext": (state, record, context) =>
    applySetlistNext(state, context, record),
  "stage:setlistPrevious": (state, record, context) =>
    applySetlistPrevious(state, context, record),
  "stage:setlistSetPlaying": applySetlistSetPlaying,
  "stage:setlistSetLooping": applySetlistSetLooping,
  "stage:setCountdown": applySetCountdown,
  "stage:setLogo": applySetLogo,
  "stage:setEventCard": applySetEventCard,
};

/** C 7.4 step 2 for a rule that does not say: a scene recall lands on the
 *  grid. Every set list rule answers its own flag (sequences contract 5.3:
 *  a transition that shows a step is a look switch). */
export function isVjDemoLookSwitch(name: VjCommandFrameName): boolean {
  return name === "stage:recallScene";
}

/** The manual picks that take a running sequence over (sequences contract
 *  5.4, design 13.1): a clip, a generator, a pack, the mix swap, a scene
 *  recalled outside the sequence and shuffle turned on. */
export const VJ_DEMO_SETLIST_TAKEOVER_COMMANDS: readonly VjCommandFrameName[] =
  [
    "stage:setPack",
    "stage:goClip",
    "stage:goGenerator",
    "stage:swapMix",
    "stage:recallScene",
    "stage:setShuffle",
  ];

/** The statuses a manual pick takes over; manual, takenOver and finished never change. */
const VJ_DEMO_TAKEOVER_STATUSES: readonly VjSetlistPlaybackStatus[] = [
  "playing",
  "paused",
  "needsFlashConsent",
];

/** A scene recalled by hand takes the sequence over whatever it changes
 *  (design 13.1), a look with no source included. Index, itemId,
 *  isFlashConfirmed and isLooping are kept; every clock field is cleared. */
function vjDemoSceneTakeoverState(next: VjStageState): VjStageState {
  if (!VJ_DEMO_TAKEOVER_STATUSES.includes(next.setlistPlayback.status)) {
    return next;
  }
  return {
    ...next,
    setlistPlayback: {
      ...next.setlistPlayback,
      status: "takenOver",
      stepStartedAt: null,
      stepEndsAt: null,
      stepDurationMs: null,
      pausedRemainingMs: null,
    },
  };
}

/** A takeover command's accepted state with the sequence taken over
 *  (backend withVjSetlistTakeover): `stage:recallScene` always takes a
 *  playing, paused or needsFlashConsent sequence over; the other five go
 *  through vjSetlistTakeoverState (the live source moved, or shuffle went
 *  from off to on). Other commands come back as they are. */
export function withVjDemoSetlistTakeover(
  name: VjCommandFrameName,
  previous: VjStageState,
  next: VjStageState,
): VjStageState {
  if (!VJ_DEMO_SETLIST_TAKEOVER_COMMANDS.includes(name)) return next;
  return name === "stage:recallScene"
    ? vjDemoSceneTakeoverState(next)
    : vjSetlistTakeoverState(previous, next);
}

/** C 7.5 and 7.6 rules for one stamped command, the sequence takeover
 *  applied; the result is unsettled (the landing settles it). A change that
 *  stamps the set list clock skips the early noop compare, so the landing
 *  compares the stamped state as the backend does. */
export function applyVjStageCommand(
  state: VjStageState,
  name: VjCommandFrameName,
  payload: unknown,
  context: VjDemoSetlistCommandContext,
): VjStageCommandResult {
  const record = readVjRecord(payload);
  const outcome = VJ_DEMO_COMMAND_RULES[name](state, record, context);
  if ("error" in outcome) return outcome;
  // Plan call 4: isImmediate is checked after the command's own rules.
  const immediate = readVjImmediateFlag(name, record);
  if ("error" in immediate) return immediate;
  const next = withVjDemoSetlistTakeover(name, state, outcome.next);
  const isLookSwitch = outcome.isLookSwitch ?? isVjDemoLookSwitch(name);
  const setlistClock = outcome.setlistClock ?? { kind: "keep" };
  const setlistReads = outcome.setlistReads ?? [];
  const isClockKept = setlistClock.kind === "keep";
  if (
    isClockKept &&
    !outcome.isAlwaysChange &&
    isSameVjStageContent(next, state)
  ) {
    return {
      state,
      isNoop: true,
      stamps: NO_VJ_DEMO_STAMPS,
      isLookSwitch,
      isImmediate: immediate.isImmediate,
      setlistClock,
      setlistReads,
    };
  }
  return {
    state: next,
    isNoop: false,
    stamps: outcome.stamps,
    isLookSwitch,
    isImmediate: immediate.isImmediate,
    setlistClock,
    setlistReads,
  };
}
