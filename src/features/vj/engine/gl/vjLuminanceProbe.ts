/**
 * The luminance probe (engine plan, Task E16, decision 7): reads the output
 * as a 16x16 grid of RGBA bytes for the luminance net (`observeVjProbe`),
 * without ever stalling the GPU pipeline.
 *
 * `capture` blits the output into a 512x512 mipmapped texture, generates its
 * mip chain (level 5 is 16x16, each cell the box average of a 32x32 patch),
 * starts an asynchronous `readPixels` of level 5 into a pixel pack buffer and
 * drops a fence behind it. `poll` checks the oldest fence with a zero
 * timeout and copies the bytes out only once the GPU signalled it, one or two
 * frames later. Two buffers alternate, so a capture never writes into the
 * buffer whose read is still in flight: when both are busy the capture is
 * skipped for that frame.
 *
 * Each buffer's storage is made at its first capture, never up front: Chrome
 * treats `bufferData` as a write and shadows a READ-usage buffer written before
 * a fence, so storage made early gets a shadow it never reads.
 *
 * Rows arrive bottom row first (the GL convention); the net's sliding windows
 * do not depend on row order. `poll` answers the same byte array every time:
 * hand it to the net before the next poll.
 */
import type { VjGlContext } from "./vjGlContext";
import type { VjRenderTarget } from "./vjGlTargets";

export const VJ_PROBE_SOURCE_SIZE = 512;
/** 512 >> 5 = 16. */
export const VJ_PROBE_MIP_LEVEL = 5;
export const VJ_PROBE_SIZE = VJ_PROBE_SOURCE_SIZE >> VJ_PROBE_MIP_LEVEL;
const VJ_PROBE_LEVEL_COUNT = Math.log2(VJ_PROBE_SOURCE_SIZE) + 1;
const VJ_PROBE_BYTES = VJ_PROBE_SIZE * VJ_PROBE_SIZE * 4;

interface VjProbeSlot {
  buffer: WebGLBuffer;
  fence: WebGLSync | null;
  isAllocated: boolean;
}

export class VjLuminanceProbe {
  private readonly gl: WebGL2RenderingContext;
  private readonly texture: WebGLTexture;
  private readonly fullFramebuffer: WebGLFramebuffer;
  private readonly probeFramebuffer: WebGLFramebuffer;
  private readonly slots: readonly [VjProbeSlot, VjProbeSlot];
  private readonly bytes = new Uint8Array(VJ_PROBE_BYTES);
  private writeIndex = 0;
  private readIndex = 0;

  constructor(context: VjGlContext) {
    const { gl } = context;
    this.gl = gl;
    this.texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texStorage2D(
      gl.TEXTURE_2D,
      VJ_PROBE_LEVEL_COUNT,
      gl.RGBA8,
      VJ_PROBE_SOURCE_SIZE,
      VJ_PROBE_SOURCE_SIZE,
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.bindTexture(gl.TEXTURE_2D, null);
    this.fullFramebuffer = this.framebufferForLevel(0);
    this.probeFramebuffer = this.framebufferForLevel(VJ_PROBE_MIP_LEVEL);
    this.slots = [this.createSlot(), this.createSlot()];
  }

  /** Starts an asynchronous read of `source`; skipped while both buffers wait on the GPU. */
  capture(source: VjRenderTarget): void {
    const { gl } = this;
    const slot = this.slots[this.writeIndex];
    if (!slot || slot.fence !== null) return;
    gl.bindFramebuffer(gl.READ_FRAMEBUFFER, source.framebuffer);
    gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, this.fullFramebuffer);
    gl.blitFramebuffer(
      0,
      0,
      source.width,
      source.height,
      0,
      0,
      VJ_PROBE_SOURCE_SIZE,
      VJ_PROBE_SOURCE_SIZE,
      gl.COLOR_BUFFER_BIT,
      gl.LINEAR,
    );
    gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, null);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindFramebuffer(gl.READ_FRAMEBUFFER, this.probeFramebuffer);
    gl.bindBuffer(gl.PIXEL_PACK_BUFFER, slot.buffer);
    if (!slot.isAllocated) {
      // Lazy on purpose: Chrome counts bufferData as a write and shadows any
      // READ-usage buffer written before a fence, so storage made up front
      // gets a shadow it never reads and its first capture logs a warning.
      gl.bufferData(gl.PIXEL_PACK_BUFFER, VJ_PROBE_BYTES, gl.STREAM_READ);
      slot.isAllocated = true;
    }
    gl.readPixels(
      0,
      0,
      VJ_PROBE_SIZE,
      VJ_PROBE_SIZE,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      0,
    );
    gl.bindBuffer(gl.PIXEL_PACK_BUFFER, null);
    gl.bindFramebuffer(gl.READ_FRAMEBUFFER, null);
    const fence = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    if (fence === null) return;
    slot.fence = fence;
    this.writeIndex = 1 - this.writeIndex;
  }

  /** The 16x16 RGBA bytes of the oldest capture once its fence signalled, else null. */
  poll(): Uint8Array | null {
    const { gl } = this;
    const slot = this.slots[this.readIndex];
    if (!slot || slot.fence === null) return null;
    const waitResult = gl.clientWaitSync(slot.fence, 0, 0);
    if (waitResult === gl.TIMEOUT_EXPIRED) return null;
    gl.deleteSync(slot.fence);
    slot.fence = null;
    this.readIndex = 1 - this.readIndex;
    if (waitResult === gl.WAIT_FAILED) return null;
    gl.bindBuffer(gl.PIXEL_PACK_BUFFER, slot.buffer);
    gl.getBufferSubData(gl.PIXEL_PACK_BUFFER, 0, this.bytes);
    gl.bindBuffer(gl.PIXEL_PACK_BUFFER, null);
    return this.bytes;
  }

  dispose(): void {
    const { gl } = this;
    for (const slot of this.slots) {
      if (slot.fence !== null) gl.deleteSync(slot.fence);
      slot.fence = null;
      gl.deleteBuffer(slot.buffer);
    }
    gl.deleteFramebuffer(this.fullFramebuffer);
    gl.deleteFramebuffer(this.probeFramebuffer);
    gl.deleteTexture(this.texture);
  }

  private framebufferForLevel(level: number): WebGLFramebuffer {
    const { gl } = this;
    const framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      this.texture,
      level,
    );
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    return framebuffer;
  }

  private createSlot(): VjProbeSlot {
    const { gl } = this;
    return { buffer: gl.createBuffer(), fence: null, isAllocated: false };
  }
}
