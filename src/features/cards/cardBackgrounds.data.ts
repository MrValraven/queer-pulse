/**
 * The curated card grounds: pride flags, drawn as CSS gradients.
 *
 * Gradients rather than image assets, so a flag is a few hundred bytes, stays
 * perfectly crisp at any card size (the face is `aspect-ratio`-driven and the
 * preview renders it far larger than a real card), needs no upload pipeline,
 * and can never 404. Every flag here is stripes, a ring, or a chevron, all of
 * which CSS draws exactly.
 *
 * Raw hex is correct in this file and would be wrong in a CSS Module: these
 * are not theme colours, they are the flags' own published colours, and they
 * must NOT shift with the theme or with a token change. (`check-design-tokens`
 * enforces that distinction; it only scans `*.module.css`, and its allowlist
 * already recognises "a flag's colours are content".)
 *
 * Ids are a closed set shared with the backend's `BACKGROUND_PRESETS`.
 *
 * The bands themselves live in `flagStripes.data.ts` as machine-readable
 * colour data; this file folds them into the CSS gradient strings a card
 * face renders, because a canvas renderer (the sticker templates) cannot
 * parse a gradient string and needs the raw bands instead.
 */

import {
  STRIPED_FLAG_IDS,
  flagStripesOf,
  stripeGradient,
} from "../../shared/data/flagStripes.data";

export interface CardBackgroundPreset {
  id: string;
  /** Catalog key: `cards:flag.<id>`. */
  labelKey: string;
  /**
   * A complete `background` SHORTHAND value, not a bare `background-image`.
   * The shorthand is what lets a layer carry its own position/size/repeat
   * (the Progress chevron needs two half-height layers), which is illegal
   * inside `background-image` and silently voids the whole declaration.
   */
  background: string;
}

/**
 * The Progress chevron's five bands. Measured from the arrow's POINT outward,
 * because each half-layer's gradient axis starts at the card's left edge on
 * the centre line, which is where the point sits: white at the point, then
 * pink, light blue, brown, and black on the outside, then transparent so the
 * six-stripe ground shows through the rest.
 */
const CHEVRON_BANDS =
  "#ffffff 0 5.5%, #f5a9b8 5.5% 11%, #5bcefa 11% 16.5%, " +
  "#613915 16.5% 22%, #000000 22% 27.5%, transparent 27.5%";

/** The label key every preset carries, derived so a new flag cannot be added
 *  to the registry with a mismatched key. */
function presetFor(id: string, background: string): CardBackgroundPreset {
  return { id, labelKey: `cards:flag.${id}`, background };
}

/** The order the picker shows, which is the registry order with the two drawn
 *  flags slotted into the positions they have always held. */
export const CARD_BACKGROUND_PRESETS: CardBackgroundPreset[] = [
  presetFor("rainbow", stripeGradient(flagStripesOf("rainbow"))),
  presetFor(
    "progress",
    // The chevron is PARALLEL bands, so it cannot be one conic fan (a fan's
    // bands are angular sectors, which would taper). It is two halves
    // instead: the upper arm as bands running down-right, the lower arm
    // mirrored, each clipped to its half of the card. Listed before the
    // stripes so it paints over them. The ground underneath IS the rainbow
    // six, read from the registry rather than repeated here.
    [
      `linear-gradient(45deg, ${CHEVRON_BANDS}) 0 0 / 100% 50% no-repeat`,
      `linear-gradient(135deg, ${CHEVRON_BANDS}) 0 100% / 100% 50% no-repeat`,
      stripeGradient(flagStripesOf("rainbow")),
    ].join(", "),
  ),
  ...STRIPED_FLAG_IDS.filter((id) => id !== "rainbow").map((id) =>
    presetFor(id, stripeGradient(flagStripesOf(id))),
  ),
  presetFor(
    "intersex",
    // A purple ring on yellow. The ring is a hard-stopped radial gradient,
    // sized in the smaller axis so it stays a circle on the card's 1.59:1
    // box. `closest-side` makes 100% the card's HALF-HEIGHT, so these stops
    // are fractions of that: a ring whose outer diameter is ~38% of the
    // card's height, matching the flag's own proportions.
    `radial-gradient(circle closest-side at 50% 50%, ` +
      `transparent 0 30%, #7902aa 30% 38%, transparent 38%), ` +
      `linear-gradient(#ffd800, #ffd800)`,
  ),
];

export function backgroundPresetValue(id: string | null): string | null {
  if (!id) return null;
  return (
    CARD_BACKGROUND_PRESETS.find((preset) => preset.id === id)?.background ??
    null
  );
}
