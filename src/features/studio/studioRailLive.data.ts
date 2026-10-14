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

/** The live rail's "Help and info" group (Studio open pages). */
export const LIVE_RAIL_UTILITY_LINKS: RailLink[] = [
  { label: "Help", labelKey: "studio:rail.live.help", to: routes.studioHelp },
  {
    label: "About Studio",
    labelKey: "studio:rail.live.about",
    to: routes.studioAbout,
  },
  {
    label: "Rights and takedowns",
    labelKey: "studio:rail.live.rights",
    to: routes.studioRights,
  },
  {
    label: "Studio terms",
    labelKey: "studio:rail.live.terms",
    to: routes.studioTerms,
  },
  {
    label: "Accessibility",
    labelKey: "studio:rail.live.accessibility",
    to: routes.studioAccessibility,
  },
];

/** Moderators and Admins only: the staff flag review. */
export const LIVE_RAIL_FLAG_REVIEW_LINK: RailLink = {
  label: "Flag review",
  labelKey: "studio:rail.live.flagReview",
  to: routes.studioFlagReview,
};
