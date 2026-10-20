import type { StudioTrackView } from "../api/studio.adapters";
import { studioTrackQueryOptions } from "../api/studioTrackQuery";
import type {
  StudioPlaybackStatus,
  StudioPlayerActions,
} from "./studioPlayerContext";
import { queueItemFromTrackView, toQueueItems } from "./studioQueue";
import {
  randomShuffleSeed,
  type PlayerActionDependencies,
} from "./studioTransportActions";
import { consentToWarnedTrack, warningGateOf } from "./studioWarningGate";

const TRACK_STALE_MS = 60_000;

const isActiveStatus = (status: StudioPlaybackStatus) =>
  status === "playing" || status === "loading";

export type StudioQueueActions = Pick<
  StudioPlayerActions,
  | "playNext"
  | "addToQueue"
  | "moveUserItem"
  | "moveUpcomingSourceItem"
  | "removeEntry"
  | "clearUserQueue"
  | "playEntry"
  | "toggleShuffle"
  | "cycleRepeat"
>;

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
    try {
      const options = studioTrackQueryOptions(deps.demoMode, trackId);
      track = await deps.queryClient.fetchQuery({
        ...options,
        staleTime: options.staleTime ?? TRACK_STALE_MS,
      });
    } catch {
      // The read reported a withdrawn grant itself (readStudio).
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
