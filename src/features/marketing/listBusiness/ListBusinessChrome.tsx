import { Fragment, useEffect, useRef, type ReactNode } from "react";
import { FiArrowLeft, FiArrowRight, FiCheck } from "react-icons/fi";
import { Button } from "../../../shared/components/ui";
import { usePrefersReducedMotion } from "../../../shared/hooks/usePrefersReducedMotion";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { MissingFieldsBar } from "./MissingFieldsBar";
import {
  PILL_LABEL_KEYS,
  TOTAL_STEPS,
  type MissingField,
} from "./listBusiness.data";
import styles from "./ListBusinessPage.module.css";
import chrome from "./ListBusinessChrome.module.css";

/** Step pills + progress bar + autosave status.
 *
 *  Mobile step-progress: on narrow screens the shared pill labels collapse to
 *  bare numbers, so the row becomes a self-contained horizontal scroller (never
 *  clipping or forcing page scroll) with the active pill scrolled into view, and
 *  a compact "Step N of N — Label" line names the current step + announces it.
 *
 *  Pill jump-back: pass `onJump` to turn every VISITED (completed) pill into a
 *  button that returns to that step. The caller already has `goToStep` — wire it
 *  through as `onJump={goToStep}` from WizardFormPane. Omitted → pills are inert
 *  (current behaviour), so this is a no-op until wired. */
export function WizardChrome({
  step,
  savedAt,
  onJump,
}: {
  step: number;
  savedAt: number | null;
  /** Jump back to a visited step. When absent, pills stay non-interactive. */
  onJump?: (step: number) => void;
}) {
  const { t } = useTranslation();
  const reducedMotion = usePrefersReducedMotion();
  const activePillRef = useRef<HTMLDivElement | null>(null);
  const pills = PILL_LABEL_KEYS;
  const lastStep = TOTAL_STEPS - 1;
  const fill = (step / lastStep) * 100;
  const currentIndex = step; // pill position (0-based) of the current step

  // Keep the active pill visible when the row is a narrow horizontal scroller.
  // block:"nearest" avoids yanking the page vertically when it's already in view.
  useEffect(() => {
    activePillRef.current?.scrollIntoView({
      behavior: reducedMotion ? "auto" : "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [step, reducedMotion]);

  return (
    <div className={styles.wizTop}>
      <p className={chrome.stepMeta} aria-live="polite">
        {t("marketing:listBusiness.wizard.stepOf", {
          number: currentIndex + 1,
          total: pills.length,
          label: t(pills[currentIndex] ?? pills[pills.length - 1]!),
        })}
      </p>
      <div className={chrome.pillRow}>
        {pills.map((labelKey, index) => {
          const isDone = index < step;
          const isCurrent = index === step;
          const cls = isDone
            ? styles.wpDone
            : isCurrent
              ? styles.wpActive
              : undefined;
          const label = t(labelKey);
          const pillClass = [styles.wp, chrome.pill, cls]
            .filter(Boolean)
            .join(" ");
          const inner = (
            <>
              <span className={styles.wpN} aria-hidden>
                {isDone ? <FiCheck size={13} /> : index + 1}
              </span>
              {/* Label is hidden on narrow screens by the shared .wpL rule;
                  the compact line above supplies the name there. */}
              <span className={styles.wpL}>{label}</span>
            </>
          );
          // Only a VISITED step is reachable by tapping its pill.
          const canJump = isDone && Boolean(onJump);
          return (
            <Fragment key={labelKey}>
              {canJump ? (
                <button
                  type="button"
                  className={[pillClass, chrome.jumpable].join(" ")}
                  onClick={() => onJump?.(index)}
                  aria-label={t("marketing:listBusiness.wizard.stepJumpAria", {
                    number: index + 1,
                    label,
                  })}
                >
                  {inner}
                </button>
              ) : (
                <div
                  ref={isCurrent ? activePillRef : undefined}
                  className={pillClass}
                  aria-current={isCurrent ? "step" : undefined}
                  aria-label={t(
                    isDone
                      ? "marketing:listBusiness.wizard.stepAriaDone"
                      : isCurrent
                        ? "marketing:listBusiness.wizard.stepAriaCurrent"
                        : "marketing:listBusiness.wizard.stepAria",
                    { number: index + 1, label },
                  )}
                >
                  {inner}
                </div>
              )}
              {index < pills.length - 1 && (
                <span className={chrome.bar} aria-hidden />
              )}
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
  const { t } = useTranslation();
  const blocked = missing.length > 0;
  // A custom backLabel (e.g. step 0's "Cancel") isn't a step-back affordance,
  // so the back arrow only rides the default "Back".
  const isDefaultBack = backLabel === undefined;
  const back = backLabel ?? t("marketing:listBusiness.paneActions.back");
  return (
    <div className={styles.paneFooter}>
      <MissingFieldsBar missing={missing} />
      <div className={styles.paneActions}>
        <Button variant="ghost" onClick={onBack}>
          {isDefaultBack ? (
            <>
              <FiArrowLeft aria-hidden /> {back}
            </>
          ) : (
            back
          )}
        </Button>
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
          {nextLabel} <FiArrowRight aria-hidden />
        </Button>
      </div>
    </div>
  );
}
