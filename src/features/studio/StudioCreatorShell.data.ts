import { routes } from "../../app/routeMap";

export interface CreatorNavItem {
  labelKey: string;
  /** The label a live member reads, when it differs from the showcase's. */
  liveLabelKey?: string;
  to: string;
  isShowcaseOnly: boolean;
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
    labelKey: "studio:creator.nav.payouts",
    to: routes.studioPayouts,
    isShowcaseOnly: true,
  },
];
