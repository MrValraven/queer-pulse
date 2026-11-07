import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createVjFakeImage,
  createVjFakeSourceDeps,
  installVjFakeImageDecoder,
} from "../../../../test/vjFakeMedia";
import type { VjRenderableClip } from "../../screen/vjLayerMachine";
import { VJ_GIF_BUDGET_BYTES, VJ_GIF_SHARED_BUDGET_BYTES } from "./vjGifDecode";
import { VjGifSource } from "./vjGifSource";
import type { VjPlayheadEffects } from "./vjPlayheadClock";
import { VjRingBudget } from "./vjReverseRing";
import type { VjSourceFrameInput } from "./vjSourceTypes";

const GIF_CLIP: VjRenderableClip = {
  clipId: "gif-1",
  mediaKind: "gif",
  fitMode: "fill",
  width: 4,
  height: 4,
  sourceUrl: "blob:gif-1",
  durationMs: 400,
  loopInMs: null,
  loopOutMs: null,
  loopMode: "loop",
  defaultSpeed: 1,
};

const FOUR_FRAMES = [0, 1, 2, 3].map(() => ({
  width: 4,
  height: 4,
  durationMs: 100,
}));

const FORWARD: VjPlayheadEffects = {
  mode: "forward",
  rate: 1,
  stutterSliceBeats: 0.5,
};

function frameWith(
  playhead: VjPlayheadEffects,
  deltaMs: number,
  beats = 0,
): VjSourceFrameInput {
  return {
    nowMs: 0,
    deltaMs,
    playhead,
    beats,
    beatPeriodMs: 400,
    isVisible: true,
  };
}

function lastUploadedFrame(media: ReturnType<typeof createVjFakeSourceDeps>) {
  return media.fake.callsNamed("texImage2D").at(-1)?.args[5];
}

async function decodedGifSource() {
  const decoder = installVjFakeImageDecoder(FOUR_FRAMES);
  const media = createVjFakeSourceDeps();
  const source = new VjGifSource(GIF_CLIP, media.deps);
  await vi.waitFor(() => expect(media.onFirstFrame).toHaveBeenCalled());
  return { decoder, media, source };
}

// Runs before the setup file's afterEach, so the stubbed fetch is gone first.
afterEach(() => {
  vi.unstubAllGlobals();
});

