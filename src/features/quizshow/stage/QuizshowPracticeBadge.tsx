import { LuNotebookPen } from "react-icons/lu";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import styles from "./QuizshowPracticeBadge.module.css";

export type QuizshowPracticeBadgeTone = "stage" | "phone" | "studio";

interface QuizshowPracticeBadgeProps {
  /** Where it sits: the TV, a player's phone, or the studio and remote chrome. */
  tone: QuizshowPracticeBadgeTone;
  className?: string;
}

const TONE_CLASS_NAMES: Record<QuizshowPracticeBadgeTone, string | undefined> =
  {
    stage: styles.stage,
    phone: styles.phone,
    studio: styles.studio,
  };

/** "Practice" / "Treino": shown on every surface of a practice session (C6.9). */
export function QuizshowPracticeBadge({
  tone,
  className,
}: QuizshowPracticeBadgeProps) {
  const { t } = useTranslation();
  const badgeClassName = [styles.badge, TONE_CLASS_NAMES[tone], className]
    .filter(Boolean)
    .join(" ");
  return (
    <span className={badgeClassName}>
      <LuNotebookPen
        className={styles.icon}
        aria-hidden="true"
        focusable="false"
      />
      {t("quizshow:stage.practice")}
    </span>
  );
}
