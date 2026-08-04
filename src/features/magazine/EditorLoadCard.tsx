import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  editorLoad,
  loadGap,
  type Piece,
  type Editor,
} from "./editorDashboard.data";
import { cx } from "../../shared/lib/cx";
import { editorDot } from "./editorStatus";
import { SideCard } from "./SideCard";
import styles from "./EditorDashboardPage.module.css";

/** Words-per-editor workload with a rebalancing hint. */
export function EditorLoadCard({
  pieces,
  me,
}: {
  pieces: Piece[];
  me: Editor;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const rows = editorLoad(pieces, me);
  const maxWords = Math.max(1, ...rows.map((row) => row.words));
  const gap = loadGap(pieces);
  const hint =
    gap > 0
      ? t("magazine:editor.sideCards.loadHintOtherMore", {
          editor: "Sara",
          amount: fmt.number(gap),
        })
      : gap < 0
        ? t("magazine:editor.sideCards.loadHintOtherMore", {
            editor: "Marta",
            amount: fmt.number(-gap),
          })
        : t("magazine:editor.sideCards.loadHintBalanced");

  return (
    <SideCard title={t("magazine:editor.sideCards.editorLoadHeading")}>
      {rows.map((row) => (
        <div
          key={row.editor}
          className={cx(styles.loadRow, row.mine && styles.me)}
        >
          <div className={styles.loadTop}>
            <b>
              <span className={cx(styles.chipDot, editorDot(row.editor))} />
              {row.editor}
              {row.mine && ` · ${t("magazine:editor.sideCards.you")}`}
            </b>
            <span>
              {t("magazine:editor.sideCards.piecesWords", {
                count: row.count,
                words: fmt.number(row.words),
              })}
              {row.late > 0 && (
                <em className={styles.ll}>
                  {" "}
                  ·{" "}
                  {t("magazine:editor.sideCards.lateCount", {
                    count: row.late,
                  })}
                </em>
              )}
            </span>
          </div>
          <div className={styles.bar}>
            <span style={{ width: `${(row.words / maxWords) * 100}%` }} />
          </div>
        </div>
      ))}
      <div className={styles.loadHint}>{hint}</div>
    </SideCard>
  );
}
