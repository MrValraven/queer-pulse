import { FiAward } from "react-icons/fi";
import { routes } from "../../app/routeMap";
import type { Formatters } from "../../shared/i18n/format";
import type { Language, TFunction } from "../../shared/i18n/types";
import { quizBadgeEarnedText } from "./api/quizBadgeNotification";
import type { DemoNotificationRow } from "./notificationsListActivity.data";

/** The id of the demo quiz win row, which starts unread. */
export const DEMO_QUIZ_BADGE_NOTIFICATION_ID = 42;

const DEMO_QUIZ_BADGE_KEY = "quiz:demo-quiz-badge-champion";
const MILLISECONDS_PER_MINUTE = 60_000;

/** The demo row for a quiz win: an unread `badge_earned` that opens the badge. */
export function buildQuizBadgeNotifications(
  t: TFunction,
  fmt: Formatters,
  language?: Language,
): DemoNotificationRow[] {
  const text =
    quizBadgeEarnedText(
      {
        badgeKey: DEMO_QUIZ_BADGE_KEY,
        badgeName: "Quiz Night Champion",
        badgeNamePt: "Campeã da noite de quiz",
        eventName: "Pride Brunch: June Edition",
      },
      t,
      language,
    ) ?? "";
  return [
    {
      id: DEMO_QUIZ_BADGE_NOTIFICATION_ID,
      type: "platform",
      unread: true,
      icon: { Glyph: FiAward, background: "rgba(var(--plum-rgb), .07)" },
      text,
      meta: t("notifications:type.badge_earned.meta"),
      time: fmt.relativeTime(-40, "minute"),
      createdAtIso: new Date(
        Date.now() - 40 * MILLISECONDS_PER_MINUTE,
      ).toISOString(),
      sourceHref: `${routes.badges}?badge=${encodeURIComponent(DEMO_QUIZ_BADGE_KEY)}`,
    },
  ];
}
