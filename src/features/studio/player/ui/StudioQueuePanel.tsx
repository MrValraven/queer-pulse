import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, m, useIsPresent } from "motion/react";
import { FiX } from "react-icons/fi";
import { useMotionPrefs } from "../../../../app/providers/motionPrefs";
import { useMediaQuery } from "../../../../shared/hooks/useMediaQuery";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { mediaMax } from "../../../../shared/theme/breakpoints";
import { useStudioPlayerSurface } from "../studioPlayerSurface";
import { StudioQueueList } from "./StudioQueueList";
import { STUDIO_QUEUE_BUTTON_ID } from "./studioQueueMoves";
import styles from "./StudioQueue.module.css";

type OpenerRef = RefObject<HTMLElement | null>;

/** The opener the host was given, else what held focus as the panel opened
 *  (anything outside the panel itself), else the player bar's queue button. */
function readOpener(
  openerRef: OpenerRef | undefined,
  panel: HTMLElement | null,
): HTMLElement | null {
  const given = openerRef?.current;
  if (given) return given;
  const activeElement = document.activeElement;
  const isOutsidePanel = !(panel?.contains(activeElement) ?? false);
  if (
    activeElement instanceof HTMLElement &&
    activeElement !== document.body &&
    isOutsidePanel
  )
    return activeElement;
  return document.getElementById(STUDIO_QUEUE_BUTTON_ID);
}

/** Hands focus back to the opener, once, while focus is still in the panel
 *  or nowhere; focus the member put on the page stays there. */
function returnFocus(
  openerElementRef: { current: HTMLElement | null },
  panel: HTMLElement | null,
) {
  const opener = openerElementRef.current;
  openerElementRef.current = null;
  const activeElement = document.activeElement;
  const isFocusOurs =
    activeElement === null ||
    activeElement === document.body ||
    (panel?.contains(activeElement) ?? false);
  if (opener?.isConnected && isFocusOurs) opener.focus();
}

/**
 * Focus moves to the heading on open and back to the opener as the panel
 * starts to leave (and on a real unmount). StrictMode replays these effects
 * on mount: the opener is read once (a replay would find the heading the
 * first run focused, so the panel's own elements never count), and the
 * unmount return runs only once the panel has left the document, which a
 * replayed cleanup never sees.
 */
function usePanelFocus(openerRef: OpenerRef | undefined, isPresent: boolean) {
  const panelRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const openerElementRef = useRef<HTMLElement | null>(null);
  useLayoutEffect(() => {
    openerElementRef.current ??= readOpener(openerRef, panelRef.current);
    headingRef.current?.focus();
  }, [openerRef]);
  useEffect(() => {
    if (!isPresent) returnFocus(openerElementRef, panelRef.current);
  }, [isPresent]);
  useEffect(() => {
    const elementRef = openerElementRef;
    const panel = panelRef.current;
    return () => {
      if (panel?.isConnected) return;
      returnFocus(elementRef, null);
    };
  }, []);
  return { panelRef, headingRef };
}

/** The desktop side panel: pushes no layout, sits above the player bar and
 *  leaves the page usable (non-modal). */
function StudioQueuePanel({
  onClose,
  openerRef,
}: {
  onClose: () => void;
  openerRef?: OpenerRef;
}) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const headingId = useId();
  const isPresent = useIsPresent();
  const { panelRef, headingRef } = usePanelFocus(openerRef, isPresent);
  return (
    <m.aside
      ref={panelRef}
      className={styles.panel}
      aria-labelledby={headingId}
      inert={!isPresent}
      initial={{ opacity: 0, x: reducedMotion ? 0 : 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: reducedMotion ? 0 : 24 }}
      transition={{
        duration: reducedMotion ? 0 : 0.22,
        ease: [0.22, 0.68, 0.16, 1],
      }}
      onKeyDown={(event) => {
        if (event.key !== "Escape") return;
        event.stopPropagation();
        onClose();
      }}
    >
      <div className={styles.panelHead}>
        <h2
          id={headingId}
          ref={headingRef}
          tabIndex={-1}
          className={styles.panelHeading}
        >
          {t("studio:queue.heading")}
        </h2>
        <button
          type="button"
          className={styles.control}
          aria-label={t("studio:queue.close")}
          onClick={onClose}
        >
          <FiX aria-hidden />
        </button>
      </div>
      <div className={styles.panelBody}>
        <StudioQueueList headingLevel={3} />
      </div>
    </m.aside>
  );
}

/** Mounted by the player bar. On phones the queue is a pane in Now playing.
 *  `openerRef` names the queue button, so focus returns to it on close. */
export function StudioQueuePanelHost({
  openerRef,
}: { openerRef?: OpenerRef } = {}) {
  const surface = useStudioPlayerSurface();
  const isPhone = useMediaQuery(mediaMax(880));
  return createPortal(
    <AnimatePresence>
      {surface.isQueuePanelOpen && !isPhone && (
        <StudioQueuePanel
          key="queue-panel"
          onClose={surface.closeQueuePanel}
          openerRef={openerRef}
        />
      )}
    </AnimatePresence>,
    document.body,
  );
}
