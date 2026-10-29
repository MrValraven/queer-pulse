import {
  useCallback,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { FiShoppingBag } from "react-icons/fi";
import { Collapse } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioReleaseView } from "./api/studio.adapters";
import { useStudioHideExplicit } from "./api/useStudioPlaybackPreferences";
import { useStudioOffer } from "./api/useStudioOffer";
import type { StudioMenuItem } from "./kit/StudioMenu";
import {
  StudioTrackRow,
  type StudioTrackRowAction,
  type StudioTrackSummary,
} from "./kit/StudioTrackRow";
import { StudioSelectionBar } from "./kit/StudioSelectionBar";
import { useStudioRowSelection } from "./kit/useStudioRowSelection";
import { useStudioPlayer } from "./player/studioPlayerContext";
import { useStudioBulkTrackActions } from "./useStudioBulkTrackActions";
import { isSellableReleaseType } from "./studioPurchaseRules";
import { StudioTrackBuySheetHost } from "./StudioTrackBuySheetHost";
import { studioLibraryPath } from "./studioPaths";
import styles from "./studio.module.css";
import buyPanelStyles from "./StudioBuyPanel.module.css";
import css from "./StudioAlbumTracklist.module.css";

interface PurchaseAnnouncement {
  line: string;
  /** Counts every announcement, so the same line twice is read again. */
  serial: number;
}

/** A preview read through its private link shows its rows without the
 *  heart, Add to playlist or the track menu (agreed with Studio v3); a
 *  draft or taken-down release offers neither the heart nor the add. */
const PREVIEW_HIDDEN: readonly StudioTrackRowAction[] = [
  "like",
  "addToPlaylist",
  "menu",
];
const UNPUBLISHED_HIDDEN: readonly StudioTrackRowAction[] = [
  "like",
  "addToPlaylist",
];
const TAKEN_DOWN_HIDDEN: readonly StudioTrackRowAction[] = [
  "like",
  "addToPlaylist",
  "menu",
];
const NONE_HIDDEN: readonly StudioTrackRowAction[] = [];

function hiddenActionsOf(release: StudioReleaseView) {
  if (release.isPreview) return PREVIEW_HIDDEN;
  if (release.status === "taken_down") return TAKEN_DOWN_HIDDEN;
  if (release.status !== "published") return UNPUBLISHED_HIDDEN;
  return NONE_HIDDEN;
}

/**
 * The playable tracklist on the shared Studio track row: the number turns
 * to play on hover, the playing row shows its equaliser, and the rows
 * arrive in a short stagger. Each row's play is stable across player
 * ticks, so only the rows whose state moved re-render. A listener's
 * withheld track keeps its place and number and offers nothing.
 */
