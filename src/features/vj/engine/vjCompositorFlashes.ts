/**
 * The compositor's flash events (engine plan, Task E21, decisions 5, 6 and
 * 8; contract 3.2). One flash budget per screen, shared by every event that
 * can flash: the strobe, the `dipWhite` and `glitch` transitions, `invert`
 * beat flashes and toggles, `glitch` bursts that shift mean luminance,
 * `beatPulse` bumps and audio-reactive brightness.
 *
 * - The strobe shows only for a start the governor granted: the strobe
 *   clock's `isFlashUp` can be true for a denied start.
 * - `setVjStrobeRunning` runs every frame, so while the strobe runs every
 *   other event is denied and renders at sub-flash amplitude.
 * - A denied beat invert skips that beat; a denied steady toggle ramps over
 *   VJ_INVERT_RAMP_MS (switching off keeps the last invert setting drawn
 *   until the ramp reaches 0, through `effectiveSettings`).
 * - A denied glitch burst drops its luminance change.
 * - `beatPulse` asks once per beat. While the mic drives the gain, a gain
 *   moving more than VJ_SUB_FLASH_GAIN from the gain at the last grant asks
 *   for `audioBrightness`; a denied one holds the gain within
 *   VJ_SUB_FLASH_GAIN of the last granted gain until the next beat.
 * Events whose amplitude stays under VJ_SUB_FLASH_GAIN spend nothing.
 *
 * `tick` writes one reused answer and allocates nothing while the strobe is
 * off; only a grant allocates (the governor's budget is an immutable value).
 */
import type {
  VjEffectSetting,
  VjEffectSettings,
} from "../../../shared/contracts/vj";
import {
  EMPTY_VJ_FLASH_BUDGET,
  VJ_FLASH_HOLD_MS,
  VJ_SUB_FLASH_GAIN,
  governedVjGain,
  requestVjFlash,
  setVjStrobeRunning,
  type VjFlashBudget,
  type VjFlashKind,
} from "./safety/vjFlashGovernor";
import {
  createVjStrobeClock,
  tickVjStrobe,
  type VjStrobeTickInput,
} from "./safety/vjStrobeClock";
import { vjEffectAmountOf, vjEffectVariantOf } from "./vjEffectRegistry";

/** A denied invert toggle ramps between off and on over this long (the DOM path's VJ_DOM_INVERT_RAMP_MS). */
export const VJ_INVERT_RAMP_MS = 400;
/** A glitch burst lasts at most this long, and at most half a beat. */
export const VJ_GLITCH_BURST_MS = 240;
/** A longer frame gap ramps as if one ordinary frame passed. */
const MAX_FRAME_DELTA_MS = 100;

export interface VjFlashFrame {
  /** 1 while a granted strobe flash is up. */
  strobe: number;
  /** The governed beatPulse gain for the output pass. */
  outputGain: number;
  /** The colour pass's uInvert: amount times the governed toggle or beat level. */
  invertLevel: number;
  /** 1 in the first half of a granted invert beat. */
  invertBeatGate: number;
  /** 0..1, the steady invert toggle level. */
  invertRamp: number;
  glitchSeed: number;
  /** 0..1, the envelope of the running glitch burst. */
  glitchBurst: number;
  isGlitchLumaShiftGranted: boolean;
}

export interface VjFlashTickInput {
  nowMs: number;
  settings: VjEffectSettings;
  isStrobing: boolean;
  /** True on the lead screen only. */
  isStrobeEnabled: boolean;
  beatIndex: number;
  beatPhase: number;
  beatPeriodMs: number;
  /** This frame's uDrive. */
  drive: number;
  /** This screen's mic level, null while the mic is off. */
  micLevel: number | null;
}

/** A stable pseudo-random value in 0..1 for a beat index. */
function beatHash(beatIndex: number): number {
  const value = Math.sin(beatIndex * 12.9898 + 78.233) * 43758.5453;
  return value - Math.floor(value);
}

export class VjCompositorFlashes {
  readonly frame: VjFlashFrame = {
    strobe: 0,
    outputGain: 1,
    invertLevel: 0,
    invertBeatGate: 0,
    invertRamp: 0,
    glitchSeed: 0,
    glitchBurst: 0,
    isGlitchLumaShiftGranted: false,
  };
  private budget: VjFlashBudget = EMPTY_VJ_FLASH_BUDGET;
  private readonly strobeClock = createVjStrobeClock();
  private readonly strobeInput: VjStrobeTickInput = {
    isStrobing: false,
    isEnabled: false,
    nowMs: 0,
    beatIndex: 0,
    beatPeriodMs: 500,
  };
  private strobeGrantedUntilMs = Number.NEGATIVE_INFINITY;
  private lastFrameMs: number | null = null;
  private pulseBeatIndex: number | null = null;
  private isPulseGranted = false;
  private isAudioDenied = false;
  /** The output gain at the last beatPulse or audioBrightness grant (1 after a denied beat). */
  private pulseGrantedGain = 1;
  private invertBeatIndex: number | null = null;
  private isInvertBeatGranted = false;
  private toggleTarget: number | null = null;
  private toggleLevel = 0;
  private invertAmount = 0;
  private lastInvertSetting: VjEffectSetting | null = null;
  private rampOutBase: VjEffectSettings | null = null;
  private rampOutSettings: VjEffectSettings | null = null;
  private glitchBeatIndex: number | null = null;
  private glitchStartMs = Number.NEGATIVE_INFINITY;
  private glitchDurationMs = VJ_GLITCH_BURST_MS;

