import { AnimatePresence } from "motion/react";
import { useEffect, useId, useRef, useState, type RefObject } from "react";
import { useLocation } from "react-router-dom";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { Collapse, ConfirmDialog } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioLandingPreviewOwnerView } from "./api/studioLandingPreviews.adapters";
import type { StudioLandingPreviewAction } from "./api/studioLandingPreviews.api";
import {
  useStudioLandingPreviewAction,
  useStudioLandingPreviews,
} from "./api/useStudioLandingPreviews";
import { useLandingPreviewFocus } from "./useLandingPreviewFocus";
import { StudioLandingPreviewOwnerRow } from "./StudioLandingPreviewOwnerRow";
import {
  CONFIRM_KEYS,
  DONE_KEY,
  FAILED_KEY,
  type ConfirmedAction,
} from "./StudioLandingPreviews.data";
import { StudioLoadError } from "./StudioLoadStates";
import { studioErrorMessageKeyOf } from "./studioErrors.data";
import styles from "./StudioLandingPreviews.module.css";

const LANDING_PREVIEWS_HASH = "#landing-previews";
const LANDING_PREVIEWS_WHAT_KEY = "studio:errors.what.landingPreviews";
/** The card opens over this long, so the scroll waits for its real height. */
const SCROLL_AFTER_OPEN_MILLISECONDS = 340;

interface PreviewFailure {
  previewId: string;
  text: string;
}

/** "Your music on the Studio page": the requests our team made to play a track
 *  of this persona to visitors, and the previews it already approved. The card
 *  hides while there is nothing to answer, and a persona outside the artist
 *  kinds (an empty list) never sees it. `#landing-previews`, the target of the
 *  request notification, scrolls here and focuses the heading once. */
export function StudioLandingPreviewsCard({
  subprofileId,
  outsideFocusRef,
}: {
  subprofileId: string;
  /** Where focus goes when the last row leaves and the card folds away. */
  outsideFocusRef?: RefObject<HTMLElement | null>;
}) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const { hash } = useLocation();
  const { previews, loadState } = useStudioLandingPreviews(subprofileId);
  const act = useStudioLandingPreviewAction(subprofileId);
  const headingId = useId();
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const hasHandledHashRef = useRef(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [failure, setFailure] = useState<PreviewFailure | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<{
    preview: StudioLandingPreviewOwnerView;
    action: ConfirmedAction;
  } | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const requestFocusAfter = useLandingPreviewFocus(
    previews,
    listRef,
    headingRef,
    outsideFocusRef,
  );
  const hasRows = previews.length > 0;
  const hasLoadError = !hasRows && loadState.isError;
  const isTargeted = hash === LANDING_PREVIEWS_HASH;
  const busyPreviewId = act.isPending ? act.variables.previewId : null;
  const isFailureOrphaned =
    failure !== null && !previews.some((row) => row.id === failure.previewId);
  const isOpen = hasRows || hasLoadError || failure !== null;

  useEffect(() => {
    if (!isTargeted || !hasRows || hasHandledHashRef.current) return;
    const timer = window.setTimeout(
      () => {
        hasHandledHashRef.current = true;
        // jsdom leaves scrollIntoView undefined.
        const section = sectionRef.current;
        if (section && typeof section.scrollIntoView === "function") {
          section.scrollIntoView({
            behavior: reducedMotion ? "auto" : "smooth",
            block: "start",
          });
        }
        headingRef.current?.focus({ preventScroll: true });
      },
      reducedMotion ? 0 : SCROLL_AFTER_OPEN_MILLISECONDS,
    );
    return () => window.clearTimeout(timer);
  }, [isTargeted, hasRows, reducedMotion]);

  async function run(
    preview: StudioLandingPreviewOwnerView,
    action: StudioLandingPreviewAction,
  ) {
    setFailure(null);
    setStatusMessage("");
    const rowIndex = previews.findIndex((row) => row.id === preview.id);
    const focusRequest = {
      previewId: preview.id,
      action,
      nextPreviewId: previews[rowIndex + 1]?.id ?? null,
    };
    try {
      const answer = await act.mutateAsync({ previewId: preview.id, action });
      // An approved track that cannot play on the page says so.
      const isApprovedOff =
        action === "approve" && answer?.isEligible === false;
      setStatusMessage(
        isApprovedOff
          ? t("studio:landingPreviews.status.approvedOff")
          : t(DONE_KEY[action], { track: preview.trackTitle }),
      );
      requestFocusAfter({ ...focusRequest, isSuccess: true });
    } catch (error) {
      setFailure({
        previewId: preview.id,
        text: `${t(FAILED_KEY[action])}. ${t(studioErrorMessageKeyOf(error, "save"))}`,
      });
      requestFocusAfter({ ...focusRequest, isSuccess: false });
    }
  }

  function handleAction(
    preview: StudioLandingPreviewOwnerView,
    action: StudioLandingPreviewAction,
  ) {
    if (action === "decline") {
      void run(preview, action);
      return;
    }
    setConfirmTarget({ preview, action });
    setIsConfirmOpen(true);
  }

  const confirmKeys = confirmTarget ? CONFIRM_KEYS[confirmTarget.action] : null;
  const confirmTrack = confirmTarget?.preview.trackTitle ?? "";
  return (
    <>
      <p role="status" className="visuallyHidden">
        {statusMessage}
      </p>
      <Collapse isOpen={isOpen}>
        <section
          id="landing-previews"
          ref={sectionRef}
          className={styles.card}
          aria-labelledby={headingId}
        >
          <h2
            id={headingId}
            ref={headingRef}
            tabIndex={-1}
            className={styles.heading}
          >
            {t("studio:landingPreviews.title")}
          </h2>
          <p className={styles.dek}>{t("studio:landingPreviews.sub")}</p>
          <Collapse isOpen={hasLoadError}>
            <StudioLoadError
              loadState={loadState}
              what={LANDING_PREVIEWS_WHAT_KEY}
            />
          </Collapse>
          <ul
            ref={listRef}
            className={styles.list}
            aria-label={t("studio:landingPreviews.listLabel")}
          >
            <AnimatePresence>
              {previews.map((preview, index) => (
                <StudioLandingPreviewOwnerRow
                  key={preview.id}
                  preview={preview}
                  index={index}
                  isBusy={busyPreviewId === preview.id}
                  failureText={
                    failure?.previewId === preview.id ? failure.text : null
                  }
                  onAction={(action) => handleAction(preview, action)}
                />
              ))}
            </AnimatePresence>
          </ul>
          <Collapse isOpen={isFailureOrphaned}>
            <p role="alert" className={styles.failure}>
              {failure?.text}
            </p>
          </Collapse>
        </section>
      </Collapse>
      <ConfirmDialog
        open={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={() => {
          setIsConfirmOpen(false);
          if (confirmTarget)
            void run(confirmTarget.preview, confirmTarget.action);
        }}
        title={confirmKeys ? t(confirmKeys.title, { track: confirmTrack }) : ""}
        description={confirmKeys ? t(confirmKeys.body) : undefined}
        confirmLabel={confirmKeys ? t(confirmKeys.confirm) : undefined}
        tone={confirmTarget?.action === "withdraw" ? "destructive" : "default"}
      />
    </>
  );
}
