/**
 * The pride flags as ORDERED COLOUR BANDS, which is the one form both
 * consumers can read: `cardBackgrounds.data.ts` folds them into CSS gradient
 * strings for a membership card, and the sticker templates paint them onto a
 * canvas. The gradient strings used to be the only stored form, and a canvas
 * cannot parse one.
 *
 * Raw hex is correct here for the same reason it is correct in
 * `cardBackgrounds.data.ts`: these are the flags' own published colours, they
 * are content, and they must never shift with the theme.
 *
 * Only flags whose design IS horizontal bands live here. The Progress chevron
 * and the Intersex ring are drawn shapes; `cardBackgrounds.data.ts` keeps
 * their own definitions, and Progress reuses `FLAG_STRIPES.rainbow` for the
 * six-stripe ground it sits on.
 *
 * `weight` is omitted on a flag whose bands are equal, which is most of them.
 * That absence is load-bearing: `stripeGradient` reproduces the exact stop
 * percentages the equal-band helper produced before this file existed, and an
 * explicit `weight` of `100 / n` would produce different floating point text.
 */
export interface FlagStripe {
  color: string;
  /** Percentage of the flag's height. Omitted means "an equal share". Set it
   *  only on a flag whose bands are genuinely unequal, and make the set sum
   *  to 100. */
  weight?: number;
}

export const FLAG_STRIPES: Readonly<Record<string, readonly FlagStripe[]>> = {
  rainbow: [
    { color: "#e40303" },
    { color: "#ff8c00" },
    { color: "#ffed00" },
    { color: "#008026" },
    { color: "#24408e" },
    { color: "#732982" },
  ],
  transgender: [
    { color: "#5bcefa" },
    { color: "#f5a9b8" },
    { color: "#ffffff" },
    { color: "#f5a9b8" },
    { color: "#5bcefa" },
  ],
  bisexual: [
    { color: "#d60270", weight: 40 },
    { color: "#9b4f96", weight: 20 },
    { color: "#0038a8", weight: 40 },
  ],
  lesbian: [
    { color: "#d52d00" },
    { color: "#ff9a56" },
    { color: "#ffffff" },
    { color: "#d362a4" },
    { color: "#a30262" },
  ],
  pansexual: [{ color: "#ff218c" }, { color: "#ffd800" }, { color: "#21b1ff" }],
  asexual: [
    { color: "#000000" },
    { color: "#a3a3a3" },
    { color: "#ffffff" },
    { color: "#800080" },
  ],
  aromantic: [
    { color: "#3da542" },
    { color: "#a7d379" },
    { color: "#ffffff" },
    { color: "#a9a9a9" },
    { color: "#000000" },
  ],
  nonbinary: [
    { color: "#fcf434" },
    { color: "#ffffff" },
    { color: "#9c59d1" },
    { color: "#2c2c2c" },
  ],
  genderfluid: [
    { color: "#ff75a2" },
    { color: "#ffffff" },
    { color: "#be18d6" },
    { color: "#000000" },
    { color: "#333ebd" },
  ],
  genderqueer: [
    { color: "#b57edc" },
    { color: "#ffffff" },
    { color: "#4a8123" },
  ],
  agender: [
    { color: "#000000" },
    { color: "#bcc4c7" },
    { color: "#ffffff" },
    { color: "#b7f684" },
    { color: "#ffffff" },
    { color: "#bcc4c7" },
    { color: "#000000" },
  ],
};

/** Every flag this registry can paint as bands, in registry order. */
export const STRIPED_FLAG_IDS: readonly string[] = Object.keys(FLAG_STRIPES);

/**
 * Fold bands into a complete CSS `background` gradient.
 *
 * Two code paths on purpose. When no band carries a `weight`, the stop
 * percentages are computed as `index * (100 / count)`, which is exactly what
 * the old `stripes()` helper did, floating point text included. When any band
 * carries a `weight`, the stops accumulate, which is what `weightedStripes()`
 * did. Collapsing these into one accumulating path would change the rendered
 * string for every equal-band flag.
 */
export function stripeGradient(bands: readonly FlagStripe[]): string {
  const hasExplicitWeights = bands.some((band) => band.weight !== undefined);
  if (!hasExplicitWeights) {
    const bandSize = 100 / bands.length;
    const stops = bands
      .map(
        (band, index) =>
          `${band.color} ${index * bandSize}% ${(index + 1) * bandSize}%`,
      )
      .join(", ");
    return `linear-gradient(to bottom, ${stops})`;
  }
  let position = 0;
  const stops = bands.map((band) => {
    const from = position;
    position += band.weight ?? 0;
    return `${band.color} ${from}% ${position}%`;
  });
  return `linear-gradient(to bottom, ${stops.join(", ")})`;
}

/** One band's vertical extent as fractions of the flag's height, which is the
 *  form a canvas or an SVG rect needs. */
export interface FlagBandSpan {
  color: string;
  start: number;
  end: number;
}

/** The bands of `flagId`, or a thrown error when the id is unknown. Callers
 *  get a non-optional array, which `FLAG_STRIPES[id]` cannot give them under
 *  `noUncheckedIndexedAccess`. Mirrors `flagBandSpans`'s own loud failure. */
export function flagStripesOf(flagId: string): readonly FlagStripe[] {
  const bands = FLAG_STRIPES[flagId];
  if (!bands) {
    throw new Error(`Unknown flag id: ${flagId}`);
  }
  return bands;
}

/** The bands of `flagId` as fractional spans. Throws on an unknown id rather
 *  than returning an empty list, so a typo surfaces at the call site instead
 *  of painting a blank card. */
export function flagBandSpans(flagId: string): FlagBandSpan[] {
  const bands = flagStripesOf(flagId);
  const hasExplicitWeights = bands.some((band) => band.weight !== undefined);
  if (!hasExplicitWeights) {
    return bands.map((band, index) => ({
      color: band.color,
      start: index / bands.length,
      end: (index + 1) / bands.length,
    }));
  }
  let position = 0;
  return bands.map((band) => {
    const start = position;
    position += band.weight ?? 0;
    return { color: band.color, start: start / 100, end: position / 100 };
  });
}
