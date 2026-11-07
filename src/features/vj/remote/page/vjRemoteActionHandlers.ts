/**
 * One handler per remote action kind (plan R26). Touch, the keyboard and a
 * MIDI controller all land here through `useVjRemoteActions`, which hands
 * each handler the context of its newest render, so the three inputs share
 * optimism, rollback, haptics, cue mode and the flash consent gate.
 *
 * The optimistic `apply` functions come from `useVjOptimisticValue`, which
 * already vibrates "refused" and names the reason on a refusal; the handlers
 * add no second vibration for it.
 */
import {
  roundVjAmount,
  VJ_EFFECT_CATALOG,
  VJ_EFFECT_IDS,
  VJ_LIMITS,
  VJ_TRANSITION_BEAT_COUNTS,
  VJ_TRANSITION_CATALOG,
  vjEffectSettingOf,
  type VjClipDTO,
  type VjEffectId,
  type VjEffectSettingPatch,
  type VjGeneratorId,
  type VjQuantize,
  type VjSceneDTO,
  type VjSceneLook,
  type VjSetlistDTO,
  type VjStageState,
  type VjTransitionLength,
  type VjTransitionLengthUnit,
} from "../../../../shared/contracts/vj";
import type { VjCommandOutcome } from "../../live/useVjStage";
import { registerVjTap } from "../../live/vjTapTempo";
import type { VjCueMode } from "../hooks/useVjCueMode";
import type { VjActionPhase, VjRemoteAction } from "../input/vjRemoteAction";
import type { VjPadId } from "../rules/vjDockPads";
import { vibrateVj } from "../rules/vjHaptics";
import {
  vjPadPressDown,
  vjPadPressUp,
  type VjPadPress,
} from "../rules/vjPadPress";
import type { VjTrailingSender } from "../rules/vjThrottle";
import type { VjRun } from "../useVjCommandRunner";

/** Shows a value at once and keeps it until the ack's revision lands (R5). */
export type VjOptimisticApply = (
  key: string,
  value: boolean,
  send: () => Promise<VjCommandOutcome>,
) => Promise<VjCommandOutcome>;

/** A keyboard or MIDI pad press waiting for its release. */
export interface VjHeldPad {
  padId: VjPadId;
  press: VjPadPress;
}

export interface VjRemoteActionContext {
  run: VjRun;
  /** `stage.latestState`: every control reads the newest received state. */
  state: VjStageState | null;
  serverNow: () => number;
  /** The grid's shown order, so a slot index survives a pack switch. */
  visibleClips: readonly VjClipDTO[];
  dockPads: readonly VjEffectId[];
  cue: VjCueMode;
  isBlocked: boolean;
  hasFlashConsent: boolean;
  /** The pad whose flash consent is being asked right now. */
  consentPadId: VjPadId | null;
  applyTile: VjOptimisticApply;
  applyPad: VjOptimisticApply;
  padValueOf: (key: string, serverValue: boolean) => boolean;
  /** The quantize shown at once, so a second quick press cycles on from it. */
  applyQuantize: (
    value: VjQuantize,
    send: () => Promise<VjCommandOutcome>,
  ) => Promise<VjCommandOutcome>;
  quantizeValueOf: (serverValue: VjQuantize) => VjQuantize;
  /** The library's scenes and set lists, so a set list step can read the look it recalls. */
  scenes: readonly VjSceneDTO[];
  setlists: readonly VjSetlistDTO[];
  /** Held keyboard and MIDI pad presses, keyed by the input holding them. */
  heldPads: Map<string, VjHeldPad>;
  tapTimes: { current: number[] };
  crossfader: VjTrailingSender<number>;
  transitionLength: VjTrailingSender<VjTransitionLength>;
  requestPadConsent: (padId: VjPadId, anchor: HTMLElement | null) => void;
  /** Asks the flash warning for a scene's look, then runs `onConsented`. */
  requestSceneConsent: (
    scene: Pick<VjSceneDTO, "name" | "look">,
    anchor: HTMLElement | null,
    onConsented: () => void,
  ) => void;
  /** Names the reason of a refused send that no optimistic value covers. */
  reportOutcome: (outcome: VjCommandOutcome) => void;
  onResetDone: () => void;
  onOpenSheet: (sheet: "shortcuts") => void;
}

