import { useId } from "react";
import { FiFilePlus } from "react-icons/fi";
import { Button } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { QuizshowImportButtons } from "../builder/QuizshowImportButtons";
import { useQuizshowStudio } from "./QuizshowStudioContext";
import styles from "./QuizshowStudioCanvas.module.css";

/**
 * The start panel for an event or game with no quiz yet: start from one of
 * our team's templates, copy a quiz from a game or an event (the series
 * shortcut first on an event), or start with a blank quiz. The picker asked
 * for on arrival (`?start=copy`) opens once, as on the builder.
 */
export function QuizshowStudioStart() {
  const { t } = useTranslation();
  const titleId = useId();
  const { start } = useQuizshowStudio();
  const { sessionScope } = start;
  if (sessionScope === null) return null;
  return (
    <div className={styles.startArea}>
      <section className={styles.startCard} aria-labelledby={titleId}>
        <span className={styles.startMark} aria-hidden="true">
          <span className={styles.startSlide} />
          <span className={styles.startSlide} />
          <span className={styles.startSlide} />
        </span>
        <h2 id={titleId} className={styles.startTitle}>
          {t("quizshow:builder.empty.title")}
        </h2>
        <p className={styles.startBody}>{t("quizshow:builder.empty.body")}</p>
        <div className={styles.startActions}>
          <QuizshowImportButtons
            scope={sessionScope}
            hasQuiz={false}
            eventStartAt={start.eventStartAt}
            isAdultsEvent={start.isAdultsEvent}
            variant="empty"
            onImported={start.importDraft}
            initialOpenPicker={start.initialImportPicker}
          />
          <Button type="button" variant="ghost" onClick={start.startBlank}>
            <FiFilePlus aria-hidden /> {t("quizshow:studio.start.blank")}
          </Button>
        </div>
      </section>
    </div>
  );
}
