import type { IconType } from "react-icons";
import {
  FiBookOpen,
  FiCalendar,
  FiCamera,
  FiEdit3,
  FiFileText,
  FiMessageCircle,
  FiMusic,
} from "react-icons/fi";
import { MEMBERS } from "./data/members";
import { SOCIAL_PLATFORMS } from "./socialLinks.data";
import type { ActivityKind } from "./api/members.api";
import type { PublicProfileDTO } from "./api/publicProfile.api";

// The seeded registry stores each activity's icon directly; the wire DTO speaks
// `kind`. This reverses the same icon↔kind mapping the live adapter uses
// (`members.adapters.ts` ACTIVITY_ICONS) so the demo projects through the exact
// shape the public endpoint returns. Unknown icons fall back to "post".
const ICON_TO_KIND = new Map<IconType, ActivityKind>([
  [FiFileText, "post"],
  [FiCalendar, "event"],
  [FiMessageCircle, "message"],
  [FiBookOpen, "reading"],
  [FiEdit3, "edit"],
  [FiCamera, "photo"],
  [FiMusic, "music"],
]);

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
    activity: (member.activity ?? []).map((item) => ({
      kind: ICON_TO_KIND.get(item.icon) ?? "post",
      title: item.title,
      sub: item.sub,
    })),
  };
}
