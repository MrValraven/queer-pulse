/**
 * The projector's two stacked clip layers as a pure state machine. A new clip
 * loads hidden in the free layer while the current one keeps playing at full
 * opacity; the switch starts only once the new clip has a frame, so the screen
 * never shows black or a spinner between clips.
 */
import type {
  VjFitMode,
  VjMediaKind,
  VjTransition,
  VjTransitionMode,
} from "../../../shared/contracts/vj";

export type VjLayerName = "a" | "b";

export interface VjRenderableClip {
  clipId: string;
  mediaKind: VjMediaKind;
  fitMode: VjFitMode;
  width: number;
  height: number;
  sourceUrl: string;
}

export interface VjLayerSlot {
  clip: VjRenderableClip | null;
  /**
   * "catchingUp": a new target arrived while this layer was fading in, so it
   * finishes to full opacity with a short ease from where it is while the old
   * front stays opaque underneath.
   */
  phase: "empty" | "loading" | "fadingIn" | "catchingUp" | "shown" | "leaving";
}

/** The clip tapped during a catch-up, loaded into the freed layer once the catch-up ends. */
export interface VjPendingTarget {
  clip: VjRenderableClip;
  transition: VjTransition;
}

export interface VjLayerMachineState {
  slots: Record<VjLayerName, VjLayerSlot>;
  /** The fully shown layer, null while black. */
  front: VjLayerName | null;
  incoming: {
    layer: VjLayerName;
    mode: VjTransitionMode;
    fadeMs: number;
  } | null;
  /** Waits for the running catch-up to end; null otherwise. */
  pendingTarget: VjPendingTarget | null;
  /** liveClipId null: the black curtain is up. */
  isBlackRequested: boolean;
  curtainFadeMs: number;
}

export type VjLayerEvent =
  | { type: "target"; clip: VjRenderableClip | null; transition: VjTransition }
  | { type: "firstFrame"; layer: VjLayerName; clipId: string }
  | { type: "failed"; layer: VjLayerName; clipId: string }
  | { type: "fadeEnded"; layer: VjLayerName; clipId: string }
  | { type: "catchUpEnded"; layer: VjLayerName; clipId: string };

export const VJ_LAYER_NAMES: readonly VjLayerName[] = ["a", "b"];

const EMPTY_SLOT: VjLayerSlot = { clip: null, phase: "empty" };

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
function visibleFadeMs(mode: VjTransitionMode, fadeMs: number): number {
  return mode === "cut" ? 0 : nonNegativeMs(fadeMs);
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

/** The fading layer finishes to full opacity first; the new clip waits for it. */
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
  clip: VjRenderableClip,
  transition: VjTransition,
): VjLayerMachineState {
  const incoming = state.incoming;
  if (!incoming) return state;
  if (state.slots[incoming.layer].clip?.clipId === clip.clipId) {
    return state.pendingTarget ? { ...state, pendingTarget: null } : state;
  }
  if (visibleFadeMs(transition.mode, transition.fadeMs) === 0) {
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

function dropLoadingIncoming(state: VjLayerMachineState): VjLayerMachineState {
  if (!state.incoming || incomingPhase(state) !== "loading") return state;
  return {
    ...withSlot(state, state.incoming.layer, EMPTY_SLOT),
    incoming: null,
  };
}

function reduceBlackTarget(
  state: VjLayerMachineState,
  transition: VjTransition,
): VjLayerMachineState {
  const settled = dropLoadingIncoming(finishRunningFade(state));
  if (settled.isBlackRequested) return settled;
  return {
    ...settled,
    isBlackRequested: true,
    curtainFadeMs: visibleFadeMs(transition.mode, transition.fadeMs),
  };
}

function reduceClipTarget(
  state: VjLayerMachineState,
  clip: VjRenderableClip,
  transition: VjTransition,
): VjLayerMachineState {
  const phase = incomingPhase(state);
  if (phase === "catchingUp") {
    return reduceTargetDuringCatchUp(state, clip, transition);
  }
  const incomingClipId = state.incoming
    ? state.slots[state.incoming.layer].clip?.clipId
    : undefined;
  if (incomingClipId === clip.clipId) return state;
  if (
    phase === "fadingIn" &&
    state.front !== null &&
    visibleFadeMs(transition.mode, transition.fadeMs) > 0
  ) {
    return startCatchUp(state, { clip, transition });
  }
  const settled = finishRunningFade(state);
  const frontClip = settled.front ? settled.slots[settled.front].clip : null;
  if (frontClip?.clipId === clip.clipId) {
    const withoutLoading = dropLoadingIncoming(settled);
    if (!withoutLoading.isBlackRequested) return withoutLoading;
    return {
      ...withoutLoading,
      isBlackRequested: false,
      curtainFadeMs: visibleFadeMs(transition.mode, transition.fadeMs),
    };
  }
  const layer =
    settled.incoming?.layer ??
    (settled.front ? otherLayer(settled.front) : "a");
  return {
    ...withSlot(settled, layer, { clip, phase: "loading" }),
    incoming: {
      layer,
      mode: transition.mode,
      fadeMs: nonNegativeMs(transition.fadeMs),
    },
  };
}

/** True when the event names the incoming layer, holding that clip, in that phase. */
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
  if (state.isBlackRequested) {
    return {
      ...promoteIncoming(state),
      isBlackRequested: false,
      curtainFadeMs: visibleFadeMs(incoming.mode, incoming.fadeMs),
    };
  }
  if (
    state.front === null ||
    visibleFadeMs(incoming.mode, incoming.fadeMs) === 0
  ) {
    return promoteIncoming(state);
  }
  const slot = state.slots[layer];
  return withSlot(state, layer, { clip: slot.clip, phase: "fadingIn" });
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
    case "firstFrame":
      return reduceFirstFrame(state, event.layer, event.clipId);
    case "fadeEnded":
      return isIncomingEvent(state, event.layer, event.clipId, "fadingIn")
        ? promoteIncoming(state)
        : state;
    case "catchUpEnded":
      return reduceCatchUpEnded(state, event.layer, event.clipId);
    case "failed":
      return isIncomingEvent(state, event.layer, event.clipId, "loading")
        ? dropLoadingIncoming(state)
        : state;
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

/** The incoming layer stacks above the front once it fades in; a loading layer waits below. */
export function vjLayerZ(
  state: VjLayerMachineState,
  layer: VjLayerName,
): 0 | 1 {
  if (state.incoming && isRising(state)) {
    return state.incoming.layer === layer ? 1 : 0;
  }
  return state.front === layer ? 1 : 0;
}

function heldSourceUrls(state: VjLayerMachineState): Set<string> {
  const held = new Set<string>();
  for (const layer of VJ_LAYER_NAMES) {
    const slot = state.slots[layer];
    if (slot.clip && slot.phase !== "leaving") held.add(slot.clip.sourceUrl);
  }
  if (state.pendingTarget) held.add(state.pendingTarget.clip.sourceUrl);
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
