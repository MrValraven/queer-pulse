import { Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { EditorPieceRow, type PieceRowHandlers } from "./EditorPieceRow";
import {
  SORT_LABEL_KEY,
  type Piece,
  type Editor,
  type SortKey,
} from "./editorDashboard.data";
import styles from "./EditorDashboardPage.module.css";

/** The "Pieces · in flight" section: header, sortable count, rows, empty state. */
export function EditorPiecesTable({
  pieces,
  totalPieces,
  me,
  sort,
  focusedId,
  handlers,
  onReset,
}: {
  pieces: Piece[];
  /** Unfiltered pipeline size — distinguishes "nothing in flight" from "no matches". */
  totalPieces: number;
  me: Editor;
  sort: SortKey;
  focusedId: string | null;
  handlers: PieceRowHandlers;
  onReset: () => void;
}) {
  const { t } = useTranslation();
  return (
    <section className={styles.sec}>
      <h2 className={styles.secH2}>
        <span>
          <Translation
            i18nKey="magazine:editor.piecesTable.heading"
            components={{ em: <em /> }}
          />
        </span>
        <span className={styles.ct}>
          {t("magazine:editor.piecesTable.countLabel", {
            count: pieces.length,
            sort: t(SORT_LABEL_KEY[sort]),
          })}
        </span>
      </h2>
      <div className={styles.pieces}>
        {pieces.length > 0 && (
          <div className={styles.pieceHead}>
            <span>{t("magazine:editor.piecesTable.columnPieceEditorArt")}</span>
            <span>{t("magazine:editor.piecesTable.columnStage")}</span>
            <span>{t("magazine:editor.piecesTable.columnDue")}</span>
            <span />
          </div>
        )}
        {pieces.length === 0 ? (
          totalPieces === 0 ? (
            <div className={styles.empty}>
              <div className={styles.emptyMark} />
              <b>{t("magazine:editor.piecesTable.emptyNoneTitle")}</b>
              <span>{t("magazine:editor.piecesTable.emptyNoneBody")}</span>
            </div>
          ) : (
            <div className={styles.empty}>
              <div className={styles.emptyMark} />
              <b>{t("magazine:editor.piecesTable.emptyFilteredTitle")}</b>
              <span>{t("magazine:editor.piecesTable.emptyFilteredBody")}</span>
              <Button variant="ghost" onClick={onReset}>
                {t("magazine:editor.piecesTable.clearFiltersCta")}
              </Button>
            </div>
          )
        ) : (
          pieces.map((p) => (
            <EditorPieceRow
              key={p.id}
              piece={p}
              me={me}
              focused={focusedId === p.id}
              handlers={handlers}
            />
          ))
        )}
      </div>
    </section>
  );
}
