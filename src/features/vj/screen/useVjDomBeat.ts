/**
 * The DOM fallback's beat clock: one requestAnimationFrame loop that reads
 * the beat position on the synced clock and writes the effects frame's
 * moving values as custom properties on the element (VJ_DOM_BEAT_PROPERTIES),
 * so React never re-renders per frame.
 *
 * Flash safety (contract 3.2, design 5): the beatPulse bump, the `beat`
 * variant of invert and every invert toggle spend the flash governor's budget
 * of 3 flashes per rolling second. A denied bump stays within
 * VJ_SUB_FLASH_GAIN, a denied beat invert skips that beat and a denied toggle
 * ramps over VJ_DOM_INVERT_RAMP_MS. While the strobe runs, the budget is the
 * strobe's alone. The DOM path has no luminance net, so this budget is its
 * only guard.
 *
 * Without a clock or a tempo the loop does not run and every value rests on
 * the fallback written in vjDomEffectsStyle.ts. With reduced motion on, the
 * values rest too, except on the projector stage, where the show keeps its
 * timing whatever the laptop's setting.
 */
import { useEffect, useEffectEvent, useRef, type RefObject } from "react";
import {
  vjBeatPositionAt,
  type VjEffectSettings,
  type VjTempo,
} from "../../../shared/contracts/vj";
import {
  EMPTY_VJ_FLASH_BUDGET,
  VJ_SUB_FLASH_GAIN,
  governedVjGain,
  requestVjFlash,
  setVjStrobeRunning,
  type VjFlashBudget,
  type VjFlashKind,
} from "../engine/safety/vjFlashGovernor";
import type { VjClockReader } from "../engine/vjEngineLook";
import {
  VJ_DOM_BEAT_PROPERTIES,
  createVjDomBeatPose,
  fillVjDomBeatPose,
  formatVjCssNumber,
  vjDomAmountOf,
  vjDomSettingOf,
  type VjDomBeatPose,
} from "./vjDomEffectsStyle";

/** A denied invert toggle ramps between off and on over this long. */
export const VJ_DOM_INVERT_RAMP_MS = 400;
/** The projector stage root; frames inside it keep moving under reduced motion. */
export const VJ_DOM_SHOW_SELECTOR = "[data-vj-stage]";
/** A longer gap (a background tab) ramps as if one ordinary frame passed. */
const VJ_DOM_MAX_FRAME_DELTA_MS = 100;

export interface VjDomBeatInput {
  settings: VjEffectSettings;
  tempo: VjTempo | null;
  clock: VjClockReader | null;
  isStrobing: boolean;
  /** The app's reduced-motion flag; ignored on the projector stage. */
  isReducedMotion?: boolean;
  /** The screen's flash budget, when the renderer shares one; otherwise the hook keeps its own. */
  flashBudgetRef?: RefObject<VjFlashBudget>;
}

interface VjDomBeatState {
  pose: VjDomBeatPose;
  pulseBeatIndex: number | null;
  isPulseGranted: boolean;
  invertBeatIndex: number | null;
  isInvertBeatGranted: boolean;
  /** 1 while the steady invert is on, 0 otherwise; null until the loop's first frame. */
  toggleTarget: number | null;
  toggleLevel: number;
  /** The last invert amount while it was on, so a switch-off ramps from it. */
  invertAmount: number;
  lastFrameMs: number | null;
  /** The last value written per VJ_DOM_BEAT_PROPERTIES entry. */
  written: (string | null)[];
}

function createVjDomBeatState(): VjDomBeatState {
  return {
    pose: createVjDomBeatPose(),
    pulseBeatIndex: null,
    isPulseGranted: false,
    invertBeatIndex: null,
    isInvertBeatGranted: false,
    toggleTarget: null,
    toggleLevel: 0,
    invertAmount: 0,
    lastFrameMs: null,
    written: VJ_DOM_BEAT_PROPERTIES.map(() => null),
  };
}

