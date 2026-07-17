import { routes } from "../../app/routeMap";

export const COMMUNITIES = routes.communities;
export const MENTORSHIP = routes.mentorship;
export const WELLBEING = routes.wellbeing;
export const FORUM = routes.forum;

/** i18n Pattern A — platform-authored FAQ chrome, resolved via `t()`. */
export const FAQ: { qKey: string; aKey: string }[] = [
  { qKey: "resources:queer101.faq.q1", aKey: "resources:queer101.faq.a1" },
  { qKey: "resources:queer101.faq.q2", aKey: "resources:queer101.faq.a2" },
  { qKey: "resources:queer101.faq.q3", aKey: "resources:queer101.faq.a3" },
  { qKey: "resources:queer101.faq.q4", aKey: "resources:queer101.faq.a4" },
  { qKey: "resources:queer101.faq.q5", aKey: "resources:queer101.faq.a5" },
  { qKey: "resources:queer101.faq.q6", aKey: "resources:queer101.faq.a6" },
  { qKey: "resources:queer101.faq.q7", aKey: "resources:queer101.faq.a7" },
];

/**
 * i18n Pattern A — the glossary is a platform-authored queer-terminology
 * reference (chrome), resolved via `t()`. `keywords` stays as English search
 * tokens — it's a filter key, not rendered text.
 */
export const GLOSSARY: { termKey: string; keywords: string; defKey: string }[] =
  [
    {
      termKey: "resources:queer101.glossary.term.queer",
      keywords: "queer",
      defKey: "resources:queer101.glossary.def.queer",
    },
    {
      termKey: "resources:queer101.glossary.term.lgbtq",
      keywords: "lgbtq",
      defKey: "resources:queer101.glossary.def.lgbtq",
    },
    {
      termKey: "resources:queer101.glossary.term.genderIdentity",
      keywords: "gender identity",
      defKey: "resources:queer101.glossary.def.genderIdentity",
    },
    {
      termKey: "resources:queer101.glossary.term.sexualOrientation",
      keywords: "sexual orientation",
      defKey: "resources:queer101.glossary.def.sexualOrientation",
    },
    {
      termKey: "resources:queer101.glossary.term.nonBinary",
      keywords: "non-binary nonbinary",
      defKey: "resources:queer101.glossary.def.nonBinary",
    },
    {
      termKey: "resources:queer101.glossary.term.trans",
      keywords: "trans transgender",
      defKey: "resources:queer101.glossary.def.trans",
    },
    {
      termKey: "resources:queer101.glossary.term.bisexual",
      keywords: "bisexual bi",
      defKey: "resources:queer101.glossary.def.bisexual",
    },
    {
      termKey: "resources:queer101.glossary.term.pansexual",
      keywords: "pansexual pan",
      defKey: "resources:queer101.glossary.def.pansexual",
    },
    {
      termKey: "resources:queer101.glossary.term.asexualAromantic",
      keywords: "asexual ace aromantic aro",
      defKey: "resources:queer101.glossary.def.asexualAromantic",
    },
    {
      termKey: "resources:queer101.glossary.term.intersex",
      keywords: "intersex",
      defKey: "resources:queer101.glossary.def.intersex",
    },
    {
      termKey: "resources:queer101.glossary.term.pronouns",
      keywords: "pronouns they them she her he him",
      defKey: "resources:queer101.glossary.def.pronouns",
    },
    {
      termKey: "resources:queer101.glossary.term.comingOut",
      keywords: "coming out closet",
      defKey: "resources:queer101.glossary.def.comingOut",
    },
  ];

export type ResType = "Book" | "Film" | "Podcast" | "Guide";

/**
 * i18n note: real book/film/podcast titles and their author/director credits
 * are real-world proper nouns and stay in English/untranslated (`title`,
 * `by`); only the curatorial `descKey` (platform-authored review copy) is
 * translated.
 */
export const RESOURCES: {
  type: ResType;
  title: string;
  by: string;
  descKey: string;
}[] = [
  {
    type: "Book",
    title: "Gender Queer",
    by: "Maia Kobabe · 2019",
    descKey: "resources:queer101.resource.genderQueer.desc",
  },
  {
    type: "Book",
    title: "Stone Butch Blues",
    by: "Leslie Feinberg · 1993",
    descKey: "resources:queer101.resource.stoneButchBlues.desc",
  },
  {
    type: "Film",
    title: "Moonlight",
    by: "Barry Jenkins · 2016",
    descKey: "resources:queer101.resource.moonlight.desc",
  },
  {
    type: "Film",
    title: "The Kids Are All Right",
    by: "Lisa Cholodenko · 2010",
    descKey: "resources:queer101.resource.kidsAreAllRight.desc",
  },
  {
    type: "Podcast",
    title: "Queery with Cameron Esposito",
    by: "Cameron Esposito",
    descKey: "resources:queer101.resource.queery.desc",
  },
  {
    type: "Guide",
    title: "Coming Out: A Handbook",
    by: "ILGA-Europe",
    descKey: "resources:queer101.resource.comingOutHandbook.desc",
  },
];

export const RES_CLASS: Record<ResType, string> = {
  Book: "typeBook",
  Film: "typeFilm",
  Podcast: "typePodcast",
  Guide: "typeGuide",
};

export const RES_TYPE_LABEL_KEY: Record<ResType, string> = {
  Book: "resources:queer101.resType.book",
  Film: "resources:queer101.resType.film",
  Podcast: "resources:queer101.resType.podcast",
  Guide: "resources:queer101.resType.guide",
};

/** i18n Pattern A — chrome, resolved via `t()`. */
export const TALK: {
  titleKey: string;
  descKey: string;
  link: { labelKey: string; href: string };
}[] = [
  {
    titleKey: "resources:queer101.talk.peerSupport.title",
    descKey: "resources:queer101.talk.peerSupport.desc",
    link: {
      labelKey: "resources:queer101.talk.peerSupport.cta",
      href: COMMUNITIES,
    },
  },
  {
    titleKey: "resources:queer101.talk.oneToOne.title",
    descKey: "resources:queer101.talk.oneToOne.desc",
    link: {
      labelKey: "resources:queer101.talk.oneToOne.cta",
      href: MENTORSHIP,
    },
  },
  {
    titleKey: "resources:queer101.talk.therapy.title",
    descKey: "resources:queer101.talk.therapy.desc",
    link: { labelKey: "resources:queer101.talk.therapy.cta", href: WELLBEING },
  },
  {
    titleKey: "resources:queer101.talk.askAnon.title",
    descKey: "resources:queer101.talk.askAnon.desc",
    link: { labelKey: "resources:queer101.talk.askAnon.cta", href: FORUM },
  },
];
