import { hashOfText, seededRandom } from "../studioSeededRandom";
import type {
  StudioQueueItem,
  StudioQueueSource,
  StudioQueueView,
  StudioRepeatMode,
} from "./studioPlayerContext";
import { extendRadioQueue, shuffledQueue } from "./studioQueue";
import { isWarningGated, type StudioWarningGate } from "./studioWarningGate";

/**
 * The queue (spec 5.1). Pure: no storage, no audio, no time. Randomness
 * arrives as a seed inside the action, so a test can repeat any shuffle.
 * Nothing here leaves the browser.
 */
export interface StudioQueueState {
  source: StudioQueueSource | null;
  /** The source in its current play order, played items included. */
  sourceItems: StudioQueueItem[];
  /** The source in its own order, for switching shuffle off. */
  originalSourceItems: StudioQueueItem[];
  /** "Your queue": plays before the rest of the source. */
  userItems: StudioQueueItem[];
  current: StudioQueueItem | null;
  currentFrom: "source" | "user" | null;
  /** The current source position: the current item when currentFrom is
   *  "source", the last source item played when it is "user", -1 before
   *  any. */
  sourceIndex: number;
  isShuffled: boolean;
  repeat: StudioRepeatMode;
  /** Studio safety (spec 6.3): set when an automatic move landed on a
   *  warned track the member has not agreed to hear. That track is current
   *  and cued; nothing streams it until Play it. Missing reads as none
   *  (states built before this field, saved snapshots). */
  pendingWarning?: StudioQueueItem | null;
}

export type StudioQueueAction =
  | {
      type: "playSource";
      source: StudioQueueSource | null;
      items: StudioQueueItem[];
      startIndex: number;
      shuffleSeed: number;
      gate?: StudioWarningGate;
    }
  | { type: "playNext"; items: StudioQueueItem[] }
  | { type: "addToQueue"; items: StudioQueueItem[] }
  | { type: "moveUser"; fromIndex: number; toIndex: number }
  | { type: "moveUpcomingSource"; fromIndex: number; toIndex: number }
  | {
      type: "remove";
      queueEntryId: string;
      hideExplicit?: boolean;
      gate?: StudioWarningGate;
    }
  | { type: "clearUserQueue" }
  | { type: "playEntry"; queueEntryId: string }
  | { type: "next"; hideExplicit?: boolean; gate?: StudioWarningGate }
  | { type: "previous"; hideExplicit?: boolean; gate?: StudioWarningGate }
  | { type: "toggleShuffle"; shuffleSeed: number }
  | { type: "cycleRepeat" }
  | { type: "trackEnded"; hideExplicit?: boolean; gate?: StudioWarningGate }
  | { type: "restore"; state: StudioQueueState; gate?: StudioWarningGate }
  /** Play it: the member agreed to hear the track that waits. */
  | { type: "consentWarning" }
  | { type: "reset" };

export const EMPTY_QUEUE_STATE: StudioQueueState = {
  source: null,
  sourceItems: [],
  originalSourceItems: [],
  userItems: [],
  current: null,
  currentFrom: null,
  sourceIndex: -1,
  isShuffled: false,
  repeat: "off",
  pendingWarning: null,
};

const NEXT_REPEAT: Record<StudioRepeatMode, StudioRepeatMode> = {
  off: "all",
  all: "one",
  one: "off",
};

const isEntry = (queueEntryId: string) => (item: StudioQueueItem) =>
  item.queueEntryId === queueEntryId;
const withoutEntry = (items: StudioQueueItem[], queueEntryId: string) =>
  items.filter((item) => item.queueEntryId !== queueEntryId);

/** A copy with one row moved, or null when the move changes nothing. The
 *  target is clamped into the list. */
function moveWithin<Item>(
  items: readonly Item[],
  fromIndex: number,
  toIndex: number,
): Item[] | null {
  if (
    !Number.isInteger(fromIndex) ||
    fromIndex < 0 ||
    fromIndex >= items.length
  )
    return null;
  const target = Math.min(Math.max(Math.trunc(toIndex), 0), items.length - 1);
  if (target === fromIndex) return null;
  const moved = [...items];
  const [row] = moved.splice(fromIndex, 1);
  if (row === undefined) return null;
  moved.splice(target, 0, row);
  return moved;
}

