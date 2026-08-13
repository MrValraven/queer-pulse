import { routes } from "../../app/routeMap";

/**
 * i18n Pattern A. Real-world helpline names (SOS Voz Amiga, ILGA Portugal,
 * Rede ex aequo) are proper nouns and stay untranslated; `descriptionKey`/`hoursKey`
 * are chrome. Flagged for native review — crisis-line accuracy matters.
 */
export const CRISIS = [
  {
    name: "SOS Voz Amiga",
    descriptionKey: "resources:wellbeing.crisis.sosVozAmiga.desc",
    number: "213 544 545",
    hoursKey: "resources:wellbeing.crisis.sosVozAmiga.hours",
  },
  {
    name: "ILGA Portugal",
    descriptionKey: "resources:wellbeing.crisis.ilga.desc",
    number: "218 873 918",
    hoursKey: "resources:wellbeing.crisis.ilga.hours",
  },
  {
    name: "Rede ex aequo",
    descriptionKey: "resources:wellbeing.crisis.redeExAequo.desc",
    number: "redeexaequo.pt",
    hoursKey: "resources:wellbeing.crisis.redeExAequo.hours",
  },
];

/** i18n Pattern A — platform-authored guidance chrome, resolved via `t()`. */
export const HARM = [
  {
    titleKey: "resources:wellbeing.harm.nightlife.title",
    descriptionKey: "resources:wellbeing.harm.nightlife.desc",
  },
  {
    titleKey: "resources:wellbeing.harm.drugsAlcohol.title",
    descriptionKey: "resources:wellbeing.harm.drugsAlcohol.desc",
  },
  {
    titleKey: "resources:wellbeing.harm.sexualHealth.title",
    descriptionKey: "resources:wellbeing.harm.sexualHealth.desc",
  },
  {
    titleKey: "resources:wellbeing.harm.chemsex.title",
    descriptionKey: "resources:wellbeing.harm.chemsex.desc",
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
