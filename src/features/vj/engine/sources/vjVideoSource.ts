/**
 * A video layer source. The `<video>` lives in the compositor's media host,
 * placed just outside the host's 1 px box (VJ_VIDEO_OFFSCREEN_LEFT), and
 * reaches the GPU only when requestVideoFrameCallback presented a new frame;
 * without callbacks for VJ_FRAME_CALLBACK_GRACE_MS (or without the API) an
 * upload follows `currentTime` moving instead.
 *
 * Loop window: each presented frame checks `vjVideoLoopAction` and seeks back
 * to loop in at loop out. Time effects use the reverse frame ring:
 * - forward play records each uploaded frame into the ring while one is held;
 * - reverse and stutter, once the ring is full, pause the video and replay the
 *   ring on the playhead clock (reverse wraps, stutter repeats beat slices);
 * - ping-pong plays forward until loop out (a full ring when the clip has no
 *   ping-pong loop window), then plays the ring backward and, at its oldest
 *   frame, seeks once and plays forward again.
 * Leaving the ring seeks once to the frame showing. Until the seeked frame
 * arrives, the clip texture holds a copy of that ring frame, and the video is
 * never uploaded while it seeks: the element still shows its pre-seek frame
 * (the turn point of a bounce), which would flash for one frame. A refused
 * ring budget plays forward. Freeze pauses and keeps the last texture.
 */
import type { VjRenderableClip } from "../../screen/vjLayerMachine";
import { VJ_FRAME_CALLBACK_GRACE_MS } from "../../screen/VjClipLayer";
import type { VjLayerDraw } from "../vjPassGraph";
import {
  advanceVjPlayhead,
  initialVjPlayhead,
  needsVjFrameRing,
  type VjPlayhead,
  type VjPlayheadEffects,
  type VjPlayheadMode,
} from "./vjPlayheadClock";
import { VjReverseRing } from "./vjReverseRing";
import {
  VjClipTexture,
  vjEngineSourceKey,
  type VjEngineSource,
  type VjEngineSourceDeps,
  type VjSourceFrameInput,
} from "./vjSourceTypes";
import {
  hasVjDecodedFrame,
  hasVjVideoFrameCallback,
  VjVideoFirstFrame,
} from "./vjVideoFirstFrame";
import {
  vjLoopWindowOf,
  vjVideoLoopAction,
  type VjLoopWindow,
} from "./vjVideoLoop";

/** The ring step for a frame whose media time jumped (a loop seek): about one frame at 30 fps. */
const VJ_RING_NOMINAL_FRAME_MS = 1000 / 30;
/** A media step longer than this reads as a jump. */
const VJ_RING_MAX_STEP_MS = 1000;

/**
 * Where a video sits inside the 1 px media host: just left of it, so the
 * host's overflow clips it and it draws nowhere on the page. Chromium lowers
 * the whole page's frame rate to the video rate (about 30 fps) while two or
 * more videos draw on screen, which dropped every video-to-video fade and a
 * video mix to 30 fps. A video drawn nowhere keeps decoding and presenting
 * frames to requestVideoFrameCallback, and the page keeps its full rate.
 */
const VJ_VIDEO_OFFSCREEN_LEFT = "-2px";

type VjVideoReplay = "none" | "replaying" | "pingPongBackward";

export interface VjVideoSourceOptions {
  /** Tests pass a fake video; the page lets the source create a real one. */
  createVideo?: () => HTMLVideoElement;
}

function isVjRingMode(mode: VjPlayheadMode): boolean {
  return mode === "reverse" || mode === "pingPong" || mode === "stutter";
}

function prepareVjVideoElement(
  video: HTMLVideoElement,
  hasNativeLoop: boolean,
): void {
  video.muted = true;
  video.defaultMuted = true;
  video.playsInline = true;
  video.preload = "auto";
  video.disablePictureInPicture = true;
  video.loop = hasNativeLoop;
  video.setAttribute("aria-hidden", "true");
  video.style.position = "absolute";
  video.style.top = "0";
  video.style.left = VJ_VIDEO_OFFSCREEN_LEFT;
  video.style.width = "1px";
  video.style.height = "1px";
  video.style.opacity = "0.01";
  video.style.pointerEvents = "none";
}

