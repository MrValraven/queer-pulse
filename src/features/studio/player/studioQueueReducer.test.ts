import { describe, expect, it } from "vitest";
import { seededRandom } from "../studioSeededRandom";
import type { StudioQueueItem } from "./studioPlayerContext";
import { shuffledQueue } from "./studioQueue";
import {
  EMPTY_QUEUE_STATE,
  hasPreviousItem,
  peekNext,
  studioQueueReducer,
  toQueueView,
  type StudioQueueAction,
  type StudioQueueState,
} from "./studioQueueReducer";

const item = (
  trackId: string,
  queueEntryId = trackId,
  isExplicit = false,
): StudioQueueItem => ({
  trackId,
  title: trackId,
  durationSeconds: 100,
  trackHref: `/studio/track?id=${trackId}`,
  releaseId: "r1",
  releaseTitle: "Release",
  coverUrl: null,
  tint: "coral",
  artistId: "p1",
  artistName: "Artist",
  artistHref: "/studio/artist?id=p1",
  queueEntryId,
  isExplicit,
});
const SOURCE = {
  kind: "release" as const,
  label: "Release",
  href: "/studio/album?id=r1",
};
const sourceItems = ["a", "b", "c", "d"].map((trackId) => item(trackId));
const ids = (items: readonly StudioQueueItem[]) =>
  items.map((entry) => entry.queueEntryId);

function run(state: StudioQueueState, ...actions: StudioQueueAction[]) {
  return actions.reduce(studioQueueReducer, state);
}
function started(startIndex = 0, base: StudioQueueState = EMPTY_QUEUE_STATE) {
  return run(base, {
    type: "playSource",
    source: SOURCE,
    items: sourceItems,
    startIndex,
    shuffleSeed: 7,
  });
}

describe("playSource", () => {
  it("plays from the chosen item and lists the rest as upcoming", () => {
    const view = toQueueView(started(1));
    expect(view.source).toEqual(SOURCE);
    expect(view.current?.queueEntryId).toBe("b");
    expect(ids(view.upcomingSourceItems)).toEqual(["c", "d"]);
  });

  it("starts at the first item for an index out of range, and ignores an empty list", () => {
    expect(started(9).current?.queueEntryId).toBe("a");
    const empty = run(EMPTY_QUEUE_STATE, {
      type: "playSource",
      source: SOURCE,
      items: [],
      startIndex: 0,
      shuffleSeed: 1,
    });
    expect(empty).toBe(EMPTY_QUEUE_STATE);
  });

  it("keeps Your queue when a new source starts", () => {
    const withUser = run(started(), { type: "addToQueue", items: [item("x")] });
    const restarted = started(0, withUser);
    expect(ids(restarted.userItems)).toEqual(["x"]);
  });

  it("with shuffle on, plays the chosen item first and shuffles the rest", () => {
    const shuffledBase = { ...EMPTY_QUEUE_STATE, isShuffled: true };
    const state = started(2, shuffledBase);
    expect(state.current?.queueEntryId).toBe("c");
    expect(ids(state.sourceItems.slice(1))).toEqual(
      ids(shuffledQueue([item("a"), item("b"), item("d")], seededRandom(7))),
    );
    expect(ids(state.originalSourceItems)).toEqual(["a", "b", "c", "d"]);
  });
});

describe("Play next and Add to queue", () => {
  it("puts Play next in front of Your queue and Add to queue at the end", () => {
    const state = run(
      started(),
      { type: "addToQueue", items: [item("x")] },
      { type: "playNext", items: [item("y")] },
      { type: "addToQueue", items: [item("z")] },
    );
    expect(ids(state.userItems)).toEqual(["y", "x", "z"]);
  });

  it("plays the first item at once on an empty player", () => {
    const state = run(EMPTY_QUEUE_STATE, {
      type: "addToQueue",
      items: [item("x"), item("y")],
    });
    expect(state.current?.queueEntryId).toBe("x");
    expect(state.currentFrom).toBe("user");
    expect(ids(state.userItems)).toEqual(["y"]);
  });

  it("holds the same track twice as two entries", () => {
    const state = run(started(), {
      type: "addToQueue",
      items: [item("a", "a-again"), item("a", "a-third")],
    });
    expect(state.userItems.map((entry) => entry.trackId)).toEqual(["a", "a"]);
    const afterRemove = run(state, { type: "remove", queueEntryId: "a-again" });
    expect(ids(afterRemove.userItems)).toEqual(["a-third"]);
  });

  it("consumes a user item when it starts, then resumes the source", () => {
    const state = run(
      started(),
      { type: "addToQueue", items: [item("x")] },
      { type: "next" },
    );
    expect(state.current?.queueEntryId).toBe("x");
    expect(state.userItems).toEqual([]);
    expect(run(state, { type: "next" }).current?.queueEntryId).toBe("b");
  });
});

