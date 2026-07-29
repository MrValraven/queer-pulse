import { routes } from "../../app/routeMap";

export const NAV = [
  { labelKey: "studio:creator.nav.dashboard", to: "/studio/dashboard" },
  { labelKey: "studio:creator.nav.newRelease", to: routes.studioUpload },
  { labelKey: "studio:creator.nav.payouts", to: routes.studioPayouts },
];
