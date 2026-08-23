import type { CommunityType } from "../homepage/data/types";

/** Which pool the communities grid is showing: the whole discover directory,
 *  or only the communities the viewer already belongs to ("My communities").
 *  Maps 1:1 onto the list endpoint's `filter` param. */
export type CommunitiesScope = "discover" | "mine";

/** "Newest"/"Name" are real server-side sorts; "active" ("Most active") isn't
 *  — the backend can't order by `activeThisWeek` (see the drain note in
 *  `CommunitiesDiscover`), so it's applied client-side after a full drain. */
export type DiscoverSort = "newest" | "name" | "active";
export const SORT_OPTIONS: DiscoverSort[] = ["newest", "name", "active"];

/** A community counts as "busy this week" past this activity threshold —
 *  matches the mockup's own cut, no server signal exists for it yet. */
export const BUSY_THRESHOLD = 15;

export const FILTERS: { value: "all" | CommunityType; labelKey: string }[] = [
  { value: "all", labelKey: "communities:category.all" },
  { value: "social", labelKey: "communities:category.social" },
  { value: "arts", labelKey: "communities:category.arts" },
  { value: "activism", labelKey: "communities:category.activism" },
  { value: "support", labelKey: "communities:category.support" },
  { value: "sports", labelKey: "communities:category.sports" },
  { value: "professional", labelKey: "communities:category.professional" },
];
