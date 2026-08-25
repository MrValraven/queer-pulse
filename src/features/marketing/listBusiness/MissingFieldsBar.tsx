import { FiAlertCircle, FiArrowRight } from "react-icons/fi";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { MissingField } from "./listBusiness.data";
import styles from "./ListBusinessPage.module.css";

/**
 * Scroll to the field a "what's still needed" chip names, flash it, and move
 * focus to its first control. Selectors match native inputs plus the button
 * groups used for radio/chip choices.
 */
function jumpToField(anchor: string) {
  const el = document.getElementById(anchor);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "center" });
  const focusable = el.querySelector<HTMLElement>(
    'input:not([type="hidden"]), select, textarea, [role="radio"], button',
  );
  // Let the smooth scroll settle before pulling focus (which would otherwise
  // yank the viewport back).
  window.setTimeout(() => focusable?.focus({ preventScroll: true }), 340);
  const flash = styles.fieldFlash;
  if (flash) {
    // Restart the flash even if the same chip is clicked twice in a row.
    el.classList.remove(flash);
    void el.offsetWidth;
    el.classList.add(flash);
    window.setTimeout(() => el.classList.remove(flash), 1400);
  }
}

/**
 * The "a few things left" bar: one chip per still-unfilled required field,
 * each jumping to (and flashing) the field it names. Renders nothing when the
 * list is empty.
 *
 * Shared by the create wizard's step footer (`PaneActions`) and the owner
 * editor's save bar, so the single-screen editor keeps the exact same
 * missing-field affordance the stepped flow has.
 */
export function MissingFieldsBar({
  missing,
  className,
}: {
  missing: MissingField[];
  className?: string;
}) {
  const { t } = useTranslation();
  if (missing.length === 0) return null;
  return (
    <div className={[styles.neededBar, className].filter(Boolean).join(" ")}>
      <FiAlertCircle size={15} className={styles.neededIcon} aria-hidden />
      <span className={styles.neededLabel}>
        {t("marketing:listBusiness.paneActions.neededLabel")}
      </span>
      <span className={styles.neededChips}>
        {missing.map((field) => {
          const label = t(field.labelKey);
          return (
            <button
              key={field.anchor}
              type="button"
              className={styles.neededChip}
              onClick={() => jumpToField(field.anchor)}
              aria-label={t("marketing:listBusiness.paneActions.jumpToAria", {
                label,
              })}
            >
              {label}
              <FiArrowRight size={11} aria-hidden />
            </button>
          );
        })}
      </span>
    </div>
  );
}
