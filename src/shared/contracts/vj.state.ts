/**
 * VJ wire contract (C 3), frontend mirror of `queerpulse-backend/src/vj/vj.contract.ts`
 * and `vj-response.ts`. Names and values match it; edit both together.
 * Stage state (C 3.4), its defaults (C 3.5) and the scene look (C 3.7).
 */

import type { VjGeneratorId, VjEffectSettings } from "./vj.effects";
import {
  VJ_LIMITS,
  type VjBlendMode,
  type VjColorToken,
  type VjEventCardKind,
  type VjLogoCorner,
  type VjOverlayPosition,
  type VjOverlaySize,
  type VjOverlayStyle,
  type VjQuantize,
  type VjShuffleIntervalKind,
  type VjShuffleSource,
  type VjSpeed,
  type VjTempoSource,
  type VjTransitionId,
  type VjTransitionLengthUnit,
} from "./vj.lists";

// Stage state (C 3.4)

export interface VjTransitionLength {
  unit: VjTransitionLengthUnit;
  /** "ms": integer 0..4000. "beats": one of 1, 2, 4, 8, 16. */
  value: number;
}

export interface VjTransition {
  /** Default "fade". */
  mode: VjTransitionId;
  /** Default { unit: "ms", value: 800 }; "cut" ignores it. */
  length: VjTransitionLength;
}

export interface VjOverlay {
  /** Trimmed, 0..80 code points, default "". */
  text: string;
  /** Default "big". */
  style: VjOverlayStyle;
  /** Default false; true needs non-blank text. */
  isVisible: boolean;
  /** Default "center". */
  position: VjOverlayPosition;
  /** Default "l". */
  size: VjOverlaySize;
  /** Default "cream". */
  colorToken: VjColorToken;
  /** Server epoch ms the server hides the overlay; null for no auto-hide. Null while hidden. */
  hideAt: number | null;
}

export interface VjCountdown {
  /** Default false; true needs targetAt in the future. */
  isVisible: boolean;
  /** Server epoch ms the countdown reaches zero; null until set. */
  targetAt: number | null;
  /** Trimmed, 0..40 code points, default "". */
  label: string;
}

export interface VjLogo {
  /** Default false. */
  isVisible: boolean;
  /** Default "bottomRight". */
  corner: VjLogoCorner;
}

export interface VjEventCard {
  /** Default false; true needs the active pack to link an event. */
  isVisible: boolean;
  /** Default "qr". */
  kind: VjEventCardKind;
}

export interface VjEffects {
  /** Default 1. */
  speed: VjSpeed;
  /** Default {}; canonical form in C 3.6. */
  settings: VjEffectSettings;
  /** Default false; the server turns it off 10 s after it went on. */
  isStrobing: boolean;
  /** Default false. */
  isBlackout: boolean;
  /** Server epoch ms the strobe started (its applyAt, or receipt when null); null while off. */
  strobeStartedAt: number | null;
}

export interface VjMix {
  /** Default null. */
  clipId: string | null;
  /** 0 shows only the live source, 1 only the mix clip. Multiple of 0.01. Default 0. */
  amount: number;
  /** Default "normal". */
  blendMode: VjBlendMode;
}

export interface VjTempo {
  /** 60..200, rounded to one decimal place; default 124. */
  bpm: number;
  /** Server epoch ms (integer) of a "1" (the first beat of a bar). */
  downbeatAt: number;
  /** Default "off". */
  quantize: VjQuantize;
  /** Default "manual". */
  source: VjTempoSource;
}

/** v1 VjShuffle.bpm is removed; tempo.bpm replaces it. */
export interface VjShuffle {
  /** Default false. */
  isOn: boolean;
  /** Default "seconds". */
  intervalKind: VjShuffleIntervalKind;
  /** "seconds": integer 2..60. "beats": one of 4, 8, 16, 32. Default 8 (either kind). */
  intervalValue: number;
  /** Default "pack". */
  source: VjShuffleSource;
  /** Clips of the active pack the shuffle skips; at most 200; cleared on a pack change. */
  excludedClipIds: string[];
}

export interface VjScreenOverride {
  /** Exactly one of clipId and generatorId is non-null. */
  clipId: string | null;
  generatorId: VjGeneratorId | null;
  /** Null unless generatorId has variants. */
  generatorVariant: string | null;
}

