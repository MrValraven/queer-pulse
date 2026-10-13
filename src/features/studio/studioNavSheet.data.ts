import type { IconType } from "react-icons";
import {
  FiBookOpen,
  FiCalendar,
  FiDisc,
  FiEye,
  FiFileText,
  FiFlag,
  FiHeart,
  FiHelpCircle,
  FiInbox,
  FiInfo,
  FiLink,
  FiMic,
  FiRadio,
  FiShield,
  FiUpload,
  FiUploadCloud,
  FiUsers,
} from "react-icons/fi";
import { routes } from "../../app/routeMap";
import { studioUploadPath } from "./studioPaths";
import { LIVE_RAIL_LINKS } from "./studioRailLive.data";
import {
  CONTRIBUTE,
  GOVERNANCE,
  RAIL_MAIN,
  UTILITY,
  type RailLink,
} from "./studioShell.data";

/** A rail link as the phone side sheet draws it: the rail's own label and
 *  route, plus the row icon. */
export interface StudioNavSheetLink extends RailLink {
  icon: IconType;
}

export interface StudioNavSheetGroup {
  id: string;
  labelKey: string;
  links: StudioNavSheetLink[];
}

/** Pages the phone already reaches without the sheet: the four bottom tabs,
 *  and Notifications, which is a row of the account panel in the demo. */
const ROUTES_COVERED_ELSEWHERE = new Set<string>([
  routes.studio,
  routes.studioSearch,
  routes.studioLibrary,
  routes.studioCalls,
  routes.studioNotifications,
]);

/** The row icon for every rail route the sheet can draw. A route missing
 *  here falls back to FALLBACK_ICON, so add its icon with the link. */
const ICON_BY_ROUTE: Record<string, IconType> = {
  [routes.studioSet]: FiDisc,
  [routes.studioSheetStore]: FiBookOpen,
  [routes.studioLive]: FiRadio,
  [routes.studioSetSubmission]: FiUploadCloud,
  [routes.studioBroadcast]: FiMic,
  [routes.studioRights]: FiShield,
  [routes.studioSolidarityFund]: FiHeart,
  [routes.studioProgram]: FiCalendar,
  [routes.studioCouncil]: FiUsers,
  [routes.studioTriage]: FiInbox,
  [routes.studioFlagReview]: FiFlag,
  [routes.studioAbout]: FiInfo,
  [routes.studioHelp]: FiHelpCircle,
  [routes.studioAccessibility]: FiEye,
  [routes.studioTerms]: FiFileText,
};
const FALLBACK_ICON: IconType = FiLink;

function toSheetLinks(links: RailLink[]): StudioNavSheetLink[] {
  return links
    .filter((link) => !ROUTES_COVERED_ELSEWHERE.has(link.to))
    .map((link) => ({
      ...link,
      icon: ICON_BY_ROUTE[link.to] ?? FALLBACK_ICON,
    }));
}

/** Live: the live rail's links the tabs leave out (the Solidarity fund). */
export const SHEET_LIVE_LINKS = toSheetLinks(LIVE_RAIL_LINKS);

/** Live, for members with an artist page: the upload flow. */
export const SHEET_UPLOAD_LINK: StudioNavSheetLink = {
  label: "Upload",
  labelKey: "studio:rail.v1.upload",
  to: studioUploadPath(),
  icon: FiUpload,
};

/** Demo: the showcase rail's groups, each under its own label. */
export const SHEET_SHOWCASE_GROUPS: StudioNavSheetGroup[] = [
  {
    id: "more",
    labelKey: "studio:shell.sheet.more",
    links: toSheetLinks(RAIL_MAIN),
  },
  {
    id: "contribute",
    labelKey: "studio:rail.section.contribute",
    links: toSheetLinks(CONTRIBUTE),
  },
  {
    id: "governance",
    labelKey: "studio:rail.section.governance",
    links: toSheetLinks(GOVERNANCE),
  },
  {
    id: "coop",
    labelKey: "studio:rail.section.coop",
    links: toSheetLinks(UTILITY),
  },
];
