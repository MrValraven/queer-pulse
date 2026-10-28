import { FiGift } from "react-icons/fi";
import {
  Button,
  Collapse,
  IconButton,
  Tooltip,
} from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioReleaseView } from "./api/studio.adapters";
import { StudioPlayButton } from "./kit/StudioPlayButton";
import { StudioAddToPlaylistButton } from "./StudioAddToPlaylistButton";
import { StudioReleaseLikeButton } from "./StudioCollectionLikeButton";
import { StudioHeroShare } from "./StudioHeroShare";
import { StudioHiddenTrackNote } from "./StudioHiddenTrack";
import { StudioNotifyMeButton } from "./StudioNotifyMeButton";
import { StudioReleaseOverflow } from "./StudioReleaseOverflow";
import {
  useIsHeroActionsCompact,
  useIsHeroShareFolded,
} from "./studioHeroLayout";
import { useStudioReleasePlay } from "./useStudioReleasePlay";
import { useStudioShowcase } from "./useStudioShowcase";
import styles from "./studio.module.css";

/** The hero's actions. Who sees what: an upcoming release's visitor gets
 *  Notify me and Share; a preview gets Play alone; a published release
 *  gets the heart (it likes the release into the library), Add to
 *  playlist, Tip (showcase only, a gift icon), Share and the More
 *  menu (Play next and Add to queue for the whole release, Go to artist,
 *  Copy link and, for a visitor, Report). Below 1280px every action after
 *  Play is a round icon with a tooltip, so the row stays on one line, and
 *  below 1440px Share folds into the More menu with every way to share. */
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
  const isShowcase = useStudioShowcase();
  const isCompact = useIsHeroActionsCompact();
  const isShareFolded = useIsHeroShareFolded();
  const play = useStudioReleasePlay(release, previewToken);
  const isPreview = previewToken !== undefined || release.isPreview;
  const isPublished = release.status === "published";
  // A preview plays whatever its status: Notify me is for the release page,
  // and the owner of a scheduled release keeps Play.
  const isUpcomingForViewer =
    release.isUpcoming && !release.isOwner && !isPreview;
  const isPublicExtra = isPublished && !isPreview;
  const isShareable = (isPublished || release.isUpcoming) && !isPreview;
  const addLabel = t("studio:playlist.add.releaseCta");
  // The pill reads "Tip" and its name says whom: the artist's name made
  // the row wrap at 1280px.
  const tipAria = t("studio:detail.tipArtistCta", {
    artist: release.artist.name,
  });
  const shareTarget = {
    kind: "release",
    id: release.id,
    startAtSeconds: null,
  } as const;

  return (
    <>
      {!isUpcomingForViewer && (
        // On a phone the blocked reason leaves the row (still read through
        // aria-describedby) and shows as the button's tooltip instead.
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
      {/* Spec 7: every playable track is explicit and hidden, so Play is
          blocked; the release says why. */}
      <Collapse isOpen={!isUpcomingForViewer && play.isAllHidden}>
        <StudioHiddenTrackNote />
      </Collapse>
      {isUpcomingForViewer && (
        <StudioNotifyMeButton
          releaseId={release.id}
          releaseTitle={release.title}
          isSet={release.isReminderSet}
          isStatusReserved
        />
      )}
      {isPublicExtra && (
        <StudioReleaseLikeButton release={release} isIconOnly={isCompact} />
      )}
      {isPublicExtra && (
        <Tooltip label={addLabel} placement="top" isDisabled={!isCompact}>
          <StudioAddToPlaylistButton
            trackIds={release.tracks
              .filter((track) => track.hasAudio)
              .map((track) => track.id)}
            subjectTitle={release.title}
            label={isCompact ? undefined : addLabel}
            ariaLabel={isCompact ? addLabel : undefined}
          />
        </Tooltip>
      )}
      {isShowcase &&
        isPublicExtra &&
        (isCompact ? (
          <IconButton
            aria-label={tipAria}
            tooltip
            className={styles.tip}
            onClick={onTip}
          >
            <FiGift aria-hidden />
          </IconButton>
        ) : (
          <Button
            variant="quiet"
            className={styles.tip}
            aria-label={tipAria}
            onClick={onTip}
          >
            <FiGift aria-hidden />
            {t("studio:detail.tipCta")}
          </Button>
        ))}
      {isShareable && !isShareFolded && (
        <StudioHeroShare
          target={shareTarget}
          title={release.title}
          isIconOnly={isCompact}
        />
      )}
      {/* The server accepts a report on a published or scheduled release
          (granted members see a scheduled release's title, cover and
          description). A preview has no public page, and an artist does not
          report their own release, so the owner's menu keeps the queue and
          link items alone. */}
      {isShareable && (
        <Tooltip
          label={t("studio:release.moreActions")}
          placement="top"
          align="end"
        >
          <StudioReleaseOverflow
            trackIds={isPublished ? play.audibleTrackIds : undefined}
            href={release.href}
            artistHref={release.artist.href}
            onReport={release.isOwner ? undefined : onReport}
            share={
              isShareFolded
                ? { target: shareTarget, title: release.title }
                : undefined
            }
          />
        </Tooltip>
      )}
    </>
  );
}