/** Hide explicit (contract F.2): explicit items are stepped over while the
 *  member's setting hides them. */
const isPlayable = (item: StudioQueueItem, hideExplicit: boolean) =>
  !hideExplicit || !item.isExplicit;

function firstPlayableIndex(
  items: readonly StudioQueueItem[],
  fromIndex: number,
  hideExplicit: boolean,
): number {
  for (let index = Math.max(0, fromIndex); index < items.length; index += 1) {
    const item = items[index];
    if (item && isPlayable(item, hideExplicit)) return index;
  }
  return -1;
}

function lastPlayableIndex(
  items: readonly StudioQueueItem[],
  atOrBeforeIndex: number,
  hideExplicit: boolean,
): number {
  for (
    let index = Math.min(atOrBeforeIndex, items.length - 1);
    index >= 0;
    index -= 1
  ) {
    const item = items[index];
    if (item && isPlayable(item, hideExplicit)) return index;
  }
  return -1;
}

/** What plays after the current item: on a natural end (repeat one replays
 *  it) or on a manual next, stepping over hidden explicit items. Null when
 *  nothing follows. */
export function peekNext(
  state: StudioQueueState,
  isManual = false,
  hideExplicit = false,
): StudioQueueItem | null {
  if (!state.current) return null;
  if (!isManual && state.repeat === "one") return state.current;
  const userItem = state.userItems.find((item) =>
    isPlayable(item, hideExplicit),
  );
  if (userItem) return userItem;
  const nextIndex = firstPlayableIndex(
    state.sourceItems,
    state.sourceIndex + 1,
    hideExplicit,
  );
  const sourceItem = state.sourceItems[nextIndex];
  if (sourceItem) return sourceItem;
  if (state.repeat !== "all") return null;
  return (
    state.sourceItems[firstPlayableIndex(state.sourceItems, 0, hideExplicit)] ??
    null
  );
}

function advanced(
  state: StudioQueueState,
  isManual: boolean,
  hideExplicit = false,
): StudioQueueState {
  const repeat: StudioRepeatMode =
    isManual && state.repeat === "one" ? "off" : state.repeat;
  // Hidden user items in front of the next playable one are spent.
  const userPosition = state.userItems.findIndex((item) =>
    isPlayable(item, hideExplicit),
  );
  const nextUserItem = state.userItems[userPosition];
  if (nextUserItem)
    return {
      ...state,
      current: nextUserItem,
      currentFrom: "user",
      userItems: state.userItems.slice(userPosition + 1),
      repeat,
    };
  const nextIndex = firstPlayableIndex(
    state.sourceItems,
    state.sourceIndex + 1,
    hideExplicit,
  );
  const nextSourceItem = state.sourceItems[nextIndex];
  if (nextSourceItem)
    return {
      ...state,
      current: nextSourceItem,
      currentFrom: "source",
      sourceIndex: nextIndex,
      repeat,
    };
  const firstIndex = firstPlayableIndex(state.sourceItems, 0, hideExplicit);
  const firstSourceItem = state.sourceItems[firstIndex];
  if (state.repeat === "all" && firstSourceItem)
    return {
      ...state,
      current: firstSourceItem,
      currentFrom: "source",
      sourceIndex: firstIndex,
      repeat,
    };
  return repeat === state.repeat ? state : { ...state, repeat };
}

function previousState(
  state: StudioQueueState,
  hideExplicit = false,
): StudioQueueState {
  if (!state.current) return state;
  if (state.currentFrom === "user") {
    const backIndex = lastPlayableIndex(
      state.sourceItems,
      state.sourceIndex,
      hideExplicit,
    );
    const sourceItem = state.sourceItems[backIndex];
    return sourceItem
      ? {
          ...state,
          current: sourceItem,
          currentFrom: "source",
          sourceIndex: backIndex,
        }
      : state;
  }
  const previousIndex = lastPlayableIndex(
    state.sourceItems,
    state.sourceIndex - 1,
    hideExplicit,
  );
  const previousItem = state.sourceItems[previousIndex];
  if (previousItem)
    return { ...state, current: previousItem, sourceIndex: previousIndex };
  const lastIndex = lastPlayableIndex(
    state.sourceItems,
    state.sourceItems.length - 1,
    hideExplicit,
  );
  const lastItem = state.sourceItems[lastIndex];
  if (state.repeat === "all" && lastItem && lastIndex !== state.sourceIndex)
    return { ...state, current: lastItem, sourceIndex: lastIndex };
  return state;
}