export class VjVideoSource implements VjEngineSource {
  readonly key: string;
  readonly kind = "video" as const;
  private readonly clip: VjRenderableClip;
  private readonly deps: VjEngineSourceDeps;
  private readonly video: HTMLVideoElement;
  private readonly firstFrame: VjVideoFirstFrame;
  private readonly clipTexture: VjClipTexture;
  private readonly loopWindow: VjLoopWindow | null;
  private ring: VjReverseRing | null = null;
  private isRingRefused = false;
  private isReadyFlag = false;
  private hasFailed = false;
  private isDisposed = false;
  private frameCallbackId: number | undefined;
  private hasPresentedFrame = false;
  private presentedMediaTimeSec = 0;
  private lastFrameCallbackAtMs: number | null = null;
  private lastUploadedTimeSec = Number.NaN;
  private ringStampMs = 0;
  private lastRecordedMediaTimeSec = Number.NaN;
  private replay: VjVideoReplay = "none";
  private replayPlayhead: VjPlayhead = initialVjPlayhead();
  private readonly replayWindow = { startMs: 0, endMs: 0 };
  private replayStampMs = 0;
  private shownPosition = 0;
  private isTurnPending = false;
  private currentMode: VjPlayheadMode = "forward";
  private appliedRate = Number.NaN;
  private isPausedByPlayhead = false;
  private readonly ringBinding = {
    texture: null as unknown as WebGLTexture,
    layer: 0,
  };

  constructor(
    clip: VjRenderableClip,
    deps: VjEngineSourceDeps,
    options: VjVideoSourceOptions = {},
  ) {
    this.clip = clip;
    this.deps = deps;
    this.key = vjEngineSourceKey(clip);
    this.loopWindow = vjLoopWindowOf(clip);
    this.clipTexture = new VjClipTexture(clip, deps, this.key);
    this.video = options.createVideo?.() ?? document.createElement("video");
    prepareVjVideoElement(this.video, this.loopWindow === null);
    this.firstFrame = new VjVideoFirstFrame(this.video, {
      onFirstFrame: () => this.reportFirstFrame(),
      onFailed: () => this.fail(),
    });
    this.firstFrame.start();
    this.video.addEventListener("loadedmetadata", this.handleLoadedMetadata);
    this.video.setAttribute("src", clip.sourceUrl);
    deps.mediaHost.append(this.video);
    this.requestVideoFrame();
  }

  get isReady(): boolean {
    return this.isReadyFlag;
  }

  get playheadMs(): number {
    if (this.replay !== "none" && this.ring !== null) {
      return this.ring.mediaTimeMsAt(this.shownPosition);
    }
    return this.video.currentTime * 1000;
  }

  holdsSourceUrl(sourceUrl: string): boolean {
    return sourceUrl === this.clip.sourceUrl;
  }

  byteSize(): number {
    return this.clipTexture.byteSize() + (this.ring?.byteSize() ?? 0);
  }

  update(frame: VjSourceFrameInput): void {
    if (this.isDisposed || this.hasFailed) return;
    const effects = frame.playhead;
    this.currentMode = effects.mode;
    this.applyRate(effects.rate);
    this.syncRing(effects);
    if (effects.mode === "frozen") {
      this.pauseForPlayhead();
      return;
    }
    if (this.replay !== "none") {
      if (this.ring !== null && isVjRingMode(effects.mode)) {
        this.advanceReplay(frame);
        return;
      }
      this.leaveReplay();
    }
    this.resumeFromPlayhead();
    if (this.isPrimedFor(effects.mode)) {
      this.enterReplay(effects.mode);
      return;
    }
    if (!frame.isVisible) return;
    this.uploadPresentedFrame(frame.nowMs);
    this.clipTexture.paintBackdropIfDue(frame.nowMs);
  }

