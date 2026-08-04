import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  WORD_TARGET,
  CURRENT_ISSUE,
  issueProgress,
  type Piece,
} from "./editorDashboard.data";
import { SideCard } from "./SideCard";
import styles from "./EditorDashboardPage.module.css";

/** Issue N progress: pieces ready, word count, time to close. */
export function ProgressCard({ pieces }: { pieces: Piece[] }) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const progress = issueProgress(pieces);
  return (
    <SideCard
      title={t("magazine:editor.sideCards.progressHeading", {
        number: CURRENT_ISSUE.number,
      })}
    >
      <div className={styles.issueBar}>
        <div className={styles.issueBarRow}>
          <span>{t("magazine:editor.sideCards.piecesReady")}</span>
          <b>
            {progress.ready} / {progress.total}
          </b>
        </div>
        <div className={styles.bar}>
          <span style={{ width: `${progress.readyPct}%` }} />
        </div>
        <div className={styles.issueBarRow} style={{ marginTop: 8 }}>
          <span>{t("magazine:editor.sideCards.wordCount")}</span>
          <b>
            {fmt.number(progress.words)} / {fmt.number(WORD_TARGET)}
          </b>
        </div>
        <div className={styles.bar}>
          <span style={{ width: `${progress.wordPct}%` }} />
        </div>
        <div className={styles.issueBarRow} style={{ marginTop: 8 }}>
          <span>{t("magazine:editor.sideCards.timeToClose")}</span>
          <b>{t("magazine:editor.sideCards.daysLeft", { count: 11 })}</b>
        </div>
        <div className={styles.bar}>
          <span style={{ width: "64%" }} />
        </div>
      </div>
    </SideCard>
  );
}
