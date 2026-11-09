import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createVjFakeSourceDeps,
  createVjFakeVideo,
  type VjFakeVideoOptions,
} from "../../../../test/vjFakeMedia";
import type { VjRenderableClip } from "../../screen/vjLayerMachine";
import type { VjPlayheadEffects } from "./vjPlayheadClock";
import type { VjSourceFrameInput } from "./vjSourceTypes";
import { VjVideoSource } from "./vjVideoSource";

const FRAME_MS = 1000 / 30;

const CLIP: VjRenderableClip = {
  clipId: "clip-1",
  mediaKind: "video",
  fitMode: "fill",
  width: 1920,
  height: 1080,
  sourceUrl: "blob:clip-1",
  durationMs: 4000,
  loopInMs: null,
  loopOutMs: null,
  loopMode: "loop",
  defaultSpeed: 1,
};

const FORWARD: VjPlayheadEffects = {
  mode: "forward",
  rate: 1,
  stutterSliceBeats: 1,
};
const FROZEN: VjPlayheadEffects = { ...FORWARD, mode: "frozen" };
const PING_PONG: VjPlayheadEffects = { ...FORWARD, mode: "pingPong" };

function frameAt(
  nowMs: number,
  playhead: VjPlayheadEffects = FORWARD,
  deltaMs = FRAME_MS,
): VjSourceFrameInput {
  return {
    nowMs,
    deltaMs,
    playhead,
    beats: nowMs / 500,
    beatPeriodMs: 500,
    isVisible: true,
  };
}

function setUp(
  clip: VjRenderableClip = CLIP,
  options: VjFakeVideoOptions = {},
) {
  const media = createVjFakeSourceDeps();
  const fakeVideo = createVjFakeVideo(options);
  const source = new VjVideoSource(clip, media.deps, {
    createVideo: () => fakeVideo.video,
  });
  const uploadCount = () => media.fake.callsNamed("texImage2D").length;
  return { ...media, fakeVideo, source, uploadCount };
}

const PING_PONG_CLIP: VjRenderableClip = {
  ...CLIP,
  loopMode: "pingPong",
  loopInMs: 0,
  loopOutMs: 1000,
};

/**
 * Plays a 1 s ping-pong clip forward to its turn, then replays the ring
 * backward until the source leaves it. The fake video reports `seeking`
 * from the first seek until `landSeek` runs.
 */
function setUpPingPongLeave() {
  const setup = setUp(PING_PONG_CLIP);
  const { fakeVideo, source } = setup;
  let hasSeekLanded = false;
  Object.defineProperty(fakeVideo.video, "seeking", {
    configurable: true,
    get: () => fakeVideo.seeks.length > 0 && !hasSeekLanded,
  });
  fakeVideo.setDecodedFrame(960, 540);
  const clock = { nowMs: 0 };
  const playForward = (mediaTimeSec: number) => {
    fakeVideo.presentFrame(mediaTimeSec);
    clock.nowMs += FRAME_MS;
    source.update(frameAt(clock.nowMs, PING_PONG));
  };
  for (let frameIndex = 0; frameIndex <= 29; frameIndex += 1) {
    playForward(frameIndex / 30);
  }
  const blitsAtTurn = setup.fake.callsNamed("blitFramebuffer").length;
  const replayLeave = () => {
    for (let step = 0; step < 40; step += 1) {
      if (source.bindDraw(0).programKey !== "source.ring") return;
      clock.nowMs += FRAME_MS;
      source.update(frameAt(clock.nowMs, PING_PONG));
    }
  };
  const landSeek = () => {
    hasSeekLanded = true;
  };
  return { ...setup, clock, blitsAtTurn, replayLeave, landSeek };
}

async function flushPromises(): Promise<void> {
  for (let round = 0; round < 5; round += 1) await Promise.resolve();
}

afterEach(() => {
  vi.useRealTimers();
});

