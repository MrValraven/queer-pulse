import { type ReactNode } from "react";
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
  /** Anonymised "Community note" quote attributed to a member — testimonial
   * content, left English per the i18n sweep's directoryPlaces precedent. */
  note?: ReactNode;
}

export const ROUTES: {
  nameKey: string;
  descKey: string;
  ctaKey: string;
  to: string;
  tab: TabId;
}[] = [
  {
    nameKey: "marketing:visas.routePicker.euCitizen.name",
    descKey: "marketing:visas.routePicker.euCitizen.desc",
    ctaKey: "marketing:visas.routePicker.euCitizen.cta",
    to: "EU Citizens →",
    tab: "eu",
  },
  {
    nameKey: "marketing:visas.routePicker.remoteWorker.name",
    descKey: "marketing:visas.routePicker.remoteWorker.desc",
    ctaKey: "marketing:visas.routePicker.remoteWorker.cta",
    to: "D7 Visa →",
    tab: "d7",
  },
  {
    nameKey: "marketing:visas.routePicker.digitalNomad.name",
    descKey: "marketing:visas.routePicker.digitalNomad.desc",
    ctaKey: "marketing:visas.routePicker.digitalNomad.cta",
    to: "Digital Nomad (D8) →",
    tab: "d8",
  },
  {
    nameKey: "marketing:visas.routePicker.jobOffer.name",
    descKey: "marketing:visas.routePicker.jobOffer.desc",
    ctaKey: "marketing:visas.routePicker.jobOffer.cta",
    to: "Work Visas →",
    tab: "work",
  },
  {
    nameKey: "marketing:visas.routePicker.partner.name",
    descKey: "marketing:visas.routePicker.partner.desc",
    ctaKey: "marketing:visas.routePicker.partner.cta",
    to: "Bringing a Partner →",
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
    note: (
      <>
        <strong>Community note:</strong> "The Câmara process was genuinely easy.
        The more annoying step is getting your NIF and NISS sorted — do both as
        early as possible, you'll need them for everything." —{" "}
        <strong>Member, moved from Germany</strong>
      </>
    ),
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
    note: (
      <>
        <strong>Community note:</strong> "AIMA appointments are the bottleneck
        right now. Book as soon as you land — even if it's 3 months out. Having
        a lawyer help with the initial consulate application saved us from a
        rejection." — <strong>Member, moved from Canada</strong>
      </>
    ),
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
    note: (
      <>
        <strong>Community note:</strong> "D8 was the right route for me — I work
        for a UK company. The income requirement was challenging to prove but
        the consulate was clear about what they wanted. The whole process took
        about four months." — <strong>Member, moved from the UK</strong>
      </>
    ),
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
    note: (
      <>
        <strong>Community note:</strong> "We got married at the Conservatória
        before starting our residency applications — it made everything cleaner.
        Portugal treated us exactly like any married couple, no complications."
        — <strong>Member couple, moved from Brazil and UK</strong>
      </>
    ),
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

// Named reviewed lawyers with attributed quotes/testimonials — content, left
// English per the i18n sweep's directoryPlaces/testimonials precedent.
export const LAWYERS: {
  initials: string;
  bg: string;
  color: string;
  name: string;
  context: string;
  stars: number;
  quote: string;
}[] = [
  {
    initials: "SM",
    bg: "rgba(74,140,111,.15)",
    color: "var(--jade)",
    name: "Sofia Mendes",
    context: "Immigration law · Chiado",
    stars: 5,
    quote:
      '"Handled our same-sex couple application with complete ease. Knew the Coman ruling and how to apply it. Clear pricing, no surprises. Two members have used her this year."',
  },
  {
    initials: "JF",
    bg: "rgba(232,119,90,.15)",
    color: "var(--accent-ink)",
    name: "João Figueiredo",
    context: "Immigration & tax law · Marquês de Pombal",
    stars: 5,
    quote:
      '"Specialises in D7 and D8 applications. Also handles the IFICI tax regime. Efficient, English-speaking, and experienced with international LGBTQ+ clients."',
  },
  {
    initials: "CL",
    bg: "rgba(45,27,61,.12)",
    color: "var(--plum)",
    name: "Carla Lima Advogados",
    context: "Firm · Arroios",
    stars: 4,
    quote:
      '"Good firm for complex situations — non-EU couples, prior visa refusals, cross-border family cases. More expensive than solo practitioners but thorough."',
  },
];
