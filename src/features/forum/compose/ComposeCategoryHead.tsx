import { AnimatePresence, m } from "motion/react";
import { FiCompass } from "react-icons/fi";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { ComposeCategory } from "./composeCategories.data";
import { ComposeHeightFrame } from "./ComposeHeightFrame";
import styles from "./ComposeCategoryGrid.module.css";

// ── The heading row of "Where does it go?" ──────────────────────────────────
// Split out of `ComposeCategoryGrid`, which owns the choice. The row carries
// the question, its hint and the "Sounds like ..." chip. The chip is taller
// than the text beside it, and on a narrow column it wraps onto a line of its
// own, so the row sits in a height frame: when the chip comes or goes, the
// grid below glides to its new place.

export interface ComposeCategoryHeadProps {
  headingId: string;
  hintId: string;
  /** The category the draft sounds like, when it differs from the choice. */
  suggestion: ComposeCategory | undefined;
  onChoose: (category: string) => void;
}

export function ComposeCategoryHead({
  headingId,
  hintId,
  suggestion,
  onChoose,
}: ComposeCategoryHeadProps) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  return (
    <ComposeHeightFrame>
      <div className={styles.head}>
        <h2 id={headingId} className={styles.title}>
          {t("forum:composePage.section.category.title")}
        </h2>
        <p id={hintId} className={styles.hint}>
          {t("forum:composePage.section.category.hint")}
        </p>
        {/* The offer fades and settles in when the draft starts to sound
            like somewhere, and swaps in place when that somewhere changes. */}
        <AnimatePresence mode="wait" initial={false}>
          {suggestion && (
            <m.button
              key={suggestion.id}
              type="button"
              className={styles.suggestion}
              onClick={() => onChoose(suggestion.id)}
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              // The press lives here: motion owns this chip's transform.
              whileTap={{ scale: 0.97 }}
              transition={{
                duration: reducedMotion ? 0 : 0.18,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <FiCompass aria-hidden />
              {t("forum:composePage.category.suggestion", {
                category: t(suggestion.nameKey),
              })}
            </m.button>
          )}
        </AnimatePresence>
      </div>
    </ComposeHeightFrame>
  );
}
