import { useId } from "react";
import { Select } from "../../../shared/components/ui";
import { viewStageLabelKey } from "./stageLabels";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { Piece, Stage } from "../data/desk.data";
import styles from "./PiecesBoard.module.css";

export interface PiecesBoardStagePickerProps {
  piece: Piece;
  stages: Stage[];
  onMove: (piece: Piece, stage: Stage) => void;
  /** The card title's id: `Select`'s trigger takes it as its own description
   *  (with the Published lock reason added, once it applies), the same
   *  `aria-describedby` pattern `PieceRowNextAction.tsx` uses, so a screen
   *  reader hears "Move stage" (or the locked reason) followed by this
   *  card's own piece title, naming which card each identical trigger
   *  belongs to. */
  titleId: string;
}

/**
 * The card's stage picker: the keyboard and screen-reader path for the same
 * move a drag makes, styled quietly at the card's foot.
 *
 * Published moves only through a real publish or unpublish, both ways:
 * - "Published" is never a CHOOSABLE option. A piece becomes published as a
 *   side effect of a real publish (the piece record's Publish action, the
 *   article editor's rail, or a ship), each of which first clears the consent
 *   and sensitivity gate. `PATCH /magazine/admin/pieces/:id` refuses
 *   `stage: 'published'` outright (see `PIECE_STAGES` in the backend's
 *   `update-piece.dto.ts`), so offering it would only hand the editor a 400.
 * - A Published piece gets the whole picker disabled. A plain stage update
 *   leaves the article live (it skips the `publishedAt` clearing that
 *   Unpublish does), so moving it back belongs to the piece record's
 *   Unpublish. A visually hidden line says so to screen readers.
 * The Published option IS kept, disabled, for a piece already there, so its
 * picker shows "Published" in place of the empty "Select…" placeholder.
 * Dragging follows the same rule (`canDropOnStage` in `useBoardDrag.ts`).
 */
export function PiecesBoardStagePicker({
  piece,
  stages,
  onMove,
  titleId,
}: PiecesBoardStagePickerProps) {
  const { t } = useTranslation();
  const lockedReasonId = useId();
  const isPublished = piece.stage === "Published";
  const describedBy = isPublished ? `${lockedReasonId} ${titleId}` : titleId;

  return (
    <div className={styles.stagePicker}>
      <Select
        size="sm"
        value={piece.stage}
        label={t("magazine:desk.board.moveStageAria")}
        disabled={isPublished}
        aria-describedby={describedBy}
        onChange={(value) => {
          if (value) onMove(piece, value as Stage);
        }}
        options={stages
          .filter((option) => option !== "Published" || isPublished)
          .map((option) => ({
            value: option,
            label: t(viewStageLabelKey(option)),
            disabled: option === "Published",
          }))}
      />
      {isPublished && (
        <span id={lockedReasonId} className="visuallyHidden">
          {t("magazine:desk.board.unpublishToMove")}
        </span>
      )}
    </div>
  );
}
