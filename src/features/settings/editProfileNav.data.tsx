import type { ReactNode } from "react";

export interface ProfileNavItem {
  /** DOM id of the section this item scrolls to. */
  id: string;
  labelKey: string;
  groupKey: string;
  icon: ReactNode;
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
    icon: (
      <svg viewBox="0 0 16 16">
        <circle cx="8" cy="6" r="3" />
        <path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      </svg>
    ),
  },
  {
    id: "pronouns",
    labelKey: "settings:editProfile.nav.pronouns.label",
    groupKey: "settings:editProfile.nav.group.profile",
    icon: (
      <svg viewBox="0 0 16 16">
        <path d="M4 4h8M8 4v8M5 11l3 2 3-2" />
      </svg>
    ),
  },
  {
    id: "bio",
    labelKey: "settings:editProfile.nav.bio.label",
    groupKey: "settings:editProfile.nav.group.profile",
    icon: (
      <svg viewBox="0 0 16 16">
        <path d="M3 4h10M3 8h8M3 12h5" />
      </svg>
    ),
  },
  {
    id: "links",
    labelKey: "settings:editProfile.nav.links.label",
    groupKey: "settings:editProfile.nav.group.profile",
    icon: (
      <svg viewBox="0 0 16 16">
        <path d="M6.5 9.5a2.5 2.5 0 0 0 3.6.1l2-2a2.5 2.5 0 0 0-3.5-3.6l-1 1" />
        <path d="M9.5 6.5a2.5 2.5 0 0 0-3.6-.1l-2 2a2.5 2.5 0 0 0 3.5 3.6l1-1" />
      </svg>
    ),
  },
  {
    id: "skills",
    labelKey: "settings:editProfile.nav.skills.label",
    groupKey: "settings:editProfile.nav.group.profile",
    icon: (
      <svg viewBox="0 0 16 16">
        <polygon points="8,2 10.2,6 15,6.6 11.5,10 12.4,15 8,12.5 3.6,15 4.5,10 1,6.6 5.8,6" />
      </svg>
    ),
  },
  {
    id: "communities",
    labelKey: "settings:editProfile.nav.communities.label",
    groupKey: "settings:editProfile.nav.group.profile",
    icon: (
      <svg viewBox="0 0 16 16">
        <circle cx="5.5" cy="6" r="2" />
        <circle cx="10.5" cy="6" r="2" />
        <path d="M2 13c0-2 1.6-3.2 3.5-3.2S9 11 9 13M7 13c0-2 1.6-3.2 3.5-3.2S14 11 14 13" />
      </svg>
    ),
  },
  {
    id: "visibility",
    labelKey: "settings:editProfile.nav.visibility.label",
    groupKey: "settings:editProfile.nav.group.privacy",
    icon: (
      <svg viewBox="0 0 16 16">
        <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" />
        <circle cx="8" cy="8" r="2" />
      </svg>
    ),
  },
];

/** Catalog key for each section id's human-readable label, used in the save
 * confirmation (`SECTION_LABELS[id]` resolved via `t()` by the consumer). */
export const SECTION_LABEL_KEYS: Record<string, string> = Object.fromEntries(
  PROFILE_NAV.map((n) => [n.id, n.labelKey]),
);
