import { afterEach, describe, expect, it, vi } from "vitest";
import type { StudioQueueItem } from "./studioPlayerContext";
import { EMPTY_QUEUE_STATE, type StudioQueueState } from "./studioQueueReducer";
import {
  clearQueueSnapshot,
  clearStudioQueueSnapshots,
  endStudioQueueSaving,
  readQueueSnapshot,
  resumeStudioQueueSavingForTests,
  studioQueueStorageKey,
  writeQueueSnapshot,
} from "./studioQueueStorage";

const item = (trackId: string): StudioQueueItem => ({
  trackId,
  title: trackId,
  durationSeconds: 200,
  trackHref: `/studio/track?id=${trackId}`,
  releaseId: "r1",
  releaseTitle: "Release",
  coverUrl: "https://files.example/cover.webp",
  tint: "plum",
  artistId: "p1",
  artistName: "Artist",
  artistHref: "/studio/artist?id=p1",
  queueEntryId: `entry-${trackId}`,
  isExplicit: false,
});
const state: StudioQueueState = {
  ...EMPTY_QUEUE_STATE,
  source: { kind: "release", label: "Release", href: "/studio/album?id=r1" },
  sourceItems: [item("a"), item("b")],
  originalSourceItems: [item("a"), item("b")],
  userItems: [item("x")],
  current: item("b"),
  currentFrom: "source",
  sourceIndex: 1,
  repeat: "all",
};

afterEach(() => {
  vi.restoreAllMocks();
  resumeStudioQueueSavingForTests();
  window.sessionStorage.clear();
});

describe("queue snapshot", () => {
  it("round-trips the queue and the position under the member's key", () => {
    writeQueueSnapshot("member-1", { state, positionSeconds: 42.5 });
    expect(
      window.sessionStorage.getItem(studioQueueStorageKey("member-1")),
    ).not.toBeNull();
    expect(readQueueSnapshot("member-1")).toEqual({
      state,
      positionSeconds: 42.5,
    });
    expect(readQueueSnapshot("member-2")).toBeNull();
  });

  it("stores the queue fields only, so a stream URL can never be saved", () => {
    const withUrl = {
      ...item("b"),
      streamUrl: "https://bucket.example/signed?X-Amz-Signature=secret",
    } as StudioQueueItem;
    writeQueueSnapshot("member-1", {
      state: { ...state, current: withUrl },
      positionSeconds: 0,
    });
    expect(
      window.sessionStorage.getItem("studio.queue.member-1"),
    ).not.toContain("secret");
  });

  it("restores an episode as an episode and music without the flag", () => {
    const episode = { ...item("e"), isEpisode: true };
    writeQueueSnapshot("member-1", {
      state: { ...state, current: episode },
      positionSeconds: 0,
    });
    const restored = readQueueSnapshot("member-1")?.state;
    expect(restored?.current?.isEpisode).toBe(true);
    expect(restored?.userItems[0]).not.toHaveProperty("isEpisode");
  });

  it("clamps the position into the current track", () => {
    writeQueueSnapshot("member-1", { state, positionSeconds: 9999 });
    expect(readQueueSnapshot("member-1")?.positionSeconds).toBe(200);
  });

  it("restores nothing from a malformed or foreign snapshot", () => {
    const key = "studio.queue.member-1";
    for (const raw of [
      "not json",
      JSON.stringify({ version: 2, state, positionSeconds: 0 }),
      JSON.stringify({
        version: 1,
        state: { ...state, current: null },
        positionSeconds: 0,
      }),
      JSON.stringify({
        version: 1,
        state: { ...state, sourceIndex: 7 },
        positionSeconds: 0,
      }),
      JSON.stringify({
        version: 1,
        state: {
          ...state,
          current: { ...item("b"), trackHref: "https://elsewhere.example/" },
        },
        positionSeconds: 0,
      }),
    ]) {
      window.sessionStorage.setItem(key, raw);
      expect(readQueueSnapshot("member-1")).toBeNull();
    }
  });

  it("clears one member, or every Studio queue in the tab", () => {
    writeQueueSnapshot("member-1", { state, positionSeconds: 0 });
    writeQueueSnapshot("member-2", { state, positionSeconds: 0 });
    window.sessionStorage.setItem("qp.auth.preparing", "1");
    clearQueueSnapshot("member-1");
    expect(readQueueSnapshot("member-1")).toBeNull();
    expect(readQueueSnapshot("member-2")).not.toBeNull();
    clearStudioQueueSnapshots();
    expect(readQueueSnapshot("member-2")).toBeNull();
    expect(window.sessionStorage.getItem("qp.auth.preparing")).toBe("1");
  });

  it("saves nothing more once Quick Exit ends saving", () => {
    writeQueueSnapshot("member-1", { state, positionSeconds: 0 });
    endStudioQueueSaving();
    expect(readQueueSnapshot("member-1")).toBeNull();
    writeQueueSnapshot("member-1", { state, positionSeconds: 12 });
    expect(
      window.sessionStorage.getItem(studioQueueStorageKey("member-1")),
    ).toBeNull();
  });

  it("degrades to nothing saved when storage throws", () => {
    const blocked = () => {
      throw new DOMException("blocked", "SecurityError");
    };
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(blocked);
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(blocked);
    vi.spyOn(Storage.prototype, "removeItem").mockImplementation(blocked);
    vi.spyOn(Storage.prototype, "key").mockImplementation(blocked);
    expect(() =>
      writeQueueSnapshot("member-1", { state, positionSeconds: 0 }),
    ).not.toThrow();
    expect(readQueueSnapshot("member-1")).toBeNull();
    expect(() => clearQueueSnapshot("member-1")).not.toThrow();
    expect(() => clearStudioQueueSnapshots()).not.toThrow();
  });

  it("degrades to nothing saved when the storage object itself is refused", () => {
    vi.spyOn(window, "sessionStorage", "get").mockImplementation(() => {
      throw new DOMException("blocked", "SecurityError");
    });
    expect(readQueueSnapshot("member-1")).toBeNull();
    expect(() => clearStudioQueueSnapshots()).not.toThrow();
  });
});