export const VJ_BLACKOUT_KEY = "blackout";
/** A tap count sends its tempo from this tap on. */
export const VJ_TAP_SEND_FROM = 4;
/** The ms transition length moves on this step. */
export const VJ_TRANSITION_MS_STEP = 100;

const VJ_QUANTIZE_CYCLE: Readonly<Record<VjQuantize, VjQuantize>> = {
  off: "beat",
  beat: "bar",
  bar: "off",
};

export function vjTileKeyOf(clipId: string): string {
  return `clip:${clipId}`;
}

export function vjGeneratorKeyOf(generatorId: VjGeneratorId): string {
  return `generator:${generatorId}`;
}

export function vjPadKeyOf(padId: VjPadId): string {
  return padId === "strobe" ? "strobe" : `effect:${padId}`;
}

/** Whether the pad is on in the newest received state. */
export function vjServerPadIsOn(
  state: VjStageState | null,
  padId: VjPadId,
): boolean {
  if (state === null) return false;
  if (padId === "strobe") return state.effects.isStrobing;
  return vjEffectSettingOf(state.effects, padId).isOn;
}

/** The strobe and every catalog effect marked flash-capable. */
export function isVjPadFlashCapable(padId: VjPadId): boolean {
  return padId === "strobe" || VJ_EFFECT_CATALOG[padId].isFlashCapable;
}

/**
 * Whether recalling the look can flash: an effect it turns on is
 * flash-capable, or its transition is (the same catalog flags the pads and
 * the transition row read).
 */
export function vjSceneLookFlashes(look: VjSceneLook): boolean {
  if (VJ_TRANSITION_CATALOG[look.transition.mode].isFlashCapable) return true;
  return VJ_EFFECT_IDS.some(
    (effectId) =>
      look.effects.settings[effectId]?.isOn === true &&
      VJ_EFFECT_CATALOG[effectId].isFlashCapable,
  );
}

/** The other effects of its exclusive group (the playhead trio). */
export function vjExclusiveSiblingsOf(effectId: VjEffectId): VjEffectId[] {
  const group = VJ_EFFECT_CATALOG[effectId].exclusiveGroup;
  if (group === null) return [];
  return VJ_EFFECT_IDS.filter(
    (otherId) =>
      otherId !== effectId &&
      VJ_EFFECT_CATALOG[otherId].exclusiveGroup === group,
  );
}

/** 0..1 onto the beat counts or onto 0..fadeMsMax on the 100 ms step. */
export function vjTransitionLengthFor(
  normalized: number,
  unit: VjTransitionLengthUnit,
): VjTransitionLength {
  const clamped = Math.min(1, Math.max(0, normalized));
  if (unit === "beats") {
    const countIndex = Math.round(
      clamped * (VJ_TRANSITION_BEAT_COUNTS.length - 1),
    );
    const beatCount =
      VJ_TRANSITION_BEAT_COUNTS[countIndex] ?? VJ_TRANSITION_BEAT_COUNTS[0];
    return { unit, value: beatCount };
  }
  const steps = Math.round(
    (clamped * VJ_LIMITS.fadeMsMax) / VJ_TRANSITION_MS_STEP,
  );
  return { unit, value: steps * VJ_TRANSITION_MS_STEP };
}

/** A sibling's rollback stays quiet: the pad that was pressed names the reason once. */
function silencedVjOutcome(outcome: VjCommandOutcome): VjCommandOutcome {
  return outcome.ok ? outcome : { ...outcome, errorKey: null };
}

function needsVjFlashConsent(
  context: VjRemoteActionContext,
  padId: VjPadId,
): boolean {
  return !context.hasFlashConsent && isVjPadFlashCapable(padId);
}

function vjPadIsOn(context: VjRemoteActionContext, padId: VjPadId): boolean {
  return context.padValueOf(
    vjPadKeyOf(padId),
    vjServerPadIsOn(context.state, padId),
  );
}

