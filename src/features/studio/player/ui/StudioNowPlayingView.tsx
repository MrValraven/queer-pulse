import { AnimatePresence, m } from "motion/react";
import { useMotionPrefs } from "../../../../app/providers/motionPrefs";
import { STUDIO_EXIT, STUDIO_FADE } from "../../studioMotion";
import type { StudioQueueItem } from "../studioPlayerContext";
import { useStudioNowPlayingArtist } from "../useStudioNowPlayingArtist";
import { StudioNowPlayingAbout } from "./StudioNowPlayingAbout";
import { StudioNowPlayingArtistExtras } from "./StudioNowPlayingArtistExtras";
import { StudioSidePanelCredits } from "./StudioNowPlayingCredits";
import { StudioSidePanelNextUp } from "./StudioSidePanelNextUp";
import { StudioSidePanelTrackHeader } from "./StudioSidePanelTrackHeader";
import styles from "./StudioSidePanel.module.css";

/** One track's sections, top to bottom: the track header, About, Credits,
 *  Next in queue, then the artist's events, support links and more
 *  releases. The artist is read once here for About and the extras; each
 *  section folds away on its own when it has nothing to show. */
function NowPlayingSections({
  item,
  onOpenQueue,
}: {
  item: StudioQueueItem;
  onOpenQueue: () => void;
}) {
  const artistState = useStudioNowPlayingArtist(item);
  return (
    <>
      <StudioSidePanelTrackHeader item={item} />
      {/* The About card brings no top space of its own; its 20px slot
          opens and folds inside About's own Collapse. */}
      <StudioNowPlayingAbout
        item={item}
        artistState={artistState}
        slotClassName={styles.aboutSlot}
      />
      <StudioSidePanelCredits item={item} />
      <StudioSidePanelNextUp onOpenQueue={onOpenQueue} />
      <StudioNowPlayingArtistExtras item={item} artistState={artistState} />
    </>
  );
}

/**
 * The side panel's Now playing view. The whole view crossfades when the
 * track changes: the old track's sections fade out, then the new track's
 * fade in. Under reduced motion the new track shows at once.
 */
export function StudioNowPlayingView({
  item,
  onOpenQueue,
}: {
  item: StudioQueueItem;
  onOpenQueue: () => void;
}) {
  const { reducedMotion } = useMotionPrefs();
  const fade = reducedMotion
    ? {
        initial: false,
        animate: { opacity: 1 },
        exit: { opacity: 0, transition: { duration: 0 } },
      }
    : {
        initial: { opacity: 0 },
        animate: { opacity: 1, transition: STUDIO_FADE },
        exit: { opacity: 0, transition: STUDIO_EXIT },
      };
  return (
    <AnimatePresence mode="wait" initial={false}>
      <m.div key={item.trackId} {...fade}>
        <NowPlayingSections item={item} onOpenQueue={onOpenQueue} />
      </m.div>
    </AnimatePresence>
  );
}
