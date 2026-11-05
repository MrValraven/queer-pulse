import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, m } from "motion/react";
import { FiRotateCcw } from "react-icons/fi";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { Button, IconButton } from "../../../shared/components/ui";
import { cx } from "../../../shared/lib/cx";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { QuizshowBlockedTip } from "../builder/QuizshowBlockedTip";
import { useQuizshowBlockedTip } from "../builder/useQuizshowBlockedTip";
import {
  TEMPLATE_CARD_INCOMPLETE_KEY,
  TEMPLATE_FIX_FIRST_KEY,
} from "../templates/useQuizshowTemplatePublish";
import { useQuizshowStudio } from "./QuizshowStudioContext";
import { STUDIO_SAVE_REASON_ID } from "./quizshowStudioDom";
import { QUIZ_SELECTION } from "./quizshowStudioSelection";
import lobbyStyles from "../builder/QuizshowLobby.module.css";
import styles from "./QuizshowStudioTopBar.module.css";

/** The card fields a blocked Publish marks missing, inside the studio's inspector. */
const MISSING_CARD_FIELD_SELECTOR =
  '[data-studio-inspector] input[aria-invalid="true"], [data-studio-inspector] textarea[aria-invalid="true"]';
/** How many frames to wait for the Quiz inspector (and its marked fields) to arrive. */
const FOCUS_ATTEMPT_FRAMES = 30;

/** The top bar has no list below it, so "fix the problems listed below" gets its own words here. */
function barReasonKeyOf(blockedReasonKey: string): string {
  return blockedReasonKey === TEMPLATE_FIX_FIRST_KEY
    ? "quizshow:studio.publish.fixFirst"
    : blockedReasonKey;
}

/**
 * After a blocked Publish on an incomplete card: focuses the first card
 * field marked missing, once the Quiz inspector has shown it, and scrolls it
 * into view (smoothly, outside reduced motion, by the page's own behaviour).
 * Returns the request to call on the blocked tap.
 */
function useMissingCardFieldFocus(): () => void {
  const [requestCount, setRequestCount] = useState(0);
  useEffect(() => {
    if (requestCount === 0) return undefined;
    let framesLeft = FOCUS_ATTEMPT_FRAMES;
    let frame = 0;
    const tryFocus = () => {
      const field = document.querySelector<HTMLElement>(
        MISSING_CARD_FIELD_SELECTOR,
      );
      if (field) {
        field.focus({ preventScroll: true });
        field.scrollIntoView({ block: "nearest" });
        return;
      }
      framesLeft -= 1;
      if (framesLeft > 0) frame = requestAnimationFrame(tryFocus);
    };
    frame = requestAnimationFrame(tryFocus);
    return () => cancelAnimationFrame(frame);
  }, [requestCount]);
  return () => setRequestCount((count) => count + 1);
}

/**
 * A template's publish state and Publish, or Unpublish once it is live. A
 * blocked Publish names its reason in a tooltip and still marks the card
 * fields it needs; on an incomplete card it opens the Quiz inspector at the
 * first missing field.
 */
export function QuizshowStudioPublishControls() {
  const { t } = useTranslation();
  const { publishing, templateMeta, select } = useQuizshowStudio();
  const reasonId = useId();
  const tip = useQuizshowBlockedTip();
  const focusMissingCardField = useMissingCardFieldFocus();
  if (publishing === null || templateMeta === null) return null;
  const isPublished = templateMeta.status === "published";
  const { blockedReasonKey } = publishing;
  const blockedReason =
    !isPublished && blockedReasonKey
      ? t(barReasonKeyOf(blockedReasonKey))
      : null;
  const isBlocked = publishing.isPending || blockedReason !== null;
  const publishBlocked = () => {
    tip.pin();
    // Publish marks the missing card fields even while it refuses to run.
    publishing.publish();
    if (blockedReasonKey === TEMPLATE_CARD_INCOMPLETE_KEY) {
      select(QUIZ_SELECTION);
      focusMissingCardField();
    }
  };
  return (
    <>
      {/* A live template's Unpublish says enough; the pill names a draft where the bar has room (the stylesheet hides it below 1366px). */}
      {!isPublished && (
        <span className={styles.publishState}>
          {t("quizshow:templates.status.draft")}
        </span>
      )}
      {/* Below 1366px a live template's Unpublish lives in More, so the save status and the title keep their room. */}
      <div
        className={cx(
          lobbyStyles.studioWrap,
          isPublished && styles.unpublishSlot,
        )}
      >
        <Button
          variant={isPublished ? "stage-ghost" : "stage"}
          aria-disabled={isBlocked || undefined}
          aria-describedby={blockedReason ? reasonId : undefined}
          onClick={() => {
            if (blockedReason !== null) publishBlocked();
            else if (!publishing.isPending) {
              if (isPublished) publishing.unpublish();
              else publishing.publish();
            }
          }}
        >
          {t(
            isPublished
              ? "quizshow:templates.unpublish"
              : "quizshow:templates.publish",
          )}
        </Button>
        {blockedReason !== null && (
          <QuizshowBlockedTip
            id={reasonId}
            isPinned={tip.isPinned}
            isDismissed={tip.isDismissed}
            onDismiss={tip.dismiss}
            onReset={tip.reset}
          >
            {blockedReason}
          </QuizshowBlockedTip>
        )}
      </div>
    </>
  );
}

/**
 * A template's explicit Save, which replaces the old bottom save bar, and
 * Discard changes beside it (an icon button, named for screen readers and on
 * hover) while there is something to discard. Wide only: a narrow bar folds
 * Discard into More. After a discard, focus lands on Save template, since
 * the Discard button leaves with the changes.
 */
export function QuizshowStudioTemplateSave() {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const { save } = useQuizshowStudio();
  const saveButtonRef = useRef<HTMLButtonElement>(null);
  if (!save.isExplicit) return null;
  const isBlocked = save.isSaving || save.isSaveBlocked || !save.isUnsaved;
  const hasReason = save.status === "held" || save.status === "failed";
  return (
    <>
      <AnimatePresence initial={false}>
        {save.isUnsaved && (
          <m.span
            key="discard"
            className={styles.discardSlot}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.15 }}
          >
            <IconButton
              tone="dark"
              aria-label={t("quizshow:save.discard")}
              tooltip
              tooltipPlacement="bottom"
              aria-disabled={save.isSaving || undefined}
              onClick={() => {
                if (save.isSaving) return;
                save.discard();
                saveButtonRef.current?.focus();
              }}
            >
              <FiRotateCcw aria-hidden />
            </IconButton>
          </m.span>
        )}
      </AnimatePresence>
      <Button
        ref={saveButtonRef}
        variant="stage-ghost"
        aria-disabled={isBlocked || undefined}
        aria-describedby={hasReason ? STUDIO_SAVE_REASON_ID : undefined}
        onClick={() => {
          if (!isBlocked) save.saveNow();
        }}
      >
        {t("quizshow:templates.saveCta")}
      </Button>
    </>
  );
}
