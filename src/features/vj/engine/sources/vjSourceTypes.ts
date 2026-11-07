/**
 * Engine sources (engine plan, Task E15): what the compositor holds for each
 * layer (live, outgoing, mix). A source updates once per animation frame,
 * uploads only frames it has not uploaded yet, and answers its layer draw
 * when the pass runner binds it.
 *
 * This module also holds the clip texture both clip sources (video and GIF)
 * share: the source texture, the uploaded size, the `source.clip` draw and
 * the 64 px backdrop a `fit` clip repaints every 500 ms.
 */
import type { VjPreloadFailure } from "../../../../shared/contracts/vj";
import { shouldPixelateVjClip } from "../../live/vjEffectsStyle";
import type {
  VjRenderableClip,
  VjRenderableSource,
} from "../../screen/vjLayerMachine";
import type { VjGlContext } from "../gl/vjGlContext";
import {
  bindVjProgram,
  setVjUniforms,
  type VjGlProgram,
  type VjUniformValue,
} from "../gl/vjGlProgram";
import type { VjTargetPool } from "../gl/vjGlTargets";
import { createVjSourceTexture, uploadVjFrame } from "../gl/vjGlTexture";
import type { VjProgramKey } from "../shaders/vjProgramKeys";
import type { VjLayerDraw } from "../vjPassGraph";
import type { VjPalette } from "../vjPalette";
import type { VjPlayheadEffects } from "./vjPlayheadClock";
import type { VjRingBudget } from "./vjReverseRing";

export interface VjSourceFrameInput {
  /** performance.now() time of this animation frame. */
  nowMs: number;
  deltaMs: number;
  playhead: VjPlayheadEffects;
  beats: number;
  beatPeriodMs: number;
  /** False while blackout or curtain is fully up: upload nothing. */
  isVisible: boolean;
}

export interface VjEngineSource {
  /** `vjEngineSourceKey(source)`: `clipId|sourceUrl`. */
  readonly key: string;
  readonly kind: "video" | "gif" | "generator";
  readonly isReady: boolean;
  update(frame: VjSourceFrameInput): void;
  /** Binds the source's textures from `firstUnit` on and answers its draw (the sampler uniforms name those units). */
  bindDraw(firstUnit: number, palette: VjPalette): VjLayerDraw;
  holdsSourceUrl(sourceUrl: string): boolean;
  /** Keeps playing when the source moves between slots (mix to live on swap). */
  readonly playheadMs: number;
  byteSize(): number;
  /** After a context restore: rebuilds textures (and drops the frame ring); the next update re-uploads. */
  restore(): void;
  dispose(): void;
}

export interface VjSourceEvents {
  onFirstFrame(key: string): void;
  onFailed(key: string, failure: VjPreloadFailure): void;
}

/** The program lookup and triangle a fit clip paints its backdrop with (the compositor's own). */
export interface VjBackdropPainter {
  programs: { get(key: VjProgramKey): VjGlProgram | null };
  triangle: { draw(): void };
}

export interface VjEngineSourceDeps {
  context: VjGlContext;
  targets: VjTargetPool;
  mediaHost: HTMLElement;
  events: VjSourceEvents;
  ringBudget: VjRingBudget;
  /** Without it a `fit` clip shows black around itself. */
  backdrop?: VjBackdropPainter;
  /** Decoded GIF frames across every source (VJ_GIF_SHARED_BUDGET_BYTES); without it each GIF keeps only its own cap. */
  gifBudget?: VjRingBudget;
}

/** The key the compositor maps slots by: `clipId|sourceUrl` (a generator's URL is empty). */
export function vjEngineSourceKey(source: VjRenderableSource): string {
  return `${source.clipId}|${source.sourceUrl}`;
}

export const VJ_BACKDROP_WIDTH_PX = 64;
/** The v1 cadence of the fit backdrop. */
export const VJ_BACKDROP_REPAINT_MS = 500;
export const VJ_BACKDROP_DIM = 0.45;

const BYTES_PER_PIXEL = 4;
const FIT_MODE_FILL = 0;
const FIT_MODE_FIT = 1;

/** The backdrop target keeps the canvas's aspect at VJ_BACKDROP_WIDTH_PX wide. */
function vjBackdropHeightOf(canvas: HTMLCanvasElement): number {
  const ratio = Math.max(1, canvas.height) / Math.max(1, canvas.width);
  return Math.max(1, Math.round(VJ_BACKDROP_WIDTH_PX * ratio));
}

/**
 * One clip's source texture, its uploaded size and its layer draws. The draw
 * objects and their uniform records are built once and updated in place, so
 * binding allocates nothing per frame.
 */
export class VjClipTexture {
  private readonly clip: VjRenderableClip;
  private readonly deps: VjEngineSourceDeps;
  private readonly backdropName: string;
  private texture: WebGLTexture;
  private uploadedWidth = 0;
  private uploadedHeight = 0;
  private hasUploaded = false;
  private backdropPaintedAtMs = Number.NEGATIVE_INFINITY;
  private hasPaintedBackdrop = false;
  private readonly sourceSize = new Float32Array(2);
  private readonly backdropResolution = new Float32Array(2);
  private readonly viewport = { width: 0, height: 0 };
  private readonly clipUniforms: Record<string, VjUniformValue>;
  private readonly ringUniforms: Record<string, VjUniformValue>;
  private readonly backdropUniforms: Record<string, VjUniformValue>;
  private readonly clipDraw: VjLayerDraw;
  private readonly ringDraw: VjLayerDraw;

