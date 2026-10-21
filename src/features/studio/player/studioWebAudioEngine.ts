import {
  createListeners,
  createSimulatedAudioEngine,
  type StudioAudioEngine,
  type StudioAudioEngineFactory,
  type StudioAudioEvent,
  type StudioHandoverMode,
  type StudioRemotePlayback,
} from "./studioAudioEngine";
import {
  createAudioGraph,
  equalPowerParam,
  gainFromDb,
  preferPlaybackAudioSession,
  rampParam,
  type StudioAudioGraph,
  type StudioDeckNodes,
} from "./studioAudioGraph";
import {
  areBufferedRangesEqual,
  readBufferedRanges,
} from "./studioBufferedRanges";
import type {
  StudioBufferedRange,
  StudioRemoteState,
} from "./studioPlayerContext";
import {
  isRemotePlaybackSupported,
  promptRemotePicker,
  REMOTE_IDLE,
  watchRemotePlayback,
  type StudioRemoteWatcher,
} from "./studioRemotePlayback";
import {
  MEDIA_ERROR_SOURCE_NOT_SUPPORTED,
  noteMediaFailure,
  setPlaybackSignals,
  studioMediaFailureReasonOf,
} from "./studioPlaybackSignals";
import {
  createSessionHoldElement,
  needsSessionHold,
} from "./studioSessionHold";

/** HTMLMediaElement.HAVE_FUTURE_DATA: enough is loaded to keep playing. */
const HAVE_FUTURE_DATA = 3;

/** The browser seams the engine needs; tests pass fakes. */
export interface StudioAudioEnvironment {
  isWebAudioAvailable: () => boolean;
  createContext: () => AudioContext | null;
  /** A fresh hidden <audio>: for plain mode, or for the graph when the
   *  rendered decks were already routed by an earlier engine. */
  createElement: () => HTMLAudioElement;
  setTimer: (callback: () => void, delayMs: number) => number;
  clearTimer: (timerId: number) => void;
  /** A hidden <audio> looping silence that keeps the media session alive
   *  between songs, or null where the platform needs none. */
  createSessionHold?: () => HTMLAudioElement | null;
}

interface Deck {
  element: HTMLAudioElement;
  nodes: StudioDeckNodes | null;
  gainDb: number;
  pendingStartSeconds: number;
  /** Plain decks only: the fade level, applied through element.volume. */
  plainFadeLevel: number;
  detach: AbortController;
}

type EngineMode = "graph" | "trying" | "plain";

const LOUDNESS_RAMP_SECONDS = 0.2;
const RESTORE_RAMP_SECONDS = 0.2;
const PLAIN_FADE_STEP_MS = 100;
const OUTGOING_GRACE_MS = 50;
/** How long play() waits for the audio context to start before it reads the
 *  context as suspended and reports the play as blocked. */
const RESUME_TIMEOUT_MS = 2000;
/** A crossfade cut short (a seek, a load): the incoming deck comes up to
 *  full level and the outgoing one ramps out, both fast and click free. */
const CUT_IN_SECONDS = 0.05;
const CUT_OUT_SECONDS = 0.03;
/** Spec 4.4: the player clamps whatever gain the server sends (the bounds
 *  trackGainDb applies). */
const GAIN_DB_LIMITS = { min: -12, max: 6 } as const;
/** How long the session hold outlasts a pause, an end or an error: long
 *  enough to cover the no-preload reload and a refresh retry, after which a
 *  member's pause lets the session go. */
const SESSION_RELEASE_GRACE_MS = 10_000;

const clampLevel = (level: number) => Math.min(Math.max(level, 0), 1);
const clampGainDb = (gainDb: number) =>
  Number.isFinite(gainDb)
    ? Math.min(Math.max(gainDb, GAIN_DB_LIMITS.min), GAIN_DB_LIMITS.max)
    : 0;
/** The slider's middle should sound like the middle: gain = volume squared. */
const perceivedLevel = (volume: number) => clampLevel(volume) ** 2;

/** Sets the rate on one deck element; `defaultPlaybackRate` keeps it across
 *  the deck's next load (a new source resets `playbackRate` to it). */
function applyPlaybackRate(
  element: HTMLAudioElement | null | undefined,
  rate: number,
) {
  if (!element) return;
  element.defaultPlaybackRate = rate;
  element.playbackRate = rate;
  element.preservesPitch = true;
}

