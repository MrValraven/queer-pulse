import type { ReferenceDigestTopic } from "../../shared/components/ui";
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

/** One reference the note links, and the digest its trigger opens. */
export interface ModerationStanceLink {
  labelKey: string;
  topic: ReferenceDigestTopic;
}

/**
 * The two references sit behind a dialog rather than a link because of where
 * they are: a moderator reading them is mid-decision, with a report or an
 * application open, and following a link means abandoning that. Each digest is
 * written for the call being made rather than for the page it stands in for,
 * and its footer button is still the way through to the full text.
 */
function digest(id: string, href: string, pointIds: string[]) {
  const base = `safety:moderationStance.digest.${id}`;
  return {
    eyebrowKey: `${base}.eyebrow`,
    labelKey: `${base}.label`,
    titleKey: `${base}.title`,
    leadKey: `${base}.lead`,
    paragraphKeys: [`${base}.p1`, `${base}.p2`],
    points: pointIds.map((pointId) => ({
      titleKey: `${base}.point.${pointId}.title`,
      bodyKey: `${base}.point.${pointId}.body`,
    })),
    href,
    ctaKey: `${base}.cta`,
  };
}

export const MODERATION_STANCE_LINKS: ModerationStanceLink[] = [
  {
    labelKey: "safety:moderationStance.link.guidelines",
    topic: digest("guidelines", routes.guidelines, [
      "oneTest",
      "bothDirections",
      "outcomes",
    ]),
  },
  {
    labelKey: "safety:moderationStance.link.stand",
    topic: digest("stand", `${routes.about}#stand`, [
      "notADebate",
      "speechVsExclusion",
      "whenWeSpeak",
    ]),
  },
];
