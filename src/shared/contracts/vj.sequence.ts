/**
 * VJ wire contract (C 3), frontend mirror of
 * `queerpulse-backend/src/vj/vj.contract.ts`. Names and values match it; edit
 * both together.
 *
 * Sequences (VJ sequences contract 2026-11-13, sections 3.3 to 3.5, 3.8 and 7):
 * the step length helpers, the set list read shapes, the pure playback
 * transition table, the clock stamp and the restore of the playback. Every
 * function here is pure: nothing shows a step and nothing reads a clock.
 */

import { vjSceneLookFlashes } from "./vj.effects";
import {
  VJ_LIMITS,
  VJ_SETLIST_PLAYBACK_STATUSES,
  VJ_STEP_BEAT_COUNTS,
  type VjSetlistPlaybackStatus,
} from "./vj.lists";
import type {
  VjSceneLook,
  VjSetlistPlayback,
  VjStageState,
  VjStepDuration,
  VjTempo,
} from "./vj.state";
import { vjNextBoundaryAt, vjStepDurationMs } from "./vj.tempo";

// Step lengths (3.3)

/** The sequence default and the step override use these bounds. */
export const DEFAULT_VJ_STEP_DURATION: VjStepDuration = Object.freeze({
  kind: "seconds",
  value: VJ_LIMITS.setlistStepSecondsDefault,
});

/** A step length in range: seconds an integer 2..600, beats one of VJ_STEP_BEAT_COUNTS. */
export function isVjStepDuration(value: unknown): value is VjStepDuration {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }
  const record = value as Record<string, unknown>;
  const ownKeys = Object.keys(record);
  if (ownKeys.length !== 2 || !("kind" in record) || !("value" in record)) {
    return false;
  }
  if (record.kind === "seconds") {
    return (
      typeof record.value === "number" &&
      Number.isInteger(record.value) &&
      record.value >= VJ_LIMITS.setlistStepSecondsMin &&
      record.value <= VJ_LIMITS.setlistStepSecondsMax
    );
  }
  return (
    record.kind === "beats" &&
    (VJ_STEP_BEAT_COUNTS as readonly unknown[]).includes(record.value)
  );
}

/** The length a step plays: its own, else the sequence default. */
export function vjResolvedStepDuration(
  itemDuration: VjStepDuration | null,
  sequenceDefault: VjStepDuration,
): VjStepDuration {
  return itemDuration ?? sequenceDefault;
}

/** The default playback; a set list's saved Loop goes in. */
export function createVjSetlistPlayback(isLooping: boolean): VjSetlistPlayback {
  return {
    status: "manual",
    itemId: null,
    isFlashConfirmed: false,
    stepStartedAt: null,
    stepEndsAt: null,
    stepDurationMs: null,
    pausedRemainingMs: null,
    isLooping,
  };
}

// Reads (3.3)

/** Where a set list read points. 'count' reads no step; 'index' reads that
 *  step, or step 0 past the end when wrapsToFirst; 'last' reads the final step. */
export type VjSetlistReadPosition =
  | { kind: "count" }
  | { kind: "index"; index: number; wrapsToFirst: boolean }
  | { kind: "last" };

/** An index position, normalised: an index at or past setlistItemsMax can
 *  hold no step, so it reads step 0 when wrapping and the count otherwise. */
export function vjSetlistIndexPosition(
  index: number,
  wrapsToFirst: boolean,
): VjSetlistReadPosition {
  if (index < VJ_LIMITS.setlistItemsMax) {
    return { kind: "index", index, wrapsToFirst };
  }
  return wrapsToFirst
    ? { kind: "index", index: 0, wrapsToFirst: false }
    : { kind: "count" };
}

/** One step as a read hands it back. */
export type VjSetlistStepRead =
  | {
      kind: "scene";
      itemId: string;
      index: number;
      sceneId: string;
      look: VjSceneLook;
      /** Resolved: the step's own length, else the sequence default. */
      duration: VjStepDuration;
    }
  | {
      kind: "clip";
      itemId: string;
      index: number;
      clipId: string;
      duration: VjStepDuration;
    };

