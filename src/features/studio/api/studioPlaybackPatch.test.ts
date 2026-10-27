import { describe, expect, it } from "vitest";
import { DEFAULT_STUDIO_PLAYBACK } from "./studio.types";
import {
  applyPlaybackPatch,
  isListeningHistoryOnIn,
} from "./studioPlaybackPatch";

const now = new Date("2026-10-27T10:00:00.000Z");

describe("applyPlaybackPatch", () => {
  it("stamps the notice once with millisecond precision and keeps the first stamp", () => {
    const stamped = applyPlaybackPatch(
      { ...DEFAULT_STUDIO_PLAYBACK, listeningNoticeSeenAt: null },
      { hasSeenListeningNotice: true },
      now,
    );
    expect(stamped.listeningNoticeSeenAt).toBe("2026-10-27T10:00:00.000Z");
    expect(stamped).not.toHaveProperty("hasSeenListeningNotice");
    const again = applyPlaybackPatch(
      stamped,
      { hasSeenListeningNotice: true },
      new Date("2026-11-01T00:00:00.000Z"),
    );
    expect(again.listeningNoticeSeenAt).toBe("2026-10-27T10:00:00.000Z");
  });

  it("stamps a row from an older server that carries no stamp field", () => {
    const stamped = applyPlaybackPatch(
      { autoplayNext: true, hideExplicit: false, crossfadeSeconds: 0 },
      { hasSeenListeningNotice: true },
      now,
    );
    expect(stamped).toEqual({
      autoplayNext: true,
      hideExplicit: false,
      crossfadeSeconds: 0,
      listeningNoticeSeenAt: "2026-10-27T10:00:00.000Z",
    });
  });

  it("merges the switch and leaves every other field", () => {
    const row = applyPlaybackPatch(
      DEFAULT_STUDIO_PLAYBACK,
      { isListeningHistoryOn: false },
      now,
    );
    expect(row).toEqual({
      ...DEFAULT_STUDIO_PLAYBACK,
      isListeningHistoryOn: false,
    });
  });
});

describe("isListeningHistoryOnIn", () => {
  it("reads a missing switch as on", () => {
    expect(
      isListeningHistoryOnIn({
        autoplayNext: true,
        hideExplicit: false,
        crossfadeSeconds: 0,
      }),
    ).toBe(true);
    expect(isListeningHistoryOnIn(undefined)).toBe(true);
    expect(
      isListeningHistoryOnIn({
        ...DEFAULT_STUDIO_PLAYBACK,
        isListeningHistoryOn: false,
      }),
    ).toBe(false);
  });
});
