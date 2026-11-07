/**
 * VJ wire contract (C 3), frontend mirror of
 * `queerpulse-backend/src/vj/vj.contract.ts` and `vj-response.ts`. Names and
 * values match it; edit both together.
 *
 * The effects catalog (C 3.2) and the generator and transition catalogs (C 3.3).
 */

import {
  VJ_COLOR_TOKENS,
  VJ_DUOTONE_PAIRS,
  VJ_PRIDE_FLAGS,
  type VjTransitionId,
} from "./vj.lists";

/** The effect groups of the catalog (C 3.2). */
export const VJ_EFFECT_GROUPS = [
  "color",
  "texture",
  "geometry",
  "time",
  "beat",
] as const;
export type VjEffectGroup = (typeof VJ_EFFECT_GROUPS)[number];

/** Catalog order (C 3.2). Settings objects keep their keys in this order (C 3.6). */
export const VJ_EFFECT_IDS = [
  "monochrome",
  "invert",
  "saturate",
  "contrast",
  "tint",
  "duotone",
  "prideGrade",
  "thermal",
  "hueCycle",
  "hueShift",
  "vhs",
  "filmGrain",
  "scanlines",
  "crt",
  "rgbSplit",
  "pixelate",
  "halftone",
  "glitch",
  "dream",
  "vignette",
  "lightLeaks",
  "mirror",
  "kaleidoscope",
  "tile",
  "kenBurns",
  "rotate",
  "zoomPulse",
  "mask",
  "freeze",
  "reverse",
  "pingPong",
  "stutter",
  "echo",
  "beatPulse",
] as const;
export type VjEffectId = (typeof VJ_EFFECT_IDS)[number];

/** One effect's fixed description in the catalog. */
export interface VjEffectCatalogEntry {
  group: VjEffectGroup;
  /** Allowed variant values; empty when the effect has none. */
  variants: readonly string[];
  /** The first variant, or null when there are none. */
  defaultVariant: string | null;
  /** 0..1, a multiple of 0.01. */
  defaultAmount: number;
  /** False hides the amount control; the amount stays at defaultAmount. */
  isAmountAdjustable: boolean;
  /** Turning one on turns the others in the same group off. */
  exclusiveGroup: "playhead" | null;
  /** Its brightness changes draw from the flash governor (design 5). */
  isFlashCapable: boolean;
  /** The DOM fallback renderer can draw it. */
  isDomCapable: boolean;
  /** It follows tempo phase (for invert and rgbSplit, in the "beat" variant only). */
  isBeatSynced: boolean;
  /** It follows the local mic level when that screen has the mic on. */
  isAudioReactive: boolean;
}

/** One effect's setting on the stage. */
export interface VjEffectSetting {
  isOn: boolean;
  /** 0..1, a multiple of 0.01. */
  amount: number;
  /** One of the entry's variants; null exactly when the entry has none. */
  variant: string | null;
}
export type VjEffectSettings = Partial<Record<VjEffectId, VjEffectSetting>>;

/** Every effect a screen can draw, in catalog order (C 3.2). */
export const VJ_EFFECT_CATALOG: Readonly<
  Record<VjEffectId, VjEffectCatalogEntry>