/** A set list read for a command, the timer or a restore. */
export interface VjSetlistRead {
  setlistId: string;
  isLooping: boolean;
  stepDuration: VjStepDuration;
  /** Every item id in play order (position, id); its length is the item count. */
  itemIds: string[];
  /** The step at the asked position; null for 'count' and past the end. */
  step: VjSetlistStepRead | null;
}

/** A set list read after a library change. */
export interface VjSetlistFollowRead {
  itemIds: string[];
  isLooping: boolean;
}

/** Whether recalling the step can flash. Clip steps never flash. */
export function vjSetlistStepFlashes(step: VjSetlistStepRead): boolean {
  return step.kind === "scene" && vjSceneLookFlashes(step.look);
}

/** Whether a change moves what is live: source, variant, clipSequence or pack. */
export function vjIsLiveSourceChange(
  previous: VjStageState,
  next: VjStageState,
): boolean {
  return (
    previous.liveClipId !== next.liveClipId ||
    previous.liveGeneratorId !== next.liveGeneratorId ||
    previous.liveGeneratorVariant !== next.liveGeneratorVariant ||
    previous.clipSequence !== next.clipSequence ||
    previous.activePackId !== next.activePackId
  );
}

// Transition table (3.4)

/** The step the caller puts on screen before landing: a scene goes through
 *  recallVjScene (look switch, overlay hideAt cleared); a clip goes through
 *  withVjLiveSource only (look switch, hideAt kept), like goClip with the
 *  pack rule skipped, as scene recall skips it. */
export type VjSetlistShow =
  { kind: "scene"; look: VjSceneLook } | { kind: "clip"; clipId: string };

/** What the landing writes into the clock fields (see stampVjSetlistClock). */
export type VjSetlistClockStamp =
  | { kind: "keep" }
  | { kind: "clear" }
  | { kind: "start"; durationMs: number; remainingMs: number };

export interface VjSetlistTransition {
  /** activeSetlistId, setlistIndex, setlistPlayback and (when play starts or
   *  a step lands paused) shuffle.isOn changed; every other field as given. */
  nextState: VjStageState;
  show: VjSetlistShow | null;
  clock: VjSetlistClockStamp;
}

export type VjSetlistRefusalCode =
  | "vj_setlist_not_found"
  | "vj_setlist_empty"
  | "vj_setlist_index_invalid"
  | "vj_setlist_start"
  | "vj_setlist_end"
  | "vj_setlist_flash_unconfirmed";

export type VjSetlistTransitionResult =
  | { code: VjSetlistRefusalCode; transition: null }
  | { code: null; transition: VjSetlistTransition };

export interface VjSetlistSelectInput {
  setlistId: string | null;
  index: number | null;
  isPlaying: boolean;
  isFlashConfirmed: boolean;
  /** Null when setlistId is null or no set list has the id. */
  read: VjSetlistRead | null;
}

export interface VjSetlistSetPlayingInput {
  isPlaying: boolean;
  isFlashConfirmed: boolean;
  /** Null when no read was needed (position null) or the set list is gone. */
  read: VjSetlistRead | null;
  now: number;
}

export interface VjSetlistStepInput {
  direction: "next" | "previous";
  /** The remote confirmed the flash warning for this tap; absent reads as false. */
  isFlashConfirmed?: boolean;
  read: VjSetlistRead | null;
}

export interface VjSetlistFollowInput {
  setlistId: string;
  /** Item ids in play order before the change; null when unknown. */
  previousItemIds: readonly string[] | null;
  /** The set list now; null when it is gone. */
  read: VjSetlistFollowRead | null;
}

function refusedTransition(
  code: VjSetlistRefusalCode,
): VjSetlistTransitionResult {
  return { code, transition: null };
}

function acceptedTransition(
  nextState: VjStageState,
  show: VjSetlistShow | null,
  clock: VjSetlistClockStamp,
): VjSetlistTransitionResult {
  return { code: null, transition: { nextState, show, clock } };
}

/** The step as the caller shows it. */
function vjSetlistShowOf(step: VjSetlistStepRead): VjSetlistShow {
  if (step.kind === "scene") {
    return { kind: "scene", look: step.look };
  }
  return { kind: "clip", clipId: step.clipId };
}

/** `full`: the step's length in ms with the tempo of the state. */
function vjSetlistFullMs(state: VjStageState, step: VjSetlistStepRead): number {
  return vjStepDurationMs(step.duration, state.tempo);
}