export function StudioAlbumTracklist({
  release,
}: {
  release: StudioReleaseView;
}) {
  const { t } = useTranslation();
  const player = useStudioPlayer();
  const shouldHideExplicit = useStudioHideExplicit();
  const headingId = useId();
  // The server refuses every stream on a taken-down release, owners included.
  const isStreamable = release.status !== "taken_down";
  const hiddenActions = hiddenActionsOf(release);
  // The page reads the same offer, so this shares its cached query.
  const { offer } = useStudioOffer("release", release.id, {
    isEnabled:
      release.status === "published" &&
      isSellableReleaseType(release.type) &&
      !release.isPreview,
  });
  const [buyTrackId, setBuyTrackId] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState<PurchaseAnnouncement | null>(
    null,
  );
  // One stable item list per track, so the memoised rows keep their props.
  const extraItemsByTrack = useMemo(() => {
    const itemsByTrack = new Map<string, StudioMenuItem[]>();
    for (const trackOffer of offer?.trackOffers ?? []) {
      const { trackId, state } = trackOffer;
      if (state === "can_buy") {
        itemsByTrack.set(trackId, [
          {
            id: "buy-track",
            label: t("studio:purchase.panel.buy.track"),
            icon: <FiShoppingBag aria-hidden />,
            onSelect: () => setBuyTrackId(trackId),
          },
        ]);
      } else if (state === "pending" || state === "owned") {
        itemsByTrack.set(trackId, [
          {
            id: "open-purchases",
            label: t("studio:purchase.panel.openPurchases"),
            icon: <FiShoppingBag aria-hidden />,
            href: studioLibraryPath("purchases"),
            onSelect: () => undefined,
          },
        ]);
      }
    }
    return itemsByTrack;
  }, [offer, t, setBuyTrackId]);

  // The latest player behind one stable handler per track.
  const playerRef = useRef(player);
  useLayoutEffect(() => {
    playerRef.current = player;
  });
  const playTrack = useCallback(
    (trackId: string) => {
      const latest = playerRef.current;
      if (latest.isCurrentTrack(trackId)) latest.togglePlay();
      else void latest.playRelease(release.id, trackId);
    },
    [release.id],
  );
  // Selection offers exactly the bulk actions the release allows: Add to
  // playlist is hidden on a preview, draft or taken-down release, and then
  // no row can be picked. A listener's withheld track and a track with no
  // audio are never selectable.
  const isSelectionAllowed = !hiddenActions.includes("addToPlaylist");
  const selectableIds = useMemo(
    () =>
      isSelectionAllowed
        ? release.tracks.flatMap((track) =>
            track.hasAudio && !(track.isWithheld && !release.isOwner)
              ? [track.id]
              : [],
          )
        : [],
    [isSelectionAllowed, release.tracks, release.isOwner],
  );
  const selectableIdSet = useMemo(
    () => new Set(selectableIds),
    [selectableIds],
  );
  const selection = useStudioRowSelection(selectableIds);
  const bulk = useStudioBulkTrackActions(selection, (rowIds) =>
    rowIds.filter((rowId) => selectableIdSet.has(rowId)),
  );
  const rows = useMemo(
    () =>
      release.tracks.map((track) => ({
        summary: { ...track, release } satisfies StudioTrackSummary,
        onPlay: () => playTrack(track.id),
      })),
    [release, playTrack],
  );

  return (
    <section aria-labelledby={headingId}>
      <h2 id={headingId} className={styles.visuallyHidden}>
        {t("studio:release.tracklistLabel", { title: release.title })}
      </h2>
      <ol className={css.list} aria-labelledby={headingId}>
        {rows.map(({ summary, onPlay }) => {
          const isCurrent = player.isCurrentTrack(summary.id);
          return (
            <StudioTrackRow
              key={summary.id}
              track={summary}
              showCover={false}
              showRelease={false}
              isCurrent={isCurrent}
              isPlaying={isCurrent && player.status === "playing"}
              onPlay={onPlay}
              isPlayBlocked={!isStreamable}
              isOwnerView={release.isOwner}
              hiddenActions={hiddenActions}
              shouldHideExplicit={shouldHideExplicit}
              headingLevel={3}
              menuExtraItems={extraItemsByTrack.get(summary.id)}
              selection={
                selectableIdSet.has(summary.id) ? selection : undefined
              }
            />
          );
        })}
      </ol>
      {isSelectionAllowed && (
        <>
          <StudioSelectionBar selection={selection} actions={bulk.actions} />
          {bulk.picker}
        </>
      )}
      {buyTrackId && (
        <StudioTrackBuySheetHost
          trackId={buyTrackId}
          onClose={() => setBuyTrackId(null)}
          onPurchased={(purchase) => {
            setBuyTrackId(null);
            setAnnouncement((previous) => ({
              line: t("studio:purchase.sheet.doneStatus", {
                artist: purchase.artist.name,
              }),
              serial: (previous?.serial ?? 0) + 1,
            }));
          }}
        />
      )}
      <div role="status" className={buyPanelStyles.status}>
        <Collapse isOpen={announcement !== null}>
          <p key={announcement?.serial} className={buyPanelStyles.statusLine}>
            {announcement?.line}
          </p>
        </Collapse>
      </div>
    </section>
  );
}
