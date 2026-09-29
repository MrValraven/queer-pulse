import type { IconType } from "react-icons";
import {
  FiClock,
  FiCompass,
  FiMoon,
  FiShield,
  FiUser,
  FiUserPlus,
} from "react-icons/fi";
import { LENSES } from "../goTogetherQuestionnaire.data";
import { goTogetherErrorCode } from "../api/goTogether.api";
import type {
  GoTogetherErrorCode,
  Lens,
  MemberBlocker,
} from "../api/goTogether.types";

/** The lens step's choices: "No lens" first, then the three lenses. */
export const NO_LENS = "none";
export type LensChoice = Lens | typeof NO_LENS;
export const LENS_CHOICES: readonly LensChoice[] = [NO_LENS, ...LENSES];

export type GoMode = "solo" | "pair";

/** The two ways to go, as radio cards. */
export const GO_MODE_OPTIONS: readonly {
  id: GoMode;
  icon: IconType;
  labelKey: string;
  descriptionKey: string;
}[] = [
  {
    id: "solo",
    icon: FiUser,
    labelKey: "goTogether:card.mode.solo.label",
    descriptionKey: "goTogether:card.mode.solo.description",
  },
  {
    id: "pair",
    icon: FiUserPlus,
    labelKey: "goTogether:card.mode.pair.label",
    descriptionKey: "goTogether:card.mode.pair.description",
  },
];

/** The quiet states that are a title and a line of copy, nothing to press. */
export type QuietCardState = "unmatched" | "restricted";

export const QUIET_STATE_COPY: Record<
  QuietCardState,
  { icon: IconType; titleKey: string; bodyKey: string }
> = {
  unmatched: {
    icon: FiMoon,
    titleKey: "goTogether:card.unmatched.title",
    bodyKey: "goTogether:card.unmatched.body",
  },
  restricted: {
    icon: FiShield,
    titleKey: "goTogether:card.ineligible.unavailableTitle",
    bodyKey: "goTogether:card.ineligible.unavailableBody",
  },
};

/** Icons for the states that carry actions. The card heading already wears
 *  the people icon, so no panel repeats it. */
export const STATE_ICONS = {
  questionnaireNeeded: FiCompass,
  waiting: FiClock,
  pairInvite: FiUserPlus,
  notVerified: FiShield,
} satisfies Record<string, IconType>;

/**
 * Which blockers show a panel at all. `bannedFromEvent` and `notGoing` show
 * nothing: the card only ever appears to members who are going.
 */
export const BLOCKER_PANEL: Record<
  MemberBlocker,
  "notVerified" | "restricted" | null
> = {
  notVerified: "notVerified",
  restricted: "restricted",
  inactive: "restricted",
  bannedFromEvent: null,
  notGoing: null,
};

/** Copy for a failed opt-in or pair answer. Any code missing here falls
 *  back to `OPT_IN_ERROR_FALLBACK_KEY`. */
export const OPT_IN_ERROR_KEYS: Partial<Record<GoTogetherErrorCode, string>> = {
  GO_TOGETHER_PARTNER_UNAVAILABLE: "goTogether:card.error.partnerUnavailable",
  GO_TOGETHER_PROFILE_NEEDED: "goTogether:card.error.profileNeeded",
  GO_TOGETHER_LENS_CONSENT_REQUIRED: "goTogether:card.error.lensConsent",
  GO_TOGETHER_LENS_MISMATCH: "goTogether:card.error.lensMismatch",
  GO_TOGETHER_ALREADY_GROUPED: "goTogether:card.error.alreadyGrouped",
  GO_TOGETHER_LOCKED: "goTogether:card.error.locked",
  GO_TOGETHER_INELIGIBLE: "goTogether:card.error.ineligible",
  GO_TOGETHER_UNAVAILABLE: "goTogether:card.error.unavailable",
  GO_TOGETHER_INVALID_ANSWERS: "goTogether:card.error.invalidAnswers",
};

/** Refusals that mean the card on screen is out of date. A missing profile
 *  refetches the card into its questionnaire state, which carries the link. */
const CARD_REFRESH_ERROR_CODES: ReadonlySet<GoTogetherErrorCode> = new Set([
  "GO_TOGETHER_PROFILE_NEEDED",
  "GO_TOGETHER_ALREADY_GROUPED",
  "GO_TOGETHER_LOCKED",
  "GO_TOGETHER_UNAVAILABLE",
  "GO_TOGETHER_INVALID_ANSWERS",
]);

/** Whether a failed write should refetch the card. */
export function shouldRefreshCardAfter(error: Error): boolean {
  const code = goTogetherErrorCode(error);
  return code !== null && CARD_REFRESH_ERROR_CODES.has(code);
}

export const OPT_IN_ERROR_FALLBACK_KEY = "goTogether:card.error.generic";

/** The copy key for a failed card write, from the error's code, or null
 *  when there is no error. */
export function cardErrorKey(error: Error | null): string | null {
  if (!error) return null;
  const code = goTogetherErrorCode(error);
  return (code && OPT_IN_ERROR_KEYS[code]) || OPT_IN_ERROR_FALLBACK_KEY;
}

/** The date shape for "Your group lands {day} at {time}". */
export const REVEAL_DAY_FORMAT: Intl.DateTimeFormatOptions = {
  weekday: "long",
  day: "numeric",
  month: "long",
};

/** The card section's id. The questionnaire's return path ends in this
 *  anchor, so the member lands back on the card. */
export const GO_TOGETHER_CARD_ANCHOR = "go-together";
