/**
 * The DOM fallback for the effect catalog (contract 3.2, "DOM fallback"
 * column): the CSS filter and transform of the picture, the colour, line and
 * edge layers drawn over it, the mask shape, and the beat-driven pose that
 * useVjDomBeat writes as custom properties every frame.
 *
 * Only entries the catalog marks `isDomCapable` draw here; every other effect
 * is the WebGL engine's alone. Nothing here assumes a full-screen box: sizes
 * are percentages or `cqh` (the effects frame is a size container), so the
 * remote's miniature mirror draws the same look as the projector.
 *
 * Playback rate rules live in live/vjEffectsStyle.ts (shared plan).
 */
import {
  VJ_COLOR_TOKENS,
  VJ_EFFECT_CATALOG,
  type VjColorToken,
  type VjEffectId,
  type VjEffectSetting,
  type VjEffectSettings,
} from "../../../shared/contracts/vj";
import { vjPaletteToken } from "../engine/vjPalette";

export type VjDomMirror = "horizontal" | "vertical";
export type VjDomMaskShape = "circle" | "heart" | "star";

export interface VjDomLayers {
  tint: VjColorToken | null;
  tintAmount: number;
  scanlines: number;
  vignette: number;
  mirror: VjDomMirror | null;
  mask: { shape: VjDomMaskShape; amount: number } | null;
}

/** The custom properties useVjDomBeat writes on the effects frame. */
export const VJ_DOM_BEAT_PROPERTIES = [
  "--vj-dom-hue",
  "--vj-dom-brightness",
  "--vj-dom-zoom",
  "--vj-dom-rotate",
  "--vj-dom-kenburns",
  "--vj-dom-invert",
] as const;

/** Mask size at amount 0 and 1, as a share of the frame height (contract 3.2). */
const VJ_MASK_MIN_HEIGHT = 0.3;
const VJ_MASK_MAX_HEIGHT = 1;
/** dream: blur up to 2% of the height (contract 3.2). */
const VJ_DREAM_BLUR_CQH = 2;

/** The setting of an effect that is on and that the DOM fallback can draw; null otherwise. */
export function vjDomSettingOf(
  settings: VjEffectSettings,
  effectId: VjEffectId,
): VjEffectSetting | null {
  const setting = settings[effectId];
  if (setting === undefined || !setting.isOn) return null;
  if (!VJ_EFFECT_CATALOG[effectId].isDomCapable) return null;
  return setting;
}

/** The amount of a DOM-drawn effect, clamped to 0..1; 0 when it is off or not DOM-capable. */
export function vjDomAmountOf(
  settings: VjEffectSettings,
  effectId: VjEffectId,
): number {
  const setting = vjDomSettingOf(settings, effectId);
  if (setting === null || !Number.isFinite(setting.amount)) return 0;
  return Math.min(1, Math.max(0, setting.amount));
}

/** Three decimals, so amounts on the 0.01 grid print without float noise. */
export function formatVjCssNumber(value: number): string {
  const rounded = Math.round(value * 1000) / 1000;
  return String(Object.is(rounded, -0) ? 0 : rounded);
}

/** The invert level when no beat clock drives it: the steady variant at its amount, the beat variant at rest. */
export function vjDomRestingInvert(settings: VjEffectSettings): number {
  const setting = vjDomSettingOf(settings, "invert");
  if (setting === null || setting.variant === "beat") return 0;
  return vjDomAmountOf(settings, "invert");
}

/**
 * The picture's CSS filter. `shouldHoldInvert` keeps the invert term after
 * invert switches off, so a governed switch-off can ramp down through
 * `--vj-dom-invert` (written by useVjDomBeat) before it disappears.
 */
