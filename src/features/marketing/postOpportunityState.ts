import type { Cause, Commit } from "./api/volunteering.api";

/**
 * The shape of the post/edit opportunity form's state, and its blank value.
 *
 * Kept apart from `usePostOpportunityForm` so the validation module can read
 * the state type without importing the hook that consumes the validation.
 */
export interface TaskRow {
  title: string;
  description: string;
}
export interface CommitmentRow {
  label: string;
  detail: string;
}

export interface PostOpportunityState {
  org: string;
  role: string;
  /** One to three, in the order the poster picked them. The first is the one
   *  the card leads with and tints from, so the picker appends rather than
   *  sorts. */
  causes: Cause[];
  commit: Commit;
  time: string;
  location: string;
  skills: string;
  description: string;
  spotsTotal: string;
  applyRole: string;
  why: string;
  goodFor: string;
  teamIntro: string;
  /** Slugs of connections/communities already on the team. */
  team: string[];
  partnerSlug: string;
  communitySlug: string;
  handle: string;
  tasks: TaskRow[];
  commitments: CommitmentRow[];
}

export const EMPTY: PostOpportunityState = {
  org: "",
  role: "",
  // Blank, not pre-filled: a default cause would have every poster who never
  // looked at the field filing under Rights.
  causes: [],
  commit: "low",
  time: "",
  location: "",
  skills: "",
  description: "",
  spotsTotal: "",
  applyRole: "",
  why: "",
  goodFor: "",
  teamIntro: "",
  team: [],
  partnerSlug: "",
  communitySlug: "",
  handle: "",
  tasks: [{ title: "", description: "" }],
  commitments: [{ label: "", detail: "" }],
};
