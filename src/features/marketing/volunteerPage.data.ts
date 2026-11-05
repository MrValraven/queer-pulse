import type { Cause, Commit } from "./api/volunteering.api";
import { CAUSES } from "./causes.data";

/** The "no preference" value at the top of each sidebar radio group. */
export const ANY_OPTION = "any";

export type CommitmentChoice = Commit | typeof ANY_OPTION;
export type CauseChoice = Cause | typeof ANY_OPTION;

/** One radio row in a volunteer sidebar section. */
export interface VolunteerFilterOption<Value extends string> {
  value: Value;
  labelKey: string;
}

/** The "Time commitment" section: any, then by how much time it asks of you. */
export const COMMITMENT_OPTIONS: readonly VolunteerFilterOption<CommitmentChoice>[] =
  [
    { value: ANY_OPTION, labelKey: "marketing:volunteer.filter.anyCommitment" },
    { value: "low", labelKey: "marketing:volunteer.filter.low" },
    { value: "medium", labelKey: "marketing:volunteer.filter.medium" },
  ];

/** The "Cause" section: any, then every cause in taxonomy order, derived from
 *  `CAUSES` so a new cause appears here without anyone remembering to add it
 *  (`causes.test.ts` holds this list to the taxonomy). Commitment and cause
 *  are separate groups, so picking a cause keeps the commitment. */
export const CAUSE_OPTIONS: readonly VolunteerFilterOption<CauseChoice>[] = [
  { value: ANY_OPTION, labelKey: "marketing:volunteer.filter.anyCause" },
  ...CAUSES.map((cause) => ({ value: cause.value, labelKey: cause.labelKey })),
];