/** The flash check fails when the step flashes and no one confirmed it. */
function isFlashCheckFailing(
  step: VjSetlistStepRead,
  isInputConfirmed: boolean,
  playback: VjSetlistPlayback,
): boolean {
  return (
    vjSetlistStepFlashes(step) &&
    !isInputConfirmed &&
    !playback.isFlashConfirmed
  );
}

/** Ids compare lowercased. */
function isSameVjSetlistId(first: string, second: string): boolean {
  return first.toLowerCase() === second.toLowerCase();
}

/** The clock times every non-running result leaves empty. */
const VJ_SETLIST_NO_CLOCK_TIMES = {
  stepStartedAt: null,
  stepEndsAt: null,
} as const;

/** A transition that puts `step` on screen: index and item id follow the
 *  step, Loop follows the read, and `playbackFields` set the rest. */
function vjSetlistShowingStep(
  base: VjStageState,
  read: VjSetlistRead,
  step: VjSetlistStepRead,
  playbackFields: Partial<VjSetlistPlayback>,
  clock: VjSetlistClockStamp,
): VjSetlistTransition {
  return {
    nextState: {
      ...base,
      setlistIndex: step.index,
      setlistPlayback: {
        ...base.setlistPlayback,
        itemId: step.itemId,
        isLooping: read.isLooping,
        ...playbackFields,
      },
    },
    show: vjSetlistShowOf(step),
    clock,
  };
}

/** The playback fields of a running step; the landing stamps the two times. */
function vjSetlistRunningFields(
  durationMs: number,
): Partial<VjSetlistPlayback> {
  return {
    status: "playing",
    ...VJ_SETLIST_NO_CLOCK_TIMES,
    stepDurationMs: durationMs,
    pausedRemainingMs: null,
  };
}

/** Playing from step: show it, status playing, shuffle off, clock start(full, full). */
function vjSetlistPlayingFromStep(
  base: VjStageState,
  read: VjSetlistRead,
  step: VjSetlistStepRead,
  isFlashConfirmed: boolean,
): VjSetlistTransition {
  const durationMs = vjSetlistFullMs(base, step);
  return vjSetlistShowingStep(
    { ...base, shuffle: { ...base.shuffle, isOn: false } },
    read,
    step,
    { ...vjSetlistRunningFields(durationMs), isFlashConfirmed },
    { kind: "start", durationMs, remainingMs: durationMs },
  );
}

/** `state` with some playback fields replaced. */
function vjSetlistWithPlayback(
  state: VjStageState,
  playbackFields: Partial<VjSetlistPlayback>,
): VjStageState {
  return {
    ...state,
    setlistPlayback: { ...state.setlistPlayback, ...playbackFields },
  };
}

/** Cleared state: no active set list, the default playback, no index. */
export function vjSetlistClearedState(state: VjStageState): VjStageState {
  return {
    ...state,
    activeSetlistId: null,
    setlistIndex: null,
    setlistPlayback: createVjSetlistPlayback(false),
  };
}

/** Where a select reads: index null and not playing reads the count; index
 *  null and playing reads step 0; any other index reads that step. */
export function vjSetlistSelectReadPosition(
  index: number | null,
  isPlaying: boolean,
): VjSetlistReadPosition {
  if (index === null) {
    return isPlaying ? vjSetlistIndexPosition(0, false) : { kind: "count" };
  }
  return vjSetlistIndexPosition(index, false);
}

/** `stage:setlistSelect`. A select starts a fresh run, so the flash check
 *  reads the payload's confirmation alone. */
