import { useId, useState } from "react";
import { useQueries } from "@tanstack/react-query";
import { AnimatePresence, m } from "motion/react";
import { FiChevronDown, FiCornerDownRight, FiTrash2 } from "react-icons/fi";
import { useDemoMode } from "../../../../app/providers/DemoModeProvider";
import { useMotionPrefs } from "../../../../app/providers/motionPrefs";
import { useToast } from "../../../../shared/components/feedback/useToast";
import { Button, Collapse } from "../../../../shared/components/ui";
import { IconButton } from "../../../../shared/components/ui/IconButton";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type { StudioTrackView } from "../../api/studio.adapters";
import { studioTrackQueryOptions } from "../../api/studioTrackQuery";
import { useStudioAccess } from "../../api/useStudioAccess";
import { studioErrorMessageKeyOf } from "../../studioErrors.data";
import {
  STUDIO_EXIT,
  STUDIO_FADE,
  studioStaggerDelay,
} from "../../studioMotion";
import { useStudioPlayer } from "../studioPlayerContext";
import { queueItemFromTrackView } from "../studioQueue";
import { takeLastQueueFailure } from "../studioQueueActions";
import { useStudioRecentlyPlayed } from "../useStudioRecentlyPlayed";
import { QueueRowSummary } from "./StudioQueueRow";
import styles from "./StudioQueue.module.css";

/** The newest plays the section reads, so an open fold asks a bounded set
 *  of track reads (most are cached from when they played). */
const PLAYED_ROW_LIMIT = 20;

/** Each played track through the single-track read the player uses, only
 *  while the fold is open. A track that fails to read drops out. */
function usePlayedTracks(trackIds: readonly string[], isEnabled: boolean) {
  const { demoMode } = useDemoMode();
  const { hasAccess } = useStudioAccess();
  const results = useQueries({
    queries: trackIds.map((trackId) => ({
      ...studioTrackQueryOptions(demoMode, trackId),
      enabled: isEnabled && (demoMode || hasAccess),
      meta: { silentError: true },
    })),
  });
  return results.flatMap((result) => (result.data ? [result.data] : []));
}

/** One played track, with Play next: it lines up after the current track
 *  and leaves the queue as it is. */
function PlayedRow({
  track,
  index,
}: {
  track: StudioTrackView;
  index: number;
}) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const { showToast } = useToast();
  const player = useStudioPlayer();
  const item = { ...queueItemFromTrackView(track), queueEntryId: track.id };
  return (
    <m.div
      role="listitem"
      className={`${styles.row} ${styles.playedRow}`}
      initial={{ opacity: 0, y: reducedMotion ? 0 : 6 }}
      animate={{
        opacity: 1,
        y: 0,
        transition: { ...STUDIO_FADE, delay: studioStaggerDelay(index) },
      }}
      exit={{ opacity: 0, transition: STUDIO_EXIT }}
    >
      <span className={styles.playedSummary}>
        <QueueRowSummary item={item} />
      </span>
      <IconButton
        className={styles.control}
        aria-label={t("studio:queue.playedPlayNext", { title: track.title })}
        tooltip={t("studio:trackMenu.playNext")}
        onClick={() => {
          void player.playNext(track.id).then((isQueued) => {
            if (isQueued) {
              showToast(t("studio:trackMenu.playingNextToast"), "success");
              return;
            }
            // A read that failed names its reason (offline, access, gone).
            const failure = takeLastQueueFailure();
            const reasonKey =
              failure === null || failure === undefined
                ? "studio:trackMenu.queueFailedToast"
                : studioErrorMessageKeyOf(failure, "queue");
            showToast(t(reasonKey), "error");
          });
        }}
      >
        <FiCornerDownRight aria-hidden />
      </IconButton>
    </m.div>
  );
}

/** "Played": the tracks this device played lately (PRD-18), folded until
 *  opened. Kept on this device only, never sent anywhere; Clear played
 *  wipes it here, as Studio settings does. Hidden while the list is empty
 *  or Recently played is off. */
export function StudioQueuePlayed({
  headingLevel,
  onBeforeClear,
}: {
  headingLevel: 2 | 3;
  /** Moves focus out of the section before Clear played folds it away. */
  onBeforeClear: () => void;
}) {
  const { t } = useTranslation();
  const { entries, clear } = useStudioRecentlyPlayed();
  const { currentItem } = useStudioPlayer();
  const [isOpen, setIsOpen] = useState(false);
  const headingId = useId();
  const listId = useId();
  // A track that has played 30s joins the list while it still plays; it
  // shows under Played only once it is no longer the current one.
  const playedEntries = entries.filter(
    (entry) => entry.trackId !== currentItem?.trackId,
  );
  const trackIds = playedEntries
    .slice(0, PLAYED_ROW_LIMIT)
    .map((entry) => entry.trackId);
  const tracks = usePlayedTracks(trackIds, isOpen);
  const Heading = headingLevel === 2 ? "h2" : "h3";
  return (
    <Collapse isOpen={playedEntries.length > 0}>
      <section className={styles.group} aria-labelledby={headingId}>
        <div className={styles.groupHead}>
          <Heading id={headingId} className={styles.groupHeading}>
            {t("studio:queue.played")}
          </Heading>
          <span className={styles.playedTools}>
            <AnimatePresence initial={false}>
              {isOpen && (
                <m.span
                  key="clear-played"
                  className={styles.clearSlot}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, transition: STUDIO_FADE }}
                  exit={{ opacity: 0, transition: STUDIO_EXIT }}
                >
                  <IconButton
                    className={`${styles.control} ${styles.clearPlayed}`}
                    aria-label={t("studio:queue.clearPlayed")}
                    tooltip
                    onClick={() => {
                      onBeforeClear();
                      clear();
                      setIsOpen(false);
                    }}
                  >
                    <FiTrash2 aria-hidden />
                  </IconButton>
                </m.span>
              )}
            </AnimatePresence>
            <Button
              variant="quiet"
              size="sm"
              className={styles.foldToggle}
              aria-expanded={isOpen}
              aria-controls={isOpen ? listId : undefined}
              onClick={() => setIsOpen((wasOpen) => !wasOpen)}
            >
              {t(
                isOpen ? "studio:queue.hidePlayed" : "studio:queue.showPlayed",
                {
                  count: trackIds.length,
                },
              )}
              <FiChevronDown aria-hidden className={styles.foldIcon} />
            </Button>
          </span>
        </div>
        <Collapse isOpen={isOpen}>
          <div
            id={listId}
            role="list"
            aria-labelledby={headingId}
            className={styles.rows}
          >
            <AnimatePresence initial={false}>
              {tracks.map((track, index) => (
                <PlayedRow key={track.id} track={track} index={index} />
              ))}
            </AnimatePresence>
          </div>
        </Collapse>
      </section>
    </Collapse>
  );
}
