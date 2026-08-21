/**
 * Cross-feature domain types.
 *
 * These describe the app's shared community model and are consumed across
 * feature slices (communities, members, auth, feed). They previously lived in
 * `src/features/homepage/data/types.ts`; a leaf feature shouldn't own the app's
 * shared domain model, so the definitions now live here. Homepage re-exports
 * them for backward compatibility. This module must not import from any feature.
 */

export type CommunityType =
  "social" | "arts" | "activism" | "support" | "sports" | "professional";

export interface Community {
  href: string;
  type: CommunityType;
  typeLabel: string;
  name: string;
  description: string;
  count: string;
  joinLabel: string;
  dashed?: boolean;
  privateBadge?: boolean;
  /** The community's join policy, when the source knows it (the live card DTO or
   *  the demo registry). "public" = anyone can join instantly; the other tiers
   *  gate entry (request/invite) or hide the roster (private). Absent when the
   *  source doesn't carry it. Mirrors the backend `AccessTier`; inlined here
   *  because this shared module must not import from a feature slice. */
  accessTier?: "public" | "request" | "invite" | "private";
  /** Stable slug for the community detail route (`/community/:slug`). */
  slug?: string;
  /** The viewer's roster role in this community when the source knows it (the
   *  live-mode card DTO). `null`/absent means not a member — but absence is not
   *  proof of non-membership: demo mode leaves this unset and reads the session
   *  membership store instead. */
  myRole?: "owner" | "mod" | "member" | null;
  /** How many members were active in this community this week, when the
   *  source knows it (the live card DTO's `activeThisWeek`). Drives the
   *  discover grid's "Busy this week" toggle and "Most active" sort — both
   *  computed client-side since this isn't a server-sortable/filterable
   *  column. Absent in sources that don't carry it (the demo registry). */
  activeThisWeek?: number;
  /** Resolved cover-image URL, when the source knows it (the live card DTO).
   *  Absent in sources that don't carry it (the demo registry). */
  coverImageUrl?: string | null;
  /** Curated tag ids the owner/mod picked for this community (⊆ the shared
   *  `COMMUNITY_TAGS` vocabulary in `src/features/communities/communityTags.data.ts`)
   *  — shown as pills on every card variant and filterable on the discover
   *  page. Absent when the source doesn't carry it (an older cached card, or
   *  a community with none picked yet). */
  tags?: string[];
}
