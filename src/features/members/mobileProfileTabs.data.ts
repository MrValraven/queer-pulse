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
}

/** Display order for the tab bar. */
export const MOBILE_PROFILE_TAB_DEFS: readonly MobileProfileTabDef[] = [
  { key: "about", labelKey: "members:profile.tabs.about", icon: FiUser },
  { key: "work", labelKey: "members:profile.tabs.work", icon: FiBriefcase },
  {
    key: "community",
    labelKey: "members:profile.tabs.community",
    icon: FiUsers,
  },
  {
    key: "activity",
    labelKey: "members:profile.tabs.activity",
    icon: FiActivity,
  },
];
