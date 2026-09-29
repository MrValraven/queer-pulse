import { DeskToneDot } from "./DeskToneDot";
import { FormatIcon } from "./FormatBadge";
import { PieceRowStageAge } from "./PieceRowStageAge";
import { StageProgress } from "./StageProgress";
import { describeWaitingOn, waitingOnLabel } from "./deskWaitingOn";
import { stageColorVar } from "./deskTones";
import { viewStageLabelKey } from "./stageLabels";
import { cx } from "../../../shared/lib/cx";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { Editor, Piece } from "../data/desk.data";
import styles from "./PieceRow.module.css";

// The due cell lives in its own file; `PieceRow` imports every cell here.
export { PieceRowDue, type PieceRowDueProps } from "./PieceRowDue";

/**
 * The stage cell: progress dots plus the stage name, and under them how long
 * the piece has sat there. The name shows at every width above the phone
 * card (beside the dots, or under them in the middle step); the dots'
 * `role="img"` already says the stage aloud, so the name is hidden from
 * screen readers.
 */
export function PieceRowStage({
  piece,
  today,
}: {
  piece: Piece;
  today?: Date;
}) {
  const { t } = useTranslation();
  const stageName = t(viewStageLabelKey(piece.stage));
  return (
    <div className={styles.stageCell}>
      <div className={styles.stageCellTop}>
        <StageProgress stage={piece.stage} size="sm" />
        {/* `title` shows the full name when a long one trims. */}
        <span
          aria-hidden="true"
          className={styles.stageLabel}
          style={{ color: stageColorVar(piece.stage) }}
          title={stageName}
        >
          {stageName}
        </span>
      </div>
      <PieceRowStageAge
        piece={piece}
        today={today}
        className={styles.stageAgeWide}
      />
    </div>
  );
}

export interface PieceRowWaitProps {
  piece: Piece;
  /** The viewing editor's id: "You" is only ever their own piece. */
  me: string;
  /** The editor directory, to name another editor's piece. */
  editors: readonly Editor[];
}

/** Who holds the piece: a tone dot and a word (`describeWaitingOn`). Rows
 *  carry no headers, so screen readers get one whole sentence in place of
 *  the word ("Waiting on Sara", "Waiting on you"), which each language can
 *  phrase in its own grammar. */
export function PieceRowWait({ piece, me, editors }: PieceRowWaitProps) {
  const { t } = useTranslation();
  const wait = describeWaitingOn(piece, me, editors);
  const label = waitingOnLabel(wait, t);
  const spokenLabel =
    wait.tone === "you"
      ? t("magazine:desk.pieceRow.waitingOnYouAria")
      : t("magazine:desk.pieceRow.waitingOnAria", { who: label });
  return (
    <div className={styles.waitCell} data-tone={wait.tone}>
      <DeskToneDot tone={wait.tone} />
      <span className="visuallyHidden">{spokenLabel}</span>
      <span aria-hidden="true" className={styles.waitText}>
        {label}
      </span>
    </div>
  );
}

/**
 * The line under a row's title: a deck mark (articles are the default and
 * carry none), section and byline. The dot joins only the parts that have
 * text, so a piece with no section never starts with a stray separator. A
 * piece nobody writes yet says so, in a quieter voice, so the gap reads as a
 * fact about the piece. Wherever the stage cell has no room for "time in
 * stage" (the middle step, compact density, the stacked phone row) it lands
 * here instead (`PieceRow.module.css`).
 */
export function PieceRowMeta({ piece, today }: { piece: Piece; today?: Date }) {
  const { t } = useTranslation();
  const section = piece.section.trim();
  const byline = piece.byline.trim();

  return (
    <div className={styles.meta}>
      <FormatIcon format={piece.format} />
      {section && <span className={styles.metaText}>{section}</span>}
      {section && (
        <span aria-hidden="true" className={styles.metaSeparator}>
          ·
        </span>
      )}
      {byline ? (
        <span className={styles.metaText}>{byline}</span>
      ) : (
        <span className={cx(styles.metaText, styles.noWriter)}>
          {t("magazine:desk.pieceRow.noWriter")}
        </span>
      )}
      {piece.fresh && (
        <span className={styles.tagNew}>
          {t("magazine:desk.pieceRow.newVoice")}
        </span>
      )}
      <PieceRowStageAge
        piece={piece}
        today={today}
        className={styles.stageAgeMeta}
      />
    </div>
  );
}
