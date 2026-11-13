// The demo VJ stage: contract 7 (and v1 6.4 to 6.10) as a pure reducer, so
// two demo tabs get the same frames, acks and codes the live gateway sends.
// The client frames live in vjDemoStageFrames.ts; this file keeps the stage
// shape, the timers (the sequence step timer included), library changes and
// the offline prune.

import {
  VJ_LIMITS,
  createVjStageState,
  vjSetlistTimerReadPosition,
  vjSetlistTimerTransition,
  type VjLibraryChange,
  type VjSetlistFollowRead,
  type VjStageCause,
  type VjStageState,
} from "../../../shared/contracts/vj";
import {
  readVjDemoSetlistFollows,
  vjDemoLibraryChangeState,
} from "./vjDemoLibraryEffects";
import { showVjDemoSetlistStep } from "./vjDemoSceneCommands";
import {
  leadOf,
  pruneOfflineVjDemoScreens,
  reduceAttach,
  reduceDetach,
  screensUpdateTo,
  silent,
  withLeadChange,
  type VjDemoStage,
  type VjDemoStageContext,
  type VjDemoStageResult,
} from "./vjDemoScreens";
import {
  landVjDemoChange,
  reduceFrame,
  serverVjDemoChange,
} from "./vjDemoStageFrames";
import { frameTo } from "./vjDemoStageInput";

export type {
  VjDemoOutgoing,
  VjDemoScreenEntry,
  VjDemoStage,
  VjDemoStageContext,
  VjDemoStageResult,
} from "./vjDemoScreens";

export type VjDemoStageEvent =
  | { kind: "attach"; tabId: string; payload: unknown }
  | { kind: "detach"; tabId: string }
  | { kind: "frame"; tabId: string; name: string; payload: unknown }
  | { kind: "strobeTimeout" }
  | { kind: "overlayTimeout" }
  | { kind: "countdownEnd" }
  | { kind: "setlistTimer" }
  | { kind: "library"; change: VjLibraryChange }
  | { kind: "pruneOffline" };

export function createVjDemoStage(
  stageEpoch: string,
  now: number,
): VjDemoStage {
  return {
    state: createVjStageState(stageEpoch, now),
    screens: [],
    attached: {},
    clientSequences: [],
    connectionCounter: 0,
    highestScreenNumber: 0,
    pendingApplyAt: null,
    lastMicAdoptionAt: null,
    setlistItemIds: null,
  };
}

type VjDemoTimerKind = "strobeTimeout" | "overlayTimeout" | "countdownEnd";

/** The cause each timer's frame carries (contract 7.14). */
const VJ_DEMO_TIMER_CAUSES: Readonly<Record<VjDemoTimerKind, VjStageCause>> = {
  strobeTimeout: "strobe_timeout",
  overlayTimeout: "overlay_timeout",
  countdownEnd: "countdown_end",
};

/** The state a fired timer leaves, or null when its field already changed:
 *  the strobe off with no stamp, the overlay hidden with no hideAt, the
 *  countdown hidden with its target and label kept. Mirrors
 *  vjTimerFireState of queerpulse-backend/src/vj/stage/vj-stage-timers.ts. */
function vjDemoTimerFireState(
  kind: VjDemoTimerKind,
  state: VjStageState,
): VjStageState | null {
  if (kind === "strobeTimeout") {
    if (!state.effects.isStrobing) return null;
    return {
      ...state,
      effects: { ...state.effects, isStrobing: false, strobeStartedAt: null },
    };
  }
  if (kind === "overlayTimeout") {
    if (!state.overlay.isVisible || state.overlay.hideAt === null) return null;
    return {
      ...state,
      overlay: { ...state.overlay, isVisible: false, hideAt: null },
    };
  }
  if (!state.countdown.isVisible) return null;
  return { ...state, countdown: { ...state.countdown, isVisible: false } };
}

/** A fired timer lands like any server change: no grid time of its own, the
 *  pending applyAt when one is ahead. */
function reduceTimer(
  stage: VjDemoStage,
  kind: VjDemoTimerKind,
  now: number,
): VjDemoStageResult {
  const fired = vjDemoTimerFireState(kind, stage.state);
  if (fired === null) return silent(stage);
  const landing = landVjDemoChange(
    stage,
    serverVjDemoChange(fired),
    VJ_DEMO_TIMER_CAUSES[kind],
    null,
    now,
  );
  return { stage: landing.stage, ack: null, outgoing: landing.outgoing };
}

/** Sequences contract 5.7, the step timer's fire: read the next step of the
 *  state that fired, then land its transition with cause `setlist` at the
 *  step end it fired for. */
