import { useQueryClient } from "@tanstack/react-query";
import { createElement } from "react";
import { FiCornerDownRight, FiList, FiUser } from "react-icons/fi";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioReleaseCardView } from "./api/studio.adapters";
import { studioReleaseQueryOptions } from "./api/useStudioRelease";
import type { StudioMenuItem } from "./kit/StudioMenu";
import { useStudioQueueMany } from "./player/studioQueueActions";
import { studioErrorMessageKeyOf } from "./studioErrors.data";

type StudioQueueManyAction = "playNext" | "addToQueue";

/**
 * The release card's context menu (right-click, long-press): Play next and
 * Add to queue for the whole release, and Go to artist. The card holds no
 * tracklist, so a queue item reads the release first, through the cache the
 * release page and the player share. A toast names what happened, and a
 * failure names its reason.
 */
export function useStudioReleaseCardMenu(
  release: StudioReleaseCardView,
): StudioMenuItem[] {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const { playNextMany, addManyToQueue } = useStudioQueueMany();
  const { showToast } = useToast();

  async function queueRelease(action: StudioQueueManyAction) {
    let trackIds: string[];
    try {
      const view = await queryClient.fetchQuery(
        studioReleaseQueryOptions(demoMode, release.id),
      );
      trackIds = view.tracks
        .filter((track) => track.hasAudio && !track.isWithheld)
        .map((track) => track.id);
    } catch (error) {
      showToast(t(studioErrorMessageKeyOf(error, "queue")), "error");
      return;
    }
    if (trackIds.length === 0) {
      showToast(t("studio:release.queueEmptyReason"), "info");
      return;
    }
    const { queuedCount, totalCount, error } = await (action === "playNext"
      ? playNextMany(trackIds)
      : addManyToQueue(trackIds));
    // Only part of the release joined: say how much, and why, as the
    // release page's own menu does (StudioReleaseOverflow).
    const reason = error ? t(studioErrorMessageKeyOf(error, "queue")) : null;
    if (queuedCount === totalCount) {
      showToast(
        t(
          action === "playNext"
            ? "studio:trackMenu.playingNextToast"
            : "studio:trackMenu.addedToast",
        ),
        "success",
      );
      return;
    }
    if (queuedCount > 0) {
      const counts = { count: queuedCount, total: totalCount };
      showToast(
        reason
          ? t("studio:release.queuePartialReasonToast", { ...counts, reason })
          : t("studio:release.queuePartialToast", counts),
        "warning",
      );
      return;
    }
    showToast(reason ?? t("studio:release.queueFailedToast"), "error");
  }

  return [
    {
      id: "playNext",
      label: t("studio:trackMenu.playNext"),
      icon: createElement(FiCornerDownRight),
      onSelect: () => void queueRelease("playNext"),
    },
    {
      id: "addToQueue",
      label: t("studio:trackMenu.addToQueue"),
      icon: createElement(FiList),
      onSelect: () => void queueRelease("addToQueue"),
    },
    {
      id: "goToArtist",
      label: t("studio:trackMenu.goToArtist"),
      icon: createElement(FiUser),
      href: release.artist.href,
      onSelect: () => undefined,
    },
  ];
}