describe("next, trackEnded and repeat", () => {
  it("stays on the last item at the end with repeat off", () => {
    const atEnd = started(3);
    expect(peekNext(atEnd)).toBeNull();
    expect(run(atEnd, { type: "next" }).current?.queueEntryId).toBe("d");
  });

  it("wraps the source with repeat all", () => {
    const state = run(started(3), { type: "cycleRepeat" });
    expect(state.repeat).toBe("all");
    expect(peekNext(state)?.queueEntryId).toBe("a");
    expect(run(state, { type: "trackEnded" }).current?.queueEntryId).toBe("a");
  });

  it("replays the current item with repeat one and clears it on a manual next", () => {
    const repeatOne = run(
      started(1),
      { type: "cycleRepeat" },
      { type: "cycleRepeat" },
    );
    expect(repeatOne.repeat).toBe("one");
    expect(peekNext(repeatOne)?.queueEntryId).toBe("b");
    expect(run(repeatOne, { type: "trackEnded" })).toBe(repeatOne);
    const skipped = run(repeatOne, { type: "next" });
    expect(skipped.current?.queueEntryId).toBe("c");
    expect(skipped.repeat).toBe("off");
  });

  it("cycles off, all, one, off", () => {
    const modes = [1, 2, 3].map(
      (count) =>
        run(
          EMPTY_QUEUE_STATE,
          ...Array.from(
            { length: count },
            () => ({ type: "cycleRepeat" }) as const,
          ),
        ).repeat,
    );
    expect(modes).toEqual(["all", "one", "off"]);
  });
});

describe("previous", () => {
  it("steps back through the source", () => {
    const state = run(started(2), { type: "previous" });
    expect(state.current?.queueEntryId).toBe("b");
  });

  it("has nothing before the first item unless repeat all wraps to the last", () => {
    expect(hasPreviousItem(started(0))).toBe(false);
    expect(run(started(0), { type: "previous" })).toEqual(started(0));
    const wrapped = run(
      started(0),
      { type: "cycleRepeat" },
      { type: "previous" },
    );
    expect(wrapped.current?.queueEntryId).toBe("d");
  });

  it("goes from a user item back to the source item that played before it", () => {
    const state = run(
      started(1),
      { type: "playNext", items: [item("x")] },
      { type: "next" },
      { type: "previous" },
    );
    expect(state.current?.queueEntryId).toBe("b");
    expect(state.currentFrom).toBe("source");
  });
});

describe("shuffle", () => {
  it("shuffles only what comes after the current item", () => {
    const state = run(started(1), { type: "toggleShuffle", shuffleSeed: 3 });
    expect(ids(state.sourceItems.slice(0, 2))).toEqual(["a", "b"]);
    expect(ids(toQueueView(state).upcomingSourceItems)).toEqual(
      ids(shuffledQueue([item("c"), item("d")], seededRandom(3))),
    );
  });

  it("restores the original order from the current track onward", () => {
    const shuffledThenNext = run(
      started(0),
      { type: "toggleShuffle", shuffleSeed: 11 },
      { type: "next" },
    );
    const current = shuffledThenNext.current?.queueEntryId ?? "";
    const restored = run(shuffledThenNext, {
      type: "toggleShuffle",
      shuffleSeed: 0,
    });
    expect(restored.isShuffled).toBe(false);
    expect(restored.current?.queueEntryId).toBe(current);
    const position = ["a", "b", "c", "d"].indexOf(current);
    expect(ids(toQueueView(restored).upcomingSourceItems)).toEqual(
      ["a", "b", "c", "d"].slice(position + 1),
    );
  });

  it("gives back the same order and position after two toggles", () => {
    const before = started(1);
    const after = run(
      before,
      { type: "toggleShuffle", shuffleSeed: 3 },
      { type: "toggleShuffle", shuffleSeed: 9 },
    );
    expect(ids(after.sourceItems)).toEqual(ids(before.sourceItems));
    expect(after.sourceIndex).toBe(before.sourceIndex);
    expect(after.current?.queueEntryId).toBe("b");
  });
});

