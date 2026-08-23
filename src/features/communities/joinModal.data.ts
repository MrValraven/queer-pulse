import type { JoinInvolvement } from "./api/communityJoin.api";

/**
 * i18n Pattern A — chrome list (join-flow involvement options), sole
 * consumer is `JoinModalSteps.tsx`. `value` is the stable stored enum id;
 * `labelKey`/`descriptionKey` resolve through `t()` at render.
 *
 * The `value`s are exactly the backend's `CommunityJoinRequestInvolvement`
 * enum, and the answer is now sent as its own `involvement` field on the join
 * (it used to be folded into the free-text `note` as a leading text tag, which
 * left moderators reading it back out of prose).
 */
export const INVOLVEMENT: {
  value: JoinInvolvement;
  labelKey: string;
  descriptionKey: string;
}[] = [
  {
    value: "updates",
    labelKey: "communities:join.involvement.updates.label",
    descriptionKey: "communities:join.involvement.updates.desc",
  },
  {
    value: "active",
    labelKey: "communities:join.involvement.active.label",
    descriptionKey: "communities:join.involvement.active.desc",
  },
  {
    value: "organise",
    labelKey: "communities:join.involvement.organise.label",
    descriptionKey: "communities:join.involvement.organise.desc",
  },
];

/** The label key for a stored involvement id, for the mod queue's applicant
 *  card (which shows the answer as its own line rather than buried in a note).
 *  Undefined for a request that predates the field or skipped the question. */
export function involvementLabelKey(
  involvement: JoinInvolvement | null | undefined,
): string | undefined {
  return INVOLVEMENT.find((option) => option.value === involvement)?.labelKey;
}
