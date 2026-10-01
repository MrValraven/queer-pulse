import type { FilmWindow } from "./render/filmWindow";

/**
 * Plays a film in real time for the preview, with its score once it's ready.
 * Kept outside React: it runs a requestAnimationFrame loop and owns an
 * AudioContext, and only reports the playhead back through `onTick`.
 *
 * With sound, the audio clock drives the picture (so they can't drift); until
 * the score is composed, the wall clock does.
 */
export class FilmPlayer {
  private readonly film: FilmWindow;
  private readonly duration: number;
  private readonly onTick: (seconds: number, isPlaying: boolean) => void;
  private score: AudioBuffer | null = null;
  private audio: AudioContext | null = null;
  private source: AudioBufferSourceNode | null = null;
  private startedAt = 0;
  private position = 0;
  private frameRequest = 0;
  private isPlaying = false;

  constructor(
    film: FilmWindow,
    onTick: (seconds: number, isPlaying: boolean) => void,
  ) {
    this.film = film;
    this.duration = film.DURATION;
    this.onTick = onTick;
  }

  /** Adds the composed score; a running preview picks it up where it is. */
  setScore(score: AudioBuffer) {
    this.score = score;
    if (this.isPlaying) this.startFrom(this.now());
  }

  play() {
    if (this.isPlaying) return;
    this.startFrom(this.position >= this.duration ? 0 : this.position);
  }

  pause() {
    if (!this.isPlaying) return;
    this.position = this.now();
    this.stopClock();
    this.onTick(this.position, false);
  }

  seek(seconds: number) {
    const target = Math.min(Math.max(seconds, 0), this.duration);
    if (this.isPlaying) {
      this.startFrom(target);
    } else {
      this.position = target;
      this.film.seek(target);
      this.onTick(target, false);
    }
  }

  dispose() {
    this.stopClock();
    void this.audio?.close().catch(() => undefined);
    this.audio = null;
  }

  private now(): number {
    if (!this.isPlaying) return this.position;
    const clock =
      this.source && this.audio
        ? this.audio.currentTime
        : performance.now() / 1000;
    return Math.min(clock - this.startedAt, this.duration);
  }

  private startFrom(seconds: number) {
    this.stopClock();
    this.isPlaying = true;
    this.position = seconds;
    if (this.score) {
      // Created on the first play, which is a click, so autoplay rules allow it.
      this.audio ??= new AudioContext();
      const source = this.audio.createBufferSource();
      source.buffer = this.score;
      source.connect(this.audio.destination);
      source.start(0, seconds);
      this.source = source;
      this.startedAt = this.audio.currentTime - seconds;
    } else {
      this.startedAt = performance.now() / 1000 - seconds;
    }
    const tick = () => {
      const current = this.now();
      this.film.seek(current);
      if (current >= this.duration) {
        this.position = this.duration;
        this.stopClock();
        this.onTick(this.duration, false);
        return;
      }
      this.onTick(current, true);
      this.frameRequest = requestAnimationFrame(tick);
    };
    tick();
  }

  private stopClock() {
    cancelAnimationFrame(this.frameRequest);
    if (this.source) {
      this.source.onended = null;
      try {
        this.source.stop();
      } catch {
        // Already stopped; nothing to do.
      }
      this.source = null;
    }
    this.isPlaying = false;
  }
}
