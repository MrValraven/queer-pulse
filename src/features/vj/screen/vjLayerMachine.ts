/**
 * The projector's two stacked source layers as a pure state machine. A new
 * source loads hidden in the free layer while the current one keeps playing at
 * full opacity; the switch starts only once the new source has a frame, so the
 * screen never shows black or a spinner between clips. A prepared source (the
 * queued frame's next clip, contract 7.4) loads and primes in the free layer
 * before its target arrives, so the change starts on the frame its target lands.
 */
import type {
  VjFitMode,
  VjGeneratorId,
  VjLoopMode,
  VjMediaKind,
  VjSpeed,
  VjTransitionId,
} from "../../../shared/contracts/vj";
import type { VjResolvedTransition } from "../engine/vjEngineLook";

export type VjLayerName = "a" | "b";

export interface VjRenderableClip {
  clipId: string;
  mediaKind: VjMediaKind;
  fitMode: VjFitMode;
  width: number;
  height: number;
  sourceUrl: string;
  /** Null when the clip's length is unknown. */
  durationMs: number | null;
  loopInMs: number | null;
  loopOutMs: number | null;
  loopMode: VjLoopMode;
  defaultSpeed: VjSpeed;
}

/** A generator the renderer draws itself: ready at once, holding no object URL. */
export interface VjRenderableGenerator {
  /** `vjGeneratorSourceKey(generatorId, generatorVariant)`. */
  clipId: string;
  generatorId: VjGeneratorId;
  generatorVariant: string | null;
  mediaKind: "generator";
  sourceUrl: "";
}

export type VjRenderableSource = VjRenderableClip | VjRenderableGenerator;

/** The layer key of a generator: `generator:<id>:<variant>`, with an empty variant for none. */
export function vjGeneratorSourceKey(
  generatorId: VjGeneratorId,
  variant: string | null,
): string {
  return `generator:${generatorId}:${variant ?? ""}`;
}

export interface VjLayerSlot {
  clip: VjRenderableSource | null;
  /**
   * "primed": a prepared source holds its first frame hidden under the front
   * until a target names it.
   * "catchingUp": a new target arrived while this layer was fading in, so it
   * finishes to full opacity with a short ease from where it is while the old
   * front stays opaque underneath.
   */
  phase:
    | "empty"
    | "loading"
    | "primed"
    | "fadingIn"
    | "catchingUp"
    | "shown"
    | "leaving";
}

/** The source tapped during a catch-up, loaded into the freed layer once the catch-up ends. */
export interface VjPendingTarget {
  clip: VjRenderableSource;
  transition: VjResolvedTransition;
}

export interface VjLayerMachineState {
  slots: Record<VjLayerName, VjLayerSlot>;
  /** The fully shown layer, null while black. */
  front: VjLayerName | null;
  incoming: {
    layer: VjLayerName;
    mode: VjTransitionId;
    durationMs: number;
    /**
     * False for a prepared source no target has named yet: it loads and
     * primes but never shows, and a newer prepare or target replaces it.
     */
    isArmed: boolean;
  } | null;
  /** Waits for the running catch-up to end; null otherwise. */
  pendingTarget: VjPendingTarget | null;
  /** liveClipId null: the black curtain is up. */
  isBlackRequested: boolean;
  curtainFadeMs: number;
}

/**
 * "prepare" with a null source cancels the pre-roll: an unarmed prepared
 * source is dropped. A generator's "firstFrame" comes from the renderer right
 * after it binds the generator.
 */
export type VjLayerEvent =
  | {
      type: "target";
      clip: VjRenderableSource | null;
      transition: VjResolvedTransition;
    }
  | { type: "prepare"; source: VjRenderableSource | null }
  | { type: "firstFrame"; layer: VjLayerName; clipId: string }
  | { type: "failed"; layer: VjLayerName; clipId: string }
  | { type: "fadeEnded"; layer: VjLayerName; clipId: string }
  | { type: "catchUpEnded"; layer: VjLayerName; clipId: string };

export const VJ_LAYER_NAMES: readonly VjLayerName[] = ["a", "b"];

const EMPTY_SLOT: VjLayerSlot = { clip: null, phase: "empty" };

/** An unarmed incoming has no transition yet; the target that arms it brings one. */
const UNARMED_TRANSITION: VjResolvedTransition = {
  mode: "cut",
  durationMs: 0,
};

