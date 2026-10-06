import { describe, expect, it } from "vitest";
import { pieceGoLiveState } from "./pieceGoLiveState";

const NOW = Date.parse("2026-08-12T12:00:00Z");

describe("pieceGoLiveState", () => {
  it("reads a future instant as scheduled, carrying the instant", () => {
    const state = pieceGoLiveState(
      { stage: "Ready", publishedAt: "2026-08-14T09:00:00Z" },
      NOW,
    );
    expect(state?.kind).toBe("scheduled");
    expect(state?.kind === "scheduled" && state.publishesAt.toISOString()).toBe(
      "2026-08-14T09:00:00.000Z",
    );
  });

  it("reads a passed instant below Published as live on the site", () => {
    expect(
      pieceGoLiveState(
        { stage: "Ready", publishedAt: "2026-08-10T09:00:00Z" },
        NOW,
      ),
    ).toEqual({ kind: "live", liveSince: new Date("2026-08-10T09:00:00Z") });
  });

  it("says nothing for a Published piece whose date has passed", () => {
    expect(
      pieceGoLiveState(
        { stage: "Published", publishedAt: "2026-08-10T09:00:00Z" },
        NOW,
      ),
    ).toBeNull();
  });

  it("says nothing with no publish date or an unparseable one", () => {
    expect(pieceGoLiveState({ stage: "Ready", publishedAt: null }, NOW)).toBe(
      null,
    );
    expect(pieceGoLiveState({ stage: "Ready" }, NOW)).toBeNull();
    expect(
      pieceGoLiveState({ stage: "Ready", publishedAt: "soon" }, NOW),
    ).toBeNull();
  });
});
