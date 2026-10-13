import { routes } from "../../app/routeMap";

export const NAV = [
  {
    labelKey: "studio:creator.nav.dashboard",
    to: "/studio/dashboard",
    isShowcaseOnly: true,
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
