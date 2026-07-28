import { routes } from "../../app/routeMap";

export type TabId = "adoption" | "ivf" | "coparenting" | "donors" | "legal";

export const LEGAL = routes.legal;
export const TRANS_HUB = routes.transHub;
export const FORUM = routes.forum;
export const MENTORSHIP = routes.mentorship;
export const INVITE = routes.requestInvite;

export interface InfoCard {
  eyebrowKey: string;
  titleKey: string;
  bodyKey: string;
  noteKey?: string;
  link?: { labelKey: string; href: string };
}
export interface Review {
  initials: string;
  background: string;
  color: string;
  /** Named social worker/agency/clinic being reviewed — content, not translated. */
  name: string;
  context: string;
  stars: number;
  quote: string;
}
export interface Step {
  titleKey: string;
  textKey: string;
  timeKey?: string;
}
/** A "From the community" testimonial: the member's own words — content,
 *  never translated. Only the "From the community:" label (resolved via
 *  `noteLabelKey`) is chrome. */
export interface CommunityNote {
  quote: string;
  attribution: string;
}
export interface Tab {
  id: TabId;
  labelKey: string;
  headTitleKey: string;
  headTextKey: string;
  cards: InfoCard[];
  note: CommunityNote | null;
  noteLabelKey?: string;
  reviewHeadKey?: string;
  reviews?: Review[];
  steps?: Step[];
}

export const SITUATIONS: {
  nameKey: string;
  descriptionKey: string;
  toKey: string;
  tab: TabId;
}[] = [
  {
    nameKey: "family.situation.twoWomen.name",
    descriptionKey: "family.situation.twoWomen.desc",
    toKey: "family.situation.twoWomen.to",
    tab: "ivf",
  },
  {
    nameKey: "family.situation.twoMen.name",
    descriptionKey: "family.situation.twoMen.desc",
    toKey: "family.situation.twoMen.to",
    tab: "adoption",
  },
  {
    nameKey: "family.situation.singleWoman.name",
    descriptionKey: "family.situation.singleWoman.desc",
    toKey: "family.situation.singleWoman.to",
    tab: "ivf",
  },
  {
    nameKey: "family.situation.singleMan.name",
    descriptionKey: "family.situation.singleMan.desc",
    toKey: "family.situation.singleMan.to",
    tab: "adoption",
  },
  {
    nameKey: "family.situation.transParent.name",
    descriptionKey: "family.situation.transParent.desc",
    toKey: "family.situation.transParent.to",
    tab: "legal",
  },
  {
    nameKey: "family.situation.lookingForCoparent.name",
    descriptionKey: "family.situation.lookingForCoparent.desc",
    toKey: "family.situation.lookingForCoparent.to",
    tab: "coparenting",
  },
];

export const TALK_CARDS: {
  initials: string;
  background: string;
  color: string;
  /** Named parent(s) sharing their own experience — content, not translated. */
  name: string;
  detail: string;
  note: string;
}[] = [
  {
    initials: "MR",
    background: "rgba(232,119,90,.25)",
    color: "var(--accent)",
    name: "Marta & Raquel",
    detail: "IVF via SNS · Two children · Arroios",
    note: '"Happy to walk anyone through the SNS process and what we wish we\'d known before we started."',
  },
  {
    initials: "JP",
    background: "rgba(74,140,111,.25)",
    color: "var(--jade)",
    name: "João & Pedro",
    detail: "Adoption · Domestic · Mouraria",
    note: '"We adopted in 2021. The process was long but we\'re on the other side now. Ask us anything."',
  },
  {
    initials: "TS",
    background: "rgba(122,82,184,.2)",
    color: "var(--violet)",
    name: "Tomás",
    detail: "Trans dad · IVF · Solo parent · Graça",
    note: '"Specifically experienced in navigating the IVF system as a trans man. DMs open."',
  },
];

