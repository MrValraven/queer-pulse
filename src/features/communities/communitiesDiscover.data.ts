import type { CommunityType } from "../homepage/data/types";

/** Which pool the communities grid is showing: the whole discover directory,
 *  or only the communities the viewer already belongs to ("My communities").
 *  Maps 1:1 onto the list endpoint's `filter` param. */
export type CommunitiesScope = "discover" | "mine";

/** "Newest"/"Name" are sent to the server; "active" ("Most active") is not —
 *  the backend does support `sort=active` off the indexed `active_this_week`
 *  counter, but the frontend still drains every page and re-sorts in memory
 *  (see the drain note in `useDiscoverCommunities`). */
export type DiscoverSort = "newest" | "name" | "active";
export const SORT_OPTIONS: DiscoverSort[] = ["newest", "name", "active"];

/** A community counts as "busy this week" at or above this many active
 *  members. DEMO MODE ONLY: live mode sends `?busy=true` and the server applies
 *  its own `BUSY_THRESHOLD` (`community-browse-facets.ts`) over the indexed
 *  `communities.active_this_week`, so nothing re-applies this cut to live data.
 *  Keep the two numbers equal so the demo prototype and the real directory draw
 *  the line in the same place. */
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
