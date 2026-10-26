import { useState, type RefObject } from "react";
import { useQuery } from "@tanstack/react-query";
import { FiMoreHorizontal } from "react-icons/fi";
import { useDemoMode } from "../../../../app/providers/DemoModeProvider";
import { IconButton } from "../../../../shared/components/ui/IconButton";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { studioTrackQueryOptions } from "../../api/studioTrackQuery";
import { useStudioAccess } from "../../api/useStudioAccess";
import { StudioMenu, type StudioMenuItem } from "../../kit/StudioMenu";
import type { StudioContextMenuPoint } from "../../kit/useStudioContextMenu";
import {
  fallbackStudioTrackMenuTrack,
  studioTrackMenuTrackOf,
  type StudioTrackMenuTrack,
} from "./studioTrackMenuTrack";
import { StudioTrackMenuPending } from "./StudioTrackMenuPending";
import { useStudioTrackMenu } from "./useStudioTrackMenu";
import styles from "./StudioTrackMenu.module.css";

export type { StudioTrackMenuTrack } from "./studioTrackMenuTrack";

/** The track's items, then a caller's own after a hairline. The extras
 *  wait for the track's items, so an opening menu never shows them alone. */
function withExtraItems(
  items: StudioMenuItem[],
  extraItems: StudioMenuItem[] | undefined,
): StudioMenuItem[] {
  if (!extraItems || extraItems.length === 0 || items.length === 0)
    return items;
  return [
    ...items,
    { id: "extra-separator", type: "separator" },
    ...extraItems,
  ];
}

/** The "..." on every track row and the track hero (spec 7.4): Play next,
 *  Add to queue, Add to playlist, Like, Go to artist, Go to release, Send
 *  in a message, Copy link, Copy link at the current time for the track
 *  that is playing, and Report track (someone else's published track).
 *  Only the open menu of the playing track reads the clock, so closed
 *  triggers stay still while a track plays. `onRequestAddToPlaylist` hands
 *  Add to playlist to the caller; left out, the menu opens the picker.
 *  `extraItems` come last, after a hairline (a playlist editor's Move up,
 *  Move down and Remove). */
export function StudioTrackMenu({
  track,
  className,
  onRequestAddToPlaylist,
  onLinkNavigate,
  tooltip,
  extraItems,
}: {
  track: StudioTrackMenuTrack;
  className?: string;
  extraItems?: StudioMenuItem[];
  /** The trigger's tooltip, for a surface whose other icons show one. */
  tooltip?: string;
  onRequestAddToPlaylist?: () => void;
  /** For a menu inside a surface with its own history entry (Now playing):
   *  Go to artist and Go to release replace that entry and call this, so
   *  the surface closes without stepping back over the new page. */
  onLinkNavigate?: () => void;
}) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const menu = useStudioTrackMenu(track, {
    isOpen,
    onRequestAddToPlaylist,
  });
  const { dialogs } = menu;
  const trackItems = onLinkNavigate
    ? menu.items.map((item) =>
        "href" in item && item.href
          ? {
              ...item,
              replace: true,
              onSelect: () => {
                item.onSelect();
                onLinkNavigate();
              },
            }
          : item,
      )
    : menu.items;
  const items = withExtraItems(trackItems, extraItems);
  return (
    <div className={[styles.wrap, className].filter(Boolean).join(" ")}>
      <StudioMenu
        trigger={
          <IconButton
            className={styles.trigger}
            aria-label={t("studio:trackMenu.trigger", { title: track.title })}
            tooltip={tooltip}
            isTooltipDisabled={isOpen}
          >
            <FiMoreHorizontal aria-hidden />
          </IconButton>
        }
        label={t("studio:trackMenu.menuLabel", { title: track.title })}
        items={items}
        isOpen={isOpen && items.length > 0}
        onOpenChange={setIsOpen}
      />
      {dialogs}
    </div>
  );
}

/** The track menu as a context menu, at a right-click or a long press
 *  (`useStudioContextMenu`). It is open while `point` is set; `onClose`
 *  asks the caller to clear it. Keep it mounted while the row is: the
 *  dialogs its items open (Add to playlist, Send, Report) live here and
 *  outlast the menu. `returnFocusRef` is where focus lands on close and
 *  after those dialogs, usually the row. It reads the track by id once it
 *  first opens; a row that already holds the track can pass it as `track`
 *  to skip the read. A failed read, a scroll or a press elsewhere while it
 *  reads drops the ask. `extraItems` follow the track's, as on the "...". */
export function StudioTrackMenuAt({
  trackId,
  point,
  onClose,
  track,
  returnFocusRef,
  extraItems,
}: {
  trackId: string;
  point: StudioContextMenuPoint | null;
  onClose: () => void;
  track?: StudioTrackMenuTrack;
  returnFocusRef?: RefObject<HTMLElement | null>;
  extraItems?: StudioMenuItem[];
}) {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const { hasAccess } = useStudioAccess();
  const isRequested = point !== null;
  const canRead = demoMode || hasAccess;
  const query = useQuery({
    ...studioTrackQueryOptions(demoMode, trackId),
    enabled: isRequested && !track && canRead,
  });
  const readTrack = query.data ? studioTrackMenuTrackOf(query.data) : null;
  const menuTrack = track ?? readTrack ?? fallbackStudioTrackMenuTrack(trackId);
  // The menu waits for the read (a beat at most) so its items never shift
  // under the pointer.
  const isReady = track !== undefined || readTrack !== null;
  const menu = useStudioTrackMenu(menuTrack, {
    isOpen: isRequested && isReady,
  });
  const { dialogs } = menu;
  const items = withExtraItems(menu.items, extraItems);
  return (
    <>
      {isRequested && !isReady && (
        <StudioTrackMenuPending
          error={query.error}
          isUnreadable={!canRead}
          onDismiss={onClose}
        />
      )}
      <StudioMenu
        trigger={null}
        label={t("studio:trackMenu.menuLabel", { title: menuTrack.title })}
        items={items}
        anchorPoint={point}
        isOpen={isRequested && isReady && items.length > 0}
        returnFocusRef={returnFocusRef}
        onOpenChange={(isNowOpen) => {
          if (!isNowOpen) onClose();
        }}
      />
      {dialogs}
    </>
  );
}