export interface VjStageState {
  /**
   * Random uuid minted when the server creates this stage in memory. A new
   * value means the backend restarted or the stage was evicted.
   */
  stageEpoch: string;
  /** Starts at 0 for a fresh stage; +1 on every applied change. */
  revision: number;
  /** +1 whenever the live source or activePackId is set (v1 rule, now also for generators). */
  clipSequence: number;
  /** Default null. */
  activePackId: string | null;
  /** Setting one of liveClipId and liveGeneratorId clears the other. Both null shows black. */
  liveClipId: string | null;
  /** Default null. */
  liveGeneratorId: VjGeneratorId | null;
  /** Default null; non-null only for a generator with variants. */
  liveGeneratorVariant: string | null;
  /** Server epoch ms the current live source went live (its applyAt, or receipt); null when nothing is live. */
  liveSince: number | null;
  transition: VjTransition;
  overlay: VjOverlay;
  countdown: VjCountdown;
  logo: VjLogo;
  eventCard: VjEventCard;
  effects: VjEffects;
  mix: VjMix;
  tempo: VjTempo;
  shuffle: VjShuffle;
  /** Last 8 clips that went live, newest first, each id once. In memory only. */
  recentClipIds: string[];
  /** Keyed by screenId; a screen without an entry follows the main look. */
  screenOverrides: Record<string, VjScreenOverride>;
  /** Default null. */
  activeSetlistId: string | null;
  /** Index of the set list item recalled last; null when armed and nothing recalled yet. */
  setlistIndex: number | null;
  /** Server epoch ms of the last applied change (or creation). */
  updatedAt: number;
}

/**
 * What a screen sends on attach to seed a stage the server lost. liveSince,
 * recentClipIds, screenOverrides and clipSequence stay out on purpose (C 7.13).
 */
export type VjStageRestore = Pick<
  VjStageState,
  | "stageEpoch"
  | "revision"
  | "activePackId"
  | "liveClipId"
  | "liveGeneratorId"
  | "liveGeneratorVariant"
  | "transition"
  | "overlay"
  | "countdown"
  | "logo"
  | "eventCard"
  | "effects"
  | "mix"
  | "tempo"
  | "shuffle"
  | "activeSetlistId"
  | "setlistIndex"
>;

// Defaults (C 3.5)

/** Builds the default state for a new stage (backend `createVjStageState`, frontend demo store). */
export function createVjStageState(
  stageEpoch: string,
  now: number,
): VjStageState {
  return {
    stageEpoch,
    revision: 0,
    clipSequence: 0,
    activePackId: null,
    liveClipId: null,
    liveGeneratorId: null,
    liveGeneratorVariant: null,
    liveSince: null,
    transition: {
      mode: "fade",
      length: { unit: "ms", value: VJ_LIMITS.fadeMsDefault },
    },
    overlay: {
      text: "",
      style: "big",
      isVisible: false,
      position: "center",
      size: "l",
      colorToken: "cream",
      hideAt: null,
    },
    countdown: { isVisible: false, targetAt: null, label: "" },
    logo: { isVisible: false, corner: "bottomRight" },
    eventCard: { isVisible: false, kind: "qr" },
    effects: {
      speed: 1,
      settings: {},
      isStrobing: false,
      isBlackout: false,
      strobeStartedAt: null,
    },
    mix: { clipId: null, amount: 0, blendMode: "normal" },
    tempo: {
      bpm: VJ_LIMITS.bpmDefault,
      downbeatAt: now,
      quantize: "off",
      source: "manual",
    },
    shuffle: {
      isOn: false,
      intervalKind: "seconds",
      intervalValue: VJ_LIMITS.shuffleSecondsDefault,
      source: "pack",
      excludedClipIds: [],
    },
    recentClipIds: [],
    screenOverrides: {},
    activeSetlistId: null,
    setlistIndex: null,
    updatedAt: now,
  };
}

// Scene look (C 3.7)

export type VjSceneSource =
  | { kind: "clip"; clipId: string }
  | {
      kind: "generator";
      generatorId: VjGeneratorId;
      generatorVariant: string | null;
    };

export interface VjSceneLook {
  /** Null keeps whatever is live when the scene is recalled. */
  source: VjSceneSource | null;
  effects: { speed: VjSpeed; settings: VjEffectSettings };
  transition: VjTransition;
  overlay: Omit<VjOverlay, "hideAt">;
  mix: VjMix;
}
