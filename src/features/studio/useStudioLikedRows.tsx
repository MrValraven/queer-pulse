import { useCallback, useMemo, useRef, type RefObject } from "react";
import { FiHeart } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioLikedEntryView } from "./api/studioLiked.adapters";
import type { StudioLikedTracksResult } from "./api/useStudioLikedTracks";
import type { StudioSelectionAction } from "./kit/StudioSelectionBar";
import type { StudioTrackRowLikeOptions } from "./kit/StudioTrackRow";
import type { StudioRowSelection } from "./kit/useStudioRowSelection";
import { useStudioPlayer } from "./player/studioPlayerContext";
import { queueFromTracks } from "./player/studioQueue";
import { useStudioBulkTrackActions } from "./useStudioBulkTrackActions";
import { useStudioLikedUndo } from "./useStudioLikedUndo";
import { useStudioRowHandlers } from "./useStudioRowHandlers";

const doNothing = () => {};
const QUIET_LIKE: StudioTrackRowLikeOptions = { isQuiet: true };

/**
 * Everything Liked songs hands its memoised rows, kept stable per like:
 * play (from the loaded likes, starting at that row), the quiet heart that
 * offers Undo and passes focus on after an unlike, and the row's element.
 * Also the selection bar's actions: Add to playlist, Add to queue and
 * Unlike, each over the picked likes in list order.
 */
export function useStudioLikedRows({
  liked,
  shown,
  headingRef,
  selection,
}: {
  liked: StudioLikedTracksResult;
  shown: StudioLikedEntryView[];
  headingRef: RefObject<HTMLHeadingElement | null>;
  selection: StudioRowSelection;
}) {
  const { t } = useTranslation();
  const player = useStudioPlayer();
  const { confirmUnliked, unlikeMany } = useStudioLikedUndo();
  const rowsRef = useRef(new Map<string, HTMLLIElement>());
  const queue = useMemo(
    () => queueFromTracks(liked.playableTracks),
    [liked.playableTracks],
  );
  const ids = useMemo(() => shown.map((entry) => entry.savedId), [shown]);
  const entryOf = useCallback(
    (savedId: string) => shown.find((entry) => entry.savedId === savedId),
    [shown],
  );

  const play = useCallback(
    (savedId: string) => {
      const track = entryOf(savedId)?.track;
      if (!track) return;
      if (player.isCurrentTrack(track.id)) player.togglePlay();
      else void player.playTracks(queue, track.id);
    },
    [entryOf, player, queue],
  );

  /** After an unlike, focus moves to the next row's Tab stop (the previous
   *  one at the end), or the list heading once none are left; the toast
   *  offers the like back. */
  const onToggled = useCallback(
    (savedId: string, isNowLiked: boolean) => {
      const entry = entryOf(savedId);
      if (isNowLiked || !entry) return;
      const index = shown.indexOf(entry);
      const neighbour = shown[index + 1] ?? shown[index - 1];
      // An unavailable like's row takes no ref (the kit's unavailable row
      // has none), so it is found by its place in the list instead.
      const neighbourIndex = neighbour ? shown.indexOf(neighbour) : -1;
      const listRows = [
        ...(headingRef.current
          ?.closest("section")
          ?.querySelectorAll<HTMLLIElement>("ol > li:not([data-exiting])") ??
          []),
      ];
      const neighbourRow = neighbour
        ? (rowsRef.current.get(neighbour.savedId) ?? listRows[neighbourIndex])
        : undefined;
      const target =
        neighbourRow?.querySelector<HTMLElement>("[data-studio-row-focus]") ??
        neighbourRow?.querySelector<HTMLElement>("button[aria-pressed]");
      (target ?? headingRef.current)?.focus();
      confirmUnliked(entry);
    },
    [entryOf, shown, headingRef, confirmUnliked],
  );

  const keepRowElement = useCallback(
    (savedId: string, element: HTMLLIElement | null) => {
      if (element) rowsRef.current.set(savedId, element);
      else rowsRef.current.delete(savedId);
    },
    [],
  );

  const playHandlers = useStudioRowHandlers(ids, play);
  const toggledHandlers = useStudioRowHandlers<boolean>(ids, onToggled);
  const likeOptions = useMemo(
    () =>
      new Map(
        [...toggledHandlers].map(([savedId, handler]) => [
          savedId,
          {
            isQuiet: true,
            onToggled: handler,
          } satisfies StudioTrackRowLikeOptions,
        ]),
      ),
    [toggledHandlers],
  );
  const rowRefs = useStudioRowHandlers<HTMLLIElement | null>(
    ids,
    keepRowElement,
  );

  const entriesOf = (rowIds: string[]) =>
    rowIds.flatMap((rowId) => entryOf(rowId) ?? []);
  const bulk = useStudioBulkTrackActions(selection, (rowIds) =>
    entriesOf(rowIds).flatMap((entry) =>
      entry.track?.hasAudio ? [entry.track.id] : [],
    ),
  );
  const bulkActions: StudioSelectionAction[] = [
    ...bulk.actions,
    {
      id: "unlike",
      label: t("studio:selection.unlike"),
      icon: <FiHeart aria-hidden />,
      tone: "danger",
      onRun: (rowIds) => {
        unlikeMany(entriesOf(rowIds));
        selection.clear();
      },
    },
  ];

  return {
    playHandlerOf: (savedId: string) => playHandlers.get(savedId) ?? doNothing,
    likeOptionsOf: (savedId: string) => likeOptions.get(savedId) ?? QUIET_LIKE,
    rowRefOf: (savedId: string) => rowRefs.get(savedId),
    bulkActions,
    picker: bulk.picker,
  };
}