class WebAudioEngine implements StudioAudioEngine {
  readonly remote: StudioRemotePlayback | null;
  private readonly listeners = createListeners();
  private readonly detach = new AbortController();
  private readonly environment: StudioAudioEnvironment;
  private graphDecks: [Deck, Deck];
  private decks: [Deck, Deck];
  private playbackRate = 1;
  /** Elements this engine created; removed again on dispose. */
  private readonly ownedElements = new Set<HTMLAudioElement>();
  private mode: EngineMode;
  private hasAnnouncedPlain = false;
  private graph: StudioAudioGraph | null = null;
  private activeIndex: 0 | 1 = 0;
  private outgoing: { deck: Deck; timerId: number } | null = null;
  private hasPreloaded = false;
  /** The last loaded spans reported for the active deck. */
  private lastBufferedRanges: readonly StudioBufferedRange[] = [];
  private volume = 1;
  private isMuted = false;
  private isLoudnessEven = true;
  private fade: {
    timerIds: number[];
    settle: (isComplete: boolean) => void;
  } | null = null;
  private remoteState: StudioRemoteState = REMOTE_IDLE;
  private remoteWatcher: StudioRemoteWatcher | null = null;
  /** The silent element that holds the media session, made on first use. */
  private sessionHold: HTMLAudioElement | null = null;
  private hasTriedSessionHold = false;
  private sessionReleaseTimerId: number | null = null;

  constructor(
    elements: readonly [HTMLAudioElement, HTMLAudioElement],
    environment: StudioAudioEnvironment,
  ) {
    this.environment = environment;
    this.mode = environment.isWebAudioAvailable() ? "graph" : "plain";
    this.graphDecks = [
      this.createDeck(elements[0]),
      this.createDeck(elements[1]),
    ];
    this.decks = this.graphDecks;
    for (const deck of this.graphDecks) {
      // CORS mode only where the graph can use it; plain elements keep
      // byte-range requests working without the bucket rule.
      if (this.mode === "graph") deck.element.crossOrigin = "anonymous";
      else deck.element.removeAttribute("crossorigin");
    }
    this.remote = isRemotePlaybackSupported(elements[0])
      ? {
          prompt: () => promptRemotePicker(this.active().element),
          state: () => this.remoteState,
        }
      : null;
    this.watchRemote();
    if (typeof document !== "undefined")
      document.addEventListener(
        "visibilitychange",
        () => this.onVisibilityChange(),
        { signal: this.detach.signal },
      );
  }

  readonly subscribe = (listener: (event: StudioAudioEvent) => void) =>
    this.listeners.subscribe(listener);

  unlock(): void {
    if (this.mode === "plain") {
      this.primeDecks();
      this.announcePlain();
      return;
    }
    this.ensureGraph();
    this.primeDecks();
    void this.graph?.resume();
  }

  load(sourceUrl: string, startAtSeconds: number, gainDb: number): void {
    this.cutCrossfade();
    this.endFade();
    const deck = this.active();
    deck.pendingStartSeconds = startAtSeconds;
    deck.gainDb = clampGainDb(gainDb);
    this.setFadeLevel(deck, { to: 1, seconds: 0 });
    this.applyLoudness(deck, 0);
    this.lastBufferedRanges = [];
    setPlaybackSignals({ isBuffering: false });
    deck.element.src = sourceUrl;
    deck.element.load();
  }

  async play(): Promise<void> {
    this.holdSession();
    const deck = this.active();
    // Both start inside the member's gesture: the context's resume and the
    // element's play. The resume's answer is read afterwards, and a context
    // that never answers reads as suspended once RESUME_TIMEOUT_MS passes.
    const resumed = this.graph ? this.resumeWithin(RESUME_TIMEOUT_MS) : null;
    await this.playDeck(deck);
    if (!resumed || (await resumed) || !deck.nodes) return;
    // A context that stays suspended plays the element into silence.
    if (!this.isActive(deck) || deck.element.paused) return;
    deck.element.pause();
    this.emit({ type: "blocked" });
  }

  pause(): void {
    this.finishOutgoing();
    this.endFade();
    const deck = this.active();
    deck.element.pause();
    this.setFadeLevel(deck, { to: 1, seconds: 0 });
  }

  seek(seconds: number): void {
    this.cutCrossfade();
    this.active().element.currentTime = seconds;
  }

