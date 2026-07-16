import { routes } from "../../app/routeMap";

/** Mock therapist directory — content, left in English (see scope rule). */
export const THERAPISTS = [
  {
    name: "Dra. Marta Seabra",
    spec: "Clinical psychologist · LGBTQ+ identity, trauma, and workplace stress.",
    tags: ["Trans-affirming", "Sliding scale", "EN · PT"],
    loc: "Príncipe Real · Online",
  },
  {
    name: "Paulo Esteves",
    spec: "Psychotherapist · relationships, coming out, family estrangement, depression.",
    tags: ["Non-binary aware", "PT · ES"],
    loc: "Arroios",
  },
  {
    name: "Dra. Filipa Ramos",
    spec: "Psychiatrist · gender dysphoria, anxiety, mood disorders, medication management.",
    tags: ["Trans healthcare", "SNS referrals", "PT"],
    loc: "Amoreiras",
  },
  {
    name: "Ana Costa, MSc",
    spec: "Counsellor · identity exploration, neurodivergent-affirming, relationship counselling.",
    tags: ["ADHD-affirming", "Sliding scale", "EN · PT"],
    loc: "Mouraria · Online",
  },
  {
    name: "João Saraiva",
    spec: "Psychologist · gay men's mental health, HIV-positive affirming, substance use support.",
    tags: ["Harm reduction", "PT · EN"],
    loc: "Cais do Sodré",
  },
];

/**
 * i18n Pattern A. Real-world helpline names (SOS Voz Amiga, ILGA Portugal,
 * Rede ex aequo) are proper nouns and stay untranslated; `descKey`/`hoursKey`
 * are chrome. Flagged for native review — crisis-line accuracy matters.
 */
export const CRISIS = [
  {
    name: "SOS Voz Amiga",
    descKey: "resources:wellbeing.crisis.sosVozAmiga.desc",
    num: "213 544 545",
    hoursKey: "resources:wellbeing.crisis.sosVozAmiga.hours",
  },
  {
    name: "ILGA Portugal",
    descKey: "resources:wellbeing.crisis.ilga.desc",
    num: "218 873 918",
    hoursKey: "resources:wellbeing.crisis.ilga.hours",
  },
  {
    name: "Rede ex aequo",
    descKey: "resources:wellbeing.crisis.redeExAequo.desc",
    num: "redeexaequo.pt",
    hoursKey: "resources:wellbeing.crisis.redeExAequo.hours",
  },
];

/** i18n Pattern A — platform-authored guidance chrome, resolved via `t()`. */
export const HARM = [
  {
    titleKey: "resources:wellbeing.harm.nightlife.title",
    descKey: "resources:wellbeing.harm.nightlife.desc",
  },
  {
    titleKey: "resources:wellbeing.harm.drugsAlcohol.title",
    descKey: "resources:wellbeing.harm.drugsAlcohol.desc",
  },
  {
    titleKey: "resources:wellbeing.harm.sexualHealth.title",
    descKey: "resources:wellbeing.harm.sexualHealth.desc",
  },
  {
    titleKey: "resources:wellbeing.harm.chemsex.title",
    descKey: "resources:wellbeing.harm.chemsex.desc",
  },
];

export const WELLBEING_SUBPAGES = [
  {
    labelKey: "resources:wellbeing.subpage.harmReduction.label",
    to: routes.harmReduction,
    blurbKey: "resources:wellbeing.subpage.harmReduction.blurb",
  },
  {
    labelKey: "resources:wellbeing.subpage.sober.label",
    to: routes.sober,
    blurbKey: "resources:wellbeing.subpage.sober.blurb",
  },
];
