import { Fragment, type ReactNode } from "react";
import { FiAlertCircle, FiArrowRight, FiCheck } from "react-icons/fi";
import { Button } from "../../../shared/components/ui";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  PILL_LABEL_KEYS,
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
  isEdit = false,
}: {
  step: number;
  savedAt: number | null;
  /** Edit mode never renders StepPath (step 0) — drop its pill so it doesn't
   *  show as a completed step that isn't actually reachable. */
  isEdit?: boolean;
}) {
  const { t } = useTranslation();
  const baseStep = isEdit ? 1 : 0; // wizard step index that pills[0] maps to
  const pills = isEdit ? PILL_LABEL_KEYS.slice(1) : PILL_LABEL_KEYS;
  const lastStep = TOTAL_STEPS - 1;
  const fill = ((step - baseStep) / (lastStep - baseStep)) * 100;
  return (
    <div className={styles.wizTop}>
      <div className={styles.pills}>
        {pills.map((labelKey, index) => {
          const actualStep = index + baseStep; // the real wizard step this pill maps to
          const cls =
            actualStep < step
              ? styles.wpDone
              : actualStep === step
                ? styles.wpActive
                : undefined;
          const label = t(labelKey);
          const ariaKey =
            actualStep < step
              ? "marketing:listBusiness.wizard.stepAriaDone"
              : actualStep === step
                ? "marketing:listBusiness.wizard.stepAriaCurrent"
                : "marketing:listBusiness.wizard.stepAria";
          return (
            <Fragment key={labelKey}>
              <div
                className={[styles.wp, cls].filter(Boolean).join(" ")}
                aria-label={t(ariaKey, { number: index + 1, label })}
              >
                <span className={styles.wpN} aria-hidden>
                  {actualStep < step ? <FiCheck size={13} /> : index + 1}
                </span>
                <span className={styles.wpL}>{label}</span>
              </div>
              {index < pills.length - 1 && <span className={styles.wpBar} />}
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
            <FiCheck size={12} aria-hidden />{" "}
            {t("marketing:listBusiness.wizard.draftSaved")}
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
  const { t } = useTranslation();
  return (
    <div className={`${styles.draftBanner} wrap`}>
      <div className={styles.dbTxt}>
        <Translation
          i18nKey="marketing:listBusiness.draftBanner.text"
          components={{ b: <b /> }}
        />
      </div>
      <div className={styles.dbActions}>
        <Button variant="ghost" onClick={onDiscard}>
          {t("marketing:listBusiness.draftBanner.startFresh")}
        </Button>
        <Button variant="primary" onClick={onResume}>
          {t("marketing:listBusiness.draftBanner.resume")}
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
    <div className={styles.paneHead}>
      <h2 className={styles.paneH2}>
        {title} {em && <em>{em}</em>}
      </h2>
      <p className={styles.paneSub}>{sub}</p>
    </div>
  );
}

/** Sending-in-flight status panel shown while the listing submits/saves.
 *  Edit mode PATCHes and stays Live — no moderation queue — so it gets its
 *  own copy instead of the create flow's "sent to the team" wording. */
export function SendingPanel({ isEdit = false }: { isEdit?: boolean }) {
  const { t } = useTranslation();
  return (
    <div className={styles.page}>
      <div className={styles.statusPanel}>
        <div className={styles.statusInner}>
          <div className={styles.sending}>
            <div className={styles.ring} />
            <p>
              {t(
                isEdit
                  ? "marketing:listBusiness.edit.saving"
                  : "marketing:listBusiness.sending",
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Back / next footer with the "what's still needed" hint. */
export function PaneActions({
  onBack,
  backLabel,
  hideBack = false,
  onNext,
  nextLabel,
  missing,
}: {
  onBack: () => void;
  backLabel?: string;
  /** Edit mode's step 1 has nowhere to go back to (StepPath is locked away)
   *  — hide the Back button instead of rendering a dead-end no-op. */
  hideBack?: boolean;
  onNext: () => void;
  nextLabel: string;
  missing: MissingField[];
}) {
  const { t } = useTranslation();
  const blocked = missing.length > 0;
  const back = backLabel ?? t("marketing:listBusiness.paneActions.back");
  const actionsCls = [styles.paneActions, hideBack && styles.paneActionsEnd]
    .filter(Boolean)
    .join(" ");
  return (
    <div className={styles.paneFooter}>
      {blocked && (
        <div className={styles.neededBar}>
          <FiAlertCircle size={15} className={styles.neededIcon} aria-hidden />
          <span className={styles.neededLabel}>
            {t("marketing:listBusiness.paneActions.neededLabel")}
          </span>
          <span className={styles.neededChips}>
            {missing.map((m) => {
              const label = t(m.labelKey);
              return (
                <button
                  key={m.anchor}
                  type="button"
                  className={styles.neededChip}
                  onClick={() => jumpToField(m.anchor)}
                  aria-label={t(
                    "marketing:listBusiness.paneActions.jumpToAria",
                    { label },
                  )}
                >
                  {label}
                  <FiArrowRight size={11} aria-hidden />
                </button>
              );
            })}
          </span>
        </div>
      )}
      <div className={actionsCls}>
        {!hideBack && (
          <Button variant="ghost" onClick={onBack}>
            {back}
          </Button>
        )}
        <Button
          variant="primary"
          onClick={onNext}
          disabled={blocked}
          title={
            blocked
              ? t("marketing:listBusiness.paneActions.blockedTitle")
              : undefined
          }
        >
          {nextLabel}
        </Button>
      </div>
    </div>
  );
}
