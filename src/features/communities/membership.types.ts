/** A member's role within a single community. */
export type CommunityRole = 'owner' | 'mod' | 'member'

/**
 * How a community gates joining (and whether it shows in Discover).
 * - `public`  — instant join, listed in Discover.
 * - `request` — submit a request that lands in the mods' queue; listed.
 * - `invite`  — needs an invite link/code; listed but gated.
 * - `private` — hidden from Discover unless you're invited (e.g. coming-out).
 */
export type AccessTier = 'public' | 'request' | 'invite' | 'private'

/** The current user's standing in one community. */
export interface Membership {
  role: CommunityRole
  /** Human-readable join label for display (mock; e.g. "just now"). */
  joinedAt: string
}
