/**
 * i18n Pattern A. Real-world helpline names (SOS Voz Amiga, SNS 24, ILGA
 * Portugal, Samaritans) are proper nouns and stay untranslated; `noteKey`
 * (the descriptive hours/format text) is chrome and resolved via `t()`.
 */
export const CRISIS: { name: string; number: string; noteKey: string }[] = [
  {
    name: "SOS Voz Amiga",
    number: "213 544 545",
    noteKey: "resources:mentalHealth.crisisLine.sosVozAmiga.note",
  },
  {
    name: "SNS 24",
    number: "808 24 24 24",
    noteKey: "resources:mentalHealth.crisisLine.sns24.note",
  },
  {
    name: "ILGA Portugal",
    number: "213 887 239",
    noteKey: "resources:mentalHealth.crisisLine.ilga.note",
  },
  {
    name: "Samaritans (online)",
    number: "jo@samaritans.org",
    noteKey: "resources:mentalHealth.crisisLine.samaritans.note",
  },
];

/** i18n Pattern A — platform-authored guidance chrome, resolved via `t()`. */
export const EXPERIENCES: { titleKey: string; textKey: string }[] = [
  {
    titleKey: "resources:mentalHealth.experience.newCommunity.title",
    textKey: "resources:mentalHealth.experience.newCommunity.text",
  },
  {
    titleKey: "resources:mentalHealth.experience.visibility.title",
    textKey: "resources:mentalHealth.experience.visibility.text",
  },
  {
    titleKey: "resources:mentalHealth.experience.admin.title",
    textKey: "resources:mentalHealth.experience.admin.text",
  },
  {
    titleKey: "resources:mentalHealth.experience.transNonbinary.title",
    textKey: "resources:mentalHealth.experience.transNonbinary.text",
  },
  {
    titleKey: "resources:mentalHealth.experience.distance.title",
    textKey: "resources:mentalHealth.experience.distance.text",
  },
  {
    titleKey: "resources:mentalHealth.experience.financial.title",
    textKey: "resources:mentalHealth.experience.financial.text",
  },
];

export const SNS: { number: string; titleKey: string; textKey: string }[] = [
  {
    number: "01",
    titleKey: "resources:mentalHealth.sns.step1.title",
    textKey: "resources:mentalHealth.sns.step1.text",
  },
  {
    number: "02",
    titleKey: "resources:mentalHealth.sns.step2.title",
    textKey: "resources:mentalHealth.sns.step2.text",
  },
  {
    number: "03",
    titleKey: "resources:mentalHealth.sns.step3.title",
    textKey: "resources:mentalHealth.sns.step3.text",
  },
  {
    number: "04",
    titleKey: "resources:mentalHealth.sns.step4.title",
    textKey: "resources:mentalHealth.sns.step4.text",
  },
];
