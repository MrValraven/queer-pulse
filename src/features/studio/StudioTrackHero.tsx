import type { Ref } from "react";
import { FiGift } from "react-icons/fi";
import { Button, IconButton, Tooltip } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import type { StudioTrackView } from "./api/studio.adapters";
import { StudioPlayButton } from "./kit/StudioPlayButton";
import { StudioTrackMenu } from "./player/ui/StudioTrackMenu";
import { studioTrackMenuTrackOf } from "./player/ui/studioTrackMenuTrack";
import { StudioAddToPlaylistButton } from "./StudioAddToPlaylistButton";
import { StudioDetailHero } from "./StudioDetailHero";
import { StudioHeroShare } from "./StudioHeroShare";
import { StudioHiddenTrackNote } from "./StudioHiddenTrack";
import { StudioLikeButton } from "./StudioLikeButton";
import { StudioTrackByline } from "./StudioTrackByline";
import hiddenCss from "./StudioHiddenTrack.module.css";
import heroStyles from "./StudioTrackHero.module.css";
import {
  useIsHeroActionsCompact,
  useIsHeroShareFolded,
} from "./studioHeroLayout";
import {
  StudioFoldedShareItemsContext,
  useStudioFoldedShareItems,
} from "./useStudioFoldedShareItem";
import { useStudioLikeBlockedReason } from "./useStudioLikeBlockedReason";
import { useStudioShowcase } from "./useStudioShowcase";
import { useStudioTrackPlay } from "./useStudioTrackPlay";
import ss from "./studio.module.css";
import { StudioReleaseCoverArt } from "./StudioReleaseCoverArt";

const QUICK_TIP_AMOUNT = 2;

/** The track hero on the shared detail scaffold: the release cover, "Track
 *  3 of 11", the title and credit, then Play, Like, Add to playlist, Tip
 *  (showcase), Share and the track menu, which stays last. Below 1280px the
 *  actions after Play are icons ("Play from {time}" keeps its words), and
 *  below 1440px Share folds into the track menu with every way to share. */
