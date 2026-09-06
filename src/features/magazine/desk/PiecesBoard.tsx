import type { KeyboardEvent, MouseEvent } from "react";
import { Avatar, Select } from "../../../shared/components/ui";
import { FormatBadge } from "./FormatBadge";
import { viewStageLabelKey } from "./stageLabels";
import { initialsFromName } from "../../../shared/lib/initials";
import { cx } from "../../../shared/lib/cx";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { Piece, Stage } from "../data/desk.data";
import styles from "./PiecesBoard.module.css";

export interface PiecesBoardProps {
  pieces: Piece[];
  stages: Stage[];
  onOpen: (piece: Piece) => void;
  onMove: (piece: Piece, stage: Stage) => void;
}

function stopSelectRowClick(event: MouseEvent<HTMLDivElement>) {
  event.stopPropagation();
}

/**
 * The desk's "board" layout: one horizontally-scrolling column per pipeline
 * stage, holding the pieces currently at that stage. Each card carries a
 * stage `<select>` so an editor can move a piece without opening it. Ported
 * from the design's `Board`/`.board` (`mag-desk.jsx`).
 */
export function PiecesBoard({
  pieces,
  stages,
  onOpen,
  onMove,
}: PiecesBoardProps) {
  const { t } = useTranslation();
  return (
    <div className={styles.board}>
      {stages.map((stage) => {
        const columnPieces = pieces.filter((piece) => piece.stage === stage);
        return (
          <div key={stage} className={styles.bcol}>
            <h3 className={styles.colHead}>
              {/* A `Stage` IS its own English label, so the column heading and
                  the per-card picker below both resolve it through the shared
                  stage-key lookup. */}
              {t(viewStageLabelKey(stage))}
              <b className={styles.colCount}>{columnPieces.length}</b>
            </h3>
            {columnPieces.map((piece) => {
              function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
                if (event.key === "Enter") onOpen(piece);
              }
              return (
                <div
                  key={piece.id}
                  className={cx(styles.bcard, piece.late && styles.cardLate)}
                  role="button"
                  tabIndex={0}
                  onClick={() => onOpen(piece)}
                  onKeyDown={handleKeyDown}
                >
                  <FormatBadge format={piece.format} />
                  <h4 className={styles.cardTitle}>{piece.title}</h4>
                  <div className={styles.cardFoot}>
                    <Avatar
                      initials={initialsFromName(piece.byline)}
                      tint={piece.format === "deck" ? "plum" : "coral"}
                      size={24}
                      name={piece.byline}
                    />
                    <span>{piece.byline.split(" ")[0]}</span>
                    <span
                      className={cx(styles.cardDue, piece.late && styles.late)}
                    >
                      {piece.due === "ready" ? "—" : piece.due}
                    </span>
                  </div>
                  {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions -- onClick only stops the stage <select>'s clicks from bubbling to the card's open handler; this wrapper is not an interactive control and the <select> owns its own focus/keys. */}
                  <div
                    className={styles.selectRow}
                    onClick={stopSelectRowClick}
                  >
                    <Select
                      size="sm"
                      value={piece.stage}
                      label={t("magazine:desk.board.moveStageAria")}
                      onChange={(value) => onMove(piece, value as Stage)}
                      // "Published" is never a CHOOSABLE option here. A piece
                      // becomes published as a side effect of a real publish
                      // (the piece record's Publish action, the article
                      // editor's rail, or a ship), each of which first clears
                      // the consent and sensitivity gate. `PATCH
                      // /magazine/admin/pieces/:id` therefore refuses
                      // `stage: 'published'` outright (see the comment on
                      // `PIECE_STAGES` in the backend's `update-piece.dto.ts`),
                      // so offering it would only hand the editor a 400 and
                      // imply the gate can be stepped around with a dropdown.
                      //
                      // It IS kept, disabled, for a piece already at that
                      // stage: dropping it outright left such a card's picker
                      // showing the "Select…" placeholder, which reads as
                      // "no stage" for the one piece whose stage matters most.
                      options={stages
                        .filter(
                          (option) =>
                            option !== "Published" ||
                            piece.stage === "Published",
                        )
                        .map((option) => ({
                          value: option,
                          label: t(viewStageLabelKey(option)),
                          disabled: option === "Published",
                        }))}
                    />
                  </div>
                </div>
              );
            })}
            {columnPieces.length === 0 && (
              <span className={styles.emptyCol}>
                {t("magazine:desk.board.columnEmpty")}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
