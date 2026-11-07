/**
 * A GIF layer source. Where ImageDecoder exists, the whole GIF decodes up
 * front into ImageBitmaps and plays on the engine's playhead clock over its
 * own timeline, so speed, freeze, reverse, ping-pong and stutter all work; a
 * frame uploads only when the frame index changes.
 *
 * Without ImageDecoder, when the decoded frames pass the byte budget, or when
 * ImageDecoder refuses the file, the GIF plays as an `<img>` in the media
 * host the browser animates, uploaded every animation frame (playhead effects
 * stay off for that GIF). Only that `<img>` failing to load or decode reports
 * `decode_failed`, so a GIF the browser plays always reaches the screen.
 *
 * The shared GIF budget is reserved before decoding starts (the most this GIF
 * may decode into), so GIFs loading together never decode past it; once the
 * frames are in, the part they did not use goes back.
 */
import type { VjRenderableClip } from "../../screen/vjLayerMachine";
import type { VjLayerDraw } from "../vjPassGraph";
import {
  decodeVjGif,
  isVjImageDecoderAvailable,
  VJ_GIF_BUDGET_BYTES,
  type VjGifDecodeResult,
} from "./vjGifDecode";
import {
  createVjGifTimeline,
  vjGifFrameIndexAt,
  type VjGifTimeline,
} from "./vjGifTimeline";
import { advanceVjPlayhead, initialVjPlayhead } from "./vjPlayheadClock";
import {
  VjClipTexture,
  vjEngineSourceKey,
  type VjEngineSource,
  type VjEngineSourceDeps,
  type VjSourceFrameInput,
} from "./vjSourceTypes";

const BYTES_PER_PIXEL = 4;

type VjGifMode = "decoding" | "frames" | "image" | "failed";

export interface VjGifSourceOptions {
  /** Tests pass a fake image; the page lets the source create a real one. */
  createImage?: () => HTMLImageElement;
}

function decodedVjGifBytes(frames: readonly ImageBitmap[]): number {
  let bytes = 0;
  for (const frame of frames)
    bytes += frame.width * frame.height * BYTES_PER_PIXEL;
  return bytes;
}

function prepareVjGifImage(image: HTMLImageElement): void {
  image.alt = "";
  image.draggable = false;
  image.setAttribute("aria-hidden", "true");
  image.style.position = "absolute";
  image.style.width = "1px";
  image.style.height = "1px";
  image.style.opacity = "0.01";
  image.style.pointerEvents = "none";
}

export class VjGifSource implements VjEngineSource {
  readonly key: string;
  readonly kind = "gif" as const;
  private readonly clip: VjRenderableClip;
  private readonly deps: VjEngineSourceDeps;
  private readonly clipTexture: VjClipTexture;
  private readonly abortController = new AbortController();
  private readonly createImage: () => HTMLImageElement;
  private mode: VjGifMode = "decoding";
  private frames: ImageBitmap[] = [];
  private decodedBytes = 0;
  private reservedSharedBytes = 0;
  private timeline: VjGifTimeline | null = null;
  private readonly playWindow = { startMs: 0, endMs: 0 };
  private playhead = initialVjPlayhead();
  private uploadedFrameIndex = -1;
  private image: HTMLImageElement | null = null;
  private isReadyFlag = false;
  private isDisposed = false;

  constructor(
    clip: VjRenderableClip,
    deps: VjEngineSourceDeps,
    options: VjGifSourceOptions = {},
  ) {
    this.clip = clip;
    this.deps = deps;
    this.key = vjEngineSourceKey(clip);
    this.clipTexture = new VjClipTexture(clip, deps, this.key);
    this.createImage =
      options.createImage ?? (() => document.createElement("img"));
    if (isVjImageDecoderAvailable()) {
      void this.decodeFrames();
    } else {
      this.startImageFallback();
    }
  }

  get isReady(): boolean {
    return this.isReadyFlag;
  }

  /** True while the GIF plays as an `<img>` (playhead effects off). */
  get isImageFallback(): boolean {
    return this.mode === "image";
  }

  get playheadMs(): number {
    return this.mode === "frames" ? this.playhead.positionMs : 0;
  }

  holdsSourceUrl(sourceUrl: string): boolean {
    return sourceUrl === this.clip.sourceUrl;
  }

  byteSize(): number {
    return this.clipTexture.byteSize() + this.decodedBytes;
  }

  update(frame: VjSourceFrameInput): void {
    if (this.isDisposed) return;
    if (this.mode === "image") {
      if (!frame.isVisible || !this.isReadyFlag || this.image === null) return;
      this.clipTexture.upload(this.image);
      this.clipTexture.paintBackdropIfDue(frame.nowMs);
      return;
    }
    const timeline = this.timeline;
    if (this.mode !== "frames" || timeline === null) return;
    this.playhead = advanceVjPlayhead(
      this.playhead,
      this.playWindow,
      frame.playhead,
      frame.deltaMs,
      frame.beats,
      frame.beatPeriodMs,
    );
    if (!frame.isVisible) return;
    this.uploadFrameAt(vjGifFrameIndexAt(timeline, this.playhead.positionMs));
    this.clipTexture.paintBackdropIfDue(frame.nowMs);
  }

