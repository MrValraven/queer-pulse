import { Button, Collapse } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { useStudioPlayer, type StudioQueueItem } from "../studioPlayerContext";
import { StudioPlayerArt } from "./StudioPlayerArt";
import { StudioNowCoverSwap, StudioNowTextSwap } from "./StudioPlayerNowSwap";
import {
  NEXT_UP_COVER_RADIUS,
  NEXT_UP_COVER_SIZE,
} from "./studioSidePanelSections.data";
import styles from "./StudioSidePanelSections.module.css";

/** The next item as one playable row: cover, title and artist. Cover and
 *  titles crossfade when the next item changes. */
function NextUpRow({
  item,
  onPlay,
}: {
  item: StudioQueueItem;
  onPlay: () => void;
}) {
  const { t } = useTranslation();
  return (
    <Button
      variant="quiet"
      className={styles.nextRow}
      aria-label={t("studio:sidePanel.playNextAria", {
        title: item.title,
        artist: item.artistName,
      })}
      onClick={onPlay}
    >
      <span className={styles.nextCover}>
        <StudioNowCoverSwap swapKey={item.queueEntryId}>
          <StudioPlayerArt
            item={item}
            size={NEXT_UP_COVER_SIZE}
            radius={NEXT_UP_COVER_RADIUS}
          />
        </StudioNowCoverSwap>
      </span>
      <span className={styles.nextTitles}>
        <StudioNowTextSwap swapKey={item.queueEntryId}>
          <span className={styles.nextTitle}>{item.title}</span>
          <span className={styles.nextArtist}>{item.artistName}</span>
        </StudioNowTextSwap>
      </span>
    </Button>
  );
}

/** Next in queue: the item that plays next (your queue first, then the
 *  source) under a head row with Open queue, which switches the panel to
 *  the queue. The section folds away at the end of the queue. */
export function StudioSidePanelNextUp({
  onOpenQueue,
}: {
  onOpenQueue: () => void;
}) {
  const { t } = useTranslation();
  const player = useStudioPlayer();
  const next: StudioQueueItem | undefined =
    player.queue.userItems[0] ?? player.queue.upcomingSourceItems[0];
  return (
    <Collapse isOpen={next !== undefined}>
      {next ? (
        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <h3 className={styles.sectionTitle}>
              {t("studio:sidePanel.nextInQueue")}
            </h3>
            <Button
              variant="quiet"
              size="sm"
              className={styles.sectionLink}
              onClick={onOpenQueue}
            >
              {t("studio:sidePanel.openQueue")}
            </Button>
          </div>
          <NextUpRow
            item={next}
            onPlay={() => player.playEntry(next.queueEntryId)}
          />
        </section>
      ) : null}
    </Collapse>
  );
}
