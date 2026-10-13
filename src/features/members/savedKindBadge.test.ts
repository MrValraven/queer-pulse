import { describe, expect, it } from "vitest";
import { savedKindBadge } from "./savedKindBadge";

describe("savedKindBadge", () => {
  it("tells Studio saves apart", () => {
    expect(savedKindBadge("studio_release")).toBe("REL");
    expect(savedKindBadge("studio_track")).toBe("TRA");
    expect(savedKindBadge("studio_playlist")).toBe("PLA");
  });

  it("keeps every other kind as before", () => {
    expect(savedKindBadge("article")).toBe("ART");
    expect(savedKindBadge("housing")).toBe("HOU");
  });
});
