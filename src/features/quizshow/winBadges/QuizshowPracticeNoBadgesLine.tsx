import { Collapse } from "../../../shared/components/ui/Collapse";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { QuizshowSessionScope } from "../quizshowScope";
import styles from "./QuizshowWinBadges.module.css";
import { useQuizshowWinBadgesPreview } from "./useQuizshowWinBadgesPreview";

interface QuizshowPracticeNoBadgesLineProps {
  scope: QuizshowSessionScope;
  isPractice: boolean;
}

/** The open-lobby dialog's note that a practice game gives no badges. It shows
 *  only for an event that has badges on its next game. */
export function QuizshowPracticeNoBadgesLine({
  scope,
  isPractice,
}: QuizshowPracticeNoBadgesLineProps) {
  const { t } = useTranslation();
  const isEventScope = scope.kind === "event";
  const query = useQuizshowWinBadgesPreview(
    scope.kind === "event" ? scope.eventSlug : null,
    { isEnabled: isEventScope },
  );
  const hasPreview = !query.isError && (query.data?.preview ?? null) !== null;
  return (
    <Collapse isOpen={isPractice && hasPreview}>
      <p className={styles.practiceLine}>
        {t("quizshow:winBadges.openDialog.practiceNoBadges")}
      </p>
    </Collapse>
  );
}
