import { Button } from "../../shared/components/ui";
import { EditorPieceRow, type PieceRowHandlers } from "./EditorPieceRow";
import {
  SORT_LABEL,
  type Piece,
  type Editor,
  type SortKey,
} from "./editorDashboard.data";
import styles from "./EditorDashboardPage.module.css";

/** The "Pieces · in flight" section: header, sortable count, rows, empty state. */
export function EditorPiecesTable({
  pieces,
  me,
  sort,
  focusedId,
  handlers,
  onReset,
}: {
  pieces: Piece[];
  me: Editor;
  sort: SortKey;
  focusedId: string | null;
  handlers: PieceRowHandlers;
  onReset: () => void;
}) {
  return (
    <section className={styles.sec}>
      <h2 className={styles.secH2}>
        <span>
          Pieces · <em>in flight</em>
        </span>
        <span className={styles.ct}>
          {pieces.length} · {SORT_LABEL[sort]}
        </span>
      </h2>
      <div className={styles.pieces}>
        {pieces.length > 0 && (
          <div className={styles.pieceHead}>
            <span>Piece · editor · art</span>
            <span>Stage</span>
            <span>Due</span>
            <span />
          </div>
        )}
        {pieces.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyMark} />
            <b>No pieces match</b>
            <span>Try clearing the search or filters.</span>
            <Button variant="ghost" onClick={onReset}>
              Clear filters
            </Button>
          </div>
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
