/**
 * Cache keys for "Meet the team". The business side lives under
 * `["listings", "team"]` and the persona side under `["subprofile",
 * "team-links"]`, so a write on one side can refresh the other with one
 * prefix (a member on both sides sees both lists move).
 *
 * `isDemoMode` is the last segment of every key, so a runtime demo toggle
 * reads its own cache entry for that mode. Every invalidation prefix stops
 * before it and so covers both modes.
 */
export const listingTeamQueryKeys = {
  manager: (listingRef: string, isDemoMode: boolean) =>
    ["listings", "team", listingRef, isDemoMode] as const,
  managerCandidatesPrefix: (listingRef: string) =>
    ["listings", "team", listingRef, "candidates"] as const,
  managerCandidates: (listingRef: string, query: string, isDemoMode: boolean) =>
    ["listings", "team", listingRef, "candidates", query, isDemoMode] as const,
  persona: (subprofileId: string, isDemoMode: boolean) =>
    ["subprofile", "team-links", subprofileId, isDemoMode] as const,
  /** The signed-in member's own invites and teams (`/me/team-links`). */
  memberLinks: (isDemoMode: boolean) =>
    ["subprofile", "team-links", "member", isDemoMode] as const,
  personaCandidatesPrefix: (subprofileId: string) =>
    ["subprofile", "team-links", subprofileId, "candidates"] as const,
  personaCandidates: (
    subprofileId: string,
    query: string,
    isDemoMode: boolean,
  ) =>
    [
      "subprofile",
      "team-links",
      subprofileId,
      "candidates",
      query,
      isDemoMode,
    ] as const,
};
