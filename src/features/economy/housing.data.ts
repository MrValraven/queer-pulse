import { routes } from "../../app/routeMap";

// HSG-1: the owner's "My Listings" management page. A literal path (not a
// `routeMap.ts` entry) — mirrors the existing `/work/landlord/:slug` /
// `/work/housing/:slug` literals already in `economy/routes.tsx` — since
// `routeMap.ts` is a shared file another concurrent workstream also touches.
export const MY_HOUSING_LISTINGS_PATH = `${routes.housing}/mine`;

export const FILTERS = [
  { value: "all", labelKey: "economy:housing.filter.all" },
  { value: "sublet", labelKey: "economy:housing.filter.sublet" },
  { value: "room", labelKey: "economy:housing.filter.room" },
  { value: "short", labelKey: "economy:housing.filter.short" },
  { value: "studio", labelKey: "economy:housing.filter.studio" },
];

export const TIPS = [
  {
    number: "01",
    titleKey: "economy:housing.tip.budget.title",
    textKey: "economy:housing.tip.budget.text",
  },
  {
    number: "02",
    titleKey: "economy:housing.tip.board.title",
    textKey: "economy:housing.tip.board.text",
  },
  {
    number: "03",
    titleKey: "economy:housing.tip.rights.title",
    textKey: "economy:housing.tip.rights.text",
  },
  {
    number: "04",
    titleKey: "economy:housing.tip.shortTerm.title",
    textKey: "economy:housing.tip.shortTerm.text",
  },
  {
    number: "05",
    titleKey: "economy:housing.tip.gut.title",
    textKey: "economy:housing.tip.gut.text",
  },
  {
    number: "06",
    titleKey: "economy:housing.tip.emergency.title",
    textKey: "economy:housing.tip.emergency.text",
  },
];

export const HOUSING_SUBPAGES = [
  {
    labelKey: "economy:housing.subpages.coop.label",
    to: routes.housingCoop,
    blurbKey: "economy:housing.subpages.coop.blurb",
  },
];