  bindDraw(firstUnit: number): VjLayerDraw {
    const ringTexture = this.ring?.arrayTexture ?? null;
    if (this.replay === "none" || this.ring === null || ringTexture === null) {
      return this.clipTexture.bindDraw(firstUnit, null);
    }
    this.ringBinding.texture = ringTexture;
    this.ringBinding.layer = this.ring.layerAt(this.shownPosition);
    return this.clipTexture.bindDraw(firstUnit, this.ringBinding);
  }

  restore(): void {
    if (this.isDisposed) return;
    this.clipTexture.restore();
    this.releaseRing();
    this.lastUploadedTimeSec = Number.NaN;
    if (this.replay !== "none") {
      this.replay = "none";
      this.playVideo();
    }
  }

  /** Drops the source and reloads so the browser frees the decoder now (v1). */
  dispose(): void {
    if (this.isDisposed) return;
    this.isDisposed = true;
    this.firstFrame.release();
    this.cancelVideoFrame();
    this.video.removeEventListener("loadedmetadata", this.handleLoadedMetadata);
    this.video.pause();
    this.video.removeAttribute("src");
    this.video.load();
    this.video.remove();
    this.releaseRing();
    this.clipTexture.dispose();
  }

  private reportFirstFrame(): void {
    if (this.isDisposed || this.hasFailed || this.isReadyFlag) return;
    this.isReadyFlag = true;
    this.deps.events.onFirstFrame(this.key);
  }

  private fail(): void {
    if (this.isDisposed || this.hasFailed) return;
    this.hasFailed = true;
    this.deps.events.onFailed(this.key, "decode_failed");
  }

  private readonly handleLoadedMetadata = (): void => {
    const loopWindow = this.loopWindow;
    if (loopWindow !== null && loopWindow.inSec > 0) {
      this.seekTo(loopWindow.inSec);
    }
  };

  private requestVideoFrame(): void {
    if (this.isDisposed || !hasVjVideoFrameCallback(this.video)) return;
    this.frameCallbackId = this.video.requestVideoFrameCallback(
      this.handleVideoFrame,
    );
  }

  private cancelVideoFrame(): void {
    const candidate = this.video as Partial<
      Pick<HTMLVideoElement, "cancelVideoFrameCallback">
    >;
    if (
      this.frameCallbackId !== undefined &&
      typeof candidate.cancelVideoFrameCallback === "function"
    ) {
      candidate.cancelVideoFrameCallback(this.frameCallbackId);
    }
    this.frameCallbackId = undefined;
  }

  private readonly handleVideoFrame = (
    _presentedAtMs: DOMHighResTimeStamp,
    metadata: VideoFrameCallbackMetadata,
  ): void => {
    this.frameCallbackId = undefined;
    if (this.isDisposed) return;
    this.hasPresentedFrame = true;
    this.presentedMediaTimeSec = metadata.mediaTime;
    this.applyLoopAction(metadata.mediaTime);
    this.requestVideoFrame();
  };

  private applyLoopAction(mediaTimeSec: number): void {
    const loopWindow = this.loopWindow;
    if (loopWindow === null || this.replay !== "none" || this.video.seeking) {
      return;
    }
    const action = vjVideoLoopAction(loopWindow, mediaTimeSec);
    if (action.kind === "none") return;
    if (
      action.kind === "turnBackward" &&
      this.ring !== null &&
      this.currentMode === "pingPong"
    ) {
      this.isTurnPending = true;
      return;
    }
    this.seekTo(loopWindow.inSec);
  }

  private seekTo(mediaTimeSec: number): void {
    this.video.currentTime = mediaTimeSec;
  }

  private playVideo(): void {
    void this.video.play().catch(() => undefined);
  }

