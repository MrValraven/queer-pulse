import type { JSX } from "react";
import { FiPause } from "react-icons/fi";
import { Collapse } from "../../../shared/components/ui/Collapse";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import styles from "./QuizshowStage.module.css";

/** The one paused line every surface shows (screen, phone, remote), in every
 *  phase. Callers pass `cursor.status === "paused"`, so a restart pause shows
 *  it too. It folds in and out with the shared Collapse. Each surface owns its
 *  own live-region announcement, so this line stays a plain visible note. */
export function QuizshowPausedNote(props: { isPaused: boolean }): JSX.Element {
  const { isPaused } = props;
  const { t } = useTranslation();
  return (
    <Collapse isOpen={isPaused}>
      <p className={styles.pausedNote}>
        <FiPause aria-hidden="true" fill="none" />
        {t("quizshow:stage.paused")}
      </p>
    </Collapse>
  );
}
