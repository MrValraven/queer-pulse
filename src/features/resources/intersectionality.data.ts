import { routes } from "../../app/routeMap";

export const GUIDELINES = routes.guidelines;
export const COMMUNITIES = routes.communities;
export const FORUM = routes.forum;
export const SOBER = routes.sober;
export const REPORT = routes.report;
export const LEGAL = routes.legal;
export const ACCESSIBILITY = routes.accessibility;
export const GOVERNANCE = routes.governance;
export const CONTACT = routes.contact;

/** Attributed member quotes — content, stays English (wellbeing/soberPage VOICES precedent). */
export interface Voice {
  initials: string;
  background: string;
  color: string;
  name: string;
  context: string;
  quote: string;
}
export interface InfoCard {
  eyebrowKey: string;
  titleKey: string;
  bodyKey: string;
  link?: { labelKey: string; href: string };
}

export const RACE_VOICES: Voice[] = [
  {
    initials: "AM",
    background: "rgba(45,27,61,.12)",
    color: "var(--plum)",
    name: "Amara M.",
    context: "Black British queer woman · Mouraria · Member since 2024",
    quote:
      "\"Lisbon's queer spaces are mostly white and mostly European. That's not unusual (most cities are like this), but it's worth knowing before you arrive expecting something different. The community within QueerPulse is more mixed than the general scene, which is why I'm still here.\"",
  },
  {
    initials: "RS",
    background: "rgba(74,140,111,.16)",
    color: "var(--jade)",
    name: "Ravi S.",
    context: "South Asian non-binary · Arroios · Member since 2023",
    quote:
      "\"Portugal has its own relationship with race that's different from the UK or the US. The coloniality is present but discussed differently. I've had to learn a new set of social codes while also not having the language to describe them yet. The forum's been useful for that.\"",
  },
  {
    initials: "DF",
    background: "rgba(232,119,90,.16)",
    color: "var(--accent-ink)",
    name: "Diallo F.",
    context: "Afro-Portuguese queer man · Cais do Sodré · Member since 2022",
    quote:
      "\"I grew up here and the queer community felt very white to me for a long time. That's changing slowly, especially in certain spaces and with certain generations. The intersection of Afro-Portuguese identity and queerness is something I'm still figuring out how to talk about, and I appreciate that this community actually wants to have the conversation.\"",
  },
];
export const RACE_INFO: InfoCard[] = [
  {
    eyebrowKey: "resources:intersectionality.race.info1.eyebrow",
    titleKey: "resources:intersectionality.race.info1.title",
    bodyKey: "resources:intersectionality.race.info1.body",
    link: {
      labelKey: "resources:intersectionality.race.info1.link",
      href: GUIDELINES,
    },
  },
  {
    eyebrowKey: "resources:intersectionality.race.info2.eyebrow",
    titleKey: "resources:intersectionality.race.info2.title",
    bodyKey: "resources:intersectionality.race.info2.body",
  },
  {
    eyebrowKey: "resources:intersectionality.race.info3.eyebrow",
    titleKey: "resources:intersectionality.race.info3.title",
    bodyKey: "resources:intersectionality.race.info3.body",
    link: {
      labelKey: "resources:intersectionality.race.info3.link",
      href: COMMUNITIES,
    },
  },
];

export const FAITH_VOICES: Voice[] = [
  {
    initials: "LK",
    background: "rgba(45,27,61,.12)",
    color: "var(--plum)",
    name: "Leila K.",
    context: "Queer Muslim · Graça · Member since 2024",
    quote:
      "\"I was very nervous about being out as both Muslim and queer in Lisbon. The queer community here has been more curious than hostile, but I've also had to explain myself in ways that straight people in the same community never do. It's exhausting sometimes, but the people who get it, really get it.\"",
  },
  {
    initials: "MT",
    background: "rgba(74,140,111,.16)",
    color: "var(--jade)",
    name: "Marco T.",
    context: "Queer Catholic · Estrela · Member since 2022",
    quote:
      "\"I went to a queer-affirming mass in Lisbon and cried for about twenty minutes. I hadn't realised how much I'd internalised the idea that my faith and my queerness were incompatible until someone held both of them for me. Those spaces exist here if you look.\"",
  },
];
export const FAITH_INFO: InfoCard[] = [
  {
    eyebrowKey: "resources:intersectionality.faith.info1.eyebrow",
    titleKey: "resources:intersectionality.faith.info1.title",
    bodyKey: "resources:intersectionality.faith.info1.body",
  },
  {
    eyebrowKey: "resources:intersectionality.faith.info2.eyebrow",
    titleKey: "resources:intersectionality.faith.info2.title",
    bodyKey: "resources:intersectionality.faith.info2.body",
    link: {
      labelKey: "resources:intersectionality.faith.info2.link",
      href: FORUM,
    },
  },
  {
    eyebrowKey: "resources:intersectionality.faith.info3.eyebrow",
    titleKey: "resources:intersectionality.faith.info3.title",
    bodyKey: "resources:intersectionality.faith.info3.body",
  },
];

