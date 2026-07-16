import { routes } from "../../app/routeMap";

export interface HrItem {
  titleKey: string;
  bodyKey: string;
}

export interface HrSection {
  labelKey: string;
  titleKey: string;
  alert?: { headKey: string; bodyKey: string };
  items: HrItem[];
  link?: { labelKey: string; href: string };
}

export interface NaloxoneStep {
  n: number;
  bodyKey: string;
}

/**
 * i18n Pattern A — overdose response / substance-safety guidance, the
 * highest-stakes copy in this namespace. Every catalog value preserves
 * numbers, timings, drug names, phone numbers and org names exactly between
 * EN and PT (see catalog header comment) — flag for the closest native
 * review before shipping.
 */
export const SECTIONS: HrSection[] = [
  {
    labelKey: "resources:harmReduction.section.beforeNight.label",
    titleKey: "resources:harmReduction.section.beforeNight.title",
    items: [
      {
        titleKey: "resources:harmReduction.section.beforeNight.item.eat.title",
        bodyKey: "resources:harmReduction.section.beforeNight.item.eat.body",
      },
      {
        titleKey:
          "resources:harmReduction.section.beforeNight.item.test.title",
        bodyKey: "resources:harmReduction.section.beforeNight.item.test.body",
      },
      {
        titleKey:
          "resources:harmReduction.section.beforeNight.item.meds.title",
        bodyKey: "resources:harmReduction.section.beforeNight.item.meds.body",
      },
      {
        titleKey:
          "resources:harmReduction.section.beforeNight.item.tellSomeone.title",
        bodyKey:
          "resources:harmReduction.section.beforeNight.item.tellSomeone.body",
      },
      {
        titleKey:
          "resources:harmReduction.section.beforeNight.item.budget.title",
        bodyKey:
          "resources:harmReduction.section.beforeNight.item.budget.body",
      },
    ],
  },
  {
    labelKey: "resources:harmReduction.section.duringNight.label",
    titleKey: "resources:harmReduction.section.duringNight.title",
    alert: {
      headKey: "resources:harmReduction.section.duringNight.alert.head",
      bodyKey: "resources:harmReduction.section.duringNight.alert.body",
    },
    items: [
      {
        titleKey:
          "resources:harmReduction.section.duringNight.item.startLow.title",
        bodyKey:
          "resources:harmReduction.section.duringNight.item.startLow.body",
      },
      {
        titleKey:
          "resources:harmReduction.section.duringNight.item.breaks.title",
        bodyKey:
          "resources:harmReduction.section.duringNight.item.breaks.body",
      },
      {
        titleKey:
          "resources:harmReduction.section.duringNight.item.mixing.title",
        bodyKey:
          "resources:harmReduction.section.duringNight.item.mixing.body",
      },
      {
        titleKey:
          "resources:harmReduction.section.duringNight.item.lookAfter.title",
        bodyKey:
          "resources:harmReduction.section.duringNight.item.lookAfter.body",
      },
    ],
  },
];

export const AFTER: HrSection = {
  labelKey: "resources:harmReduction.section.after.label",
  titleKey: "resources:harmReduction.section.after.title",
  items: [
    {
      titleKey: "resources:harmReduction.section.after.item.comedown.title",
      bodyKey: "resources:harmReduction.section.after.item.comedown.body",
    },
    {
      titleKey: "resources:harmReduction.section.after.item.sleepFood.title",
      bodyKey: "resources:harmReduction.section.after.item.sleepFood.body",
    },
    {
      titleKey: "resources:harmReduction.section.after.item.worried.title",
      bodyKey: "resources:harmReduction.section.after.item.worried.body",
    },
    {
      titleKey: "resources:harmReduction.section.after.item.chemsex.title",
      bodyKey: "resources:harmReduction.section.after.item.chemsex.body",
    },
  ],
};

export const SOBER: HrSection = {
  labelKey: "resources:harmReduction.section.sober.label",
  titleKey: "resources:harmReduction.section.sober.title",
  items: [
    {
      titleKey: "resources:harmReduction.section.sober.item.belong.title",
      bodyKey: "resources:harmReduction.section.sober.item.belong.body",
    },
    {
      titleKey:
        "resources:harmReduction.section.sober.item.nonAlcoholic.title",
      bodyKey: "resources:harmReduction.section.sober.item.nonAlcoholic.body",
    },
    {
      titleKey:
        "resources:harmReduction.section.sober.item.qpCommunity.title",
      bodyKey: "resources:harmReduction.section.sober.item.qpCommunity.body",
    },
  ],
  link: {
    labelKey: "resources:harmReduction.section.sober.linkCta",
    href: routes.sober,
  },
};

export const SERVICES: HrSection = {
  labelKey: "resources:harmReduction.section.services.label",
  titleKey: "resources:harmReduction.section.services.title",
  items: [
    {
      titleKey: "resources:harmReduction.section.services.item.gat.title",
      bodyKey: "resources:harmReduction.section.services.item.gat.body",
    },
    {
      titleKey:
        "resources:harmReduction.section.services.item.checkpoint.title",
      bodyKey:
        "resources:harmReduction.section.services.item.checkpoint.body",
    },
    {
      titleKey: "resources:harmReduction.section.services.item.cat.title",
      bodyKey: "resources:harmReduction.section.services.item.cat.body",
    },
    {
      titleKey:
        "resources:harmReduction.section.services.item.kosmicare.title",
      bodyKey: "resources:harmReduction.section.services.item.kosmicare.body",
    },
    {
      titleKey:
        "resources:harmReduction.section.services.item.tripsit.title",
      bodyKey: "resources:harmReduction.section.services.item.tripsit.body",
    },
  ],
};

export const NALOXONE_STEPS: NaloxoneStep[] = [
  { n: 1, bodyKey: "resources:harmReduction.naloxone.step1" },
  { n: 2, bodyKey: "resources:harmReduction.naloxone.step2" },
  { n: 3, bodyKey: "resources:harmReduction.naloxone.step3" },
  { n: 4, bodyKey: "resources:harmReduction.naloxone.step4" },
  { n: 5, bodyKey: "resources:harmReduction.naloxone.step5" },
];