export function vjDomFilter(
  settings: VjEffectSettings,
  options: { shouldHoldInvert?: boolean } = {},
): string {
  const parts: string[] = [];
  const monochrome = vjDomSettingOf(settings, "monochrome");
  if (monochrome !== null) {
    parts.push(
      `grayscale(${formatVjCssNumber(vjDomAmountOf(settings, "monochrome"))})`,
    );
  }
  if (
    vjDomSettingOf(settings, "invert") !== null ||
    options.shouldHoldInvert === true
  ) {
    const restingInvert = formatVjCssNumber(vjDomRestingInvert(settings));
    parts.push(`invert(var(--vj-dom-invert, ${restingInvert}))`);
  }
  if (vjDomSettingOf(settings, "saturate") !== null) {
    const saturation = 1 + 2 * vjDomAmountOf(settings, "saturate");
    parts.push(`saturate(${formatVjCssNumber(saturation)})`);
  }
  if (vjDomSettingOf(settings, "contrast") !== null) {
    const contrast = 1 + 1.5 * vjDomAmountOf(settings, "contrast");
    parts.push(`contrast(${formatVjCssNumber(contrast)})`);
  }
  // duotone maps the picture's luma, so its layers need the grey picture.
  if (vjDomSettingOf(settings, "duotone") !== null) {
    parts.push(
      `grayscale(${formatVjCssNumber(vjDomAmountOf(settings, "duotone"))})`,
    );
  }
  const isHueShifted = vjDomSettingOf(settings, "hueShift") !== null;
  if (isHueShifted || vjDomSettingOf(settings, "hueCycle") !== null) {
    const shiftDegrees = isHueShifted
      ? 360 * vjDomAmountOf(settings, "hueShift")
      : 0;
    parts.push(
      `hue-rotate(calc(${formatVjCssNumber(shiftDegrees)}deg + var(--vj-dom-hue, 0deg)))`,
    );
  }
  if (vjDomSettingOf(settings, "dream") !== null) {
    const blurCqh = VJ_DREAM_BLUR_CQH * vjDomAmountOf(settings, "dream");
    parts.push(`blur(${formatVjCssNumber(blurCqh)}cqh)`);
  }
  if (vjDomSettingOf(settings, "beatPulse") !== null) {
    parts.push("brightness(var(--vj-dom-brightness, 1))");
  }
  return parts.length > 0 ? parts.join(" ") : "none";
}

/** The picture's transform; every moving part comes from a custom property useVjDomBeat writes. */
export function vjDomTransform(settings: VjEffectSettings): string {
  const parts: string[] = [];
  if (vjDomSettingOf(settings, "kenBurns") !== null) {
    parts.push("var(--vj-dom-kenburns, scale(1))");
  }
  if (vjDomSettingOf(settings, "rotate") !== null) {
    parts.push("rotate(var(--vj-dom-rotate, 0deg))");
  }
  if (vjDomSettingOf(settings, "zoomPulse") !== null) {
    parts.push("scale(var(--vj-dom-zoom, 1))");
  }
  return parts.length > 0 ? parts.join(" ") : "none";
}

function asColorToken(variant: string | null): VjColorToken {
  const match = VJ_COLOR_TOKENS.find((colorToken) => colorToken === variant);
  return match ?? "coral";
}

function asMaskShape(variant: string | null): VjDomMaskShape {
  return variant === "heart" || variant === "star" ? variant : "circle";
}

/** The layers drawn over the picture. A `quad` mirror draws as `horizontal` (contract 3.2). */
export function vjDomLayersOf(settings: VjEffectSettings): VjDomLayers {
  const tint = vjDomSettingOf(settings, "tint");
  const mirror = vjDomSettingOf(settings, "mirror");
  const mask = vjDomSettingOf(settings, "mask");
  return {
    tint: tint === null ? null : asColorToken(tint.variant),
    tintAmount: vjDomAmountOf(settings, "tint"),
    scanlines: vjDomAmountOf(settings, "scanlines"),
    vignette: vjDomAmountOf(settings, "vignette"),
    mirror:
      mirror === null
        ? null
        : mirror.variant === "vertical"
          ? "vertical"
          : "horizontal",
    mask:
      mask === null
        ? null
        : {
            shape: asMaskShape(mask.variant),
            amount: vjDomAmountOf(settings, "mask"),
          },
  };
}