function requestFlash(
  budgetRef: RefObject<VjFlashBudget>,
  kind: VjFlashKind,
  frameMs: number,
): boolean {
  const answer = requestVjFlash(budgetRef.current, kind, frameMs);
  budgetRef.current = answer.budget;
  return answer.isGranted;
}

/** The beatPulse brightness for this frame: one grant per beat, sub-flash when denied. */
function governedPulseGain(
  state: VjDomBeatState,
  budgetRef: RefObject<VjFlashBudget>,
  settings: VjEffectSettings,
  beatIndex: number,
  frameMs: number,
): number {
  const requestedGain = state.pose.pulseGain;
  const peakGain = 1 + 0.5 * vjDomAmountOf(settings, "beatPulse");
  // A bump that never crosses the sub-flash line is no flash and spends nothing.
  if (peakGain <= 1 + VJ_SUB_FLASH_GAIN) return requestedGain;
  if (beatIndex !== state.pulseBeatIndex) {
    state.pulseBeatIndex = beatIndex;
    state.isPulseGranted = requestFlash(budgetRef, "beatPulse", frameMs);
  }
  return governedVjGain(requestedGain, state.isPulseGranted);
}

/**
 * The invert level for this frame (0..amount). A steady toggle asks for one
 * flash and snaps when granted, ramps when denied. The `beat` variant asks
 * for one flash per beat and inverts the first half of a granted beat (the
 * switch back belongs to the same flash).
 */
function governedInvert(
  state: VjDomBeatState,
  budgetRef: RefObject<VjFlashBudget>,
  settings: VjEffectSettings,
  position: { beatIndex: number; phase: number },
  frameMs: number,
  frameDeltaMs: number,
): number {
  const setting = vjDomSettingOf(settings, "invert");
  if (setting !== null) state.invertAmount = vjDomAmountOf(settings, "invert");
  const isSubFlash = state.invertAmount <= VJ_SUB_FLASH_GAIN;
  const isBeatVariant = setting !== null && setting.variant === "beat";
  const toggleTarget = setting !== null && !isBeatVariant ? 1 : 0;

  if (state.toggleTarget === null) {
    state.toggleTarget = toggleTarget;
    state.toggleLevel = toggleTarget;
  } else if (toggleTarget !== state.toggleTarget) {
    state.toggleTarget = toggleTarget;
    if (isSubFlash || requestFlash(budgetRef, "invertToggle", frameMs)) {
      state.toggleLevel = toggleTarget;
    }
  }
  const rampStep = frameDeltaMs / VJ_DOM_INVERT_RAMP_MS;
  state.toggleLevel =
    toggleTarget > state.toggleLevel
      ? Math.min(toggleTarget, state.toggleLevel + rampStep)
      : Math.max(toggleTarget, state.toggleLevel - rampStep);

  let beatLevel = 0;
  if (isBeatVariant && position.phase < 0.5) {
    if (position.beatIndex !== state.invertBeatIndex) {
      state.invertBeatIndex = position.beatIndex;
      state.isInvertBeatGranted =
        isSubFlash || requestFlash(budgetRef, "invertBeat", frameMs);
    }
    if (state.isInvertBeatGranted) beatLevel = 1;
  }
  return state.invertAmount * Math.max(state.toggleLevel, beatLevel);
}

function writeProperty(
  element: HTMLElement,
  state: VjDomBeatState,
  propertyIndex: number,
  value: string,
): void {
  if (state.written[propertyIndex] === value) return;
  state.written[propertyIndex] = value;
  const propertyName = VJ_DOM_BEAT_PROPERTIES[propertyIndex];
  if (propertyName !== undefined)
    element.style.setProperty(propertyName, value);
}