export function vjSetlistSelectTransition(
  state: VjStageState,
  input: VjSetlistSelectInput,
): VjSetlistTransitionResult {
  if (input.setlistId === null) {
    return acceptedTransition(vjSetlistClearedState(state), null, {
      kind: "clear",
    });
  }
  const read = input.read;
  if (read === null) {
    return refusedTransition("vj_setlist_not_found");
  }
  const freshState: VjStageState = {
    ...state,
    activeSetlistId: input.setlistId,
    setlistPlayback: createVjSetlistPlayback(read.isLooping),
  };
  if (input.index === null && !input.isPlaying) {
    return acceptedTransition({ ...freshState, setlistIndex: null }, null, {
      kind: "clear",
    });
  }
  if (read.itemIds.length === 0) {
    return refusedTransition("vj_setlist_empty");
  }
  const step = read.step;
  if (step === null) {
    return refusedTransition("vj_setlist_index_invalid");
  }
  if (
    input.isPlaying &&
    isFlashCheckFailing(
      step,
      input.isFlashConfirmed,
      freshState.setlistPlayback,
    )
  ) {
    return refusedTransition("vj_setlist_flash_unconfirmed");
  }
  if (!input.isPlaying) {
    const shown = vjSetlistShowingStep(
      freshState,
      read,
      step,
      {
        status: "manual",
        isFlashConfirmed: input.isFlashConfirmed,
        ...VJ_SETLIST_NO_CLOCK_TIMES,
        stepDurationMs: null,
        pausedRemainingMs: null,
      },
      { kind: "clear" },
    );
    return { code: null, transition: shown };
  }
  return {
    code: null,
    transition: vjSetlistPlayingFromStep(
      freshState,
      read,
      step,
      input.isFlashConfirmed,
    ),
  };
}

/** Where a setPlaying reads (`index` is state.setlistIndex); null needs no read. */
export function vjSetlistSetPlayingReadPosition(
  state: VjStageState,
  isPlaying: boolean,
): VjSetlistReadPosition | null {
  if (!isPlaying) {
    return null;
  }
  const playback = state.setlistPlayback;
  const index = state.setlistIndex;
  switch (playback.status) {
    case "playing":
    case "paused":
      return null;
    case "manual":
      return vjSetlistIndexPosition(index ?? 0, false);
    case "takenOver":
      return vjSetlistIndexPosition((index ?? -1) + 1, true);
    case "finished":
      return vjSetlistIndexPosition(0, false);
    case "needsFlashConsent":
      return vjSetlistIndexPosition((index ?? -1) + 1, playback.isLooping);
  }
}

/** `stage:setlistSetPlaying` (the rule has already refused vj_setlist_none). */
export function vjSetlistSetPlayingTransition(
  state: VjStageState,
  input: VjSetlistSetPlayingInput,
): VjSetlistTransitionResult {
  const playback = state.setlistPlayback;
  if (!input.isPlaying) {
    if (playback.status !== "playing") {
      return acceptedTransition(state, null, { kind: "keep" });
    }
    const unclampedRemainingMs = Math.max(
      0,
      (playback.stepEndsAt ?? input.now) - input.now,
    );
    // A step stamped at a future applyAt has not started; the invariant is
    // 0..stepDurationMs, so the remaining time never exceeds the full length.
    const pausedRemainingMs =
      playback.stepDurationMs === null
        ? unclampedRemainingMs
        : Math.min(unclampedRemainingMs, playback.stepDurationMs);
    return acceptedTransition(
      vjSetlistWithPlayback(state, {
        status: "paused",
        ...VJ_SETLIST_NO_CLOCK_TIMES,
        pausedRemainingMs,
      }),
      null,
      { kind: "clear" },
    );
  }
  const confirmedPlayback = input.isFlashConfirmed
    ? { isFlashConfirmed: true }
    : {};
  if (playback.status === "playing") {
    return acceptedTransition(
      input.isFlashConfirmed
        ? vjSetlistWithPlayback(state, confirmedPlayback)
        : state,
      null,
      { kind: "keep" },
    );
  }
  if (playback.status === "paused") {
    const remainingMs =
      playback.pausedRemainingMs ?? playback.stepDurationMs ?? 0;
    const durationMs = playback.stepDurationMs ?? remainingMs;
    return acceptedTransition(
      vjSetlistWithPlayback(
        { ...state, shuffle: { ...state.shuffle, isOn: false } },
        { ...vjSetlistRunningFields(durationMs), ...confirmedPlayback },
      ),
      null,
      { kind: "start", durationMs, remainingMs },
    );
  }
  const read = input.read;
  if (read === null) {
    return refusedTransition("vj_setlist_not_found");
  }
  if (read.itemIds.length === 0) {
    return refusedTransition("vj_setlist_empty");
  }
  const step = read.step;
  if (step === null) {
    return refusedTransition("vj_setlist_index_invalid");
  }
  if (playback.status === "manual" && state.setlistIndex !== null) {
    const durationMs = vjSetlistFullMs(state, step);
    return acceptedTransition(
      vjSetlistWithPlayback(
        { ...state, shuffle: { ...state.shuffle, isOn: false } },
        {
          ...vjSetlistRunningFields(durationMs),
          ...confirmedPlayback,
          isLooping: read.isLooping,
        },
      ),
      null,
      { kind: "start", durationMs, remainingMs: durationMs },
    );
  }
  if (isFlashCheckFailing(step, input.isFlashConfirmed, playback)) {
    return refusedTransition("vj_setlist_flash_unconfirmed");
  }
  return {
    code: null,
    transition: vjSetlistPlayingFromStep(
      state,
      read,
      step,
      input.isFlashConfirmed || playback.isFlashConfirmed,
    ),
  };
}

