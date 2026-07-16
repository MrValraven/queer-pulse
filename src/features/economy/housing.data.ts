import { routes } from "../../app/routeMap";

export const FILTERS = [
  { value: "all", labelKey: "economy:housing.filter.all" },
  { value: "sublet", labelKey: "economy:housing.filter.sublet" },
  { value: "room", labelKey: "economy:housing.filter.room" },
  { value: "short", labelKey: "economy:housing.filter.short" },
  { value: "studio", labelKey: "economy:housing.filter.studio" },
];

export const TIPS = [
  {
    num: "01",
    titleKey: "economy:housing.tip.budget.title",
    textKey: "economy:housing.tip.budget.text",
  },
  {
    num: "02",
    titleKey: "economy:housing.tip.board.title",
    textKey: "economy:housing.tip.board.text",
  },
  {
    num: "03",
    titleKey: "economy:housing.tip.rights.title",
    textKey: "economy:housing.tip.rights.text",
  },
  {
    num: "04",
    titleKey: "economy:housing.tip.shortTerm.title",
    textKey: "economy:housing.tip.shortTerm.text",
  },
  {
    num: "05",
    titleKey: "economy:housing.tip.gut.title",
    textKey: "economy:housing.tip.gut.text",
  },
  {
    num: "06",
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
