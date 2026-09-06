/** A member's role within a single community. */
/**
 * A member's standing on one community's roster.
 *
 * `co_owner` carries owner-level powers by design, with three exceptions kept
 * strictly to the single accountable owner: transferring ownership, archiving
 * the community, and changing another owner's or co-owner's role. Use
 * `isCommunityStaff()` rather than comparing against `"owner"` and `"mod"` by
 * hand, or a co-owner silently reads as an ordinary member.
 */
export type CommunityRole = "owner" | "co_owner" | "mod" | "member";

/**
 * How a community gates joining (and whether it shows in Discover).
 * - `public`  — instant join, listed in Discover.
 * - `request` — submit a request that lands in the mods' queue; listed.
 * - `invite`  — listed, and only a member holding a per-person invitation gets
 *   in (PRD-141). There is no shareable code and no invite link: an uninvited
 *   join answers `outcome: "invite_required"`, and an invitation holder is
 *   admitted at once. This used to behave exactly like `request`, so the
 *   setting gated nothing.
 * - `private` — hidden from Discover, and its very existence is withheld: the
 *   detail 404s everybody except its roster and the people holding an
 *   invitation to it (e.g. coming-out and survivors' groups).
 */
export type AccessTier = "public" | "request" | "invite" | "private";

/** The current user's standing in one community. */
export interface Membership {
  role: CommunityRole;
  /** Human-readable join label for display (mock; e.g. "just now"). */
  joinedAt: string;
  /**
   * The community's display name. Live mode carries it from `GET /me/communities`
   * (`MyCommunityDTO.name`) so cross-community surfaces resolve names from real
   * data instead of the mock directory. Optional: the demo membership store
   * doesn't set it and falls back to the static directory.
   */
  name?: string;
}
