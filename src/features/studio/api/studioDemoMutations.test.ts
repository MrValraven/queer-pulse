import { describe, expect, it } from "vitest";
import { DEMO_ARTIST_MARIANA } from "./studioDemoMe.data";
import {
  demoConfirmAudio,
  demoCreateRelease,
  demoCreateTrack,
  demoPublish,
  demoReorder,
  demoUpdateRelease,
} from "./studioDemoMutations";

describe("demo artist mutations", () => {
  it("creates a draft for the demo persona and edits it", () => {
    const draft = demoCreateRelease({
      subprofileId: DEMO_ARTIST_MARIANA.id,
      type: "ep",
      title: "Cartas",
    });
    expect(draft.status).toBe("draft");
    expect(draft.artist.id).toBe(DEMO_ARTIST_MARIANA.id);
    const edited = demoUpdateRelease(draft, {
      description: "Notes",
      rightsConfirmed: true,
      coverKey: "blob:cover",
    });
    expect(edited.description).toBe("Notes");
    expect(edited.rightsConfirmedAt).not.toBeNull();
    expect(edited.coverUrl).toBe("blob:cover");
  });

  it("reads a demo duration from the key the demo upload wrote", () => {
    const track = demoCreateTrack("release-1", "Tide", 1);
    const confirmed = demoConfirmAudio(track, "demo-audio:3200000:tide.mp3");
    expect(confirmed.hasAudio).toBe(true);
    expect(confirmed.durationSeconds).toBe(200);
  });

  it("reorders tracks and renumbers their positions", () => {
    const draft = demoCreateRelease({
      subprofileId: DEMO_ARTIST_MARIANA.id,
      type: "ep",
      title: "Cartas",
    });
    const withTracks = {
      ...draft,
      tracks: [
        demoCreateTrack(draft.id, "One", 1),
        demoCreateTrack(draft.id, "Two", 2),
      ],
    };
    const reordered = demoReorder(withTracks, [
      withTracks.tracks[1]!.id,
      withTracks.tracks[0]!.id,
    ]);
    expect(
      reordered.tracks.map((track) => `${track.position}:${track.title}`),
    ).toEqual(["1:Two", "2:One"]);
  });

  it("publishes a draft", () => {
    const draft = demoCreateRelease({
      subprofileId: DEMO_ARTIST_MARIANA.id,
      type: "single",
      title: "Uma",
    });
    expect(demoPublish(draft).status).toBe("published");
  });
});
