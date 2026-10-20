import { RiHome5Line, RiSearchLine, RiStackLine } from "react-icons/ri";
import { routes } from "../../app/routeMap";
import type { RailLink } from "./studioShell.data";

/** The live rail's main nav: Home, Search and Library, with the phone tab
 *  bar's icons. The member's playlists sit under it in the rail; Open calls,
 *  the Solidarity fund, creator tools and Help and info live in the avatar
 *  menu. */
export const LIVE_RAIL_LINKS: RailLink[] = [
  {
    label: "Home",
    labelKey: "studio:rail.main.home",
    to: routes.studio,
    end: true,
    icon: RiHome5Line,
  },
  {
    label: "Search",
    labelKey: "studio:rail.v1.search",
    to: routes.studioSearch,
    icon: RiSearchLine,
  },
  {
    label: "Library",
    labelKey: "studio:rail.v2.library",
    to: routes.studioLibrary,
    icon: RiStackLine,
  },
];