> = {
  monochrome: {
    group: "color",
    variants: [],
    defaultVariant: null,
    defaultAmount: 1,
    isAmountAdjustable: true,
    exclusiveGroup: null,
    isFlashCapable: false,
    isDomCapable: true,
    isBeatSynced: false,
    isAudioReactive: false,
  },
  invert: {
    group: "color",
    variants: ["steady", "beat"],
    defaultVariant: "steady",
    defaultAmount: 1,
    isAmountAdjustable: true,
    exclusiveGroup: null,
    isFlashCapable: true,
    isDomCapable: true,
    isBeatSynced: true,
    isAudioReactive: false,
  },
  saturate: {
    group: "color",
    variants: [],
    defaultVariant: null,
    defaultAmount: 0.5,
    isAmountAdjustable: true,
    exclusiveGroup: null,
    isFlashCapable: false,
    isDomCapable: true,
    isBeatSynced: false,
    isAudioReactive: false,
  },
  contrast: {
    group: "color",
    variants: [],
    defaultVariant: null,
    defaultAmount: 0.5,
    isAmountAdjustable: true,
    exclusiveGroup: null,
    isFlashCapable: false,
    isDomCapable: true,
    isBeatSynced: false,
    isAudioReactive: false,
  },
  tint: {
    group: "color",
    variants: VJ_COLOR_TOKENS,
    defaultVariant: "coral",
    defaultAmount: 0.5,
    isAmountAdjustable: true,
    exclusiveGroup: null,
    isFlashCapable: false,
    isDomCapable: true,
    isBeatSynced: false,
    isAudioReactive: false,
  },
  duotone: {
    group: "color",
    variants: VJ_DUOTONE_PAIRS,
    defaultVariant: "plum-coral",
    defaultAmount: 1,
    isAmountAdjustable: true,
    exclusiveGroup: null,
    isFlashCapable: false,
    isDomCapable: true,
    isBeatSynced: false,
    isAudioReactive: false,
  },
  prideGrade: {
    group: "color",
    variants: VJ_PRIDE_FLAGS,
    defaultVariant: "rainbow",
    defaultAmount: 0.6,
    isAmountAdjustable: true,
    exclusiveGroup: null,
    isFlashCapable: false,
    isDomCapable: false,
    isBeatSynced: false,
    isAudioReactive: false,
  },
  thermal: {
    group: "color",
    variants: [],
    defaultVariant: null,
    defaultAmount: 1,
    isAmountAdjustable: true,
    exclusiveGroup: null,
    isFlashCapable: false,
    isDomCapable: false,
    isBeatSynced: false,
    isAudioReactive: false,
  },
  hueCycle: {
    group: "color",
    variants: [],
    defaultVariant: null,
    defaultAmount: 0.5,
    isAmountAdjustable: true,
    exclusiveGroup: null,
    isFlashCapable: false,
    isDomCapable: true,
    isBeatSynced: false,
    isAudioReactive: false,
  },
  hueShift: {
    group: "color",
    variants: [],
    defaultVariant: null,
    defaultAmount: 0.5,
    isAmountAdjustable: true,
    exclusiveGroup: null,
    isFlashCapable: false,
    isDomCapable: true,
    isBeatSynced: false,
    isAudioReactive: false,
  },
  vhs: {
    group: "texture",
    variants: [],
    defaultVariant: null,
    defaultAmount: 0.6,
    isAmountAdjustable: true,
    exclusiveGroup: null,
    isFlashCapable: false,
    isDomCapable: false,
    isBeatSynced: false,
    isAudioReactive: false,
  },
  filmGrain: {
    group: "texture",
    variants: [],
    defaultVariant: null,
    defaultAmount: 0.4,
    isAmountAdjustable: true,
    exclusiveGroup: null,
    isFlashCapable: false,
    isDomCapable: false,
    isBeatSynced: false,
    isAudioReactive: false,
  },
  scanlines: {
    group: "texture",
    variants: [],
    defaultVariant: null,
    defaultAmount: 0.5,
    isAmountAdjustable: true,
    exclusiveGroup: null,
    isFlashCapable: false,
    isDomCapable: true,
    isBeatSynced: false,
    isAudioReactive: false,
  },
  crt: {
    group: "texture",
    variants: [],
    defaultVariant: null,
    defaultAmount: 0.6,
    isAmountAdjustable: true,
    exclusiveGroup: null,
    isFlashCapable: false,
    isDomCapable: false,
    isBeatSynced: false,
    isAudioReactive: false,
  },
  rgbSplit: {
    group: "texture",
    variants: ["steady", "beat"],
    defaultVariant: "steady",
    defaultAmount: 0.4,
    isAmountAdjustable: true,
    exclusiveGroup: null,
    isFlashCapable: false,
    isDomCapable: false,
    isBeatSynced: true,
    isAudioReactive: true,
  },
  pixelate: {
    group: "texture",
    variants: [],
    defaultVariant: null,
    defaultAmount: 0.5,
    isAmountAdjustable: true,
    exclusiveGroup: null,
    isFlashCapable: false,
    isDomCapable: false,
    isBeatSynced: false,
    isAudioReactive: false,
  },
  halftone: {
    group: "texture",
    variants: [],
    defaultVariant: null,
    defaultAmount: 0.5,
    isAmountAdjustable: true,
    exclusiveGroup: null,
    isFlashCapable: false,
    isDomCapable: false,
    isBeatSynced: false,
    isAudioReactive: false,
  },
  glitch: {
    group: "texture",
    variants: [],
    defaultVariant: null,
    defaultAmount: 0.4,
    isAmountAdjustable: true,
    exclusiveGroup: null,
    isFlashCapable: true,
    isDomCapable: false,
    isBeatSynced: true,
    isAudioReactive: true,
  },
  dream: {
    group: "texture",
    variants: [],
    defaultVariant: null,
    defaultAmount: 0.5,
    isAmountAdjustable: true,
    exclusiveGroup: null,
    isFlashCapable: false,
    isDomCapable: true,
    isBeatSynced: false,
    isAudioReactive: false,
  },
  vignette: {
    group: "texture",
    variants: [],
    defaultVariant: null,
    defaultAmount: 0.5,
    isAmountAdjustable: true,
    exclusiveGroup: null,
    isFlashCapable: false,
    isDomCapable: true,
    isBeatSynced: false,
    isAudioReactive: false,
  },
  lightLeaks: {
    group: "texture",
    variants: [],
    defaultVariant: null,
    defaultAmount: 0.5,
    isAmountAdjustable: true,
    exclusiveGroup: null,
    isFlashCapable: false,
    isDomCapable: false,
    isBeatSynced: false,
    isAudioReactive: false,
  },
  mirror: {
    group: "geometry",
    variants: ["horizontal", "vertical", "quad"],
    defaultVariant: "horizontal",
    defaultAmount: 1,
    isAmountAdjustable: false,
    exclusiveGroup: null,
    isFlashCapable: false,
    isDomCapable: true,
    isBeatSynced: false,
    isAudioReactive: false,
  },
  kaleidoscope: {
    group: "geometry",
    variants: ["2", "4", "6", "8"],
    defaultVariant: "6",
    defaultAmount: 0.5,
    isAmountAdjustable: true,
    exclusiveGroup: null,
    isFlashCapable: false,
    isDomCapable: false,
    isBeatSynced: false,
    isAudioReactive: false,
  },
  tile: {
    group: "geometry",
    variants: ["2x2", "3x3"],
    defaultVariant: "2x2",
    defaultAmount: 1,
    isAmountAdjustable: false,
    exclusiveGroup: null,
    isFlashCapable: false,
    isDomCapable: false,
    isBeatSynced: false,
    isAudioReactive: false,
  },
  kenBurns: {
    group: "geometry",
    variants: [],
    defaultVariant: null,
    defaultAmount: 0.5,
    isAmountAdjustable: true,
    exclusiveGroup: null,
    isFlashCapable: false,
    isDomCapable: true,
    isBeatSynced: false,
    isAudioReactive: false,
  },
  rotate: {
    group: "geometry",
    variants: [],
    defaultVariant: null,
    defaultAmount: 0.25,
    isAmountAdjustable: true,
    exclusiveGroup: null,
    isFlashCapable: false,
    isDomCapable: true,
    isBeatSynced: false,
    isAudioReactive: false,
  },
  zoomPulse: {
    group: "geometry",
    variants: [],
    defaultVariant: null,
    defaultAmount: 0.5,
    isAmountAdjustable: true,
    exclusiveGroup: null,
    isFlashCapable: false,
    isDomCapable: true,
    isBeatSynced: true,
    isAudioReactive: true,
  },
  mask: {
    group: "geometry",
    variants: ["circle", "heart", "star"],
    defaultVariant: "circle",
    defaultAmount: 0.8,
    isAmountAdjustable: true,
    exclusiveGroup: null,
    isFlashCapable: false,
    isDomCapable: true,
    isBeatSynced: false,
    isAudioReactive: false,
  },
  freeze: {
    group: "time",
    variants: [],
    defaultVariant: null,
    defaultAmount: 1,
    isAmountAdjustable: false,
    exclusiveGroup: "playhead",
    isFlashCapable: false,
    isDomCapable: true,
    isBeatSynced: false,
    isAudioReactive: false,
  },
  reverse: {
    group: "time",
    variants: [],
    defaultVariant: null,
    defaultAmount: 1,
    isAmountAdjustable: false,
    exclusiveGroup: "playhead",
    isFlashCapable: false,
    isDomCapable: false,
    isBeatSynced: false,
    isAudioReactive: false,
  },
  pingPong: {
    group: "time",
    variants: [],
    defaultVariant: null,
    defaultAmount: 1,
    isAmountAdjustable: false,
    exclusiveGroup: "playhead",
    isFlashCapable: false,
    isDomCapable: false,
    isBeatSynced: false,
    isAudioReactive: false,
  },
  stutter: {
    group: "time",
    variants: [],
    defaultVariant: null,
    defaultAmount: 0.5,
    isAmountAdjustable: true,
    exclusiveGroup: null,
    isFlashCapable: false,
    isDomCapable: false,
    isBeatSynced: true,
    isAudioReactive: false,
  },
  echo: {
    group: "time",
    variants: [],
    defaultVariant: null,
    defaultAmount: 0.5,
    isAmountAdjustable: true,
    exclusiveGroup: null,
    isFlashCapable: false,
    isDomCapable: false,
    isBeatSynced: false,
    isAudioReactive: false,
  },
  beatPulse: {
    group: "beat",
    variants: [],
    defaultVariant: null,
    defaultAmount: 0.5,
    isAmountAdjustable: true,
    exclusiveGroup: null,
    isFlashCapable: true,
    isDomCapable: true,
    isBeatSynced: true,
    isAudioReactive: true,
  },
};

