import { describe, expect, it } from "vitest";
import { toReleaseView } from "../api/studio.adapters";
import type { StudioRadioItemDTO, StudioReleaseDTO } from "../api/studio.types";
import { queueFromRelease, queueItemFromRadioItem } from "./studioQueue";
import { pickQueueItemForTests } from "./studioQueueStorage";

const artist = {
  id: "p1",
  handle: "artist",
  name: "Artist",
  kind: "musician" as const,
  avatarUrl: null,
};

describe("queue builders carry content warnings", () => {
  it("copies a release row's warnings and leaves a listener's withheld row out", () => {
    const release: StudioReleaseDTO = {
      id: "r1",
      title: "Release",
      type: "ep",
      coverUrl: null,
      releasedOn: null,
      trackCount: 2,
      totalDurationSeconds: 100,
      artist,
      description: null,
      genre: null,
      genres: [],
      mood: null,
      scene: null,
      status: "published",
      publishedAt: "2026-10-01T10:00:00.000Z",
      tracks: [
        {
          id: "t1",
          position: 1,
          title: "One",
          durationSeconds: 100,
          isExplicit: false,
          hasAudio: true,
          contentWarnings: ["police"],
        },
        {
          id: "t2",
          position: 2,
          title: "Two",
          durationSeconds: 100,
          isExplicit: false,
          hasAudio: true,
          isWithheld: true,
        },
      ],
      isOwner: false,
      rightsConfirmedAt: null,
      takedownReason: null,
      sceneId: null,
      personaCredits: [],
    };
    const queue = queueFromRelease(toReleaseView(release));
    expect(queue.map((track) => track.trackId)).toEqual(["t1"]);
    expect(queue[0]?.contentWarnings).toEqual(["police"]);
  });

  it("copies a radio item's warnings in D7 order", () => {
    const radioItem: StudioRadioItemDTO = {
      trackId: "t3",
      title: "Three",
      durationSeconds: 120,
      isExplicit: false,
      releaseId: "r2",
      releaseTitle: "Other",
      coverUrl: null,
      artist,
      contentWarnings: ["police", "medical"],
    };
    expect(queueItemFromRadioItem(radioItem).contentWarnings).toEqual([
      "medical",
      "police",
    ]);
  });

  it("keeps known warnings on a saved entry and drops anything else", () => {
    const picked = pickQueueItemForTests({
      queueEntryId: "e1",
      trackId: "t1",
      title: "One",
      durationSeconds: 100,
      trackHref: "/studio/track?id=t1",
      releaseId: "r1",
      releaseTitle: "Release",
      coverUrl: null,
      tint: "coral",
      artistId: "p1",
      artistName: "Artist",
      artistHref: "/studio/artist?id=p1",
      isExplicit: false,
      contentWarnings: ["self-harm", "made-up", 7],
    });
    expect(picked?.contentWarnings).toEqual(["self-harm"]);
  });
});
