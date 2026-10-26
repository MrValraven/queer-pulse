import type { ReactNode } from "react";
import {
  FiFileText,
  FiLink,
  FiMusic,
  FiStar,
  FiUser,
  FiUsers,
} from "react-icons/fi";

export interface ProfileNavItem {
  /** DOM id of the section this item scrolls to. */
  id: string;
  labelKey: string;
  groupKey: string;
  icon: ReactNode;
  /** Shown only to a viewer with a Studio grant (or in demo mode). */
  requiresStudio?: boolean;
}

/**
 * Left-sidebar items for the profile editor. Each `id` matches the `id` on a
 * section rendered by EditProfileSections, so clicking scrolls there and the
 * active state follows scroll position.
 */
export const PROFILE_NAV: ProfileNavItem[] = [
  {
    id: "identity",
    labelKey: "settings:editProfile.nav.identity.label",
    groupKey: "settings:editProfile.nav.group.profile",
    icon: <FiUser aria-hidden />,
  },
  {
    id: "bio",
    labelKey: "settings:editProfile.nav.bio.label",
    groupKey: "settings:editProfile.nav.group.profile",
    icon: <FiFileText aria-hidden />,
  },
  {
    id: "links",
    labelKey: "settings:editProfile.nav.links.label",
    groupKey: "settings:editProfile.nav.group.profile",
    icon: <FiLink aria-hidden />,
  },
  {
    id: "skills",
    labelKey: "settings:editProfile.nav.skills.label",
    groupKey: "settings:editProfile.nav.group.profile",
    icon: <FiStar aria-hidden />,
  },
  {
    id: "communities",
    labelKey: "settings:editProfile.nav.communities.label",
    groupKey: "settings:editProfile.nav.group.profile",
    icon: <FiUsers aria-hidden />,
  },
  {
    id: "playlists",
    labelKey: "settings:editProfile.nav.playlists.label",
    groupKey: "settings:editProfile.nav.group.profile",
    icon: <FiMusic aria-hidden />,
    requiresStudio: true,
  },
];

/** Catalog key for each section id's human-readable label, used in the save
 * confirmation (`SECTION_LABELS[id]` resolved via `t()` by the consumer). */
export const SECTION_LABEL_KEYS: Record<string, string> = Object.fromEntries(
  PROFILE_NAV.map((n) => [n.id, n.labelKey]),
);