/**
 * Sends one pad on or off. Turning on a playhead effect marks the other two
 * off at once, as the server does (contract 7.6).
 */
export function sendVjPad(
  context: VjRemoteActionContext,
  padId: VjPadId,
  send: "on" | "off",
): void {
  const isOn = send === "on";
  if (padId === "strobe") {
    void context.applyPad(vjPadKeyOf(padId), isOn, () =>
      isOn
        ? context.run("setStrobe", true)
        : context.run("setStrobe", false, { isImmediate: true }),
    );
    return;
  }
  const settings: Partial<Record<VjEffectId, VjEffectSettingPatch>> = {};
  settings[padId] = { isOn };
  const outcomePromise = context.run("setEffects", { settings });
  void context.applyPad(vjPadKeyOf(padId), isOn, () => outcomePromise);
  if (!isOn) return;
  for (const siblingId of vjExclusiveSiblingsOf(padId)) {
    void context.applyPad(vjPadKeyOf(siblingId), false, () =>
      outcomePromise.then(silencedVjOutcome),
    );
  }
}

function sendVjClip(context: VjRemoteActionContext, clipId: string): void {
  vibrateVj("press");
  void context.applyTile(vjTileKeyOf(clipId), true, () =>
    context.run("goClip", clipId),
  );
}

/** Cue mode arms the clip; otherwise it goes live with a pending tile. */
export function handleGoClip(
  context: VjRemoteActionContext,
  clipId: string,
): void {
  if (context.isBlocked) return;
  if (context.cue.isCueMode) {
    context.cue.arm(clipId);
    vibrateVj("press");
    return;
  }
  sendVjClip(context, clipId);
}

/** A grid slot (keyboard, MIDI) reads the grid's shown order. */
export function handleGoClipAt(
  context: VjRemoteActionContext,
  index: number,
): void {
  const clip = context.visibleClips[index];
  if (clip === undefined) return;
  handleGoClip(context, clip.id);
}

/** Go sends the armed clip and clears it; nothing armed sends nothing. */
export function handleGo(context: VjRemoteActionContext): void {
  if (context.isBlocked) return;
  const armedClipId = context.cue.armedClipId;
  if (armedClipId === null) return;
  context.cue.clearArmed();
  sendVjClip(context, armedClipId);
}

export function handleGoGenerator(
  context: VjRemoteActionContext,
  generatorId: VjGeneratorId,
  variant: string | null,
): void {
  if (context.isBlocked) return;
  vibrateVj("press");
  void context.applyTile(vjGeneratorKeyOf(generatorId), true, () =>
    context.run("goGenerator", generatorId, variant),
  );
}

/** Touch: the pad's own press machine decided what to send. */
export function handleTouchPadSend(
  context: VjRemoteActionContext,
  padId: VjPadId,
  send: "on" | "off",
  anchor: HTMLElement | null,
): void {
  if (context.isBlocked) return;
  if (send === "on" && needsVjFlashConsent(context, padId)) {
    context.requestPadConsent(padId, anchor);
    return;
  }
  // The release of the press that is asking for consent: nothing went on.
  // Dropped on purpose for a hold too: the confirm reads "Turn on X now",
  // so confirming latches the effect on and a later tap turns it off.
  if (send === "off" && context.consentPadId === padId) return;
  sendVjPad(context, padId, send);
}

type VjPadAction = Extract<VjRemoteAction, { kind: "pad" | "padSlot" }>;

function heldPadKeyOf(action: VjPadAction): string {
  return action.kind === "padSlot"
    ? `slot:${action.slot}`
    : `pad:${action.padId}`;
}

function padIdOf(
  context: VjRemoteActionContext,
  action: VjPadAction,
): VjPadId | null {
  if (action.kind === "pad") return action.padId;
  return context.dockPads[action.slot] ?? null;
}