describe("moving rows", () => {
  it("moves within Your queue and clamps the target", () => {
    const state = run(started(), {
      type: "addToQueue",
      items: [item("x"), item("y"), item("z")],
    });
    expect(
      ids(run(state, { type: "moveUser", fromIndex: 2, toIndex: 0 }).userItems),
    ).toEqual(["z", "x", "y"]);
    expect(
      ids(
        run(state, { type: "moveUser", fromIndex: 0, toIndex: 99 }).userItems,
      ),
    ).toEqual(["y", "z", "x"]);
    expect(run(state, { type: "moveUser", fromIndex: 5, toIndex: 0 })).toBe(
      state,
    );
    expect(run(state, { type: "moveUser", fromIndex: -1, toIndex: 0 })).toBe(
      state,
    );
  });

  it("moves upcoming source rows; unshuffled, the original order follows", () => {
    const moved = run(started(1), {
      type: "moveUpcomingSource",
      fromIndex: 1,
      toIndex: 0,
    });
    expect(ids(toQueueView(moved).upcomingSourceItems)).toEqual(["d", "c"]);
    expect(ids(moved.originalSourceItems)).toEqual(["a", "b", "d", "c"]);
  });

  it("keeps the original order when the move happens in shuffle", () => {
    const shuffled = run(started(0), { type: "toggleShuffle", shuffleSeed: 5 });
    const moved = run(shuffled, {
      type: "moveUpcomingSource",
      fromIndex: 0,
      toIndex: 2,
    });
    expect(ids(moved.originalSourceItems)).toEqual(["a", "b", "c", "d"]);
  });
});

describe("removing rows", () => {
  it("removes an upcoming source row from both orders", () => {
    const state = run(started(0), { type: "remove", queueEntryId: "c" });
    expect(ids(state.sourceItems)).toEqual(["a", "b", "d"]);
    expect(ids(state.originalSourceItems)).toEqual(["a", "b", "d"]);
  });

  it("keeps the current item when a played row goes", () => {
    const state = run(started(2), { type: "remove", queueEntryId: "a" });
    expect(state.current?.queueEntryId).toBe("c");
    expect(ids(toQueueView(state).upcomingSourceItems)).toEqual(["d"]);
  });

  it("plays the next item when the current one is removed", () => {
    const state = run(started(1), { type: "remove", queueEntryId: "b" });
    expect(state.current?.queueEntryId).toBe("c");
    expect(ids(toQueueView(state).upcomingSourceItems)).toEqual(["d"]);
  });

  it("empties the queue when the removed current item had nothing after it", () => {
    const state = run(started(3), { type: "remove", queueEntryId: "d" });
    expect(state.current).toBeNull();
    expect(toQueueView(state).upcomingSourceItems).toEqual([]);
  });

  it("clears Your queue", () => {
    const state = run(
      started(),
      { type: "addToQueue", items: [item("x")] },
      { type: "clearUserQueue" },
    );
    expect(state.userItems).toEqual([]);
  });
});

describe("playEntry", () => {
  it("jumps to a Your queue row and drops the rows above it", () => {
    const state = run(
      started(),
      { type: "addToQueue", items: [item("x"), item("y"), item("z")] },
      { type: "playEntry", queueEntryId: "y" },
    );
    expect(state.current?.queueEntryId).toBe("y");
    expect(state.currentFrom).toBe("user");
    expect(ids(state.userItems)).toEqual(["z"]);
  });

  it("jumps to a source row and keeps Your queue", () => {
    const state = run(
      started(),
      { type: "addToQueue", items: [item("x")] },
      { type: "playEntry", queueEntryId: "c" },
    );
    expect(state.current?.queueEntryId).toBe("c");
    expect(ids(state.userItems)).toEqual(["x"]);
    expect(ids(toQueueView(state).upcomingSourceItems)).toEqual(["d"]);
  });
});

describe("hide explicit", () => {
  const mixed = [
    item("a"),
    item("b", "b", true),
    item("c"),
    item("d", "d", true),
  ];
  const mixedState = () =>
    run(EMPTY_QUEUE_STATE, {
      type: "playSource",
      source: SOURCE,
      items: mixed,
      startIndex: 0,
      shuffleSeed: 1,
    });

  it("steps over explicit items on next, auto-advance and previous", () => {
    expect(peekNext(mixedState(), false, true)?.queueEntryId).toBe("c");
    const atC = run(mixedState(), { type: "next", hideExplicit: true });
    expect(atC.current?.queueEntryId).toBe("c");
    expect(
      run(mixedState(), { type: "trackEnded", hideExplicit: true }).current
        ?.queueEntryId,
    ).toBe("c");
    expect(peekNext(atC, true, true)).toBeNull();
    expect(
      run(atC, { type: "previous", hideExplicit: true }).current?.queueEntryId,
    ).toBe("a");
    expect(hasPreviousItem(atC, true)).toBe(true);
  });

  it("plays explicit items when they are not hidden", () => {
    expect(peekNext(mixedState())?.queueEntryId).toBe("b");
  });

  it("spends hidden items in Your queue", () => {
    const state = run(
      mixedState(),
      { type: "addToQueue", items: [item("x", "x", true), item("y")] },
      { type: "next", hideExplicit: true },
    );
    expect(state.current?.queueEntryId).toBe("y");
    expect(state.userItems).toEqual([]);
  });
});

