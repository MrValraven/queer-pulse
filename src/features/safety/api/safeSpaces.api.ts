import { apiGet, apiPost } from "../../../shared/api/client";
import type { Category } from "../safeSpaces";

/**
 * A verified safe-space grid card from `GET /directory/safe-spaces`. Mirrors
 * the backend's `SafeSpaceCardDTO`. `reviews` is the raw count — the FE
 * composes the "N reviews" string at the adapter boundary so it can localize.
 */
export interface SafeSpaceCardDTO {
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
  stats: { verified: number; reviews: number; removed: number };
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
