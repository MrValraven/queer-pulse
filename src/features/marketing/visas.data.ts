import {
  FiBriefcase,
  FiFlag,
  FiHeart,
  FiTrendingUp,
  FiWifi,
} from "react-icons/fi";
import type { IconType } from "react-icons";
import { routes } from "../../app/routeMap";

export type TabId = "eu" | "d7" | "d8" | "work" | "partner" | "citizenship";

export const LEGAL = routes.legal;
export const FORUM = routes.forum;
export const ARRIVING = routes.arriving;

export interface InfoCard {
  eyebrowKey: string;
  titleKey: string;
  bodyKey: string;
  tag?: { labelKey: string; kind: "jade" | "accent" };
  link?: { labelKey: string; href: string };
}
export interface Step {
  titleKey: string;
  textKey: string;
  noteKey?: string;
}
export interface Tab {
  id: TabId;
  labelKey: string;
  headTitleKey: string;
  headTextKey: string;
  cards: InfoCard[];
  steps?: Step[];
}

export const ROUTES: {
  icon: IconType;
  nameKey: string;
  descKey: string;
  ctaKey: string;
  to: string;
  tab: TabId;
}[] = [
  {
    icon: FiFlag,
    nameKey: "marketing:visas.routePicker.euCitizen.name",
    descKey: "marketing:visas.routePicker.euCitizen.desc",
    ctaKey: "marketing:visas.routePicker.euCitizen.cta",
    to: "EU Citizens",
    tab: "eu",
  },
  {
    icon: FiTrendingUp,
    nameKey: "marketing:visas.routePicker.remoteWorker.name",
    descKey: "marketing:visas.routePicker.remoteWorker.desc",
    ctaKey: "marketing:visas.routePicker.remoteWorker.cta",
    to: "D7 Visa",
    tab: "d7",
  },
  {
    icon: FiWifi,
    nameKey: "marketing:visas.routePicker.digitalNomad.name",
    descKey: "marketing:visas.routePicker.digitalNomad.desc",
    ctaKey: "marketing:visas.routePicker.digitalNomad.cta",
    to: "Digital Nomad (D8)",
    tab: "d8",
  },
  {
    icon: FiBriefcase,
    nameKey: "marketing:visas.routePicker.jobOffer.name",
    descKey: "marketing:visas.routePicker.jobOffer.desc",
    ctaKey: "marketing:visas.routePicker.jobOffer.cta",
    to: "Work Visas",
    tab: "work",
  },
  {
    icon: FiHeart,
    nameKey: "marketing:visas.routePicker.partner.name",
    descKey: "marketing:visas.routePicker.partner.desc",
    ctaKey: "marketing:visas.routePicker.partner.cta",
    to: "Bringing a Partner",
    tab: "partner",
  },
];

