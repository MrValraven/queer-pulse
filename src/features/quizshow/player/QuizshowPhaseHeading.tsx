import type { Ref } from "react";
import type { QuizshowPhase } from "../../../shared/contracts/quizshow";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import styles from "./QuizshowPlayer.module.css";

/**
 * A heading the eye does not need: it carries the phase's own announcement
 * ("Scores are up", "The podium") and takes the focus `useQuizshowHeadingFocus`
 * moves, so a phase whose body draws no text heading still lands keyboard and
 * screen reader users on its new content.
 */
export function QuizshowPhaseHeading({
  headingRef,
  phase,
}: {
  headingRef: Ref<HTMLHeadingElement>;
  phase: QuizshowPhase;
}) {
  const { t } = useTranslation();
  return (
    <h1 ref={headingRef} tabIndex={-1} className={styles.visuallyHidden}>
      {t(`quizshow:player.announce.${phase}`)}
    </h1>
  );
}
