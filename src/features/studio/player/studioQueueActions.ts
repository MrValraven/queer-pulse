import { useQueryClient } from "@tanstack/react-query";
import { useLayoutEffect, useMemo, useRef } from "react";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import type { StudioTrackView } from "../api/studio.adapters";
import { studioTrackQueryOptions } from "../api/studioTrackQuery";
import {
  useStudioPlayer,
  type StudioPlaybackStatus,
  type StudioPlayerActions,
  type StudioQueueItem,
} from "./studioPlayerContext";
import { queueItemFromTrackView, toQueueItems } from "./studioQueue";
import type { StudioQueueState } from "./studioQueueReducer";
import {
  randomShuffleSeed,
  type PlayerActionDependencies,
} from "./studioTransportActions";
import { consentToWarnedTrack, warningGateOf } from "./studioWarningGate";

const TRACK_STALE_MS = 60_000;
/** Track reads in flight at once for a many-track queue change, well under
 *  the server's 120 requests a minute even for a long release. */
const QUEUE_READ_CONCURRENCY = 6;

/** Runs `work` over every item with at most `limit` in flight, keeping each
 *  result at its item's index. */
async function settleInPool<Item, Result>(
  items: readonly Item[],
  limit: number,
  work: (item: Item) => Promise<Result>,
): Promise<PromiseSettledResult<Result>[]> {
  const results: PromiseSettledResult<Result>[] = new Array<
    PromiseSettledResult<Result>
  >(items.length);
  let nextIndex = 0;
  async function runWorker() {
    while (nextIndex < items.length) {
      const index = nextIndex;
      nextIndex += 1;
      try {
        results[index] = {
          status: "fulfilled",
          value: await work(items[index] as Item),
        };
      } catch (error) {
        results[index] = { status: "rejected", reason: error };
      }
    }
  }
  const workerCount = Math.min(limit, items.length);
  await Promise.all(Array.from({ length: workerCount }, () => runWorker()));
  return results;
}

const isActiveStatus = (status: StudioPlaybackStatus) =>
  status === "playing" || status === "loading";

/** ENG-03: the error behind the last Play next or Add to queue that did not
 *  land, so the toast can name its reason. Null when the track was left out
 *  on purpose (hidden explicit, still processing) or the player changed
 *  during the read. */
let lastQueueFailure: unknown = null;

/** The last queue failure's error, read once. */
export function takeLastQueueFailure(): unknown {
  const failure = lastQueueFailure;
  lastQueueFailure = null;
  return failure;
}

export type StudioQueueActions = Pick<
  StudioPlayerActions,
  | "playNext"
  | "addToQueue"
  | "moveUserItem"
  | "moveUpcomingSourceItem"
  | "removeEntry"
  | "restoreQueueEntry"
  | "clearUserQueue"
  | "playEntry"
  | "toggleShuffle"
  | "cycleRepeat"
>;

const clampIndex = (index: number, length: number) =>
  Math.min(Math.max(0, Math.round(index)), length);

/** The queue with a removed entry back at its own place: `index` is its
 *  position in "Your queue" or in the source's play order when it left. A
 *  source entry also goes back into the source's own order, so switching
 *  shuffle off keeps it. The same state comes back when the queue has
 *  emptied since, or the entry is already in it. */
export function queueStateWithRestoredEntry(
  state: StudioQueueState,
  item: StudioQueueItem,
  group: "user" | "source",
  index: number,
): StudioQueueState {
  if (state.current === null) return state;
  const isSameEntry = (entry: StudioQueueItem) =>
    entry.queueEntryId === item.queueEntryId;
  const isAlreadyQueued =
    isSameEntry(state.current) ||
    state.userItems.some(isSameEntry) ||
    state.sourceItems.some(isSameEntry);
  if (isAlreadyQueued) return state;
  if (group === "user") {
    const userItems = [...state.userItems];
    userItems.splice(clampIndex(index, userItems.length), 0, item);
    return { ...state, userItems };
  }
  const sourceItems = [...state.sourceItems];
  // The source branch's own place, kept after the entry played last: when
  // playback has moved past where it left, it comes back as next up, so a
  // restored entry is always still to play.
  const sourcePosition = Math.min(
    Math.max(clampIndex(index, sourceItems.length), state.sourceIndex + 1),
    sourceItems.length,
  );
  sourceItems.splice(sourcePosition, 0, item);
  // Without shuffle both orders are one; with it, the entry rejoins its own
  // order at the same place, as near as the list allows.
  const originalSourceItems = [...state.originalSourceItems];
  originalSourceItems.splice(
    clampIndex(
      state.isShuffled ? index : sourcePosition,
      originalSourceItems.length,
    ),
    0,
    item,
  );
  const sourceIndex =
    sourcePosition <= state.sourceIndex
      ? state.sourceIndex + 1
      : state.sourceIndex;
  return { ...state, sourceItems, originalSourceItems, sourceIndex };
}

