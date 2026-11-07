/**
 * The projector palette, read from CSS tokens so shaders never hold a colour
 * literal. `styles/tokens/vjStage.css` defines every token as a channel
 * triple ("r, g, b"); this module turns them into 0..1 floats.
 *
 * Runs once per compositor start (and after a context restore), off the
 * frame loop.
 */

import {
  VJ_COLOR_TOKENS,
  VJ_DUOTONE_PAIRS,
  VJ_PRIDE_FLAGS,
  type VjColorToken,
  type VjDuotonePair,
  type VjPrideFlag,
} from "../../../shared/contracts/vj";

/** One colour, 0..1 per channel. */
export type VjRgb = readonly [number, number, number];

export interface VjPalette {
  colours: Readonly<Record<VjColorToken, VjRgb>>;
  /** Shadow colour, then highlight colour. */
  duotones: Readonly<Record<VjDuotonePair, readonly [VjRgb, VjRgb]>>;
  /** Each flag's stripes, top to bottom. */
  flags: Readonly<Record<VjPrideFlag, readonly VjRgb[]>>;
}

export const VJ_PALETTE_TOKEN_PREFIX = "--vj-palette-";
const VJ_FLAG_TOKEN_PREFIX = "--vj-flag-";

/** How many stripe tokens each flag has in vjStage.css. */
export const VJ_FLAG_TOKEN_COUNTS: Readonly<Record<VjPrideFlag, number>> = {
  rainbow: 6,
  trans: 5,
  bi: 5,
  lesbian: 5,
  nonbinary: 4,
  progress: 11,
};

/** What a token that is missing or unparseable reads as. */
const FALLBACK_GREY: VjRgb = [0.5, 0.5, 0.5];

/** `--vj-palette-<name>`, the token one palette name maps to (contract 3.1). */
export function vjPaletteToken(colorToken: VjColorToken): string {
  return `${VJ_PALETTE_TOKEN_PREFIX}${colorToken}`;
}

/**
 * `--vj-flag-<flag>-<stripe>` for a zero-based stripe index. The tokens are
 * numbered from 1, so stripe index 0 reads `--vj-flag-<flag>-1`.
 */
export function vjFlagStripeToken(
  flag: VjPrideFlag,
  stripeIndex: number,
): string {
  return `${VJ_FLAG_TOKEN_PREFIX}${flag}-${stripeIndex + 1}`;
}

/** The two palette names in a duotone pair, shadow first. */
export function vjDuotoneColours(
  pair: VjDuotonePair,
): readonly [VjColorToken, VjColorToken] {
  const [shadow, highlight] = pair.split("-");
  return [asColorToken(shadow), asColorToken(highlight)];
}

/** Parses an "r, g, b" channel triple (0..255) into 0..1; grey when unparseable. */
export function parseVjChannelTriple(value: string): VjRgb {
  const parts = value.trim().split(/\s*,\s*/);
  if (parts.length !== 3) return FALLBACK_GREY;
  const channels = parts.map((part) =>
    /^\d+(\.\d+)?$/.test(part) ? Number(part) : Number.NaN,
  );
  const [red, green, blue] = channels;
  if (red === undefined || green === undefined || blue === undefined) {
    return FALLBACK_GREY;
  }
  if (
    !channels.every((channel) => Number.isFinite(channel) && channel <= 255)
  ) {
    return FALLBACK_GREY;
  }
  return [red / 255, green / 255, blue / 255];
}

export function readVjPalette(
  root: HTMLElement = document.documentElement,
): VjPalette {
  const computed = getComputedStyle(root);
  const readToken = (tokenName: string): VjRgb =>
    parseVjChannelTriple(computed.getPropertyValue(tokenName));

  const colours = Object.fromEntries(
    VJ_COLOR_TOKENS.map((colorToken) => [
      colorToken,
      readToken(vjPaletteToken(colorToken)),
    ]),
  ) as Record<VjColorToken, VjRgb>;

  const duotones = Object.fromEntries(
    VJ_DUOTONE_PAIRS.map((pair) => {
      const [shadow, highlight] = vjDuotoneColours(pair);
      return [pair, [colours[shadow], colours[highlight]] as const];
    }),
  ) as Record<VjDuotonePair, readonly [VjRgb, VjRgb]>;

  const stripesOf = (flag: VjPrideFlag): readonly VjRgb[] =>
    Array.from({ length: VJ_FLAG_TOKEN_COUNTS[flag] }, (_unused, stripeIndex) =>
      readToken(vjFlagStripeToken(flag, stripeIndex)),
    );
  // Seeded with empty stripes, then every flag in VJ_PRIDE_FLAGS is filled in.
  const flags: Record<VjPrideFlag, readonly VjRgb[]> = {
    rainbow: [],
    trans: [],
    bi: [],
    lesbian: [],
    nonbinary: [],
    progress: [],
  };
  for (const flag of VJ_PRIDE_FLAGS) flags[flag] = stripesOf(flag);

  return { colours, duotones, flags };
}

function asColorToken(name: string | undefined): VjColorToken {
  const match = VJ_COLOR_TOKENS.find((colorToken) => colorToken === name);
  // Every VJ_DUOTONE_PAIRS entry names two palette names; plum is a safe dark shadow.
  return match ?? "plum";
}
