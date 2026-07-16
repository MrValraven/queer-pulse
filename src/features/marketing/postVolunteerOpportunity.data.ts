import type { Cause, Commit } from "./api/volunteering.api";

/** Cause options for the create form — value is the lowercase API cause;
 *  labelKey resolves via t() at render. */
export const CAUSE_OPTIONS: { value: Cause; labelKey: string }[] = [
  { value: "rights", labelKey: "marketing:postOpportunity.cause.rights" },
  { value: "health", labelKey: "marketing:postOpportunity.cause.health" },
  { value: "youth", labelKey: "marketing:postOpportunity.cause.youth" },
  { value: "housing", labelKey: "marketing:postOpportunity.cause.housing" },
  { value: "arts", labelKey: "marketing:postOpportunity.cause.arts" },
];

/** Commitment level options with a short honesty line under each. */
export const COMMIT_OPTIONS: {
  value: Commit;
  labelKey: string;
  hintKey: string;
}[] = [
  {
    value: "low",
    labelKey: "marketing:postOpportunity.commit.low.label",
    hintKey: "marketing:postOpportunity.commit.low.hint",
  },
  {
    value: "medium",
    labelKey: "marketing:postOpportunity.commit.medium.label",
    hintKey: "marketing:postOpportunity.commit.medium.hint",
  },
];

/** Tips shown in the sidebar while filling out the form. */
export const POST_TIPS: { titleKey: string; bodyKey: string }[] = [
  {
    titleKey: "marketing:postOpportunity.tip1.title",
    bodyKey: "marketing:postOpportunity.tip1.body",
  },
  {
    titleKey: "marketing:postOpportunity.tip2.title",
    bodyKey: "marketing:postOpportunity.tip2.body",
  },
  {
    titleKey: "marketing:postOpportunity.tip3.title",
    bodyKey: "marketing:postOpportunity.tip3.body",
  },
];
