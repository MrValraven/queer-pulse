import { describe, expect, it } from "vitest";
import { publishGapsOf } from "./studioPublishChecks";

const complete = {
  title: "Night bus",
  hasCover: true,
  playableTrackCount: 2,
  hasPendingUploads: false,
  isRightsConfirmed: true,
};

describe("publishGapsOf", () => {
  it("lets a complete release publish", () => {
    expect(publishGapsOf(complete)).toEqual([]);
  });

  it.each([
    ["title", { title: "  " }],
    ["cover", { hasCover: false }],
    ["rights", { isRightsConfirmed: false }],
    ["tracks", { playableTrackCount: 0 }],
    ["pending", { hasPendingUploads: true }],
  ] as const)("names a missing %s", (gap, override) => {
    expect(publishGapsOf({ ...complete, ...override })).toEqual([gap]);
  });

  it("lists every gap at once, in the order the server checks them", () => {
    expect(
      publishGapsOf({
        title: "",
        hasCover: false,
        playableTrackCount: 0,
        hasPendingUploads: true,
        isRightsConfirmed: false,
      }),
    ).toEqual(["title", "cover", "rights", "tracks", "pending"]);
  });
});
