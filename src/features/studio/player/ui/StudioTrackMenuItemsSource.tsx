import { useLayoutEffect, useRef, useState } from "react";
import { useStudioAccess } from "../../api/useStudioAccess";
import type { StudioMenuItem } from "../../kit/StudioMenu";
import { useIsOwnStudioPersona } from "../../useIsOwnStudioPersona";
import { useStudioPlayer } from "../studioPlayerContext";
import { StudioTrackMenuClock } from "./StudioTrackMenuClock";
import type { StudioTrackMenuTrack } from "./studioTrackMenuTrack";
import { useStudioTrackMenuItems } from "./useStudioTrackMenuItems";

/** What the menu shows, as text: when it changes the items are handed up
 *  again. The handlers always run the latest render's. */
function signatureOf(items: StudioMenuItem[]): string {
  return items
    .map((item) =>
      "type" in item
        ? item.id
        : [
            item.id,
            item.label,
            item.isDisabled ? "disabled" : "",
            item.disabledReason ?? "",
            item.href ?? "",
            item.tone ?? "",
          ].join(":"),
    )
    .join("|");
}

/** Builds the track menu's items, mounted only while the menu is open, so a
 *  closed "..." on each of 400 rows runs none of the hooks behind them
 *  (likes, auth, toasts, sharing, the player clock). The items are handed
 *  to the owner, which keeps the last set for the exit animation. */
export function StudioTrackMenuItemsSource({
  track,
  onItems,
  onSendInMessage,
  onAddToPlaylist,
  onReport,
}: {
  track: StudioTrackMenuTrack;
  onItems: (items: StudioMenuItem[]) => void;
  onSendInMessage: () => void;
  onAddToPlaylist: () => void;
  onReport: () => void;
}) {
  const player = useStudioPlayer();
  const [playheadSeconds, setPlayheadSeconds] = useState(0);
  const { isPending: isAccessPending } = useStudioAccess();
  const isOwnPersona = useIsOwnStudioPersona(track.artistId);
  const isReportable =
    track.artistId !== undefined &&
    track.isPublished === true &&
    track.isWithheld !== true &&
    !isAccessPending &&
    !isOwnPersona;
  const isCurrent = player.isCurrentTrack(track.id);
  const items = useStudioTrackMenuItems({
    track,
    linkSeconds: isCurrent ? playheadSeconds : null,
    onSendInMessage,
    onAddToPlaylist,
    onReport: isReportable ? onReport : undefined,
  });
  const latestItemsRef = useRef(items);
  useLayoutEffect(() => {
    latestItemsRef.current = items;
  });
  const signature = signatureOf(items);
  useLayoutEffect(() => {
    const runLatest = (itemId: string) => {
      const latest = latestItemsRef.current.find(
        (candidate) => candidate.id === itemId,
      );
      if (latest && !("type" in latest)) latest.onSelect();
    };
    onItems(
      latestItemsRef.current.map((item) =>
        "type" in item ? item : { ...item, onSelect: () => runLatest(item.id) },
      ),
    );
  }, [signature, onItems]);
  return isCurrent ? (
    <StudioTrackMenuClock onSeconds={setPlayheadSeconds} />
  ) : null;
}
