import {
  FiClock,
  FiCornerDownRight,
  FiDisc,
  FiFlag,
  FiHeart,
  FiLink,
  FiList,
  FiPlusCircle,
  FiSend,
  FiUser,
} from "react-icons/fi";
import { useAuth } from "../../../../app/providers/authContext";
import { useToast } from "../../../../shared/components/feedback/useToast";
import { useShareLink } from "../../../../shared/hooks/useClipboard";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { formatTrackTime } from "../../api/studio.adapters";
import type { StudioMenuItem } from "../../kit/StudioMenu";
import { studioErrorMessageKeyOf } from "../../studioErrors.data";
import { useStudioLike } from "../../useStudioLike";
import { useStudioPlayer } from "../studioPlayerContext";
import { takeLastQueueFailure } from "../studioQueueActions";
import { trackLinkAt } from "../studioTimestampLink";
import type { StudioTrackMenuTrack } from "./studioTrackMenuTrack";

const absoluteUrl = (path: string) =>
  new URL(path, window.location.origin).toString();

/** Joins the non-empty groups with a hairline between them. */
function joinGroups(groups: StudioMenuItem[][]): StudioMenuItem[] {
  return groups
    .filter((group) => group.length > 0)
    .flatMap((group, index) =>
      index === 0
        ? group
        : [{ id: `separator-${index}`, type: "separator" as const }, ...group],
    );
}

/** The track menu's items, in four groups: listening (Play next, Add to
 *  queue, Add to playlist, Like), going (Go to artist, Go to release),
 *  sharing (Send, Copy link, Copy link at the playhead) and Report.
 *  `linkSeconds` is the playhead for the track that is playing, null for
 *  every other track. */
export function useStudioTrackMenuItems({
  track,
  linkSeconds,
  onSendInMessage,
  onAddToPlaylist,
  onReport,
}: {
  track: StudioTrackMenuTrack;
  linkSeconds: number | null;
  onSendInMessage: () => void;
  onAddToPlaylist: () => void;
  onReport?: () => void;
}): StudioMenuItem[] {
  const { t } = useTranslation();
  const player = useStudioPlayer();
  const { showToast } = useToast();
  const { user } = useAuth();
  const { share } = useShareLink({
    copied: t("studio:trackMenu.linkCopiedToast"),
    failed: t("studio:detail.copyFailedToast"),
  });
  // A track the menu could not read has no title: a like or a playlist
  // entry would keep an empty snapshot, so both wait for a real read.
  const hasDetails = track.title !== "";
  const isLikeable = hasDetails && track.hasAudio && track.isWithheld !== true;
  const like = useStudioLike(
    isLikeable
      ? {
          trackId: track.id,
          title: track.title,
          href: track.href,
          artistName: track.artistName ?? "",
        }
      : null,
  );
  // Contract F.4: a hidden explicit track gives the hidden reason first.
  const blockedReasonKey =
    player.playbackSettings.hideExplicit && track.isExplicit
      ? "studio:hiddenTrack.label"
      : !track.hasAudio
        ? "studio:release.processing"
        : null;
  const queueBlockedReason = blockedReasonKey ? t(blockedReasonKey) : undefined;
  // A preview plays through its private link, which a shared time link or a
  // message would hand on: both wait for the published release.
  const isPreviewPlaying =
    Boolean(player.currentItem?.previewToken) &&
    player.isCurrentTrack(track.id);
  const shouldOfferSend = Boolean(user) && !isPreviewPlaying;
  const shouldOfferLinkAt = linkSeconds !== null && !isPreviewPlaying;
  const playheadSeconds = linkSeconds ?? 0;

  async function queue(action: "playNext" | "addToQueue") {
    const isQueued = await (action === "playNext"
      ? player.playNext(track.id)
      : player.addToQueue(track.id));
    if (!isQueued) {
      // A read that failed names its reason (offline, access, gone); a
      // track the queue turned away on its own (no audio, hidden explicit)
      // keeps the track's own line.
      const failure = takeLastQueueFailure();
      showToast(
        t(
          failure === null || failure === undefined
            ? "studio:trackMenu.queueFailedToast"
            : studioErrorMessageKeyOf(failure, "queue"),
        ),
        "error",
      );
      return;
    }
    showToast(
      t(
        action === "playNext"
          ? "studio:trackMenu.playingNextToast"
          : "studio:trackMenu.addedToast",
      ),
      "success",
    );
  }

  const listening: StudioMenuItem[] = [
    {
      id: "playNext",
      label: t("studio:trackMenu.playNext"),
      icon: <FiCornerDownRight />,
      isDisabled: queueBlockedReason !== undefined,
      disabledReason: queueBlockedReason,
      onSelect: () => void queue("playNext"),
    },
    {
      id: "addToQueue",
      label: t("studio:trackMenu.addToQueue"),
      icon: <FiList />,
      isDisabled: queueBlockedReason !== undefined,
      disabledReason: queueBlockedReason,
      onSelect: () => void queue("addToQueue"),
    },
  ];
  if (hasDetails)
    listening.push({
      id: "addToPlaylist",
      label: t("studio:playlist.add.trackCta"),
      icon: <FiPlusCircle />,
      isDisabled: !track.hasAudio,
      disabledReason: track.hasAudio
        ? undefined
        : t("studio:release.processing"),
      onSelect: onAddToPlaylist,
    });
  if (isLikeable)
    listening.push({
      id: "like",
      label: like.isLiked
        ? t("studio:trackMenu.unlike")
        : t("studio:trackMenu.like"),
      icon: <FiHeart fill={like.isLiked ? "currentColor" : "none"} />,
      onSelect: () => {
        like.toggle();
      },
    });

  const going: StudioMenuItem[] = [];
  if (track.artistHref)
    going.push({
      id: "goToArtist",
      label: t("studio:trackMenu.goToArtist"),
      icon: <FiUser />,
      href: track.artistHref,
      onSelect: () => undefined,
    });
  if (track.releaseHref)
    going.push({
      id: "goToRelease",
      label: t("studio:trackMenu.goToRelease"),
      icon: <FiDisc />,
      href: track.releaseHref,
      onSelect: () => undefined,
    });

  const sharing: StudioMenuItem[] = [];
  if (shouldOfferSend)
    sharing.push({
      id: "sendInMessage",
      label: t("studio:trackMenu.sendInMessage"),
      icon: <FiSend />,
      onSelect: onSendInMessage,
    });
  sharing.push({
    id: "copyLink",
    label: t("studio:trackMenu.copyLink"),
    icon: <FiLink />,
    onSelect: () => void share(absoluteUrl(track.href)),
  });
  if (shouldOfferLinkAt)
    sharing.push({
      id: "copyLinkAt",
      label: t("studio:trackMenu.copyLinkAt", {
        time: formatTrackTime(playheadSeconds) ?? "0:00",
      }),
      icon: <FiClock />,
      onSelect: () =>
        void share(absoluteUrl(trackLinkAt(track.href, playheadSeconds))),
    });

  const reporting: StudioMenuItem[] = onReport
    ? [
        {
          id: "report",
          label: t("studio:report.trackCta"),
          icon: <FiFlag />,
          onSelect: onReport,
        },
      ]
    : [];

  return joinGroups([listening, going, sharing, reporting]);
}