export const INITIAL_VJ_LAYERS: VjLayerMachineState = {
  slots: { a: EMPTY_SLOT, b: EMPTY_SLOT },
  front: null,
  incoming: null,
  pendingTarget: null,
  isBlackRequested: true,
  curtainFadeMs: 0,
};

function otherLayer(layer: VjLayerName): VjLayerName {
  return layer === "a" ? "b" : "a";
}

function nonNegativeMs(milliseconds: number): number {
  return Number.isFinite(milliseconds) && milliseconds > 0 ? milliseconds : 0;
}

/** How long a change takes on screen: a cut is instant. */
function visibleFadeMs(transition: {
  mode: VjTransitionId;
  durationMs: number;
}): number {
  return transition.mode === "cut" ? 0 : nonNegativeMs(transition.durationMs);
}

function withSlot(
  state: VjLayerMachineState,
  layer: VjLayerName,
  slot: VjLayerSlot,
): VjLayerMachineState {
  return { ...state, slots: { ...state.slots, [layer]: slot } };
}

function incomingPhase(
  state: VjLayerMachineState,
): VjLayerSlot["phase"] | null {
  return state.incoming ? state.slots[state.incoming.layer].phase : null;
}

/** The incoming layer becomes the shown front; the old front leaves. */
function promoteIncoming(state: VjLayerMachineState): VjLayerMachineState {
  const incoming = state.incoming;
  if (!incoming) return state;
  const incomingClip = state.slots[incoming.layer].clip;
  if (!incomingClip) return { ...state, incoming: null };
  const slots: Record<VjLayerName, VjLayerSlot> = {
    ...state.slots,
    [incoming.layer]: { clip: incomingClip, phase: "shown" },
  };
  if (state.front !== null && state.front !== incoming.layer) {
    const leavingClip = state.slots[state.front].clip;
    slots[state.front] = leavingClip
      ? { clip: leavingClip, phase: "leaving" }
      : EMPTY_SLOT;
  }
  return {
    ...state,
    slots,
    front: incoming.layer,
    incoming: null,
    pendingTarget: null,
  };
}

/** A fade or catch-up in progress ends at once; a target waiting on it is dropped. */
function finishRunningFade(state: VjLayerMachineState): VjLayerMachineState {
  const phase = incomingPhase(state);
  return phase === "fadingIn" || phase === "catchingUp"
    ? promoteIncoming(state)
    : state;
}

/** The fading layer finishes to full opacity first; the new source waits for it. */
function startCatchUp(
  state: VjLayerMachineState,
  target: VjPendingTarget,
): VjLayerMachineState {
  const incoming = state.incoming;
  if (!incoming) return state;
  const slot = state.slots[incoming.layer];
  return {
    ...withSlot(state, incoming.layer, {
      clip: slot.clip,
      phase: "catchingUp",
    }),
    pendingTarget: target,
  };
}

function reduceTargetDuringCatchUp(
  state: VjLayerMachineState,
  clip: VjRenderableSource,
  transition: VjResolvedTransition,
): VjLayerMachineState {
  const incoming = state.incoming;
  if (!incoming) return state;
  if (state.slots[incoming.layer].clip?.clipId === clip.clipId) {
    return state.pendingTarget ? { ...state, pendingTarget: null } : state;
  }
  if (visibleFadeMs(transition) === 0) {
    return reduceClipTarget(finishRunningFade(state), clip, transition);
  }
  if (state.pendingTarget?.clip.clipId === clip.clipId) return state;
  return { ...state, pendingTarget: { clip, transition } };
}

function reduceCatchUpEnded(
  state: VjLayerMachineState,
  layer: VjLayerName,
  clipId: string,
): VjLayerMachineState {
  if (!isIncomingEvent(state, layer, clipId, "catchingUp")) return state;
  const pending = state.pendingTarget;
  const promoted = promoteIncoming(state);
  return pending
    ? reduceClipTarget(promoted, pending.clip, pending.transition)
    : promoted;
}

function dropIncoming(state: VjLayerMachineState): VjLayerMachineState {
  if (!state.incoming) return state;
  return {
    ...withSlot(state, state.incoming.layer, EMPTY_SLOT),
    incoming: null,
  };
}

/** A target still loading is dropped; a prepared source keeps priming. */
function dropArmedLoadingIncoming(
  state: VjLayerMachineState,
): VjLayerMachineState {
  return state.incoming?.isArmed && incomingPhase(state) === "loading"
    ? dropIncoming(state)
    : state;
}

