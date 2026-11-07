import { describe, expect, it, vi } from "vitest";
import { createVjFakeWebGl2Canvas } from "../../../../test/vjFakeWebGl2";
import { createVjGlContext } from "./vjGlContext";
import { createVjRenderTarget } from "./vjGlTargets";
import { VJ_PROBE_SIZE, VjLuminanceProbe } from "./vjLuminanceProbe";

const PROBE_BYTE_LENGTH = VJ_PROBE_SIZE * VJ_PROBE_SIZE * 4;

function setUp() {
  const probeBytes = new Uint8Array(PROBE_BYTE_LENGTH);
  probeBytes.forEach((_, index) => {
    probeBytes[index] = index % 251;
  });
  const fake = createVjFakeWebGl2Canvas({ probeBytes });
  const result = createVjGlContext(fake.canvas, {
    onLost: vi.fn(),
    onRestored: vi.fn(),
  });
  if (!result.ok) throw new Error("expected a context");
  const { context } = result;
  const source = createVjRenderTarget(context.gl, 1920, 1080);
  const probe = new VjLuminanceProbe(context);
  return { fake, context, source, probe, probeBytes };
}

/** The pixel pack buffer bound when each readPixels ran. */
function readBuffers(
  calls: readonly { name: string; args: unknown[] }[],
  gl: WebGL2RenderingContext,
): unknown[] {
  let bound: unknown = null;
  const buffers: unknown[] = [];
  for (const call of calls) {
    if (call.name === "bindBuffer" && call.args[0] === gl.PIXEL_PACK_BUFFER) {
      bound = call.args[1];
    }
    if (call.name === "readPixels") buffers.push(bound);
  }
  return buffers;
}

describe("VjLuminanceProbe", () => {
  it("answers null until the fence signals", () => {
    const { fake, source, probe } = setUp();
    fake.setFenceSignalled(false);

    expect(probe.poll()).toBeNull();
    probe.capture(source);

    expect(probe.poll()).toBeNull();
    expect(probe.poll()).toBeNull();
    expect(fake.callsNamed("getBufferSubData")).toHaveLength(0);
    for (const call of fake.callsNamed("clientWaitSync")) {
      expect(call.args.slice(1)).toEqual([0, 0]);
    }
  });

  it("answers the 16x16 bytes once it does", () => {
    const { fake, context, source, probe, probeBytes } = setUp();
    fake.setFenceSignalled(false);
    probe.capture(source);
    expect(probe.poll()).toBeNull();

    fake.setFenceSignalled(true);
    const bytes = probe.poll();

    expect(bytes).toHaveLength(PROBE_BYTE_LENGTH);
    expect(Array.from(bytes ?? [])).toEqual(Array.from(probeBytes));
    expect(fake.callsNamed("deleteSync")).toHaveLength(1);
    expect(probe.poll()).toBeNull();
    const readPixels = fake.callsNamed("readPixels")[0];
    expect(readPixels?.args.slice(0, 4)).toEqual([
      0,
      0,
      VJ_PROBE_SIZE,
      VJ_PROBE_SIZE,
    ]);
    expect(fake.callsNamed("generateMipmap")).toHaveLength(1);
    expect(fake.callsNamed("fenceSync")[0]?.args[0]).toBe(
      context.gl.SYNC_GPU_COMMANDS_COMPLETE,
    );
  });

  it("alternates its two pixel buffers", () => {
    const { fake, context, source, probe } = setUp();
    fake.setFenceSignalled(false);

    probe.capture(source);
    probe.capture(source);
    // Both buffers wait on the GPU: this capture is skipped.
    probe.capture(source);

    const [first, second] = readBuffers(fake.calls, context.gl);
    expect(readBuffers(fake.calls, context.gl)).toHaveLength(2);
    expect(first).toBeTruthy();
    expect(second).toBeTruthy();
    expect(second).not.toBe(first);

    fake.setFenceSignalled(true);
    expect(probe.poll()).not.toBeNull();
    probe.capture(source);

    expect(readBuffers(fake.calls, context.gl)).toEqual([first, second, first]);
  });

  it("frees its buffers, fences and targets on dispose", () => {
    const { fake, source, probe } = setUp();
    fake.setFenceSignalled(false);
    probe.capture(source);

    probe.dispose();

    expect(fake.callsNamed("deleteBuffer")).toHaveLength(2);
    expect(fake.callsNamed("deleteSync")).toHaveLength(1);
    expect(fake.callsNamed("deleteFramebuffer")).toHaveLength(2);
    expect(fake.callsNamed("deleteTexture")).toHaveLength(1);
  });
});