  reset(): void {
    this.finishOutgoing();
    this.endFade();
    this.cancelPreload();
    this.lastBufferedRanges = [];
    setPlaybackSignals({ isBuffering: false });
    this.clearDeck(this.active());
    this.releaseSession(0);
  }

  preload(sourceUrl: string, gainDb: number): void {
    if (this.remoteState.isConnected) return;
    const deck = this.idle();
    if (this.outgoing?.deck === deck) this.finishOutgoing();
    deck.gainDb = clampGainDb(gainDb);
    deck.pendingStartSeconds = 0;
    this.setFadeLevel(deck, { to: 1, seconds: 0 });
    this.applyLoudness(deck, 0);
    deck.element.preload = "auto";
    deck.element.src = sourceUrl;
    deck.element.load();
    this.hasPreloaded = true;
  }

  cancelPreload(): void {
    if (!this.hasPreloaded) return;
    this.hasPreloaded = false;
    this.clearDeck(this.idle());
  }

  hasPreload(): boolean {
    return this.hasPreloaded;
  }

  handover(mode: StudioHandoverMode): void {
    if (!this.hasPreloaded) return;
    const previous = this.active();
    const incoming = this.idle();
    this.hasPreloaded = false;
    this.finishOutgoing();
    this.endFade();
    this.activeIndex = this.activeIndex === 0 ? 1 : 0;
    // A cast device plays one deck: the swap is gapless while connected.
    const crossfadeSeconds =
      typeof mode === "object" &&
      this.graph &&
      this.mode === "graph" &&
      !this.remoteState.isConnected
        ? Math.max(0, mode.crossfadeSeconds)
        : 0;
    if (crossfadeSeconds > 0) {
      this.crossfadeDecks(incoming, previous, crossfadeSeconds);
      this.outgoing = {
        deck: previous,
        timerId: this.environment.setTimer(
          () => this.finishOutgoing(),
          crossfadeSeconds * 1000 + OUTGOING_GRACE_MS,
        ),
      };
    } else {
      this.setFadeLevel(incoming, { to: 1, seconds: 0 });
      this.clearDeck(previous);
    }
    if (Number.isFinite(incoming.element.duration))
      this.emit({ type: "duration", seconds: incoming.element.duration });
    this.lastBufferedRanges = [];
    this.reportBuffered(incoming);
    this.emit({ type: "time", seconds: incoming.element.currentTime });
    void this.playDeck(incoming);
  }

  setVolume(volume: number): void {
    this.volume = clampLevel(volume);
    this.applyMaster();
  }

  setMuted(isMuted: boolean): void {
    this.isMuted = isMuted;
    this.applyMaster();
  }

  setPlaybackRate(rate: number): void {
    this.playbackRate = rate;
    // The graph decks too: a plain attempt that reverts brings them back.
    for (const deck of new Set([...this.graphDecks, ...this.decks]))
      applyPlaybackRate(deck.element, rate);
  }

  setLoudnessEven(isEven: boolean): void {
    this.isLoudnessEven = isEven;
    this.decks.forEach((deck) =>
      this.applyLoudness(deck, LOUDNESS_RAMP_SECONDS),
    );
  }

  fadeOut(seconds: number): Promise<boolean> {
    this.endFade();
    const deck = this.active();
    return new Promise<boolean>((resolve) => {
      const timerIds: number[] = [];
      this.fade = { timerIds, settle: resolve };
      if (deck.nodes) this.setFadeLevel(deck, { to: 0, seconds });
      else this.stepPlainFade(deck, seconds, timerIds);
      timerIds.push(
        this.environment.setTimer(() => this.completeFade(), seconds * 1000),
      );
    });
  }

  cancelFadeOut(): void {
    this.endFade();
  }

  enterPlainMode(): boolean {
    if (this.mode !== "graph") return false;
    this.mode = "trying";
    this.finishOutgoing();
    this.endFade();
    this.hasPreloaded = false;
    this.graphDecks.forEach((deck) => this.clearDeck(deck));
    this.decks = [this.createFreshDeck(), this.createFreshDeck()];
    this.activeIndex = 0;
    this.decks.forEach((deck) => this.applyPlainVolume(deck));
    this.watchRemote();
    return true;
  }

  isPlainMode(): boolean {
    return this.mode === "plain";
  }