/** Where a Next or Previous reads (`index` is state.setlistIndex). */
export function vjSetlistStepReadPosition(
  state: VjStageState,
  direction: "next" | "previous",
): VjSetlistReadPosition {
  const index = state.setlistIndex;
  const isLooping = state.setlistPlayback.isLooping;
  if (direction === "next") {
    return vjSetlistIndexPosition((index ?? -1) + 1, isLooping);
  }
  if (index === null || index === 0) {
    return isLooping ? { kind: "last" } : { kind: "count" };
  }
  return vjSetlistIndexPosition(index - 1, false);
}

/** `stage:setlistNext` and `stage:setlistPrevious`. A step that can flash
 *  lands only when the tap or the stored run flag confirmed the warning, in
 *  every status, so a remote with a stale index never lands an unconfirmed
 *  flashing step. */
export function vjSetlistStepTransition(
  state: VjStageState,
  input: VjSetlistStepInput,
): VjSetlistTransitionResult {
  const read = input.read;
  if (read === null) {
    return refusedTransition("vj_setlist_not_found");
  }
  if (read.itemIds.length === 0) {
    return refusedTransition("vj_setlist_empty");
  }
  const position = vjSetlistStepReadPosition(state, input.direction);
  if (input.direction === "previous" && position.kind === "count") {
    return refusedTransition("vj_setlist_start");
  }
  const step = read.step;
  if (step === null) {
    return refusedTransition(
      input.direction === "next"
        ? "vj_setlist_end"
        : "vj_setlist_index_invalid",
    );
  }
  if (
    isFlashCheckFailing(
      step,
      input.isFlashConfirmed === true,
      state.setlistPlayback,
    )
  ) {
    return refusedTransition("vj_setlist_flash_unconfirmed");
  }
  const status = state.setlistPlayback.status;
  const fullMs = vjSetlistFullMs(state, step);
  if (status === "playing") {
    return {
      code: null,
      transition: vjSetlistShowingStep(
        state,
        read,
        step,
        vjSetlistRunningFields(fullMs),
        { kind: "start", durationMs: fullMs, remainingMs: fullMs },
      ),
    };
  }
  if (status === "manual") {
    return {
      code: null,
      transition: vjSetlistShowingStep(
        state,
        read,
        step,
        { ...VJ_SETLIST_NO_CLOCK_TIMES },
        { kind: "clear" },
      ),
    };
  }
  // Shuffle turns off so it cannot replace the paused step before Resume.
  return {
    code: null,
    transition: vjSetlistShowingStep(
      { ...state, shuffle: { ...state.shuffle, isOn: false } },
      read,
      step,
      {
        status: "paused",
        ...VJ_SETLIST_NO_CLOCK_TIMES,
        stepDurationMs: fullMs,
        pausedRemainingMs: fullMs,
      },
      { kind: "clear" },
    ),
  };
}

/** The server epoch ms the step timer fires at: the step end less the early
 *  lead, so the advance lands on the end. Null unless a step is running. */
export function vjSetlistTimerTargetAt(state: VjStageState): number | null {
  const playback = state.setlistPlayback;
  if (playback.status === "playing" && playback.stepEndsAt !== null) {
    return playback.stepEndsAt - VJ_LIMITS.quantizedAdvanceEarlyMs;
  }
  return null;
}

