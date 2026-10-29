import type { StudioLandingPreviewView as Preview } from "../api/studioLanding.adapters";
import {
  StudioLandingRequestError,
  fetchStudioLandingPreviewStream,
  type StudioLandingListenReason,
} from "../api/studioLanding.api";

export type StudioLandingPlayerStatus =
  "idle" | "loading" | "playing" | "paused";

export interface StudioLandingPlayerState {
  activeId: string | null;
  status: StudioLandingPlayerStatus;
  elapsedSeconds: number;
  /** Per preview, the reason its last attempt failed. */
  failures: Readonly<Record<string, StudioLandingListenReason>>;
}

type PlayerState = StudioLandingPlayerState;
type LoadedStream = { url: string; expiresAtMs: number };

export const IDLE_STATE: PlayerState = {
  activeId: null,
  status: "idle",
  elapsedSeconds: 0,
  failures: {},
};
const DEMO_TICK_SECONDS = 0.25;

const backToIdle = ({ failures }: PlayerState) => ({ ...IDLE_STATE, failures });

/** One page's audio element (`preload = "none"`, made on the first play), the
 *  stream links already fetched with their expiry, and a request counter, so
 *  a slow answer for an earlier pick never starts playing after a newer one. */
export class LandingPlayerSession {
  private state: PlayerState = IDLE_STATE;
  private readonly onChange: (state: PlayerState) => void;
  private readonly streams = new Map<string, LoadedStream>();
  private audio: HTMLAudioElement | null = null;
  private requestCount = 0;
  private abortController: AbortController | null = null;
  private clock: number | null = null;

  constructor(onChange: (state: PlayerState) => void) {
    this.onChange = onChange;
  }

  private commit(update: (previous: PlayerState) => PlayerState) {
    this.state = update(this.state);
    this.onChange(this.state);
  }

  private setStatus(status: StudioLandingPlayerStatus) {
    this.commit((previous) => ({ ...previous, status }));
  }

  private fail(previewId: string, reason: StudioLandingListenReason) {
    this.commit((previous) => ({
      ...(previous.activeId === previewId ? IDLE_STATE : previous),
      failures: { ...previous.failures, [previewId]: reason },
    }));
  }

  /** Drops the request in flight, stops the clock and pauses the audio. */
  private halt() {
    this.requestCount += 1;
    this.abortController?.abort();
    if (this.clock !== null) window.clearInterval(this.clock);
    this.clock = null;
    this.audio?.pause();
  }

  private audioElement(): HTMLAudioElement {
    if (this.audio) return this.audio;
    const audio = document.createElement("audio");
    audio.preload = "none";
    const isPlaying = () => this.state.status === "playing";
    audio.addEventListener("timeupdate", () => {
      if (!isPlaying()) return;
      const elapsedSeconds = audio.currentTime;
      this.commit((previous) => ({ ...previous, elapsedSeconds }));
    });
    audio.addEventListener("ended", () => this.commit(backToIdle));
    audio.addEventListener("error", () => {
      const { activeId } = this.state;
      if (activeId && audio.src) this.fail(activeId, "playback");
    });
    // A pause from outside the page (a headset, the OS media keys).
    audio.addEventListener("pause", () => {
      if (isPlaying()) this.setStatus("paused");
    });
    this.audio = audio;
    return audio;
  }

  /** Demo: a silent clock up to the track's length, with no request at all. */
  private startClock(preview: Preview) {
    this.setStatus("playing");
    this.clock = window.setInterval(() => {
      const elapsedSeconds = this.state.elapsedSeconds + DEMO_TICK_SECONDS;
      if (elapsedSeconds < preview.durationSeconds) {
        return this.commit((previous) => ({ ...previous, elapsedSeconds }));
      }
      this.halt();
      this.commit(backToIdle);
    }, DEMO_TICK_SECONDS * 1000);
  }

  private async playLive(preview: Preview, requestId: number) {
    const isStale = () => requestId !== this.requestCount;
    let stream = this.streams.get(preview.id);
    if (!stream || stream.expiresAtMs <= Date.now()) {
      this.abortController = new AbortController();
      try {
        const { signal } = this.abortController;
        const body = await fetchStudioLandingPreviewStream(preview.id, signal);
        stream = { url: body.url, expiresAtMs: Date.parse(body.expiresAt) };
      } catch (error) {
        if (isStale()) return;
        const isNamed = error instanceof StudioLandingRequestError;
        return this.fail(preview.id, isNamed ? error.reason : "server");
      }
      if (isStale()) return;
      if (!stream.url) return this.fail(preview.id, "playback");
      this.streams.set(preview.id, stream);
    }
    const audio = this.audioElement();
    if (audio.getAttribute("src") !== stream.url) {
      // A fresh link for a paused track picks up where it stopped.
      const resumeAt = this.state.elapsedSeconds;
      audio.src = stream.url;
      if (resumeAt > 0) audio.currentTime = resumeAt;
    }
    try {
      await audio.play();
    } catch (error) {
      const isInterrupted = (error as Error | null)?.name === "AbortError";
      if (!isStale() && !isInterrupted) this.fail(preview.id, "playback");
      return;
    }
    if (!isStale()) this.setStatus("playing");
  }

  /** Starts `preview` from `fromSeconds`; whatever played before stops. */
  start(preview: Preview, fromSeconds: number, isDemo: boolean) {
    this.halt();
    this.commit((previous) => ({
      activeId: preview.id,
      status: "loading",
      elapsedSeconds: fromSeconds,
      failures: Object.fromEntries(
        Object.entries(previous.failures).filter(([id]) => id !== preview.id),
      ),
    }));
    if (isDemo) this.startClock(preview);
    else void this.playLive(preview, this.requestCount);
  }

  toggle(preview: Preview, isDemo: boolean) {
    const { activeId, status, elapsedSeconds } = this.state;
    if (activeId !== preview.id) return this.start(preview, 0, isDemo);
    if (status === "paused") return this.start(preview, elapsedSeconds, isDemo);
    this.halt();
    if (status === "loading") this.commit(backToIdle);
    else this.setStatus("paused");
  }

  /** A refetch can drop the track that plays (a withdrawal): its row is gone,
   *  so nothing could pause it. Stops playback when the active id left. */
  stopIfAbsent(previewIds: readonly string[]) {
    const { activeId } = this.state;
    if (activeId === null || previewIds.includes(activeId)) return;
    this.halt();
    this.commit(backToIdle);
  }

  /** Leaving the page: stop, and let the browser release the audio. */
  dispose() {
    this.halt();
    const audio = this.audio;
    this.audio = null;
    audio?.removeAttribute("src");
    audio?.load();
  }
}