function landSetlistTimer(
  stage: VjDemoStage,
  context: VjDemoStageContext,
): VjDemoStageResult {
  const fired = stage.state;
  const position = vjSetlistTimerReadPosition(fired);
  if (position === null || fired.activeSetlistId === null) {
    return silent(stage);
  }
  const read = context.library.readSetlist(fired.activeSetlistId, position);
  const transition = vjSetlistTimerTransition(fired, read);
  if (transition === null) return silent(stage);
  const shown = showVjDemoSetlistStep(transition.nextState, transition.show);
  const landing = landVjDemoChange(
    stage,
    {
      next: shown.next,
      stamps: shown.stamps,
      isLookSwitch: shown.isLookSwitch,
      isImmediate: false,
      setlistClock: transition.clock,
      scheduledAt: fired.setlistPlayback.stepEndsAt,
    },
    "setlist",
    null,
    context.now,
    [read],
  );
  return { stage: landing.stage, ack: null, outgoing: landing.outgoing };
}

/** The step timer's fire, never throwing out of the timer callback. The
 *  backend re-reads at once when a newer state moved the index, the status,
 *  the step end, Loop or the held item ids while its read was out; the demo
 *  reads the library synchronously inside this one reduction, so the read
 *  always answers the state it was made for and that check has nothing to
 *  catch. A read or landing that throws lands nothing and asks the timer
 *  to try again after setlistTimerRetryMs (nothing logged, the show holds
 *  its step); the retry serves the same target, so a newer target replaces
 *  it. */
function reduceSetlistTimer(
  stage: VjDemoStage,
  context: VjDemoStageContext,
): VjDemoStageResult {
  try {
    return landSetlistTimer(stage, context);
  } catch {
    return {
      ...silent(stage),
      setlistTimerRetryAt: context.now + VJ_LIMITS.setlistTimerRetryMs,
    };
  }
}

/** Sequences contract 5.4 after a library follow: the follow read of the
 *  active set list gives its item ids; a set list the change left inactive
 *  gives null; no read for it keeps the memory. */
function withFollowedSetlistItemIds(
  stage: VjDemoStage,
  setlistReads: ReadonlyMap<string, VjSetlistFollowRead | null>,
): VjDemoStage {
  const activeSetlistId = stage.state.activeSetlistId;
  if (activeSetlistId === null) return { ...stage, setlistItemIds: null };
  const read = setlistReads.get(activeSetlistId.toLowerCase());
  if (read === undefined || read === null) return stage;
  return { ...stage, setlistItemIds: [...read.itemIds] };
}

/** Contract 7.10 and sequences 5.9: relay to every attached tab, then land
 *  what the change leaves the stage in, cause `library`. The active set
 *  list follows its items with the item ids the stage held before the
 *  change, then keeps the follow read's item ids (an unchanged state
 *  included, so an append after the current step is remembered too). */
function reduceLibrary(
  stage: VjDemoStage,
  change: VjLibraryChange,
  context: VjDemoStageContext,
): VjDemoStageResult {
  const relay = frameTo("library:changed", change);
  const setlistReads = readVjDemoSetlistFollows(
    stage.state,
    change,
    context.library,
  );
  const proposed = vjDemoLibraryChangeState(
    stage.state,
    change,
    setlistReads,
    stage.setlistItemIds,
    context.now,
  );
  if (proposed === null) {
    return {
      stage: withFollowedSetlistItemIds(stage, setlistReads),
      ack: null,
      outgoing: [relay],
    };
  }
  const landing = landVjDemoChange(
    stage,
    serverVjDemoChange(proposed),
    "library",
    null,
    context.now,
  );
  return {
    stage: withFollowedSetlistItemIds(landing.stage, setlistReads),
    ack: null,
    outgoing: [relay, ...landing.outgoing],
  };
}

function reducePruneOffline(
  stage: VjDemoStage,
  now: number,
): VjDemoStageResult {
  const screens = pruneOfflineVjDemoScreens(stage.screens, now);
  if (screens === stage.screens) return silent(stage);
  const next: VjDemoStage = { ...stage, screens };
  return {
    stage: next,
    ack: null,
    outgoing: [screensUpdateTo(next, { role: "remote" })],
  };
}

function reduceEvent(
  stage: VjDemoStage,
  event: VjDemoStageEvent,
  context: VjDemoStageContext,
): VjDemoStageResult {
  switch (event.kind) {
    case "attach":
      return reduceAttach(stage, event.tabId, event.payload, context);
    case "detach":
      return reduceDetach(stage, event.tabId, context.now);
    case "frame":
      return reduceFrame(stage, event, context);
    case "strobeTimeout":
    case "overlayTimeout":
    case "countdownEnd":
      return reduceTimer(stage, event.kind, context.now);
    case "setlistTimer":
      return reduceSetlistTimer(stage, context);
    case "library":
      return reduceLibrary(stage, event.change, context);
    case "pruneOffline":
      return reducePruneOffline(stage, context.now);
  }
}

/** Applies one event; `ack` is null when the frame takes no acknowledgement.
 *  Every ack carries `serverNow` = `context.now`. */
export function reduceVjDemoStage(
  stage: VjDemoStage,
  event: VjDemoStageEvent,
  context: VjDemoStageContext,
): VjDemoStageResult {
  return withLeadChange(
    reduceEvent(stage, event, context),
    leadOf(stage.screens),
  );
}
