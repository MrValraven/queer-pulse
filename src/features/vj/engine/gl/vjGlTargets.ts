/**
 * RGBA8 render targets (texture plus framebuffer, LINEAR, CLAMP_TO_EDGE) and a
 * pool that keeps one target per name, reallocates it when its size changes
 * and frees targets nobody acquired for a while.
 */

export interface VjRenderTarget {
  texture: WebGLTexture;
  framebuffer: WebGLFramebuffer;
  width: number;
  height: number;
}

const VJ_BYTES_PER_PIXEL = 4;

function vjTargetSide(size: number): number {
  return Math.max(1, Math.round(size));
}

export function createVjRenderTarget(
  gl: WebGL2RenderingContext,
  width: number,
  height: number,
): VjRenderTarget {
  const targetWidth = vjTargetSide(width);
  const targetHeight = vjTargetSide(height);
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA8,
    targetWidth,
    targetHeight,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    null,
  );
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  const framebuffer = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
  gl.framebufferTexture2D(
    gl.FRAMEBUFFER,
    gl.COLOR_ATTACHMENT0,
    gl.TEXTURE_2D,
    texture,
    0,
  );
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.bindTexture(gl.TEXTURE_2D, null);
  return { texture, framebuffer, width: targetWidth, height: targetHeight };
}

export function deleteVjRenderTarget(
  gl: WebGL2RenderingContext,
  target: VjRenderTarget,
): void {
  gl.deleteFramebuffer(target.framebuffer);
  gl.deleteTexture(target.texture);
}

interface VjPooledTarget {
  target: VjRenderTarget;
  lastUsedMs: number;
}

export class VjTargetPool {
  private readonly gl: WebGL2RenderingContext;
  private readonly now: () => number;
  private readonly entries = new Map<string, VjPooledTarget>();

  /** `now` defaults to `performance.now()`; tests pass their own clock. */
  constructor(
    gl: WebGL2RenderingContext,
    now: () => number = () => performance.now(),
  ) {
    this.gl = gl;
    this.now = now;
  }

  /** The named target at this size, reallocated only when the size changed. */
  acquire(name: string, width: number, height: number): VjRenderTarget {
    const targetWidth = vjTargetSide(width);
    const targetHeight = vjTargetSide(height);
    const entry = this.entries.get(name);
    if (entry) {
      entry.lastUsedMs = this.now();
      const { target } = entry;
      if (target.width === targetWidth && target.height === targetHeight) {
        return target;
      }
      deleteVjRenderTarget(this.gl, target);
      entry.target = createVjRenderTarget(this.gl, targetWidth, targetHeight);
      return entry.target;
    }
    const target = createVjRenderTarget(this.gl, targetWidth, targetHeight);
    this.entries.set(name, { target, lastUsedMs: this.now() });
    return target;
  }

  /** Frees every target last acquired more than `idleMs` before `nowMs`. */
  releaseIdle(nowMs: number, idleMs: number): void {
    for (const [name, entry] of this.entries) {
      if (nowMs - entry.lastUsedMs <= idleMs) continue;
      deleteVjRenderTarget(this.gl, entry.target);
      this.entries.delete(name);
    }
  }

  byteSize(): number {
    let bytes = 0;
    for (const { target } of this.entries.values()) {
      bytes += target.width * target.height * VJ_BYTES_PER_PIXEL;
    }
    return bytes;
  }

  disposeAll(): void {
    for (const { target } of this.entries.values()) {
      deleteVjRenderTarget(this.gl, target);
    }
    this.entries.clear();
  }
}
