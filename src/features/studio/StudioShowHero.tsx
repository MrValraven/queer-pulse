import { Link } from "react-router-dom";
import { AnimatePresence, m } from "motion/react";
import { FiCheck, FiPause, FiPlay, FiPlus } from "react-icons/fi";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { ImageSlot } from "../../shared/components/ui";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { SubprofileFollow } from "../subprofiles/SubprofileFollow";
import type { StudioReleaseView } from "./api/studio.adapters";
import type { StudioEpisodeRowView } from "./api/studioEpisodes";
import { useStudioArtist } from "./api/useStudioArtist";
import { playEpisode } from "./player/studioEpisodePlay";
import { useStudioPlayer } from "./player/studioPlayerContext";
import { queueItemFromEpisode, showQueueSource } from "./player/studioQueue";
import { StudioReleaseClaimPanels } from "./StudioClaimPanels";
import { StudioDetailHero } from "./StudioDetailHero";
import { StudioNotifyMeButton } from "./StudioNotifyMeButton";
import { StudioReleaseDisputePanel } from "./StudioReleaseDisputePanel";
import { StudioReleaseOverflow } from "./StudioReleaseOverflow";
import { StudioShareMenu } from "./share/StudioShareMenu";
import { outDateOf } from "./studioUpcoming";
import { useStudioSaveToggle } from "./useStudioSaveToggle";
import styles from "./studio.module.css";
import releaseStyles from "./StudioRelease.module.css";

/** The show's hero (spec 5.2): Play latest episode, Follow (the persona),
 *  Save, Share, and Report for a listener on a live show. A scheduled show
 *  gives its visitors Notify me in place of Play and names no episode count
 *  (its episodes go live at the drop). */
export function StudioShowHero({
  release,
  latest,
  publishedCount,
  onReport,
}: {
  release: StudioReleaseView;
  latest: StudioEpisodeRowView | null;
  publishedCount: number;
  onReport: () => void;
}) {
  const { t } = useTranslation();
  const formatters = useFormat();
  const { reducedMotion } = useMotionPrefs();
  const player = useStudioPlayer();
  const { artist } = useStudioArtist(release.artist.id, { isSilent: true });
  const save = useStudioSaveToggle({
    savedId: release.savedId,
    kind: "studio_release",
    title: release.title,
    href: release.href,
    meta: t("studio:show.savedMeta", { artist: release.artist.name }),
  });
  const isPublished = release.status === "published";
  const isUpcomingForViewer =
    release.isUpcoming && !release.isOwner && !release.isPreview;
  const outLine = release.isUpcoming
    ? outDateOf(release.publishAt, formatters)
    : null;
  const isLatestCurrent = latest !== null && player.isCurrentTrack(latest.id);
  const isPlaying = isLatestCurrent && player.status === "playing";
  const isPlayBlocked = latest === null || release.status === "taken_down";
  const isShareable = isPublished || release.isUpcoming;

  return (
    <>
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
        kind={
          release.isUpcoming
            ? t("studio:releaseType.podcast")
            : t("studio:show.kindLine", { count: publishedCount })
        }
        title={release.title}
        by={
          <>
            {t("studio:release.by")}{" "}
            <Link to={release.artist.href}>
              <strong>{release.artist.name}</strong>
            </Link>
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
                {outLine && <span>{t("studio:upcoming.outOn", outLine)}</span>}
              </span>
            )}
          </>
        }
        actions={
          <>
            {isUpcomingForViewer ? (
              <StudioNotifyMeButton
                releaseId={release.id}
                releaseTitle={release.title}
                isSet={release.isReminderSet}
                isStatusReserved
              />
            ) : (
              <button
                type="button"
                className={`${styles.playBig} ${releaseStyles.heroPlay}`}
                aria-disabled={isPlayBlocked || undefined}
                aria-label={t(
                  isPlaying
                    ? "studio:show.pauseLatestCta"
                    : "studio:show.playLatestCta",
                )}
                onClick={() => {
                  if (isPlayBlocked || !latest) return;
                  if (isLatestCurrent) player.togglePlay();
                  else
                    void playEpisode(
                      player,
                      queueItemFromEpisode(latest, release),
                      showQueueSource(release),
                    );
                }}
              >
                {isPlaying ? <FiPause aria-hidden /> : <FiPlay aria-hidden />}
              </button>
            )}
            <AnimatePresence initial={false}>
              {artist && (
                <m.span
                  key="follow"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: reducedMotion ? 0 : 0.18 }}
                >
                  <SubprofileFollow
                    subprofileId={release.artist.id}
                    followerCount={artist.followerCount}
                    viewerFollowing={artist.isFollowing}
                    isOwnerViewing={artist.isOwner}
                  />
                </m.span>
              )}
            </AnimatePresence>
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
                {save.isSaved ? (
                  <FiCheck aria-hidden />
                ) : (
                  <FiPlus aria-hidden />
                )}{" "}
                {save.isSaved
                  ? t("studio:save.savedLabel")
                  : t("studio:save.saveCta")}
              </button>
            )}
            {isShareable && (
              <StudioShareMenu
                target={{
                  kind: "release",
                  id: release.id,
                  startAtSeconds: null,
                }}
                title={release.title}
                triggerLabel={t("studio:detail.shareCta")}
              />
            )}
            {isShareable && !release.isOwner && (
              <StudioReleaseOverflow onReport={onReport} />
            )}
          </>
        }
      />
      <StudioReleaseDisputePanel release={release} />
      {/* Studio safety: the owner's copyright claims, beside the dispute. */}
      <StudioReleaseClaimPanels release={release} />
    </>
  );
}