describe("radio", () => {
  const RADIO = { kind: "radio" as const, label: "Radio", href: null };
  const radioFrom = (startIndex: number) =>
    run(EMPTY_QUEUE_STATE, {
      type: "playSource",
      source: RADIO,
      items: sourceItems,
      startIndex,
      shuffleSeed: 3,
    });

  it("reshuffles and appends the same tracks when it reaches the last one", () => {
    const state = radioFrom(3);
    const upcoming = toQueueView(state).upcomingSourceItems;
    expect(upcoming).toHaveLength(4);
    expect([...upcoming.map((entry) => entry.trackId)].sort()).toEqual([
      "a",
      "b",
      "c",
      "d",
    ]);
    expect(upcoming[0]?.trackId).not.toBe("d");
    const allIds = ids(state.sourceItems);
    expect(new Set(allIds).size).toBe(allIds.length);
  });

  it("keeps refilling as it plays on", () => {
    let state = radioFrom(3);
    for (let step = 0; step < 4; step += 1)
      state = run(state, { type: "trackEnded" });
    expect(peekNext(state)).not.toBeNull();
    expect(state.sourceItems.length).toBeGreaterThanOrEqual(12);
    const allIds = ids(state.sourceItems);
    expect(new Set(allIds).size).toBe(allIds.length);
  });

  it("refills each track once after a shuffle copies refilled entries", () => {
    let state = run(radioFrom(3), { type: "toggleShuffle", shuffleSeed: 2 });
    expect(state.originalSourceItems).toHaveLength(8);
    for (let step = 0; step < 4; step += 1)
      state = run(state, { type: "trackEnded" });
    expect(state.sourceItems).toHaveLength(12);
    const refill = state.sourceItems.slice(8).map((entry) => entry.trackId);
    expect([...refill].sort()).toEqual(["a", "b", "c", "d"]);
  });

  it("keeps the current refill entry and what follows when shuffle goes off", () => {
    let state = run(radioFrom(0), { type: "toggleShuffle", shuffleSeed: 4 });
    for (let step = 0; step < 5; step += 1)
      state = run(state, { type: "trackEnded" });
    expect(state.sourceItems).toHaveLength(8);
    expect(state.sourceIndex).toBe(5);
    const upcomingBefore = ids(toQueueView(state).upcomingSourceItems);
    const played = ids(state.sourceItems.slice(0, state.sourceIndex + 1));
    const restored = run(state, { type: "toggleShuffle", shuffleSeed: 0 });
    expect(restored.isShuffled).toBe(false);
    expect(restored.current?.queueEntryId).toBe(state.current?.queueEntryId);
    expect(restored.sourceItems[restored.sourceIndex]?.queueEntryId).toBe(
      restored.current?.queueEntryId,
    );
    const upcomingAfter = ids(toQueueView(restored).upcomingSourceItems);
    expect(upcomingAfter).toEqual(upcomingBefore);
    expect(upcomingAfter).toHaveLength(2);
    expect(upcomingAfter.filter((entryId) => played.includes(entryId))).toEqual(
      [],
    );
  });

  it("refills the same way from the same state", () => {
    expect(ids(radioFrom(3).sourceItems)).toEqual(
      ids(radioFrom(3).sourceItems),
    );
  });

  it("ends a radio whose pool holds one track", () => {
    const single = run(EMPTY_QUEUE_STATE, {
      type: "playSource",
      source: RADIO,
      items: [item("a")],
      startIndex: 0,
      shuffleSeed: 1,
    });
    expect(peekNext(single)).toBeNull();
  });

  it("never starts a two-track refill with the track that just played", () => {
    const pair = run(EMPTY_QUEUE_STATE, {
      type: "playSource",
      source: RADIO,
      items: [item("a"), item("b")],
      startIndex: 1,
      shuffleSeed: 1,
    });
    expect(toQueueView(pair).upcomingSourceItems[0]?.trackId).toBe("a");
  });

  it("leaves other sources to end", () => {
    expect(peekNext(started(3))).toBeNull();
  });
});

describe("restore and reset", () => {
  it("restores a saved state as it was", () => {
    const saved = run(started(2), { type: "cycleRepeat" });
    expect(run(EMPTY_QUEUE_STATE, { type: "restore", state: saved })).toBe(
      saved,
    );
  });

  it("empties the queue and keeps the shuffle and repeat choices", () => {
    const state = run(
      started(1),
      { type: "toggleShuffle", shuffleSeed: 1 },
      { type: "cycleRepeat" },
      { type: "reset" },
    );
    expect(state.current).toBeNull();
    expect(state.sourceItems).toEqual([]);
    expect(state.isShuffled).toBe(true);
    expect(state.repeat).toBe("all");
  });
});
