import { useId, useRef } from "react";
import { AnimatePresence, m, useIsPresent } from "motion/react";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import {
  useStudioPlayer,
  type StudioQueueItem,
} from "./player/studioPlayerContext";
import {
  useStudioPlayerSurface,
  type StudioSidePanelView,
} from "./player/studioPlayerSurface";
import { StudioSidePanelBody } from "./player/ui/StudioSidePanelBody";
import {
  STUDIO_NOW_PLAYING_BUTTON_ID,
  STUDIO_QUEUE_BUTTON_ID,
} from "./player/ui/studioQueueMoves";
import { useStudioToastShift } from "./player/ui/useStudioToastShift";
import styles from "./StudioSidePanelColumn.module.css";

/** The open column's panel: a non-modal aside named by its heading. It
 *  fades while the grid track carries its width. The column hands it the
 *  view and the item, so its exit plays with the last ones it showed. */
function DockedSidePanel({
  view,
  item,
}: {
  view: StudioSidePanelView;
  item: StudioQueueItem;
}) {
  const { reducedMotion } = useMotionPrefs();
  const surface = useStudioPlayerSurface();
  const headingId = useId();
  const isPresent = useIsPresent();
  // Focus stays where the member put it on open. On close it lands on the
  // bar toggle for this view, since the close button leaves with the panel.
  const close = () => {
    surface.closeSidePanel();
    document
      .getElementById(
        view === "queue"
          ? STUDIO_QUEUE_BUTTON_ID
          : STUDIO_NOW_PLAYING_BUTTON_ID,
      )
      ?.focus();
  };
  return (
    <m.aside
      // Sentry drops the clicks made in here (dropStudioPlayBreadcrumb).
      data-studio-player=""
      className={styles.aside}
      aria-labelledby={headingId}
      inert={!isPresent}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reducedMotion ? 0 : 0.2 }}
    >
      <div className={styles.card}>
        <StudioSidePanelBody
          view={view}
          item={item}
          headingId={headingId}
          onClose={close}
        />
      </div>
    </m.aside>
  );
}

/**
 * The listener shell's third grid track: the docked Now playing or Queue
 * panel from 1280px. The shell works out `view` itself (it is the dock
 * host), so the panel shows from the shell's first render. A page change
 * remounts the shell, and the panel then shows at once, without its
 * entrance. Toasts step off the column while it is open; the observer
 * follows the track's width as it slides.
 */
export function StudioSidePanelColumn({
  view,
}: {
  view: StudioSidePanelView | null;
}) {
  const { currentItem } = useStudioPlayer();
  const columnRef = useRef<HTMLDivElement>(null);
  const isOpen = view !== null && currentItem !== null;
  useStudioToastShift(columnRef, "end", isOpen);
  return (
    <div ref={columnRef} className={styles.column}>
      <AnimatePresence initial={false}>
        {view !== null && currentItem !== null && (
          <DockedSidePanel key="side-panel" view={view} item={currentItem} />
        )}
      </AnimatePresence>
    </div>
  );
}
