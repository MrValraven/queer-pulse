import { FiWifiOff } from "react-icons/fi";
import { Collapse } from "../../../shared/components/ui/Collapse";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { QuizshowConnectionStatus } from "../realtime/quizshowClientStore";
import styles from "./QuizshowStage.module.css";

/** A line across the top while the socket reconnects; folds away once attached.
 *  The live region stays mounted and fills in, so the line is announced. */
export function QuizshowConnectionBanner({
  status,
}: {
  status: QuizshowConnectionStatus;
}) {
  const { t } = useTranslation();
  const isReconnecting = status === "reconnecting";
  const reconnectingLine = t("quizshow:stage.reconnecting");
  return (
    <>
      <span role="status" className={styles.visuallyHidden}>
        {isReconnecting ? reconnectingLine : ""}
      </span>
      <Collapse isOpen={isReconnecting}>
        <div className={styles.banner} aria-hidden="true">
          <FiWifiOff aria-hidden="true" fill="none" />
          {reconnectingLine}
        </div>
      </Collapse>
    </>
  );
}
