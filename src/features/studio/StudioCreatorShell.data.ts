import { routes } from "../../app/routeMap";

/** A live count beside a nav label. */
export type CreatorNavBadge = "creditRequests";

export interface CreatorNavItem {
  labelKey: string;
  /** The label a live member reads, when it differs from the showcase's. */
  liveLabelKey?: string;
  to: string;
  isShowcaseOnly: boolean;
  badge?: CreatorNavBadge;
}

export const NAV: CreatorNavItem[] = [
  {
    labelKey: "studio:creator.nav.dashboard",
    liveLabelKey: "studio:creator.nav.yourNumbers",
    to: routes.studioDashboard,
    isShowcaseOnly: false,
  },
  {
    labelKey: "studio:creator.nav.newRelease",
    to: routes.studioUpload,
    isShowcaseOnly: false,
  },
  {
    labelKey: "studio:credits.nav",
    to: routes.studioCredits,
    isShowcaseOnly: false,
    badge: "creditRequests",
  },
  {
    labelKey: "studio:creator.nav.pressKit",
    to: routes.studioPressEdit,
    isShowcaseOnly: false,
  },
  {
    labelKey: "studio:creator.nav.payouts",
    to: routes.studioPayouts,
    isShowcaseOnly: true,
  },
];
