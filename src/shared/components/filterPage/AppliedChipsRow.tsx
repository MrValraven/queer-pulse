import type { ReactNode } from "react";
import { AnimatePresence, m } from "motion/react";
import { FiX } from "react-icons/fi";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { useTranslation } from "../../i18n/useTranslation";
import { FILTER_PAGE_SPRING } from "./filterPageMotion";
import styles from "./FilterPage.module.css";

/** One applied filter, drawn as a removable plum chip. */
export interface AppliedFilterChip {
  /** Stable across renders (e.g. `${group}:${value}`), so a chip keeps its
   *  identity while others come and go. */
  key: string;
  label: string;
  onRemove: () => void;
}

interface AppliedChipsRowProps {
  /** The sidebar's selections, in the order they should read. The search
   *  term and the sort are on screen already, so leave them out. */
  chips: readonly AppliedFilterChip[];
  /** A page control at the end of the row, such as "Save search". It shows
   *  only while there are chips. */
  trailing?: ReactNode;
}

/** The applied-filter chips under `FilterResultsTop`. The row springs open
 *  when the first chip lands and shut when the last one leaves, so the
 *  results below move with it; each chip scales in and out on its own. */
export function AppliedChipsRow({ chips, trailing }: AppliedChipsRowProps) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const hasChips = chips.length > 0;
  return (
    /* Always mounted so a chip removed one at a time can play its exit
       animation. The wrapper springs its real height (bottom spacing
       included) to 0 and back on the shared FILTER_PAGE_SPRING, so the
       results below flow with it; it clips only while moving, so chip
       focus rings show. `initial={false}` keeps chips already applied on
       arrival from animating in; only chips added later do. `inert` keeps
       a trailing control out of reach while the row is shut. */
    <m.div
      className={styles.appliedRowClip}
      inert={!hasChips || undefined}
      initial={false}
      animate={
        hasChips
          ? {
              height: "auto",
              overflow: "hidden",
              transitionEnd: { overflow: "visible" },
            }
          : { height: 0, overflow: "hidden" }
      }
      transition={reducedMotion ? { duration: 0 } : FILTER_PAGE_SPRING}
    >
      <div className={styles.appliedRow}>
        <AnimatePresence initial={false}>
          {chips.map((chip) => (
            <m.span
              key={chip.key}
              className={styles.applied}
              layout={!reducedMotion}
              initial={{ opacity: 0, scale: 0.86 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.86 }}
              transition={{
                duration: reducedMotion ? 0 : 0.22,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              {chip.label}
              <button
                type="button"
                aria-label={t("shared:filterPage.removeChipLabel", {
                  label: chip.label,
                })}
                onClick={chip.onRemove}
              >
                <FiX aria-hidden />
              </button>
            </m.span>
          ))}
        </AnimatePresence>
        {trailing !== undefined && trailing !== null && (
          <m.span
            className={styles.appliedTrailing}
            layout={!reducedMotion}
            transition={{
              duration: reducedMotion ? 0 : 0.22,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {trailing}
          </m.span>
        )}
      </div>
    </m.div>
  );
}
