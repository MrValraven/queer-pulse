import { describe, expect, it } from "vitest";
import {
  publishGapsOf,
  rightsLabelKeyOf,
  tracksMissingSourcesOf,
} from "./studioPublishChecks";

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

describe("sources (artist kinds)", () => {
  const tracks = [
    { id: "a", title: "Opening", hasAudio: true },
    { id: "b", title: "Credited", hasAudio: true },
    { id: "c", title: "No audio yet", hasAudio: false },
    { id: "d", title: "Closing", hasAudio: true },
    { id: "e", title: "Not read yet", hasAudio: true },
  ];
  const sourcesByTrackId = {
    a: [],
    b: [{ title: "Vogue", artist: "Madonna" }],
    c: [],
    d: [],
    e: undefined,
  };

  it("names every read track with audio and no source, in tracklist order", () => {
    expect(
      tracksMissingSourcesOf("lip_sync", tracks, sourcesByTrackId),
    ).toEqual(["Opening", "Closing"]);
  });

  it("asks nothing of albums, EPs, singles and shows", () => {
    expect(tracksMissingSourcesOf("ep", tracks, sourcesByTrackId)).toEqual([]);
    expect(tracksMissingSourcesOf("podcast", tracks, sourcesByTrackId)).toEqual(
      [],
    );
  });

  it("puts the sources gap after tracks and before pending", () => {
    expect(
      publishGapsOf({
        ...complete,
        playableTrackCount: 0,
        hasPendingUploads: true,
        tracksMissingSources: ["Opening"],
      }),
    ).toEqual(["tracks", "sources", "pending"]);
  });

  it("words the rights by type", () => {
    expect(rightsLabelKeyOf("mix")).toBe(
      "studio:uploadFlow.publish.rightsLabelSourced",
    );
    expect(rightsLabelKeyOf("edit")).toBe(
      "studio:uploadFlow.publish.rightsLabelSourced",
    );
    expect(rightsLabelKeyOf("podcast")).toBe(
      "studio:uploadFlow.publish.rightsLabel",
    );
    expect(rightsLabelKeyOf("album")).toBe(
      "studio:uploadFlow.publish.rightsLabel",
    );
  });
});
