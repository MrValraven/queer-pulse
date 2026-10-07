/**
 * The logo concepts the admin compares on /admin/logo-concepts. Each one
 * turns the Q of the sign-in network art into a flat mark for social
 * avatars, drawn in three colourways. The first three are the original
 * concepts; the thread variants below them explore the thread concept
 * further and each ship a small cut, a simplified drawing for 32px and
 * below.
 *
 * Static on purpose, in demo and live mode alike: the marks ship with the
 * site as SVG files in public/brand/logo-concepts/, written by
 * `node scripts/brand/logo-concepts.mjs` for the original three and
 * `node scripts/brand/thread-variants.mjs` for the thread variants and their
 * small cuts. The scripts are the source of truth for their geometry; this
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
  | "thread-signature";
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
