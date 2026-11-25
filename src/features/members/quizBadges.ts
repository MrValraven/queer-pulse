import type { Language } from "../../shared/i18n/types";
import {
  QUIZ_BADGE_CATEGORY,
  type QuizBadgeRarity,
  type QuizBadgeText,
  type QuizBadgeTint,
} from "../../shared/contracts/quizWinBadges";
import { quizBadgeTextIn } from "../quizshow/winBadges/quizWinBadgeText";
import type { Badge, QuizBadgeDetails } from "./badges.data";
import { quizBadgeIconNode } from "./quizBadgeIcon";

export function isQuizBadge(
  badge: Badge,
): badge is Badge & { quiz: QuizBadgeDetails } {
  return badge.quiz !== undefined;
}

/** A quiz badge's name in the viewer's language; any other badge keeps its own. */
export function quizBadgeName(badge: Badge, language: Language): string {
  return isQuizBadge(badge)
    ? quizBadgeTextIn(badge.quiz.name, language)
    : badge.name;
}

/** A quiz badge's description in the viewer's language; any other badge reads
 *  its criteria, then its earned line. */
export function quizBadgeDescription(badge: Badge, language: Language): string {
  return isQuizBadge(badge)
    ? quizBadgeTextIn(badge.quiz.description, language)
    : (badge.criteria ?? badge.when);
}

/** True when at least one win came from an adults-only event. */
export function hasAdultsOnlyWin(quiz: QuizBadgeDetails): boolean {
  return quiz.wins.some((win) => win.isAdultsOnlyEvent);
}

export interface QuizBadgePreviewInput {
  name: QuizBadgeText;
  description: QuizBadgeText;
  iconKey: string;
  tint: QuizBadgeTint;
  rarity: QuizBadgeRarity;
}

/** The badge model the admin form previews, one win and no history. */
export function quizBadgeModelOf(definition: QuizBadgePreviewInput): Badge {
  return {
    key: "quiz:preview",
    category: QUIZ_BADGE_CATEGORY,
    name: definition.name.en,
    when: definition.description.en,
    rarity: definition.rarity,
    tint: definition.tint,
    icon: quizBadgeIconNode(definition.iconKey),
    quiz: {
      definitionId: "preview",
      name: definition.name,
      description: definition.description,
      iconKey: definition.iconKey,
      winCount: 1,
      wins: [],
    },
  };
}
