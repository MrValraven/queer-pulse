/**
 * Pure mapping from an overlay line (contract 3.4) to how the DOM layer draws
 * it: the CSS module class keys for its style and position, the font size
 * token for its size, and the palette colour for its colour token. The class
 * names are keys of `VjOverlay.module.css`; the components look them up there,
 * so this module stays free of the stylesheet and is tested on its own.
 */
import type {
  VjColorToken,
  VjOverlay,
  VjOverlayPosition,
  VjOverlaySize,
  VjOverlayStyle,
} from "../../../../shared/contracts/vj";

/** Show, hide and a new line fade over 0.4 s (v1 timing). */
export const VJ_OVERLAY_FADE_SECONDS = 0.4;

const STYLE_CLASS_KEYS: Readonly<Record<VjOverlayStyle, string>> = {
  big: "styleBig",
  ticker: "styleTicker",
  neon: "styleNeon",
  outline: "styleOutline",
  typewriter: "styleTypewriter",
  glitch: "styleGlitch",
  stacked: "styleStacked",
  slanted: "styleSlanted",
};

const POSITION_CLASS_KEYS: Readonly<Record<VjOverlayPosition, string>> = {
  top: "positionTop",
  center: "positionCenter",
  bottom: "positionBottom",
};

/** Every style but the ticker: the overlay ladder, l being the v1 big line. */
const LINE_SIZE_TOKENS: Readonly<Record<VjOverlaySize, string>> = {
  s: "--text-screen-overlay-s",
  m: "--text-screen-overlay-m",
  l: "--text-screen-overlay-l",
  xl: "--text-screen-overlay-xl",
};

/**
 * The ticker crawls along an edge, so it sits one ladder lower: l is the v1
 * ticker size, so a v1 ticker upgraded to size l looks as it always did.
 */
const TICKER_SIZE_TOKENS: Readonly<Record<VjOverlaySize, string>> = {
  s: "--text-screen-label",
  m: "--text-screen-answer",
  l: "--text-screen-question",
  xl: "--text-screen-overlay-m",
};

/**
 * The remote's mirror has no viewport of its own: the same ladders as a share
 * of the mirror's height (cqh of the overlay layer, a size container), close
 * to what each token reads at 1080p.
 */
const LINE_MIRROR_HEIGHT_SHARES: Readonly<Record<VjOverlaySize, number>> = {
  s: 5,
  m: 8,
  l: 12,
  xl: 18,
};

const TICKER_MIRROR_HEIGHT_SHARES: Readonly<Record<VjOverlaySize, number>> = {
  s: 3,
  m: 4,
  l: 6,
  xl: 8,
};

export interface VjOverlayClasses {
  /** Key of the style class in VjOverlay.module.css. */
  styleClass: string;
  /** Key of the position class in VjOverlay.module.css. */
  positionClass: string;
  /** Name of the font size token, for `var(...)`. */
  sizeToken: string;
  /** A CSS colour reading the palette token, for example `rgb(var(--vj-palette-cream))`. */
  colorValue: string;
}

/** The palette token of a colour name, as a channel triple variable. */
export function vjPaletteVariableOf(colorToken: VjColorToken): string {
  return `var(--vj-palette-${colorToken})`;
}

export function vjOverlayClassesOf(overlay: VjOverlay): VjOverlayClasses {
  const sizeTokens =
    overlay.style === "ticker" ? TICKER_SIZE_TOKENS : LINE_SIZE_TOKENS;
  return {
    styleClass: STYLE_CLASS_KEYS[overlay.style],
    positionClass: POSITION_CLASS_KEYS[overlay.position],
    sizeToken: sizeTokens[overlay.size],
    colorValue: `rgb(${vjPaletteVariableOf(overlay.colorToken)})`,
  };
}

/** The line's font size on the mirror, in cqh of the overlay layer. */
export function vjOverlayMirrorFontSizeOf(overlay: VjOverlay): string {
  const shares =
    overlay.style === "ticker"
      ? TICKER_MIRROR_HEIGHT_SHARES
      : LINE_MIRROR_HEIGHT_SHARES;
  return `${shares[overlay.size]}cqh`;
}
