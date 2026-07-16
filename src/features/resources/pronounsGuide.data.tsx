/** i18n Pattern A — platform-authored chrome, resolved via `t()` in PronounsGuideSections.tsx. */
export const NAME_TABLE: {
  fieldKey: string;
  useKey: string;
  whoKey: string;
  whoVariant: "jade" | "accent";
}[] = [
  {
    fieldKey: "resources:pronounsGuide.table.displayName.field",
    useKey: "resources:pronounsGuide.table.displayName.use",
    whoKey: "resources:pronounsGuide.table.displayName.who",
    whoVariant: "jade",
  },
  {
    fieldKey: "resources:pronounsGuide.table.chosenName.field",
    useKey: "resources:pronounsGuide.table.chosenName.use",
    whoKey: "resources:pronounsGuide.table.chosenName.who",
    whoVariant: "jade",
  },
  {
    fieldKey: "resources:pronounsGuide.table.username.field",
    useKey: "resources:pronounsGuide.table.username.use",
    whoKey: "resources:pronounsGuide.table.username.who",
    whoVariant: "accent",
  },
  {
    fieldKey: "resources:pronounsGuide.table.legalName.field",
    useKey: "resources:pronounsGuide.table.legalName.use",
    whoKey: "resources:pronounsGuide.table.legalName.who",
    whoVariant: "jade",
  },
];

export type WhereIcon = "profile" | "messages" | "forum" | "magazine";

export const WHERE_CARDS: {
  icon: WhereIcon;
  jade?: boolean;
  titleKey: string;
  textKey: string;
  timingKey: string;
  delay?: boolean;
}[] = [
  {
    icon: "profile",
    jade: true,
    titleKey: "resources:pronounsGuide.where.profile.title",
    textKey: "resources:pronounsGuide.where.profile.text",
    timingKey: "resources:pronounsGuide.where.profile.timing",
  },
  {
    icon: "messages",
    jade: true,
    titleKey: "resources:pronounsGuide.where.messages.title",
    textKey: "resources:pronounsGuide.where.messages.text",
    timingKey: "resources:pronounsGuide.where.messages.timing",
  },
  {
    icon: "forum",
    titleKey: "resources:pronounsGuide.where.forum.title",
    textKey: "resources:pronounsGuide.where.forum.text",
    timingKey: "resources:pronounsGuide.where.forum.timing",
    delay: true,
  },
  {
    icon: "magazine",
    titleKey: "resources:pronounsGuide.where.magazine.title",
    textKey: "resources:pronounsGuide.where.magazine.text",
    timingKey: "resources:pronounsGuide.where.magazine.timing",
    delay: true,
  },
];

/**
 * i18n Pattern A. `aKey` for FAQ #2 and #6 embeds an `<a>` tag placeholder for
 * `<Translation>` (mailto link / Data Export link respectively) — the
 * component supplies the actual `<a href>` element.
 */
export const PRONOUN_FAQS: { qKey: string; aKey: string }[] = [
  {
    qKey: "resources:pronounsGuide.faq.q1",
    aKey: "resources:pronounsGuide.faq.a1",
  },
  {
    qKey: "resources:pronounsGuide.faq.q2",
    aKey: "resources:pronounsGuide.faq.a2",
  },
  {
    qKey: "resources:pronounsGuide.faq.q3",
    aKey: "resources:pronounsGuide.faq.a3",
  },
  {
    qKey: "resources:pronounsGuide.faq.q4",
    aKey: "resources:pronounsGuide.faq.a4",
  },
  {
    qKey: "resources:pronounsGuide.faq.q5",
    aKey: "resources:pronounsGuide.faq.a5",
  },
  {
    qKey: "resources:pronounsGuide.faq.q6",
    aKey: "resources:pronounsGuide.faq.a6",
  },
];
