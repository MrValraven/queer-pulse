import { FiClock, FiGlobe } from "react-icons/fi";
import { Select } from "../../../shared/components/ui";
import { viewStageLabelKey } from "./stageLabels";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { Piece, Stage } from "../data/desk.data";
import { hasPublishDate, isPieceScheduled } from "./pieceSchedule";
import styles from "./PiecesBoard.module.css";

export interface PiecesBoardStagePickerProps {
  piece: Piece;
  stages: Stage[];
  onMove: (piece: Piece, stage: Stage) => void;
  /** The card title's id: `Select`'s trigger takes it as its own description,
   *  the same `aria-describedby` pattern `PieceRowNextAction.tsx` uses, so a
   *  screen reader hears "Move stage" followed by this card's own piece
   *  title, naming which card each identical trigger belongs to. */
  titleId: string;
}

/** Short day and month plus an unpadded hour: it has to fit a card about
 *  200px wide. */
const GOES_LIVE_FORMAT: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "short",
  hour: "numeric",
  minute: "2-digit",
};

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
 * - A Published piece shows a static status line in the picker's slot. A
 *   plain stage update leaves the article live (it skips the `publishedAt`
 *   clearing that Unpublish does), so moving it back belongs to the piece
 *   record's Unpublish.
 * - A piece with a publish date (`hasPublishDate`) gets the same line,
 *   whatever its stage. A scheduled one waits at Ready for its date ("Goes
 *   live {date}"); a live one (date passed, stage not yet Published) is
 *   public already, and its writer has not heard (PRD-437): "Live since
 *   {date}. Publish it to tell the writer."
 * The line is plain text, so sighted readers see it and screen readers reach
 * it in reading order. The way out (unschedule or unpublish on the piece
 * record) is part of that same paragraph, visually hidden: a static <p> is
 * no control, so an `aria-describedby` on it would never be announced.
 * Dragging follows the same rule (`canDropOnStage` in `useBoardDrag.ts`).
 */
export function PiecesBoardStagePicker({
  piece,
  stages,
  onMove,
  titleId,
}: PiecesBoardStagePickerProps) {
  const { t } = useTranslation();
  const format = useFormat();
  const isLocked = piece.stage === "Published" || hasPublishDate(piece);

  if (isLocked) {
    const isScheduled = isPieceScheduled(piece);
    const StatusIcon = isScheduled ? FiClock : FiGlobe;
    const publishedAtDate = piece.publishedAt
      ? format.date(new Date(piece.publishedAt), GOES_LIVE_FORMAT)
      : null;
    const statusText =
      isScheduled && publishedAtDate
        ? t("magazine:desk.board.goesLive", { date: publishedAtDate })
        : piece.stage !== "Published" && publishedAtDate
          ? t("magazine:desk.goLive.liveSinceTellWriter", {
              date: publishedAtDate,
            })
          : t("magazine:desk.board.liveOnSite");
    return (
      <p className={styles.stageLocked}>
        <StatusIcon aria-hidden="true" className={styles.stageLockedIcon} />
        <span>{statusText}</span>
        <span className="visuallyHidden">
          {" "}
          {t(
            isScheduled
              ? "magazine:desk.board.unscheduleToMove"
              : "magazine:desk.board.unpublishToMove",
          )}
        </span>
      </p>
    );
  }

  return (
    <div className={styles.stagePicker}>
      <Select
        size="sm"
        value={piece.stage}
        label={t("magazine:desk.board.moveStageAria")}
        aria-describedby={titleId}
        onChange={(value) => {
          if (value) onMove(piece, value as Stage);
        }}
        options={stages
          .filter((option) => option !== "Published")
          .map((option) => ({
            value: option,
            label: t(viewStageLabelKey(option)),
          }))}
      />
    </div>
  );
}
