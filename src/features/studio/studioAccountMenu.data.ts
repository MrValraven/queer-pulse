import type { IconType } from "react-icons";
import { FiBarChart2, FiBell, FiMusic, FiSettings } from "react-icons/fi";
import { routes } from "../../app/routeMap";

/** Who sees a Studio account menu row. "everyone" is every Studio member;
 *  "artist" needs an uploadable persona (or the showcase); "showcase" rows
 *  open pages that only exist in demo, where live mode redirects them. */
export type StudioAccountMenuAudience = "everyone" | "artist" | "showcase";

export interface StudioAccountMenuItem {
  labelKey: string;
  to: string;
  icon: IconType;
  audience: StudioAccountMenuAudience;
}

/** The listening row at the top of the menu. */
export const STUDIO_LISTENER_ITEMS: StudioAccountMenuItem[] = [
  {
    labelKey: "studio:shell.menu.library",
    to: routes.studioLibrary,
    icon: FiMusic,
    audience: "everyone",
  },
];

/** The creator rows below the artist pages. */
export const STUDIO_CREATOR_ITEMS: StudioAccountMenuItem[] = [
  {
    labelKey: "studio:shell.menu.dashboard",
    to: routes.studioDashboard,
    icon: FiBarChart2,
    audience: "artist",
  },
  {
    labelKey: "studio:rail.main.notifications",
    to: routes.studioNotifications,
    icon: FiBell,
    audience: "showcase",
  },
  {
    labelKey: "studio:shell.menu.settings",
    to: routes.studioSettings,
    icon: FiSettings,
    audience: "showcase",
  },
];