  dispose(): void {
    this.finishOutgoing();
    this.endFade();
    this.detach.abort();
    this.remoteWatcher?.dispose();
    for (const deck of new Set([...this.graphDecks, ...this.decks]))
      deck.detach.abort();
    this.ownedElements.forEach((element) => element.remove());
    this.ownedElements.clear();
    this.releaseSession(0);
    this.sessionHold?.remove();
    this.sessionHold = null;
    this.graph?.close();
    this.graph = null;
  }

  // Decks.

  private active(): Deck {
    return this.decks[this.activeIndex];
  }

  private idle(): Deck {
    return this.decks[this.activeIndex === 0 ? 1 : 0];
  }

  private isActive(deck: Deck): boolean {
    return deck === this.active();
  }

  /** Emits the active deck's loaded spans when they changed since the last
   *  report. */
  private reportBuffered(deck: Deck): void {
    if (!this.isActive(deck)) return;
    const ranges = readBufferedRanges(deck.element);
    if (areBufferedRangesEqual(ranges, this.lastBufferedRanges)) return;
    this.lastBufferedRanges = ranges;
    this.emit({ type: "buffered", ranges });
  }

  private emit(event: StudioAudioEvent): void {
    this.listeners.emit(event);
  }

  /** ENG-01: the active deck waiting for data while it should play shows
   *  the buffering ring and line; playing, a pause, the end or an error
   *  clears it. Idle and emptied decks never report. */
  private reportBuffering(deck: Deck, isBuffering: boolean): void {
    if (!this.isActive(deck) || !deck.element.getAttribute("src")) return;
    if (isBuffering && deck.element.paused) return;
    setPlaybackSignals({ isBuffering });
  }

  private createDeck(element: HTMLAudioElement): Deck {
    const deck: Deck = {
      element,
      nodes: null,
      gainDb: 0,
      pendingStartSeconds: 0,
      plainFadeLevel: 1,
      detach: new AbortController(),
    };
    this.listenTo(deck);
    return deck;
  }

  private createFreshDeck(): Deck {
    const element = this.environment.createElement();
    this.ownedElements.add(element);
    // Artist kinds: a fresh element (plain mode, a moved graph) keeps the
    // speed an episode plays at.
    applyPlaybackRate(element, this.playbackRate);
    return this.createDeck(element);
  }

  /** iOS starts a media element outside a gesture only once it has played
   *  inside one: a muted play and pause on every empty deck, so a later
   *  handover can start the idle deck on its own. A deck holding a source
   *  is left alone (the gesture's own play reaches it). */
  private primeDecks(): void {
    for (const deck of this.decks) {
      const element = deck.element;
      if (element.getAttribute("src") || !element.paused) continue;
      const wasMuted = element.muted;
      element.muted = true;
      const attempt = element.play();
      element.pause();
      element.muted = wasMuted;
      void Promise.resolve(attempt).catch(() => undefined);
    }
  }

  private listenTo(deck: Deck): void {
    const listen = (type: string, handler: () => void) =>
      deck.element.addEventListener(type, handler, {
        signal: deck.detach.signal,
      });
    // The one start position still waiting for its source's metadata.
    listen("loadedmetadata", () => {
      if (deck.pendingStartSeconds > 0)
        deck.element.currentTime = deck.pendingStartSeconds;
      deck.pendingStartSeconds = 0;
    });
    listen("timeupdate", () => {
      if (this.isActive(deck))
        this.emit({ type: "time", seconds: deck.element.currentTime });
    });
    listen("progress", () => this.reportBuffered(deck));
    listen("seeked", () => this.reportBuffered(deck));
    listen("loadeddata", () => this.reportBuffered(deck));
    listen("durationchange", () => {
      if (this.isActive(deck) && Number.isFinite(deck.element.duration))
        this.emit({ type: "duration", seconds: deck.element.duration });
    });
    // A deck with no source (primed, or cleared) reports nothing.
    const hasSource = () => Boolean(deck.element.getAttribute("src"));
    listen("playing", () => {
      if (hasSource()) this.onDeckPlaying(deck);
    });
    // A natural end fires pause before ended: that pause is the end itself,
    // so the player still reads the track as playing when it hands over.
    listen("pause", () => {
      this.reportBuffering(deck, false);
      if (deck.element.ended) return;
      if (!hasSource() || !this.isActive(deck)) return;
      this.releaseSession(SESSION_RELEASE_GRACE_MS);
      this.emit({ type: "paused" });
    });
    listen("ended", () => this.onDeckEnded(deck));
    listen("error", () => this.onDeckError(deck));
    listen("waiting", () => this.reportBuffering(deck, true));
    // Data arrived while paused: nothing waits any more.
    listen("canplay", () => {
      if (deck.element.paused) this.reportBuffering(deck, false);
    });
    // A stall with enough data on hand keeps playing; only a starved deck
    // waits.
    listen("stalled", () => {
      if (deck.element.readyState < HAVE_FUTURE_DATA)
        this.reportBuffering(deck, true);
    });
  }