/** Queue edits from the queue panel and the track menu. They change only
 *  this tab's queue; nothing is sent anywhere. */
export function createQueueActions(
  deps: PlayerActionDependencies,
): StudioQueueActions {
  const { refs, dispatch, commands } = deps;
  const currentEntryId = () =>
    refs.queueRef.current.current?.queueEntryId ?? null;

  /** After an edit that may move the current entry: load the new one
   *  (playing on when it was playing), or stop when the queue emptied. */
  function followCurrent(previousEntryId: string | null, shouldPlay: boolean) {
    const current = refs.queueRef.current.current;
    if ((current?.queueEntryId ?? null) === previousEntryId) return;
    if (!current) {
      // As stop does: an emptied queue leaves nothing saved to restore.
      commands().resetPlayback();
      deps.clearSavedQueue();
      return;
    }
    refs.refreshCountRef.current = 0;
    // A warned entry an edit moved onto waits, cued, for Play it.
    void commands().loadEntry(
      current,
      0,
      shouldPlay && !refs.queueRef.current.pendingWarning,
    );
  }

  async function enqueue(
    trackId: string,
    type: "playNext" | "addToQueue",
  ): Promise<boolean> {
    // An empty player starts this track, so unlock inside the click.
    refs.engineRef.current?.unlock();
    const engineAtStart = refs.engineRef.current;
    const hadQueueAtStart = refs.queueRef.current.current !== null;
    let track: StudioTrackView;
    lastQueueFailure = null;
    try {
      const options = studioTrackQueryOptions(deps.demoMode, trackId);
      track = await deps.queryClient.fetchQuery({
        ...options,
        staleTime: options.staleTime ?? TRACK_STALE_MS,
      });
    } catch (error) {
      // The read reported a withdrawn grant itself (readStudio).
      lastQueueFailure = error;
      return false;
    }
    // A demo/live switch (a new engine) or a reset during the read wins:
    // the track never starts on what replaced the player it was asked of.
    const isStale =
      refs.engineRef.current !== engineAtStart ||
      (hadQueueAtStart && refs.queueRef.current.current === null);
    if (!track.hasAudio || deps.shouldStopRef.current || isStale) return false;
    // Hide explicit (contract F.2): an explicit track stays out while hidden.
    if (track.isExplicit && deps.readPlaybackSettings().hideExplicit)
      return false;
    // Play next and Add to queue name the track: that is consent (D5).
    consentToWarnedTrack(track.id);
    const previousEntryId = currentEntryId();
    // A new entry on purpose: the same track may sit in the queue twice, and
    // entries already queued keep their ids.
    dispatch({ type, items: toQueueItems([queueItemFromTrackView(track)]) });
    followCurrent(previousEntryId, true);
    return true;
  }

  return {
    playNext: (trackId) => enqueue(trackId, "playNext"),
    addToQueue: (trackId) => enqueue(trackId, "addToQueue"),
    moveUserItem: (fromIndex, toIndex) => {
      dispatch({ type: "moveUser", fromIndex, toIndex });
    },
    moveUpcomingSourceItem: (fromIndex, toIndex) => {
      dispatch({ type: "moveUpcomingSource", fromIndex, toIndex });
    },
    removeEntry: (queueEntryId) => {
      const previousEntryId = currentEntryId();
      const shouldPlay = isActiveStatus(refs.statusRef.current);
      const settings = deps.readPlaybackSettings();
      dispatch({
        type: "remove",
        queueEntryId,
        hideExplicit: settings.hideExplicit,
        gate: warningGateOf(settings),
      });
      followCurrent(previousEntryId, shouldPlay);
    },
    restoreQueueEntry: (item, group, index) => {
      const before = refs.queueRef.current;
      const restored = queueStateWithRestoredEntry(before, item, group, index);
      if (restored === before) return false;
      // No gate: the current entry never changes here, so the state keeps
      // its own warning question.
      dispatch({ type: "restore", state: restored });
      return true;
    },
    clearUserQueue: () => {
      dispatch({ type: "clearUserQueue" });
    },
    playEntry: (queueEntryId) => {
      // Called synchronously inside the member's click (autoplay rules).
      refs.engineRef.current?.unlock();
      refs.intentTokenRef.current += 1;
      // A jump in the queue panel names the track: that is consent (D5).
      // The waiting warned track is the current entry, so it counts too, and
      // its consent lands before the answer below clears the wait.
      const queue = refs.queueRef.current;
      const candidates = [
        ...(queue.current ? [queue.current] : []),
        ...queue.userItems,
        ...queue.sourceItems,
      ];
      const target = candidates.find(
        (item) => item.queueEntryId === queueEntryId,
      );
      if (target) consentToWarnedTrack(target.trackId);
      // A jump onto the warned track that waits answers it: Play it.
      if (queue.pendingWarning?.queueEntryId === queueEntryId) {
        const state = dispatch({ type: "consentWarning" });
        if (!state.current) return;
        refs.refreshCountRef.current = 0;
        void commands().loadEntry(state.current, 0);
        return;
      }
      const previousEntryId = currentEntryId();
      dispatch({ type: "playEntry", queueEntryId });
      followCurrent(previousEntryId, true);
    },
    toggleShuffle: () => {
      dispatch({ type: "toggleShuffle", shuffleSeed: randomShuffleSeed() });
    },
    cycleRepeat: () => {
      dispatch({ type: "cycleRepeat" });
    },
  };
}

