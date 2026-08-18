import type { Member } from "./data/members";

/**
 * One entry in the desktop rail's section-jump nav: an anchor id, the i18n
 * key for its label, and a predicate deciding whether this profile even has
 * that section to jump to (an empty section never renders below the hero, so
 * a dead link to it would be worse than no link).
 *
 * Order matches the actual render order of these sections below the hero
 * (`ProfilePage.tsx`'s `belowHero`: subprofiles, then `ProfileContent`'s
 * now/selected-work/board/skills/groups/shapings/related, then communities,
 * then places) — not the order they were designed in.
 */
export interface ProfileSectionNavItem {
  id: string;
  labelKey: string;
  /** Whether this profile currently renders the section (non-empty). */
  isVisible: (profile: Member) => boolean;
}

export const PROFILE_SECTION_NAV_ITEMS: readonly ProfileSectionNavItem[] = [
  {
    id: "also-working-as",
    labelKey: "members:profile.nav.subprofiles",
    // Subprofiles are resolved by their own hook (useSubprofiles), keyed off
    // the viewer/owner, not a field on `Member` — ProfileRail only receives
    // `profile: Member`, so there's no reliable signal here. Always shown;
    // see the task report's concerns section.
    isVisible: () => true,
  },
  {
    id: "now",
    labelKey: "members:profile.nav.openTo",
    // Mirrors NowSection's own empty-gate (ProfileContentSections.tsx).
    isVisible: (profile) =>
      Boolean(profile.now?.trim()) || profile.openTo.length > 0,
  },
  {
    id: "selected-work",
    labelKey: "members:profile.nav.work",
    isVisible: (profile) => profile.work.length > 0,
  },
  {
    id: "board",
    labelKey: "members:profile.nav.board",
    isVisible: (profile) => profile.board.length > 0,
  },
  {
    id: "skills",
    labelKey: "members:profile.nav.skills",
    isVisible: (profile) => profile.skills.length > 0,
  },
  {
    id: "groups",
    labelKey: "members:profile.nav.groups",
    isVisible: (profile) => profile.groups.length > 0,
  },
  {
    id: "shapings",
    labelKey: "members:profile.nav.shapings",
    isVisible: (profile) => Object.keys(profile.shapings).length > 0,
  },
  {
    id: "related",
    labelKey: "members:profile.nav.related",
    isVisible: (profile) =>
      profile.related.length > 0 || (profile.relatedCards?.length ?? 0) > 0,
  },
  {
    id: "communities",
    labelKey: "members:profile.nav.communities",
    // `featuredCommunities` is the visitor-view source of truth
    // (useProfileFeaturedCommunities reads it verbatim for `!isSelf`). The
    // self view instead resolves live from an editable draft this component
    // doesn't have access to, so this can be very slightly stale for the
    // owner mid-edit — acceptable approximation, see task report.
    isVisible: (profile) => (profile.featuredCommunities?.length ?? 0) > 0,
  },
  {
    id: "places",
    labelKey: "members:profile.nav.places",
    // Places are resolved by their own hook (useMemberListings), not a field
    // on `Member` — same limitation as "also working as" above.
    isVisible: () => true,
  },
];