  private onDeckPlaying(deck: Deck): void {
    if (!this.isActive(deck)) return;
    if (this.mode === "trying") {
      this.mode = "plain";
      // Plain lasts the session: the graph has nothing left to drive.
      this.graph?.close();
      this.graph = null;
      this.announcePlain();
    }
    this.holdSession();
    this.reportBuffering(deck, false);
    this.emit({ type: "playing" });
  }

  /** The release comes first: a handover inside the ended emit starts the
   *  next deck, whose playing cancels it, and a queue that ends with nothing
   *  next lets the session go after the grace. */
  private onDeckEnded(deck: Deck): void {
    if (this.outgoing?.deck === deck) {
      this.finishOutgoing();
      return;
    }
    if (!this.isActive(deck)) return;
    this.reportBuffering(deck, false);
    this.releaseSession(SESSION_RELEASE_GRACE_MS);
    this.emit({ type: "ended" });
  }

  /** The single source of `failed` for a broken source: the pending play()
   *  rejects for the same failure, and that path stays quiet. */
  private onDeckError(deck: Deck): void {
    if (!deck.element.getAttribute("src")) return;
    if (this.isActive(deck)) {
      if (this.mode === "trying") this.revertPlainAttempt();
      this.reportBuffering(deck, false);
      // ENG-02: the element's own error names the cause for the bar.
      noteMediaFailure(studioMediaFailureReasonOf(deck.element.error?.code));
      this.releaseSession(SESSION_RELEASE_GRACE_MS);
      this.emit({ type: "failed" });
      return;
    }
    if (deck === this.idle() && this.hasPreloaded) {
      this.hasPreloaded = false;
      this.clearDeck(deck);
      this.emit({ type: "preloadFailed" });
    }
  }

  private async playDeck(deck: Deck): Promise<void> {
    try {
      await deck.element.play();
    } catch (error) {
      const errorName = error instanceof DOMException ? error.name : "";
      // AbortError: a newer load replaced this source before it started.
      // element.error: the error listener has already reported it.
      if (
        errorName === "AbortError" ||
        deck.element.error ||
        !this.isActive(deck)
      )
        return;
      if (errorName !== "NotAllowedError")
        noteMediaFailure(
          studioMediaFailureReasonOf(
            errorName === "NotSupportedError"
              ? MEDIA_ERROR_SOURCE_NOT_SUPPORTED
              : undefined,
          ),
        );
      this.emit(
        errorName === "NotAllowedError"
          ? { type: "blocked" }
          : { type: "failed" },
      );
    }
  }

  private clearDeck(deck: Deck): void {
    deck.pendingStartSeconds = 0;
    deck.element.pause();
    deck.element.removeAttribute("src");
    deck.element.load();
  }

  private finishOutgoing(): void {
    const outgoing = this.outgoing;
    if (!outgoing) return;
    this.outgoing = null;
    this.environment.clearTimer(outgoing.timerId);
    this.clearDeck(outgoing.deck);
    this.setFadeLevel(outgoing.deck, { to: 1, seconds: 0 });
  }

  /** Ends a crossfade early (a seek, a load): the incoming deck comes up to
   *  full level and the outgoing one ramps out before it is cleared. */
  private cutCrossfade(): void {
    const outgoing = this.outgoing;
    if (!outgoing) return;
    this.environment.clearTimer(outgoing.timerId);
    this.setFadeLevel(this.active(), { to: 1, seconds: CUT_IN_SECONDS });
    this.setFadeLevel(outgoing.deck, { to: 0, seconds: CUT_OUT_SECONDS });
    outgoing.timerId = this.environment.setTimer(
      () => this.finishOutgoing(),
      CUT_OUT_SECONDS * 1000 + OUTGOING_GRACE_MS,
    );
  }

