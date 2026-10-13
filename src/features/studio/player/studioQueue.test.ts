import { describe, expect, it } from "vitest";
import { toSearchTrackView } from "../api/studio.adapters";
import { queueFromTracks, shuffledQueue } from "./studioQueue";

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