/** The duotone's two palette colours and its amount, for the DOM layers. */
export interface VjDomDuotone {
  /** Where the picture's luma is 0. */
  shadow: VjColorToken;
  /** Where the picture's luma is 1. */
  highlight: VjColorToken;
  amount: number;
}

/**
 * The duotone the DOM draws, or null when it is off or the catalog keeps it
 * on the WebGL engine. The variant names the shadow colour, then the
 * highlight ("plum-coral"); an unknown half falls back to the default pair.
 */
export function vjDomDuotoneOf(
  settings: VjEffectSettings,
): VjDomDuotone | null {
  const duotone = vjDomSettingOf(settings, "duotone");
  if (duotone === null) return null;
  const [shadowName, highlightName] = (duotone.variant ?? "").split("-");
  const shadow = VJ_COLOR_TOKENS.find(
    (colorToken) => colorToken === shadowName,
  );
  const highlight = VJ_COLOR_TOKENS.find(
    (colorToken) => colorToken === highlightName,
  );
  return {
    shadow: shadow ?? "plum",
    highlight: highlight ?? "coral",
    amount: vjDomAmountOf(settings, "duotone"),
  };
}

/** The tint layer's `--vj-dom-tint` value: the variant's palette token, which the CSS wraps in rgb(). */
export function vjDomTintColour(colorToken: VjColorToken): string {
  return `var(${vjPaletteToken(colorToken)})`;
}

/** Unit shape points: centred on 0, one unit tall, y down. */
type VjUnitPoints = readonly (readonly [number, number])[];

function starUnitPoints(): VjUnitPoints {
  const outerRadius = 0.5;
  // The inner radius of a regular five-point star.
  const innerRadius = outerRadius * 0.381966;
  return Array.from({ length: 10 }, (_unused, pointIndex) => {
    const radius = pointIndex % 2 === 0 ? outerRadius : innerRadius;
    const angle = -Math.PI / 2 + (pointIndex * Math.PI) / 5;
    return [radius * Math.cos(angle), radius * Math.sin(angle)] as const;
  });
}

function heartUnitPoints(): VjUnitPoints {
  const pointCount = 48;
  const rawPoints = Array.from(
    { length: pointCount },
    (_unused, pointIndex) => {
      const angle = (pointIndex / pointCount) * 2 * Math.PI;
      const horizontal = 16 * Math.sin(angle) ** 3;
      const vertical = -(
        13 * Math.cos(angle) -
        5 * Math.cos(2 * angle) -
        2 * Math.cos(3 * angle) -
        Math.cos(4 * angle)
      );
      return [horizontal, vertical] as const;
    },
  );
  const verticals = rawPoints.map(([, vertical]) => vertical);
  const top = Math.min(...verticals);
  const bottom = Math.max(...verticals);
  const height = bottom - top;
  const middle = (top + bottom) / 2;
  return rawPoints.map(
    ([horizontal, vertical]) =>
      [horizontal / height, (vertical - middle) / height] as const,
  );
}

const VJ_STAR_POINTS = starUnitPoints();
const VJ_HEART_POINTS = heartUnitPoints();

function offsetFromCentre(unitOffset: number, heightCqh: number): string {
  const offsetCqh = unitOffset * heightCqh;
  const sign = offsetCqh < 0 ? "-" : "+";
  return `calc(50% ${sign} ${formatVjCssNumber(Math.abs(offsetCqh))}cqh)`;
}

/**
 * The mask's `clip-path`: the shape is 30% to 100% of the frame height,
 * centred, in `cqh` so a circle stays round and a star stays regular in any
 * box.
 */
