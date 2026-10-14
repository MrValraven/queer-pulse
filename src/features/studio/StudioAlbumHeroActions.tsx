import { FiCheck, FiHeart, FiPause, FiPlay, FiPlus } from "react-icons/fi";
import { useShareLink } from "../../shared/hooks";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioReleaseView } from "./api/studio.adapters";
import { useStudioHideExplicit } from "./api/useStudioPlaybackPreferences";
import { useStudioPlayer } from "./player/studioPlayerContext";
import { queueFromRelease } from "./player/studioQueue";
import { StudioAddToPlaylistButton } from "./StudioAddToPlaylistButton";
import { StudioNotifyMeButton } from "./StudioNotifyMeButton";
import { StudioReleaseOverflow } from "./StudioReleaseOverflow";
import { useStudioSaveToggle } from "./useStudioSaveToggle";
import { useStudioShowcase } from "./useStudioShowcase";
import styles from "./studio.module.css";
import releaseStyles from "./StudioRelease.module.css";

/** The hero's actions. Who sees what: an upcoming release's visitor gets
 *  Notify me and Share; a preview gets Play alone; a published release
 *  gets Save, Add to playlist, Tip (showcase only), Share and, for a
 *  visitor, Report. */
export function StudioAlbumHeroActions({
  release,
  previewToken,
  onTip,
  onReport,
}: {
  release: StudioReleaseView;
  previewToken?: string;
  onTip: () => void;
  onReport: () => void;
}) {
  const { t } = useTranslation();
  const player = useStudioPlayer();
  const isShowcase = useStudioShowcase();
  const { share } = useShareLink({
    copied: t("studio:detail.linkCopiedToast"),
    failed: t("studio:detail.copyFailedToast"),
  });
  const save = useStudioSaveToggle({
    savedId: release.savedId,
    kind: "studio_release",
    title: release.title,
    href: release.href,
    meta: release.artist.name,
  });
  const hideExplicit = useStudioHideExplicit();
  const isPreview = previewToken !== undefined || release.isPreview;
  const isPublished = release.status === "published";
  // A preview plays whatever its status: Notify me is for the release page,
  // and the owner of a scheduled release keeps Play.
  const isUpcomingForViewer =
    release.isUpcoming && !release.isOwner && !isPreview;
  const isCurrent = player.isCurrentRelease(release.id);
  const isPlaying = isCurrent && player.status === "playing";
  // The server refuses every stream on a taken-down release, owners included.
  const isStreamable = release.status !== "taken_down";
  // Play starts only the tracks with audio that the member has not hidden,
  // and has nothing to start when every one of them is hidden.
  const hiddenTrackIds = new Set(
    hideExplicit
      ? release.tracks
          .filter((track) => track.isExplicit)
          .map((track) => track.id)
      : [],
  );
  const audibleQueue = queueFromRelease(release, previewToken).filter(
    (item) => !hiddenTrackIds.has(item.trackId),
  );
  const hasHiddenAudibleTrack =
    audibleQueue.length < release.playableTrackCount;
  const isPlayBlocked = !isStreamable || audibleQueue.length === 0;
  const isPublicExtra = isPublished && !isPreview;

  function play() {
    if (isPlayBlocked) return;
    if (isCurrent) player.togglePlay();
    else if (isPreview || hasHiddenAudibleTrack)
      void player.playTracks(audibleQueue);
    else void player.playRelease(release.id);
  }

  return (
    <>
      {!isUpcomingForViewer && (
        <button
          type="button"
          className={`${styles.playBig} ${releaseStyles.heroPlay}`}
          aria-disabled={isPlayBlocked || undefined}
          aria-label={
            isPlaying
              ? t("studio:card.pauseRelease", { title: release.title })
              : t("studio:card.playRelease", { title: release.title })
          }
          onClick={play}
        >
          {isPlaying ? <FiPause aria-hidden /> : <FiPlay aria-hidden />}
        </button>
      )}
      {isUpcomingForViewer && (
        <StudioNotifyMeButton
          releaseId={release.id}
          releaseTitle={release.title}
          isSet={release.isReminderSet}
          isStatusReserved
        />
      )}
      {isPublicExtra && (
        <button
          type="button"
          aria-pressed={save.isSaved}
          aria-label={t(
            save.isSaved
              ? "studio:save.removeSavedCta"
              : "studio:save.saveReleaseCta",
            { title: release.title },
          )}
          onClick={save.toggle}
        >
          {save.isSaved ? <FiCheck aria-hidden /> : <FiPlus aria-hidden />}{" "}
          {save.isSaved
            ? t("studio:save.savedLabel")
            : t("studio:save.saveCta")}
        </button>
      )}
      {isPublicExtra && (
        <StudioAddToPlaylistButton
          trackIds={release.tracks
            .filter((track) => track.hasAudio)
            .map((track) => track.id)}
          subjectTitle={release.title}
          label={t("studio:playlist.add.releaseCta")}
        />
      )}
      {isShowcase && isPublicExtra && (
        <button type="button" className={styles.tip} onClick={onTip}>
          <FiHeart aria-hidden />{" "}
          {t("studio:detail.tipArtistCta", { artist: release.artist.name })}
        </button>
      )}
      {(isPublished || release.isUpcoming) && !isPreview && (
        <button type="button" onClick={() => void share(window.location.href)}>
          {t("studio:detail.shareCta")}
        </button>
      )}
      {/* The server accepts a report on a published or scheduled release
          (granted members see a scheduled release's title, cover and
          description). A preview has no public page, and an artist does not
          report their own release. */}
      {(isPublished || release.isUpcoming) &&
        !isPreview &&
        !release.isOwner && <StudioReleaseOverflow onReport={onReport} />}
    </>
  );
}
