import type { IconType } from "react-icons";
import { FiClock, FiEyeOff, FiLock, FiTrash2, FiUsers } from "react-icons/fi";
import type { HumourPick, Scale5 } from "../goTogetherQuestionnaire.data";

/**
 * The Go together questionnaire, one step per screen, in the order the member
 * walks it. `isRequired` steps must be complete before Next is enabled; the
 * optional ones (music, area) can be left empty, because the matcher treats a
 * missing music pick or area as neutral.
 */
export type QuestionnaireStepId =
  | "values"
  | "humour"
  | "interests"
  | "music"
  | "energy"
  | "intent"
  | "dealbreakers"
  | "area"
  | "consent";

export interface QuestionnaireStep {
  id: QuestionnaireStepId;
  /** The step heading, which takes focus on every step change. */
  titleKey: string;
  /** One plain line under the heading. */
  introKey: string;
  /** Short name for the progress rail and the "Step 2 of 9" line. */
  shortLabelKey: string;
  isRequired: boolean;
}

function step(id: QuestionnaireStepId, isRequired: boolean): QuestionnaireStep {
  return {
    id,
    titleKey: `goTogether:questionnaire.step.${id}.title`,
    introKey: `goTogether:questionnaire.step.${id}.intro`,
    shortLabelKey: `goTogether:questionnaire.step.${id}.short`,
    isRequired,
  };
}

export const QUESTIONNAIRE_STEPS: readonly QuestionnaireStep[] = [
  step("values", true),
  step("humour", true),
  step("interests", true),
  step("music", false),
  step("energy", true),
  step("intent", true),
  step("dealbreakers", true),
  step("area", false),
  step("consent", true),
];

/** The at-least-one floor for interest picks. The backend accepts none, but a
 *  group with no shared interest to talk about is the one thing this step is
 *  for, so the client asks for one. */
export const MIN_INTEREST_TAGS = 1;

/** The five points of every Likert row, low to high. */
export const SCALE_POINTS: readonly Scale5[] = [1, 2, 3, 4, 5];

/** The two sides of every humour pair, in the order the cards show them. */
export const HUMOUR_PICKS: readonly HumourPick[] = ["a", "b"];

export interface ConsentPoint {
  id: string;
  icon: IconType;
  textKey: string;
}

/** The consent step, one plain point per line. `delete` carries a `<link>`
 *  to Settings, Data & privacy. */
export const CONSENT_POINTS: readonly ConsentPoint[] = [
  { id: "use", icon: FiUsers, textKey: "goTogether:questionnaire.consent.use" },
  {
    id: "reasons",
    icon: FiLock,
    textKey: "goTogether:questionnaire.consent.reasons",
  },
  {
    id: "private",
    icon: FiEyeOff,
    textKey: "goTogether:questionnaire.consent.private",
  },
  {
    id: "delete",
    icon: FiTrash2,
    textKey: "goTogether:questionnaire.consent.delete",
  },
  {
    id: "retention",
    icon: FiClock,
    textKey: "goTogether:questionnaire.consent.retention",
  },
];