/** Whether Previous has an item to go back to (otherwise it restarts). */
export function hasPreviousItem(
  state: StudioQueueState,
  hideExplicit = false,
): boolean {
  return previousState(state, hideExplicit) !== state;
}

/** The radio's pool: each track of the source once, in its own order. A
 *  shuffle, a move or a refill while shuffled can copy refilled entries into
 *  the original order, so the pool keeps the first entry of every track. */
function radioPool(state: StudioQueueState): StudioQueueItem[] {
  const seenTrackIds = new Set<string>();
  return state.originalSourceItems.filter((item) => {
    if (seenTrackIds.has(item.trackId)) return false;
    seenTrackIds.add(item.trackId);
    return true;
  });
}

/** Entry ids for one refill: derived from the state (the reducer stays
 *  pure) and checked against every id already queued, so each is unique. */
function refillEntryIds(state: StudioQueueState, seed: number): () => string {
  const takenIds = new Set(
    [...state.sourceItems, ...state.userItems].map((item) => item.queueEntryId),
  );
  if (state.current) takenIds.add(state.current.queueEntryId);
  const prefix = `radio-${seed.toString(36)}`;
  let sequence = 0;
  return () => {
    sequence += 1;
    let candidate = `${prefix}-${sequence}`;
    while (takenIds.has(candidate)) {
      sequence += 1;
      candidate = `${prefix}-${sequence}`;
    }
    takenIds.add(candidate);
    return candidate;
  };
}

/** Radio (contract F.1): when the source reaches its last item, Discovery's
 *  extendRadioQueue appends a fresh shuffle of the pool whose first item
 *  differs from the last one queued; a pool of fewer than two distinct
 *  tracks ends. The shuffle seed and the new entry ids come from the state,
 *  so the same state always refills the same way. */
function withRadioRefill(state: StudioQueueState): StudioQueueState {
  if (state.source?.kind !== "radio" || !state.current) return state;
  if (state.sourceIndex < state.sourceItems.length - 1) return state;
  const lastItem = state.sourceItems[state.sourceItems.length - 1];
  if (!lastItem) return state;
  const seed = hashOfText(
    `${lastItem.queueEntryId}:${state.sourceItems.length}`,
  );
  const sourceItems = extendRadioQueue(
    state.sourceItems,
    radioPool(state),
    seededRandom(seed),
    refillEntryIds(state, seed),
  );
  if (sourceItems === state.sourceItems) return state;
  // While shuffled, the original order gets the refill too, so switching
  // shuffle off keeps the current entry and what follows it.
  const originalSourceItems = state.isShuffled
    ? [
        ...state.originalSourceItems,
        ...sourceItems.slice(state.sourceItems.length),
      ]
    : state.originalSourceItems;
  return { ...state, sourceItems, originalSourceItems };
}

function playSource(
  state: StudioQueueState,
  action: Extract<StudioQueueAction, { type: "playSource" }>,
): StudioQueueState {
  const chosenIndex = action.items[action.startIndex] ? action.startIndex : 0;
  const chosen = action.items[chosenIndex];
  if (!chosen) return state;
  const others = [
    ...action.items.slice(0, chosenIndex),
    ...action.items.slice(chosenIndex + 1),
  ];
  return {
    ...state,
    source: action.source,
    sourceItems: state.isShuffled
      ? [chosen, ...shuffledQueue(others, seededRandom(action.shuffleSeed))]
      : [...action.items],
    originalSourceItems: [...action.items],
    current: chosen,
    currentFrom: "source",
    sourceIndex: state.isShuffled ? 0 : chosenIndex,
  };
}

