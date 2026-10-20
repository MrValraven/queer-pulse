import { describe, expect, it } from "vitest";
import { studioShareLabelKey, studioShareLabelText } from "./studioShareLabel";

describe("studioShareLabel", () => {
  it("names one shared key per kind", () => {
    expect(studioShareLabelKey("track")).toBe("shared:studioShare.track");
    expect(studioShareLabelKey("release")).toBe("shared:studioShare.release");
    expect(studioShareLabelKey("playlist")).toBe("shared:studioShare.playlist");
  });

  it("reads the label without a hook in either language", () => {
    expect(studioShareLabelText("track", "en")).toBe("Studio track");
    expect(studioShareLabelText("playlist", "pt")).toBe("Playlist do Studio");
  });
});
