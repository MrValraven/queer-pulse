import type { IconType } from "react-icons";
import {
  FiAlertTriangle,
  FiAward,
  FiBarChart2,
  FiBell,
  FiBookOpen,
  FiCalendar,
  FiClipboard,
  FiCreditCard,
  FiDisc,
  FiEye,
  FiFileText,
  FiFlag,
  FiHeadphones,
  FiHeart,
  FiHelpCircle,
  FiInbox,
  FiInfo,
  FiMic,
  FiPaperclip,
  FiRadio,
  FiSettings,
  FiShield,
  FiUpload,
  FiUploadCloud,
  FiUsers,
  FiVolume2,
} from "react-icons/fi";
import { routes } from "../../app/routeMap";
import { studioClaimsPath } from "./studioClaimPaths";
import { studioUploadPath } from "./studioPaths";

/** Who sees a Studio account menu row. "everyone" is every Studio member;
 *  "artist" needs an uploadable persona (or the showcase); "showcase" rows
 *  open pages that only exist in demo, where live mode redirects them;
 *  "staff" is Moderators and Admins (every member in the demo). */
export type StudioAccountMenuAudience =
  "everyone" | "artist" | "showcase" | "staff";

/** A live count beside a row's label. "review" is the staff queue's pair:
 *  claims and takedown disputes waiting for our team. "counterWindows" is
 *  the artist's claims they can still answer with a counter-notice. */
export type StudioAccountMenuBadge =
  "creditRequests" | "myClaims" | "review" | "counterWindows";

export interface StudioAccountMenuItem {
  labelKey: string;
  to: string;
  icon: IconType;
  audience: StudioAccountMenuAudience;
  badge?: StudioAccountMenuBadge;
}

/** How many artist pages the menu lists before "Show all". */
export const STUDIO_MENU_ARTIST_PAGES_SHOWN = 3;

/** The phone sheet's first group in the showcase: the demo's listening
 *  pages, which the desktop rail lists in its main nav. */
export const STUDIO_MENU_LISTEN_ITEMS_SHOWCASE: StudioAccountMenuItem[] = [
  {
    labelKey: "studio:rail.main.wednesdaySet",
    to: routes.studioSet,
    icon: FiDisc,
    audience: "showcase",
  },
  {
    labelKey: "studio:rail.main.sheetMusic",
    to: routes.studioSheetStore,
    icon: FiBookOpen,
    audience: "showcase",
  },
  {
    labelKey: "studio:rail.main.liveBroadcasts",
    to: routes.studioLive,
    icon: FiRadio,
    audience: "showcase",
  },
];

/** The Creator group: making, credits, claims and calls. */
export const STUDIO_MENU_CREATOR_ITEMS: StudioAccountMenuItem[] = [
  {
    labelKey: "studio:rail.v1.upload",
    to: studioUploadPath(),
    icon: FiUpload,
    audience: "everyone",
  },
  {
    labelKey: "studio:rail.v2.yourNumbers",
    to: routes.studioDashboard,
    icon: FiBarChart2,
    audience: "artist",
  },
  {
    labelKey: "studio:rail.v3.pressKit",
    to: routes.studioPressEdit,
    icon: FiPaperclip,
    audience: "artist",
  },
  {
    labelKey: "studio:credits.nav",
    to: routes.studioCredits,
    icon: FiAward,
    audience: "everyone",
    badge: "creditRequests",
  },
  {
    labelKey: "studio:shell.menu.myClaims",
    to: studioClaimsPath(),
    icon: FiClipboard,
    audience: "everyone",
    badge: "myClaims",
  },
  {
    // DES-84: a claim holds one of the artist's tracks offline and they can
    // still answer it. The row links to the track's claim panel.
    labelKey: "studio:shell.menu.counterWindows",
    to: routes.studioDashboard,
    icon: FiAlertTriangle,
    audience: "artist",
    badge: "counterWindows",
  },
  {
    labelKey: "studio:rail.v2.openCalls",
    to: routes.studioCalls,
    icon: FiVolume2,
    audience: "everyone",
  },
  {
    labelKey: "studio:creator.nav.payouts",
    to: routes.studioPayouts,
    icon: FiCreditCard,
    audience: "showcase",
  },
];

