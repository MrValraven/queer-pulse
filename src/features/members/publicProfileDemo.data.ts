import { MEMBERS } from "./data/members";
import { SOCIAL_PLATFORMS } from "./socialLinks.data";
import type { PublicProfileDTO } from "./api/publicProfile.api";

/**
 * Demo mode's stand-in for GET /public/profiles/:slug.
 *
 * Projects a member out of the seeded registry through the same narrow shape the
 * endpoint returns — name, pronouns, tagline, avatar, bio, links, work — and
 * nothing else. Everything the member surface holds (vouches, groups, board,
 * activity, `now`, `lookingFor`, `identities`) is dropped here on purpose, so
 * the demo can't accidentally show a logged-out visitor something the real
 * public endpoint would never serve.
 *
 * Only members whose visibility is "open" are published, mirroring the backend's
 * "has the member published?" check. Everyone else returns null — the same
 * answer an unknown slug gets, which is the point: demo mode must not become a
 * way to tell "hasn't published" apart from "isn't here".
 */
export function demoPublicProfile(slug: string): PublicProfileDTO | null {
  const member = MEMBERS[slug];
  if (!member || member.visibility !== "open") return null;

  return {
    slug: member.slug,
    displayName: `${member.first} ${member.last}`,
    pronouns: member.pronouns ?? null,
    tagline: member.role || null,
    avatarUrl: member.photo ?? null,
    bio: member.bio || null,
    links: (member.socials ?? []).map((link) => ({
      label:
        SOCIAL_PLATFORMS.find((p) => p.key === link.platform)?.label ??
        link.platform,
      url: link.urlOrHandle,
    })),
    work: member.work.map((item) => ({
      title: item.title,
      year: item.year,
      imageUrl: item.image ?? null,
    })),
  };
}