/** Keyboard and MIDI: the pure press machine runs here. */
export function handlePadPress(
  context: VjRemoteActionContext,
  action: VjPadAction,
): void {
  if (context.isBlocked) return;
  const padId = padIdOf(context, action);
  if (padId === null) return;
  const heldKey = heldPadKeyOf(action);
  if (context.heldPads.has(heldKey)) return;
  const wasOn = vjPadIsOn(context, padId);
  const send = vjPadPressDown(wasOn);
  if (send === "on" && needsVjFlashConsent(context, padId)) {
    // Not held: the release that follows finds no press and sends nothing.
    context.requestPadConsent(padId, null);
    return;
  }
  context.heldPads.set(heldKey, {
    padId,
    press: { wasOn, startedAt: Date.now() },
  });
  if (send === "on") sendVjPad(context, padId, "on");
}

/** A short press latches, a hold ends on release, a latched pad turns off. */
export function handlePadRelease(
  context: VjRemoteActionContext,
  action: VjPadAction,
): void {
  const heldKey = heldPadKeyOf(action);
  const heldPad = context.heldPads.get(heldKey);
  if (heldPad === undefined) return;
  context.heldPads.delete(heldKey);
  const { send, result } = vjPadPressUp(heldPad.press, Date.now(), false);
  if (result === "latched") vibrateVj("latch");
  if (send === "off" && !context.isBlocked) {
    sendVjPad(context, heldPad.padId, "off");
  }
}

export function handleBlackout(context: VjRemoteActionContext): void {
  const { state } = context;
  if (context.isBlocked || state === null) return;
  const isBlackout = !context.padValueOf(
    VJ_BLACKOUT_KEY,
    state.effects.isBlackout,
  );
  void context.applyPad(VJ_BLACKOUT_KEY, isBlackout, () =>
    context.run("setEffects", { isBlackout, isImmediate: true }),
  );
}

export function handleResetLook(context: VjRemoteActionContext): void {
  if (context.isBlocked) return;
  void context.run("resetLook", { isImmediate: true }).then((outcome) => {
    if (outcome.ok) context.onResetDone();
    else context.reportOutcome(outcome);
  });
}

/** From the fourth tap of a count, each tap sends the tempo with its synced time as the downbeat. */
export function handleTap(context: VjRemoteActionContext): void {
  if (context.isBlocked) return;
  const { tapTimes, bpm } = registerVjTap(
    context.tapTimes.current,
    performance.now(),
  );
  context.tapTimes.current = tapTimes;
  if (bpm === null || tapTimes.length < VJ_TAP_SEND_FROM) return;
  void context
    .run("setTempo", {
      bpm,
      downbeatAt: Math.round(context.serverNow()),
      source: "tap",
    })
    .then(context.reportOutcome);
}

/** The "1": this synced moment starts a bar. */
export function handleDownbeat(context: VjRemoteActionContext): void {
  if (context.isBlocked) return;
  vibrateVj("downbeat");
  void context
    .run("setTempo", { downbeatAt: Math.round(context.serverNow()) })
    .then(context.reportOutcome);
}

/** Cycles on from the shown value, so two quick presses send two steps. */
export function handleCycleQuantize(context: VjRemoteActionContext): void {
  const { state } = context;
  if (context.isBlocked || state === null) return;
  const quantize =
    VJ_QUANTIZE_CYCLE[context.quantizeValueOf(state.tempo.quantize)];
  // The optimistic apply names a refusal's reason itself.
  void context.applyQuantize(quantize, () =>
    context.run("setTempo", { quantize }),
  );
}

export function handlePrevious(context: VjRemoteActionContext): void {
  if (context.isBlocked) return;
  const previousClipId = context.state?.recentClipIds[1];
  if (previousClipId === undefined) return;
  sendVjClip(context, previousClipId);
}

