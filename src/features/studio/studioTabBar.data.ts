import type { IconType } from "react-icons";
import {
  RiHome5Fill,
  RiHome5Line,
  RiSearchFill,
  RiSearchLine,
  RiStackFill,
  RiStackLine,
} from "react-icons/ri";
import { routes } from "../../app/routeMap";

export type StudioTabKey = "home" | "search" | "library";

export interface StudioTab {
  key: StudioTabKey;
  labelKey: string;
  to: string;
  /** The paths that belong to the tab's section, besides `to` itself: Home
   *  owns scenes, Search owns Browse (its genre and mood tiles open it),
   *  Library owns playlists and Liked songs. */
  sectionPaths: readonly string[];
  icon: IconType;
  /** The filled glyph shown while the tab is the current page. */
  activeIcon: IconType;
}

/** Studio's phone tab bar (StudioTabBar): Home, Search and Library. */
export const STUDIO_TABS: StudioTab[] = [
  {
    key: "home",
    labelKey: "studio:rail.main.home",
    to: routes.studio,
    sectionPaths: [routes.studioScene],
    icon: RiHome5Line,
    activeIcon: RiHome5Fill,
  },
  {
    key: "search",
    labelKey: "studio:rail.v1.search",
    to: routes.studioSearch,
    sectionPaths: [routes.studioBrowse],
    icon: RiSearchLine,
    activeIcon: RiSearchFill,
  },
  {
    key: "library",
    labelKey: "studio:rail.v2.library",
    to: routes.studioLibrary,
    sectionPaths: [routes.studioCollection, routes.studioLiked],
    icon: RiStackLine,
    activeIcon: RiStackFill,
  },
];

/** The tab whose section owns `pathname`, or null for a page any section
 *  can open (an album, an artist, a track, Settings). */
export function studioTabKeyOfPath(pathname: string): StudioTabKey | null {
  const owner = STUDIO_TABS.find(
    (tab) =>
      pathname === tab.to ||
      tab.sectionPaths.some(
        (path) => pathname === path || pathname.startsWith(`${path}/`),
      ),
  );
  return owner ? owner.key : null;
}
