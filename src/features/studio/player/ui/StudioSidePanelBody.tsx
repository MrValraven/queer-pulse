import { useRef, type Ref } from "react";
import { AnimatePresence, m } from "motion/react";
import { Link } from "react-router-dom";
import { FiX } from "react-icons/fi";
import { useMotionPrefs } from "../../../../app/providers/motionPrefs";
import { Collapse } from "../../../../shared/components/ui";
import { IconButton } from "../../../../shared/components/ui/IconButton";
import { Translation } from "../../../../shared/i18n/Translation";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { STUDIO_EXIT, STUDIO_FADE } from "../../studioMotion";
import { useStudioPlayer, type StudioQueueItem } from "../studioPlayerContext";
import {
  useStudioPlayerSurface,
  type StudioSidePanelView,
} from "../studioPlayerSurface";
import { radioFilterLabelKey } from "../studioQueue";
import { StudioNowPlayingView } from "./StudioNowPlayingView";
import { StudioQueueList } from "./StudioQueueList";
import styles from "./StudioSidePanel.module.css";
import queueStyles from "./StudioQueue.module.css";

/** The source's name as it reads on screen now: a radio is named from its
 *  filter, anything else by its label. Empty for a plain list of tracks. */
function useSourceName(): string {
  const { t } = useTranslation();
  const { queue, radio } = useStudioPlayer();
  const source = queue.source;
  if (!source || source.kind === "tracks") return "";
  const radioFilter = source.radioFilter ?? radio?.filter;
  if (source.kind === "radio" && radioFilter)
    return t(radioFilterLabelKey(radioFilter));
  return source.label;
}

/** "Playing from {source}", with the name as a link when the source has a
 *  page. It folds away for a plain list of tracks. */
function SidePanelSourceLine({ isShown }: { isShown: boolean }) {
  const { queue } = useStudioPlayer();
  const sourceName = useSourceName();
  const href = queue.source?.href ?? null;
  const sourceNode = href ? (
    <Link to={href} className={styles.sourceLink}>
      {sourceName}
    </Link>
  ) : (
    <span className={styles.sourceName}>{sourceName}</span>
  );
  return (
    <Collapse isOpen={isShown && sourceName !== ""}>
      <p className={styles.source}>
        <Translation
          i18nKey="studio:nowPlaying.playingFrom"
          slots={{ source: sourceNode }}
        />
      </p>
    </Collapse>
  );
}

/** The panel head: the heading that names the view (and the panel), the
 *  close button, and the source line for the Now playing view. */
function StudioSidePanelHead({
  view,
  headingId,
  headingRef,
  onClose,
}: {
  view: StudioSidePanelView;
  headingId: string;
  headingRef?: Ref<HTMLHeadingElement>;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const isNowPlaying = view === "nowPlaying";
  return (
    <div className={styles.head}>
      <div className={styles.headRow}>
        <h2
          id={headingId}
          ref={headingRef}
          tabIndex={-1}
          className={styles.heading}
        >
          {t(
            isNowPlaying
              ? "studio:nowPlaying.dialogLabel"
              : "studio:queue.heading",
          )}
        </h2>
        <IconButton
          className={queueStyles.control}
          aria-label={t(
            isNowPlaying ? "studio:nowPlaying.close" : "studio:queue.close",
          )}
          onClick={onClose}
        >
          <FiX aria-hidden />
        </IconButton>
      </div>
      <SidePanelSourceLine isShown={isNowPlaying} />
    </div>
  );
}

/** The view change: the old view leaves, then the new one rises in, the
 *  same motion as the phone Now playing panes. Under reduced motion the
 *  views swap at once. */
function useViewMotion() {
  const { reducedMotion } = useMotionPrefs();
  if (reducedMotion)
    return {
      initial: false,
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, transition: { duration: 0 } },
    } as const;
  return {
    initial: { opacity: 0, y: 6 },
    animate: { opacity: 1, y: 0, transition: STUDIO_FADE },
    exit: { opacity: 0, y: -6, transition: STUDIO_EXIT },
  } as const;
}

/**
 * The side panel's inside, for the floating card and the docked column:
 * the head, then a body that scrolls on its own and shows one view at a
 * time. The body starts back at the top once the views have swapped.
 * Open queue in the Now playing view switches to the queue and moves focus
 * to the heading, since the button it was on leaves with the view.
 */
export function StudioSidePanelBody({
  view,
  item,
  headingId,
  headingRef,
  onClose,
}: {
  view: StudioSidePanelView;
  item: StudioQueueItem;
  headingId: string;
  headingRef?: Ref<HTMLHeadingElement>;
  onClose: () => void;
}) {
  const surface = useStudioPlayerSurface();
  const viewMotion = useViewMotion();
  const bodyRef = useRef<HTMLDivElement>(null);
  const openQueue = () => {
    surface.openSidePanel("queue");
    document.getElementById(headingId)?.focus();
  };
  const scrollToTop = () => {
    if (bodyRef.current) bodyRef.current.scrollTop = 0;
  };
  return (
    <div className={styles.panel}>
      <StudioSidePanelHead
        view={view}
        headingId={headingId}
        headingRef={headingRef}
        onClose={onClose}
      />
      {/* The queue's own panelBody class keeps its group labels level with
          the heading, as in the floating card before. */}
      <div ref={bodyRef} className={queueStyles.panelBody}>
        <AnimatePresence
          mode="wait"
          initial={false}
          onExitComplete={scrollToTop}
        >
          {view === "nowPlaying" ? (
            <m.div
              key="nowPlaying"
              className={styles.nowPlaying}
              {...viewMotion}
            >
              <StudioNowPlayingView item={item} onOpenQueue={openQueue} />
            </m.div>
          ) : (
            <m.div key="queue" {...viewMotion}>
              <StudioQueueList headingLevel={3} />
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
