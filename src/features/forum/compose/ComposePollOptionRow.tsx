import { m } from "motion/react";
import { FiX } from "react-icons/fi";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import styles from "./ComposePollPanel.module.css";

// ── One option of the poll ──────────────────────────────────────────────────
// Split out of `ComposePollPanel.tsx`, which renders it inside an
// `AnimatePresence`: the row grows in when an option is added and folds away
// when one is removed. It shares the panel's stylesheet.

/** The house spring curve (`--ease`), as the cubic bezier motion expects. */
const OPTION_ROW_EASE = [0.22, 0.68, 0.16, 1] as const;

interface ComposePollOptionRowProps {
  index: number;
  option: string;
  canRemove: boolean;
  onSetOption: (index: number, option: string) => void;
  onRemoveOption: (index: number) => void;
}

export function ComposePollOptionRow({
  index,
  option,
  canRemove,
  onSetOption,
  onRemoveOption,
}: ComposePollOptionRowProps) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const optionName = t("forum:composePage.poll.optionLabel", {
    number: index + 1,
  });
  return (
    // The item animates its height and clips while it does; the spacing and
    // the input's focus ring live on the row inside, so neither snaps.
    <m.li
      className={styles.optionItem}
      initial={{ height: 0, opacity: 0, overflow: "hidden" }}
      animate={{
        height: "auto",
        opacity: 1,
        transitionEnd: { overflow: "visible" },
      }}
      exit={{ height: 0, opacity: 0, overflow: "hidden" }}
      transition={{
        duration: reducedMotion ? 0 : 0.24,
        ease: OPTION_ROW_EASE,
      }}
    >
      <div className={styles.optionRow}>
        <span className={styles.optionNumber} aria-hidden>
          {index + 1}
        </span>
        <input
          type="text"
          className={styles.optionInput}
          value={option}
          onChange={(event) => onSetOption(index, event.target.value)}
          aria-label={optionName}
          placeholder={optionName}
          autoComplete="off"
        />
        <button
          type="button"
          className={styles.removeOption}
          onClick={() => onRemoveOption(index)}
          disabled={!canRemove}
          aria-label={t("forum:composePage.poll.removeOption", {
            number: index + 1,
          })}
        >
          <FiX aria-hidden />
        </button>
      </div>
    </m.li>
  );
}
