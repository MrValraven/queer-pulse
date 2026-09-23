import { flagColorShares } from "../../stickers/templates/flagArt";
import { sortFlagIds } from "./stickerFlags";

/**
 * Below this ratio the frame colour and a stripe blur together where the oval
 * crosses that stripe. Far under the 3:1 WCAG floor for UI parts on purpose:
 * the oval is a thick artwork stroke, so only a near-match makes it vanish,
 * and a stricter bar would warn on almost every flag.
 */
export const MIN_STRIPE_CONTRAST = 1.5;

/** Share of a flag's area the faded colours must cover before the oval reads as lost: 40% keeps one thin white band quiet and still flags a flag that is mostly pale. */
export const MIN_FADED_FLAG_SHARE = 0.4;

/** Relative-luminance cut-offs the warning copy uses to call a colour light
 *  or dark; anything between reads as a mid tone. */
const LIGHT_LUMINANCE_FLOOR = 0.5;
const DARK_LUMINANCE_CEILING = 0.1;

export type ColorTone = "light" | "mid" | "dark";

const SHORT_HEX_PATTERN = /^#?([0-9a-f])([0-9a-f])([0-9a-f])$/i;
const LONG_HEX_PATTERN = /^#?[0-9a-f]{6}$/i;

/**
 * `#rgb`, `#rrggbb` (the `#` optional, surrounding spaces ignored) as the
 * lowercase `#rrggbb` the template stores, or null when the text is not a hex
 * colour.
 */
export function normalizeHexColor(input: string): string | null {
  const trimmed = input.trim();
  const shortMatch = SHORT_HEX_PATTERN.exec(trimmed);
  if (shortMatch) {
    const [, red, green, blue] = shortMatch;
    return `#${red}${red}${green}${green}${blue}${blue}`.toLowerCase();
  }
  if (LONG_HEX_PATTERN.test(trimmed)) {
    return `#${trimmed.replace("#", "")}`.toLowerCase();
  }
  return null;
}

/** One sRGB channel (0..255) linearised per WCAG 2.x. */
function linearChannel(channel: number): number {
  const scaled = channel / 255;
  return scaled <= 0.03928
    ? scaled / 12.92
    : Math.pow((scaled + 0.055) / 1.055, 2.4);
}

/** WCAG relative luminance of a hex colour, 0 (black) to 1 (white). An
 *  unreadable colour counts as black. */
export function relativeLuminance(hexColor: string): number {
  const normalized = normalizeHexColor(hexColor);
  if (normalized === null) return 0;
  const red = parseInt(normalized.slice(1, 3), 16);
  const green = parseInt(normalized.slice(3, 5), 16);
  const blue = parseInt(normalized.slice(5, 7), 16);
  return (
    0.2126 * linearChannel(red) +
    0.7152 * linearChannel(green) +
    0.0722 * linearChannel(blue)
  );
}

/** WCAG contrast ratio between two hex colours, 1 (identical) to 21. */
export function contrastRatio(firstColor: string, secondColor: string): number {
  const firstLuminance = relativeLuminance(firstColor);
  const secondLuminance = relativeLuminance(secondColor);
  const lighter = Math.max(firstLuminance, secondLuminance);
  const darker = Math.min(firstLuminance, secondLuminance);
  return (lighter + 0.05) / (darker + 0.05);
}

/** Whether a colour reads as light, dark, or a mid tone. */
export function colorToneOf(hexColor: string): ColorTone {
  const luminance = relativeLuminance(hexColor);
  if (luminance >= LIGHT_LUMINANCE_FLOOR) return "light";
  if (luminance <= DARK_LUMINANCE_CEILING) return "dark";
  return "mid";
}

/** Colour shares are float fractions, so two fifths can sum to 0.39999...;
 *  this keeps a flag sitting exactly on the threshold counted as affected. */
const SHARE_ROUNDING_TOLERANCE = 1e-9;

/** The share (0..1) of a flag's area taken by the colours the frame colour
 *  fades into, with each colour weighted by its share. For a striped flag
 *  this is exactly the height share of the fading bands, since each band
 *  runs the full width. */
function fadedShareOf(frameColor: string, flagId: string): number {
  return flagColorShares(flagId)
    .filter(
      (colorShare) =>
        contrastRatio(frameColor, colorShare.color) < MIN_STRIPE_CONTRAST,
    )
    .reduce((share, colorShare) => share + colorShare.share, 0);
}

/**
 * The flags (canonical order) where the colours the frame colour fades into
 * cover at least `MIN_FADED_FLAG_SHARE` of the area.
 */
export function flagsFadingInto(
  frameColor: string,
  flagIds: readonly string[],
): string[] {
  return sortFlagIds(flagIds).filter(
    (flagId) =>
      fadedShareOf(frameColor, flagId) >=
      MIN_FADED_FLAG_SHARE - SHARE_ROUNDING_TOLERANCE,
  );
}
