import { FiCheck, FiHeart, FiPlus } from "react-icons/fi";
import {
  Button,
  Collapse,
  IconButton,
  Tooltip,
} from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioReleaseView } from "./api/studio.adapters";
import { StudioPlayButton } from "./kit/StudioPlayButton";
import { StudioIconSwap } from "./player/ui/StudioIconSwap";
import { StudioAddToPlaylistButton } from "./StudioAddToPlaylistButton";
import { StudioHeroShare } from "./StudioHeroShare";
import { StudioHiddenTrackNote } from "./StudioHiddenTrack";
import { StudioNotifyMeButton } from "./StudioNotifyMeButton";
import { StudioReleaseOverflow } from "./StudioReleaseOverflow";
import { useIsHeroCompact } from "./studioHeroLayout";
import { useStudioReleasePlay } from "./useStudioReleasePlay";
import { useStudioSaveToggle } from "./useStudioSaveToggle";
import { useStudioShowcase } from "./useStudioShowcase";
import styles from "./studio.module.css";

/** Save keeps one name, "Save {title}", and aria-pressed carries the state,
 *  so a screen reader hears it once; the icon swaps to a check and the
 *  visible words to Saved. */
function StudioReleaseSaveButton({
  release,
  isIconOnly,
}: {
  release: StudioReleaseView;
  isIconOnly: boolean;
}) {
  const { t } = useTranslation();
  const save = useStudioSaveToggle({
    savedId: release.savedId,
    kind: "studio_release",
    title: release.title,
    href: release.href,
    meta: release.artist.name,
  });
  const label = t("studio:save.saveReleaseCta", { title: release.title });
  const icon = (
    <StudioIconSwap iconKey={save.isSaved ? "saved" : "save"}>
      {save.isSaved ? <FiCheck aria-hidden /> : <FiPlus aria-hidden />}
    </StudioIconSwap>
  );
  if (isIconOnly)
    return (
      <IconButton
        aria-label={label}
        aria-pressed={save.isSaved}
        tooltip={t("studio:save.saveCta")}
        onClick={save.toggle}
      >
        {icon}
      </IconButton>
    );
  return (
    <Button
      variant="quiet"
      aria-label={label}
      aria-pressed={save.isSaved}
      onClick={save.toggle}
    >
      {icon}
      {/* The words follow the state; the name above stays "Save {title}". */}
      <StudioIconSwap iconKey={save.isSaved ? "savedLabel" : "saveLabel"}>
        {t(save.isSaved ? "studio:save.savedLabel" : "studio:save.saveCta")}
      </StudioIconSwap>
    </Button>
  );
}

/** The hero's actions. Who sees what: an upcoming release's visitor gets
 *  Notify me and Share; a preview gets Play alone; a published release
 *  gets Save, Add to playlist, Tip (showcase only), Share and the More
 *  menu (Play next and Add to queue for the whole release, Go to artist,
 *  Copy link and, for a visitor, Report). On a phone every action after
 *  Play is a round icon with a tooltip, so the row stays on one line. */
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
  const isCompact = useIsHeroCompact();
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
  const tipLabel = t("studio:detail.tipArtistCta", {
    artist: release.artist.name,
  });

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
        <StudioReleaseSaveButton release={release} isIconOnly={isCompact} />
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
            aria-label={tipLabel}
            tooltip
            className={styles.tip}
            onClick={onTip}
          >
            <FiHeart aria-hidden />
          </IconButton>
        ) : (
          <Button variant="quiet" className={styles.tip} onClick={onTip}>
            <FiHeart aria-hidden />
            {tipLabel}
          </Button>
        ))}
      {isShareable && (
        <StudioHeroShare
          target={{ kind: "release", id: release.id, startAtSeconds: null }}
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
          />
        </Tooltip>
      )}
    </>
  );
}