  private applyRate(rate: number): void {
    if (rate === this.appliedRate || !Number.isFinite(rate) || rate <= 0)
      return;
    this.appliedRate = rate;
    this.video.defaultPlaybackRate = rate;
    this.video.playbackRate = rate;
  }

  private pauseForPlayhead(): void {
    if (!this.video.paused) this.video.pause();
    this.isPausedByPlayhead = true;
  }

  private resumeFromPlayhead(): void {
    if (!this.isPausedByPlayhead) return;
    this.isPausedByPlayhead = false;
    if (this.firstFrame.hasStarted) this.playVideo();
  }

  /** The ring lives while a time effect needs it or the clip ping-pongs; a refused one is not asked again until then. */
  private syncRing(effects: VjPlayheadEffects): void {
    const wantsRing =
      needsVjFrameRing(effects) || this.clip.loopMode === "pingPong";
    if (!wantsRing) {
      if (this.replay === "none") this.releaseRing();
      return;
    }
    if (this.ring !== null || this.isRingRefused) return;
    if (!this.clipTexture.hasFrame) return;
    const ring = new VjReverseRing(
      this.deps.context,
      this.clipTexture.width,
      this.clipTexture.height,
      this.deps.ringBudget,
    );
    if (ring.isRefused) {
      ring.dispose();
      this.isRingRefused = true;
      return;
    }
    this.ring = ring;
    this.resetRingTimeline();
  }

  private releaseRing(): void {
    this.ring?.dispose();
    this.ring = null;
    this.isRingRefused = false;
    this.isTurnPending = false;
  }

  private resetRingTimeline(): void {
    this.ringStampMs = 0;
    this.lastRecordedMediaTimeSec = Number.NaN;
  }

  /**
   * Reverse and stutter wait for a full ring. Ping-pong over a ping-pong loop
   * window turns only at loop out: a span longer than the ring keeps
   * overwriting its oldest frame, so the bounce covers the last ring-length
   * and ends at loop out (plan decision 4). Without such a window it turns at
   * a full ring.
   */
  private isPrimedFor(mode: VjPlayheadMode): boolean {
    const ring = this.ring;
    if (ring === null || !isVjRingMode(mode)) return false;
    if (mode === "pingPong") {
      if (this.isTurnPending && ring.length < 2) {
        this.isTurnPending = false;
        if (this.loopWindow !== null) this.seekTo(this.loopWindow.inSec);
        return false;
      }
      const turnsAtLoopOut = this.loopWindow?.mode === "pingPong";
      return this.isTurnPending || (!turnsAtLoopOut && ring.isFull);
    }
    return ring.isFull;
  }

  private enterReplay(mode: VjPlayheadMode): void {
    const ring = this.ring;
    if (ring === null) return;
    this.video.pause();
    this.isTurnPending = false;
    if (mode === "pingPong") {
      this.replay = "pingPongBackward";
      this.replayStampMs = ring.newestStampMs();
    } else {
      this.replay = "replaying";
      const startMs =
        mode === "stutter" ? ring.oldestStampMs() : ring.newestStampMs();
      this.replayPlayhead = initialVjPlayhead(startMs);
      this.replayStampMs = startMs;
    }
    this.shownPosition = ring.positionFromNewestAt(this.replayStampMs);
  }

  private advanceReplay(frame: VjSourceFrameInput): void {
    const ring = this.ring;
    if (ring === null) return;
    const effects = frame.playhead;
    const stepMs =
      Number.isFinite(frame.deltaMs) && frame.deltaMs > 0
        ? frame.deltaMs * effects.rate
        : 0;
    if (effects.mode === "pingPong") {
      this.replay = "pingPongBackward";
      this.replayStampMs -= stepMs;
      if (this.replayStampMs <= ring.oldestStampMs()) {
        this.shownPosition = Math.max(0, ring.length - 1);
        this.leaveReplay();
        return;
      }
    } else {
      if (this.replay === "pingPongBackward") {
        this.replay = "replaying";
        this.replayPlayhead = initialVjPlayhead(this.replayStampMs);
      }
      this.replayWindow.startMs = ring.oldestStampMs();
      this.replayWindow.endMs = ring.newestStampMs();
      this.replayPlayhead = advanceVjPlayhead(
        this.replayPlayhead,
        this.replayWindow,
        effects,
        frame.deltaMs,
        frame.beats,
        frame.beatPeriodMs,
      );
      this.replayStampMs = this.replayPlayhead.positionMs;
    }
    this.shownPosition = ring.positionFromNewestAt(this.replayStampMs);
  }

