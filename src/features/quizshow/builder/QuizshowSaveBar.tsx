import { createPortal } from "react-dom";
import { AnimatePresence, m } from "motion/react";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { Button } from "../../../shared/components/ui";
import { useFloatingBarInset } from "../../../shared/hooks";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import styles from "./QuizshowBuilder.module.css";

const EASE = [0.22, 0.68, 0.16, 1] as const;
const SLIDE_OFFSET_PX = 24;

/**
 * The builder's save bar. Portaled to the body (route transitions transform
 * the page) and lifted above the consent banner by its CSS `bottom`.
 */
export function QuizshowSaveBar({
  isVisible,
  isSaving,
  isSaveBlocked,
  statusId,
  saveLabelKey = "quizshow:save.save",
  onSave,
  onDiscard,
}: {
  isVisible: boolean;
  isSaving: boolean;
  isSaveBlocked: boolean;
  /** The status line's id, so Open lobby can name it as its blocked reason. */
  statusId?: string;
  /** The save button's label key; a template reads "Save template". */
  saveLabelKey?: string;
  onSave: () => void;
  onDiscard: () => void;
}) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const barRef = useFloatingBarInset();
  const duration = reducedMotion ? 0 : 0.25;
  const isSaveIdle = !isSaving && !isSaveBlocked;
  return createPortal(
    <AnimatePresence>
      {isVisible && (
        <m.div
          key="quizshow-save-bar"
          ref={barRef}
          className={styles.saveBar}
          initial={{ opacity: 0, y: reducedMotion ? 0 : SLIDE_OFFSET_PX }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: reducedMotion ? 0 : SLIDE_OFFSET_PX }}
          transition={{ duration, ease: EASE }}
        >
          <div className={styles.saveBarInner}>
            <p id={statusId} className={styles.saveStatus} role="status">
              <span className={styles.saveDot} aria-hidden />
              {t("quizshow:save.unsaved")}
            </p>
            <div className={styles.saveActions}>
              <Button
                variant="ghost"
                type="button"
                aria-disabled={isSaving}
                onClick={isSaving ? undefined : onDiscard}
              >
                {t("quizshow:save.discard")}
              </Button>
              <Button
                variant="primary"
                type="button"
                aria-disabled={!isSaveIdle}
                onClick={isSaveIdle ? onSave : undefined}
              >
                {isSaving ? t("quizshow:save.saving") : t(saveLabelKey)}
              </Button>
            </div>
          </div>
        </m.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
