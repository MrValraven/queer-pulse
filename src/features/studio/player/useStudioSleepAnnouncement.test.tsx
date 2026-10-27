import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  clearStudioPlayerAnnouncement,
  readAnnouncement,
} from "./studioPlayerAnnouncer";
import { useStudioSleepAnnouncement } from "./useStudioSleepAnnouncement";
import type { StudioSleepTimerState } from "./studioPlayerContext";

afterEach(() => {
  vi.useRealTimers();
  clearStudioPlayerAnnouncement();
});

describe("useStudioSleepAnnouncement", () => {
  it("speaks a timer that ends through the player's live region, once", () => {
    vi.useFakeTimers();
    const { rerender } = renderHook(
      ({ timer }: { timer: StudioSleepTimerState }) =>
        useStudioSleepAnnouncement(timer, false),
      {
        initialProps: {
          timer: { kind: "endOfTrack" } as StudioSleepTimerState,
        },
      },
    );
    expect(readAnnouncement().message).toBe("");
    rerender({ timer: null });
    vi.advanceTimersByTime(400);
    expect(readAnnouncement().message).toBe("Sleep timer off");
    const spokenCount = readAnnouncement().count;
    rerender({ timer: null });
    vi.advanceTimersByTime(400);
    expect(readAnnouncement().count).toBe(spokenCount);
  });
});
