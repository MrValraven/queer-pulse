/**
 * Pure colour maths for the Daylight release header: pick the cover art's
 * dominant colour from a small RGBA sample, then lighten it into a header
 * wash that keeps the ink readable. No React and no DOM here, so the hook
 * (useStudioCoverTint.ts) owns the image loading and these stay testable.
 */

export type CoverColourSource = "hue" | "average" | "fallback";

export interface DominantCoverColour {
  rgb: [number, number, number];
  source: CoverColourSource;
}

interface HslColour {
  hue: number;
  saturation: number;
  lightness: number;
}

/** A warm off-white for covers with nothing but near-black or near-white. */
const FALLBACK_COVER_RGB: [number, number, number] = [240, 238, 235];
const HUE_BUCKET_COUNT = 12;
const HUE_BUCKET_DEGREES = 360 / HUE_BUCKET_COUNT;
const MIN_COUNTED_LIGHTNESS = 0.1;
const MAX_COUNTED_LIGHTNESS = 0.94;
/**
 * The winning hue must carry at least this share of the counted pixels'
 * weight, else it is too faint to stand for the cover. A pixel weighs at
 * most 1, so 0.004 is every counted pixel at about 6.5% saturation, or a
 * tenth of them at 20%: about 4 at a full 1024 sample, less when dark or
 * white pixels are skipped. A muted blue cover clears it with room to
 * spare, while the colour noise of a grey cover stays well under it.
 */
const MIN_BUCKET_SHARE = 0.004;
/** Mostly transparent pixels say nothing about the art. */
const MIN_COUNTED_ALPHA = 128;
/** The blend into white runs from 34% colour down to 4%, in 2% steps. */
const STRONGEST_BLEND_STEP = 17;
const FAINTEST_BLEND_STEP = 2;
const BLEND_STEPS_PER_UNIT = 50;
const MIN_INK_CONTRAST = 12;
/** WCAG AA for the coral artist line, which sits on the tint too. */
const MIN_ACCENT_TEXT_CONTRAST = 4.5;
/** The light Studio ink, matching --studio-ink-rgb in colors.css. */
const STUDIO_LIGHT_INK_RGB: [number, number, number] = [27, 23, 32];
/** The light coral small text, matching --studio-accent-text in
 *  colors.css. Keep the two in step. */
const STUDIO_LIGHT_ACCENT_TEXT_RGB: [number, number, number] = [184, 58, 26];

/** RGB channels 0-255 to hue in degrees and saturation, lightness 0-1. */
export function toHsl(red: number, green: number, blue: number): HslColour {
  const redUnit = red / 255;
  const greenUnit = green / 255;
  const blueUnit = blue / 255;
  const maxChannel = Math.max(redUnit, greenUnit, blueUnit);
  const minChannel = Math.min(redUnit, greenUnit, blueUnit);
  const lightness = (maxChannel + minChannel) / 2;
  const chroma = maxChannel - minChannel;
  if (chroma === 0) return { hue: 0, saturation: 0, lightness };
  const saturation = chroma / (1 - Math.abs(2 * lightness - 1));
  let hueSector: number;
  if (maxChannel === redUnit) {
    hueSector = ((greenUnit - blueUnit) / chroma) % 6;
  } else if (maxChannel === greenUnit) {
    hueSector = (blueUnit - redUnit) / chroma + 2;
  } else {
    hueSector = (redUnit - greenUnit) / chroma + 4;
  }
  const hue = (hueSector * 60 + 360) % 360;
  return { hue, saturation: Math.min(1, saturation), lightness };
}

/** WCAG 2 relative luminance of an RGB colour with 0-255 channels. */
export function relativeLuminance([red, green, blue]: readonly [
  number,
  number,
  number,
]): number {
  const linearChannel = (channel: number) => {
    const unit = channel / 255;
    return unit <= 0.03928 ? unit / 12.92 : ((unit + 0.055) / 1.055) ** 2.4;
  };
  return (
    0.2126 * linearChannel(red) +
    0.7152 * linearChannel(green) +
    0.0722 * linearChannel(blue)
  );
}

/** WCAG 2 contrast ratio between two RGB colours, from 1 to 21. */
export function contrastRatio(
  firstRgb: readonly [number, number, number],
  secondRgb: readonly [number, number, number],
): number {
  const firstLuminance = relativeLuminance(firstRgb);
  const secondLuminance = relativeLuminance(secondRgb);
  const lighter = Math.max(firstLuminance, secondLuminance);
  const darker = Math.min(firstLuminance, secondLuminance);
  return (lighter + 0.05) / (darker + 0.05);
}

/** RGB channels to a lowercase `#rrggbb` string. */
export function toHex([red, green, blue]: readonly [
  number,
  number,
  number,
]): string {
  const channelHex = (channel: number) =>
    Math.round(Math.min(255, Math.max(0, channel)))
      .toString(16)
      .padStart(2, "0");
  return `#${channelHex(red)}${channelHex(green)}${channelHex(blue)}`;
}