  /** Asks the shared budget for one flash at `nowMs`. */
  request(kind: VjFlashKind, nowMs: number): boolean {
    const answer = requestVjFlash(this.budget, kind, nowMs);
    this.budget = answer.budget;
    return answer.isGranted;
  }

  /** Grants still holding the budget at `nowMs` (at most 3). */
  heldGrantCount(nowMs: number): number {
    let count = 0;
    for (const grantedAtMs of this.budget.grantedAtMs) {
      if (nowMs - grantedAtMs <= VJ_FLASH_HOLD_MS) count += 1;
    }
    return count;
  }

  tick(input: VjFlashTickInput): VjFlashFrame {
    const frameDeltaMs =
      this.lastFrameMs === null
        ? 0
        : Math.min(
            MAX_FRAME_DELTA_MS,
            Math.max(0, input.nowMs - this.lastFrameMs),
          );
    this.lastFrameMs = input.nowMs;
    this.frame.strobe = this.tickStrobe(input);
    this.frame.outputGain = this.governedPulseGain(input);
    this.frame.invertLevel = this.governedInvert(input, frameDeltaMs);
    this.tickGlitch(input);
    return this.frame;
  }

  /**
   * The settings the pass graph draws: the look's, except while a denied
   * switch-off of the steady invert ramps out, when the last invert setting
   * stays on until the ramp reaches 0.
   */
  effectiveSettings(settings: VjEffectSettings): VjEffectSettings {
    const isRampingOut =
      vjEffectAmountOf(settings, "invert") <= 0 &&
      this.toggleLevel > 0 &&
      this.lastInvertSetting !== null;
    if (!isRampingOut || this.lastInvertSetting === null) {
      this.rampOutBase = null;
      this.rampOutSettings = null;
      return settings;
    }
    if (this.rampOutBase !== settings || this.rampOutSettings === null) {
      this.rampOutBase = settings;
      this.rampOutSettings = { ...settings, invert: this.lastInvertSetting };
    }
    return this.rampOutSettings;
  }

  private tickStrobe(input: VjFlashTickInput): number {
    const clock = this.strobeClock;
    // Off and already settled: the tick would change nothing, so skip it.
    if (!input.isStrobing && !clock.wasStrobing) {
      this.budget = setVjStrobeRunning(this.budget, false);
      return 0;
    }
    const strobeInput = this.strobeInput;
    strobeInput.isStrobing = input.isStrobing;
    strobeInput.isEnabled = input.isStrobeEnabled;
    strobeInput.nowMs = input.nowMs;
    strobeInput.beatIndex = input.beatIndex;
    strobeInput.beatPeriodMs = input.beatPeriodMs;
    const tick = tickVjStrobe(clock, strobeInput);
    this.budget = setVjStrobeRunning(
      this.budget,
      input.isStrobing && !tick.isRunOver,
    );
    if (tick.didStartFlash && this.request("strobe", input.nowMs)) {
      this.strobeGrantedUntilMs = clock.flashUpUntilMs;
    }
    return tick.isFlashUp && input.nowMs < this.strobeGrantedUntilMs ? 1 : 0;
  }

  private governedPulseGain(input: VjFlashTickInput): number {
    const amount = vjEffectAmountOf(input.settings, "beatPulse");
    if (amount <= 0) return 1;
    const requestedGain = 1 + 0.5 * amount * input.drive;
    // A bump that never crosses the sub-flash line is no flash and spends nothing.
    if (1 + 0.5 * amount <= 1 + VJ_SUB_FLASH_GAIN) return requestedGain;
    if (input.beatIndex !== this.pulseBeatIndex) {
      this.pulseBeatIndex = input.beatIndex;
      this.isPulseGranted = this.request("beatPulse", input.nowMs);
      this.isAudioDenied = !this.isPulseGranted;
      this.pulseGrantedGain =
        this.isPulseGranted && Number.isFinite(requestedGain)
          ? requestedGain
          : 1;
    }
    if (input.micLevel === null || !Number.isFinite(requestedGain)) {
      return governedVjGain(requestedGain, this.isPulseGranted);
    }
    return this.governedAudioGain(requestedGain, input.nowMs);
  }