  constructor(clip: VjRenderableClip, deps: VjEngineSourceDeps, key: string) {
    this.clip = clip;
    this.deps = deps;
    this.backdropName = `backdrop:${key}`;
    this.texture = createVjSourceTexture(deps.context.gl);
    const fitMode = clip.fitMode === "fit" ? FIT_MODE_FIT : FIT_MODE_FILL;
    const fitUniforms = {
      uSourceSize: this.sourceSize,
      uFitMode: fitMode,
      uHasBackdrop: 0,
      uIsPixelated: 0,
    };
    this.clipUniforms = { uSource: 0, uBackdrop: 1, ...fitUniforms };
    this.ringUniforms = {
      uRing: 0,
      uBackdrop: 1,
      uRingLayer: 0,
      ...fitUniforms,
    };
    this.backdropUniforms = {
      uSource: 0,
      uDim: VJ_BACKDROP_DIM,
      uResolution: this.backdropResolution,
    };
    this.clipDraw = {
      programKey: "source.clip",
      uniforms: this.clipUniforms,
      hasBackdrop: false,
    };
    this.ringDraw = {
      programKey: "source.ring",
      uniforms: this.ringUniforms,
      hasBackdrop: false,
    };
  }

  get sourceTexture(): WebGLTexture {
    return this.texture;
  }

  get hasFrame(): boolean {
    return this.hasUploaded;
  }

  get width(): number {
    return this.uploadedWidth;
  }

  get height(): number {
    return this.uploadedHeight;
  }

  /** Uploads one frame; false when it had no pixels yet or the upload threw. */
  upload(frame: TexImageSource): boolean {
    const size = uploadVjFrame(this.deps.context.gl, this.texture, frame);
    if (size === null) return false;
    this.uploadedWidth = size.width;
    this.uploadedHeight = size.height;
    this.sourceSize[0] = size.width;
    this.sourceSize[1] = size.height;
    this.hasUploaded = true;
    return true;
  }

  /** Repaints the fit backdrop from the source texture when 500 ms passed since the last paint. */
  paintBackdropIfDue(nowMs: number): void {
    const painter = this.deps.backdrop;
    if (this.clip.fitMode !== "fit" || !painter || !this.hasUploaded) return;
    if (nowMs - this.backdropPaintedAtMs < VJ_BACKDROP_REPAINT_MS) return;
    const program = painter.programs.get("source.backdrop");
    if (program === null || program.status !== "linked") return;
    const { gl } = this.deps.context;
    const target = this.deps.targets.acquire(
      this.backdropName,
      VJ_BACKDROP_WIDTH_PX,
      vjBackdropHeightOf(this.deps.context.canvas),
    );
    gl.bindFramebuffer(gl.FRAMEBUFFER, target.framebuffer);
    gl.viewport(0, 0, target.width, target.height);
    bindVjProgram(this.deps.context, program);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    this.backdropResolution[0] = target.width;
    this.backdropResolution[1] = target.height;
    setVjUniforms(this.deps.context, program, this.backdropUniforms);
    painter.triangle.draw();
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    this.backdropPaintedAtMs = nowMs;
    this.hasPaintedBackdrop = true;
  }

  /** Binds the clip texture (or a ring layer) and the backdrop, and answers the matching draw. */
  bindDraw(
    firstUnit: number,
    ring: { texture: WebGLTexture; layer: number } | null,
  ): VjLayerDraw {
    const { gl } = this.deps.context;
    const draw = ring === null ? this.clipDraw : this.ringDraw;
    const uniforms = ring === null ? this.clipUniforms : this.ringUniforms;
    gl.activeTexture(gl.TEXTURE0 + firstUnit);
    if (ring === null) {
      gl.bindTexture(gl.TEXTURE_2D, this.texture);
      uniforms.uSource = firstUnit;
    } else {
      gl.bindTexture(gl.TEXTURE_2D_ARRAY, ring.texture);
      uniforms.uRing = firstUnit;
      uniforms.uRingLayer = ring.layer;
    }
    const backdropTexture = this.boundBackdropTexture();
    gl.activeTexture(gl.TEXTURE0 + firstUnit + 1);
    gl.bindTexture(gl.TEXTURE_2D, backdropTexture ?? this.texture);
    uniforms.uBackdrop = firstUnit + 1;
    uniforms.uHasBackdrop = backdropTexture === null ? 0 : 1;
    draw.hasBackdrop = backdropTexture !== null;
    const canvas = this.deps.context.canvas;
    this.viewport.width = canvas.width;
    this.viewport.height = canvas.height;
    uniforms.uIsPixelated = shouldPixelateVjClip(this.clip, this.viewport)
      ? 1
      : 0;
    return draw;
  }

  /** The painted backdrop target, kept alive in the pool while the clip draws. */
  private boundBackdropTexture(): WebGLTexture | null {
    if (!this.hasPaintedBackdrop || this.clip.fitMode !== "fit") return null;
    return this.deps.targets.acquire(
      this.backdropName,
      VJ_BACKDROP_WIDTH_PX,
      vjBackdropHeightOf(this.deps.context.canvas),
    ).texture;
  }

  byteSize(): number {
    return this.uploadedWidth * this.uploadedHeight * BYTES_PER_PIXEL;
  }

  /** A restored context lost every texture: make a fresh one; the next update uploads again. */
  restore(): void {
    this.texture = createVjSourceTexture(this.deps.context.gl);
    this.hasUploaded = false;
    this.hasPaintedBackdrop = false;
    this.backdropPaintedAtMs = Number.NEGATIVE_INFINITY;
  }

  /** The backdrop target goes back to the pool, which frees it once it sits idle. */
  dispose(): void {
    this.deps.context.gl.deleteTexture(this.texture);
    this.hasUploaded = false;
    this.hasPaintedBackdrop = false;
  }
}