export const TABS: Tab[] = [
  {
    id: "adoption",
    labelKey: "family.tab.adoption.label",
    headTitleKey: "family.tab.adoption.headTitle",
    headTextKey: "family.tab.adoption.headText",
    cards: [
      {
        eyebrowKey: "family.tab.adoption.card.law.eyebrow",
        titleKey: "family.tab.adoption.card.law.title",
        bodyKey: "family.tab.adoption.card.law.body",
      },
      {
        eyebrowKey: "family.tab.adoption.card.process.eyebrow",
        titleKey: "family.tab.adoption.card.process.title",
        bodyKey: "family.tab.adoption.card.process.body",
        noteKey: "family.tab.adoption.card.process.note",
      },
      {
        eyebrowKey: "family.tab.adoption.card.international.eyebrow",
        titleKey: "family.tab.adoption.card.international.title",
        bodyKey: "family.tab.adoption.card.international.body",
        link: {
          labelKey: "family.tab.adoption.card.international.linkLabel",
          href: LEGAL,
        },
      },
      {
        eyebrowKey: "family.tab.adoption.card.stepchild.eyebrow",
        titleKey: "family.tab.adoption.card.stepchild.title",
        bodyKey: "family.tab.adoption.card.stepchild.body",
      },
    ],
    note: {
      quote:
        '"The social worker we worked with was completely unfazed by us being a same-sex couple. The process was slow but fair. Having a lawyer from the start made everything less stressful — worth every euro."',
      attribution: "Member, Arroios",
    },
    noteLabelKey: "family.tab.adoption.noteLabel",
    reviewHeadKey: "family.tab.adoption.reviewHead",
    reviews: [
      {
        initials: "CM",
        background: "rgba(74,140,111,.15)",
        color: "var(--jade)",
        name: "Carla Matos",
        context: "Social worker · SCML Lisboa",
        stars: 5,
        quote:
          '"Dealt with our case without a single awkward moment. Prepared, respectful, made the home study feel like a conversation. Recommended by four members of this community."',
      },
      {
        initials: "FA",
        background: "rgba(232,119,90,.15)",
        color: "var(--accent-ink)",
        name: "Fundação Ajuda",
        context: "Adoption agency · Lisbon",
        stars: 4,
        quote:
          '"Good organisation, thorough process. One social worker was clearly less experienced with LGBTQ+ families but the lead was excellent. Overall positive."',
      },
      {
        initials: "RN",
        background: "rgba(45,27,61,.1)",
        color: "var(--plum)",
        name: "Rita Nunes",
        context: "Independent social worker",
        stars: 5,
        quote:
          '"Specifically experienced with LGBTQ+ families. Worth contacting directly before you start the official process — she helped us understand what to expect."',
      },
    ],
  },
  {
    id: "ivf",
    labelKey: "family.tab.ivf.label",
    headTitleKey: "family.tab.ivf.headTitle",
    headTextKey: "family.tab.ivf.headText",
    cards: [
      {
        eyebrowKey: "family.tab.ivf.card.public.eyebrow",
        titleKey: "family.tab.ivf.card.public.title",
        bodyKey: "family.tab.ivf.card.public.body",
        noteKey: "family.tab.ivf.card.public.note",
      },
      {
        eyebrowKey: "family.tab.ivf.card.private.eyebrow",
        titleKey: "family.tab.ivf.card.private.title",
        bodyKey: "family.tab.ivf.card.private.body",
        noteKey: "family.tab.ivf.card.private.note",
      },
      {
        eyebrowKey: "family.tab.ivf.card.transMen.eyebrow",
        titleKey: "family.tab.ivf.card.transMen.title",
        bodyKey: "family.tab.ivf.card.transMen.body",
        link: {
          labelKey: "family.tab.ivf.card.transMen.linkLabel",
          href: TRANS_HUB,
        },
      },
      {
        eyebrowKey: "family.tab.ivf.card.surrogacy.eyebrow",
        titleKey: "family.tab.ivf.card.surrogacy.title",
        bodyKey: "family.tab.ivf.card.surrogacy.body",
        link: {
          labelKey: "family.tab.ivf.card.surrogacy.linkLabel",
          href: LEGAL,
        },
      },
    ],
    note: {
      quote:
        '"We went private after a 14-month SNS wait. The clinic was completely straightforward with us — no awkward questions, no assumptions. We have a daughter now. The process was hard but the people were good."',
      attribution: "Member, Mouraria",
    },
    noteLabelKey: "family.tab.ivf.noteLabel",
    reviewHeadKey: "family.tab.ivf.reviewHead",
    reviews: [
      {
        initials: "CF",
        background: "rgba(74,140,111,.15)",
        color: "var(--jade)",
        name: "Clínica Ferticare",
        context: "Private · Marquês de Pombal",
        stars: 5,
        quote:
          "\"Genuinely affirming from the first call. The team treated us as a couple — not a 'special case'. Two members of our community are now parents thanks to them.\"",
      },
      {
        initials: "IM",
        background: "rgba(232,119,90,.15)",
        color: "var(--accent-ink)",
        name: "Instituto Marquesa",
        context: "Private · Cascais",
        stars: 4,
        quote:
          '"Slightly further out but shorter waitlists and very professional. Had no issues being a single woman. Would recommend for people who\'ve had bad experiences elsewhere."',
      },
    ],
  },
  {
    id: "coparenting",
    labelKey: "family.tab.coparenting.label",
    headTitleKey: "family.tab.coparenting.headTitle",
    headTextKey: "family.tab.coparenting.headText",
    cards: [
      {
        eyebrowKey: "family.tab.coparenting.card.whatItMeans.eyebrow",
        titleKey: "family.tab.coparenting.card.whatItMeans.title",
        bodyKey: "family.tab.coparenting.card.whatItMeans.body",
      },
      {
        eyebrowKey: "family.tab.coparenting.card.findingCoparent.eyebrow",
        titleKey: "family.tab.coparenting.card.findingCoparent.title",
        bodyKey: "family.tab.coparenting.card.findingCoparent.body",
        link: {
          labelKey: "family.tab.coparenting.card.findingCoparent.linkLabel",
          href: FORUM,
        },
      },
      {
        eyebrowKey: "family.tab.coparenting.card.legalFrameworks.eyebrow",
        titleKey: "family.tab.coparenting.card.legalFrameworks.title",
        bodyKey: "family.tab.coparenting.card.legalFrameworks.body",
        noteKey: "family.tab.coparenting.card.legalFrameworks.note",
      },
      {
        eyebrowKey: "family.tab.coparenting.card.international.eyebrow",
        titleKey: "family.tab.coparenting.card.international.title",
        bodyKey: "family.tab.coparenting.card.international.body",
        link: {
          labelKey: "family.tab.coparenting.card.international.linkLabel",
          href: LEGAL,
        },
      },
    ],
    note: {
      quote:
        "\"We met through this community, spent six months getting to know each other as people first, and then started the process. Our daughter is two now. It's unconventional but it's working — the key was having the hard conversations early.\"",
      attribution: "Co-parent pair, Graça + Marvila",
    },
    noteLabelKey: "family.tab.coparenting.noteLabel",
  },
  {
    id: "donors",
    labelKey: "family.tab.donors.label",
    headTitleKey: "family.tab.donors.headTitle",
    headTextKey: "family.tab.donors.headText",
    cards: [
      {
        eyebrowKey: "family.tab.donors.card.knownVsUnknown.eyebrow",
        titleKey: "family.tab.donors.card.knownVsUnknown.title",
        bodyKey: "family.tab.donors.card.knownVsUnknown.body",
      },
      {
        eyebrowKey: "family.tab.donors.card.spermDonation.eyebrow",
        titleKey: "family.tab.donors.card.spermDonation.title",
        bodyKey: "family.tab.donors.card.spermDonation.body",
      },
      {
        eyebrowKey: "family.tab.donors.card.eggDonation.eyebrow",
        titleKey: "family.tab.donors.card.eggDonation.title",
        bodyKey: "family.tab.donors.card.eggDonation.body",
      },
      {
        eyebrowKey: "family.tab.donors.card.legalParenthood.eyebrow",
        titleKey: "family.tab.donors.card.legalParenthood.title",
        bodyKey: "family.tab.donors.card.legalParenthood.body",
        link: {
          labelKey: "family.tab.donors.card.legalParenthood.linkLabel",
          href: LEGAL,
        },
      },
    ],
    note: {
      quote:
        '"We used an anonymous clinic donor and never had any ambiguity about parenthood. Both of us are on the birth certificate. For people considering a known donor — please get a lawyer before you start, not after."',
      attribution: "Member, Príncipe Real",
    },
    noteLabelKey: "family.tab.donors.noteLabel",
  },
  {
    id: "legal",
    labelKey: "family.tab.legal.label",
    headTitleKey: "family.tab.legal.headTitle",
    headTextKey: "family.tab.legal.headText",
    cards: [
      {
        eyebrowKey: "family.tab.legal.card.birthRegistration.eyebrow",
        titleKey: "family.tab.legal.card.birthRegistration.title",
        bodyKey: "family.tab.legal.card.birthRegistration.body",
        noteKey: "family.tab.legal.card.birthRegistration.note",
      },
      {
        eyebrowKey: "family.tab.legal.card.unmarried.eyebrow",
        titleKey: "family.tab.legal.card.unmarried.title",
        bodyKey: "family.tab.legal.card.unmarried.body",
        link: {
          labelKey: "family.tab.legal.card.unmarried.linkLabel",
          href: LEGAL,
        },
      },
      {
        eyebrowKey: "family.tab.legal.card.transParents.eyebrow",
        titleKey: "family.tab.legal.card.transParents.title",
        bodyKey: "family.tab.legal.card.transParents.body",
        link: {
          labelKey: "family.tab.legal.card.transParents.linkLabel",
          href: TRANS_HUB,
        },
      },
      {
        eyebrowKey: "family.tab.legal.card.secondParentAdoption.eyebrow",
        titleKey: "family.tab.legal.card.secondParentAdoption.title",
        bodyKey: "family.tab.legal.card.secondParentAdoption.body",
      },
    ],
    note: null,
    steps: [
      {
        titleKey: "family.tab.legal.step.legalStatus.title",
        textKey: "family.tab.legal.step.legalStatus.text",
      },
      {
        titleKey: "family.tab.legal.step.notifyClinic.title",
        textKey: "family.tab.legal.step.notifyClinic.text",
        timeKey: "family.tab.legal.step.notifyClinic.time",
      },
      {
        titleKey: "family.tab.legal.step.registerBirth.title",
        textKey: "family.tab.legal.step.registerBirth.text",
        timeKey: "family.tab.legal.step.registerBirth.time",
      },
      {
        titleKey: "family.tab.legal.step.willGuardianship.title",
        textKey: "family.tab.legal.step.willGuardianship.text",
      },
    ],
  },
];
