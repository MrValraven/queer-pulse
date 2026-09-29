import { Button, Modal } from "../../../shared/components/ui";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { Piece } from "../data/desk.data";
import { firstName } from "../data/desk.copy";
import { buildChaseDraft } from "./chaseDraft";
import { PieceThread } from "./PieceThread";
import styles from "./DeskModals.module.css";

interface ChaseModalProps {
  piece: Piece;
  /** Where this chase sits in the bulk bar's queue; unset for a single chase. */
  progress?: { current: number; total: number };
  /** Moves on to the next writer in the queue without writing to this one. */
  onSkip?: () => void;
  onClose: () => void;
}

/**
 * Chase-a-writer nudge, now backed by the real per-piece thread (Phase 7
 * Wave F): the editor reads the existing conversation and posts the chase
 * straight into it via `PieceThread`'s own composer. Posting notifies the
 * writer server-side (see the Wave F backend report). There's no separate
 * "send" step anymore; sending a message here IS the chase.
 *
 * The composer opens with a short, editable draft in the editor's own voice
 * (`chaseDraft.ts`), built from the piece: due soon, late, or no date known
 * yet. `DeskModals` keys this component by piece id, so each queued piece
 * remounts it and starts with its own fresh draft.
 *
 * From the bulk bar the same dialog walks a queue, one writer at a time:
 * the eyebrow says "Chase 2 of 3", Skip moves on to the next writer, and
 * closing (X, Escape) ends the queue. The progress is also inside the title,
 * visually hidden, because the dialog is named by its title alone.
 */
export function ChaseModal({
  piece,
  progress,
  onSkip,
  onClose,
}: ChaseModalProps) {
  const { t, language } = useTranslation();
  const format = useFormat();
  const initialDraft = buildChaseDraft(piece, new Date(), t, language);
  const progressText = progress
    ? t("magazine:desk.bulk.chaseProgress", {
        current: format.number(progress.current),
        total: format.number(progress.total),
      })
    : null;
  return (
    <Modal
      eyebrow={
        progressText ? <span aria-hidden="true">{progressText}</span> : null
      }
      title={
        <>
          {t("magazine:desk.modals.chase.title", {
            name: firstName(piece.byline),
          })}
          {progressText && (
            <span className="visuallyHidden">. {progressText}</span>
          )}
        </>
      }
      onClose={onClose}
      footer={
        onSkip ? (
          <div className={styles.actions}>
            <Button variant="ghost" onClick={onSkip}>
              {t("magazine:desk.bulk.chaseSkip")}
            </Button>
          </div>
        ) : undefined
      }
    >
      <p className={styles.body}>{t("magazine:desk.modals.chase.body")}</p>
      <PieceThread
        pieceId={piece.id}
        side="editor"
        initialDraft={initialDraft}
      />
    </Modal>
  );
}
