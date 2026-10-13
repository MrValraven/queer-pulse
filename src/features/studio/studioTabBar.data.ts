import type { IconType } from "react-icons";
import {
  RiHome5Fill,
  RiHome5Line,
  RiMegaphoneFill,
  RiMegaphoneLine,
  RiSearchFill,
  RiSearchLine,
  RiStackFill,
  RiStackLine,
} from "react-icons/ri";
import { routes } from "../../app/routeMap";

export interface StudioTab {
  key: string;
  labelKey: string;
  to: string;
  /** Match the path exactly, so Home is not active on every Studio page. */
  end?: boolean;
  icon: IconType;
  /** The filled glyph shown while the tab is the current page. */
  activeIcon: IconType;
}

/** Studio's phone tab bar (StudioTabBar), Spotify's four destinations. */
export const STUDIO_TABS: StudioTab[] = [
  {
    key: "home",
    labelKey: "studio:rail.main.home",
    to: routes.studio,
    end: true,
    icon: RiHome5Line,
    activeIcon: RiHome5Fill,
  },
  {
    key: "search",
    labelKey: "studio:rail.v1.search",
    to: routes.studioSearch,
    icon: RiSearchLine,
    activeIcon: RiSearchFill,
  },
  {
    key: "library",
    labelKey: "studio:rail.v2.library",
    to: routes.studioLibrary,
    icon: RiStackLine,
    activeIcon: RiStackFill,
  },
  {
    key: "openCalls",
    labelKey: "studio:shell.tabs.openCalls",
    to: routes.studioCalls,
    icon: RiMegaphoneLine,
    activeIcon: RiMegaphoneFill,
  },
];