export function vjDomMaskClipPath(mask: {
  shape: VjDomMaskShape;
  amount: number;
}): string {
  const amount = Number.isFinite(mask.amount)
    ? Math.min(1, Math.max(0, mask.amount))
    : 0;
  const heightCqh =
    100 *
    (VJ_MASK_MIN_HEIGHT + (VJ_MASK_MAX_HEIGHT - VJ_MASK_MIN_HEIGHT) * amount);
  if (mask.shape === "circle") {
    return `circle(${formatVjCssNumber(heightCqh / 2)}cqh at 50% 50%)`;
  }
  const points = mask.shape === "star" ? VJ_STAR_POINTS : VJ_HEART_POINTS;
  const corners = points.map(
    ([horizontal, vertical]) =>
      `${offsetFromCentre(horizontal, heightCqh)} ${offsetFromCentre(vertical, heightCqh)}`,
  );
  return `polygon(${corners.join(", ")})`;
}

/** The beat-driven values of one frame. Mutable: the frame loop refills one object. */
export interface VjDomBeatPose {
  hueDegrees: number;
  rotateDegrees: number;
  zoom: number;
  kenBurnsScale: number;
  /** Pan as a percentage of the picture, kept inside the zoom margin. */
  kenBurnsX: number;
  kenBurnsY: number;
  /** beatPulse brightness before the flash governor. */
  pulseGain: number;
}

export function createVjDomBeatPose(): VjDomBeatPose {
  return {
    hueDegrees: 0,
    rotateDegrees: 0,
    zoom: 1,
    kenBurnsScale: 1,
    kenBurnsX: 0,
    kenBurnsY: 0,
    pulseGain: 1,
  };
}

/** Beats of one kenBurns zoom in (contract 3.2: over 16 beats); it eases back out over the next 16. */
const VJ_KEN_BURNS_BEATS = 16;
/** One slow pan circle. */
const VJ_KEN_BURNS_PAN_BEATS = 64;
/** The share of the zoom margin the pan may use, so no edge ever shows. */
const VJ_KEN_BURNS_PAN_SHARE = 0.9;

function wrapDegrees(degrees: number): number {
  return ((degrees % 360) + 360) % 360;
}

/**
 * Fills `pose` for `beats` (whole and fractional beats since the tempo's
 * downbeat) and `phase` (0..1 inside the current beat), per contract 3.2:
 * hueCycle turns `amount * 90` degrees per beat, rotate `amount * 2` turns
 * per 16 beats, kenBurns zooms to `1 + 0.3 * amount` over 16 beats with a
 * slow pan, zoomPulse and beatPulse bump on each beat and decay through it.
 * Effects that are off leave their value at rest. Allocates nothing.
 */
export function fillVjDomBeatPose(
  pose: VjDomBeatPose,
  settings: VjEffectSettings,
  beats: number,
  phase: number,
): void {
  const decay = (1 - Math.min(1, Math.max(0, phase))) ** 2;
  pose.hueDegrees = wrapDegrees(
    90 * vjDomAmountOf(settings, "hueCycle") * beats,
  );
  pose.rotateDegrees = wrapDegrees(
    (2 * 360 * vjDomAmountOf(settings, "rotate") * beats) / 16,
  );
  pose.zoom = 1 + 0.15 * vjDomAmountOf(settings, "zoomPulse") * decay;
  pose.pulseGain = 1 + 0.5 * vjDomAmountOf(settings, "beatPulse") * decay;

  const kenBurnsAmount = vjDomAmountOf(settings, "kenBurns");
  const zoomProgress =
    (1 - Math.cos((Math.PI * beats) / VJ_KEN_BURNS_BEATS)) / 2;
  const kenBurnsScale = 1 + 0.3 * kenBurnsAmount * zoomProgress;
  const panMargin =
    ((kenBurnsScale - 1) / (2 * kenBurnsScale)) * 100 * VJ_KEN_BURNS_PAN_SHARE;
  const panAngle = (2 * Math.PI * beats) / VJ_KEN_BURNS_PAN_BEATS;
  pose.kenBurnsScale = kenBurnsScale;
  pose.kenBurnsX = panMargin * Math.cos(panAngle);
  pose.kenBurnsY = panMargin * Math.sin(panAngle);
}
