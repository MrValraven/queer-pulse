import { Fragment, type ReactNode } from "react";
import { FiAlertCircle, FiArrowRight, FiCheck } from "react-icons/fi";
import { Button } from "../../../shared/components/ui";
import {
  PILL_LABELS,
  TOTAL_STEPS,
  type MissingField,
} from "./listBusiness.data";
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

/** Step pills + progress bar + autosave status. */
export function WizardChrome({
  step,
  savedAt,
}: {
  step: number;
  savedAt: number | null;
}) {
  const fill = (step / (TOTAL_STEPS - 1)) * 100;
  return (
    <div className={styles.wizTop}>
      <div className={styles.pills}>
        {PILL_LABELS.map((label, i) => {
          const cls =
            i < step ? styles.wpDone : i === step ? styles.wpActive : undefined;
          return (
            <Fragment key={label}>
              <div
                className={[styles.wp, cls].filter(Boolean).join(" ")}
                aria-label={`Step ${i + 1}: ${label}${
                  i < step ? " (done)" : i === step ? " (current)" : ""
                }`}
              >
                <span className={styles.wpN} aria-hidden>
                  {i < step ? <FiCheck size={13} /> : i + 1}
                </span>
                <span className={styles.wpL}>{label}</span>
              </div>
              {i < PILL_LABELS.length - 1 && <span className={styles.wpBar} />}
            </Fragment>
          );
        })}
      </div>
      <div className={styles.progressRow}>
        <div className={styles.progress}>
          <div
            className={styles.progressFill}
            style={{ transform: `scaleX(${fill / 100})` }}
          />
        </div>
        {savedAt && (
          <span className={styles.draftStatus}>
            <FiCheck size={12} aria-hidden /> Draft saved
          </span>
        )}
      </div>
    </div>
  );
}

/** Resume-draft banner shown when a saved draft is found on mount. */
export function DraftBanner({
  onResume,
  onDiscard,
}: {
  onResume: () => void;
  onDiscard: () => void;
}) {
  return (
    <div className={`${styles.draftBanner} wrap`}>
      <div className={styles.dbTxt}>
        <b>You have a saved draft.</b> Pick up where you left off?
      </div>
      <div className={styles.dbActions}>
        <Button variant="ghost" onClick={onDiscard}>
          Start fresh
        </Button>
        <Button variant="primary" onClick={onResume}>
          Resume draft
        </Button>
      </div>
    </div>
  );
}

/** Serif pane title (with coral `<em>`) + supporting sub-copy. */
export function PaneHeader({
  title,
  em,
  sub,
}: {
  title: string;
  em?: string;
  sub: ReactNode;
}) {
  return (
    <>
      <h2 className={styles.paneH2}>
        {title} {em && <em>{em}</em>}
      </h2>
      <p className={styles.paneSub}>{sub}</p>
    </>
  );
}

/** Back / next footer with the "what's still needed" hint. */
export function PaneActions({
  onBack,
  backLabel = "← Back",
  onNext,
  nextLabel,
  missing,
}: {
  onBack: () => void;
  backLabel?: string;
  onNext: () => void;
  nextLabel: string;
  missing: MissingField[];
}) {
  const blocked = missing.length > 0;
  return (
    <div className={styles.paneFooter}>
      {blocked && (
        <div className={styles.neededBar}>
          <FiAlertCircle size={15} className={styles.neededIcon} aria-hidden />
          <span className={styles.neededLabel}>A few things left</span>
          <span className={styles.neededChips}>
            {missing.map((m) => (
              <button
                key={m.anchor}
                type="button"
                className={styles.neededChip}
                onClick={() => jumpToField(m.anchor)}
                aria-label={`Jump to ${m.label}`}
              >
                {m.label}
                <FiArrowRight size={11} aria-hidden />
              </button>
            ))}
          </span>
        </div>
      )}
      <div className={styles.paneActions}>
        <Button variant="ghost" onClick={onBack}>
          {backLabel}
        </Button>
        <Button
          variant="primary"
          onClick={onNext}
          disabled={blocked}
          title={blocked ? "Fill the required fields to continue" : undefined}
        >
          {nextLabel}
        </Button>
      </div>
    </div>
  );
}