function stepVjDomBeat(
  element: HTMLElement,
  state: VjDomBeatState,
  budgetRef: RefObject<VjFlashBudget>,
  input: VjDomBeatInput,
  tempo: VjTempo,
  clock: VjClockReader,
  frameMs: number,
): void {
  budgetRef.current = setVjStrobeRunning(budgetRef.current, input.isStrobing);
  const frameDeltaMs =
    state.lastFrameMs === null
      ? 0
      : Math.min(
          VJ_DOM_MAX_FRAME_DELTA_MS,
          Math.max(0, frameMs - state.lastFrameMs),
        );
  state.lastFrameMs = frameMs;

  const position = vjBeatPositionAt(tempo, clock.serverNow());
  const beats = position.beatIndex + position.phase;
  fillVjDomBeatPose(state.pose, input.settings, beats, position.phase);
  const gain = governedPulseGain(
    state,
    budgetRef,
    input.settings,
    position.beatIndex,
    frameMs,
  );
  const invert = governedInvert(
    state,
    budgetRef,
    input.settings,
    position,
    frameMs,
    frameDeltaMs,
  );

  const pose = state.pose;
  writeProperty(element, state, 0, `${formatVjCssNumber(pose.hueDegrees)}deg`);
  writeProperty(element, state, 1, formatVjCssNumber(gain));
  writeProperty(element, state, 2, formatVjCssNumber(pose.zoom));
  writeProperty(
    element,
    state,
    3,
    `${formatVjCssNumber(pose.rotateDegrees)}deg`,
  );
  writeProperty(
    element,
    state,
    4,
    `scale(${formatVjCssNumber(pose.kenBurnsScale)}) translate(${formatVjCssNumber(pose.kenBurnsX)}%, ${formatVjCssNumber(pose.kenBurnsY)}%)`,
  );
  writeProperty(element, state, 5, formatVjCssNumber(invert));
}

/** Removes every written value, so the frame falls back to its resting look. */
function clearVjDomBeat(element: HTMLElement, state: VjDomBeatState): void {
  for (const propertyName of VJ_DOM_BEAT_PROPERTIES) {
    element.style.removeProperty(propertyName);
  }
  state.written = VJ_DOM_BEAT_PROPERTIES.map(() => null);
  state.toggleTarget = null;
  state.lastFrameMs = null;
}

/** Writes --vj-dom-hue, --vj-dom-brightness, --vj-dom-zoom, --vj-dom-rotate, --vj-dom-kenburns, --vj-dom-invert on the element every frame; nothing when clock is null. */
export function useVjDomBeat(
  elementRef: RefObject<HTMLElement | null>,
  input: VjDomBeatInput,
): void {
  const ownBudgetRef = useRef<VjFlashBudget>(EMPTY_VJ_FLASH_BUDGET);
  const budgetRef = input.flashBudgetRef ?? ownBudgetRef;
  const stateRef = useRef<VjDomBeatState | null>(null);
  const isRunning = input.clock !== null && input.tempo !== null;
  const isReducedMotion = input.isReducedMotion === true;

  const onFrame = useEffectEvent((element: HTMLElement, frameMs: number) => {
    const { tempo, clock } = input;
    const state = stateRef.current;
    if (tempo === null || clock === null || state === null) return;
    stepVjDomBeat(element, state, budgetRef, input, tempo, clock, frameMs);
  });

  useEffect(() => {
    const element = elementRef.current;
    if (!isRunning || element === null) return undefined;
    const isShow = element.closest(VJ_DOM_SHOW_SELECTOR) !== null;
    if (isReducedMotion && !isShow) return undefined;
    stateRef.current ??= createVjDomBeatState();
    const state = stateRef.current;
    let frameId = requestAnimationFrame(function tick(frameMs: number) {
      onFrame(element, frameMs);
      frameId = requestAnimationFrame(tick);
    });
    return () => {
      cancelAnimationFrame(frameId);
      clearVjDomBeat(element, state);
    };
  }, [elementRef, isRunning, isReducedMotion]);
}
