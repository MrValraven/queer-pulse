import { apiGet, apiPost } from "../../../shared/api/client";
import type { Category } from "../safeSpaces";

/**
 * A verified safe-space grid card from `GET /directory/safe-spaces`. Mirrors
 * the backend's `SafeSpaceCardDTO`. `reviews` is the raw count — the FE
 * composes the "N reviews" string at the adapter boundary so it can localize.
 */
export interface SafeSpaceCardDTO {
  /**
   * The union discriminant against `RemovedSpaceCardDTO`, and DELIBERATELY
   * still `"verified"` for a space whose badge is suspended. A third value
   * here would drop a suspended space into the removed branch, which reads as
   * "we took it away" and is a worse untruth than the one being fixed. Read
   * `isBadgeSuspended` below to know whether the badge currently speaks, never
   * this field.
   */
  status: "verified";
  slug: string;
  cat: Category;
  typeLabel: string;
  name: string;
  hood: string;
  desc: string;
  tags: string[];
  rating: string;
  reviews: number;
  tier: number | null;
  /**
   * True while an open review stands against this badge: members flagged the
   * space, or a moderator paused it directly. The grant itself is untouched
   * and comes back when the review closes.
   *
   * Any surface rendering a badge MUST read this. A space carrying `true` has
   * to read as under review, never as verified. It carries no flag count and
   * names no flagger, and neither may anything built on it: a public tally
   * would turn a safety mechanism into a pillory and make flagging unsafe for
   * the person who did it.
   *
   * The LIST never carries a suspended card (the server drops them from
   * `verified`, from the "verified first" ordering and from `stats`), so in
   * practice only the DETAIL arrives with `true`. Absent on older payloads.
   */
  isBadgeSuspended?: boolean;
  /** The badge still stands and has stood for more than a year, so it is due
   * its annual re-review. Never a suspension: the badge still shows. Absent on
   * older payloads. */
  isBadgeDueForReReview?: boolean;
}

/**
 * A removed-space grid card from `GET /directory/safe-spaces`. Mirrors the
 * backend's `RemovedSpaceCardDTO`.
 */
export interface RemovedSpaceCardDTO {
  status: "removed";
  slug: string;
  cat: Category;
  typeLabel: string;
  name: string;
  hood: string;
  reason: string;
  removedDate: string;
  listedSince: string;
  flags: number;
}

/** Payload of `GET /directory/safe-spaces` — the safe-spaces directory page. */
export interface SafeSpaceListDTO {
  verified: SafeSpaceCardDTO[];
  removed: RemovedSpaceCardDTO[];
  stats: {
    verified: number;
    reviews: number;
    /** Safe spaces standing in the REMOVED state right now. The backend
     *  applies no date filter, so this is never "removals this year" and the
     *  hub's copy no longer says it is. */
    removed: number;
    /** Newest `YYYY-MM-DD` badge date across the verified spaces on the page,
     *  or null when no badge carries one. Optional so an older payload (and
     *  the fixtures in this repo's tests) still typecheck. */
    lastReVerifiedAt?: string | null;
  };
}

/**
 * The full verified-space detail payload from `GET /directory/safe-spaces/:slug`.
 * Mirrors the backend's `SafeSpaceDetailDTO`.
 */
export interface SafeSpaceDetailDTO extends SafeSpaceCardDTO {
  eyebrow: string;
  sub: string;
  verifier: string;
  reVerified: string;
  metaPills: { label: string; accent?: boolean }[];
  promises: { title: string; desc: string }[];
  vouches: {
    initials: string;
    name: string;
    tint: "coral" | "jade" | "plum";
    byline: string;
    text: string;
    when: string;
  }[];
  glance: { label: string; value: string; accent?: boolean }[];
  address: string;
}

/**
 * The full removed-space detail payload from `GET /directory/safe-spaces/:slug`.
 * Mirrors the backend's `RemovedSpaceDetailDTO`.
 */
export interface RemovedSpaceDetailDTO extends RemovedSpaceCardDTO {
  reasonLong: string[];
  timeline: { date: string; event: string }[];
  whatNow: string;
}

/** Discriminated union returned by `GET /directory/safe-spaces/:slug`. */
export type AnySafeSpaceDetailDTO = SafeSpaceDetailDTO | RemovedSpaceDetailDTO;

/** GET /directory/safe-spaces — the safe-spaces directory grid + stats. */
export const getSafeSpaces = () =>
  apiGet<SafeSpaceListDTO>("/directory/safe-spaces");

/** GET /directory/safe-spaces/:slug — one safe space by slug, verified or removed. */
export const getSafeSpace = (slug: string) =>
  apiGet<AnySafeSpaceDetailDTO>(
    `/directory/safe-spaces/${encodeURIComponent(slug)}`,
  );

/** Body of `POST /safe-space-nominations`. Only `placeName` is required. */
export interface CreateSafeSpaceNominationBody {
  placeName: string;
  address?: string;
  placeType?: string;
  listingRef?: string;
  reason?: string;
}

/** The recorded nomination echoed back by `POST /safe-space-nominations`. */
export interface SafeSpaceNominationDTO {
  id: string;
  placeName: string;
  address: string | null;
  placeType: string | null;
  listingRef: string | null;
  reason: string | null;
  status: string;
  createdAt: string;
}

/**
 * POST /safe-space-nominations — suggest a place be reviewed for the safe-space
 * badge. Lands in the moderation queue as `pending`; nothing surfaces publicly.
 */
export const submitSafeSpaceNomination = (
  body: CreateSafeSpaceNominationBody,
) => apiPost<SafeSpaceNominationDTO>("/safe-space-nominations", body);