function enqueued(
  state: StudioQueueState,
  items: StudioQueueItem[],
  isFront: boolean,
): StudioQueueState {
  if (state.current === null) {
    const [first, ...rest] = items;
    if (!first) return state;
    return { ...state, current: first, currentFrom: "user", userItems: rest };
  }
  if (items.length === 0) return state;
  return {
    ...state,
    userItems: isFront
      ? [...items, ...state.userItems]
      : [...state.userItems, ...items],
  };
}

function removed(
  state: StudioQueueState,
  queueEntryId: string,
  hideExplicit = false,
): StudioQueueState {
  const sourcePosition = state.sourceItems.findIndex(isEntry(queueEntryId));
  const isCurrent = state.current?.queueEntryId === queueEntryId;
  if (
    sourcePosition === -1 &&
    !isCurrent &&
    !state.userItems.some(isEntry(queueEntryId))
  )
    return state;
  const trimmed: StudioQueueState = {
    ...state,
    userItems: withoutEntry(state.userItems, queueEntryId),
    sourceItems: withoutEntry(state.sourceItems, queueEntryId),
    originalSourceItems: withoutEntry(state.originalSourceItems, queueEntryId),
    sourceIndex:
      sourcePosition !== -1 && sourcePosition <= state.sourceIndex
        ? state.sourceIndex - 1
        : state.sourceIndex,
  };
  if (!isCurrent) return trimmed;
  const following = advanced(trimmed, false, hideExplicit);
  if (following.current?.queueEntryId === queueEntryId)
    return {
      ...EMPTY_QUEUE_STATE,
      isShuffled: state.isShuffled,
      repeat: state.repeat,
    };
  return following;
}

function jumpedTo(
  state: StudioQueueState,
  queueEntryId: string,
): StudioQueueState {
  if (state.current?.queueEntryId === queueEntryId) return state;
  const repeat: StudioRepeatMode =
    state.repeat === "one" ? "off" : state.repeat;
  const userPosition = state.userItems.findIndex(isEntry(queueEntryId));
  const userItem = state.userItems[userPosition];
  if (userItem)
    return {
      ...state,
      current: userItem,
      currentFrom: "user",
      userItems: state.userItems.slice(userPosition + 1),
      repeat,
    };
  const sourcePosition = state.sourceItems.findIndex(isEntry(queueEntryId));
  const sourceItem = state.sourceItems[sourcePosition];
  if (!sourceItem) return state;
  return {
    ...state,
    current: sourceItem,
    currentFrom: "source",
    sourceIndex: sourcePosition,
    repeat,
  };
}

function shuffleToggled(
  state: StudioQueueState,
  shuffleSeed: number,
): StudioQueueState {
  if (!state.isShuffled) {
    const played = state.sourceItems.slice(0, state.sourceIndex + 1);
    const upcoming = state.sourceItems.slice(state.sourceIndex + 1);
    return {
      ...state,
      isShuffled: true,
      originalSourceItems: [...state.sourceItems],
      sourceItems: [
        ...played,
        ...shuffledQueue(upcoming, seededRandom(shuffleSeed)),
      ],
    };
  }
  const anchor = state.sourceItems[state.sourceIndex];
  const byEntry = anchor
    ? state.originalSourceItems.findIndex(isEntry(anchor.queueEntryId))
    : -1;
  // An entry missing from the original order: find its track's latest copy.
  const sourceIndex =
    anchor && byEntry === -1
      ? state.originalSourceItems.findLastIndex(
          (item) => item.trackId === anchor.trackId,
        )
      : byEntry;
  return {
    ...state,
    isShuffled: false,
    sourceItems: [...state.originalSourceItems],
    sourceIndex,
  };
}

function upcomingMoved(
  state: StudioQueueState,
  fromIndex: number,
  toIndex: number,
): StudioQueueState {
  const played = state.sourceItems.slice(0, state.sourceIndex + 1);
  const moved = moveWithin(
    state.sourceItems.slice(state.sourceIndex + 1),
    fromIndex,
    toIndex,
  );
  if (!moved) return state;
  const sourceItems = [...played, ...moved];
  return {
    ...state,
    sourceItems,
    originalSourceItems: state.isShuffled
      ? state.originalSourceItems
      : sourceItems,
  };
}

