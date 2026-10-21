import { describe, expect, it } from "vitest";
import type { StudioTrackView } from "../api/studio.adapters";
import { studioLyricCredit, studioLyricLineOf } from "./studioShareLyricModel";

function trackWith(overrides: Partial<StudioTrackView>): StudioTrackView {
  return {
    id: "demo-track-lyric",
    title: "Chosen Family",
    isExplicit: false,
    contentWarnings: [],
    syncedLyrics: [
      { ms: 0, text: "We found each other on the night bus" },
      { ms: 4000, text: "" },
      { ms: 8000, text: "  and stayed  " },
    ],
    release: {
      title: "Night Bus",
      artist: { id: "demo-artist", name: "Marés" },
    },
    ...overrides,
  } as StudioTrackView;
}

describe("studioLyricLineOf", () => {
  it("reads the shared line from the reader's own track, trimmed", () => {
    expect(studioLyricLineOf(trackWith({}), 0, false)).toEqual({
      state: "shown",
      text: "We found each other on the night bus",
    });
    expect(studioLyricLineOf(trackWith({}), 2, false).text).toBe("and stayed");
  });

  it("never shows the words of a warned track", () => {
    expect(
      studioLyricLineOf(trackWith({ contentWarnings: ["police"] }), 0, false),
    ).toEqual({ state: "warned", text: null });
  });

  it("never shows the words of a withheld track", () => {
    expect(
      studioLyricLineOf(trackWith({ isWithheld: true }), 0, false),
    ).toEqual({ state: "withheld", text: null });
  });

  it("hides an explicit track's words while the member hides explicit", () => {
    const explicit = trackWith({ isExplicit: true });
    expect(studioLyricLineOf(explicit, 0, true).state).toBe("hidden");
    expect(studioLyricLineOf(explicit, 0, false).state).toBe("shown");
  });

  it("names a line that is gone, empty or out of range as missing", () => {
    expect(studioLyricLineOf(trackWith({}), 1, false).state).toBe("missing");
    expect(studioLyricLineOf(trackWith({}), 40, false).state).toBe("missing");
    expect(
      studioLyricLineOf(trackWith({ syncedLyrics: null }), 0, false).state,
    ).toBe("missing");
  });
});

describe("studioLyricCredit", () => {
  it("names the artist and the release, or the artist alone on a single", () => {
    expect(studioLyricCredit(trackWith({}))).toBe("Marés · Night Bus");
    expect(
      studioLyricCredit(
        trackWith({
          release: {
            title: "chosen family",
            artist: { id: "demo-artist", name: "Marés" },
          } as StudioTrackView["release"],
        }),
      ),
    ).toBe("Marés");
  });
});
