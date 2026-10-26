import {
  FiCornerDownRight,
  FiFlag,
  FiLink,
  FiList,
  FiMoreHorizontal,
  FiUser,
} from "react-icons/fi";
import { useToast } from "../../shared/components/feedback/useToast";
import { IconButton } from "../../shared/components/ui/IconButton";
import { useShareLink } from "../../shared/hooks/useClipboard";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { StudioMenu, type StudioMenuItem } from "./kit/StudioMenu";
import { useStudioQueueMany } from "./player/studioQueueActions";
import { studioErrorMessageKeyOf } from "./studioErrors.data";
import {
  useStudioFoldedShareItems,
  type StudioFoldedShare,
} from "./useStudioFoldedShareItem";
import releaseStyles from "./StudioRelease.module.css";

const absoluteUrl = (path: string) =>
  new URL(path, window.location.origin).toString();

/** The release's overflow menu: Play next and Add to queue for the whole
 *  release, Go to artist, Copy link and Report release. With `share` (the
 *  hero's Share folded here) every way to share takes Copy link's place.
 *  Each item shows when its prop is passed; `trackIds` are the playable
 *  tracks in release order. */
export function StudioReleaseOverflow({
  onReport,
  trackIds,
  href,
  artistHref,
  share,
}: {
  onReport?: () => void;
  trackIds?: string[];
  /** The release's router path, for Copy link. */
  href?: string;
  artistHref?: string;
  /** Set once the hero's Share folds into this menu. */
  share?: StudioFoldedShare;
}) {
  const { t } = useTranslation();
  const foldedShare = useStudioFoldedShareItems(share);
  const { playNextMany, addManyToQueue } = useStudioQueueMany();
  const { showToast } = useToast();
  const { share: copyLink } = useShareLink({
    copied: t("studio:trackMenu.linkCopiedToast"),
    failed: t("studio:detail.copyFailedToast"),
  });

  async function queue(action: "playNext" | "addToQueue", ids: string[]) {
    const { queuedCount, totalCount, error } = await (action === "playNext"
      ? playNextMany(ids)
      : addManyToQueue(ids));
    // ENG-03: a toast that names why the queue did not change, or why only
    // part of the release joined it.
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

  const items: StudioMenuItem[] = [];
  if (trackIds) {
    const queueBlockedReason =
      trackIds.length === 0 ? t("studio:release.queueEmptyReason") : undefined;
    items.push(
      {
        id: "playNext",
        label: t("studio:trackMenu.playNext"),
        icon: <FiCornerDownRight />,
        isDisabled: queueBlockedReason !== undefined,
        disabledReason: queueBlockedReason,
        onSelect: () => void queue("playNext", trackIds),
      },
      {
        id: "addToQueue",
        label: t("studio:trackMenu.addToQueue"),
        icon: <FiList />,
        isDisabled: queueBlockedReason !== undefined,
        disabledReason: queueBlockedReason,
        onSelect: () => void queue("addToQueue", trackIds),
      },
    );
  }
  if (artistHref)
    items.push({
      id: "goToArtist",
      label: t("studio:trackMenu.goToArtist"),
      icon: <FiUser />,
      href: artistHref,
      onSelect: () => undefined,
    });
  if (foldedShare.items.length > 0) {
    if (items.length > 0)
      items.push({ id: "shareSeparator", type: "separator" });
    items.push(...foldedShare.items);
  } else if (href)
    items.push({
      id: "copyLink",
      label: t("studio:trackMenu.copyLink"),
      icon: <FiLink />,
      onSelect: () => void copyLink(absoluteUrl(href)),
    });
  if (onReport) {
    if (items.length > 0)
      items.push({ id: "reportSeparator", type: "separator" });
    items.push({
      id: "report",
      label: t("studio:release.report"),
      icon: <FiFlag />,
      onSelect: onReport,
    });
  }
  // Nothing to offer: no "..." at all, never an empty menu.
  if (items.length === 0) return null;

  return (
    <div className={releaseStyles.overflow}>
      <StudioMenu
        trigger={
          <IconButton
            className={releaseStyles.overflowTrigger}
            aria-label={t("studio:release.moreActions")}
          >
            <FiMoreHorizontal aria-hidden />
          </IconButton>
        }
        label={t("studio:release.moreActions")}
        items={items}
      />
      {foldedShare.dialog}
    </div>
  );
}
