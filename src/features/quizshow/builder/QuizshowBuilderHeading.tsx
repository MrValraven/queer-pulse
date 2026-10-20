import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { QuizshowScope } from "../quizshowScope";
import styles from "./QuizshowBuilder.module.css";

/** The builder's heading and lead: "Live game" on an event, "Your quiz" on a game. */
export function QuizshowBuilderHeading({ scope }: { scope: QuizshowScope }) {
  const { t } = useTranslation();
  const isGame = scope.kind === "game";
  return (
    <div className={styles.headingText}>
      {/* On a game page the h1 is the game's title, so this heading steps down a size. */}
      <h2
        className={
          isGame ? `${styles.heading} ${styles.headingGame}` : styles.heading
        }
      >
        {t(
          isGame ? "quizshow:builder.gameHeading" : "quizshow:builder.heading",
        )}
      </h2>
      <p className={styles.lead}>
        {t(isGame ? "quizshow:builder.gameLead" : "quizshow:builder.lead")}
      </p>
    </div>
  );
}
