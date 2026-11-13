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
  vjEffectSettingOf,
  vjSceneLookFlashes,
  type VjClipDTO,
  type VjEffectId,
  type VjEffectSettingPatch,
  type VjGeneratorId,
  type VjQuantize,
  type VjSceneDTO,
  type VjSetlistDTO,
  type VjSetlistPlaybackStatus,
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
import {
  vjActiveSetlistOf,
  vjSetlistHasFlashingStep,
  vjSetlistNextIndex,
  vjSetlistPreviousIndex,
  vjSetlistSkipFlashingIndexOf,
} from "../rules/vjSetlistPlayback";
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
  /**
   * The newest received state when called, which can be newer than `state`
   * once a flash warning has waited: a confirm checks the sequence did not
   * move while it was open.
   */
  currentState: () => VjStageState | null;
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
  /**
   * Asks the flash warning for a sequence that plays itself, then runs
   * `onConsented`; with the show's consent already given it runs at once.
   * The handler has already decided the sequence needs it.
   */
  requestSetlistConsent: (
    setlist: Pick<VjSetlistDTO, "name">,
    anchor: HTMLElement | null,
    onConsented: () => void,
  ) => void;
  /**
   * The per-tap warning for a step whose look this remote cannot read (its
   * scene or its set list is not loaded): `stepNameKey` names it on the
   * confirm. With the show's consent already given it runs at once.
   */
  requestStepConsent: (
    stepNameKey: string,
    anchor: HTMLElement | null,
    onConsented: () => void,
  ) => void;
  /**
   * The per-tap warning for a step the server refused as an unconfirmed
   * flash although this remote read its look as calm (the look changed
   * since the library loaded): it asks whatever the look here says, naming
   * the step by `stepName`. With the show's consent already given it runs
   * at once.
   */
  requestNamedStepConsent: (
    stepName: string,
    anchor: HTMLElement | null,
    onConsented: () => void,
  ) => void;
  /** Names the reason of a refused send that no optimistic value covers. */
  reportOutcome: (outcome: VjCommandOutcome) => void;
  onResetDone: () => void;
  onOpenSheet: (sheet: "shortcuts") => void;
}

export const VJ_BLACKOUT_KEY = "blackout";
/** The optimistic key of a sequence's Loop switch, one per set list. */
export function vjSetlistLoopKeyOf(setlistId: string): string {
  return `setlistLoop:${setlistId}`;
}
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

/**
 * The Effects on strip's All off: one `setEffects` turns every effect shown
 * on to off, and a running strobe stops through its own command. Text, mix,
 * the clip, blackout and speed stay as they are (Reset look clears those).
 * Every pad shows off at once; the first effect's rollback names the
 * reason and the others roll back quietly.
 */
