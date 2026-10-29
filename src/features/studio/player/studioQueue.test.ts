import { describe, expect, it } from "vitest";
import { toReleaseView, toSearchTrackView } from "../api/studio.adapters";
import type { StudioReleaseDTO } from "../api/studio.types";
import {
  extendRadioQueue,
  queueFromRelease,
  queueFromTracks,
  queueItemFromRadioItem,
  radioFilterLabelKey,
  showQueueSource,
  shuffledItems,
  shuffledQueue,
  toQueueItems,
} from "./studioQueue";

const release = {
  id: "r1",
  title: "Cartas",
  type: "ep" as const,
  coverUrl: null,
  releasedOn: null,
  trackCount: 3,
  totalDurationSeconds: 300,
  artist: {
    id: "p1",
    handle: "",
    name: "Mariana Sol",
    kind: "musician" as const,
    avatarUrl: null,
  },
  publishedAt: null,
  genre: null,
  genres: [],
  mood: null,
  scene: null,
};
const tracks = ["t1", "t2", "t3"].map((id, index) =>
  toSearchTrackView({
    id,
    position: index + 1,
    title: id,
    durationSeconds: 100,
    isExplicit: false,
    hasAudio: id !== "t2",
    release,
  }),
);

describe("playlist queues", () => {
  it("queues tracks with audio, in the order given, with their release", () => {
    const queue = queueFromTracks(tracks);
    expect(queue.map((item) => item.trackId)).toEqual(["t1", "t3"]);
    expect(queue[0]).toMatchObject({
      releaseId: "r1",
      artistName: "Mariana Sol",
      trackHref: "/studio/track?id=t1",
    });
  });

  it("shuffles into a new array holding the same items", () => {
    const queue = queueFromTracks([...tracks, { ...tracks[0]!, id: "t4" }]);
    const shuffled = shuffledQueue(queue, () => 0);
    expect(shuffled).not.toBe(queue);
    expect([...shuffled].map((item) => item.trackId).sort()).toEqual(
      queue.map((item) => item.trackId).sort(),
    );
    expect(queue.map((item) => item.trackId)).toEqual(["t1", "t3", "t4"]);
    expect(shuffled.map((item) => item.trackId)).toEqual(["t3", "t4", "t1"]);
  });
});

const radioItem = (trackId: string) =>
  queueItemFromRadioItem({
    trackId,
    title: `Track ${trackId}`,
    durationSeconds: 180,
    isExplicit: false,
    releaseId: "r9",
    releaseTitle: "Warehouse",
    coverUrl: null,
    artist: {
      id: "p9",
      handle: "nightform",
      name: "NIGHTFORM",
      kind: "musician",
      avatarUrl: null,
    },
  });

describe("radio queues", () => {
  it("builds a queue item and its links from the radio item alone", () => {
    expect(radioItem("a")).toMatchObject({
      trackId: "a",
      trackHref: "/studio/track?id=a",
      releaseTitle: "Warehouse",
      artistHref: "/studio/artist?id=p9",
      durationSeconds: 180,
    });
  });

  it("appends a reshuffle whose first track differs from the one that just played", () => {
    const pool = [radioItem("a"), radioItem("b")];
    // A random of 0.99 keeps a two-item list in place, so the refill would
    // start on "a" again; the refill moves "b" to the front.
    const extended = extendRadioQueue(
      toQueueItems([radioItem("a")]),
      pool,
      () => 0.99,
    );
    expect(extended.map((item) => item.trackId)).toEqual(["a", "b", "a"]);
  });

  it("stamps a fresh entry id on every refilled track", () => {
    const pool = [radioItem("a"), radioItem("b")];
    const queue = toQueueItems([radioItem("a")], () => "first");
    let count = 0;
    const extended = extendRadioQueue(
      queue,
      pool,
      () => 0.99,
      () => {
        count += 1;
        return `refill-${count}`;
      },
    );
    expect(extended.map((item) => item.queueEntryId)).toEqual([
      "first",
      "refill-1",
      "refill-2",
    ]);
  });

  it("carries the explicit flag from the radio item", () => {
    expect(radioItem("a").isExplicit).toBe(false);
  });

  it("ends a one-track radio with the queue it has", () => {
    const queue = toQueueItems([radioItem("a")]);
    expect(extendRadioQueue(queue, [radioItem("a")])).toBe(queue);
  });

  it("labels a radio by its genre or its mood", () => {
    expect(radioFilterLabelKey({ kind: "genre", value: "fado" })).toBe(
      "studio:upload.metadata.genre.fado",
    );
    expect(radioFilterLabelKey({ kind: "mood", value: "late-night" })).toBe(
      "studio:mood.lateNight",
    );
  });

  it("shuffles any list into a new array", () => {
    const ids = ["x", "y", "z"];
    const shuffled = shuffledItems(ids, () => 0);
    expect(shuffled).not.toBe(ids);
    expect([...shuffled].sort()).toEqual(ids);
  });
});