  // The session hold.

  /** Starts the silent hold element so the media session keeps a playing
   *  player through the gap between songs. A cast device holds its own. */
  private holdSession(): void {
    this.cancelSessionRelease();
    if (this.remoteState.isConnected) return;
    if (!this.hasTriedSessionHold) {
      this.hasTriedSessionHold = true;
      this.sessionHold = this.environment.createSessionHold?.() ?? null;
    }
    const element = this.sessionHold;
    if (element?.paused)
      void Promise.resolve(element.play()).catch(() => undefined);
  }

  /** Pauses the hold element once delayMs passes, or right away at 0. A
   *  newer release replaces a pending one. */
  private releaseSession(delayMs: number): void {
    this.cancelSessionRelease();
    const element = this.sessionHold;
    if (!element) return;
    if (delayMs <= 0) {
      element.pause();
      return;
    }
    this.sessionReleaseTimerId = this.environment.setTimer(() => {
      this.sessionReleaseTimerId = null;
      element.pause();
    }, delayMs);
  }

  private cancelSessionRelease(): void {
    if (this.sessionReleaseTimerId === null) return;
    this.environment.clearTimer(this.sessionReleaseTimerId);
    this.sessionReleaseTimerId = null;
  }

  // The graph and plain mode.

  private ensureGraph(): void {
    if (this.mode !== "graph" || this.graph) return;
    const graph = createAudioGraph(this.environment.createContext());
    if (!graph) {
      this.switchToPlain(false);
      return;
    }
    let nodes = this.connectGraphDecks(graph);
    if (!nodes) {
      // A media element is routed once in its life: decks an earlier engine
      // routed (a demo switch, a hot reload) stay in that closed context, so
      // the graph takes fresh elements.
      this.replaceGraphDecks();
      nodes = this.connectGraphDecks(graph);
    }
    if (!nodes) {
      graph.close();
      this.switchToPlain(true);
      return;
    }
    this.graph = graph;
    [this.graphDecks[0].nodes, this.graphDecks[1].nodes] = nodes;
    for (const deck of this.graphDecks) {
      deck.element.volume = 1;
      deck.element.muted = false;
      this.setFadeLevel(deck, { to: 1, seconds: 0 });
      this.applyLoudness(deck, 0);
    }
    graph.onStateChange(
      (state) => this.onContextState(state),
      this.detach.signal,
    );
    preferPlaybackAudioSession();
    this.applyMaster();
  }

  private connectGraphDecks(
    graph: StudioAudioGraph,
  ): [StudioDeckNodes, StudioDeckNodes] | null {
    const firstNodes = graph.connect(this.graphDecks[0].element);
    const secondNodes = firstNodes
      ? graph.connect(this.graphDecks[1].element)
      : null;
    return firstNodes && secondNodes ? [firstNodes, secondNodes] : null;
  }

  /** Moves the graph onto two fresh elements in CORS mode. A source the
   *  active deck already holds moves along, at the same position. */
  private replaceGraphDecks(): void {
    const previous = this.active();
    const source = previous.element.getAttribute("src");
    const resumeAt =
      previous.pendingStartSeconds || previous.element.currentTime;
    for (const deck of this.graphDecks) {
      this.clearDeck(deck);
      deck.detach.abort();
    }
    this.graphDecks = [this.createFreshDeck(), this.createFreshDeck()];
    this.graphDecks.forEach((deck) => {
      deck.element.crossOrigin = "anonymous";
    });
    this.decks = this.graphDecks;
    this.activeIndex = 0;
    this.hasPreloaded = false;
    this.watchRemote();
    if (!source) return;
    const next = this.active();
    next.gainDb = previous.gainDb;
    next.pendingStartSeconds = resumeAt;
    next.element.src = source;
    next.element.load();
  }

  private switchToPlain(needsFreshElements: boolean): void {
    this.mode = "plain";
    if (needsFreshElements) {
      this.graphDecks.forEach((deck) => this.clearDeck(deck));
      this.decks = [this.createFreshDeck(), this.createFreshDeck()];
      this.activeIndex = 0;
      this.watchRemote();
    } else {
      this.graphDecks.forEach((deck) =>
        deck.element.removeAttribute("crossorigin"),
      );
    }
    this.decks.forEach((deck) => this.applyPlainVolume(deck));
    this.announcePlain();
  }

