import { describe, expect, it } from "vitest";
import type { SavedItem } from "../../../app/providers/useSaved";
import { DEMO_LIKED_PAGE_SIZE, demoLikedTracksPage } from "./studioDemoLiked";
import { demoPublishedTracks } from "./studioDemoPlaylists";

const like = (trackId: string, title = `Saved ${trackId}`): SavedItem => ({
  id: `studio_track:${trackId}`,
  kind: "studio_track",
  title,
});

const publishedIds = () => [...demoPublishedTracks().keys()];

describe("demo Liked songs", () => {
  it("lists track saves in store order and leaves other saves out", () => {
    const [firstId, secondId] = publishedIds();
    const page = demoLikedTracksPage(
      [
        like(firstId ?? ""),
        { id: "studio_release:r1", kind: "studio_release", title: "Album" },
        like(secondId ?? ""),
      ],
      null,
    );
    expect(page.items.map((entry) => entry.trackId)).toEqual([
      firstId,
      secondId,
    ]);
    expect(page.items.map((entry) => entry.position)).toEqual([1, 2]);
    expect(page.items.every((entry) => entry.isAvailable)).toBe(true);
    expect(page.items[0]?.track?.id).toBe(firstId);
  });

  it("keeps the saved title on an unavailable like and names a withdrawal only", () => {
    const page = demoLikedTracksPage(
      [
        like("demo-track-withdrawn-01", "Fado do bairro"),
        like("demo-track-gone", "Old tape"),
      ],
      null,
    );
    const [withdrawn, gone] = page.items;
    expect(withdrawn?.isAvailable).toBe(false);
    expect(withdrawn?.track).toBeNull();
    expect(withdrawn?.savedTitle).toBe("Fado do bairro");
    expect(withdrawn?.unavailableReason).toBe("withdrawn");
    expect(gone?.isAvailable).toBe(false);
    expect(gone?.unavailableReason).toBeUndefined();
    expect(page.trackCount).toBe(0);
    expect(page.totalDurationSeconds).toBe(0);
  });

  it("counts the available likes and their length", () => {
    const tracks = demoPublishedTracks();
    const [firstId, secondId] = publishedIds();
    const page = demoLikedTracksPage(
      [like(firstId ?? ""), like("demo-track-gone"), like(secondId ?? "")],
      null,
    );
    const expectedSeconds =
      (tracks.get(firstId ?? "")?.durationSeconds ?? 0) +
      (tracks.get(secondId ?? "")?.durationSeconds ?? 0);
    expect(page.trackCount).toBe(2);
    expect(page.totalDurationSeconds).toBe(expectedSeconds);
  });

  it("pages by index and keeps positions running across pages", () => {
    const saves = Array.from(
      { length: DEMO_LIKED_PAGE_SIZE + 3 },
      (_value, index) => like(`demo-track-gone-${index}`),
    );
    const first = demoLikedTracksPage(saves, null);
    expect(first.items).toHaveLength(DEMO_LIKED_PAGE_SIZE);
    expect(first.pageInfo.hasMore).toBe(true);
    const second = demoLikedTracksPage(saves, first.pageInfo.nextCursor);
    expect(second.items).toHaveLength(3);
    expect(second.items[0]?.position).toBe(DEMO_LIKED_PAGE_SIZE + 1);
    expect(second.pageInfo).toEqual({ nextCursor: null, hasMore: false });
  });

  it("reads a malformed cursor as the first page", () => {
    const [firstId] = publishedIds();
    const page = demoLikedTracksPage([like(firstId ?? "")], "not-a-number");
    expect(page.items.map((entry) => entry.trackId)).toEqual([firstId]);
  });

  it("answers an empty page with no likes", () => {
    const page = demoLikedTracksPage([], null);
    expect(page.items).toEqual([]);
    expect(page.pageInfo).toEqual({ nextCursor: null, hasMore: false });
    expect(page.trackCount).toBe(0);
  });
});