describe("VjVideoSource", () => {
  it("reports the first frame on the first presented frame callback", async () => {
    const { fakeVideo, source, onFirstFrame, deps } = setUp();
    expect(deps.mediaHost.contains(fakeVideo.video)).toBe(true);
    expect(fakeVideo.video.getAttribute("src")).toBe(CLIP.sourceUrl);

    fakeVideo.fireCanPlayThrough();
    await flushPromises();
    expect(fakeVideo.playCount).toBe(1);
    expect(onFirstFrame).not.toHaveBeenCalled();

    fakeVideo.presentFrame(0);

    expect(onFirstFrame).toHaveBeenCalledTimes(1);
    expect(onFirstFrame).toHaveBeenCalledWith(source.key);
    expect(source.key).toBe("clip-1|blob:clip-1");
    expect(source.isReady).toBe(true);
  });

  it("falls back 300 ms after playing when no frame callback fires and the video holds a decoded frame", async () => {
    vi.useFakeTimers({
      toFake: [
        "setTimeout",
        "clearTimeout",
        "requestAnimationFrame",
        "cancelAnimationFrame",
      ],
    });
    const { fakeVideo, onFirstFrame } = setUp();
    fakeVideo.setDecodedFrame();
    fakeVideo.fireCanPlayThrough();
    await flushPromises();
    fakeVideo.firePlaying();

    vi.advanceTimersByTime(299);
    expect(onFirstFrame).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);
    expect(onFirstFrame).toHaveBeenCalledTimes(1);
  });

  it("never reports a first frame for a video with no decoded frame", async () => {
    vi.useFakeTimers({
      toFake: [
        "setTimeout",
        "clearTimeout",
        "requestAnimationFrame",
        "cancelAnimationFrame",
      ],
    });
    const { fakeVideo, source, onFirstFrame } = setUp();
    fakeVideo.fireCanPlayThrough();
    await flushPromises();
    fakeVideo.firePlaying();

    vi.advanceTimersByTime(5000);

    expect(onFirstFrame).not.toHaveBeenCalled();
    expect(source.isReady).toBe(false);
  });

  it("uploads only when a new frame was presented", () => {
    const { fakeVideo, source, uploadCount } = setUp();
    fakeVideo.setDecodedFrame();

    source.update(frameAt(0));
    expect(uploadCount()).toBe(1);

    fakeVideo.presentFrame(1 / 30);
    source.update(frameAt(16));
    expect(uploadCount()).toBe(2);

    source.update(frameAt(32));
    fakeVideo.setPlaybackTime(0.05);
    source.update(frameAt(48));
    expect(uploadCount()).toBe(2);

    fakeVideo.presentFrame(2 / 30);
    source.update(frameAt(64));
    expect(uploadCount()).toBe(3);
  });

  it("seeks back to loop in at loop out", () => {
    const { fakeVideo } = setUp({
      ...CLIP,
      loopInMs: 1000,
      loopOutMs: 2000,
    });
    expect(fakeVideo.video.loop).toBe(false);

    fakeVideo.presentFrame(1.5);
    expect(fakeVideo.seeks).toEqual([]);

    fakeVideo.presentFrame(1.96);
    expect(fakeVideo.seeks).toEqual([1]);
  });

  it("plays the ring backward in ping-pong and seeks once at the turn", () => {
    const { fakeVideo, source } = setUp({
      ...CLIP,
      loopMode: "pingPong",
      loopInMs: 0,
      loopOutMs: 1000,
    });
    fakeVideo.setDecodedFrame(960, 540);
    let nowMs = 0;
    const playForward = (mediaTimeSec: number) => {
      fakeVideo.presentFrame(mediaTimeSec);
      nowMs += FRAME_MS;
      source.update(frameAt(nowMs, PING_PONG));
    };
    for (let frameIndex = 0; frameIndex <= 28; frameIndex += 1) {
      playForward(frameIndex / 30);
    }
    expect(source.bindDraw(0).programKey).toBe("source.clip");
    const pausesBeforeTurn = fakeVideo.pauseCount;
    const playsBeforeTurn = fakeVideo.playCount;

    playForward(29 / 30);

    expect(fakeVideo.pauseCount).toBe(pausesBeforeTurn + 1);
    const ringLayers: number[] = [];
    for (let step = 0; step < 40; step += 1) {
      const draw = source.bindDraw(0);
      if (draw.programKey !== "source.ring") break;
      ringLayers.push(Number(draw.uniforms.uRingLayer));
      nowMs += FRAME_MS;
      source.update(frameAt(nowMs, PING_PONG));
    }

    expect(ringLayers[0]).toBe(27);
    expect(ringLayers.length).toBeGreaterThan(20);
    expect(ringLayers).toEqual(
      [...ringLayers].sort((left, right) => right - left),
    );
    expect(ringLayers.at(-1)).toBeLessThanOrEqual(2);
    expect(fakeVideo.seeks).toHaveLength(1);
    expect(fakeVideo.seeks[0]).toBeCloseTo(1 / 30);
    expect(fakeVideo.playCount).toBe(playsBeforeTurn + 1);
    expect(source.bindDraw(0).programKey).toBe("source.clip");
  });

  it("bounces a 10 s ping-pong span over its last ring-length, ending at loop out", () => {
    const { fakeVideo, source } = setUp({
      ...CLIP,
      durationMs: 12000,
      loopMode: "pingPong",
      loopInMs: 0,
      loopOutMs: 10000,
    });
    fakeVideo.setDecodedFrame(960, 540);
    let nowMs = 0;
    const playForward = (mediaTimeSec: number) => {
      fakeVideo.presentFrame(mediaTimeSec);
      nowMs += FRAME_MS;
      source.update(frameAt(nowMs, PING_PONG));
    };
    const pausesAtStart = fakeVideo.pauseCount;
    // 298 / 30 s is still before loop out minus the seek lead.
    for (let frameIndex = 0; frameIndex <= 298; frameIndex += 1) {
      playForward(frameIndex / 30);
    }
    expect(fakeVideo.pauseCount).toBe(pausesAtStart);
    expect(source.bindDraw(0).programKey).toBe("source.clip");
    expect(fakeVideo.seeks).toEqual([]);

    playForward(299 / 30);
    expect(fakeVideo.pauseCount).toBe(pausesAtStart + 1);
    expect(source.bindDraw(0).programKey).toBe("source.ring");

    for (let step = 0; step < 200; step += 1) {
      if (source.bindDraw(0).programKey !== "source.ring") break;
      nowMs += FRAME_MS;
      source.update(frameAt(nowMs, PING_PONG));
    }
    expect(source.bindDraw(0).programKey).toBe("source.clip");
    expect(fakeVideo.seeks).toHaveLength(1);
    // The way back covers the last ring-length (64 frames) before loop out.
    expect(fakeVideo.seeks[0]).toBeGreaterThan(7.5);
    expect(fakeVideo.seeks[0]).toBeLessThan(8.2);
  });

  it("pauses and keeps the last frame while frozen", async () => {
    const { fakeVideo, source, uploadCount } = setUp();
    fakeVideo.setDecodedFrame();
    fakeVideo.fireCanPlayThrough();
    await flushPromises();
    fakeVideo.presentFrame(0);
    source.update(frameAt(0));
    expect(uploadCount()).toBe(1);

    source.update(frameAt(16, FROZEN));
    fakeVideo.presentFrame(1 / 30);
    source.update(frameAt(32, FROZEN));

    expect(fakeVideo.video.paused).toBe(true);
    expect(uploadCount()).toBe(1);
    const draw = source.bindDraw(2);
    expect(draw.programKey).toBe("source.clip");
    expect(draw.uniforms.uSource).toBe(2);
    expect(draw.uniforms.uBackdrop).toBe(3);

    const playsWhileFrozen = fakeVideo.playCount;
    source.update(frameAt(48));
    expect(fakeVideo.playCount).toBe(playsWhileFrozen + 1);
  });

  it("drops its decoder and source on dispose", () => {
    const { fakeVideo, source, deps, fake, onFailed } = setUp();

    source.dispose();

    expect(deps.mediaHost.contains(fakeVideo.video)).toBe(false);
    expect(fakeVideo.video.getAttribute("src")).toBeNull();
    expect(fakeVideo.loadCount).toBe(1);
    expect(fakeVideo.video.paused).toBe(true);
    expect(fakeVideo.pendingFrameCallbackCount()).toBe(0);
    expect(fake.callsNamed("deleteTexture")).toHaveLength(1);
    fakeVideo.fireError();
    expect(onFailed).not.toHaveBeenCalled();
  });

  it("reports decode_failed on a media error", () => {
    const { fakeVideo, source, onFailed, onFirstFrame } = setUp();

    fakeVideo.fireError();
    fakeVideo.fireError();

    expect(onFailed).toHaveBeenCalledTimes(1);
    expect(onFailed).toHaveBeenCalledWith(source.key, "decode_failed");
    expect(onFirstFrame).not.toHaveBeenCalled();
    expect(source.isReady).toBe(false);
  });
});

