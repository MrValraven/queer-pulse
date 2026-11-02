import { AnimatePresence, m } from "motion/react";
import { FiSliders } from "react-icons/fi";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { RollingNumber } from "../../shared/components/ui/RollingNumber";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./DirectoryLayout.module.css";

/* The slot opens its width (and swallows the button's 8px gap) while the
   badge inside scales in, so the button grows smoothly as the first filter
   lands. Children inherit the variant labels, so the exit plays on both
   before AnimatePresence unmounts them. The same motion as the members
   directory's Filters button. */
const badgeSlotVariants = {
  hidden: { width: 0, marginLeft: -8 },
  shown: { width: "auto", marginLeft: 0 },
};
const badgeVariants = {
  hidden: { opacity: 0, scale: 0.4 },
  shown: { opacity: 1, scale: 1 },
};

/**
 * "Hide filters" / "Filters": shows and hides the desktop sidebar, with the
 * count of active filters on it, so a hidden sidebar still says that some
 * are applied.
 */
export function DirectoryFiltersToggle({
  isPanelOpen,
  onToggle,
  activeCount,
  panelId,
}: {
  isPanelOpen: boolean;
  onToggle: () => void;
  activeCount: number;
  /** The sidebar's id, for `aria-controls`. */
  panelId: string;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { reducedMotion } = useMotionPrefs();
  return (
    <button
      type="button"
      className={styles.filtersBtn}
      aria-expanded={isPanelOpen}
      aria-controls={panelId}
      onClick={onToggle}
    >
      <FiSliders aria-hidden />
      {/* Its own span, so a narrow results column can fold the label away
          while the button keeps it as its accessible name. */}
      <span className={styles.filtersBtnLabel}>
        {isPanelOpen
          ? t("marketing:local.filter.hideFilters")
          : t("marketing:local.filter.filters")}
      </span>
      <AnimatePresence initial={false}>
        {activeCount > 0 && (
          <m.span
            key="count"
            className={styles.filtersBtnCountSlot}
            variants={badgeSlotVariants}
            initial="hidden"
            animate="shown"
            exit="hidden"
            transition={{
              duration: reducedMotion ? 0 : 0.26,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <m.span className={styles.filtersBtnCount} variants={badgeVariants}>
              <RollingNumber
                value={fmt.number(activeCount)}
                numericValue={activeCount}
              />
            </m.span>
          </m.span>
        )}
      </AnimatePresence>
    </button>
  );
}