/** Where the timer reads; null when no timer target exists or no set list is active. */
export function vjSetlistTimerReadPosition(
  state: VjStageState,
): VjSetlistReadPosition | null {
  if (
    vjSetlistTimerTargetAt(state) === null ||
    state.activeSetlistId === null
  ) {
    return null;
  }
  return vjSetlistIndexPosition(
    (state.setlistIndex ?? -1) + 1,
    state.setlistPlayback.isLooping,
  );
}

/** The server timer's landing; null means land nothing. */
export function vjSetlistTimerTransition(
  state: VjStageState,
  read: VjSetlistRead | null,
): VjSetlistTransition | null {
  const playback = state.setlistPlayback;
  if (
    playback.status !== "playing" ||
    state.activeSetlistId === null ||
    read === null ||
    !isSameVjSetlistId(read.setlistId, state.activeSetlistId)
  ) {
    return null;
  }
  if (read.itemIds.length === 0) {
    return {
      nextState: {
        ...state,
        setlistIndex: null,
        setlistPlayback: {
          ...playback,
          status: "manual",
          itemId: null,
          ...VJ_SETLIST_NO_CLOCK_TIMES,
          stepDurationMs: null,
          pausedRemainingMs: null,
          isLooping: read.isLooping,
        },
      },
      show: null,
      clock: { kind: "clear" },
    };
  }
  const step = read.step;
  if (step === null) {
    return {
      nextState: vjSetlistWithPlayback(state, {
        status: "finished",
        ...VJ_SETLIST_NO_CLOCK_TIMES,
        pausedRemainingMs: null,
        isLooping: read.isLooping,
      }),
      show: null,
      clock: { kind: "clear" },
    };
  }
  if (isFlashCheckFailing(step, false, playback)) {
    return {
      nextState: vjSetlistWithPlayback(state, {
        status: "needsFlashConsent",
        ...VJ_SETLIST_NO_CLOCK_TIMES,
        pausedRemainingMs: null,
        isLooping: read.isLooping,
      }),
      show: null,
      clock: { kind: "clear" },
    };
  }
  const fullMs = vjSetlistFullMs(state, step);
  return vjSetlistShowingStep(
    state,
    read,
    step,
    vjSetlistRunningFields(fullMs),
    { kind: "start", durationMs: fullMs, remainingMs: fullMs },
  );
}

/** Statuses a takeover moves to takenOver. */
const VJ_TAKEOVER_STATUSES: readonly VjSetlistPlaybackStatus[] = [
  "playing",
  "paused",
  "needsFlashConsent",
];

/** After every accepted setPack, goClip, goGenerator, swapMix, recallScene and
 *  setShuffle: a person picking something else (or turning shuffle on) while a
 *  sequence plays, is paused or waits for consent takes the stage over. */
