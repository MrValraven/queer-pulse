import { useTranslation } from "../../shared/i18n/useTranslation";
import { isLate, type Piece } from "./editorDashboard.data";
import styles from "./EditorDashboardPage.module.css";

/** Four headline counts, derived from the live pieces + pitch inbox. */
export function EditorStats({
  pieces,
  pitchesInInbox,
}: {
  pieces: Piece[];
  pitchesInInbox: number;
}) {
  const { t } = useTranslation();
  const ready = pieces.filter((p) => p.stage === "Ready").length;
  const behind = pieces.filter(isLate).length;

  return (
    <div className={styles.edStats}>
      <div className={styles.stat}>
        <b>
          <em>{pieces.length}</em>
        </b>
        <span>{t("magazine:editor.stats.piecesInFlight")}</span>
      </div>
      <div className={styles.stat}>
        <b>
          <em>{ready}</em>
        </b>
        <span>{t("magazine:editor.stats.readyToLayOut")}</span>
      </div>
      <div className={styles.stat}>
        <b>{behind}</b>
        <span>{t("magazine:editor.stats.behindSchedule")}</span>
      </div>
      <div className={styles.stat}>
        <b>
          <em>{pitchesInInbox}</em>
        </b>
        <span>{t("magazine:editor.stats.pitchesInInbox")}</span>
      </div>
    </div>
  );
}
