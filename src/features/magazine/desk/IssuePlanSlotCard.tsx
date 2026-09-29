import { formattedCountValues } from "./deskHeaderCopy";
import { FormatIcon } from "./FormatBadge";
import { StageProgress } from "./StageProgress";
import { describeDue } from "./deskDue";
import { cx } from "../../../shared/lib/cx";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { Piece } from "../data/desk.data";
import styles from "./IssuePlan.module.css";

export interface IssuePlanSlotCardProps {
  piece: Piece;
  /** The day "due" is counted from, read once per plan render. */
  today: Date;
  onOpen: (piece: Piece) => void;
}

/**
 * One filled slot in the issue plan: serif title, byline and size, how far
 * the piece has come (`StageProgress`, with the stage named), and when it is
 * due. `FormatIcon` marks a slide deck the same quiet way the table row
 * does; an article, the plan's default, carries no mark at all (this
 * dropped the "ARTICLE" badge every card used to carry). A late piece gets
 * the late edge and a late due line; the rest of the plan stays quiet.
 *
 * The title is the card's real keyboard and screen-reader target, a
 * `<button>` like the board card's own title (`PiecesBoardCard.tsx`); the
 * outer element stays plain, a mouse convenience only (a click anywhere on
 * the card opens it too). The previous version wrapped the whole card in
 * `role="button"`, which buried the
 * `<h3>` title and the format mark as presentational children of one giant
 * button, so a screen reader announced the whole card as its name and lost
 * the heading entirely. `<h3>` because the layout's own hidden `<h2>`
 * (`IssuePlan.tsx`) sits directly above, with no section-level heading in
 * between.
 */
export function IssuePlanSlotCard({
  piece,
  today,
  onOpen,
}: IssuePlanSlotCardProps) {
  const { t } = useTranslation();
  const format = useFormat();
  const due = describeDue(piece, today);
  const dueText =
    due.kind === "relative" && due.labelKey
      ? t(due.labelKey, due.values)
      : due.kind === "raw"
        ? due.text
        : null;
  const size =
    piece.format === "deck"
      ? t(
          "magazine:desk.issuePlan.slidesCount",
          formattedCountValues(piece.slides ?? 0, format.number),
        )
      : t(
          "magazine:format.words",
          formattedCountValues(piece.words ?? 0, format.number),
        );
  // Only the parts that exist, so an unassigned byline leaves no stray dot.
  const meta = [piece.byline, size].filter(Boolean).join(" · ");

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions -- the title <button> below is the card's keyboard path for opening; this onClick only widens the mouse target to the whole card.
    <div
      className={cx(styles.slot, due.isLate && styles.slotLate)}
      onClick={() => onOpen(piece)}
    >
      <FormatIcon format={piece.format} />
      <h3 className={styles.slotTitle}>
        <button
          type="button"
          className={styles.titleButton}
          onClick={(event) => {
            event.stopPropagation();
            onOpen(piece);
          }}
        >
          {piece.title}
        </button>
      </h3>
      <span className={styles.tiny}>{meta}</span>
      <div className={styles.slotFoot}>
        <StageProgress stage={piece.stage} variant="bar" size="sm" showLabel />
        {dueText && (
          <span className={cx(styles.due, due.isLate && styles.dueLate)}>
            {dueText}
          </span>
        )}
      </div>
    </div>
  );
}
