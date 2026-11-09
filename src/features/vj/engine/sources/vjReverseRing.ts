/**
 * The reverse frame ring (engine plan, decision 4). Browsers cannot play a
 * `<video>` backward and seeking per frame stalls on H.264 GOPs, so a video
 * source copies its recent frames into a `TEXTURE_2D_ARRAY` on the GPU and
 * replays them for reverse, ping-pong and stutter.
 *
 * Each layer holds one frame scaled to at most VJ_RING_MAX_WIDTH px wide. A
 * ring reserves its bytes from one VjRingBudget that every source shares;
 * when the budget refuses, the ring holds no layer and the source plays
 * forward. Recording blits the source texture into the next layer
 * (GPU to GPU, nothing reads back), overwriting the oldest when full.
 *
 * Stamps are the source's own timeline in media milliseconds (ascending from
 * oldest to newest), so a playhead moving over `[oldestStampMs, newestStampMs]`
 * at the clip's rate finds its frame with `positionFromNewestAt`.
 * `copyLayerInto` blits one layer back into a source texture.
 */
import type { VjGlContext } from "../gl/vjGlContext";

export const VJ_RING_MAX_WIDTH = 960;
export const VJ_RING_BUDGET_BYTES = 128 * 1024 * 1024;
/** About 2 s at 30 fps; a 960x540 ring this long fits VJ_RING_BUDGET_BYTES. */
export const VJ_RING_MAX_FRAMES = 64;
/** A ring the remaining budget can hold only this many frames of (about 0.5 s) is refused. */
export const VJ_RING_MIN_FRAMES = 16;

const BYTES_PER_PIXEL = 4;

/** Bytes every frame ring holds together, shared by every source of one compositor. */
export class VjRingBudget {
  readonly totalBytes: number;
  private reserved = 0;
  private refused = 0;

  constructor(totalBytes: number = VJ_RING_BUDGET_BYTES) {
    this.totalBytes = totalBytes;
  }

  get reservedBytes(): number {
    return this.reserved;
  }

  /** How many rings the budget refused so far (health counts them as ringRefused). */
  get refusedCount(): number {
    return this.refused;
  }

  get availableBytes(): number {
    return Math.max(0, this.totalBytes - this.reserved);
  }

  /** Reserves the bytes and answers true, or answers false and reserves nothing. */
  reserve(bytes: number): boolean {
    if (!Number.isFinite(bytes) || bytes <= 0) return false;
    if (this.reserved + bytes > this.totalBytes) return false;
    this.reserved += bytes;
    return true;
  }

  /** Counts one ring the budget could not hold. */
  countRefusal(): void {
    this.refused += 1;
  }

  release(bytes: number): void {
    if (!Number.isFinite(bytes) || bytes <= 0) return;
    this.reserved = Math.max(0, this.reserved - bytes);
  }
}

/** The ring's layer size: the source scaled down to at most VJ_RING_MAX_WIDTH px wide. */
export function vjRingSizeOf(
  sourceWidth: number,
  sourceHeight: number,
): { width: number; height: number } {
  const safeWidth = Math.max(1, Math.round(sourceWidth));
  const safeHeight = Math.max(1, Math.round(sourceHeight));
  const width = Math.min(VJ_RING_MAX_WIDTH, safeWidth);
  const height = Math.max(1, Math.round((safeHeight * width) / safeWidth));
  return { width, height };
}

function readMaxArrayLayers(gl: WebGL2RenderingContext): number {
  const value: unknown = gl.getParameter(gl.MAX_ARRAY_TEXTURE_LAYERS);
  return typeof value === "number" && value > 0 ? value : VJ_RING_MAX_FRAMES;
}

export class VjReverseRing {
  readonly width: number;
  readonly height: number;
  private readonly context: VjGlContext;
  private readonly budget: VjRingBudget;
  private readonly sourceWidth: number;
  private readonly sourceHeight: number;
  private readonly layerCapacity: number;
  private readonly stamps: Float64Array;
  private readonly mediaTimes: Float64Array;
  private texture: WebGLTexture | null = null;
  private readFramebuffer: WebGLFramebuffer | null = null;
  private drawFramebuffer: WebGLFramebuffer | null = null;
  private nextLayer = 0;
  private recordedLength = 0;
  private isDisposed = false;

