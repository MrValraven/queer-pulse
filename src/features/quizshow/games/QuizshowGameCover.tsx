import { useTranslation } from "../../../shared/i18n/useTranslation";
import styles from "./QuizshowGameCover.module.css";

interface QuizshowGameCoverProps {
  /** The game or template title. A blank one reads as "Untitled game". */
  title: string;
  roundCount: number;
  questionCount: number;
  isAdultsOnly: boolean;
  /** `card` is the 16:9 slide; `compact` trims the meta line for small thumbnails. */
  size?: "card" | "compact";
}

/** How much room the title needs: the type steps down so a long title still fits its slide. */
function lengthStepOf(title: string): "short" | "medium" | "long" {
  if (title.length <= 22) return "short";
  if (title.length <= 48) return "medium";
  return "long";
}

/**
 * A typeset title slide on the velvet backdrop: the title in Fraunces and the
 * rounds and questions count. It shows no question content. The slide is a
 * static CSS miniature (no animation, no images), so a long list stays cheap.
 * Type scales with the slide's own width, so it reads the same at any size.
 */
export function QuizshowGameCover({
  title,
  roundCount,
  questionCount,
  isAdultsOnly,
  size = "card",
}: QuizshowGameCoverProps) {
  const { t } = useTranslation();
  const trimmedTitle = title.trim();
  const shownTitle =
    trimmedTitle.length > 0 ? trimmedTitle : t("quizshow:game.untitled");
  return (
    <div className={styles.cover} data-size={size}>
      <div className={styles.slide}>
        {isAdultsOnly && (
          <span className={styles.adults}>
            {t("quizshow:games.row.adultsTag")}
          </span>
        )}
        <p className={styles.title} data-length={lengthStepOf(shownTitle)}>
          {shownTitle}
        </p>
        <span aria-hidden className={styles.rule} />
        <p className={styles.meta}>
          {t("quizshow:packs.rounds", { count: roundCount })}
          <span aria-hidden className={styles.dot}>
            {" · "}
          </span>
          <span className={styles.visuallyHidden}>{", "}</span>
          {t("quizshow:packs.questions", { count: questionCount })}
        </p>
      </div>
    </div>
  );
}