function reduceQueue(
  state: StudioQueueState,
  action: StudioQueueAction,
): StudioQueueState {
  switch (action.type) {
    case "playSource":
      return playSource(state, action);
    case "playNext":
      return enqueued(state, action.items, true);
    case "addToQueue":
      return enqueued(state, action.items, false);
    case "moveUser": {
      const userItems = moveWithin(
        state.userItems,
        action.fromIndex,
        action.toIndex,
      );
      return userItems ? { ...state, userItems } : state;
    }
    case "moveUpcomingSource":
      return upcomingMoved(state, action.fromIndex, action.toIndex);
    case "remove":
      return removed(state, action.queueEntryId, action.hideExplicit);
    case "clearUserQueue":
      return state.userItems.length === 0 ? state : { ...state, userItems: [] };
    case "playEntry":
      return jumpedTo(state, action.queueEntryId);
    case "next":
      return advanced(state, true, action.hideExplicit);
    case "previous":
      return previousState(state, action.hideExplicit);
    case "toggleShuffle":
      return shuffleToggled(state, action.shuffleSeed);
    case "cycleRepeat":
      return { ...state, repeat: NEXT_REPEAT[state.repeat] };
    case "trackEnded":
      return state.repeat === "one"
        ? state
        : advanced(state, false, action.hideExplicit);
    case "restore":
      return action.state;
    case "consentWarning":
      return state.pendingWarning ? { ...state, pendingWarning: null } : state;
    case "reset":
      return {
        ...EMPTY_QUEUE_STATE,
        isShuffled: state.isShuffled,
        repeat: state.repeat,
      };
  }
}

/** The question a restored state carries: with a gate (a saved queue coming
 *  back), the gate is asked again on the restored current entry. Without one
 *  (dropHiddenRadioItems, which drops upcoming radio entries and never
 *  changes the current one), the state keeps its own question while it
 *  still names the current entry. */
function restoredPendingWarning(
  restored: StudioQueueState,
  gate: StudioWarningGate | undefined,
): StudioQueueItem | null {
  const current = restored.current;
  if (gate) return isWarningGated(current, gate) ? current : null;
  const pending = restored.pendingWarning ?? null;
  return pending && pending.queueEntryId === current?.queueEntryId
    ? pending
    : null;
}

/** Spec 6.3 (D5): a move onto a warned track the member has not agreed to
 *  hear stops there with `pendingWarning` set, when the move carries a gate
 *  (next, a track end, a removed current entry, a new queue, previous). A
 *  move without one (a jump, Play next into an empty player) is a direct
 *  choice and clears the question. A move that changes nothing keeps it. A
 *  restore follows `restoredPendingWarning`. */
function withWarningGate(
  before: StudioQueueState,
  reduced: StudioQueueState,
  action: StudioQueueAction,
): StudioQueueState {
  if (action.type === "consentWarning") return reduced;
  let pendingWarning: StudioQueueItem | null;
  if (action.type === "restore") {
    pendingWarning = restoredPendingWarning(reduced, action.gate);
  } else {
    const hasMoved =
      reduced.current?.queueEntryId !== before.current?.queueEntryId;
    if (!hasMoved) return reduced;
    const gate = "gate" in action ? action.gate : undefined;
    pendingWarning = isWarningGated(reduced.current, gate)
      ? reduced.current
      : null;
  }
  if ((reduced.pendingWarning ?? null) === pendingWarning) return reduced;
  return { ...reduced, pendingWarning };
}

export function studioQueueReducer(
  state: StudioQueueState,
  action: StudioQueueAction,
): StudioQueueState {
  const reduced = reduceQueue(state, action);
  if (action.type === "reset") return reduced;
  const gated = withWarningGate(state, reduced, action);
  if (action.type === "restore") return gated;
  return withRadioRefill(gated);
}

/** The public shape (contract C StudioQueueView). */
export function toQueueView(state: StudioQueueState): StudioQueueView {
  return {
    source: state.source,
    current: state.current,
    userItems: state.userItems,
    upcomingSourceItems: state.sourceItems.slice(state.sourceIndex + 1),
    isShuffled: state.isShuffled,
    repeat: state.repeat,
  };
}
