import { useId, useState } from "react";
import { FiChevronDown } from "react-icons/fi";
import { useFormat } from "../../../../shared/i18n/format";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { formattedCountValues } from "../deskHeaderCopy";
import { slotsToList, type SectionSlots } from "./issueHealth";
import { RailToggle } from "./RailToggle";
import styles from "./rail.module.css";

export interface IssueSlotsProps {
  /** Filled against target per section, in the issue's section order. */
  slots: SectionSlots[];
  /** The table's section filter; its sections show as pressed. */
  sectionFilter?: string[];
  /** When given, each slot row is a toggle that filters the table. */
  onSectionFilter?: (sectionName: string) => void;
}

/**
 * The issue's slots, compact: how many sections are full, then one line per
 * section that still has the most open slots (name, a short meter, "1 of 2").
 * Full sections are the calm case, so they wait folded away and the rail
 * stays short enough for Pitches to show on the first screen. The "6
 * sections full" count is the toggle that shows every section, so the number
 * opens what it counts. Only when no full section is folded (none exist, or
 * every one is a pressed filter already listed) does "Show all sections"
 * under the list take that job, and the count stays text.
 */
export function IssueSlots({
  slots,
  sectionFilter,
  onSectionFilter,
}: IssueSlotsProps) {
  const { t } = useTranslation();
  const format = useFormat();
  const [isShowingAll, setIsShowingAll] = useState(false);
  const listId = useId();
  if (slots.length === 0) return null;

  const collapsedSlots = slotsToList(slots, sectionFilter);
  const listedSlots = isShowingAll ? slots : collapsedSlots;
  const hiddenSlots = slots.filter((slot) => !collapsedSlots.includes(slot));
  const fullCount = slots.filter((slot) => slot.gaps === 0).length;
  const isSummaryDisclosure = hiddenSlots.some((slot) => slot.gaps === 0);
  const fullSummary = t(
    "magazine:desk.issuePlan.summary.full",
    formattedCountValues(fullCount, format.number),
  );
  const disclosureProps = {
    "aria-expanded": isShowingAll,
    "aria-controls": listId,
    onClick: () => setIsShowingAll((wasShowingAll) => !wasShowingAll),
  };

  return (
    <div className={styles.subBlock}>
      <div className={styles.subHead}>
        <h3 className={styles.subTitle}>
          {t("magazine:desk.rail.health.slots")}
        </h3>
        {isSummaryDisclosure ? (
          <button
            type="button"
            className={styles.subSummaryButton}
            {...disclosureProps}
          >
            {fullSummary}
            <FiChevronDown
              aria-hidden="true"
              className={styles.disclosureIcon}
            />
          </button>
        ) : (
          <span className={styles.subSummary} data-zero={fullCount === 0}>
            {fullSummary}
          </span>
        )}
      </div>
      <div id={listId}>
        {listedSlots.length > 0 ? (
          <ul className={styles.slotList}>
            {listedSlots.map((slot) => (
              <li key={slot.name}>
                <RailToggle
                  className={styles.slotRow}
                  isPressed={sectionFilter?.includes(slot.name) ?? false}
                  onToggle={
                    onSectionFilter
                      ? () => onSectionFilter(slot.name)
                      : undefined
                  }
                >
                  <span className={styles.slotName}>{slot.name}</span>
                  <span className={styles.meter} aria-hidden="true">
                    <span
                      className={styles.meterFill}
                      style={{
                        inlineSize: `${slot.target > 0 ? Math.min(100, (slot.filled / slot.target) * 100) : 100}%`,
                      }}
                    />
                  </span>
                  <span className={styles.number} data-zero={slot.filled === 0}>
                    {t("magazine:desk.rail.health.slotCount", {
                      filled: format.number(slot.filled),
                      target: format.number(slot.target),
                    })}
                  </span>
                </RailToggle>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      {hiddenSlots.length > 0 && !isSummaryDisclosure ? (
        <button
          type="button"
          className={styles.textButton}
          {...disclosureProps}
        >
          <FiChevronDown aria-hidden="true" className={styles.disclosureIcon} />
          {isShowingAll
            ? t("magazine:desk.rail.health.showFewerSections")
            : t("magazine:desk.rail.health.showAllSections")}
        </button>
      ) : null}
    </div>
  );
}