function dropUnarmedIncoming(state: VjLayerMachineState): VjLayerMachineState {
  return state.incoming && !state.incoming.isArmed
    ? dropIncoming(state)
    : state;
}

/** Loads a source into the free layer, replacing an unarmed incoming there. */
function loadIncoming(
  state: VjLayerMachineState,
  source: VjRenderableSource,
  transition: VjResolvedTransition,
  isArmed: boolean,
): VjLayerMachineState {
  const layer =
    state.incoming?.layer ?? (state.front ? otherLayer(state.front) : "a");
  return {
    ...withSlot(state, layer, { clip: source, phase: "loading" }),
    incoming: {
      layer,
      mode: transition.mode,
      durationMs: nonNegativeMs(transition.durationMs),
      isArmed,
    },
  };
}

/** The armed incoming has a frame: lift the curtain, cut, or start its fade. */
function startIncomingTransition(
  state: VjLayerMachineState,
): VjLayerMachineState {
  const incoming = state.incoming;
  if (!incoming) return state;
  const fadeMs = visibleFadeMs(incoming);
  if (state.isBlackRequested) {
    return {
      ...promoteIncoming(state),
      isBlackRequested: false,
      curtainFadeMs: fadeMs,
    };
  }
  if (state.front === null || fadeMs === 0) return promoteIncoming(state);
  const slot = state.slots[incoming.layer];
  return withSlot(state, incoming.layer, {
    clip: slot.clip,
    phase: "fadingIn",
  });
}

/** A target names the prepared source: it arms, and starts at once when primed. */
function armIncoming(
  state: VjLayerMachineState,
  transition: VjResolvedTransition,
): VjLayerMachineState {
  const incoming = state.incoming;
  if (!incoming) return state;
  const armed: VjLayerMachineState = {
    ...state,
    incoming: {
      layer: incoming.layer,
      mode: transition.mode,
      durationMs: nonNegativeMs(transition.durationMs),
      isArmed: true,
    },
  };
  return incomingPhase(state) === "primed"
    ? startIncomingTransition(armed)
    : armed;
}

function reduceBlackTarget(
  state: VjLayerMachineState,
  transition: VjResolvedTransition,
): VjLayerMachineState {
  const settled = dropArmedLoadingIncoming(finishRunningFade(state));
  if (settled.isBlackRequested) return settled;
  return {
    ...settled,
    isBlackRequested: true,
    curtainFadeMs: visibleFadeMs(transition),
  };
}

function reduceClipTarget(
  state: VjLayerMachineState,
  clip: VjRenderableSource,
  transition: VjResolvedTransition,
): VjLayerMachineState {
  const phase = incomingPhase(state);
  if (phase === "catchingUp") {
    return reduceTargetDuringCatchUp(state, clip, transition);
  }
  const incoming = state.incoming;
  if (incoming && state.slots[incoming.layer].clip?.clipId === clip.clipId) {
    return incoming.isArmed ? state : armIncoming(state, transition);
  }
  if (
    phase === "fadingIn" &&
    state.front !== null &&
    visibleFadeMs(transition) > 0
  ) {
    return startCatchUp(state, { clip, transition });
  }
  const settled = finishRunningFade(state);
  const frontClip = settled.front ? settled.slots[settled.front].clip : null;
  if (frontClip?.clipId === clip.clipId) {
    const withoutLoading = dropArmedLoadingIncoming(settled);
    if (!withoutLoading.isBlackRequested) return withoutLoading;
    return {
      ...withoutLoading,
      isBlackRequested: false,
      curtainFadeMs: visibleFadeMs(transition),
    };
  }
  return loadIncoming(settled, clip, transition, true);
}

/**
 * A prepared source loads hidden in the free layer. A target in flight keeps
 * the free layer, so a prepare waits behind it; a prepare naming the front
 * source drops a stale prepared one.
 */
function reducePrepare(
  state: VjLayerMachineState,
  source: VjRenderableSource | null,
): VjLayerMachineState {
  const incoming = state.incoming;
  if (incoming?.isArmed) return state;
  if (source === null) return dropUnarmedIncoming(state);
  if (incoming && state.slots[incoming.layer].clip?.clipId === source.clipId) {
    return state;
  }
  const frontClip = state.front ? state.slots[state.front].clip : null;
  if (frontClip?.clipId === source.clipId) return dropUnarmedIncoming(state);
  return loadIncoming(state, source, UNARMED_TRANSITION, false);
}