describe("queue entry ids", () => {
  it("gives each entry its own id, also for the same track twice", () => {
    const [track] = queueFromTracks(tracks);
    const items = toQueueItems([track!, track!]);
    expect(items.map((item) => item.trackId)).toEqual(["t1", "t1"]);
    expect(items[0]!.queueEntryId).not.toBe(items[1]!.queueEntryId);
  });

  it("carries the explicit flag from the track", () => {
    const loud = toSearchTrackView({
      id: "t9",
      position: 1,
      title: "Loud",
      durationSeconds: 100,
      isExplicit: true,
      hasAudio: true,
      release,
    });
    expect(queueFromTracks([loud])[0]?.isExplicit).toBe(true);
    expect(queueFromTracks(tracks)[0]?.isExplicit).toBe(false);
  });

  it("uses the id maker it is given", () => {
    let count = 0;
    const items = toQueueItems(queueFromTracks(tracks), () => {
      count += 1;
      return `fixed-${count}`;
    });
    expect(items.map((item) => item.queueEntryId)).toEqual([
      "fixed-1",
      "fixed-2",
    ]);
  });
});

// A whole release DTO (the card above plus one track) for the release
// builders.
const releaseFixture: StudioReleaseDTO = {
  ...release,
  description: null,
  status: "published",
  tracks: [
    {
      id: "t1",
      position: 1,
      title: "t1",
      durationSeconds: 100,
      isExplicit: false,
      hasAudio: true,
    },
  ],
  isOwner: false,
  rightsConfirmedAt: null,
  takedownReason: null,
  sceneId: null,
  personaCredits: [],
};

/** A show of three episodes: e1 and e2 published with audio, e3 without
 *  audio yet. `patch` turns it into an owner's view or an unreleased show. */
function showOf(
  patch: Partial<StudioReleaseDTO> = {},
  episodePatch: Partial<StudioReleaseDTO["tracks"][number]> = {},
) {
  const episodeRow = (id: string, position: number, hasAudio: boolean) => ({
    ...releaseFixture.tracks[0]!,
    id,
    position,
    publishedAt: `2026-0${position + 6}-01T00:00:00.000Z`,
    isDraft: false,
    hasAudio,
    ...episodePatch,
  });
  return toReleaseView({
    ...releaseFixture,
    id: "show-2",
    type: "podcast",
    artist: { ...releaseFixture.artist, kind: "podcaster" },
    tracks: [
      episodeRow("e1", 1, true),
      episodeRow("e2", 2, true),
      episodeRow("e3", 3, false),
    ],
    ...patch,
  });
}

describe("a show's Play picks one episode", () => {
  it("queues the older episode Play names", () => {
    const queue = queueFromRelease(showOf(), undefined, "e1");
    expect(queue.map((item) => item.trackId)).toEqual(["e1"]);
    expect(queue[0]?.isEpisode).toBe(true);
  });

  it("queues the latest episode when the named row has no audio", () => {
    const queue = queueFromRelease(showOf(), undefined, "e3");
    expect(queue.map((item) => item.trackId)).toEqual(["e2"]);
  });

  it("queues the latest episode when the named row is elsewhere", () => {
    const queue = queueFromRelease(showOf(), undefined, "t-elsewhere");
    expect(queue.map((item) => item.trackId)).toEqual(["e2"]);
  });

  it("plays the newest row with audio through a preview link of an unreleased show", () => {
    const unreleased = showOf(
      { isOwner: true, status: "scheduled", isPreview: true },
      { publishedAt: null, isDraft: true },
    );
    const queue = queueFromRelease(unreleased, "preview-token");
    expect(queue.map((item) => item.trackId)).toEqual(["e2"]);
    expect(queue[0]?.previewToken).toBe("preview-token");
    expect(queue[0]?.isEpisode).toBe(true);
  });

  it("queues nothing for an unreleased show outside a preview link", () => {
    const unreleased = showOf(
      { isOwner: true, status: "draft" },
      { publishedAt: null, isDraft: true },
    );
    expect(queueFromRelease(unreleased)).toEqual([]);
  });
});

describe("artist kinds in the queue", () => {
  it("marks an episode and plays a show's latest episode alone", () => {
    const show = toReleaseView({
      ...releaseFixture,
      id: "show-1",
      type: "podcast",
      artist: { ...releaseFixture.artist, kind: "podcaster" },
      tracks: [
        {
          ...releaseFixture.tracks[0]!,
          id: "e1",
          position: 1,
          publishedAt: "2026-08-01T00:00:00.000Z",
          isDraft: false,
          hasAudio: true,
        },
        {
          ...releaseFixture.tracks[0]!,
          id: "e2",
          position: 2,
          publishedAt: "2026-09-01T00:00:00.000Z",
          isDraft: false,
          hasAudio: true,
        },
      ],
    });
    const queue = queueFromRelease(show);
    expect(queue.map((item) => item.trackId)).toEqual(["e2"]);
    expect(queue[0]?.isEpisode).toBe(true);
    expect(showQueueSource(show)).toEqual({
      kind: "release",
      label: show.title,
      href: show.href,
    });
  });

  it("leaves music unmarked", () => {
    const queue = queueFromRelease(toReleaseView(releaseFixture));
    expect(queue).toHaveLength(1);
    expect(queue.every((item) => item.isEpisode === false)).toBe(true);
  });
});