/**
 * The cover's dominant colour from RGBA pixels (a 32x32 draw). Near-black
 * and near-white pixels are skipped; the rest fall into twelve 30 degree hue
 * buckets weighted by saturation squared and closeness to mid lightness.
 * The heaviest bucket wins when it carries enough of the counted pixels'
 * weight (MIN_BUCKET_SHARE), else the plain average of the counted pixels
 * stands in, else a warm off-white.
 */
export function dominantCoverColour(
  pixels: Uint8ClampedArray,
): DominantCoverColour {
  const bucketWeights = new Array<number>(HUE_BUCKET_COUNT).fill(0);
  const bucketRed = new Array<number>(HUE_BUCKET_COUNT).fill(0);
  const bucketGreen = new Array<number>(HUE_BUCKET_COUNT).fill(0);
  const bucketBlue = new Array<number>(HUE_BUCKET_COUNT).fill(0);
  let countedPixels = 0;
  let totalRed = 0;
  let totalGreen = 0;
  let totalBlue = 0;

  for (let pixelIndex = 0; pixelIndex + 3 < pixels.length; pixelIndex += 4) {
    const red = pixels[pixelIndex] ?? 0;
    const green = pixels[pixelIndex + 1] ?? 0;
    const blue = pixels[pixelIndex + 2] ?? 0;
    const alpha = pixels[pixelIndex + 3] ?? 0;
    if (alpha < MIN_COUNTED_ALPHA) continue;
    const { hue, saturation, lightness } = toHsl(red, green, blue);
    if (lightness < MIN_COUNTED_LIGHTNESS || lightness > MAX_COUNTED_LIGHTNESS)
      continue;
    countedPixels += 1;
    totalRed += red;
    totalGreen += green;
    totalBlue += blue;
    const weight = saturation ** 2 * (1 - Math.abs(lightness - 0.5));
    const bucketIndex = Math.floor(hue / HUE_BUCKET_DEGREES) % HUE_BUCKET_COUNT;
    bucketWeights[bucketIndex] = (bucketWeights[bucketIndex] ?? 0) + weight;
    bucketRed[bucketIndex] = (bucketRed[bucketIndex] ?? 0) + red * weight;
    bucketGreen[bucketIndex] = (bucketGreen[bucketIndex] ?? 0) + green * weight;
    bucketBlue[bucketIndex] = (bucketBlue[bucketIndex] ?? 0) + blue * weight;
  }

  let heaviestBucket = 0;
  for (let bucketIndex = 1; bucketIndex < HUE_BUCKET_COUNT; bucketIndex += 1) {
    if (
      (bucketWeights[bucketIndex] ?? 0) > (bucketWeights[heaviestBucket] ?? 0)
    )
      heaviestBucket = bucketIndex;
  }
  const heaviestWeight = bucketWeights[heaviestBucket] ?? 0;
  if (countedPixels > 0 && heaviestWeight >= countedPixels * MIN_BUCKET_SHARE) {
    return {
      rgb: [
        Math.round((bucketRed[heaviestBucket] ?? 0) / heaviestWeight),
        Math.round((bucketGreen[heaviestBucket] ?? 0) / heaviestWeight),
        Math.round((bucketBlue[heaviestBucket] ?? 0) / heaviestWeight),
      ],
      source: "hue",
    };
  }
  if (countedPixels > 0) {
    return {
      rgb: [
        Math.round(totalRed / countedPixels),
        Math.round(totalGreen / countedPixels),
        Math.round(totalBlue / countedPixels),
      ],
      source: "average",
    };
  }
  return { rgb: [...FALLBACK_COVER_RGB], source: "fallback" };
}

/**
 * Lightens a cover colour into a header wash: blends it into white, from
 * 34% colour down to 4%, and returns the first blend whose WCAG 2 contrast
 * reaches 12:1 with the ink and 4.5:1 with the coral small text (the artist
 * line). When none does, the faintest blend stands.
 */
export function headerTintFromCoverColour(
  rgb: readonly [number, number, number],
  inkRgb: readonly [number, number, number] = STUDIO_LIGHT_INK_RGB,
  accentTextRgb: readonly [
    number,
    number,
    number,
  ] = STUDIO_LIGHT_ACCENT_TEXT_RGB,
): string {
  const blendIntoWhite = (amount: number): [number, number, number] => [
    255 + (rgb[0] - 255) * amount,
    255 + (rgb[1] - 255) * amount,
    255 + (rgb[2] - 255) * amount,
  ];
  for (
    let blendStep = STRONGEST_BLEND_STEP;
    blendStep >= FAINTEST_BLEND_STEP;
    blendStep -= 1
  ) {
    const blended = blendIntoWhite(blendStep / BLEND_STEPS_PER_UNIT);
    const rounded: [number, number, number] = [
      Math.round(blended[0]),
      Math.round(blended[1]),
      Math.round(blended[2]),
    ];
    if (
      contrastRatio(rounded, inkRgb) >= MIN_INK_CONTRAST &&
      contrastRatio(rounded, accentTextRgb) >= MIN_ACCENT_TEXT_CONTRAST
    )
      return toHex(rounded);
  }
  return toHex(blendIntoWhite(FAINTEST_BLEND_STEP / BLEND_STEPS_PER_UNIT));
}
