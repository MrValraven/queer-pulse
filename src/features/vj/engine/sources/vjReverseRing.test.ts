import { describe, expect, it } from "vitest";
import { createVjFakeWebGl2Canvas } from "../../../../test/vjFakeWebGl2";
import { createVjGlContext, type VjGlContext } from "../gl/vjGlContext";
import {
  VJ_RING_BUDGET_BYTES,
  VJ_RING_MAX_WIDTH,
  VjReverseRing,
  VjRingBudget,
} from "./vjReverseRing";

const FRAME_MS = 1000 / 30;

function setUp() {
  const fake = createVjFakeWebGl2Canvas();
  const result = createVjGlContext(fake.canvas, {
    onLost: () => undefined,
    onRestored: () => undefined,
  });
  if (!result.ok) throw new Error("no fake context");
  const context: VjGlContext = result.context;
  const sourceTexture = context.gl.createTexture();
  return { fake, context, sourceTexture };
}

describe("VjReverseRing", () => {
  it("fits about 2 s of 960 px frames in 128 MB", () => {
    const { fake, context, sourceTexture } = setUp();
    const budget = new VjRingBudget();

    const ring = new VjReverseRing(context, 1920, 1080, budget);
    for (let frameIndex = 0; frameIndex < ring.capacity; frameIndex += 1) {
      ring.record(sourceTexture, frameIndex * FRAME_MS);
    }

    expect(ring.width).toBe(VJ_RING_MAX_WIDTH);
    expect(ring.height).toBe(540);
    expect(ring.capacity * FRAME_MS).toBeGreaterThanOrEqual(2000);
    expect(ring.durationMs()).toBeGreaterThan(2000);
    expect(budget.reservedBytes).toBe(ring.byteSize());
    expect(budget.reservedBytes).toBeLessThanOrEqual(VJ_RING_BUDGET_BYTES);
    expect(fake.callsNamed("texStorage3D")[0]?.args.slice(2, 6)).toEqual([
      context.gl.RGBA8,
      960,
      540,
      ring.capacity,
    ]);
    expect(fake.callsNamed("blitFramebuffer")).toHaveLength(ring.capacity);
    expect(fake.callsNamed("blitFramebuffer")[0]?.args.slice(0, 8)).toEqual([
      0, 0, 1920, 1080, 0, 0, 960, 540,
    ]);
  });

  it("overwrites the oldest frame when full", () => {
    const { fake, context, sourceTexture } = setUp();
    const ring = new VjReverseRing(context, 960, 540, new VjRingBudget());

    for (let frameIndex = 0; frameIndex <= ring.capacity; frameIndex += 1) {
      ring.record(sourceTexture, frameIndex * FRAME_MS, frameIndex * 10);
    }

    expect(ring.length).toBe(ring.capacity);
    const layerWrites = fake
      .callsNamed("framebufferTextureLayer")
      .map((call) => call.args[4]);
    expect(layerWrites.at(-1)).toBe(0);
    expect(ring.layerAt(0)).toBe(0);
    expect(ring.layerAt(ring.capacity - 1)).toBe(1);
    expect(ring.mediaTimeMsAt(0)).toBe(ring.capacity * 10);
    expect(ring.oldestStampMs()).toBeCloseTo(FRAME_MS);
    expect(ring.positionFromNewestAt(ring.newestStampMs() - FRAME_MS / 2)).toBe(
      1,
    );
  });

  it("copies one layer into a 2D texture at the target size", () => {
    const { fake, context, sourceTexture } = setUp();
    const { gl } = context;
    const ring = new VjReverseRing(context, 1920, 1080, new VjRingBudget());
    const targetTexture = gl.createTexture();

    ring.copyLayerInto(0, targetTexture, 1920, 1080);
    expect(fake.callsNamed("blitFramebuffer")).toHaveLength(0);

    for (let frameIndex = 0; frameIndex < 3; frameIndex += 1) {
      ring.record(sourceTexture, frameIndex * FRAME_MS);
    }
    ring.copyLayerInto(2, targetTexture, 1920, 1080);

    expect(fake.callsNamed("framebufferTextureLayer").at(-1)?.args).toEqual([
      gl.READ_FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      ring.arrayTexture,
      0,
      ring.layerAt(2),
    ]);
    expect(ring.layerAt(2)).toBe(0);
    expect(fake.callsNamed("framebufferTexture2D").at(-1)?.args).toEqual([
      gl.DRAW_FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      targetTexture,
      0,
    ]);
    const blits = fake.callsNamed("blitFramebuffer");
    expect(blits).toHaveLength(4);
    expect(blits.at(-1)?.args).toEqual([
      0,
      0,
      960,
      540,
      0,
      0,
      1920,
      1080,
      gl.COLOR_BUFFER_BIT,
      gl.LINEAR,
    ]);

    ring.dispose();
    ring.copyLayerInto(0, targetTexture, 1920, 1080);
    expect(fake.callsNamed("blitFramebuffer")).toHaveLength(4);
  });

  it("refuses a ring the shared budget cannot hold", () => {
    const { fake, context } = setUp();
    const budget = new VjRingBudget();
    const first = new VjReverseRing(context, 1920, 1080, budget);
    const reservedByFirst = budget.reservedBytes;

    const second = new VjReverseRing(context, 1920, 1080, budget);

    expect(first.isRefused).toBe(false);
    expect(second.isRefused).toBe(true);
    expect(second.capacity).toBe(0);
    expect(second.arrayTexture).toBeNull();
    expect(budget.reservedBytes).toBe(reservedByFirst);
    expect(budget.refusedCount).toBe(1);
    expect(fake.callsNamed("texStorage3D")).toHaveLength(1);
  });

  it("releases its bytes on dispose", () => {
    const { fake, context } = setUp();
    const budget = new VjRingBudget();
    const ring = new VjReverseRing(context, 1280, 720, budget);
    const texture = ring.arrayTexture;

    ring.dispose();
    ring.dispose();

    expect(budget.reservedBytes).toBe(0);
    expect(ring.byteSize()).toBe(0);
    expect(
      fake.callsNamed("deleteTexture").map((call) => call.args[0]),
    ).toEqual([texture]);
    expect(fake.callsNamed("deleteFramebuffer")).toHaveLength(2);
    const afterDispose = new VjReverseRing(context, 1920, 1080, budget);
    expect(afterDispose.isRefused).toBe(false);
  });
});