  private revertPlainAttempt(): void {
    for (const deck of this.decks) {
      this.clearDeck(deck);
      deck.detach.abort();
      deck.element.remove();
      this.ownedElements.delete(deck.element);
    }
    this.decks = this.graphDecks;
    this.activeIndex = 0;
    this.mode = "graph";
    this.watchRemote();
  }

  private announcePlain(): void {
    if (this.hasAnnouncedPlain) return;
    this.hasAnnouncedPlain = true;
    this.emit({ type: "plainMode" });
  }

  /** True while the active deck plays through the graph. A plain deck
   *  plays on its own, whatever the context does. */
  private isActiveDeckRouted(): boolean {
    const deck = this.active();
    return deck.nodes !== null && !deck.element.paused;
  }

  /** An interruption (a call, the iOS lock screen) silences the graph while
   *  the element keeps playing: pause, so the bar tells the truth. */
  private onContextState(state: string): void {
    if (!this.isActiveDeckRouted()) return;
    if (state === "interrupted") {
      this.active().element.pause();
      return;
    }
    if (state === "suspended") this.resumeOrPause();
  }

  private onVisibilityChange(): void {
    if (document.visibilityState !== "visible" || !this.graph) return;
    if (!this.isActiveDeckRouted()) return;
    if (this.graph.context.state !== "running") this.resumeOrPause();
  }

  /** The context's resume, raced against a timer: false when it fails or
   *  has not answered in time, so play() emits blocked and never hangs. */
  private resumeWithin(timeoutMs: number): Promise<boolean> {
    const graph = this.graph;
    if (!graph) return Promise.resolve(false);
    return new Promise<boolean>((resolve) => {
      const timerId = this.environment.setTimer(
        () => resolve(false),
        timeoutMs,
      );
      void graph.resume().then((isRunning) => {
        this.environment.clearTimer(timerId);
        resolve(isRunning);
      });
    });
  }

  private resumeOrPause(): void {
    const graph = this.graph;
    const element = this.active().element;
    if (!graph || !this.isActiveDeckRouted()) return;
    void graph.resume().then((isRunning) => {
      if (!isRunning && !element.paused) element.pause();
    });
  }

  // Levels.

  private loudnessLevel(deck: Deck): number {
    return this.isLoudnessEven ? gainFromDb(deck.gainDb) : 1;
  }

  private applyLoudness(deck: Deck, seconds: number): void {
    if (deck.nodes && this.graph)
      rampParam(deck.nodes.loudness.gain, this.graph.context, {
        to: this.loudnessLevel(deck),
        seconds,
      });
    else this.applyPlainVolume(deck);
  }

  private setFadeLevel(
    deck: Deck,
    target: { to: number; seconds: number; from?: number },
  ): void {
    if (deck.nodes && this.graph) {
      rampParam(deck.nodes.fade.gain, this.graph.context, target);
      return;
    }
    deck.plainFadeLevel = target.to;
    this.applyPlainVolume(deck);
  }

  /** The handover's crossfade runs equal-power curves, so the blend keeps
   *  its loudness through the middle. Every other fade stays linear: the
   *  sleep timer, loudness, master and restore ramps move one deck, and the
   *  cut ramps are 30 to 50 ms click guards that start wherever a curve
   *  left off. */
  private crossfadeDecks(
    incoming: Deck,
    previous: Deck,
    seconds: number,
  ): void {
    const fades = [
      { deck: incoming, direction: "in" },
      { deck: previous, direction: "out" },
    ] as const;
    for (const { deck, direction } of fades) {
      if (deck.nodes && this.graph)
        equalPowerParam(deck.nodes.fade.gain, this.graph.context, {
          direction,
          seconds,
        });
      else
        this.setFadeLevel(
          deck,
          direction === "in" ? { from: 0, to: 1, seconds } : { to: 0, seconds },
        );
    }
  }

  /** Without the graph, loudness can only attenuate (element.volume tops out
   *  at 1, and iOS ignores it). */
  private applyPlainVolume(deck: Deck): void {
    if (deck.nodes) return;
    deck.element.volume = clampLevel(
      perceivedLevel(this.volume) *
        Math.min(1, this.loudnessLevel(deck)) *
        deck.plainFadeLevel,
    );
    deck.element.muted = this.isMuted;
  }