  /**
   * Seeks once to the frame showing, forgets the ring and plays forward.
   * The clip texture still holds the last frame uploaded before the replay
   * (the far end of a bounce), so the ring frame showing is copied into it
   * first and stays on screen until the seeked frame uploads. The frame a
   * callback flagged before the replay is dropped, and the callback grace
   * restarts here: the paused video fired no callback during the replay, so
   * the old timestamp would switch straight to the `currentTime` fallback.
   */
  private leaveReplay(): void {
    const ring = this.ring;
    this.replay = "none";
    this.isPausedByPlayhead = false;
    if (ring !== null) {
      this.seekTo(ring.mediaTimeMsAt(this.shownPosition) / 1000);
      if (this.clipTexture.hasFrame) {
        ring.copyLayerInto(
          this.shownPosition,
          this.clipTexture.sourceTexture,
          this.clipTexture.width,
          this.clipTexture.height,
        );
      }
      ring.clear();
    }
    this.hasPresentedFrame = false;
    this.lastFrameCallbackAtMs = null;
    this.resetRingTimeline();
    this.playVideo();
  }

  /**
   * Uploads the frame a callback presented, or on the `currentTime` fallback
   * a moved `currentTime`. The fallback waits while the video seeks: the
   * element still shows the pre-seek frame, and uploading it would show (and
   * record into the ring) the wrong frame.
   */
  private uploadPresentedFrame(nowMs: number): void {
    if (!hasVjDecodedFrame(this.video)) return;
    if (this.lastFrameCallbackAtMs === null) this.lastFrameCallbackAtMs = nowMs;
    let mediaTimeSec: number;
    if (this.hasPresentedFrame) {
      this.hasPresentedFrame = false;
      this.lastFrameCallbackAtMs = nowMs;
      mediaTimeSec = this.presentedMediaTimeSec;
    } else if (!this.clipTexture.hasFrame) {
      mediaTimeSec = this.video.currentTime;
    } else if (this.isOnCurrentTimeFallback(nowMs)) {
      if (this.video.seeking) return;
      mediaTimeSec = this.video.currentTime;
      if (mediaTimeSec === this.lastUploadedTimeSec) return;
      this.applyLoopAction(mediaTimeSec);
    } else {
      return;
    }
    if (!this.clipTexture.upload(this.video)) return;
    this.lastUploadedTimeSec = mediaTimeSec;
    this.recordIntoRing(mediaTimeSec);
  }

  private isOnCurrentTimeFallback(nowMs: number): boolean {
    if (!hasVjVideoFrameCallback(this.video)) return true;
    const lastCallbackAtMs = this.lastFrameCallbackAtMs ?? nowMs;
    return nowMs - lastCallbackAtMs > VJ_FRAME_CALLBACK_GRACE_MS;
  }

  private recordIntoRing(mediaTimeSec: number): void {
    const ring = this.ring;
    if (ring === null || this.replay !== "none") return;
    const stepMs = (mediaTimeSec - this.lastRecordedMediaTimeSec) * 1000;
    this.ringStampMs +=
      stepMs > 0 && stepMs < VJ_RING_MAX_STEP_MS
        ? stepMs
        : VJ_RING_NOMINAL_FRAME_MS;
    this.lastRecordedMediaTimeSec = mediaTimeSec;
    ring.record(
      this.clipTexture.sourceTexture,
      this.ringStampMs,
      mediaTimeSec * 1000,
    );
  }
}
