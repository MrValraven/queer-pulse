import { routes } from "../../app/routeMap";
import { studioPaymentsPath } from "./studioPaths";

/** A live count beside a nav label. */
export type CreatorNavBadge = "creditRequests" | "salesPending";

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
    // The payments members say they made, with the waiting count. The
    // retired payouts address (/studio/payouts) redirects here.
    labelKey: "studio:purchase.inbox.nav",
    to: studioPaymentsPath(),
    isShowcaseOnly: false,
    badge: "salesPending",
  },
];
