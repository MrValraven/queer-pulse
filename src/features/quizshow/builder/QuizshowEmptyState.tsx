import { useId } from "react";
import { Button } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { QuizshowQuizResponse } from "../../../shared/contracts/quizshow";
import { QuizshowImportButtons } from "./QuizshowImportButtons";
import styles from "./QuizshowImport.module.css";

interface QuizshowEmptyStateProps {
  slug: string;
  eventStartAt: Date;
  isAdultsEvent: boolean;
  onStartBlank: () => void;
  onImported?: (response: QuizshowQuizResponse) => void;
}

export function QuizshowEmptyState({
  slug,
  eventStartAt,
  isAdultsEvent,
  onStartBlank,
  onImported,
}: QuizshowEmptyStateProps) {
  const { t } = useTranslation();
  const titleId = useId();
  return (
    <section className={styles.emptyCard} aria-labelledby={titleId}>
      <h2 id={titleId} className={styles.emptyTitle}>
        {t("quizshow:builder.empty.title")}
      </h2>
      <p className={styles.emptyBody}>{t("quizshow:builder.empty.body")}</p>
      <div className={styles.actions}>
        <QuizshowImportButtons
          slug={slug}
          hasQuiz={false}
          eventStartAt={eventStartAt}
          isAdultsEvent={isAdultsEvent}
          variant="empty"
          onImported={onImported}
        />
        <Button variant="ghost" onClick={onStartBlank}>
          {t("quizshow:builder.empty.blank")}
        </Button>
      </div>
    </section>
  );
}