/** Sources a screen draws without a clip (C 3.3). */
export const VJ_GENERATOR_IDS = [
  "gradientField",
  "plasma",
  "starfield",
  "prideFlagWave",
  "tunnel",
] as const;
export type VjGeneratorId = (typeof VJ_GENERATOR_IDS)[number];

/** One generator's fixed description in the catalog. */
export interface VjGeneratorCatalogEntry {
  variants: readonly string[];
  defaultVariant: string | null;
  /** The DOM fallback can draw it; any other generator draws as gradientField there. */
  isDomCapable: boolean;
  isBeatSynced: boolean;
}

/** Every generator a screen can draw (C 3.3). */
export const VJ_GENERATOR_CATALOG: Readonly<
  Record<VjGeneratorId, VjGeneratorCatalogEntry>
> = {
  gradientField: {
    variants: [],
    defaultVariant: null,
    isDomCapable: true,
    isBeatSynced: false,
  },
  plasma: {
    variants: [],
    defaultVariant: null,
    isDomCapable: false,
    isBeatSynced: false,
  },
  starfield: {
    variants: [],
    defaultVariant: null,
    isDomCapable: false,
    isBeatSynced: true,
  },
  prideFlagWave: {
    variants: VJ_PRIDE_FLAGS,
    defaultVariant: "rainbow",
    isDomCapable: true,
    isBeatSynced: true,
  },
  tunnel: {
    variants: [],
    defaultVariant: null,
    isDomCapable: false,
    isBeatSynced: true,
  },
};

/** One transition's fixed description in the catalog. */
export interface VjTransitionCatalogEntry {
  isFlashCapable: boolean;
  /** The DOM fallback can draw it; any other transition draws as fade there. */
  isDomCapable: boolean;
}

/** Every transition a screen can draw (C 3.3). */
export const VJ_TRANSITION_CATALOG: Readonly<
  Record<VjTransitionId, VjTransitionCatalogEntry>
> = {
  fade: { isFlashCapable: false, isDomCapable: true },
  cut: { isFlashCapable: false, isDomCapable: true },
  dipBlack: { isFlashCapable: false, isDomCapable: true },
  dipWhite: { isFlashCapable: true, isDomCapable: true },
  wipeLeft: { isFlashCapable: false, isDomCapable: true },
  wipeRight: { isFlashCapable: false, isDomCapable: true },
  wipeRadial: { isFlashCapable: false, isDomCapable: true },
  iris: { isFlashCapable: false, isDomCapable: true },
  zoomBlur: { isFlashCapable: false, isDomCapable: false },
  glitch: { isFlashCapable: true, isDomCapable: false },
  lumaFade: { isFlashCapable: false, isDomCapable: false },
};
