import { describe, expect, it } from "vitest";
import type { StudioQueueItem } from "./studioPlayerContext";
import {
  EMPTY_QUEUE_STATE,
  studioQueueReducer,
  type StudioQueueAction,
  type StudioQueueState,
} from "./studioQueueReducer";
import type { StudioWarningGate } from "./studioWarningGate";

const item = (
  trackId: string,
  contentWarnings: StudioQueueItem["contentWarnings"] = [],
  queueEntryId = trackId,
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
  isExplicit: false,
  contentWarnings,
});
const asking = (consented: string[] = []): StudioWarningGate => ({
  isAsking: true,
  consentedTrackIds: new Set(consented),
});
const SOURCE = { kind: "release" as const, label: "Release", href: null };

function run(state: StudioQueueState, ...actions: StudioQueueAction[]) {
  return actions.reduce(studioQueueReducer, state);
}
function started(items: StudioQueueItem[], startIndex = 0) {
  return run(EMPTY_QUEUE_STATE, {
    type: "playSource",
    source: SOURCE,
    items,
    startIndex,
    shuffleSeed: 1,
  });
}

const plainA = item("a");
const warnedW = item("w", ["self-harm"]);
const warnedV = item("v", ["violence"]);
const plainB = item("b");

describe("the reducer's warning gate (spec 6.3)", () => {
  it("stops on a warned track a manual next reaches", () => {
    const state = run(started([plainA, warnedW]), {
      type: "next",
      gate: asking(),
    });
    expect(state.current?.trackId).toBe("w");
    expect(state.pendingWarning?.trackId).toBe("w");
  });

  it("stops on a warned track a track end reaches (autoplay)", () => {
    const state = run(started([plainA, warnedW]), {
      type: "trackEnded",
      gate: asking(),
    });
    expect(state.pendingWarning?.trackId).toBe("w");
  });

  it("plays through a consented track and with the setting off", () => {
    expect(
      run(started([plainA, warnedW]), { type: "next", gate: asking(["w"]) })
        .pendingWarning ?? null,
    ).toBeNull();
    expect(
      run(started([plainA, warnedW]), {
        type: "next",
        gate: { isAsking: false, consentedTrackIds: new Set() },
      }).pendingWarning ?? null,
    ).toBeNull();
  });

  it("asks before the first track of a new queue", () => {
    const state = run(EMPTY_QUEUE_STATE, {
      type: "playSource",
      source: SOURCE,
      items: [warnedW, plainA],
      startIndex: 0,
      shuffleSeed: 1,
      gate: asking(),
    });
    expect(state.pendingWarning?.trackId).toBe("w");
  });

  it("clears the question on Play it and keeps the track current", () => {
    const gated = run(started([plainA, warnedW]), {
      type: "next",
      gate: asking(),
    });
    const consented = run(gated, { type: "consentWarning" });
    expect(consented.pendingWarning).toBeNull();
    expect(consented.current?.trackId).toBe("w");
  });

  it("chains Skip to the next warned track, then past it", () => {
    const gated = run(started([plainA, warnedW, warnedV, plainB]), {
      type: "next",
      gate: asking(),
    });
    const skippedOnce = run(gated, { type: "next", gate: asking() });
    expect(skippedOnce.pendingWarning?.trackId).toBe("v");
    const skippedTwice = run(skippedOnce, { type: "next", gate: asking() });
    expect(skippedTwice.current?.trackId).toBe("b");
    expect(skippedTwice.pendingWarning).toBeNull();
  });

  it("asks when removing the current entry moves onto a warned one", () => {
    const state = run(started([plainA, warnedW]), {
      type: "remove",
      queueEntryId: "a",
      gate: asking(),
    });
    expect(state.pendingWarning?.trackId).toBe("w");
  });

  it("asks on a radio extension's first warned track", () => {
    const radio = run(EMPTY_QUEUE_STATE, {
      type: "playSource",
      source: { kind: "radio", label: "", href: null },
      items: [warnedW, plainA],
      startIndex: 1,
      shuffleSeed: 1,
    });
    // At the last item the refill appends a shuffle whose first track
    // differs from "a", so it is "w".
    expect(radio.sourceItems.length).toBeGreaterThan(2);
    const state = run(radio, { type: "trackEnded", gate: asking() });
    expect(state.current?.trackId).toBe("w");
    expect(state.pendingWarning?.trackId).toBe("w");
  });

  it("asks again about a restored queue's warned current track", () => {
    const saved = run(started([warnedW]), { type: "consentWarning" });
    expect(
      run(EMPTY_QUEUE_STATE, {
        type: "restore",
        state: saved,
        gate: asking(),
      }).pendingWarning?.trackId,
    ).toBe("w");
    expect(
      run(EMPTY_QUEUE_STATE, { type: "restore", state: saved })
        .pendingWarning ?? null,
    ).toBeNull();
  });

  it("lets a restore with a gate through a consented current track", () => {
    const gated = run(started([plainA, warnedW]), {
      type: "next",
      gate: asking(),
    });
    expect(
      run(EMPTY_QUEUE_STATE, {
        type: "restore",
        state: gated,
        gate: asking(["w"]),
      }).pendingWarning,
    ).toBeNull();
  });

  it("keeps the restored state's own question on a restore without a gate", () => {
    const gated = run(started([plainA, warnedW]), {
      type: "next",
      gate: asking(),
    });
    // dropHiddenRadioItems restores a filtered copy of the live state.
    const restored = run(EMPTY_QUEUE_STATE, { type: "restore", state: gated });
    expect(restored.pendingWarning?.trackId).toBe("w");
    expect(restored).toBe(gated);
  });

  it("drops a restored question that names an entry other than the current one", () => {
    const stale: StudioQueueState = {
      ...started([plainA, warnedW]),
      pendingWarning: warnedW,
    };
    expect(
      run(EMPTY_QUEUE_STATE, { type: "restore", state: stale }).pendingWarning,
    ).toBeNull();
  });

  it("clears the question on a jump, which is a direct choice", () => {
    const gated = run(started([plainA, warnedW, plainB]), {
      type: "next",
      gate: asking(),
    });
    expect(
      run(gated, { type: "playEntry", queueEntryId: "b" }).pendingWarning,
    ).toBeNull();
  });

  it("keeps the question through a queue edit that does not move", () => {
    const gated = run(started([plainA, warnedW, plainB]), {
      type: "next",
      gate: asking(),
    });
    const edited = run(gated, { type: "addToQueue", items: [item("x")] });
    expect(edited.pendingWarning?.trackId).toBe("w");
  });

  it("starts empty and resets to no question", () => {
    expect(EMPTY_QUEUE_STATE.pendingWarning).toBeNull();
    const gated = run(started([plainA, warnedW]), {
      type: "next",
      gate: asking(),
    });
    expect(run(gated, { type: "reset" }).pendingWarning).toBeNull();
  });
});
