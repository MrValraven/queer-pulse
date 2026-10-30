import type { Member } from "./data/members";

/**
 * One entry in the desktop rail's section-jump nav: an anchor id, the i18n
 * key for its label, and a predicate deciding whether this profile even has
 * that section to jump to (an empty section never renders below the hero, so
 * a dead link to it would be worse than no link).
 *
 * Order matches the actual render order of these sections below the hero
 * (`ProfilePage.tsx`'s `belowHero`: subprofiles, then `ProfileContent`'s
 * now/events/selected-work/board/skills/groups/shapings/activity/related, then communities,
 * then places) — not the order they were designed in.
 */
export interface ProfileSectionNavItem {
  id: string;
  labelKey: string;
  /** Whether this profile currently renders the section (non-empty). */
  isVisible: (profile: Member) => boolean;
  /** The link can carry an accent count pill for something in that section
   *  waiting on the viewer (owner view only). `ProfileSectionNav` supplies the
   *  figure; the item only declares that it takes one. */
  hasAwaitingCount?: boolean;
  /** Spoken sentence for the pill ("3 invites waiting for your answer"),
   *  with `{count}` plural variants `_one` / `_other`. */
  awaitingCountKey?: string;
}

export const PROFILE_SECTION_NAV_ITEMS: readonly ProfileSectionNavItem[] = [
  {
    id: "also-working-as",
    labelKey: "members:profile.nav.subprofiles",
    // Subprofiles are resolved by their own hook (useSubprofiles), keyed off
    // the viewer/owner, not a field on `Member`. `ProfileSectionNav`
    // (ProfileRail.tsx) resolves this id's real visibility itself via the
    // same hooks/logic `ProfileSubprofilesSection` uses, and overrides this
    // fallback — which stays `false` (hide unless proven visible) so a bug
    // in that override can't silently regress to "always show".
    isVisible: () => false,
  },
  {
    id: "now",
    labelKey: "members:profile.nav.openTo",
    // Mirrors NowSection's own empty-gate (now/NowSection.tsx), including the
    // boundary note: that card is the only place `notHereFor` renders now, so
    // a member with just a note has a real section for the rail to jump to.
    isVisible: (profile) =>
      Boolean(profile.now?.trim()) ||
      profile.openTo.length > 0 ||
      Boolean(profile.notHereFor?.trim()),
  },
  {
    id: "events",
    labelKey: "members:profile.nav.events",
    // Events come from their own hook (useProfileEvents), outside `Member`.
    // `ProfileSectionNav` overrides this fallback with the real value, the
    // same way it does for "places".
    isVisible: () => false,
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
    id: "recent-activity",
    labelKey: "members:profile.nav.activity",
    // Mirrors ActivitySection's own empty-gate (ProfileActivitySection.tsx).
    isVisible: (profile) => profile.activity.length > 0,
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
    // on `Member` — same as "also working as" above: `ProfileSectionNav`
    // overrides this fallback with the real value.
    isVisible: () => false,
    // Team invitations from businesses wait in this section (self view).
    hasAwaitingCount: true,
    awaitingCountKey: "members:profile.nav.placesAwaiting",
  },
];