  constructor(
    context: VjGlContext,
    sourceWidth: number,
    sourceHeight: number,
    budget: VjRingBudget,
  ) {
    this.context = context;
    this.budget = budget;
    this.sourceWidth = Math.max(1, Math.round(sourceWidth));
    this.sourceHeight = Math.max(1, Math.round(sourceHeight));
    const size = vjRingSizeOf(sourceWidth, sourceHeight);
    this.width = size.width;
    this.height = size.height;
    this.layerCapacity = this.reserveCapacity();
    this.stamps = new Float64Array(this.layerCapacity);
    this.mediaTimes = new Float64Array(this.layerCapacity);
    if (this.layerCapacity > 0) this.allocate();
  }

  /** Layers the ring holds; 0 when the budget refused it. */
  get capacity(): number {
    return this.layerCapacity;
  }

  /** Frames recorded since the last clear, up to the capacity. */
  get length(): number {
    return this.recordedLength;
  }

  get isRefused(): boolean {
    return this.layerCapacity === 0;
  }

  get isFull(): boolean {
    return this.layerCapacity > 0 && this.recordedLength >= this.layerCapacity;
  }

  /** The array texture the `source.ring` program samples; null when refused or disposed. */
  get arrayTexture(): WebGLTexture | null {
    return this.texture;
  }

  private get layerBytes(): number {
    return this.width * this.height * BYTES_PER_PIXEL;
  }

  /** The full length when the budget holds it, else what is left if that is at least the minimum. */
  private reserveCapacity(): number {
    const layerBytes = this.layerBytes;
    const fullCapacity = Math.min(
      VJ_RING_MAX_FRAMES,
      readMaxArrayLayers(this.context.gl),
      Math.floor(this.budget.totalBytes / layerBytes),
    );
    if (fullCapacity >= 1 && this.budget.reserve(fullCapacity * layerBytes)) {
      return fullCapacity;
    }
    const remainingCapacity = Math.min(
      fullCapacity,
      Math.floor(this.budget.availableBytes / layerBytes),
    );
    if (
      remainingCapacity >= VJ_RING_MIN_FRAMES &&
      this.budget.reserve(remainingCapacity * layerBytes)
    ) {
      return remainingCapacity;
    }
    this.budget.countRefusal();
    return 0;
  }