describe("VjGifSource", () => {
  it("decodes every frame once and closes each VideoFrame", async () => {
    const { decoder, media, source } = await decodedGifSource();

    expect(decoder.fetchedUrls).toEqual([GIF_CLIP.sourceUrl]);
    expect(decoder.decodedFrameIndexes).toEqual([0, 1, 2, 3]);
    expect(decoder.closedVideoFrameCount()).toBe(4);
    expect(decoder.closedDecoderCount()).toBe(1);
    expect(decoder.bitmaps).toHaveLength(4);
    expect(media.onFirstFrame).toHaveBeenCalledWith(source.key);
    expect(source.isReady).toBe(true);
    expect(source.isImageFallback).toBe(false);
    expect(lastUploadedFrame(media)).toBe(decoder.bitmaps[0]);

    source.dispose();

    expect(decoder.bitmaps.every((bitmap) => bitmap.isClosed)).toBe(true);
  });

  it("plays at twice the rate at speed 2", async () => {
    const { decoder, media, source } = await decodedGifSource();

    source.update(frameWith({ ...FORWARD, rate: 2 }, 100));

    expect(source.playheadMs).toBe(200);
    expect(lastUploadedFrame(media)).toBe(decoder.bitmaps[2]);
  });

  it("plays backward, freezes and stutters on the beat", async () => {
    const { decoder, media, source } = await decodedGifSource();

    source.update(frameWith({ ...FORWARD, mode: "reverse" }, 100));
    expect(source.playheadMs).toBe(300);
    expect(lastUploadedFrame(media)).toBe(decoder.bitmaps[3]);

    const uploadsBeforeFreeze = media.fake.callsNamed("texImage2D").length;
    source.update(frameWith({ ...FORWARD, mode: "frozen" }, 100));
    source.update(frameWith({ ...FORWARD, mode: "frozen" }, 100));
    expect(source.playheadMs).toBe(300);
    expect(media.fake.callsNamed("texImage2D")).toHaveLength(
      uploadsBeforeFreeze,
    );

    const stutter: VjPlayheadEffects = { ...FORWARD, mode: "stutter" };
    const positions = [0, 0.25, 0.5, 0.75, 1].map((beats) => {
      source.update(frameWith(stutter, 16, beats));
      return source.playheadMs;
    });
    expect(positions).toEqual([300, 0, 300, 0, 100]);
  });

  it("falls back to the img element when ImageDecoder is missing", async () => {
    const media = createVjFakeSourceDeps();
    const fakeImage = createVjFakeImage();
    const source = new VjGifSource(GIF_CLIP, media.deps, {
      createImage: () => fakeImage.image,
    });

    expect(source.isImageFallback).toBe(true);
    expect(media.deps.mediaHost.contains(fakeImage.image)).toBe(true);
    expect(fakeImage.image.getAttribute("src")).toBe(GIF_CLIP.sourceUrl);

    fakeImage.setDecoded(4, 4);
    fakeImage.resolveDecode();
    await vi.waitFor(() =>
      expect(media.onFirstFrame).toHaveBeenCalledWith(source.key),
    );

    source.update(frameWith(FORWARD, 16));
    source.update(frameWith({ ...FORWARD, mode: "frozen" }, 16));

    const uploads = media.fake.callsNamed("texImage2D");
    expect(uploads).toHaveLength(2);
    expect(uploads[1]?.args[5]).toBe(fakeImage.image);
    expect(source.playheadMs).toBe(0);

    source.dispose();
    expect(media.deps.mediaHost.contains(fakeImage.image)).toBe(false);
    expect(fakeImage.image.getAttribute("src")).toBeNull();
  });

  it("falls back when the GIF exceeds its byte budget", async () => {
    const decoder = installVjFakeImageDecoder([
      { width: 4000, height: 4000, durationMs: 100 },
      { width: 4000, height: 4000, durationMs: 100 },
    ]);
    const media = createVjFakeSourceDeps();
    const fakeImage = createVjFakeImage();
    const source = new VjGifSource(GIF_CLIP, media.deps, {
      createImage: () => fakeImage.image,
    });

    await vi.waitFor(() => expect(source.isImageFallback).toBe(true));

    expect(decoder.decodedFrameIndexes).toEqual([0]);
    expect(decoder.closedVideoFrameCount()).toBe(1);
    expect(decoder.bitmaps).toHaveLength(0);
    expect(decoder.closedDecoderCount()).toBe(1);
    expect(media.deps.mediaHost.contains(fakeImage.image)).toBe(true);
    expect(media.onFailed).not.toHaveBeenCalled();
  });

  it("reserves the shared budget before decoding and gives back what the frames do not use", async () => {
    installVjFakeImageDecoder(FOUR_FRAMES);
    const gifBudget = new VjRingBudget(VJ_GIF_SHARED_BUDGET_BYTES);
    const media = createVjFakeSourceDeps({ gifBudget });
    const firstSource = new VjGifSource(GIF_CLIP, media.deps);
    expect(gifBudget.reservedBytes).toBe(VJ_GIF_BUDGET_BYTES);
    const secondSource = new VjGifSource(
      { ...GIF_CLIP, clipId: "gif-2", sourceUrl: "blob:gif-2" },
      media.deps,
    );
    // Two GIFs loading together hold the whole shared budget while they decode.
    expect(gifBudget.reservedBytes).toBe(VJ_GIF_SHARED_BUDGET_BYTES);

    await vi.waitFor(() => expect(media.onFirstFrame).toHaveBeenCalledTimes(2));

    // Four 4x4 frames each: 256 bytes per GIF stay reserved.
    expect(gifBudget.reservedBytes).toBe(2 * 256);
    firstSource.dispose();
    expect(gifBudget.reservedBytes).toBe(256);
    secondSource.dispose();
    expect(gifBudget.reservedBytes).toBe(0);
  });

  it("gives the whole reservation back when disposed during the decode", async () => {
    installVjFakeImageDecoder(FOUR_FRAMES);
    const gifBudget = new VjRingBudget(VJ_GIF_SHARED_BUDGET_BYTES);
    const media = createVjFakeSourceDeps({ gifBudget });
    const source = new VjGifSource(GIF_CLIP, media.deps);
    expect(gifBudget.reservedBytes).toBe(VJ_GIF_BUDGET_BYTES);

    source.dispose();
    expect(gifBudget.reservedBytes).toBe(0);
    // Let the aborted decode settle.
    for (let round = 0; round < 3; round += 1) {
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
    expect(gifBudget.reservedBytes).toBe(0);
    expect(media.onFirstFrame).not.toHaveBeenCalled();
  });

  it("gives the reservation back when the GIF falls back for its size", async () => {
    installVjFakeImageDecoder([
      { width: 4000, height: 4000, durationMs: 100 },
      { width: 4000, height: 4000, durationMs: 100 },
    ]);
    const gifBudget = new VjRingBudget(VJ_GIF_SHARED_BUDGET_BYTES);
    const media = createVjFakeSourceDeps({ gifBudget });
    const fakeImage = createVjFakeImage();
    const source = new VjGifSource(GIF_CLIP, media.deps, {
      createImage: () => fakeImage.image,
    });

    await vi.waitFor(() => expect(source.isImageFallback).toBe(true));
    expect(gifBudget.reservedBytes).toBe(0);
  });
});
