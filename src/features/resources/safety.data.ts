import { routes } from "../../app/routeMap";

/** i18n Pattern A — chrome subpage index, resolved via `t()` in SafetyPage. */
export const SAFETY_SUBPAGES = [
  {
    labelKey: "resources:safety.subpage.report.label",
    to: routes.report,
    blurbKey: "resources:safety.subpage.report.blurb",
  },
  {
    labelKey: "resources:safety.subpage.hateCrime.label",
    to: routes.hateCrime,
    blurbKey: "resources:safety.subpage.hateCrime.blurb",
  },
  {
    labelKey: "resources:safety.subpage.legal.label",
    to: routes.legal,
    blurbKey: "resources:safety.subpage.legal.blurb",
  },
];
