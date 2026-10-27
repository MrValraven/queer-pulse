import {
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, m, useIsPresent } from "motion/react";
import { useMotionPrefs } from "../../../../app/providers/motionPrefs";
import { ShellFrameContext } from "../../../../app/providers/shellFrame";
import { useStudioPlayer, type StudioQueueItem } from "../studioPlayerContext";
import {
  useStudioPlayerSurface,
  type StudioSidePanelView,
} from "../studioPlayerSurface";
import { StudioSidePanelBody } from "./StudioSidePanelBody";
import {
  STUDIO_NOW_PLAYING_BUTTON_ID,
  STUDIO_QUEUE_BUTTON_ID,
} from "./studioQueueMoves";
import { useStudioToastShift } from "./useStudioToastShift";
import styles from "./StudioQueue.module.css";

type OpenerRef = RefObject<HTMLElement | null>;

/** The opener the host was given, else what held focus as the panel opened
 *  (anything outside the panel itself), else the player bar's button for
 *  the view the panel opened on. */
function readOpener(
  openerRef: OpenerRef | undefined,
  panel: HTMLElement | null,
  view: StudioSidePanelView,
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
  return document.getElementById(
    view === "queue" ? STUDIO_QUEUE_BUTTON_ID : STUDIO_NOW_PLAYING_BUTTON_ID,
  );
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
 * replayed cleanup never sees. This hook moves no focus on a view switch
 * inside the open panel (the body moves it to the heading after Open
 * queue). The fallback opener is the bar button of the view it opened on.
 */
function usePanelFocus(
  openerRef: OpenerRef | undefined,
  isPresent: boolean,
  view: StudioSidePanelView,
) {
  const panelRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const openerElementRef = useRef<HTMLElement | null>(null);
  const openedViewRef = useRef(view);
  useLayoutEffect(() => {
    openerElementRef.current ??= readOpener(
      openerRef,
      panelRef.current,
      openedViewRef.current,
    );
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

/** Whether the site nav is on screen above the panel: a standard page frame
 *  is up and draws the app chrome (AppChrome's own rule above the phone
 *  breakpoint). Studio's own pages register no frame. */
function useIsSiteNavShown(): boolean {
  const frames = useContext(ShellFrameContext)?.frames ?? [];
  const topFrame = frames[frames.length - 1];
  return topFrame !== undefined && !topFrame.chromeless;
}

/** The floating side panel card: pushes no layout, sits above the player
 *  bar and leaves the page usable (non-modal). It shows either view; the
 *  host hands it the view and the item, so its exit plays with the last
 *  ones it showed. */
function StudioQueuePanel({
  view,
  item,
  onClose,
  openerRef,
}: {
  view: StudioSidePanelView;
  item: StudioQueueItem;
  onClose: () => void;
  openerRef?: OpenerRef;
}) {
  const { reducedMotion } = useMotionPrefs();
  const headingId = useId();
  const isPresent = useIsPresent();
  const isSiteNavShown = useIsSiteNavShown();
  const { panelRef, headingRef } = usePanelFocus(openerRef, isPresent, view);
  // Toasts step to the panel's side, off its head and rows (DES-28).
  useStudioToastShift(panelRef, "end", isPresent);
  return (
    <m.aside
      ref={panelRef}
      // Portalled out of the bar, so it carries its own marker: Sentry drops
      // the clicks made in here (dropStudioPlayBreadcrumb).
      data-studio-player=""
      className={
        isSiteNavShown
          ? `${styles.panel} ${styles.panelBelowNav}`
          : styles.panel
      }
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
      <StudioSidePanelBody
        view={view}
        item={item}
        headingId={headingId}
        headingRef={headingRef}
        onClose={onClose}
      />
    </m.aside>
  );
}

/** Mounted by the player bar: the floating card, for the floating placement
 *  only (the docked column has its own host). On phones both views are
 *  panes in Now playing. `openerRef` names the button that opened it, so
 *  focus returns to it on close. */
export function StudioQueuePanelHost({
  openerRef,
}: { openerRef?: OpenerRef } = {}) {
  const surface = useStudioPlayerSurface();
  const { currentItem } = useStudioPlayer();
  const view = surface.sidePanel;
  return createPortal(
    <AnimatePresence>
      {surface.sidePanelPlacement === "floating" &&
        view !== null &&
        currentItem && (
          <StudioQueuePanel
            key="side-panel"
            view={view}
            item={currentItem}
            onClose={surface.closeSidePanel}
            openerRef={openerRef}
          />
        )}
    </AnimatePresence>,
    document.body,
  );
}
