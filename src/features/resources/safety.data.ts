import { routes } from "../../app/routeMap";

export const SAFETY_SUBPAGES = [
  {
    label: "Report & Safety",
    to: routes.report,
    blurb: "Report harassment or an unsafe space, and see what happens next.",
  },
  {
    label: "Hate Crime Guide",
    to: routes.hateCrime,
    blurb: "What counts as a hate crime in Portugal, and how to report one.",
  },
  {
    label: "Legal Aid",
    to: routes.legal,
    blurb: "Know your rights and find legal support when you need it.",
  },
];
