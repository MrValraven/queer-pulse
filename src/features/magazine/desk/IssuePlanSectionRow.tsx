import { FiPlus } from "react-icons/fi";
import { IssuePlanSlotCard } from "./IssuePlanSlotCard";
import { formattedCountValues } from "./deskHeaderCopy";
import { cx } from "../../../shared/lib/cx";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { Piece, Section } from "../data/desk.data";
import styles from "./IssuePlan.module.css";

export interface IssuePlanSectionRowProps {
  section: Section;
  /** The pieces the desk shows under this section (filters applied), in
   *  the order the desk sorted them. */
  sectionPieces: Piece[];
  /** Pieces filed under this section across the whole issue, filters aside
   *  (`issueSectionSlots`). */
  filled: number;
  /** Target slots still empty (never negative), filters aside. */
  gaps: number;
  /** Draw a "Commission for {section}" slot per gap. Off for unfiled work,
   *  where a commission would land in no issue. */
  shouldShowGaps: boolean;
  today: Date;
  onOpen: (piece: Piece) => void;
  onCommission: (sectionName: string) => void;
}

/**
 * One section of the issue plan: its name, a compact filled-of-target bar,
 * the "slots open" or "Full" tag, then a card per filed piece and a dashed
 * commission slot per gap. The bar is decorative: the "{filled} of {target}"
 * line beside it says the same in words. The count and the gaps describe the
 * whole issue; the cards follow the desk's filters.
 */
export function IssuePlanSectionRow({
  section,
  sectionPieces,
  filled,
  gaps,
  shouldShowGaps,
  today,
  onOpen,
  onCommission,
}: IssuePlanSectionRowProps) {
  const { t } = useTranslation();
  const format = useFormat();
  const filledRatio =
    section.target > 0 ? Math.min(1, filled / section.target) : 1;

  return (
    <div className={styles.row}>
      <div className={styles.label}>
        <b className={styles.labelName}>{section.name}</b>
        <span className={styles.meter} aria-hidden="true">
          <span
            className={cx(styles.meterFill, gaps === 0 && styles.meterFull)}
            style={{ width: `${filledRatio * 100}%` }}
          />
        </span>
        <span className={styles.tiny}>
          {t("magazine:desk.issuePlan.slotsFilled", {
            filled: format.number(filled),
            target: format.number(section.target),
            note: section.note,
          })}
        </span>
        {gaps > 0 ? (
          <span className={styles.tagGap}>
            {t(
              "magazine:desk.issuePlan.slotsOpen",
              formattedCountValues(gaps, format.number),
            )}
          </span>
        ) : (
          <span className={styles.tagFull}>
            {t("magazine:desk.issuePlan.full")}
          </span>
        )}
      </div>
      <div className={styles.slots}>
        {sectionPieces.map((piece) => (
          <IssuePlanSlotCard
            key={piece.id}
            piece={piece}
            today={today}
            onOpen={onOpen}
          />
        ))}
        {shouldShowGaps &&
          Array.from({ length: gaps }).map((_unused, gapIndex) => (
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
}