export function handleAllEffectsOff(context: VjRemoteActionContext): void {
  if (context.isBlocked) return;
  const onEffectIds = VJ_EFFECT_IDS.filter((effectId) =>
    vjPadIsOn(context, effectId),
  );
  if (onEffectIds.length > 0) {
    const settings: Partial<Record<VjEffectId, VjEffectSettingPatch>> = {};
    for (const effectId of onEffectIds) settings[effectId] = { isOn: false };
    const outcomePromise = context.run("setEffects", { settings });
    onEffectIds.forEach((effectId, effectIndex) => {
      void context.applyPad(vjPadKeyOf(effectId), false, () =>
        effectIndex === 0
          ? outcomePromise
          : outcomePromise.then(silencedVjOutcome),
      );
    });
  }
  if (vjPadIsOn(context, "strobe")) sendVjPad(context, "strobe", "off");
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

/** The library's scenes by id, for the sequence flash checks. */
function vjScenesByIdOf(
  context: Pick<VjRemoteActionContext, "scenes">,
): Map<string, VjSceneDTO> {
  return new Map(context.scenes.map((scene) => [scene.id, scene]));
}

/** A sequence moved while its flash warning waited: the send is dropped and this names why. */
export const VJ_SETLIST_MOVED_OUTCOME: VjCommandOutcome = {
  ok: false,
  code: "vj_stale_setlist",
  errorKey: "vj:error.socket.staleSetlist",
};

/**
 * What a press acted on. A send that waits on the flash warning (or that
 * resends after a refusal) goes only while the newest state still matches;
 * a field left out is not compared.
 */
export interface VjSetlistPressMark {
  activeSetlistId: string | null;
  status?: VjSetlistPlaybackStatus;
  setlistIndex?: number | null;
}

export function isVjSetlistPressCurrent(
  state: VjStageState | null,
  mark: VjSetlistPressMark,
): boolean {
  if (state === null || state.activeSetlistId !== mark.activeSetlistId) {
    return false;
  }
  if (
    mark.status !== undefined &&
    state.setlistPlayback.status !== mark.status
  ) {
    return false;
  }
  return (
    mark.setlistIndex === undefined || state.setlistIndex === mark.setlistIndex
  );
}

/** Wraps a waiting send so a confirm after the sequence moved names why instead of sending. */
function whileVjSetlistPressCurrent(
  context: VjRemoteActionContext,
  mark: VjSetlistPressMark | null,
  send: () => void,
): () => void {
  return () => {
    if (
      mark !== null &&
      !isVjSetlistPressCurrent(context.currentState(), mark)
    ) {
      context.reportOutcome(VJ_SETLIST_MOVED_OUTCOME);
      return;
    }
    send();
  };
}

/** How a step's recall reads for the per-tap flash warning. */
export type VjSetlistStepFlashTarget =
  /** A clip step, no step there, or nothing active: sends without asking. */
  | { kind: "calm" }
  | { kind: "scene"; scene: VjSceneDTO }
  /** Its look cannot be read here, so it counts as flashing; the key names it. */
  | { kind: "unknown"; stepNameKey: string };

const VJ_STEP_DIRECTION_NAME_KEYS = {
  next: "vj:strip.setlistNext",
  previous: "vj:strip.setlistPrevious",
} as const;

/** What a step in the sequence recalls, given the list this remote holds. */
function vjSetlistItemFlashTargetOf(
  context: Pick<VjRemoteActionContext, "scenes">,
  setlist: VjSetlistDTO,
  targetIndex: number | null,
): VjSetlistStepFlashTarget {
  if (targetIndex === null) return { kind: "calm" };
  const item = setlist.items[targetIndex];
  if (item === undefined || item.kind !== "scene" || item.sceneId === null) {
    return { kind: "calm" };
  }
  const scene = context.scenes.find(
    (candidate) => candidate.id === item.sceneId,
  );
  return scene === undefined
    ? { kind: "unknown", stepNameKey: "vj:setlistItems.sceneGone" }
    : { kind: "scene", scene };
}

/**
 * What a Next or Previous step would recall, with Loop wrapping as the
 * server does. A scene the library has not loaded, or a set list this
 * remote has not loaded, reads as unknown, so the warning asks.
 */
export function vjSetlistStepFlashTargetOf(
  context: Pick<VjRemoteActionContext, "state" | "scenes" | "setlists">,
  direction: "next" | "previous",
): VjSetlistStepFlashTarget {
  const { state } = context;
  if (state === null || state.activeSetlistId === null) {
    return { kind: "calm" };
  }
  const setlist = vjActiveSetlistOf(state, context.setlists);
  if (setlist === null) {
    return {
      kind: "unknown",
      stepNameKey: VJ_STEP_DIRECTION_NAME_KEYS[direction],
    };
  }
  const itemCount = setlist.items.length;
  const isLooping = state.setlistPlayback.isLooping;
  const targetIndex =
    direction === "next"
      ? vjSetlistNextIndex(state.setlistIndex, itemCount, isLooping)
      : vjSetlistPreviousIndex(state.setlistIndex, itemCount, isLooping);
  return vjSetlistItemFlashTargetOf(context, setlist, targetIndex);
}

/** A step send; `isFlashConfirmed` says the warning was confirmed or the show already consented. */
type VjStepSend = (isFlashConfirmed: boolean) => void;

/**
 * Asks the per-tap warning the target needs, then runs `send`: confirmed
 * at once for a show that already consented, unconfirmed at once for a
 * calm target, confirmed after the warning otherwise. A send that waited
 * goes only while `mark` still matches the newest state.
 */
function askVjStepConsent(
  context: VjRemoteActionContext,
  target: VjSetlistStepFlashTarget,
  anchor: HTMLElement | null,
  send: VjStepSend,
  mark: VjSetlistPressMark | null,
): void {
  if (context.hasFlashConsent) {
    send(true);
    return;
  }
  if (target.kind === "calm") {
    send(false);
    return;
  }
  if (target.kind === "scene" && !vjSceneLookFlashes(target.scene.look)) {
    send(false);
    return;
  }
  const sendAfterWarning = whileVjSetlistPressCurrent(context, mark, () =>
    send(true),
  );
  if (target.kind === "unknown") {
    context.requestStepConsent(target.stepNameKey, anchor, sendAfterWarning);
    return;
  }
  context.requestSceneConsent(target.scene, anchor, sendAfterWarning);
}

/**
 * The warning for a step the server refused as an unconfirmed flash. It
 * always asks (the server knows the step flashes), naming the step: its
 * scene, the key of a step this remote cannot read, or Next or Previous
 * step when this remote read it as calm.
 */
function askVjRefusedStepConsent(
  context: VjRemoteActionContext,
  target: VjSetlistStepFlashTarget,
  direction: "next" | "previous",
  anchor: HTMLElement | null,
  onConsented: () => void,
): void {
  if (target.kind === "scene") {
    context.requestNamedStepConsent(target.scene.name, anchor, onConsented);
    return;
  }
  const stepNameKey =
    target.kind === "unknown"
      ? target.stepNameKey
      : VJ_STEP_DIRECTION_NAME_KEYS[direction];
  context.requestStepConsent(stepNameKey, anchor, onConsented);
}

/** Next or Previous; isFlashConfirmed travels only when the step was confirmed. */
function runVjSetlistStep(
  context: VjRemoteActionContext,
  direction: "next" | "previous",
  isFlashConfirmed: boolean,
): Promise<VjCommandOutcome> {
  if (direction === "next") {
    return isFlashConfirmed
      ? context.run("setlistNext", { isFlashConfirmed: true })
      : context.run("setlistNext");
  }
  return isFlashConfirmed
    ? context.run("setlistPrevious", { isFlashConfirmed: true })
    : context.run("setlistPrevious");
}

/**
 * Manual Next and Previous keep the per-tap consent (design 13.3): a step to
 * a look that flashes, or one this remote cannot read, asks the flash
 * warning first, as a pad does, and sends confirmed. The server refuses an
 * unconfirmed step onto a scene that flashes (vj_setlist_flash_unconfirmed);
 * that refusal opens the warning naming the step and, once confirmed, sends
 * again confirmed. A second refusal is named. A confirm after the step on
 * screen moved names why and sends nothing.
 */
export function handleSetlistStep(
  context: VjRemoteActionContext,
  direction: "next" | "previous",
  anchor: HTMLElement | null = null,
): void {
  const { state } = context;
  if (context.isBlocked) return;
  const mark: VjSetlistPressMark | null =
    state === null
      ? null
      : {
          activeSetlistId: state.activeSetlistId,
          setlistIndex: state.setlistIndex,
        };
  const target = vjSetlistStepFlashTargetOf(context, direction);
  const sendConfirmedAfterRefusal = whileVjSetlistPressCurrent(
    context,
    mark,
    () => {
      void runVjSetlistStep(context, direction, true).then(
        context.reportOutcome,
      );
    },
  );
  const sendStep: VjStepSend = (isFlashConfirmed) => {
    void runVjSetlistStep(context, direction, isFlashConfirmed).then(
      (outcome) => {
        const isFlashRefusal =
          !outcome.ok && outcome.code === "vj_setlist_flash_unconfirmed";
        if (isFlashRefusal && !isFlashConfirmed) {
          askVjRefusedStepConsent(
            context,
            target,
            direction,
            anchor,
            sendConfirmedAfterRefusal,
          );
          return;
        }
        context.reportOutcome(outcome);
      },
    );
  };
  askVjStepConsent(context, target, anchor, sendStep, mark);
}

/** Sends a command that lets the sequence play by itself, with its flash flag. */
type VjSetlistPlaySend = (
  isFlashConfirmed: boolean,
) => Promise<VjCommandOutcome>;

/**
 * Sends once; a refusal for an unconfirmed flashing step (a scene that
 * flashes and that this remote could not see) opens the warning for the
 * sequence and, once confirmed, sends again confirmed while the press is
 * still current. The second send names any refusal it meets.
 */
function sendVjSetlistPlay(
  context: VjRemoteActionContext,
  setlist: VjSetlistDTO | null,
  anchor: HTMLElement | null,
  send: VjSetlistPlaySend,
  isFlashConfirmed: boolean,
  mark: VjSetlistPressMark | null,
): void {
  const sendConfirmed = whileVjSetlistPressCurrent(context, mark, () => {
    void send(true).then(context.reportOutcome);
  });
  void send(isFlashConfirmed).then((outcome) => {
    const isFlashRefusal =
      !outcome.ok && outcome.code === "vj_setlist_flash_unconfirmed";
    if (isFlashRefusal && !isFlashConfirmed && setlist !== null) {
      context.requestSetlistConsent(setlist, anchor, sendConfirmed);
      return;
    }
    context.reportOutcome(outcome);
  });
}

/**
 * Play, Resume and Play again (design 13.3): with the show's consent the
 * send is confirmed at once; a sequence with a flashing scene step (or a
 * scene step this remote cannot read) asks the warning once first and
 * sends confirmed; any other sends unconfirmed. `mark` drops a confirm
 * that comes after the sequence moved.
 */
function playVjSetlist(
  context: VjRemoteActionContext,
  setlist: VjSetlistDTO | null,
  anchor: HTMLElement | null,
  send: VjSetlistPlaySend,
  mark: VjSetlistPressMark | null,
): void {
  if (context.hasFlashConsent) {
    sendVjSetlistPlay(context, setlist, anchor, send, true, mark);
    return;
  }
  if (
    setlist !== null &&
    vjSetlistHasFlashingStep(setlist, vjScenesByIdOf(context))
  ) {
    context.requestSetlistConsent(
      setlist,
      anchor,
      whileVjSetlistPressCurrent(context, mark, () =>
        sendVjSetlistPlay(context, setlist, anchor, send, true, mark),
      ),
    );
    return;
  }
  sendVjSetlistPlay(context, setlist, anchor, send, false, mark);
}

function vjSetlistOf(
  context: VjRemoteActionContext,
  setlistId: string,
): VjSetlistDTO | null {
  return context.setlists.find((setlist) => setlist.id === setlistId) ?? null;
}

/**
 * A row's Play sequence: step 1, playing. The command names its set list,
 * so a late confirm still plays the sequence the warning named. An empty
 * sequence sends nothing (its row shows why).
 */
export function handleSetlistPlay(
  context: VjRemoteActionContext,
  setlistId: string,
  anchor: HTMLElement | null = null,
): void {
  if (context.isBlocked) return;
  const setlist = vjSetlistOf(context, setlistId);
  if (setlist !== null && setlist.items.length === 0) return;
  playVjSetlist(
    context,
    setlist,
    anchor,
    (isFlashConfirmed) =>
      context.run("setlistSelect", setlistId, 0, {
        isPlaying: true,
        isFlashConfirmed,
      }),
    null,
  );
}

/**
 * A row's Step through: step 1, moved on by hand. Step 1 is a recall like
 * Next, so a scene that flashes, or one this remote cannot read, asks the
 * per-tap warning first.
 */
export function handleSetlistStepThrough(
  context: VjRemoteActionContext,
  setlistId: string,
  anchor: HTMLElement | null = null,
): void {
  if (context.isBlocked) return;
  const setlist = vjSetlistOf(context, setlistId);
  if (setlist !== null && setlist.items.length === 0) return;
  const sendSelect: VjStepSend = () => {
    void context.run("setlistSelect", setlistId, 0).then(context.reportOutcome);
  };
  const target: VjSetlistStepFlashTarget =
    setlist === null
      ? { kind: "unknown", stepNameKey: VJ_STEP_DIRECTION_NAME_KEYS.next }
      : vjSetlistItemFlashTargetOf(context, setlist, 0);
  // The command names its set list and step 1, so a late confirm still
  // recalls the step the warning named.
  askVjStepConsent(context, target, anchor, sendSelect, null);
}

/**
 * The active controls' one play button: Pause while playing, else Play,
 * Resume or Play again. A confirm after the active sequence or its status
 * changed names why and sends nothing.
 */
export function handleSetlistTogglePlaying(
  context: VjRemoteActionContext,
  anchor: HTMLElement | null = null,
): void {
  const { state } = context;
  if (context.isBlocked || state === null) return;
  if (state.activeSetlistId === null) return;
  const status = state.setlistPlayback.status;
  if (status === "playing") {
    void context.run("setlistSetPlaying", false).then(context.reportOutcome);
    return;
  }
  playVjSetlist(
    context,
    vjActiveSetlistOf(state, context.setlists),
    anchor,
    (isFlashConfirmed) =>
      context.run("setlistSetPlaying", true, isFlashConfirmed),
    { activeSetlistId: state.activeSetlistId, status },
  );
}

/**
 * "Play the flashing step": the panel that names the step is the warning,
 * so this press confirms it for this run (contract 5.5). The show's
 * consent for pads stays as it was.
 */
export function handleSetlistPlayFlashing(
  context: VjRemoteActionContext,
): void {
  const { state } = context;
  if (context.isBlocked || state === null) return;
  if (state.setlistPlayback.status !== "needsFlashConsent") return;
  void context.run("setlistSetPlaying", true, true).then(context.reportOutcome);
}

/**
 * "Skip the flashing step": plays on from the first step after it that
 * does not flash (contract call 13), unconfirmed. A refusal names its
 * reason; Skip never confirms the run. With no such step the panel offers
 * Play the flashing step and Stop sequence only, so this sends nothing.
 */
export function handleSetlistSkipFlashing(
  context: VjRemoteActionContext,
): void {
  const { state } = context;
  if (context.isBlocked || state === null) return;
  const setlist = vjActiveSetlistOf(state, context.setlists);
  if (setlist === null) return;
  const targetIndex = vjSetlistSkipFlashingIndexOf(
    state,
    setlist,
    vjScenesByIdOf(context),
  );
  if (targetIndex === null) return;
  void context
    .run("setlistSelect", setlist.id, targetIndex, {
      isPlaying: true,
      isFlashConfirmed: false,
    })
    .then(context.reportOutcome);
}

/**
 * The Loop switch of the active sequence: shown at once under its own set
 * list's key, rolled back with its named reason on a refusal.
 */
export function handleSetlistSetLooping(
  context: VjRemoteActionContext,
  isLooping: boolean,
): void {
  const { state } = context;
  if (context.isBlocked || state === null) return;
  if (state.activeSetlistId === null) return;
  void context.applyPad(
    vjSetlistLoopKeyOf(state.activeSetlistId),
    isLooping,
    () => context.run("setlistSetLooping", isLooping),
  );
}

/** Stop sequence: clears the selection, as before sequences played themselves. */
export function handleSetlistStop(context: VjRemoteActionContext): void {
  if (context.isBlocked) return;
  void context.run("setlistSelect", null, null).then(context.reportOutcome);
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
    case "setlistPlay":
      return handleSetlistPlay(context, action.setlistId);
    case "setlistStepThrough":
      return handleSetlistStepThrough(context, action.setlistId);
    case "setlistTogglePlaying":
      return handleSetlistTogglePlaying(context);
    case "setlistSetLooping":
      return handleSetlistSetLooping(context, action.isLooping);
    case "setlistStop":
      return handleSetlistStop(context);
    case "setlistPlayFlashing":
      return handleSetlistPlayFlashing(context);
    case "setlistSkipFlashing":
      return handleSetlistSkipFlashing(context);
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
