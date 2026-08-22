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
 */

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

/** Equal horizontal bands, the shape most of these flags take. */
function stripes(...colors: string[]): string {
  const band = 100 / colors.length;
  const stops = colors
    .map(
      (color, index) =>
        `${color} ${index * band}% ${(index + 1) * band}%`,
    )
    .join(", ");
  return `linear-gradient(to bottom, ${stops})`;
}

/** Bands at explicit weights, for the flags whose stripes are not equal. */
function weightedStripes(...bands: [string, number][]): string {
  let position = 0;
  const stops = bands.map(([color, weight]) => {
    const from = position;
    position += weight;
    return `${color} ${from}% ${position}%`;
  });
  return `linear-gradient(to bottom, ${stops.join(", ")})`;
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

export const CARD_BACKGROUND_PRESETS: CardBackgroundPreset[] = [
  {
    id: "rainbow",
    labelKey: "cards:flag.rainbow",
    background: stripes(
      "#e40303",
      "#ff8c00",
      "#ffed00",
      "#008026",
      "#24408e",
      "#732982",
    ),
  },
  {
    id: "progress",
    labelKey: "cards:flag.progress",
    // The chevron is PARALLEL bands, so it cannot be one conic fan (a fan's
    // bands are angular sectors, which would taper). It is two halves
    // instead: the upper arm as bands running down-right, the lower arm
    // mirrored, each clipped to its half of the card. Listed before the
    // stripes so it paints over them.
    background: [
      `linear-gradient(45deg, ${CHEVRON_BANDS}) 0 0 / 100% 50% no-repeat`,
      `linear-gradient(135deg, ${CHEVRON_BANDS}) 0 100% / 100% 50% no-repeat`,
      stripes(
        "#e40303",
        "#ff8c00",
        "#ffed00",
        "#008026",
        "#24408e",
        "#732982",
      ),
    ].join(", "),
  },
  {
    id: "transgender",
    labelKey: "cards:flag.transgender",
    background: stripes("#5bcefa", "#f5a9b8", "#ffffff", "#f5a9b8", "#5bcefa"),
  },
  {
    id: "bisexual",
    labelKey: "cards:flag.bisexual",
    background: weightedStripes(["#d60270", 40], ["#9b4f96", 20], ["#0038a8", 40]),
  },
  {
    id: "lesbian",
    labelKey: "cards:flag.lesbian",
    background: stripes("#d52d00", "#ff9a56", "#ffffff", "#d362a4", "#a30262"),
  },
  {
    id: "pansexual",
    labelKey: "cards:flag.pansexual",
    background: stripes("#ff218c", "#ffd800", "#21b1ff"),
  },
  {
    id: "asexual",
    labelKey: "cards:flag.asexual",
    background: stripes("#000000", "#a3a3a3", "#ffffff", "#800080"),
  },
  {
    id: "aromantic",
    labelKey: "cards:flag.aromantic",
    background: stripes("#3da542", "#a7d379", "#ffffff", "#a9a9a9", "#000000"),
  },
  {
    id: "nonbinary",
    labelKey: "cards:flag.nonbinary",
    background: stripes("#fcf434", "#ffffff", "#9c59d1", "#2c2c2c"),
  },
  {
    id: "genderfluid",
    labelKey: "cards:flag.genderfluid",
    background: stripes("#ff75a2", "#ffffff", "#be18d6", "#000000", "#333ebd"),
  },
  {
    id: "genderqueer",
    labelKey: "cards:flag.genderqueer",
    background: stripes("#b57edc", "#ffffff", "#4a8123"),
  },
  {
    id: "agender",
    labelKey: "cards:flag.agender",
    background: stripes(
      "#000000",
      "#bcc4c7",
      "#ffffff",
      "#b7f684",
      "#ffffff",
      "#bcc4c7",
      "#000000",
    ),
  },
  {
    id: "intersex",
    labelKey: "cards:flag.intersex",
    // A purple ring on yellow. The ring is a hard-stopped radial gradient,
    // sized in the smaller axis so it stays a circle on the card's 1.59:1 box.
    background:
      // `closest-side` makes 100% the card's HALF-HEIGHT, so these stops are
      // fractions of that: a ring whose outer diameter is ~38% of the card's
      // height, matching the flag's own proportions.
      `radial-gradient(circle closest-side at 50% 50%, ` +
      `transparent 0 30%, #7902aa 30% 38%, transparent 38%), ` +
      `linear-gradient(#ffd800, #ffd800)`,
  },
];

export function backgroundPresetValue(id: string | null): string | null {
  if (!id) return null;
  return (
    CARD_BACKGROUND_PRESETS.find((preset) => preset.id === id)?.background ??
    null
  );
}
