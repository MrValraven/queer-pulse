import { AnimatePresence, m } from "motion/react";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import styles from "./ComposeCategoryGrid.module.css";

// ── The recent-threads popover under a category card ────────────────────────
// Split out of `ComposeCategoryGrid`, which decides when it shows and where.
// Decorative and `aria-hidden`: everything needed to choose is on the card.
//
// It fades in and out. Each card gets a popover of its own (keyed on the
// category), so when the pointer runs from card to card the old one fades
// where it stood as the new one fades in under its card: the words and the
// place always change together.

export interface ComposeCategoryPopoverPlacement {
  left: number;
  top: number;
  /** The category's display name, already translated. */
  categoryName: string;
  titles: readonly string[];
}

export interface ComposeCategoryPopoverProps {
  /** Where and what to show, or null to hide it. */
  placement: ComposeCategoryPopoverPlacement | null;
}

export function ComposeCategoryPopover({
  placement,
}: ComposeCategoryPopoverProps) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();

  return (
    <AnimatePresence>
      {placement && (
        <m.div
          key={placement.categoryName}
          className={styles.popover}
          style={{ left: placement.left, top: placement.top }}
          initial={{ opacity: 0, y: -3 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -3 }}
          transition={{
            duration: reducedMotion ? 0 : 0.16,
            ease: [0.16, 1, 0.3, 1],
          }}
          aria-hidden
        >
          <span className={styles.popoverLabel}>
            {t("forum:composePage.category.recentIn", {
              category: placement.categoryName,
            })}
          </span>
          {placement.titles.map((title) => (
            <span key={title} className={styles.popoverTitle}>
              {title}
            </span>
          ))}
        </m.div>
      )}
    </AnimatePresence>
  );
}
