import { Link } from "react-router-dom";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { useStudioTrack } from "../../api/useStudioTrack";
import { StudioLikeButton } from "../../StudioLikeButton";
import type { StudioLikeSubject } from "../../useStudioLike";
import type { StudioQueueItem } from "../studioPlayerContext";
import { StudioPlayerArt } from "./StudioPlayerArt";
import {
  StudioNowCoverSwap,
  StudioNowSaveSlot,
  StudioNowTextSwap,
} from "./StudioPlayerNowSwap";
import { StudioTrackMenu } from "./StudioTrackMenu";
import {
  studioTrackMenuTrackOf,
  studioTrackMenuTrackOfQueueItem,
} from "./studioTrackMenuTrack";
import { TRACK_HEADER_COVER_RADIUS } from "./studioSidePanelSections.data";
import styles from "./StudioSidePanelSections.module.css";

/** Like and the track menu for a public track. The menu starts from the
 *  queue item and takes the track's detail once it answers, the same read
 *  the credits make, so Report knows whether the release is out. */
function TrackHeaderActions({ item }: { item: StudioQueueItem }) {
  const { t } = useTranslation();
  const { track } = useStudioTrack(item.trackId);
  const likeSubject: StudioLikeSubject = {
    trackId: item.trackId,
    title: item.title,
    href: item.trackHref,
    artistName: item.artistName,
  };
  const menuTrack =
    track && track.id === item.trackId
      ? studioTrackMenuTrackOf(track)
      : studioTrackMenuTrackOfQueueItem(item);
  return (
    <>
      <StudioLikeButton
        subject={likeSubject}
        className={styles.headerAction}
        hasTooltip
      />
      <StudioTrackMenu
        track={menuTrack}
        className={styles.headerMenu}
        tooltip={t("studio:release.moreActions")}
      />
    </>
  );
}

/** The side panel's track header: a square cover (the tint fallback when
 *  the item has no art), the title linking to the track and the artist
 *  linking to the artist, then Like and the track menu. It shows a warned
 *  track the way the player bar does. A private preview shows plain text
 *  and offers neither Like nor the menu, since its pages are closed to
 *  visitors. Cover and titles crossfade on a track change, keyed like the
 *  bar. */
export function StudioSidePanelTrackHeader({
  item,
}: {
  item: StudioQueueItem;
}) {
  const isPreview = Boolean(item.previewToken);
  const swapKey = `${item.trackId}-${isPreview ? "preview" : "track"}`;
  return (
    <div className={styles.header}>
      <div className={styles.cover}>
        <StudioNowCoverSwap swapKey={item.trackId}>
          <StudioPlayerArt
            item={item}
            fill
            radius={TRACK_HEADER_COVER_RADIUS}
          />
        </StudioNowCoverSwap>
      </div>
      <div className={styles.headerRow}>
        <div className={styles.headerTitles}>
          <StudioNowTextSwap swapKey={swapKey}>
            {isPreview ? (
              <>
                <span className={styles.headerTitle}>{item.title}</span>
                <span className={styles.headerArtist}>{item.artistName}</span>
              </>
            ) : (
              <>
                <Link to={item.trackHref} className={styles.headerTitle}>
                  {item.title}
                </Link>
                <Link to={item.artistHref} className={styles.headerArtist}>
                  {item.artistName}
                </Link>
              </>
            )}
          </StudioNowTextSwap>
        </div>
        {/* Like and the menu share one slot, so they fade together when the
            track turns into a private preview or back. */}
        <StudioNowSaveSlot isShown={!isPreview}>
          <TrackHeaderActions item={item} />
        </StudioNowSaveSlot>
      </div>
    </div>
  );
}
