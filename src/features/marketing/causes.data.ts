import type { Cause } from "./api/volunteering.api";

/**
 * THE volunteering cause taxonomy. One ordered list, and everything else about
 * a cause derives from it: the post/edit form's chip picker, the board's filter
 * chips, the label on a card, and the avatar tint.
 *
 * It used to live in six hand-kept copies (`CAUSE_OPTIONS`, `CAUSE_FILTERS`,
 * `FILTERS`, `CAUSE_TITLE`, `CAUSE_LOWER`, `CAUSE_TINT`) plus two i18n key sets
 * holding identical strings. At five causes that was survivable; at thirteen it
 * is a drift trap, where adding a cause in five places out of six leaves one
 * surface silently missing it with nothing failing to say so. Add a cause HERE
 * (and to `OpportunityCause` in the backend, with a migration) and every
 * surface picks it up.
 *
 * ORDER IS THE RENDER ORDER: the original five first, then the 2026-09-07
 * additions. It is not alphabetical and it is not the enum's storage order,
 * which nothing reads.
 */
export interface CauseDefinition {
  /** The wire value, matching the backend's `OpportunityCause`. */
  value: Cause;
  /** Shared by the picker, the filter chip and the card label. */
  labelKey: string;
  /** Avatar tint on the role card, from the mock palette (jade / coral / plum).
   *  Cycled through the three so neighbouring causes stay distinguishable. */
  tint: { bg: string; color: string };
}

const CORAL = {
  bg: "rgba(var(--accent-rgb),.12)",
  color: "var(--accent-ink)",
} as const;
const JADE = { bg: "rgba(var(--jade-rgb),.14)", color: "var(--jade)" } as const;
const PLUM = {
  bg: "rgba(var(--plum-rgb),.10)",
  color: "var(--plum)",
} as const;

/** Named so it can double as the fallback below without a non-null assertion
 *  on `CAUSES[0]`. */
const RIGHTS: CauseDefinition = {
  value: "rights",
  labelKey: "marketing:cause.rights",
  tint: JADE,
};

export const CAUSES: readonly CauseDefinition[] = [
  RIGHTS,
  { value: "health", labelKey: "marketing:cause.health", tint: CORAL },
  { value: "youth", labelKey: "marketing:cause.youth", tint: PLUM },
  { value: "housing", labelKey: "marketing:cause.housing", tint: CORAL },
  { value: "arts", labelKey: "marketing:cause.arts", tint: JADE },
  { value: "trans_care", labelKey: "marketing:cause.transCare", tint: PLUM },
  { value: "elders", labelKey: "marketing:cause.elders", tint: CORAL },
  {
    value: "mental_health",
    labelKey: "marketing:cause.mentalHealth",
    tint: JADE,
  },
  { value: "migration", labelKey: "marketing:cause.migration", tint: PLUM },
  { value: "education", labelKey: "marketing:cause.education", tint: CORAL },
  { value: "sport", labelKey: "marketing:cause.sport", tint: JADE },
  {
    value: "community_events",
    labelKey: "marketing:cause.communityEvents",
    tint: PLUM,
  },
  {
    value: "fundraising",
    labelKey: "marketing:cause.fundraising",
    tint: CORAL,
  },
];

/** Most causes one opportunity may claim. Mirrors the backend's
 *  `MAX_OPPORTUNITY_CAUSES`, which is what actually rejects a fourth. */
export const MAX_CAUSES = 3;

const BY_VALUE = new Map(CAUSES.map((cause) => [cause.value, cause]));

/**
 * Definition for a wire value, falling back to Rights.
 *
 * Two things reach this with something it cannot resolve, and neither should
 * take the page down. The API can ship a new cause ahead of a frontend deploy,
 * where a wrong-but-legible tint beats a crash. And `undefined` is accepted
 * because a card reads `causes[0]`, which the type system cannot know is
 * populated even though the column is `NOT NULL` and `@ArrayNotEmpty` guards
 * every write.
 */
export function causeDefinition(value: Cause | undefined): CauseDefinition {
  return (value && BY_VALUE.get(value)) ?? RIGHTS;
}

/** i18n key for a cause's label. */
export function causeLabelKey(value: Cause | undefined): string {
  return causeDefinition(value).labelKey;
}

/** The avatar tint a card takes from the cause it leads with. */
export function causeTint(value: Cause | undefined): CauseDefinition["tint"] {
  return causeDefinition(value).tint;
}

/** True when the string is a cause this build knows, narrowing it to `Cause`.
 *  Used to tell a cause chip apart from a commitment chip in the board's
 *  filter state, which is a single string holding either. */
export function isCause(value: string): value is Cause {
  return BY_VALUE.has(value as Cause);
}
