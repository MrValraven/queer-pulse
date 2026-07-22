/**
 * i18n Pattern A — this file holds catalog *keys*; the components resolve
 * them with `t()`. The nav rail, conviction strip, "where to start" steps and
 * skills cards are platform-authored chrome, so they're translated.
 *
 * `ORGS` and `VOLUNTEER_ROLES` stay untranslated: partner-organisation
 * profile copy and volunteer-opportunity descriptions are explicitly called
 * out as content in `docs/i18n/extraction-brief.md` §1 — in live mode each
 * org's name/description and each posting's title/commitment/description
 * would arrive from the partners/volunteering API as that org's own
 * authored text, not platform chrome.
 */
export const ACTIVISM_NAV: { id: string; labelKey: string }[] = [
  { id: "start", labelKey: "marketing:activism.nav.start" },
  { id: "local", labelKey: "marketing:activism.nav.local" },
  { id: "skills", labelKey: "marketing:activism.nav.skills" },
  { id: "mobilise", labelKey: "marketing:activism.nav.mobilise" },
  { id: "feel", labelKey: "marketing:activism.nav.feel" },
  { id: "orgs", labelKey: "marketing:activism.nav.orgs" },
  { id: "volunteer", labelKey: "marketing:activism.nav.volunteer" },
];

export const CONVICTION_ITEMS: { wordKey: string; restKey: string }[] = [
  {
    wordKey: "marketing:activism.conviction.local.word",
    restKey: "marketing:activism.conviction.local.rest",
  },
  {
    wordKey: "marketing:activism.conviction.real.word",
    restKey: "marketing:activism.conviction.real.rest",
  },
  {
    wordKey: "marketing:activism.conviction.yours.word",
    restKey: "marketing:activism.conviction.yours.rest",
  },
];

export const START_STEPS: { num: string; titleKey: string; bodyKey: string }[] =
  [
    {
      num: "01",
      titleKey: "marketing:activism.start.step1.title",
      bodyKey: "marketing:activism.start.step1.body",
    },
    {
      num: "02",
      titleKey: "marketing:activism.start.step2.title",
      bodyKey: "marketing:activism.start.step2.body",
    },
    {
      num: "03",
      titleKey: "marketing:activism.start.step3.title",
      bodyKey: "marketing:activism.start.step3.body",
    },
    {
      num: "04",
      titleKey: "marketing:activism.start.step4.title",
      bodyKey: "marketing:activism.start.step4.body",
    },
  ];

export const SKILLS_CARDS: { titleKey: string; bodyKey: string }[] = [
  {
    titleKey: "marketing:activism.skills.design.title",
    bodyKey: "marketing:activism.skills.design.body",
  },
  {
    titleKey: "marketing:activism.skills.tech.title",
    bodyKey: "marketing:activism.skills.tech.body",
  },
  {
    titleKey: "marketing:activism.skills.food.title",
    bodyKey: "marketing:activism.skills.food.body",
  },
  {
    titleKey: "marketing:activism.skills.care.title",
    bodyKey: "marketing:activism.skills.care.body",
  },
];

/** The open letter's live signature count + hand-delivery target — held as
 * numbers so the component can format them with `useFormat()` rather than
 * baking the digits into the catalog string. */
export const OPEN_LETTER_SIGNATURES = 2847;
export const OPEN_LETTER_TARGET = 5000;

export const ORGS = [
  {
    av: "IL",
    bg: "rgba(74,140,111,.12)",
    color: "var(--jade)",
    name: "ILGA Portugal",
    desc: "Portugal's leading LGBTQ+ rights organisation. Legal support, advocacy, crisis line, community programming. Volunteers always welcome.",
  },
  {
    av: "OD",
    bg: "rgba(232,119,90,.1)",
    color: "var(--accent-ink)",
    name: "Opus Diversus",
    desc: "Mental health and peer support. Run regular training for allies and professionals who want to improve their practice.",
  },
  {
    av: "RA",
    bg: "rgba(45,27,61,.08)",
    color: "var(--plum)",
    name: "Rede ex aequo",
    desc: "Youth-focused LGBTQ+ association. Peer support, advocacy for young people, and local groups across Portugal including Lisbon.",
  },
  {
    av: "PR",
    bg: "rgba(74,140,111,.1)",
    color: "var(--jade)",
    name: "Panteras Rosa",
    desc: "Trans rights activism and advocacy. Political campaigning and community organising with a focus on trans visibility.",
  },
];

export const VOLUNTEER_ROLES = [
  {
    title: "Community Outreach",
    pill: "2–4 hrs/wk",
    body: "ILGA Portugal · Help connect community members with services and resources at events and outreach sessions across the city.",
  },
  {
    title: "Peer Support Volunteer",
    pill: "4 hrs/wk",
    body: "Opus Diversus · Training provided. Support people through peer-led mental health conversations. Care and a willingness to listen is enough.",
  },
  {
    title: "Campaign Communications",
    pill: "Flexible",
    body: "Panteras Rosa · Writing, design, or social media for trans rights campaigns. Remote-friendly. Bring whatever skill you have.",
  },
  {
    title: "Housing Advocate",
    pill: "2–3 hrs/wk",
    body: "Queer Housing Justice Network · Support queer residents navigating eviction challenges in Mouraria and Intendente.",
  },
];
