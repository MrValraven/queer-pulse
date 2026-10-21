import type { Ref } from "react";
import { FiGift } from "react-icons/fi";
import { Button, IconButton, Tooltip } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
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
import hiddenCss from "./StudioHiddenTrack.module.css";
import heroStyles from "./StudioTrackHero.module.css";
import { useIsHeroCompact } from "./studioHeroLayout";
import { useStudioShowcase } from "./useStudioShowcase";
import { useStudioTrackPlay } from "./useStudioTrackPlay";
import ss from "./studio.module.css";
import { StudioReleaseCoverArt } from "./StudioReleaseCoverArt";

const QUICK_TIP_AMOUNT = 2;

/** The track hero on the shared detail scaffold: the release cover, "Track
 *  3 of 11", the title and credit, then Play, Like, Add to playlist, Share
 *  and the track menu. On a phone the actions after Play are icons. */
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
  const isCompact = useIsHeroCompact();
  const play = useStudioTrackPlay(track);
  const likeSubject = {
    trackId: track.id,
    title: track.title,
    href: track.href,
    artistName: track.release.artist.name,
  };
  // A heart only where the track can be played: a live release (publishedAt
  // is null for a draft or a scheduled release) and an uploaded audio file.
  // The owner reads those tracks here too, and a like would land in Liked
  // songs as No longer available.
  const isLikeable = track.release.publishedAt !== null && track.hasAudio;
  const isPublished = track.release.publishedAt !== null;
  const addLabel = t("studio:playlist.add.trackCta");
  const tipLabel = t("studio:player.tipCta", {
    amount: formatters.currency(QUICK_TIP_AMOUNT),
  });

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
          <Translation
            i18nKey="studio:trackPage.byLine"
            components={{ strong: <strong />, em: <em /> }}
            values={{
              artist: track.release.artist.name,
              release: track.release.title,
            }}
          />
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
          {play.startLabel && !isCompact && (
            <span className={heroStyles.playFromLabel} aria-hidden="true">
              {t("studio:player.playFrom", { time: play.startLabel })}
            </span>
          )}
          {isLikeable && (
            <Tooltip
              label={t("studio:like.cta")}
              placement="top"
              isDisabled={!isCompact}
            >
              <StudioLikeButton
                subject={likeSubject}
                variant={isCompact ? "icon" : "labelled"}
              />
            </Tooltip>
          )}
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
              likeSubject={isLikeable ? likeSubject : undefined}
            />
          </Tooltip>
          {isPublished && (
            <StudioHeroShare
              target={{ kind: "track", id: track.id, startAtSeconds: null }}
              title={track.title}
              isIconOnly={isCompact}
            />
          )}
          <Tooltip
            label={t("studio:release.moreActions")}
            placement="top"
            align={isShowcase ? "center" : "end"}
          >
            <StudioTrackMenu
              className={heroStyles.heroMenu}
              track={studioTrackMenuTrackOf(track)}
            />
          </Tooltip>
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
        </>
      }
    />
  );
}
