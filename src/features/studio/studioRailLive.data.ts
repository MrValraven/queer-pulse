import { routes } from "../../app/routeMap";
import type { RailLink } from "./studioShell.data";

/** The live rail's main group (Studio v2): Home, Search, Library, Open
 *  calls and the Solidarity fund. Library holds your playlists and your Studio saves, so the v1
 *  Saved link (to /account/collections) leaves the rail. */
export const LIVE_RAIL_LINKS: RailLink[] = [
  {
    label: "Home",
    labelKey: "studio:rail.main.home",
    to: routes.studio,
    end: true,
  },
  {
    label: "Search",
    labelKey: "studio:rail.v1.search",
    to: routes.studioSearch,
  },
  {
    label: "Library",
    labelKey: "studio:rail.v2.library",
    to: routes.studioLibrary,
  },
  {
    label: "Open calls",
    labelKey: "studio:rail.v2.openCalls",
    to: routes.studioCalls,
  },
  {
    label: "Solidarity fund",
    labelKey: "studio:rail.contribute.solidarityFund",
    to: routes.studioSolidarityFund,
  },
];