/** What a many-track queue change did: how many of the asked tracks
 *  joined, and the error behind the first one left out, so the toast can say
 *  "Added {count} of {total}" with its reason. `error` is null when every
 *  track joined or the ones left out were left out on purpose (hidden
 *  explicit, still processing). */
export interface StudioQueueManyResult {
  queuedCount: number;
  totalCount: number;
  error: unknown;
}

export interface StudioQueueManyActions {
  /** Puts the tracks straight after the current one, in the given order. */
  playNextMany: (trackIds: string[]) => Promise<StudioQueueManyResult>;
  /** Puts the tracks at the end of the member's queue, in order. */
  addManyToQueue: (trackIds: string[]) => Promise<StudioQueueManyResult>;
}

/**
 * Play next and Add to queue for a whole release or selection. The track
 * reads run six at a time, then the queue takes them one by one from the
 * cache, so a long release neither waits on one read at a time nor floods
 * the server.
 * Play next goes in back to front to come out in order; an empty player
 * starts the first track and queues the rest after it.
 */
export function useStudioQueueMany(): StudioQueueManyActions {
  const player = useStudioPlayer();
  const queryClient = useQueryClient();
  const { demoMode } = useDemoMode();
  const playerRef = useRef(player);
  useLayoutEffect(() => {
    playerRef.current = player;
  });
  return useMemo(() => {
    async function readAll(trackIds: string[]) {
      const reads = await settleInPool(
        trackIds,
        QUEUE_READ_CONCURRENCY,
        (trackId) => {
          const options = studioTrackQueryOptions(demoMode, trackId);
          return queryClient.fetchQuery({
            ...options,
            staleTime: options.staleTime ?? TRACK_STALE_MS,
          });
        },
      );
      const firstFailure = reads.find(
        (read): read is PromiseRejectedResult => read.status === "rejected",
      );
      const readableIds = trackIds.filter(
        (_trackId, index) => reads[index]?.status === "fulfilled",
      );
      const readError: unknown = firstFailure ? firstFailure.reason : null;
      return { readableIds, readError };
    }

    async function queueMany(
      trackIds: string[],
      action: "playNext" | "addToQueue",
    ): Promise<StudioQueueManyResult> {
      const [firstId, ...restIds] = trackIds;
      const totalCount = trackIds.length;
      if (firstId === undefined)
        return { queuedCount: 0, totalCount, error: null };
      const isPlayerEmpty = !playerRef.current.hasQueue;
      // An empty player starts the first track inside the member's click,
      // where the browser still allows sound, while the rest are read.
      const firstStart = isPlayerEmpty
        ? playerRef.current.addToQueue(firstId)
        : null;
      const { readableIds, readError } = await readAll(
        isPlayerEmpty ? restIds : trackIds,
      );
      let queuedCount = 0;
      let firstError: unknown = readError;
      const noteResult = (isQueued: boolean) => {
        if (isQueued) queuedCount += 1;
        else firstError ??= takeLastQueueFailure();
      };
      if (firstStart) noteResult(await firstStart);
      const shouldGoInReverse = action === "playNext" && !isPlayerEmpty;
      const orderedIds = shouldGoInReverse
        ? [...readableIds].reverse()
        : readableIds;
      for (const trackId of orderedIds) {
        const current = playerRef.current;
        noteResult(
          await (shouldGoInReverse
            ? current.playNext(trackId)
            : current.addToQueue(trackId)),
        );
      }
      return { queuedCount, totalCount, error: firstError };
    }

    return {
      playNextMany: (trackIds) => queueMany(trackIds, "playNext"),
      addManyToQueue: (trackIds) => queueMany(trackIds, "addToQueue"),
    };
  }, [demoMode, queryClient]);
}
