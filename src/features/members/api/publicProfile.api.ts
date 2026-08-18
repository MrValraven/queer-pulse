import { apiGet, apiPut } from "../../../shared/api/client";
import type { ActivityKind } from "./members.api";

/**
 * The member's public-profile preference.
 *
 * Scope note: this endpoint stores a flag and nothing more — it records what the
 * member wants. What actually gets served to the open web is
 * `GET /public/profiles/:slug` below.
 */
export interface PublicProfileVisibilityDTO {
  enabled: boolean;
}

/** One outbound link a member chose to show publicly. */
export interface PublicProfileLinkDTO {
  label: string;
  url: string;
}

/** One piece of work on the public profile. */
export interface PublicProfileWorkDTO {
  title: string;
  year: string;
  imageUrl: string | null;
}

/**
 * One "Recent activity" entry, as the open web sees it.
 *
 * No link is carried on purpose: the backend drops `toLink` for the public
 * endpoint, so a logged-out visitor sees the fact of an action ("Posted in X"),
 * never a map of the member's in-app URLs. `kind` only drives the icon.
 */
export interface PublicProfileActivityDTO {
  kind: ActivityKind;
  title: string;
  sub: string | null;
}

/**
 * A member's profile as the open web sees it. Deliberately a small, flat shape:
 * only what the member published, and nothing that would leak the member surface
 * (no vouches, no connections, no posts, no email).
 */
export interface PublicProfileDTO {
  slug: string;
  displayName: string;
  pronouns: string | null;
  tagline: string | null;
  avatarUrl: string | null;
  bio: string | null;
  links: PublicProfileLinkDTO[];
  work: PublicProfileWorkDTO[];
  /** Recent public activity ("Recent activity") — see the DTO note above. */
  activity: PublicProfileActivityDTO[];
}

/** The signed-in member's real eligibility signals (live mode). */
export interface PublicEligibilitySignalsDto {
  verified: boolean;
  tenureDays: number;
  publishedPieces: string[];
  hostedOpenEvents: string[];
  workshopsTaught: number;
  publishedSubprofiles: number;
  vouchCount: number;
  /** How many members this member has vouched FOR (not withdrawn), the
   *  outbound side of the trust graph, distinct from `vouchCount` (inbound).
   *  Powers the getting-started "vouch for someone" milestone, which must
   *  not false-positive off an inbound vouch the member never gave. */
  vouchesGivenCount: number;
  endorsementCount: number;
  connectionCount: number;
  eventsAttended: number;
  communityPosts: number;
  lastActiveDaysAgo: number;
  standingOk: boolean;
}

/** GET /me/public-eligibility */
export function getPublicEligibilitySignals(): Promise<PublicEligibilitySignalsDto> {
  return apiGet<PublicEligibilitySignalsDto>("/me/public-eligibility");
}

/** GET /me/public-profile */
export async function getPublicProfileVisibility(): Promise<PublicProfileVisibilityDTO> {
  const res =
    await apiGet<Partial<PublicProfileVisibilityDTO>>("/me/public-profile");
  return { enabled: res?.enabled === true };
}

/** PUT /me/public-profile */
export async function putPublicProfileVisibility(
  enabled: boolean,
): Promise<PublicProfileVisibilityDTO> {
  const res = await apiPut<Partial<PublicProfileVisibilityDTO>>(
    "/me/public-profile",
    { enabled },
  );
  return { enabled: res?.enabled === true };
}

/**
 * GET /public/profiles/:slug — the one member endpoint that answers without a
 * session (`@Public()` on the backend).
 *
 * 404 is the only negative answer, and it is deliberately ambiguous: a member
 * who hasn't published, a deactivated member and a slug that was never real all
 * come back identically. Callers must keep it that way — distinguishing them in
 * the UI would turn this endpoint into a way to test whether someone is here.
 */
export async function getPublicProfile(
  slug: string,
): Promise<PublicProfileDTO> {
  const res = await apiGet<PublicProfileDTO>(
    `/public/profiles/${encodeURIComponent(slug)}`,
  );
  return {
    slug: res.slug,
    displayName: res.displayName,
    pronouns: res.pronouns ?? null,
    tagline: res.tagline ?? null,
    avatarUrl: res.avatarUrl ?? null,
    bio: res.bio ?? null,
    links: res.links ?? [],
    work: res.work ?? [],
    activity: res.activity ?? [],
  };
}
