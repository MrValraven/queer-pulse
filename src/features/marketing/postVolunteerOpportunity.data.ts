import type { Commit } from "./api/volunteering.api";

/** Field length/count limits, mirrored exactly from the backend's
 *  `CreateOpportunityDto` (`queerpulse-backend/src/volunteering/dto/create-opportunity.dto.ts`)
 *  so the create form can surface them client-side (char counters, helper
 *  text) instead of only failing server-side after submit. */
export const MAX_ORGANIZATION_LENGTH = 200;
export const MAX_ROLE_LENGTH = 200;
export const MAX_TIME_LENGTH = 200;
export const MAX_LOCATION_LENGTH = 200;
export const MAX_APPLY_ROLE_LENGTH = 200;
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

/**
 * The `id` on the cause picker's chip group, so the "still missing" checklist
 * can jump to it the way it jumps to a required input. The picker is a chip
 * group rather than an input, so this lands on the group element and focus
 * moves to its first chip.
 */
export const CAUSE_PICKER_CONTROL_ID = "post-opportunity-causes";

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

/**
 * The fields that must be filled before the form can be posted or saved, in
 * the order they appear on the page — the "still missing" checklist under the
 * submit button reads top to bottom, so clicking down the list walks the form
 * downwards rather than jumping around it.
 */
export const REQUIRED_FIELDS = [
  "org",
  "role",
  "time",
  "location",
  "spotsTotal",
  "description",
] as const;

export type RequiredField = (typeof REQUIRED_FIELDS)[number];

/**
 * The label each required field is called by in the "still missing" checklist —
 * the same key the field's own `FormField` label uses, so the list names things
 * exactly as the form does.
 *
 * A full `Record`, deliberately never a `Partial`: adding a field to
 * `REQUIRED_FIELDS` without naming it here is a type error rather than a blank
 * row in the checklist.
 */
export const REQUIRED_FIELD_LABEL_KEYS: Record<RequiredField, string> = {
  org: "marketing:postOpportunity.core.orgLabel",
  role: "marketing:postOpportunity.core.roleLabel",
  time: "marketing:postOpportunity.core.timeLabel",
  location: "marketing:postOpportunity.core.locationLabel",
  spotsTotal: "marketing:postOpportunity.core.spotsLabel",
  description: "marketing:postOpportunity.core.descLabel",
};

/**
 * The `id` a required field's control carries. `PostOpportunityCoreFields`
 * puts it on the input itself (`FormField` keeps a caller-supplied id and
 * points its `<label for>` at it), so the checklist can look the control up
 * and move focus straight to it.
 */
export const requiredFieldControlId = (field: RequiredField): string =>
  `post-opportunity-${field}`;

/**
 * The `id` on a repeatable row's leading input. A row is only sent when that
 * input is filled, so it is the one the "still missing" checklist points at
 * when a row has a detail typed under an empty title.
 */
export const taskTitleControlId = (index: number): string =>
  `post-opportunity-task-${index}-title`;

export const commitmentLabelControlId = (index: number): string =>
  `post-opportunity-commitment-${index}-label`;