  private applyMaster(): void {
    this.graph?.setMasterLevel(this.isMuted ? 0 : perceivedLevel(this.volume));
    this.decks.forEach((deck) => this.applyPlainVolume(deck));
  }

  private stepPlainFade(deck: Deck, seconds: number, timerIds: number[]): void {
    const stepCount = Math.max(
      1,
      Math.round((seconds * 1000) / PLAIN_FADE_STEP_MS),
    );
    for (let step = 1; step <= stepCount; step += 1) {
      timerIds.push(
        this.environment.setTimer(() => {
          deck.plainFadeLevel = 1 - step / stepCount;
          this.applyPlainVolume(deck);
        }, step * PLAIN_FADE_STEP_MS),
      );
    }
  }

  private completeFade(): void {
    const fade = this.fade;
    if (!fade) return;
    this.fade = null;
    fade.timerIds.forEach((timerId) => this.environment.clearTimer(timerId));
    fade.settle(true);
  }

  /** Stops a fade in progress and brings the level back. */
  private endFade(): void {
    const fade = this.fade;
    if (!fade) return;
    this.fade = null;
    fade.timerIds.forEach((timerId) => this.environment.clearTimer(timerId));
    this.setFadeLevel(this.active(), {
      to: 1,
      seconds: RESTORE_RAMP_SECONDS,
    });
    fade.settle(false);
  }

  /** A new watcher (new elements) starts from its own state, so the cast
   *  button follows the elements that play now. */
  private watchRemote(): void {
    this.remoteWatcher?.dispose();
    const watcher = watchRemotePlayback(
      this.decks.map((deck) => deck.element),
      (state) => this.onRemoteChange(state),
    );
    this.remoteWatcher = watcher;
    this.onRemoteChange(watcher.state());
  }

  /** While a device is connected it plays the active deck alone: a preload
   *  or a crossfade in progress ends there. */
  private onRemoteChange(state: StudioRemoteState): void {
    const previous = this.remoteState;
    if (
      state.isAvailable === previous.isAvailable &&
      state.isConnected === previous.isConnected
    )
      return;
    this.remoteState = state;
    if (state.isConnected && !previous.isConnected) {
      this.finishOutgoing();
      this.cancelPreload();
      this.releaseSession(0);
    }
    this.emit({ type: "remote", state });
  }
}

function audioContextConstructor(): typeof AudioContext | null {
  if (typeof window === "undefined") return null;
  const scope = window as unknown as {
    AudioContext?: typeof AudioContext;
    webkitAudioContext?: typeof AudioContext;
  };
  return scope.AudioContext ?? scope.webkitAudioContext ?? null;
}

function browserEnvironment(anchor: HTMLAudioElement): StudioAudioEnvironment {
  return {
    isWebAudioAvailable: () => audioContextConstructor() !== null,
    createContext: () => {
      const AudioContextConstructor = audioContextConstructor();
      if (!AudioContextConstructor) return null;
      try {
        return new AudioContextConstructor();
      } catch {
        return null;
      }
    },
    createElement: () => {
      const element = document.createElement("audio");
      element.hidden = true;
      element.preload = "auto";
      element.setAttribute("x-webkit-airplay", "allow");
      (anchor.parentElement ?? document.body).append(element);
      return element;
    },
    setTimer: (callback, delayMs) => window.setTimeout(callback, delayMs),
    clearTimer: (timerId) => window.clearTimeout(timerId),
    createSessionHold: () =>
      needsSessionHold() ? createSessionHoldElement(anchor) : null,
  };
}

/** The two-deck engine (spec 4.1): each deck runs through its own loudness
 *  and fade gains into one master, built on the first gesture. */
export function createWebAudioEngine(
  elements: readonly [HTMLAudioElement, HTMLAudioElement],
  environment: StudioAudioEnvironment = browserEnvironment(elements[0]),
): StudioAudioEngine {
  return new WebAudioEngine(elements, environment);
}

export const createDefaultAudioEngine: StudioAudioEngineFactory = ({
  decks,
  isSimulated,
  durationFor,
}) => {
  const [first, second] = decks;
  return isSimulated || !first || !second
    ? createSimulatedAudioEngine(durationFor)
    : createWebAudioEngine([first, second]);
};
