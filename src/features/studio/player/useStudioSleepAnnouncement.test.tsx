import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { I18nProvider } from "../../../app/providers/I18nProvider";
import { awaitCatalog } from "../../../test/awaitCatalog";
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
  it("speaks a timer that ends through the player's live region, once", async () => {
    const { rerender } = renderHook(
      ({ timer }: { timer: StudioSleepTimerState }) =>
        useStudioSleepAnnouncement(timer, false),
      {
        initialProps: {
          timer: { kind: "endOfTrack" } as StudioSleepTimerState,
        },
        wrapper: ({ children }: { children: ReactNode }) => (
          <I18nProvider>{children}</I18nProvider>
        ),
      },
    );
    // The studio catalog loads on demand; it is read before the timers stop.
    await awaitCatalog("studio");
    vi.useFakeTimers();
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