export function StudioTrackHero({
  track,
  onTip,
  sentinelRef,
}: {
  track: StudioTrackView;
  onTip: () => void;
  /** The marker the page's sticky header watches. */
  sentinelRef?: Ref<HTMLDivElement>;
}) {
  const { t } = useTranslation();
  const formatters = useFormat();
  const isShowcase = useStudioShowcase();
  const isCompact = useIsHeroActionsCompact();
  const isShareFolded = useIsHeroShareFolded();
  const isPublished = track.release.publishedAt !== null;
  const foldedShare = useStudioFoldedShareItems(
    isPublished && isShareFolded
      ? {
          target: { kind: "track", id: track.id, startAtSeconds: null },
          title: track.title,
        }
      : undefined,
  );
  const play = useStudioTrackPlay(track);
  const likeSubject = {
    trackId: track.id,
    title: track.title,
    href: track.href,
    artistName: track.release.artist.name,
  };
  const likeBlockedReason = useStudioLikeBlockedReason(
    likeSubject,
    track.isReleaseWithdrawn,
  );
  // A heart only where the track can be played: a live release (publishedAt
  // is null for a draft or a scheduled release) and an uploaded audio file.
  // The owner reads those tracks here too, and a like would land in Liked
  // songs as No longer available.
  const isLikeable = isPublished && track.hasAudio;
  const addLabel = t("studio:playlist.add.trackCta");
  const tipLabel = t("studio:player.tipCta", {
    amount: formatters.currency(QUICK_TIP_AMOUNT),
  });
  const isShareInRow = isPublished && !isShareFolded;
  // Add to playlist joins the menu's group when nothing else would.
  const isAddGrouped = !isShowcase && !isShareInRow;
  const addButton = (
    <Tooltip label={addLabel} placement="top" isDisabled={!isCompact}>
      <StudioAddToPlaylistButton
        trackIds={track.hasAudio ? [track.id] : []}
        subjectTitle={track.title}
        label={isCompact ? undefined : addLabel}
        ariaLabel={
          isCompact
            ? t("studio:playlist.add.trackAria", { title: track.title })
            : undefined
        }
        likeSubject={
          isLikeable && !track.isReleaseWithdrawn ? likeSubject : undefined
        }
      />
    </Tooltip>
  );

  return (
    <StudioDetailHero
      className={[ss.detailHeroUnderCrumb, play.isHidden && hiddenCss.hidden]
        .filter(Boolean)
        .join(" ")}
      tint={track.release.tint}
      sentinelRef={sentinelRef}
      isActionsCompact={isCompact}
      art={
        <StudioReleaseCoverArt
          src={track.release.coverUrl}
          title={track.release.title}
          format={track.release.format}
          tint={track.release.tint}
          radius={16}
          isPriority
        />
      }
      kind={t("studio:track.hero.eyebrow", {
        current: track.position,
        total: track.release.trackCount,
      })}
      title={track.title}
      by={
        <>
          <StudioTrackByline track={track} />
          {track.durationLabel && ` · ${track.durationLabel}`}
          {(track.isExplicit || play.isHidden) && (
            <span className={ss.stats}>
              {track.isExplicit && <span>{t("studio:release.explicit")}</span>}
              {play.isHidden && <StudioHiddenTrackNote />}
            </span>
          )}
        </>
      }
      actions={
        <>
          {!play.isHidden && (
            // On a phone the blocked reason leaves the row (still read
            // through aria-describedby) and shows as the tooltip instead.
            <Tooltip
              label={play.blockedReason ?? play.label}
              placement="top"
              isDisabled={!isCompact || play.blockedReason === undefined}
            >
              <StudioPlayButton
                state={play.state}
                onToggle={play.toggle}
                label={play.label}
                blockedReason={play.blockedReason}
              />
            </Tooltip>
          )}
          {play.startLabel && (
            <span
              className={heroStyles.playFromLabel}
              data-hero-play-from=""
              aria-hidden="true"
            >
              {t("studio:player.playFrom", { time: play.startLabel })}
            </span>
          )}
          {isLikeable && (
            <Tooltip
              label={likeBlockedReason ?? t("studio:like.cta")}
              placement="top"
              isDisabled={!isCompact && !likeBlockedReason}
            >
              <StudioLikeButton
                subject={likeSubject}
                variant={isCompact ? "icon" : "labelled"}
                blockedReason={likeBlockedReason}
              />
            </Tooltip>
          )}
          {!isAddGrouped && addButton}
          {/* The menu wraps with the action before it, never alone. */}
          <div className={ss.heroActionGroup}>
            {isAddGrouped && addButton}
            {isShowcase &&
              (isCompact ? (
                <IconButton
                  aria-label={tipLabel}
                  tooltip
                  tooltipPlacement="top"
                  className={ss.tip}
                  onClick={onTip}
                >
                  <FiGift aria-hidden />
                </IconButton>
              ) : (
                <Button variant="quiet" className={ss.tip} onClick={onTip}>
                  <FiGift aria-hidden />
                  {tipLabel}
                </Button>
              ))}
            {isShareInRow && (
              <StudioHeroShare
                target={{ kind: "track", id: track.id, startAtSeconds: null }}
                title={track.title}
                isIconOnly={isCompact}
              />
            )}
            <StudioFoldedShareItemsContext value={foldedShare.items}>
              <Tooltip
                label={t("studio:release.moreActions")}
                placement="top"
                align="end"
              >
                <StudioTrackMenu
                  className={heroStyles.heroMenu}
                  track={studioTrackMenuTrackOf(track)}
                />
              </Tooltip>
            </StudioFoldedShareItemsContext>
          </div>
          {foldedShare.dialog}
        </>
      }
    />
  );
}
