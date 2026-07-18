import { apiGet, apiPut } from "../../../shared/api/client";

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
  };
}