/** True when the event names the incoming layer, holding that source, in that phase. */
function isIncomingEvent(
  state: VjLayerMachineState,
  layer: VjLayerName,
  clipId: string,
  phase: VjLayerSlot["phase"],
): boolean {
  const slot = state.slots[layer];
  return (
    state.incoming?.layer === layer &&
    slot.phase === phase &&
    slot.clip?.clipId === clipId
  );
}

function reduceFirstFrame(
  state: VjLayerMachineState,
  layer: VjLayerName,
  clipId: string,
): VjLayerMachineState {
  const incoming = state.incoming;
  if (!incoming || !isIncomingEvent(state, layer, clipId, "loading")) {
    return state;
  }
  if (incoming.isArmed) return startIncomingTransition(state);
  const slot = state.slots[layer];
  return withSlot(state, layer, { clip: slot.clip, phase: "primed" });
}

function reduceFailed(
  state: VjLayerMachineState,
  layer: VjLayerName,
  clipId: string,
): VjLayerMachineState {
  return isIncomingEvent(state, layer, clipId, "loading") ||
    isIncomingEvent(state, layer, clipId, "primed")
    ? dropIncoming(state)
    : state;
}

export function reduceVjLayers(
  state: VjLayerMachineState,
  event: VjLayerEvent,
): VjLayerMachineState {
  switch (event.type) {
    case "target":
      return event.clip === null
        ? reduceBlackTarget(state, event.transition)
        : reduceClipTarget(state, event.clip, event.transition);
    case "prepare":
      return reducePrepare(state, event.source);
    case "firstFrame":
      return reduceFirstFrame(state, event.layer, event.clipId);
    case "fadeEnded":
      return isIncomingEvent(state, event.layer, event.clipId, "fadingIn")
        ? promoteIncoming(state)
        : state;
    case "catchUpEnded":
      return reduceCatchUpEnded(state, event.layer, event.clipId);
    case "failed":
      return reduceFailed(state, event.layer, event.clipId);
  }
}

/** A fading or catching-up layer is on screen and rising toward full opacity. */
function isRising(state: VjLayerMachineState): boolean {
  const phase = incomingPhase(state);
  return phase === "fadingIn" || phase === "catchingUp";
}

/** The front is always opaque; an incoming layer turns opaque when its fade starts (CSS animates it). */
export function vjLayerOpacity(
  state: VjLayerMachineState,
  layer: VjLayerName,
): 0 | 1 {
  if (state.front === layer) return 1;
  return state.incoming?.layer === layer && isRising(state) ? 1 : 0;
}

/** The incoming layer stacks above the front once it fades in; a loading or primed layer waits below. */
export function vjLayerZ(
  state: VjLayerMachineState,
  layer: VjLayerName,
): 0 | 1 {
  if (state.incoming && isRising(state)) {
    return state.incoming.layer === layer ? 1 : 0;
  }
  return state.front === layer ? 1 : 0;
}

/** Object URLs the slots and the pending target hold; generators hold none. */
function heldSourceUrls(state: VjLayerMachineState): Set<string> {
  const held = new Set<string>();
  for (const layer of VJ_LAYER_NAMES) {
    const slot = state.slots[layer];
    if (slot.clip?.sourceUrl && slot.phase !== "leaving") {
      held.add(slot.clip.sourceUrl);
    }
  }
  const pendingSourceUrl = state.pendingTarget?.clip.sourceUrl;
  if (pendingSourceUrl) held.add(pendingSourceUrl);
  return held;
}

/**
 * True for a transitionend of the element's own opacity. A missing
 * propertyName (an event built without one) counts as opacity.
 */
export function isOwnOpacityTransition(event: {
  target: EventTarget | null;
  currentTarget: EventTarget | null;
  propertyName?: string;
}): boolean {
  if (event.target !== event.currentTarget) return false;
  return !event.propertyName || event.propertyName === "opacity";
}

/** Source URLs no slot holds any more, for the caller to revoke. */
export function releasedVjSourceUrls(
  previous: VjLayerMachineState,
  next: VjLayerMachineState,
): string[] {
  const nextHeld = heldSourceUrls(next);
  return [...heldSourceUrls(previous)].filter(
    (sourceUrl) => !nextHeld.has(sourceUrl),
  );
}
