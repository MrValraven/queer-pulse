/**
 * The mod console's sections.
 *
 * Mod tools used to be one scroll holding eight stacked surfaces. The rail
 * turns that into one pane at a time, so this list is both the navigation and
 * the set of legal `?mod=` values.
 *
 * Bans deliberately has no entry of its own: a ban is a member's state, and a
 * moderator asking "where does this person stand" should not have to guess
 * which of two lists to look in. It renders under Members.
 */
export type ModSection =
  | "overview"
  | "requests"
  | "reports"
  | "members"
  | "invites"
  | "support"
  | "card"
  | "danger";

/** Which queue's pending count rides on a rail item, when it has one. */
export type ModNavBadge = "requests" | "reports" | "support";

export interface ModNavItem {
  id: ModSection;
  /** Key in the `communities` catalog for this item's rail label. */
  labelKey: string;
  badge?: ModNavBadge;
}

export const MOD_NAV: ModNavItem[] = [
  { id: "overview", labelKey: "communities:detail.modtools.nav.overview" },
  {
    id: "requests",
    labelKey: "communities:detail.modtools.nav.requests",
    badge: "requests",
  },
  {
    id: "reports",
    labelKey: "communities:detail.modtools.nav.reports",
    badge: "reports",
  },
  { id: "members", labelKey: "communities:detail.modtools.nav.members" },
  { id: "invites", labelKey: "communities:detail.modtools.nav.invites" },
  {
    // What platform staff have offered this community (OPS-05). Badged like
    // the two queues above, because an unanswered offer of help is something
    // waiting on the moderators in exactly the same sense.
    id: "support",
    labelKey: "communities:detail.modtools.nav.support",
    badge: "support",
  },
  { id: "card", labelKey: "communities:detail.modtools.nav.card" },
  { id: "danger", labelKey: "communities:detail.modtools.nav.danger" },
];

/** Guards the `?mod=` search param. An unknown value falls back to Overview,
 *  the same way an unknown `?tab=` falls back to Pulse. */
export function isModSection(value: string | null): value is ModSection {
  return value != null && MOD_NAV.some((item) => item.id === value);
}
