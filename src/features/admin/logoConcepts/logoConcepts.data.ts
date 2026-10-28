/**
 * The logo concepts the admin compares on /admin/logo-concepts. Each one
 * turns the Q of the sign-in network art into a flat mark for social
 * avatars, drawn in three colourways. The ripple variants come first: the P
 * drops in like a pulse and its ripples spread out to form the Q. The
 * letter family keeps the Q of Drop and Serif and redraws the P as a real
 * letter from Fraunces or DM Sans. In the outside family the P is big and
 * the Q sits inside its bowl. In the fused family the P's bowl is the Q's
 * first ripple. The original three concepts follow, then the thread
 * variants, which explore the thread concept further. Every ripple, letter
 * and thread variant ships a small cut, a simplified drawing for 32px and
 * below.
 *
 * Static on purpose, in demo and live mode alike: the marks ship with the
 * site as SVG files in public/brand/logo-concepts/, written by
 * `node scripts/brand/logo-concepts.mjs` for the original three,
 * `node scripts/brand/thread-variants.mjs` for the thread variants,
 * `node scripts/brand/ripple-variants.mjs` for the ripple variants,
 * `node scripts/brand/ripple-letter.mjs` for the letter family,
 * `node scripts/brand/ripple-outside.mjs` for the outside family and
 * `node scripts/brand/ripple-fused.mjs` for the fused family, small cuts
 * included. The scripts are the source of truth for their geometry; this
 * registry only says what the page shows.
 */
export type LogoConceptId =
  | "constellation"
  | "thread"
  | "hearth"
  | "thread-woven"
  | "thread-swell"
  | "thread-trio"
  | "thread-ribbon"
  | "thread-signature"
  | "ripple-drop"
  | "ripple-rings"
  | "ripple-splash"
  | "ripple-serif"
  | "ripple-letter-drop-fraunces"
  | "ripple-letter-drop-fraunces-tail"
  | "ripple-letter-drop-sans"
  | "ripple-letter-drop-upright"
  | "ripple-letter-serif-fraunces"
  | "ripple-letter-serif-soft"
  | "ripple-letter-serif-italic"
  | "ripple-outside-nest"
  | "ripple-outside-rings"
  | "ripple-outside-tail"
  | "ripple-fused-ring"
  | "ripple-fused-spiral"
  | "ripple-fused-stack";
export type LogoColorway = "plum" | "cream" | "mono";
/** The full drawing, or the simplified one for avatars of 32px and below. */
export type LogoCut = "full" | "small";

export interface LogoConcept {
  id: LogoConceptId;
  /** admin catalog keys */
  titleKey: string;
  summaryKey: string;
  /** Whether a `-small` file exists for the 32px and 24px crops. */
  hasSmallCut: boolean;
}

export const LOGO_COLORWAYS: readonly LogoColorway[] = [
  "plum",
  "cream",
  "mono",
];

/** Literal keys, so catalog checks can find every one. */
export const LOGO_CONCEPTS: readonly LogoConcept[] = [
  {
    id: "constellation",
    titleKey: "admin:logoConcepts.concepts.constellation.title",
    summaryKey: "admin:logoConcepts.concepts.constellation.summary",
    hasSmallCut: false,
  },
  {
    id: "thread",
    titleKey: "admin:logoConcepts.concepts.thread.title",
    summaryKey: "admin:logoConcepts.concepts.thread.summary",
    hasSmallCut: false,
  },
  {
    id: "hearth",
    titleKey: "admin:logoConcepts.concepts.hearth.title",
    summaryKey: "admin:logoConcepts.concepts.hearth.summary",
    hasSmallCut: false,
  },
];

/** Variations on the thread concept, shown in their own section below the
 *  original three. Literal keys, so catalog checks can find every one. */
export const THREAD_VARIANTS: readonly LogoConcept[] = [
  {
    id: "thread-signature",
    titleKey: "admin:logoConcepts.concepts.threadSignature.title",
    summaryKey: "admin:logoConcepts.concepts.threadSignature.summary",
    hasSmallCut: true,
  },
  {
    id: "thread-woven",
    titleKey: "admin:logoConcepts.concepts.threadWoven.title",
    summaryKey: "admin:logoConcepts.concepts.threadWoven.summary",
    hasSmallCut: true,
  },
  {
    id: "thread-swell",
    titleKey: "admin:logoConcepts.concepts.threadSwell.title",
    summaryKey: "admin:logoConcepts.concepts.threadSwell.summary",
    hasSmallCut: true,
  },
  {
    id: "thread-trio",
    titleKey: "admin:logoConcepts.concepts.threadTrio.title",
    summaryKey: "admin:logoConcepts.concepts.threadTrio.summary",
    hasSmallCut: true,
  },
  {
    id: "thread-ribbon",
    titleKey: "admin:logoConcepts.concepts.threadRibbon.title",
    summaryKey: "admin:logoConcepts.concepts.threadRibbon.summary",
    hasSmallCut: true,
  },
];

/** The ripple family, shown in its own section above the original three.
 *  Literal keys, so catalog checks can find every one. */
