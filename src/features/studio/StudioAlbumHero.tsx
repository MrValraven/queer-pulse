import { Link } from "react-router-dom";
import { FiCheck, FiHeart, FiPause, FiPlay, FiPlus } from "react-icons/fi";
import { ImageSlot } from "../../shared/components/ui";
import { useShareLink } from "../../shared/hooks";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioReleaseView } from "./api/studio.adapters";
import { useStudioPlayer } from "./player/studioPlayerContext";
import { StudioAddToPlaylistButton } from "./StudioAddToPlaylistButton";
import { StudioDetailHero } from "./StudioDetailHero";
import { StudioReleaseOverflow } from "./StudioReleaseOverflow";
import { releaseFactsLine } from "./studioFacts";
import { useStudioSaveToggle } from "./useStudioSaveToggle";
import { useStudioShowcase } from "./useStudioShowcase";
import styles from "./studio.module.css";
import releaseStyles from "./StudioRelease.module.css";

export function StudioAlbumHero({
  release,
  onTip,
  onReport,
}: {
  release: StudioReleaseView;
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
  const isCurrent = player.isCurrentRelease(release.id);
  const isPlaying = isCurrent && player.status === "playing";
  const isPublished = release.status === "published";
  // The server refuses every stream on a taken-down release, owners included.
  const isStreamable = release.status !== "taken_down";
  const isPlayBlocked = !isStreamable || release.playableTrackCount === 0;

  return (
    <StudioDetailHero
      art={
        <ImageSlot
          src={release.coverUrl ?? undefined}
          tint={release.tint}
          width="100%"
          height="100%"
          radius={16}
          placeholder={
            release.status === "taken_down"
              ? ""
              : `${t("studio:media.coverLabel")} · ${release.title}`
          }
          style={{ position: "absolute", inset: 0 }}
          loading="eager"
          fetchPriority="high"
        />
      }
      kind={releaseFactsLine(release, t)}
      title={release.title}
      by={
        <>
          {t("studio:release.by")}{" "}
          <Link to={release.artist.href}>
            <strong>{release.artist.name}</strong>
          </Link>
          {release.releaseYear && ` · ${release.releaseYear}`}
          {release.genreLabelKey && ` · ${t(release.genreLabelKey)}`}
          {!isPublished && (
            <span className={releaseStyles.statusLine}>
              <strong className={releaseStyles.statusLabel}>
                {t(release.statusLabelKey)}
              </strong>
              {release.status === "taken_down" && release.takedownReason && (
                <span>
                  {t("studio:owner.takedownReason", {
                    reason: release.takedownReason,
                  })}
                </span>
              )}
            </span>
          )}
        </>
      }
      actions={
        <>
          <button
            type="button"
            className={`${styles.playBig} ${releaseStyles.heroPlay}`}
            aria-disabled={isPlayBlocked || undefined}
            aria-label={
              isPlaying
                ? t("studio:card.pauseRelease", { title: release.title })
                : t("studio:card.playRelease", { title: release.title })
            }
            onClick={() => {
              if (isPlayBlocked) return;
              if (isCurrent) player.togglePlay();
              else void player.playRelease(release.id);
            }}
          >
            {isPlaying ? <FiPause aria-hidden /> : <FiPlay aria-hidden />}
          </button>
          {isPublished && (
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
          {isPublished && (
            <StudioAddToPlaylistButton
              trackIds={release.tracks
                .filter((track) => track.hasAudio)
                .map((track) => track.id)}
              subjectTitle={release.title}
              label={t("studio:playlist.add.releaseCta")}
            />
          )}
          {isShowcase && isPublished && (
            <button type="button" className={styles.tip} onClick={onTip}>
              <FiHeart aria-hidden />{" "}
              {t("studio:detail.tipArtistCta", { artist: release.artist.name })}
            </button>
          )}
          {isPublished && (
            <button
              type="button"
              onClick={() => void share(window.location.href)}
            >
              {t("studio:detail.shareCta")}
            </button>
          )}
          {/* Filing needs a published release (the server 404s anything else),
              and an artist does not report their own release. */}
          {isPublished && !release.isOwner && (
            <StudioReleaseOverflow onReport={onReport} />
          )}
        </>
      }
    />
  );
}
