import { describe, expect, it } from "vitest";
import { createVjFakeWebGl2Canvas } from "../../../../test/vjFakeWebGl2";
import { VjTargetPool, createVjRenderTarget } from "./vjGlTargets";

function setUp() {
  const fake = createVjFakeWebGl2Canvas();
  let nowMs = 0;
  const pool = new VjTargetPool(fake.context, () => nowMs);
  return {
    fake,
    pool,
    setNow: (value: number) => {
      nowMs = value;
    },
  };
}

describe("createVjRenderTarget", () => {
  it("allocates an RGBA8 texture with LINEAR and CLAMP_TO_EDGE behind a framebuffer", () => {
    const fake = createVjFakeWebGl2Canvas();
    const gl = fake.context;

    const target = createVjRenderTarget(gl, 640.4, 360);

    expect(target).toMatchObject({ width: 640, height: 360 });
    expect(fake.callsNamed("texImage2D")[0]?.args.slice(0, 5)).toEqual([
      gl.TEXTURE_2D,
      0,
      gl.RGBA8,
      640,
      360,
    ]);
    expect(
      fake.callsNamed("texParameteri").map((call) => call.args[2]),
    ).toEqual([gl.LINEAR, gl.LINEAR, gl.CLAMP_TO_EDGE, gl.CLAMP_TO_EDGE]);
    expect(fake.callsNamed("framebufferTexture2D")[0]?.args[3]).toBe(
      target.texture,
    );
  });
});

describe("VjTargetPool", () => {
  it("reallocates a target when its size changes", () => {
    const { fake, pool } = setUp();

    const first = pool.acquire("live", 1920, 1080);
    const again = pool.acquire("live", 1920, 1080);
    const resized = pool.acquire("live", 1280, 720);

    expect(again).toBe(first);
    expect(resized).not.toBe(first);
    expect(resized).toMatchObject({ width: 1280, height: 720 });
    expect(
      fake.callsNamed("deleteTexture").map((call) => call.args[0]),
    ).toEqual([first.texture]);
    expect(
      fake.callsNamed("deleteFramebuffer").map((call) => call.args[0]),
    ).toEqual([first.framebuffer]);
  });

  it("sums the byte size of every RGBA8 target", () => {
    const { pool } = setUp();

    pool.acquire("live", 1920, 1080);
    pool.acquire("dreamBlur", 960, 540);

    expect(pool.byteSize()).toBe(1920 * 1080 * 4 + 960 * 540 * 4);
  });

  it("frees a target left idle past the idle time", () => {
    const { fake, pool, setNow } = setUp();
    setNow(1000);
    const idle = pool.acquire("echo", 1920, 1080);
    pool.acquire("live", 1920, 1080);
    setNow(4500);
    pool.acquire("live", 1920, 1080);

    pool.releaseIdle(5000, 3000);

    expect(
      fake.callsNamed("deleteTexture").map((call) => call.args[0]),
    ).toEqual([idle.texture]);
    expect(pool.byteSize()).toBe(1920 * 1080 * 4);
    expect(pool.acquire("echo", 1920, 1080)).not.toBe(idle);
  });

  it("deletes every texture and framebuffer on disposeAll", () => {
    const { fake, pool } = setUp();
    const live = pool.acquire("live", 1920, 1080);
    const mix = pool.acquire("mix", 1920, 1080);

    pool.disposeAll();

    expect(
      fake.callsNamed("deleteTexture").map((call) => call.args[0]),
    ).toEqual([live.texture, mix.texture]);
    expect(
      fake.callsNamed("deleteFramebuffer").map((call) => call.args[0]),
    ).toEqual([live.framebuffer, mix.framebuffer]);
    expect(pool.byteSize()).toBe(0);
  });
});