export const RIPPLE_VARIANTS: readonly LogoConcept[] = [
  {
    id: "ripple-drop",
    titleKey: "admin:logoConcepts.concepts.rippleDrop.title",
    summaryKey: "admin:logoConcepts.concepts.rippleDrop.summary",
    hasSmallCut: true,
  },
  {
    id: "ripple-rings",
    titleKey: "admin:logoConcepts.concepts.rippleRings.title",
    summaryKey: "admin:logoConcepts.concepts.rippleRings.summary",
    hasSmallCut: true,
  },
  {
    id: "ripple-splash",
    titleKey: "admin:logoConcepts.concepts.rippleSplash.title",
    summaryKey: "admin:logoConcepts.concepts.rippleSplash.summary",
    hasSmallCut: true,
  },
  {
    id: "ripple-serif",
    titleKey: "admin:logoConcepts.concepts.rippleSerif.title",
    summaryKey: "admin:logoConcepts.concepts.rippleSerif.summary",
    hasSmallCut: true,
  },
];

/** The letter family: Drop and Serif keep their Q and the P becomes a real
 *  letter from Fraunces or DM Sans. Shown right below the ripple family.
 *  Literal keys, so catalog checks can find every one. */
export const RIPPLE_LETTER_VARIANTS: readonly LogoConcept[] = [
  {
    id: "ripple-letter-drop-fraunces",
    titleKey: "admin:logoConcepts.concepts.rippleLetterDropFraunces.title",
    summaryKey: "admin:logoConcepts.concepts.rippleLetterDropFraunces.summary",
    hasSmallCut: true,
  },
  {
    id: "ripple-letter-drop-fraunces-tail",
    titleKey: "admin:logoConcepts.concepts.rippleLetterDropFrauncesTail.title",
    summaryKey:
      "admin:logoConcepts.concepts.rippleLetterDropFrauncesTail.summary",
    hasSmallCut: true,
  },
  {
    id: "ripple-letter-drop-sans",
    titleKey: "admin:logoConcepts.concepts.rippleLetterDropSans.title",
    summaryKey: "admin:logoConcepts.concepts.rippleLetterDropSans.summary",
    hasSmallCut: true,
  },
  {
    id: "ripple-letter-drop-upright",
    titleKey: "admin:logoConcepts.concepts.rippleLetterDropUpright.title",
    summaryKey: "admin:logoConcepts.concepts.rippleLetterDropUpright.summary",
    hasSmallCut: true,
  },
  {
    id: "ripple-letter-serif-fraunces",
    titleKey: "admin:logoConcepts.concepts.rippleLetterSerifFraunces.title",
    summaryKey: "admin:logoConcepts.concepts.rippleLetterSerifFraunces.summary",
    hasSmallCut: true,
  },
  {
    id: "ripple-letter-serif-soft",
    titleKey: "admin:logoConcepts.concepts.rippleLetterSerifSoft.title",
    summaryKey: "admin:logoConcepts.concepts.rippleLetterSerifSoft.summary",
    hasSmallCut: true,
  },
  {
    id: "ripple-letter-serif-italic",
    titleKey: "admin:logoConcepts.concepts.rippleLetterSerifItalic.title",
    summaryKey: "admin:logoConcepts.concepts.rippleLetterSerifItalic.summary",
    hasSmallCut: true,
  },
];

/** The outside family: a big P with the Q inside its bowl. Shown below the
 *  ripple family. Literal keys, so catalog checks can find every one. */
export const RIPPLE_OUTSIDE_VARIANTS: readonly LogoConcept[] = [
  {
    id: "ripple-outside-nest",
    titleKey: "admin:logoConcepts.concepts.rippleOutsideNest.title",
    summaryKey: "admin:logoConcepts.concepts.rippleOutsideNest.summary",
    hasSmallCut: true,
  },
  {
    id: "ripple-outside-rings",
    titleKey: "admin:logoConcepts.concepts.rippleOutsideRings.title",
    summaryKey: "admin:logoConcepts.concepts.rippleOutsideRings.summary",
    hasSmallCut: true,
  },
  {
    id: "ripple-outside-tail",
    titleKey: "admin:logoConcepts.concepts.rippleOutsideTail.title",
    summaryKey: "admin:logoConcepts.concepts.rippleOutsideTail.summary",
    hasSmallCut: true,
  },
];

/** The fused family: the P's bowl is the Q's first ripple. Shown below the
 *  outside family. Literal keys, so catalog checks can find every one. */
export const RIPPLE_FUSED_VARIANTS: readonly LogoConcept[] = [
  {
    id: "ripple-fused-ring",
    titleKey: "admin:logoConcepts.concepts.rippleFusedRing.title",
    summaryKey: "admin:logoConcepts.concepts.rippleFusedRing.summary",
    hasSmallCut: true,
  },
  {
    id: "ripple-fused-spiral",
    titleKey: "admin:logoConcepts.concepts.rippleFusedSpiral.title",
    summaryKey: "admin:logoConcepts.concepts.rippleFusedSpiral.summary",
    hasSmallCut: true,
  },
  {
    id: "ripple-fused-stack",
    titleKey: "admin:logoConcepts.concepts.rippleFusedStack.title",
    summaryKey: "admin:logoConcepts.concepts.rippleFusedStack.summary",
    hasSmallCut: true,
  },
];

/** Public URL of one concept's SVG in one colourway. The small cut exists
 *  only for concepts whose `hasSmallCut` is true. */
export function logoAssetPath(
  conceptId: LogoConceptId,
  colorway: LogoColorway,
  cut: LogoCut = "full",
): string {
  const cutSuffix = cut === "small" ? "-small" : "";
  return `/brand/logo-concepts/${conceptId}-${colorway}${cutSuffix}.svg`;
}

/** The current pulse-dots mark, shown beside the concepts for comparison. */
export const CURRENT_MARK_PATH = "/press/queerpulse-mark.svg";