  bindDraw(firstUnit: number): VjLayerDraw {
    return this.clipTexture.bindDraw(firstUnit, null);
  }

  restore(): void {
    if (this.isDisposed) return;
    this.clipTexture.restore();
    this.uploadedFrameIndex = -1;
  }

  dispose(): void {
    if (this.isDisposed) return;
    this.isDisposed = true;
    this.abortController.abort();
    this.releaseFrames();
    const image = this.image;
    if (image !== null) {
      image.removeEventListener("load", this.handleImageLoad);
      image.removeEventListener("error", this.handleImageError);
      image.removeAttribute("src");
      image.remove();
      this.image = null;
    }
    this.clipTexture.dispose();
  }

  private uploadFrameAt(frameIndex: number): void {
    if (frameIndex === this.uploadedFrameIndex) return;
    const bitmap = this.frames[frameIndex];
    if (bitmap !== undefined && this.clipTexture.upload(bitmap)) {
      this.uploadedFrameIndex = frameIndex;
    }
  }

  private releaseFrames(): void {
    for (const frame of this.frames) frame.close();
    this.frames = [];
    this.decodedBytes = 0;
    this.deps.gifBudget?.release(this.reservedSharedBytes);
    this.reservedSharedBytes = 0;
  }

  private markReady(): void {
    if (this.isDisposed || this.isReadyFlag) return;
    this.isReadyFlag = true;
    this.deps.events.onFirstFrame(this.key);
  }

  private fail(): void {
    if (this.isDisposed || this.mode === "failed") return;
    this.mode = "failed";
    this.deps.events.onFailed(this.key, "decode_failed");
  }

  private async decodeFrames(): Promise<void> {
    const result = await decodeVjGif(
      this.clip.sourceUrl,
      this.abortController.signal,
      { budgetBytes: this.reserveDecodeBytes() },
    );
    this.adoptDecoded(result);
  }

  /**
   * Reserves the most this GIF may decode into from the shared budget, before
   * decoding: VJ_GIF_BUDGET_BYTES, or what the shared budget has left. Answers
   * the bytes the decode may use (0 when the shared budget is empty, which
   * the decode answers as `tooLarge`).
   */
  private reserveDecodeBytes(): number {
    const sharedBudget = this.deps.gifBudget;
    if (sharedBudget === undefined) return VJ_GIF_BUDGET_BYTES;
    const decodeBytes = Math.min(
      VJ_GIF_BUDGET_BYTES,
      sharedBudget.availableBytes,
    );
    if (decodeBytes <= 0 || !sharedBudget.reserve(decodeBytes)) return 0;
    this.reservedSharedBytes = decodeBytes;
    return decodeBytes;
  }

  /** Gives back the reserved bytes the frames do not hold. */
  private releaseUnusedReservation(keptBytes: number): void {
    const unusedBytes = this.reservedSharedBytes - keptBytes;
    if (unusedBytes > 0) this.deps.gifBudget?.release(unusedBytes);
    this.reservedSharedBytes = Math.min(this.reservedSharedBytes, keptBytes);
  }

  private adoptDecoded(result: VjGifDecodeResult): void {
    // A dispose during the decode already gave the reservation back.
    if (this.isDisposed) {
      if (result.ok) for (const frame of result.frames) frame.close();
      return;
    }
    if (!result.ok) {
      this.releaseUnusedReservation(0);
      // An abort comes only from dispose, which the check above already caught.
      if (result.reason !== "aborted") this.startImageFallback();
      return;
    }
    const bytes = decodedVjGifBytes(result.frames);
    const hasSharedBudget = this.deps.gifBudget !== undefined;
    // The decode keeps under the bytes it was given, so this guards only a size mismatch.
    if (hasSharedBudget && bytes > this.reservedSharedBytes) {
      this.releaseUnusedReservation(0);
      for (const frame of result.frames) frame.close();
      this.startImageFallback();
      return;
    }
    this.releaseUnusedReservation(bytes);
    this.frames = result.frames;
    this.decodedBytes = bytes;
    this.timeline = createVjGifTimeline(result.durationsMs);
    this.playWindow.endMs = this.timeline.totalMs;
    this.mode = "frames";
    this.uploadFrameAt(0);
    this.markReady();
  }

  private startImageFallback(): void {
    this.mode = "image";
    const image = this.createImage();
    prepareVjGifImage(image);
    image.addEventListener("load", this.handleImageLoad);
    image.addEventListener("error", this.handleImageError);
    image.setAttribute("src", this.clip.sourceUrl);
    this.deps.mediaHost.append(image);
    this.image = image;
    const candidate = image as Partial<Pick<HTMLImageElement, "decode">>;
    if (typeof candidate.decode !== "function") return;
    image.decode().then(
      () => {
        if (this.image === image) this.markReady();
      },
      () => {
        if (this.image === image) this.fail();
      },
    );
  }

  /** First frame on `load` only where `decode()` is missing (v1). */
  private readonly handleImageLoad = (): void => {
    const candidate = this.image as Partial<
      Pick<HTMLImageElement, "decode">
    > | null;
    if (candidate !== null && typeof candidate.decode !== "function") {
      this.markReady();
    }
  };

  private readonly handleImageError = (): void => {
    this.fail();
  };
}
