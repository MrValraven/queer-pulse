/**
 * i18n Pattern A — this file holds catalog *keys*; the components resolve
 * them with `t()`. The nav rail, conviction strip, "where to start" steps and
 * skills cards are platform-authored chrome, so they're translated.
 *
 * The Orgs and Volunteer teasers are NOT sourced here: they read the real
 * partners/volunteering APIs via `usePartners()` / `useOpportunities()` (demo
 * mode falls back to the shared PARTNERS / VOLUNTEER_OPPORTUNITIES registries),
 * so an unpopulated live platform shows no fabricated orgs or postings.
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
