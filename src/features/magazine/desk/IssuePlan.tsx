import type { KeyboardEvent } from "react";
import { FiPlus } from "react-icons/fi";
import { FormatBadge } from "./FormatBadge";
import { cx } from "../../../shared/lib/cx";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { Piece, Section, Stage } from "../data/desk.data";
import styles from "./IssuePlan.module.css";

export interface IssuePlanProps {
  pieces: Piece[];
  sections: Section[];
  stages: Stage[];
  onOpen: (piece: Piece) => void;
  onCommission: (sectionName: string) => void;
}

/**
 * The desk's "issue plan" layout: one row per magazine section, showing how
 * many of its target slots are filled, a slot card per commissioned piece
 * (with a stage-progress bar), and a dashed "Commission for {section}" slot
 * per remaining gap. Ported from the design's `IssuePlan`/`.plan`
 * (`mag-desk.jsx`).
 */
export function IssuePlan({
  pieces,
  sections,
  stages,
  onOpen,
  onCommission,
}: IssuePlanProps) {
  const { t } = useTranslation();
  return (
    <div className={styles.plan}>
      {sections.map((section) => {
        const filledPieces = pieces.filter(
          (piece) => piece.section === section.name,
        );
        const gaps = Math.max(0, section.target - filledPieces.length);

        return (
          <div key={section.name} className={styles.row}>
            <div className={styles.label}>
              <b className={styles.labelName}>{section.name}</b>
              <span className={styles.tiny}>
                {t("magazine:desk.issuePlan.slotsFilled", {
                  filled: filledPieces.length,
                  target: section.target,
                  note: section.note,
                })}
              </span>
              {gaps > 0 ? (
                <span className={styles.tagGap}>
                  {t("magazine:desk.issuePlan.slotsOpen", { count: gaps })}
                </span>
              ) : (
                <span className={styles.tagFull}>
                  {t("magazine:desk.issuePlan.full")}
                </span>
              )}
            </div>
            <div className={styles.slots}>
              {filledPieces.map((piece) => (
                <SlotCard key={piece.id} piece={piece} stages={stages} onOpen={onOpen} />
              ))}
              {Array.from({ length: gaps }).map((_, gapIndex) => (
                <button
                  key={`${section.name}-gap-${gapIndex}`}
                  type="button"
                  className={styles.slotEmpty}
                  onClick={() => onCommission(section.name)}
                >
                  <FiPlus aria-hidden />
                  <span className={styles.slotEmptyLabel}>
                    {t("magazine:desk.issuePlan.commissionFor", {
                      section: section.name,
                    })}
                  </span>
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** One filled slot card: format, title, byline + size, and a stage-progress bar. */
function SlotCard({
  piece,
  stages,
  onOpen,
}: {
  piece: Piece;
  stages: Stage[];
  onOpen: (piece: Piece) => void;
}) {
  const { t } = useTranslation();
  const stageIndex = stages.indexOf(piece.stage);
  const progress =
    stages.length > 0 ? ((stageIndex + 1) / stages.length) * 100 : 0;

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Enter") onOpen(piece);
  }

  return (
    <div
      className={styles.slot}
      role="button"
      tabIndex={0}
      onClick={() => onOpen(piece)}
      onKeyDown={handleKeyDown}
    >
      <FormatBadge format={piece.format} />
      <h4 className={styles.slotTitle}>{piece.title}</h4>
      <span className={styles.tiny}>
        {piece.byline} ·{" "}
        {piece.format === "deck"
          ? t("magazine:desk.issuePlan.slidesCount", { count: piece.slides ?? 0 })
          : t("magazine:format.words", { count: piece.words ?? 0 })}
      </span>
      <div className={styles.bar}>
        <div
          className={cx(styles.barFill, piece.late && styles.barFillLate)}
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className={styles.tiny}>
        {piece.stage}
        {piece.late ? t("magazine:desk.issuePlan.lateSuffix") : ""}
      </span>
    </div>
  );
}