  /**
   * The mic moves the gain inside a beat (contract 3.2: audio-reactive
   * brightness draws from the budget). A move of more than VJ_SUB_FLASH_GAIN
   * from the last granted gain asks for `audioBrightness`; once one is denied
   * the gain stays within VJ_SUB_FLASH_GAIN of the last granted gain until the
   * next beat asks again.
   */
  private governedAudioGain(requestedGain: number, nowMs: number): number {
    const grantedGain = this.pulseGrantedGain;
    if (
      !this.isAudioDenied &&
      Math.abs(requestedGain - grantedGain) > VJ_SUB_FLASH_GAIN
    ) {
      if (this.request("audioBrightness", nowMs)) {
        this.pulseGrantedGain = requestedGain;
        return requestedGain;
      }
      this.isAudioDenied = true;
    }
    return Math.min(
      grantedGain + VJ_SUB_FLASH_GAIN,
      Math.max(grantedGain - VJ_SUB_FLASH_GAIN, requestedGain),
    );
  }

  /**
   * The invert level for this frame (0..amount), as the DOM path draws it: a
   * steady toggle asks for one flash and snaps when granted, ramps when
   * denied; the `beat` variant asks once per beat and inverts the first half
   * of a granted beat (the switch back belongs to the same flash).
   */
  private governedInvert(
    input: VjFlashTickInput,
    frameDeltaMs: number,
  ): number {
    const setting = input.settings.invert;
    const amount = vjEffectAmountOf(input.settings, "invert");
    const isOn = setting !== undefined && amount > 0;
    if (isOn) {
      this.invertAmount = amount;
      this.lastInvertSetting = setting;
    }
    const isSubFlash = this.invertAmount <= VJ_SUB_FLASH_GAIN;
    const isBeatVariant =
      isOn && vjEffectVariantOf(input.settings, "invert") === "beat";
    const toggleTarget = isOn && !isBeatVariant ? 1 : 0;
    if (this.toggleTarget === null) {
      this.toggleTarget = toggleTarget;
      this.toggleLevel = toggleTarget;
    } else if (toggleTarget !== this.toggleTarget) {
      this.toggleTarget = toggleTarget;
      if (isSubFlash || this.request("invertToggle", input.nowMs)) {
        this.toggleLevel = toggleTarget;
      }
    }
    const rampStep = frameDeltaMs / VJ_INVERT_RAMP_MS;
    this.toggleLevel =
      toggleTarget > this.toggleLevel
        ? Math.min(toggleTarget, this.toggleLevel + rampStep)
        : Math.max(toggleTarget, this.toggleLevel - rampStep);

    let beatGate = 0;
    if (isBeatVariant && input.beatPhase < 0.5) {
      if (input.beatIndex !== this.invertBeatIndex) {
        this.invertBeatIndex = input.beatIndex;
        this.isInvertBeatGranted =
          isSubFlash || this.request("invertBeat", input.nowMs);
      }
      if (this.isInvertBeatGranted) beatGate = 1;
    }
    this.frame.invertBeatGate = beatGate;
    this.frame.invertRamp = this.toggleLevel;
    return this.invertAmount * Math.max(this.toggleLevel, beatGate);
  }

  /** Bursts start on beats, more often with a stronger drive; each asks for its luminance shift. */
  private tickGlitch(input: VjFlashTickInput): void {
    const frame = this.frame;
    const amount = vjEffectAmountOf(input.settings, "glitch");
    if (amount <= 0) {
      frame.glitchBurst = 0;
      frame.isGlitchLumaShiftGranted = false;
      this.glitchBeatIndex = null;
      return;
    }
    if (input.beatIndex !== this.glitchBeatIndex) {
      this.glitchBeatIndex = input.beatIndex;
      const chance = Math.min(1, amount * (0.5 + input.drive));
      if (beatHash(input.beatIndex) < chance) {
        this.glitchStartMs = input.nowMs;
        this.glitchDurationMs = Math.max(
          1,
          Math.min(VJ_GLITCH_BURST_MS, input.beatPeriodMs * 0.5),
        );
        frame.glitchSeed = beatHash(input.beatIndex + 0.5) * 97 + 1;
        frame.isGlitchLumaShiftGranted = this.request(
          "glitchBurst",
          input.nowMs,
        );
      }
    }
    const elapsedMs = input.nowMs - this.glitchStartMs;
    frame.glitchBurst = Math.min(
      1,
      Math.max(0, 1 - elapsedMs / this.glitchDurationMs),
    );
    if (frame.glitchBurst <= 0) frame.isGlitchLumaShiftGranted = false;
  }
}
