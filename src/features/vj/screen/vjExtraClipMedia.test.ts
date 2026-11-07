import { describe, expect, it, vi } from "vitest";
import type {
  VjClipMediaDTO,
  VjClipMediaListDTO,
} from "../../../shared/contracts/vj";
import {
  createVjExtraClipFetcher,
  VJ_EXTRA_CLIPS_PACK_ID,
  type VjExtraClipsMediaSource,
} from "./vjExtraClipMedia";

function mediaItem(clipId: string): VjClipMediaDTO {
  return {
    clipId,
    url: `https://storage.example/${clipId}`,
    expiresAt: "2026-11-06T20:15:00.000Z",
    mimeType: "video/mp4",
    byteSize: 1024,
  };
}

function createMediaSource() {
  return vi.fn<VjExtraClipsMediaSource>(
    (clipIds): Promise<VjClipMediaListDTO> =>
      Promise.resolve({ items: clipIds.map(mediaItem) }),
  );
}

describe("createVjExtraClipFetcher", () => {
  it("asks for the extra clip ids and answers them as a pseudo pack", async () => {
    const getClipsMedia = createMediaSource();
    const fetchMedia = createVjExtraClipFetcher(getClipsMedia, [
      "extra-1",
      "extra-2",
    ]);

    const media = await fetchMedia(VJ_EXTRA_CLIPS_PACK_ID, null);

    expect(getClipsMedia).toHaveBeenCalledWith(
      ["extra-1", "extra-2"],
      undefined,
    );
    expect(media.packId).toBe(VJ_EXTRA_CLIPS_PACK_ID);
    expect(media.items.map((item) => item.clipId)).toEqual([
      "extra-1",
      "extra-2",
    ]);
  });

  it("passes the abort signal through", async () => {
    const getClipsMedia = createMediaSource();
    const fetchMedia = createVjExtraClipFetcher(getClipsMedia, ["extra-1"]);
    const controller = new AbortController();

    await fetchMedia(VJ_EXTRA_CLIPS_PACK_ID, null, controller.signal);

    expect(getClipsMedia).toHaveBeenCalledWith(["extra-1"], controller.signal);
  });

  it("uses the retry's clip ids when the preloader re-requests", async () => {
    const getClipsMedia = createMediaSource();
    const fetchMedia = createVjExtraClipFetcher(getClipsMedia, [
      "extra-1",
      "extra-2",
      "extra-3",
    ]);

    const media = await fetchMedia(VJ_EXTRA_CLIPS_PACK_ID, ["extra-2"]);

    expect(getClipsMedia).toHaveBeenCalledWith(["extra-2"], undefined);
    expect(media.items.map((item) => item.clipId)).toEqual(["extra-2"]);
  });

  it("answers an empty pseudo pack without a request when there are no extra clips", async () => {
    const getClipsMedia = createMediaSource();
    const fetchMedia = createVjExtraClipFetcher(getClipsMedia, []);

    const media = await fetchMedia(VJ_EXTRA_CLIPS_PACK_ID, null);

    expect(getClipsMedia).not.toHaveBeenCalled();
    expect(media).toEqual({ packId: VJ_EXTRA_CLIPS_PACK_ID, items: [] });
  });
});
