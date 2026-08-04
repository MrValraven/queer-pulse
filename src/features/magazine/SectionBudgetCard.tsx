import { FiCheck } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { SECTIONS } from "./editorDashboard.data";
import { cx } from "../../shared/lib/cx";
import { SideCard } from "./SideCard";
import styles from "./EditorDashboardPage.module.css";

function Dots({ filled, planned }: { filled: number; planned: number }) {
  return (
    <span className={styles.secSlots}>
      {Array.from({ length: planned }).map((_, index) => (
        <span
          key={index}
          className={cx(styles.slot, index < filled && styles.on)}
        />
      ))}
    </span>
  );
}

/** Planned vs filled slots per magazine section. */
export function SectionBudgetCard() {
  const { t } = useTranslation();
  const open = SECTIONS.reduce(
    (total, section) => total + Math.max(0, section.planned - section.filled),
    0,
  );
  return (
    <SideCard
      title={
        <>
          {t("magazine:editor.sideCards.sectionBudgetHeading")}{" "}
          <span className={styles.free}>
            {t("magazine:editor.sideCards.slotsOpen", { count: open })}
          </span>
        </>
      }
    >
      {SECTIONS.map((section) => {
        const gap = section.planned - section.filled;
        return (
          <div
            key={section.name}
            className={cx(styles.secRow, gap > 0 && styles.gap)}
          >
            <span className={styles.secName}>{section.name}</span>
            <Dots filled={section.filled} planned={section.planned} />
            <span className={cx(styles.secCount, gap > 0 && styles.need)}>
              {gap > 0 ? (
                t("magazine:editor.sideCards.needCount", { count: gap })
              ) : (
                <FiCheck
                  aria-label={t("magazine:editor.sideCards.filledAria")}
                />
              )}
            </span>
          </div>
        );
      })}
    </SideCard>
  );
}
