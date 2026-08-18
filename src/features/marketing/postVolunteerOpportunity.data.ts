import type { Cause, Commit } from "./api/volunteering.api";

/** Field length/count limits, mirrored exactly from the backend's
 *  `CreateOpportunityDto` (`queerpulse-backend/src/volunteering/dto/create-opportunity.dto.ts`)
 *  so the create form can surface them client-side (char counters, helper
 *  text) instead of only failing server-side after submit. */
export const MAX_ORGANIZATION_LENGTH = 200;
export const MAX_ROLE_LENGTH = 200;
export const MAX_TIME_LENGTH = 200;
export const MAX_LOCATION_LENGTH = 200;
export const MAX_APPLY_ROLE_LENGTH = 200;
export const MAX_PARTNER_SLUG_LENGTH = 100;
export const MAX_HANDLE_LENGTH = 100;
export const MAX_TEAM_INTRO_LENGTH = 2000;
export const MAX_DESCRIPTION_LENGTH = 10000;

export const MAX_SKILLS_COUNT = 50;
export const MAX_SKILL_LENGTH = 100;
export const MAX_WHY_COUNT = 30;
export const MAX_WHY_LENGTH = 2000;
export const MAX_GOOD_FOR_COUNT = 30;
export const MAX_GOOD_FOR_LENGTH = 1000;
export const MAX_TEAM_COUNT = 100;
export const MAX_TEAM_SLUG_LENGTH = 120;

export const MAX_TASK_TITLE_LENGTH = 200;
export const MAX_TASK_DESCRIPTION_LENGTH = 2000;
export const MAX_COMMITMENT_LABEL_LENGTH = 200;
export const MAX_COMMITMENT_DETAIL_LENGTH = 2000;

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