describe("VjVideoSource leaving the ping-pong replay", () => {
  it("never uploads the video while it seeks after leaving the ping-pong replay", () => {
    const { fakeVideo, source, uploadCount, clock, replayLeave, landSeek } =
      setUpPingPongLeave();

    replayLeave();
    expect(source.bindDraw(0).programKey).toBe("source.clip");
    expect(fakeVideo.seeks).toHaveLength(1);
    expect(fakeVideo.video.seeking).toBe(true);
    const uploadsAtLeave = uploadCount();

    clock.nowMs += FRAME_MS;
    source.update(frameAt(clock.nowMs, PING_PONG));
    expect(uploadCount()).toBe(uploadsAtLeave);

    // Past the frame callback grace, so the currentTime fallback is on.
    clock.nowMs += 400;
    source.update(frameAt(clock.nowMs, PING_PONG));
    expect(uploadCount()).toBe(uploadsAtLeave);

    landSeek();
    fakeVideo.presentFrame(fakeVideo.seeks[0] ?? 0);
    clock.nowMs += FRAME_MS;
    source.update(frameAt(clock.nowMs, PING_PONG));
    expect(uploadCount()).toBe(uploadsAtLeave + 1);
  });

  it("copies the ring frame showing into the clip texture when leaving the ping-pong replay", () => {
    const { source, fake, deps, blitsAtTurn, replayLeave } =
      setUpPingPongLeave();
    const { gl } = deps.context;

    replayLeave();

    const blits = fake.callsNamed("blitFramebuffer");
    expect(blits).toHaveLength(blitsAtTurn + 1);
    expect(blits.at(-1)?.args.slice(0, 8)).toEqual([
      0, 0, 960, 540, 0, 0, 960, 540,
    ]);
    expect(blits.at(-1)?.args[9]).toBe(gl.LINEAR);
    const readLayer = fake.callsNamed("framebufferTextureLayer").at(-1);
    expect(readLayer?.args[0]).toBe(gl.READ_FRAMEBUFFER);
    // 28 frames sit in layers 0 to 27; the replay leaves at the oldest.
    expect(readLayer?.args[4]).toBe(0);
    const drawTarget = fake.callsNamed("framebufferTexture2D").at(-1);
    expect(drawTarget?.args[0]).toBe(gl.DRAW_FRAMEBUFFER);

    const callsBeforeDraw = fake.calls.length;
    expect(source.bindDraw(0).programKey).toBe("source.clip");
    const clipBinding = fake.calls
      .slice(callsBeforeDraw)
      .find((call) => call.name === "bindTexture");
    expect(clipBinding?.args[0]).toBe(gl.TEXTURE_2D);
    expect(drawTarget?.args[3]).toBe(clipBinding?.args[1]);
  });
});