/** The scene a set list step would recall; null when the step has none or the library has not loaded it. */
export function vjSetlistStepSceneOf(
  context: Pick<VjRemoteActionContext, "state" | "scenes" | "setlists">,
  direction: "next" | "previous",
): VjSceneDTO | null {
  const { state } = context;
  if (state === null || state.activeSetlistId === null) return null;
  const setlist = context.setlists.find(
    (candidate) => candidate.id === state.activeSetlistId,
  );
  if (setlist === undefined) return null;
  const targetIndex =
    direction === "next"
      ? (state.setlistIndex ?? -1) + 1
      : (state.setlistIndex ?? 0) - 1;
  const item = setlist.items[targetIndex];
  if (item === undefined) return null;
  return context.scenes.find((scene) => scene.id === item.sceneId) ?? null;
}

/** A step to a look that flashes asks the flash warning first, as a pad does. */
export function handleSetlistStep(
  context: VjRemoteActionContext,
  direction: "next" | "previous",
): void {
  if (context.isBlocked) return;
  const sendStep = () => {
    const outcomePromise =
      direction === "next"
        ? context.run("setlistNext")
        : context.run("setlistPrevious");
    void outcomePromise.then(context.reportOutcome);
  };
  const scene = vjSetlistStepSceneOf(context, direction);
  if (
    scene !== null &&
    !context.hasFlashConsent &&
    vjSceneLookFlashes(scene.look)
  ) {
    context.requestSceneConsent(scene, null, sendStep);
    return;
  }
  sendStep();
}

/** The crossfader's trailing sender calls this at most once per 50 ms. */
export function sendVjMixAmount(
  context: VjRemoteActionContext | null,
  amount: number,
): void {
  if (context === null || context.isBlocked) return;
  void context.run("setMix", { amount }).then(context.reportOutcome);
}

/** The length slider's trailing sender calls this at most once per 100 ms. */
export function sendVjTransitionLength(
  context: VjRemoteActionContext | null,
  length: VjTransitionLength,
): void {
  if (context === null || context.isBlocked) return;
  void context.run("setTransition", { length }).then(context.reportOutcome);
}

type VjValueAction = Extract<
  VjRemoteAction,
  { kind: "crossfader" | "transitionLength" }
>;

function handleValue(
  context: VjRemoteActionContext,
  action: VjValueAction,
): void {
  if (context.isBlocked) return;
  if (action.kind === "crossfader") {
    const amount = roundVjAmount(Math.min(1, Math.max(0, action.amount)));
    context.crossfader.push(amount, Date.now());
    return;
  }
  const { state } = context;
  if (state === null) return;
  context.transitionLength.push(
    vjTransitionLengthFor(action.normalized, state.transition.length.unit),
    Date.now(),
  );
}

type VjPressAction = Exclude<VjRemoteAction, VjPadAction | VjValueAction>;

function handlePress(
  context: VjRemoteActionContext,
  action: VjPressAction,
): void {
  switch (action.kind) {
    case "goClipAt":
      return handleGoClipAt(context, action.index);
    case "goClip":
      return handleGoClip(context, action.clipId);
    case "goGenerator":
      return handleGoGenerator(context, action.generatorId, action.variant);
    case "go":
      return handleGo(context);
    case "blackout":
      return handleBlackout(context);
    case "resetLook":
      return handleResetLook(context);
    case "tapTempo":
      return handleTap(context);
    case "downbeat":
      return handleDownbeat(context);
    case "cycleQuantize":
      return handleCycleQuantize(context);
    case "previous":
      return handlePrevious(context);
    case "setlistNext":
      return handleSetlistStep(context, "next");
    case "setlistPrevious":
      return handleSetlistStep(context, "previous");
    case "openShortcuts":
      return context.onOpenSheet("shortcuts");
  }
}

/**
 * Pads act on press and release; the crossfader and the length act on their
 * value; every other action acts on press and ignores its release.
 */
export function dispatchVjRemoteAction(
  context: VjRemoteActionContext,
  action: VjRemoteAction,
  phase: VjActionPhase,
): void {
  if (action.kind === "pad" || action.kind === "padSlot") {
    if (phase === "press") handlePadPress(context, action);
    else if (phase === "release") handlePadRelease(context, action);
    return;
  }
  if (action.kind === "crossfader" || action.kind === "transitionLength") {
    if (phase !== "release") handleValue(context, action);
    return;
  }
  if (phase === "press") handlePress(context, action);
}
