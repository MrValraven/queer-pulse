import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { QuizshowScope } from "../quizshowScope";
import styles from "./QuizshowBuilder.module.css";

const HEADING_COPY: Record<
  QuizshowScope["kind"],
  { headingKey: string; leadKey: string }
> = {
  event: {
    headingKey: "quizshow:builder.heading",
    leadKey: "quizshow:builder.lead",
  },
  game: {
    headingKey: "quizshow:builder.gameHeading",
    leadKey: "quizshow:builder.gameLead",
  },
  template: {
    headingKey: "quizshow:templates.builder.heading",
    leadKey: "quizshow:templates.builder.lead",
  },
};

/** The builder's heading and lead: "Live game" on an event, "Your quiz" on a game, "Template quiz" on a template. */
export function QuizshowBuilderHeading({ scope }: { scope: QuizshowScope }) {
  const { t } = useTranslation();
  const { headingKey, leadKey } = HEADING_COPY[scope.kind];
  // On a game or template page the h1 is the page's own title, so this heading steps down a size.
  const isPageTitled = scope.kind !== "event";
  return (
    <div className={styles.headingText}>
      <h2
        className={
          isPageTitled
            ? `${styles.heading} ${styles.headingGame}`
            : styles.heading
        }
      >
        {t(headingKey)}
      </h2>
      <p className={styles.lead}>{t(leadKey)}</p>
    </div>
  );
}
