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
  firstWizardStep,
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
 *  Pill jump: pass `onJump` to turn every VISITED (completed) pill into a
 *  button that returns to that step. WizardFormPane wires its `goToStep` through
 *  as `onJump={goToStep}`. Without it, pills are inert. `canJumpTo` widens which
 *  pills jump: a pill ahead of the current step for which it returns true also
 *  becomes a button, keeping its not-yet-visited look with a "Go to step" label.
 *  Omitted, only visited pills jump.
 *
 *  Edit mode: `isEdit` drops the create-only "Path" pill, so the row shows
 *  steps 1 to 5 numbered 1 to 5 and the bar runs from the first of them.
 *  Pill index `i` then stands for wizard step `i + 1`; `onJump` and
 *  `canJumpTo` always receive the WIZARD step. */
export function WizardChrome({
  step,
  savedAt,
  onJump,
  canJumpTo,
  isEdit = false,
}: {
  step: number;
  savedAt: number | null;
  /** Jump to another step. When absent, pills stay non-interactive. */
  onJump?: (step: number) => void;
  /** Whether wizard step `index` is reachable. Defaults to visited steps
   *  only (`index < step`). */
  canJumpTo?: (index: number) => boolean;
  /** Whether this is an edit of an existing listing, which has no Path step.
   *  Defaults to false: all six pills, as in a new submission. */
  isEdit?: boolean;
}) {
  const { t } = useTranslation();
  const reducedMotion = usePrefersReducedMotion();
  const activePillRef = useRef<HTMLDivElement | null>(null);
  const firstStep = firstWizardStep(isEdit);
  const pills = PILL_LABEL_KEYS.slice(firstStep);
  const lastIndex = TOTAL_STEPS - 1 - firstStep;
  const currentIndex = step - firstStep; // pill position (0-based) of the current step
  const fill = (currentIndex / lastIndex) * 100;

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
          const pillStep = index + firstStep; // the wizard step this pill stands for
          const isDone = index < currentIndex;
          const isCurrent = index === currentIndex;
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
          // A visited step is reachable by tapping its pill, and so is a step
          // ahead whenever `canJumpTo` allows it.
          const isJumpable =
            !isCurrent &&
            Boolean(onJump) &&
            (canJumpTo ? canJumpTo(pillStep) : isDone);
          return (
            <Fragment key={labelKey}>
              {isJumpable ? (
                <button
                  type="button"
                  className={[pillClass, chrome.jumpable].join(" ")}
                  onClick={() => onJump?.(pillStep)}
                  aria-label={t(
                    isDone
                      ? "marketing:listBusiness.wizard.stepJumpAria"
                      : "marketing:listBusiness.wizard.stepGoToAria",
                    { number: index + 1, label },
                  )}
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

/** Back / next footer with the "what's still needed" hint.
 *
 *  Pass `saveLabel` with `onSave` to add a primary save button after "Next",
 *  which then steps down to a ghost button. The save is never disabled by
 *  this step's gaps: the caller validates every step when it fires. Left out,
 *  the footer is the plain back / next pair. In a narrow footer the save-mode
 *  row stacks: Back on top, then Next and the save at full width, the save
 *  last where a thumb reaches it.
 *
 *  `neededBarFocus` makes the "a few things left" bar a focus target: when
 *  `isPending` is true the bar takes focus and scrolls into view, then
 *  `onFocused` runs so the caller can clear the request. */
export function PaneActions({
  onBack,
  backLabel,
  onNext,
  nextLabel,
  missing,
  saveLabel,
  onSave,
  shouldShowNextArrow = true,
  neededBarFocus,
}: {
  onBack: () => void;
  backLabel?: string;
  onNext: () => void;
  nextLabel: string;
  missing: MissingField[];
  /** The save-now button's label. Shown only together with `onSave`. */
  saveLabel?: string;
  /** Saves from any step. Shown only together with `saveLabel`. */
  onSave?: () => void;
  /** Whether "Next" carries its trailing arrow. Defaults to true. A caller
   *  whose next button saves passes false, since a save goes nowhere. */
  shouldShowNextArrow?: boolean;
  /** Set, the missing-fields bar can take focus on request. */
  neededBarFocus?: { isPending: boolean; onFocused?: () => void };
}) {
  const { t } = useTranslation();
  const reducedMotion = usePrefersReducedMotion();
  const neededBarRef = useRef<HTMLDivElement>(null);
  const isNeededBarFocusPending = neededBarFocus?.isPending === true;
  const onNeededBarFocused = neededBarFocus?.onFocused;
  // Runs after the (re)mounted step renders its bar. Focus goes first with
  // preventScroll, so the scroll that follows is the only viewport move.
  useEffect(() => {
    if (!isNeededBarFocusPending) return;
    const bar = neededBarRef.current;
    if (bar) {
      bar.focus({ preventScroll: true });
      bar.scrollIntoView({
        behavior: reducedMotion ? "auto" : "smooth",
        block: "center",
      });
    }
    onNeededBarFocused?.();
  }, [isNeededBarFocusPending, onNeededBarFocused, reducedMotion]);
  const blocked = missing.length > 0;
  // A custom backLabel (e.g. step 0's "Cancel") isn't a step-back affordance,
  // so the back arrow only rides the default "Back".
  const isDefaultBack = backLabel === undefined;
  const back = backLabel ?? t("marketing:listBusiness.paneActions.back");
  const isSaveVisible = saveLabel !== undefined && onSave !== undefined;
  const nextButton = (
    <Button
      variant={isSaveVisible ? "ghost" : "primary"}
      onClick={onNext}
      disabled={blocked}
      title={
        blocked
          ? t("marketing:listBusiness.paneActions.blockedTitle")
          : undefined
      }
    >
      {nextLabel}
      {shouldShowNextArrow && (
        <>
          {" "}
          <FiArrowRight aria-hidden />
        </>
      )}
    </Button>
  );
  return (
    <div
      className={[styles.paneFooter, isSaveVisible && chrome.saveModeFooter]
        .filter(Boolean)
        .join(" ")}
    >
      <MissingFieldsBar
        missing={missing}
        barRef={neededBarRef}
        isFocusTarget={neededBarFocus !== undefined}
      />
      <div
        className={[styles.paneActions, isSaveVisible && chrome.saveModeActions]
          .filter(Boolean)
          .join(" ")}
      >
        <Button variant="ghost" onClick={onBack}>
          {isDefaultBack ? (
            <>
              <FiArrowLeft aria-hidden /> {back}
            </>
          ) : (
            back
          )}
        </Button>
        {isSaveVisible ? (
          <div className={chrome.paneActionsEnd}>
            {nextButton}
            <Button variant="primary" onClick={onSave}>
              {saveLabel}
            </Button>
          </div>
        ) : (
          nextButton
        )}
      </div>
    </div>
  );
}
