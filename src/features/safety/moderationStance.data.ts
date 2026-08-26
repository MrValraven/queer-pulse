import { routes } from "../../app/routeMap";

/** Which decision a moderator is making, and so which rules they need. */
export type ModerationStanceVariant = "reports" | "applicants";

/**
 * The decision rules a moderator has to get right at the moment they act,
 * drawn from the platform's published positions (`/about#stand`) and the
 * Guidelines clause that carries them.
 *
 * These live at the queue rather than in a docs page because that is where the
 * call is made: before this, no moderation surface linked the Guidelines at
 * all, so the only way to know the asymmetry in the first `reports` rule was to
 * have read the About page recently.
 *
 * The two variants are the same policy read for two different jobs. Judging a
 * report asks "was this within the lines"; judging an applicant asks "am I
 * screening the person rather than the application", which is where
 * identity-policing actually happens.
 */
export const MODERATION_STANCE_RULES: Record<
  ModerationStanceVariant,
  string[]
> = {
  reports: [
    "safety:moderationStance.rule.politicalSpeech",
    "safety:moderationStance.rule.noBothSides",
    "safety:moderationStance.rule.neverProveGender",
  ],
  applicants: [
    "safety:moderationStance.applicantRule.neverProveIdentity",
    "safety:moderationStance.applicantRule.politicsNotAScreen",
    "safety:moderationStance.applicantRule.judgeTheApplication",
  ],
};

export const MODERATION_STANCE_HEAD: Record<ModerationStanceVariant, string> = {
  reports: "safety:moderationStance.head",
  applicants: "safety:moderationStance.applicantHead",
};

export const MODERATION_STANCE_LINKS = [
  {
    labelKey: "safety:moderationStance.link.guidelines",
    href: routes.guidelines,
  },
  {
    labelKey: "safety:moderationStance.link.stand",
    href: `${routes.about}#stand`,
  },
];
