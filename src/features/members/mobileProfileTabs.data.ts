import type { IconType } from "react-icons";
import { FiActivity, FiBriefcase, FiUser, FiUsers } from "react-icons/fi";

/** The four content-tab groups on the mobile profile (Instagram-style
 *  grid/reels/tagged bar). "about" and "community" always render (their
 *  sections self-hide individually instead); "work" and "activity" self-hide
 *  the whole tab per profile when their backing data is empty — see
 *  `tabHasContent` in `MobileProfileTabs`. */
export type MobileProfileTabKey = "about" | "work" | "community" | "activity";

export interface MobileProfileTabDef {
  key: MobileProfileTabKey;
  labelKey: string;
  icon: IconType;
  /** Plural base key (`_one` / `_other`) of the spoken sentence for an accent
   *  count pill on this tab. Only the owner's own view mounts the pill. */
  awaitingCountKey?: string;
}

/** Display order for the tab bar. */
export const MOBILE_PROFILE_TAB_DEFS: readonly MobileProfileTabDef[] = [
  { key: "about", labelKey: "members:profile.tabs.about", icon: FiUser },
  { key: "work", labelKey: "members:profile.tabs.work", icon: FiBriefcase },
  {
    key: "community",
    labelKey: "members:profile.tabs.community",
    icon: FiUsers,
    awaitingCountKey: "members:profile.nav.placesAwaiting",
  },
  {
    key: "activity",
    labelKey: "members:profile.tabs.activity",
    icon: FiActivity,
  },
];

/** URL hashes that live inside a tab which is not open by default. On a phone
 *  only the active tab's sections are in the DOM, so a link to one of these
 *  (`/account/profile#places` from a team-invite notification) has to open
 *  the tab first. Desktop renders every section, so its hashes need no help. */
export const MOBILE_PROFILE_HASH_TABS: Readonly<
  Record<string, MobileProfileTabKey>
> = {
  places: "community",
};
