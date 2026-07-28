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
  /** Stable slug for the community detail route (`/community/:slug`). */
  slug?: string;
  /** The viewer's roster role in this community when the source knows it (the
   *  live-mode card DTO). `null`/absent means not a member — but absence is not
   *  proof of non-membership: demo mode leaves this unset and reads the session
   *  membership store instead. */
  myRole?: "owner" | "mod" | "member" | null;
}