export const CLASS_INFO: InfoCard[] = [
  {
    eyebrowKey: "resources:intersectionality.class.info1.eyebrow",
    titleKey: "resources:intersectionality.class.info1.title",
    bodyKey: "resources:intersectionality.class.info1.body",
  },
  {
    eyebrowKey: "resources:intersectionality.class.info2.eyebrow",
    titleKey: "resources:intersectionality.class.info2.title",
    bodyKey: "resources:intersectionality.class.info2.body",
    link: {
      labelKey: "resources:intersectionality.class.info2.link",
      href: SOBER,
    },
  },
  {
    eyebrowKey: "resources:intersectionality.class.info3.eyebrow",
    titleKey: "resources:intersectionality.class.info3.title",
    bodyKey: "resources:intersectionality.class.info3.body",
    link: {
      labelKey: "resources:intersectionality.class.info3.link",
      href: routes.economy,
    },
  },
];
export const CLASS_VOICE: Voice = {
  initials: "JB",
  background: "rgba(232,119,90,.16)",
  color: "var(--accent-ink)",
  name: "Joana B.",
  context: "Queer woman · Porto-born, Lisbon resident · Member since 2023",
  quote:
    "\"I grew up working class in Porto. Moving to Lisbon and entering queer expat spaces felt like moving to another country again. The cultural codes around travel, careers, aesthetics: I had to learn them from scratch and pretend I'd always known them. That's exhausting. The spaces in this community that acknowledge class exist feel like taking a breath.\"",
};

export const COMMUNITY_INFO: InfoCard[] = [
  {
    eyebrowKey: "resources:intersectionality.community.info1.eyebrow",
    titleKey: "resources:intersectionality.community.info1.title",
    bodyKey: "resources:intersectionality.community.info1.body",
    link: {
      labelKey: "resources:intersectionality.community.info1.link",
      href: REPORT,
    },
  },
  {
    eyebrowKey: "resources:intersectionality.community.info2.eyebrow",
    titleKey: "resources:intersectionality.community.info2.title",
    bodyKey: "resources:intersectionality.community.info2.body",
    link: {
      labelKey: "resources:intersectionality.community.info2.link",
      href: COMMUNITIES,
    },
  },
  {
    eyebrowKey: "resources:intersectionality.community.info3.eyebrow",
    titleKey: "resources:intersectionality.community.info3.title",
    bodyKey: "resources:intersectionality.community.info3.body",
    link: {
      labelKey: "resources:intersectionality.community.info3.link",
      href: FORUM,
    },
  },
];

export interface Commitment {
  titleKey: string;
  textKey: string;
}

export const COMMITMENTS: Commitment[] = [
  {
    titleKey: "resources:intersectionality.commitment1.title",
    textKey: "resources:intersectionality.commitment1.text",
  },
  {
    titleKey: "resources:intersectionality.commitment2.title",
    textKey: "resources:intersectionality.commitment2.text",
  },
  {
    titleKey: "resources:intersectionality.commitment3.title",
    textKey: "resources:intersectionality.commitment3.text",
  },
  {
    titleKey: "resources:intersectionality.commitment4.title",
    textKey: "resources:intersectionality.commitment4.text",
  },
];

export interface Org {
  focusKey: string;
  /** Real-world organisation name — proper noun, kept identical in both languages. */
  name: string;
  textKey: string;
  link: { labelKey: string; href: string };
}

export const ORGS: Org[] = [
  {
    focusKey: "resources:intersectionality.org1.focus",
    name: "Opus Diversidades",
    textKey: "resources:intersectionality.org1.text",
    link: { labelKey: "resources:intersectionality.org1.link", href: FORUM },
  },
  {
    focusKey: "resources:intersectionality.org2.focus",
    name: "Comunidade Cristã LGBTQ+",
    textKey: "resources:intersectionality.org2.text",
    link: { labelKey: "resources:intersectionality.org2.link", href: FORUM },
  },
  {
    focusKey: "resources:intersectionality.org3.focus",
    name: "ILGA Portugal",
    textKey: "resources:intersectionality.org3.text",
    link: { labelKey: "resources:intersectionality.org3.link", href: LEGAL },
  },
  {
    focusKey: "resources:intersectionality.org4.focus",
    name: "Accessibility resources",
    textKey: "resources:intersectionality.org4.text",
    link: {
      labelKey: "resources:intersectionality.org4.link",
      href: ACCESSIBILITY,
    },
  },
];

export const NAV = [
  { id: "race", labelKey: "resources:intersectionality.nav.race" },
  { id: "faith", labelKey: "resources:intersectionality.nav.faith" },
  { id: "class", labelKey: "resources:intersectionality.nav.class" },
  { id: "community", labelKey: "resources:intersectionality.nav.community" },
  { id: "orgs", labelKey: "resources:intersectionality.nav.orgs" },
];
