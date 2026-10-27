import { AnimatePresence, m } from "motion/react";
import { FiScissors } from "react-icons/fi";
import { useMotionPrefs } from "../../../../../app/providers/motionPrefs";
import { IconButton } from "../../../../../shared/components/ui";
import { useTranslation } from "../../../../../shared/i18n/useTranslation";
import styles from "./PdfPageGrid.module.css";

/** Mirrors --ease and --dur-base from styles/tokens/effects.css. */
const LINE_TRANSITION = {
  duration: 0.25,
  ease: [0.22, 0.68, 0.16, 1],
} as const;

interface PdfCutControlProps {
  /** The 1-based number of the page the split follows. */
  pageNumber: number;
  isActive: boolean;
  onToggle: () => void;
}

/**
 * The split toggle in the column gap after one page. A pressed toggle draws
 * an accent line down the gap, which marks where one output file ends and
 * the next begins. The grid renders it after every page except the last.
 */
export function PdfCutControl({
  pageNumber,
  isActive,
  onToggle,
}: PdfCutControlProps) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const label = t(
    isActive ? "admin:utilities.pdf.cut.remove" : "admin:utilities.pdf.cut.add",
    { number: pageNumber },
  );

  return (
    <div
      className={[styles.cut, isActive && styles.cutActive]
        .filter(Boolean)
        .join(" ")}
    >
      <AnimatePresence initial={false}>
        {isActive && (
          <m.span
            key="cut-line"
            className={styles.cutLine}
            aria-hidden
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            exit={{ scaleY: 0 }}
            transition={reducedMotion ? { duration: 0 } : LINE_TRANSITION}
          />
        )}
      </AnimatePresence>
      <IconButton
        aria-label={label}
        aria-pressed={isActive}
        size="sm"
        data-tap-target
        className={styles.cutButton}
        onClick={onToggle}
      >
        <FiScissors aria-hidden />
      </IconButton>
    </div>
  );
}
