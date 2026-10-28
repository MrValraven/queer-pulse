import { Link } from "react-router-dom";
import { AnimatePresence, m } from "motion/react";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { SubprofileFollow } from "../subprofiles/SubprofileFollow";
import type { StudioReleaseView } from "./api/studio.adapters";
import type { StudioEpisodeRowView } from "./api/studioEpisodes";
import { useStudioArtist } from "./api/useStudioArtist";
import { StudioPlayButton } from "./kit/StudioPlayButton";
import { playEpisode } from "./player/studioEpisodePlay";
import { useStudioPlayer } from "./player/studioPlayerContext";
import { queueItemFromEpisode, showQueueSource } from "./player/studioQueue";
import { StudioReleaseClaimPanels } from "./StudioClaimPanels";
import { StudioReleaseLikeButton } from "./StudioCollectionLikeButton";
import { StudioDetailHero } from "./StudioDetailHero";
import { StudioNotifyMeButton } from "./StudioNotifyMeButton";
import { StudioReleaseDisputePanel } from "./StudioReleaseDisputePanel";
import { StudioHeroShare } from "./StudioHeroShare";
import { StudioReleaseOverflow } from "./StudioReleaseOverflow";
import {
  useIsHeroActionsCompact,
  useIsHeroShareFolded,
} from "./studioHeroLayout";
import { outDateOf } from "./studioUpcoming";
import { STUDIO_EXIT, STUDIO_FADE } from "./studioMotion";
import releaseStyles from "./StudioRelease.module.css";
import ss from "./studio.module.css";
import { StudioReleaseCoverArt } from "./StudioReleaseCoverArt";

/** The show's hero (spec 5.2): Play latest episode, Follow (the persona),
 *  the heart, Share, and Report for a listener on a live show. A scheduled
 *  show gives its visitors Notify me in place of Play and names no episode
 *  count (its episodes go live at the drop). The heart likes the show into
 *  the library; it keeps one name ("Like {title}") and aria-pressed
 *  carries its state, as the track heart does. The overflow
 *  queues every published episode, oldest first. On a phone every action
 *  after Play is a round icon with a tooltip, as on the other heroes, and
 *  below 1440px a listener's Share folds into the overflow. */
export function StudioShowHero({
  release,
  latest,
  publishedCount,
  playableEpisodeIds,
  onReport,
}: {
  release: StudioReleaseView;
  latest: StudioEpisodeRowView | null;
  publishedCount: number;
  /** The published episodes with audio, oldest first. */
  playableEpisodeIds: string[];
  onReport: () => void;
}) {
  const { t } = useTranslation();
  const formatters = useFormat();
  const { reducedMotion } = useMotionPrefs();
  const player = useStudioPlayer();
  const { artist } = useStudioArtist(release.artist.id, { isSilent: true });
  const isCompact = useIsHeroActionsCompact();
  // The owner has no overflow, so their Share stays in the row.
  const isShareInMenu = useIsHeroShareFolded() && !release.isOwner;
  const shareTarget = {
    kind: "release",
    id: release.id,
    startAtSeconds: null,
  } as const;
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
        isActionsCompact={isCompact}
        art={
          <StudioReleaseCoverArt
            src={release.coverUrl}
            title={release.title}
            format={release.format}
            tint={release.tint}
            radius={16}
            isPriority
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
              <StudioPlayButton
                state={
                  isPlayBlocked ? "blocked" : isPlaying ? "playing" : "idle"
                }
                blockedReason={
                  release.status === "taken_down"
                    ? t("studio:show.takenDownReason")
                    : isPlayBlocked
                      ? t("studio:show.nothingToPlay")
                      : undefined
                }
                label={t(
                  isPlaying
                    ? "studio:show.pauseLatestCta"
                    : "studio:show.playLatestCta",
                )}
                onToggle={() => {
                  if (!latest) return;
                  if (isLatestCurrent) player.togglePlay();
                  else
                    void playEpisode(
                      player,
                      queueItemFromEpisode(latest, release),
                      showQueueSource(release),
                    );
                }}
              />
            )}
            <AnimatePresence initial={false}>
              {artist && (
                <m.span
                  key="follow"
                  className={ss.heroLabelled}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{
                    opacity: 0,
                    transition: reducedMotion
                      ? { duration: 0.12 }
                      : STUDIO_EXIT,
                  }}
                  transition={reducedMotion ? { duration: 0.12 } : STUDIO_FADE}
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
              <StudioReleaseLikeButton
                release={release}
                isIconOnly={isCompact}
                meta={t("studio:show.savedMeta", {
                  artist: release.artist.name,
                })}
              />
            )}
            {isShareable && !isShareInMenu && (
              <StudioHeroShare
                target={shareTarget}
                title={release.title}
                isIconOnly={isCompact}
              />
            )}
            {isShareable && !release.isOwner && (
              <StudioReleaseOverflow
                onReport={onReport}
                trackIds={isPublished ? playableEpisodeIds : undefined}
                href={release.href}
                artistHref={release.artist.href}
                share={
                  isShareInMenu
                    ? { target: shareTarget, title: release.title }
                    : undefined
                }
              />
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