  private allocate(): void {
    const { gl } = this.context;
    this.texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D_ARRAY, this.texture);
    gl.texStorage3D(
      gl.TEXTURE_2D_ARRAY,
      1,
      gl.RGBA8,
      this.width,
      this.height,
      this.layerCapacity,
    );
    gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.bindTexture(gl.TEXTURE_2D_ARRAY, null);
    this.readFramebuffer = gl.createFramebuffer();
    this.drawFramebuffer = gl.createFramebuffer();
  }

  /**
   * Copies the source texture (sized as the constructor said) into the next
   * layer. `presentedAtMs` is the frame's stamp on the source's ring timeline;
   * `mediaTimeMs` is where the video was, so a turn forward can seek there.
   */
  record(
    sourceTexture: WebGLTexture,
    presentedAtMs: number,
    mediaTimeMs: number = presentedAtMs,
  ): void {
    if (this.isDisposed || this.texture === null) return;
    const { gl } = this.context;
    const layer = this.nextLayer;
    gl.bindFramebuffer(gl.READ_FRAMEBUFFER, this.readFramebuffer);
    gl.framebufferTexture2D(
      gl.READ_FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      sourceTexture,
      0,
    );
    gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, this.drawFramebuffer);
    gl.framebufferTextureLayer(
      gl.DRAW_FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      this.texture,
      0,
      layer,
    );
    gl.blitFramebuffer(
      0,
      0,
      this.sourceWidth,
      this.sourceHeight,
      0,
      0,
      this.width,
      this.height,
      gl.COLOR_BUFFER_BIT,
      gl.LINEAR,
    );
    gl.bindFramebuffer(gl.READ_FRAMEBUFFER, null);
    gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, null);
    this.stamps[layer] = presentedAtMs;
    this.mediaTimes[layer] = mediaTimeMs;
    this.nextLayer = (layer + 1) % this.layerCapacity;
    this.recordedLength = Math.min(this.recordedLength + 1, this.layerCapacity);
  }

  /**
   * Copies the layer `positionFromNewest` frames back into a TEXTURE_2D of
   * `targetWidth` x `targetHeight` (the mirror of `record`). A source leaving
   * the ring calls it so its own texture shows the frame the ring was
   * showing until the frame it seeks to arrives. Does nothing once disposed
   * or while the ring holds no frame.
   */
  copyLayerInto(
    positionFromNewest: number,
    targetTexture: WebGLTexture,
    targetWidth: number,
    targetHeight: number,
  ): void {
    if (this.isDisposed || this.texture === null) return;
    if (this.recordedLength === 0) return;
    const { gl } = this.context;
    gl.bindFramebuffer(gl.READ_FRAMEBUFFER, this.readFramebuffer);
    gl.framebufferTextureLayer(
      gl.READ_FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      this.texture,
      0,
      this.layerAt(positionFromNewest),
    );
    gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, this.drawFramebuffer);
    gl.framebufferTexture2D(
      gl.DRAW_FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      targetTexture,
      0,
    );
    gl.blitFramebuffer(
      0,
      0,
      this.width,
      this.height,
      0,
      0,
      targetWidth,
      targetHeight,
      gl.COLOR_BUFFER_BIT,
      gl.LINEAR,
    );
    gl.bindFramebuffer(gl.READ_FRAMEBUFFER, null);
    gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, null);
  }

  /** The array layer `positionFromNewest` frames back from the newest (0 is the newest). */
  layerAt(positionFromNewest: number): number {
    if (this.recordedLength === 0) return 0;
    const framesBack = Math.min(
      this.recordedLength - 1,
      Math.max(0, Math.floor(positionFromNewest)),
    );
    const capacity = this.layerCapacity;
    return (this.nextLayer - 1 - framesBack + 2 * capacity) % capacity;
  }

  /** Stamp distance between the oldest and the newest recorded frame. */
  durationMs(): number {
    if (this.recordedLength < 2) return 0;
    return this.newestStampMs() - this.oldestStampMs();
  }

  newestStampMs(): number {
    return this.recordedLength === 0 ? 0 : (this.stamps[this.layerAt(0)] ?? 0);
  }

  oldestStampMs(): number {
    return this.recordedLength === 0
      ? 0
      : (this.stamps[this.layerAt(this.recordedLength - 1)] ?? 0);
  }

  /** Media time (ms) of the frame `positionFromNewest` frames back. */
  mediaTimeMsAt(positionFromNewest: number): number {
    return this.recordedLength === 0
      ? 0
      : (this.mediaTimes[this.layerAt(positionFromNewest)] ?? 0);
  }

  /** How far back from the newest the frame showing at `stampMs` sits (the newest frame at or before it). */
  positionFromNewestAt(stampMs: number): number {
    const lastPosition = this.recordedLength - 1;
    for (let position = 0; position < lastPosition; position += 1) {
      const stamp = this.stamps[this.layerAt(position)] ?? 0;
      if (stamp <= stampMs) return position;
    }
    return Math.max(0, lastPosition);
  }

  /** Forgets every recorded frame; the layers stay allocated. */
  clear(): void {
    this.recordedLength = 0;
    this.nextLayer = 0;
  }

  byteSize(): number {
    return this.isDisposed ? 0 : this.layerCapacity * this.layerBytes;
  }

  /** Frees the texture and the framebuffers and hands the bytes back to the budget. */
  dispose(): void {
    if (this.isDisposed) return;
    this.isDisposed = true;
    const { gl } = this.context;
    if (this.texture !== null) gl.deleteTexture(this.texture);
    if (this.readFramebuffer !== null)
      gl.deleteFramebuffer(this.readFramebuffer);
    if (this.drawFramebuffer !== null)
      gl.deleteFramebuffer(this.drawFramebuffer);
    this.texture = null;
    this.readFramebuffer = null;
    this.drawFramebuffer = null;
    this.budget.release(this.layerCapacity * this.layerBytes);
    this.recordedLength = 0;
  }
}
