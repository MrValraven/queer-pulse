import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { StudioQueueItem } from "./studioPlayerContext";
import {
  EMPTY_QUEUE_STATE,
  studioQueueReducer,
  type StudioQueueState,
} from "./studioQueueReducer";
import { readQueueSnapshot, writeQueueSnapshot } from "./studioQueueStorage";
import {
  useStudioQueuePersistence,
  type StudioQueuePersistenceOptions,
} from "./useStudioQueuePersistence";

const item = (trackId: string): StudioQueueItem => ({
  trackId,
  title: trackId,
  durationSeconds: 200,
  trackHref: `/studio/track?id=${trackId}`,
  releaseId: "r1",
  releaseTitle: "Release",
  coverUrl: null,
  tint: "jade",
  artistId: "p1",
  artistName: "Artist",
  artistHref: "/studio/artist?id=p1",
  queueEntryId: `entry-${trackId}`,
  isExplicit: false,
});
const playing: StudioQueueState = studioQueueReducer(EMPTY_QUEUE_STATE, {
  type: "playSource",
  source: null,
  items: [item("a"), item("b")],
  startIndex: 0,
  shuffleSeed: 1,
});

type Props = Pick<
  StudioQueuePersistenceOptions,
  | "memberId"
  | "demoMode"
  | "isSessionSettled"
  | "hasAccess"
  | "queueState"
  | "isPlaying"
>;

function renderPersistence(initial: Partial<Props> = {}) {
  const onRestore = vi.fn();
  const onReset = vi.fn();
  let position = 12;
  const initialProps: Props = {
    memberId: "member-1",
    demoMode: false,
    isSessionSettled: true,
    hasAccess: true,
    queueState: EMPTY_QUEUE_STATE,
    isPlaying: false,
    ...initial,
  };
  const hook = renderHook(
    (props: Props) =>
      useStudioQueuePersistence({
        ...props,
        readQueue: () => props.queueState,
        readPositionSeconds: () => position,
        onRestore,
        onReset,
      }),
    { initialProps },
  );
  return {
    hook,
    onRestore,
    onReset,
    initialProps,
    movePosition: (seconds: number) => {
      position = seconds;
    },
  };
}

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  window.sessionStorage.clear();
});

describe("useStudioQueuePersistence", () => {
  it("keeps the snapshot while the session is still checking, then restores it", () => {
    writeQueueSnapshot("member-1", { state: playing, positionSeconds: 30 });
    const { hook, onRestore, initialProps } = renderPersistence({
      memberId: null,
      isSessionSettled: false,
      hasAccess: false,
    });
    expect(onRestore).not.toHaveBeenCalled();
    expect(readQueueSnapshot("member-1")).not.toBeNull();
    hook.rerender({
      ...initialProps,
      memberId: "member-1",
      isSessionSettled: true,
      hasAccess: true,
    });
    expect(onRestore).toHaveBeenCalledWith({
      state: playing,
      positionSeconds: 30,
    });
  });

  it("restores nothing over a queue that already plays", () => {
    writeQueueSnapshot("member-1", { state: playing, positionSeconds: 30 });
    const { onRestore } = renderPersistence({ queueState: playing });
    expect(onRestore).not.toHaveBeenCalled();
  });

  it("writes after a queue change and removes the key when the queue empties", () => {
    const { hook, initialProps } = renderPersistence();
    hook.rerender({ ...initialProps, queueState: playing });
    expect(readQueueSnapshot("member-1")?.state.current?.trackId).toBe("a");
    expect(readQueueSnapshot("member-1")?.positionSeconds).toBe(12);
    hook.rerender({
      ...initialProps,
      queueState: studioQueueReducer(playing, { type: "reset" }),
    });
    expect(readQueueSnapshot("member-1")).toBeNull();
  });

  it("clears every saved queue on a switch between demo and live", () => {
    writeQueueSnapshot("member-1", { state: playing, positionSeconds: 0 });
    writeQueueSnapshot("demo", { state: playing, positionSeconds: 0 });
    const { hook, initialProps } = renderPersistence({ queueState: playing });
    hook.rerender({ ...initialProps, queueState: playing, demoMode: true });
    expect(readQueueSnapshot("demo")).toBeNull();
    expect(window.sessionStorage.getItem("studio.queue.member-1")).toBeNull();
  });

  it("clears the member's queue when access goes", () => {
    const { hook, initialProps } = renderPersistence({ queueState: playing });
    expect(readQueueSnapshot("member-1")).not.toBeNull();
    hook.rerender({ ...initialProps, queueState: playing, hasAccess: false });
    expect(readQueueSnapshot("member-1")).toBeNull();
  });

  it("saves the position every five seconds while playing", () => {
    vi.useFakeTimers();
    const { hook, initialProps, movePosition } = renderPersistence({
      queueState: playing,
      isPlaying: true,
    });
    movePosition(77);
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(readQueueSnapshot("member-1")?.positionSeconds).toBe(77);
    hook.rerender({ ...initialProps, queueState: playing, isPlaying: false });
  });

  it("restores nothing and keeps working when storage throws", () => {
    const blocked = () => {
      throw new DOMException("blocked", "SecurityError");
    };
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(blocked);
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(blocked);
    vi.spyOn(Storage.prototype, "removeItem").mockImplementation(blocked);
    const { hook, onRestore, initialProps } = renderPersistence();
    expect(() =>
      hook.rerender({ ...initialProps, queueState: playing, demoMode: true }),
    ).not.toThrow();
    expect(onRestore).not.toHaveBeenCalled();
    expect(() => hook.result.current.clearSavedQueue()).not.toThrow();
  });

  it("never copies one member's queue to another and restores the new member's own", () => {
    writeQueueSnapshot("member-2", { state: playing, positionSeconds: 9 });
    const { hook, onReset, onRestore, initialProps } = renderPersistence({
      queueState: playing,
    });
    const memberOneBefore = window.sessionStorage.getItem(
      "studio.queue.member-1",
    );
    hook.rerender({
      ...initialProps,
      queueState: playing,
      memberId: "member-2",
    });
    expect(onReset).toHaveBeenCalledTimes(1);
    expect(readQueueSnapshot("member-2")?.positionSeconds).toBe(9);
    expect(window.sessionStorage.getItem("studio.queue.member-1")).toBe(
      memberOneBefore,
    );
    hook.rerender({
      ...initialProps,
      queueState: EMPTY_QUEUE_STATE,
      memberId: "member-2",
    });
    expect(onRestore).toHaveBeenCalledWith({
      state: playing,
      positionSeconds: 9,
    });
  });

  it("keeps the restored position until playback starts", () => {
    writeQueueSnapshot("member-1", { state: playing, positionSeconds: 83 });
    const { hook, onRestore, initialProps } = renderPersistence();
    expect(onRestore).toHaveBeenCalledTimes(1);
    hook.rerender({ ...initialProps, queueState: playing });
    expect(readQueueSnapshot("member-1")?.positionSeconds).toBe(83);
  });

  it("saves when the page becomes hidden", () => {
    const { hook, initialProps } = renderPersistence({ queueState: playing });
    hook.rerender({ ...initialProps, queueState: playing, isPlaying: true });
    window.sessionStorage.clear();
    vi.spyOn(document, "visibilityState", "get").mockReturnValue("hidden");
    document.dispatchEvent(new Event("visibilitychange"));
    expect(readQueueSnapshot("member-1")).not.toBeNull();
  });
});
