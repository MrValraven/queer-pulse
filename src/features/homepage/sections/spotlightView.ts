import type { AvatarTint } from "../../../shared/components/ui";

/**
 * The normalized shape the featured spotlight card renders. Both the demo
 * fixtures (rich `Member` records) and the live `/landing/features` DTO (a lean
 * name/tagline/avatar/quote slice) map into this, so `SpotlightFace` /
 * `FeaturedSpotlightCard` are decoupled from either data source. Fields the live
 * feed can't supply — `hood`, `tags`, `vouchedBy` — are optional; the card hides
 * the corresponding bits gracefully rather than inventing them.
 */
export interface SpotlightView {
  /** Slug/key: profile-link target and staff-badge lookup. */
  key: string;
  /** Route to the member's public profile. */
  to: string;
  name: string;
  /** Fallback mark shown when there's no portrait. */
  initials: string;
  tint: AvatarTint;
  /** Portrait URL, already resolved; falls back to `initials` when absent. */
  photoUrl?: string;
  /** Role / headline line; `hood` is appended when present. */
  role?: string;
  hood?: string;
  tags: string[];
  verified: boolean;
  /** Voucher name for the "vouched by …" line; omitted when unknown. */
  vouchedBy?: string;
  quote: string;
}

/**
 * Rotate live members through the three brand tints so a set of featured cards
 * doesn't come out all one colour. Deterministic on the key, so a given member
 * keeps the same tint across renders (and across the carousel's clones).
 */
const LIVE_TINTS: AvatarTint[] = ["coral", "jade", "plum"];
export function tintForKey(key: string): AvatarTint {
  let hash = 0;
  for (let index = 0; index < key.length; index += 1) {
    hash += key.charCodeAt(index);
  }
  return LIVE_TINTS[hash % LIVE_TINTS.length] ?? "plum";
}