export function vjSetlistTakeoverState(
  previous: VjStageState,
  next: VjStageState,
): VjStageState {
  const isShuffleTurnedOn = !previous.shuffle.isOn && next.shuffle.isOn;
  if (
    !VJ_TAKEOVER_STATUSES.includes(next.setlistPlayback.status) ||
    !(vjIsLiveSourceChange(previous, next) || isShuffleTurnedOn)
  ) {
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

/** `stage:setlistSetLooping` and `setlist_updated`: Loop on the active set list. */
export function vjSetlistLoopingState(
  state: VjStageState,
  setlistId: string,
  isLooping: boolean,
): VjStageState {
  if (
    state.activeSetlistId === null ||
    !isSameVjSetlistId(state.activeSetlistId, setlistId) ||
    state.setlistPlayback.isLooping === isLooping
  ) {
    return state;
  }
  return { ...state, setlistPlayback: { ...state.setlistPlayback, isLooping } };
}

// Index follow after item edits (section 7)

/** The index in `nextIds` of the nearest id of `previousIds` before position
 *  `removedAt` that is still there; null when none is. */
function vjSetlistNearestKeptIndex(
  previousIds: readonly string[],
  removedAt: number,
  nextIds: readonly string[],
): number | null {
  for (let position = removedAt - 1; position >= 0; position -= 1) {
    const previousId = previousIds[position];
    const keptIndex =
      previousId === undefined ? -1 : nextIds.indexOf(previousId);
    if (keptIndex !== -1) {
      return keptIndex;
    }
  }
  return null;
}

/** Where the index and item id sit after the set list changed (rules 3 to 9
 *  of the follow table; rules 1 and 2 are answered by the caller). */
function vjSetlistFollowedPosition(
  index: number | null,
  itemId: string | null,
  previousIds: readonly string[] | null,
  nextIds: readonly string[],
): { index: number | null; itemId: string | null } {
  if (itemId !== null) {
    if (nextIds.includes(itemId)) {
      return { index: nextIds.indexOf(itemId), itemId };
    }
    const removedAt = previousIds === null ? -1 : previousIds.indexOf(itemId);
    if (previousIds !== null && removedAt !== -1) {
      return {
        index: vjSetlistNearestKeptIndex(previousIds, removedAt, nextIds),
        itemId: null,
      };
    }
    const fallbackIndex = Math.min(index ?? 0, nextIds.length) - 1;
    return { index: fallbackIndex < 0 ? null : fallbackIndex, itemId: null };
  }
  if (index === null) {
    return { index: null, itemId: null };
  }
  const anchorId = previousIds === null ? undefined : previousIds[index];
  if (previousIds !== null && anchorId !== undefined) {
    if (nextIds.includes(anchorId)) {
      return { index: nextIds.indexOf(anchorId), itemId: null };
    }
    return {
      index: vjSetlistNearestKeptIndex(previousIds, index, nextIds),
      itemId: null,
    };
  }
  return { index: Math.min(index, nextIds.length - 1), itemId: null };
}

/** Whether two playbacks hold the same fields. */
function isSameVjSetlistPlayback(
  first: VjSetlistPlayback,
  second: VjSetlistPlayback,
): boolean {
  return (
    first.status === second.status &&
    first.itemId === second.itemId &&
    first.isFlashConfirmed === second.isFlashConfirmed &&
    first.stepStartedAt === second.stepStartedAt &&
    first.stepEndsAt === second.stepEndsAt &&
    first.stepDurationMs === second.stepDurationMs &&
    first.pausedRemainingMs === second.pausedRemainingMs &&
    first.isLooping === second.isLooping
  );
}

/** The state after a library change on the active set list: the index follows
 *  the step that stays on screen and a running clock keeps going. Answers
 *  `state` itself when nothing changes. */
export function vjSetlistFollowState(
  state: VjStageState,
  input: VjSetlistFollowInput,
): VjStageState {
  if (
    state.activeSetlistId === null ||
    !isSameVjSetlistId(state.activeSetlistId, input.setlistId)
  ) {
    return state;
  }
  const read = input.read;
  if (read === null) {
    return vjSetlistClearedState(state);
  }
  const playback = state.setlistPlayback;
  let nextIndex: number | null;
  let nextPlayback: VjSetlistPlayback;
  if (read.itemIds.length === 0) {
    nextIndex = null;
    nextPlayback = {
      ...playback,
      status: "manual",
      itemId: null,
      stepStartedAt: null,
      stepEndsAt: null,
      stepDurationMs: null,
      pausedRemainingMs: null,
      isLooping: read.isLooping,
    };
  } else {
    const followed = vjSetlistFollowedPosition(
      state.setlistIndex,
      playback.itemId,
      input.previousItemIds,
      read.itemIds,
    );
    nextIndex = followed.index;
    nextPlayback = {
      ...playback,
      itemId: followed.itemId,
      isLooping: read.isLooping,
    };
  }
  if (
    nextIndex === state.setlistIndex &&
    isSameVjSetlistPlayback(nextPlayback, playback)
  ) {
    return state;
  }
  return { ...state, setlistIndex: nextIndex, setlistPlayback: nextPlayback };
}

// Clock stamp and timer landing (3.5)

/** The clock fields a landing writes, from the change's stampAt (its applyAt, or now). */
export function stampVjSetlistClock(
  playback: VjSetlistPlayback,
  clock: VjSetlistClockStamp,
  stampAt: number,
): VjSetlistPlayback {
  if (clock.kind === "keep") {
    return playback;
  }
  if (clock.kind === "clear") {
    return { ...playback, stepStartedAt: null, stepEndsAt: null };
  }
  const stepEndsAt = stampAt + clock.remainingMs;
  return {
    ...playback,
    stepStartedAt: stepEndsAt - clock.durationMs,
    stepEndsAt,
    stepDurationMs: clock.durationMs,
    pausedRemainingMs: null,
  };
}

/** Slack under a step end that came from rounded beat lengths, so a step
 *  that ends on a boundary lands on it. */
const VJ_SETLIST_GRID_SLACK_MS = 2;

/** Where a timer advance lands: quantize off lands at the step end (null
 *  once it has passed); quantize on lands on the first boundary at or after
 *  the step end (less the slack) and at least quantizeMinLeadMs from now. */
export function vjSetlistAdvanceApplyAt(
  tempo: VjTempo,
  stepEndsAt: number,
  now: number,
): number | null {
  if (tempo.quantize === "off") {
    return stepEndsAt > now ? stepEndsAt : null;
  }
  const earliest = Math.max(
    stepEndsAt - VJ_SETLIST_GRID_SLACK_MS,
    now + VJ_LIMITS.quantizeMinLeadMs,
  );
  return vjNextBoundaryAt(tempo, tempo.quantize, earliest);
}

// Restore of the playback (3.8)

export interface VjSetlistRestoreInput {
  /** The restore's set list read at the restored index; null when no set list is restored. */
  read: VjSetlistRead | null;
  /** The restored setlistIndex (already range-checked). */
  setlistIndex: number | null;
  now: number;
}

/** The longest step the restore accepts: the seconds maximum in ms. */
const VJ_RESTORE_STEP_MS_MAX = 600_000;

function isSafeIntegerBetween(
  value: unknown,
  minimum: number,
  maximum: number,
): value is number {
  return (
    typeof value === "number" &&
    Number.isSafeInteger(value) &&
    value >= minimum &&
    value <= maximum
  );
}

function isVjSetlistPlaybackStatus(
  value: unknown,
): value is VjSetlistPlaybackStatus {
  return (VJ_SETLIST_PLAYBACK_STATUSES as readonly unknown[]).includes(value);
}

/** The playback a restore adopts from the sent value and the restore's read. */
export function restoredVjSetlistPlayback(
  value: unknown,
  input: VjSetlistRestoreInput,
): VjSetlistPlayback {
  const read = input.read;
  if (read === null) {
    return createVjSetlistPlayback(false);
  }
  const record =
    typeof value === "object" && value !== null && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {};
  const status = isVjSetlistPlaybackStatus(record.status)
    ? record.status
    : "manual";
  const base: VjSetlistPlayback = {
    ...createVjSetlistPlayback(read.isLooping),
    status,
    itemId: input.setlistIndex === null ? null : (read.step?.itemId ?? null),
    isFlashConfirmed: false,
  };
  const manualPlayback: VjSetlistPlayback = { ...base, status: "manual" };
  if (status === "playing") {
    const { stepStartedAt, stepEndsAt, stepDurationMs } = record;
    if (
      isSafeIntegerBetween(stepStartedAt, -Infinity, Infinity) &&
      isSafeIntegerBetween(stepEndsAt, -Infinity, Infinity) &&
      isSafeIntegerBetween(stepDurationMs, 1, VJ_RESTORE_STEP_MS_MAX) &&
      stepEndsAt - stepStartedAt === stepDurationMs &&
      stepEndsAt <= input.now + VJ_RESTORE_STEP_MS_MAX
    ) {
      return { ...base, stepStartedAt, stepEndsAt, stepDurationMs };
    }
    return manualPlayback;
  }
  if (status === "paused") {
    const { stepDurationMs, pausedRemainingMs } = record;
    if (
      isSafeIntegerBetween(stepDurationMs, 0, VJ_RESTORE_STEP_MS_MAX) &&
      isSafeIntegerBetween(pausedRemainingMs, 0, stepDurationMs)
    ) {
      return { ...base, stepDurationMs, pausedRemainingMs };
    }
    return manualPlayback;
  }
  return {
    ...base,
    stepDurationMs: isSafeIntegerBetween(
      record.stepDurationMs,
      1,
      VJ_RESTORE_STEP_MS_MAX,
    )
      ? record.stepDurationMs
      : null,
  };
}
