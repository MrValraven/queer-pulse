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
  const ready = pieces.filter((p) => p.stage === "Ready").length;
  const behind = pieces.filter(isLate).length;

  return (
    <div className={styles.edStats}>
      <div className={styles.stat}>
        <b>
          <em>{pieces.length}</em>
        </b>
        <span>Pieces in flight</span>
      </div>
      <div className={styles.stat}>
        <b>
          <em>{ready}</em>
        </b>
        <span>Ready to lay out</span>
      </div>
      <div className={styles.stat}>
        <b>{behind}</b>
        <span>Behind schedule</span>
      </div>
      <div className={styles.stat}>
        <b>
          <em>{pitchesInInbox}</em>
        </b>
        <span>Pitches in inbox</span>
      </div>
    </div>
  );
}