export const TABS: Tab[] = [
  {
    id: "eu",
    labelKey: "marketing:visas.tabs.eu.label",
    headTitleKey: "marketing:visas.tabs.eu.headTitle",
    headTextKey: "marketing:visas.tabs.eu.headText",
    cards: [
      {
        eyebrowKey: "marketing:visas.tabs.eu.card1.eyebrow",
        titleKey: "marketing:visas.tabs.eu.card1.title",
        bodyKey: "marketing:visas.tabs.eu.card1.body",
        tag: { labelKey: "marketing:visas.tabs.eu.card1.tag", kind: "jade" },
      },
      {
        eyebrowKey: "marketing:visas.tabs.eu.card2.eyebrow",
        titleKey: "marketing:visas.tabs.eu.card2.title",
        bodyKey: "marketing:visas.tabs.eu.card2.body",
      },
      {
        eyebrowKey: "marketing:visas.tabs.eu.card3.eyebrow",
        titleKey: "marketing:visas.tabs.eu.card3.title",
        bodyKey: "marketing:visas.tabs.eu.card3.body",
        tag: { labelKey: "marketing:visas.tabs.eu.card3.tag", kind: "jade" },
        link: { labelKey: "marketing:visas.tabs.eu.card3.link", href: "#" },
      },
    ],
  },
  {
    id: "d7",
    labelKey: "marketing:visas.tabs.d7.label",
    headTitleKey: "marketing:visas.tabs.d7.headTitle",
    headTextKey: "marketing:visas.tabs.d7.headText",
    cards: [
      {
        eyebrowKey: "marketing:visas.tabs.d7.card1.eyebrow",
        titleKey: "marketing:visas.tabs.d7.card1.title",
        bodyKey: "marketing:visas.tabs.d7.card1.body",
        tag: { labelKey: "marketing:visas.tabs.d7.card1.tag", kind: "accent" },
      },
      {
        eyebrowKey: "marketing:visas.tabs.d7.card2.eyebrow",
        titleKey: "marketing:visas.tabs.d7.card2.title",
        bodyKey: "marketing:visas.tabs.d7.card2.body",
      },
      {
        eyebrowKey: "marketing:visas.tabs.d7.card3.eyebrow",
        titleKey: "marketing:visas.tabs.d7.card3.title",
        bodyKey: "marketing:visas.tabs.d7.card3.body",
        link: { labelKey: "marketing:visas.tabs.d7.card3.link", href: LEGAL },
      },
    ],
    steps: [
      {
        titleKey: "marketing:visas.tabs.d7.step1.title",
        textKey: "marketing:visas.tabs.d7.step1.text",
        noteKey: "marketing:visas.tabs.d7.step1.note",
      },
      {
        titleKey: "marketing:visas.tabs.d7.step2.title",
        textKey: "marketing:visas.tabs.d7.step2.text",
      },
      {
        titleKey: "marketing:visas.tabs.d7.step3.title",
        textKey: "marketing:visas.tabs.d7.step3.text",
        noteKey: "marketing:visas.tabs.d7.step3.note",
      },
      {
        titleKey: "marketing:visas.tabs.d7.step4.title",
        textKey: "marketing:visas.tabs.d7.step4.text",
      },
    ],
  },
  {
    id: "d8",
    labelKey: "marketing:visas.tabs.d8.label",
    headTitleKey: "marketing:visas.tabs.d8.headTitle",
    headTextKey: "marketing:visas.tabs.d8.headText",
    cards: [
      {
        eyebrowKey: "marketing:visas.tabs.d8.card1.eyebrow",
        titleKey: "marketing:visas.tabs.d8.card1.title",
        bodyKey: "marketing:visas.tabs.d8.card1.body",
        tag: { labelKey: "marketing:visas.tabs.d8.card1.tag", kind: "accent" },
      },
      {
        eyebrowKey: "marketing:visas.tabs.d8.card2.eyebrow",
        titleKey: "marketing:visas.tabs.d8.card2.title",
        bodyKey: "marketing:visas.tabs.d8.card2.body",
      },
      {
        eyebrowKey: "marketing:visas.tabs.d8.card3.eyebrow",
        titleKey: "marketing:visas.tabs.d8.card3.title",
        bodyKey: "marketing:visas.tabs.d8.card3.body",
        link: { labelKey: "marketing:visas.tabs.d8.card3.link", href: LEGAL },
      },
    ],
  },
  {
    id: "work",
    labelKey: "marketing:visas.tabs.work.label",
    headTitleKey: "marketing:visas.tabs.work.headTitle",
    headTextKey: "marketing:visas.tabs.work.headText",
    cards: [
      {
        eyebrowKey: "marketing:visas.tabs.work.card1.eyebrow",
        titleKey: "marketing:visas.tabs.work.card1.title",
        bodyKey: "marketing:visas.tabs.work.card1.body",
      },
      {
        eyebrowKey: "marketing:visas.tabs.work.card2.eyebrow",
        titleKey: "marketing:visas.tabs.work.card2.title",
        bodyKey: "marketing:visas.tabs.work.card2.body",
        tag: { labelKey: "marketing:visas.tabs.work.card2.tag", kind: "jade" },
      },
      {
        eyebrowKey: "marketing:visas.tabs.work.card3.eyebrow",
        titleKey: "marketing:visas.tabs.work.card3.title",
        bodyKey: "marketing:visas.tabs.work.card3.body",
      },
    ],
  },
  {
    id: "partner",
    labelKey: "marketing:visas.tabs.partner.label",
    headTitleKey: "marketing:visas.tabs.partner.headTitle",
    headTextKey: "marketing:visas.tabs.partner.headText",
    cards: [
      {
        eyebrowKey: "marketing:visas.tabs.partner.card1.eyebrow",
        titleKey: "marketing:visas.tabs.partner.card1.title",
        bodyKey: "marketing:visas.tabs.partner.card1.body",
        tag: {
          labelKey: "marketing:visas.tabs.partner.card1.tag",
          kind: "jade",
        },
      },
      {
        eyebrowKey: "marketing:visas.tabs.partner.card2.eyebrow",
        titleKey: "marketing:visas.tabs.partner.card2.title",
        bodyKey: "marketing:visas.tabs.partner.card2.body",
      },
      {
        eyebrowKey: "marketing:visas.tabs.partner.card3.eyebrow",
        titleKey: "marketing:visas.tabs.partner.card3.title",
        bodyKey: "marketing:visas.tabs.partner.card3.body",
        tag: {
          labelKey: "marketing:visas.tabs.partner.card3.tag",
          kind: "jade",
        },
        link: {
          labelKey: "marketing:visas.tabs.partner.card3.link",
          href: LEGAL,
        },
      },
      {
        eyebrowKey: "marketing:visas.tabs.partner.card4.eyebrow",
        titleKey: "marketing:visas.tabs.partner.card4.title",
        bodyKey: "marketing:visas.tabs.partner.card4.body",
      },
    ],
  },
  {
    id: "citizenship",
    labelKey: "marketing:visas.tabs.citizenship.label",
    headTitleKey: "marketing:visas.tabs.citizenship.headTitle",
    headTextKey: "marketing:visas.tabs.citizenship.headText",
    cards: [
      {
        eyebrowKey: "marketing:visas.tabs.citizenship.card1.eyebrow",
        titleKey: "marketing:visas.tabs.citizenship.card1.title",
        bodyKey: "marketing:visas.tabs.citizenship.card1.body",
        tag: {
          labelKey: "marketing:visas.tabs.citizenship.card1.tag",
          kind: "jade",
        },
      },
      {
        eyebrowKey: "marketing:visas.tabs.citizenship.card2.eyebrow",
        titleKey: "marketing:visas.tabs.citizenship.card2.title",
        bodyKey: "marketing:visas.tabs.citizenship.card2.body",
      },
      {
        eyebrowKey: "marketing:visas.tabs.citizenship.card3.eyebrow",
        titleKey: "marketing:visas.tabs.citizenship.card3.title",
        bodyKey: "marketing:visas.tabs.citizenship.card3.body",
        link: {
          labelKey: "marketing:visas.tabs.citizenship.card3.link",
          href: FORUM,
        },
      },
    ],
  },
];

export const GROUND: { labelKey: string; titleKey: string; bodyKey: string }[] =
  [
    {
      labelKey: "marketing:visas.ground.nif.label",
      titleKey: "marketing:visas.ground.nif.title",
      bodyKey: "marketing:visas.ground.nif.body",
    },
    {
      labelKey: "marketing:visas.ground.niss.label",
      titleKey: "marketing:visas.ground.niss.title",
      bodyKey: "marketing:visas.ground.niss.body",
    },
    {
      labelKey: "marketing:visas.ground.aima.label",
      titleKey: "marketing:visas.ground.aima.title",
      bodyKey: "marketing:visas.ground.aima.body",
    },
    {
      labelKey: "marketing:visas.ground.sns.label",
      titleKey: "marketing:visas.ground.sns.title",
      bodyKey: "marketing:visas.ground.sns.body",
    },
  ];