/** The showcase's Contribute group. */
export const STUDIO_MENU_CONTRIBUTE_ITEMS: StudioAccountMenuItem[] = [
  {
    labelKey: "studio:rail.contribute.submitSet",
    to: routes.studioSetSubmission,
    icon: FiUploadCloud,
    audience: "showcase",
  },
  {
    labelKey: "studio:rail.contribute.goLive",
    to: routes.studioBroadcast,
    icon: FiMic,
    audience: "showcase",
  },
];

/** The showcase's co-op group. */
export const STUDIO_MENU_COOP_ITEMS: StudioAccountMenuItem[] = [
  {
    labelKey: "studio:rail.governance.programWeek",
    to: routes.studioProgram,
    icon: FiCalendar,
    audience: "showcase",
  },
  {
    labelKey: "studio:rail.governance.curationCouncil",
    to: routes.studioCouncil,
    icon: FiUsers,
    audience: "showcase",
  },
  {
    labelKey: "studio:rail.governance.submissionInbox",
    to: routes.studioTriage,
    icon: FiInbox,
    audience: "showcase",
  },
];

/** The staff rows, under their own Staff heading. */
export const STUDIO_MENU_STAFF_ITEMS: StudioAccountMenuItem[] = [
  {
    labelKey: "studio:rail.live.flagReview",
    to: routes.studioFlagReview,
    icon: FiFlag,
    audience: "staff",
    badge: "review",
  },
];

/** The Studio group, above the Help and info toggle. */
export const STUDIO_MENU_STUDIO_ITEMS: StudioAccountMenuItem[] = [
  {
    labelKey: "studio:shell.menu.yourListening",
    to: routes.studioListening,
    icon: FiHeadphones,
    audience: "everyone",
  },
  {
    labelKey: "studio:shell.menu.settings",
    to: routes.studioSettings,
    icon: FiSettings,
    audience: "everyone",
  },
  {
    labelKey: "studio:rail.main.notifications",
    to: routes.studioNotifications,
    icon: FiBell,
    audience: "showcase",
  },
  {
    labelKey: "studio:rail.contribute.solidarityFund",
    to: routes.studioSolidarityFund,
    icon: FiHeart,
    audience: "everyone",
  },
];

/** Live: the rows the Help and info toggle reveals. */
export const STUDIO_MENU_HELP_ITEMS_LIVE: StudioAccountMenuItem[] = [
  {
    labelKey: "studio:rail.live.help",
    to: routes.studioHelp,
    icon: FiHelpCircle,
    audience: "everyone",
  },
  {
    labelKey: "studio:rail.live.about",
    to: routes.studioAbout,
    icon: FiInfo,
    audience: "everyone",
  },
  {
    labelKey: "studio:rail.live.rights",
    to: routes.studioRights,
    icon: FiShield,
    audience: "everyone",
  },
  {
    labelKey: "studio:rail.live.terms",
    to: routes.studioTerms,
    icon: FiFileText,
    audience: "everyone",
  },
  {
    labelKey: "studio:rail.live.accessibility",
    to: routes.studioAccessibility,
    icon: FiEye,
    audience: "everyone",
  },
];

/** Demo: the showcase's co-op pages behind the same toggle. */
export const STUDIO_MENU_HELP_ITEMS_SHOWCASE: StudioAccountMenuItem[] = [
  {
    labelKey: "studio:rail.utility.about",
    to: routes.studioAbout,
    icon: FiInfo,
    audience: "showcase",
  },
  {
    labelKey: "studio:rail.utility.help",
    to: routes.studioHelp,
    icon: FiHelpCircle,
    audience: "showcase",
  },
  {
    labelKey: "studio:rail.utility.accessibility",
    to: routes.studioAccessibility,
    icon: FiEye,
    audience: "showcase",
  },
  {
    labelKey: "studio:rail.utility.trustTerms",
    to: routes.studioTerms,
    icon: FiFileText,
    audience: "showcase",
  },
  {
    labelKey: "studio:rail.contribute.rightsTakedown",
    to: routes.studioRights,
    icon: FiShield,
    audience: "showcase",
  },
];
