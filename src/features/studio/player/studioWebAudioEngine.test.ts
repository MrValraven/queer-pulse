import { describe, expect, it, vi } from "vitest";
import type { StudioAudioEvent } from "./studioAudioEngine";
import {
  createWebAudioEngine,
  type StudioAudioEnvironment,
} from "./studioWebAudioEngine";

/** A TimeRanges stand-in over [start, end] pairs. */
function timeRangesOf(spans: Array<[number, number]>): TimeRanges {
  return {
    length: spans.length,
    start: (index: number) => spans[index]?.[0] ?? 0,
    end: (index: number) => spans[index]?.[1] ?? 0,
  };
}

/** Just enough of an <audio> element: real events, recorded calls. */
function createStubElement() {
  const element = Object.assign(new EventTarget(), {
    src: "",
    currentTime: 0,
    duration: Number.NaN,
    paused: true,
    ended: false,
    volume: 1,
    muted: false,
    crossOrigin: null as string | null,
    preload: "none",
    hidden: true,
    error: null as MediaError | null,
    buffered: timeRangesOf([]),
    playResult: Promise.resolve(),
    attributes: new Map<string, string>(),
    getAttribute: (name: string): string | null =>
      name === "src"
        ? element.src || null
        : (element.attributes.get(name) ?? null),
    setAttribute: (name: string, value: string) =>
      element.attributes.set(name, value),
    removeAttribute: (name: string): void => {
      if (name === "src") element.src = "";
      if (name === "crossorigin") element.crossOrigin = null;
      element.attributes.delete(name);
    },
    load: vi.fn(),
    pause: vi.fn(() => {
      element.paused = true;
    }),
    play: vi.fn((): Promise<void> => {
      element.paused = false;
      return element.playResult;
    }),
    remove: vi.fn(),
  });
  return element;
}
type StubElement = ReturnType<typeof createStubElement>;

class FakeParam {
  value = 1;
  cancelScheduledValues = vi.fn();
  setValueAtTime = vi.fn((value: number) => {
    this.value = value;
  });
  linearRampToValueAtTime = vi.fn((value: number) => {
    this.value = value;
  });
  setValueCurveAtTime = vi.fn((curve: Float32Array) => {
    this.value = curve[curve.length - 1] ?? this.value;
  });
}

/** The curve a param last received from setValueCurveAtTime. */
function lastCurve(param: FakeParam): Float32Array {
  const call = param.setValueCurveAtTime.mock.lastCall;
  if (!call) throw new Error("no value curve was scheduled");
  return call[0];
}

/** Like a browser, an element routed into any context (closed or not) can
 *  never be routed again: `routed` is shared by every context of a test. */
class FakeContext extends EventTarget {
  state = "suspended";
  currentTime = 0;
  destination = {};
  stateAfterResume = "running";
  routed: Set<unknown>;
  sources: unknown[] = [];
  gains: { gain: FakeParam; connect: ReturnType<typeof vi.fn> }[] = [];
  constructor(routed: Set<unknown>) {
    super();
    this.routed = routed;
  }
  createGain = vi.fn(() => {
    const node = { gain: new FakeParam(), connect: vi.fn() };
    this.gains.push(node);
    return node;
  });
  createMediaElementSource = vi.fn((element: unknown) => {
    if (this.routed.has(element))
      throw new DOMException("already connected", "InvalidStateError");
    this.routed.add(element);
    this.sources.push(element);
    return { connect: vi.fn() };
  });
  resume = vi.fn(() => {
    this.state = this.stateAfterResume;
    return Promise.resolve();
  });
  close = vi.fn(() => Promise.resolve());
  moveTo(state: string) {
    this.state = state;
    this.dispatchEvent(new Event("statechange"));
  }
}

function setup(options: { hasWebAudio?: boolean } = {}) {
  const hasWebAudio = options.hasWebAudio ?? true;
  const decks = [createStubElement(), createStubElement()] as const;
  const contexts: FakeContext[] = [];
  const created: StubElement[] = [];
  const routed = new Set<unknown>();
  const timers = new Map<number, () => void>();
  let nextTimerId = 1;
  const environment: StudioAudioEnvironment = {
    isWebAudioAvailable: () => hasWebAudio,
    createContext: () => {
      if (!hasWebAudio) return null;
      const context = new FakeContext(routed);
      contexts.push(context);
      return context as unknown as AudioContext;
    },
    createElement: () => {
      const element = createStubElement();
      created.push(element);
      return element as unknown as HTMLAudioElement;
    },
    setTimer: (callback) => {
      const timerId = nextTimerId;
      nextTimerId += 1;
      timers.set(timerId, callback);
      return timerId;
    },
    clearTimer: (timerId) => {
      timers.delete(timerId);
    },
  };
  const engine = createWebAudioEngine(
    [
      decks[0] as unknown as HTMLAudioElement,
      decks[1] as unknown as HTMLAudioElement,
    ],
    environment,
  );
  const events: StudioAudioEvent[] = [];
  engine.subscribe((event) => events.push(event));
  const runTimers = () => {
    const pending = [...timers.values()];
    timers.clear();
    pending.forEach((callback) => callback());
  };
  /** Each connected deck owns two gains (loudness, fade); the master is first. */
  const deckGains = (deckIndex: 0 | 1) => {
    const gains = contexts[0]?.gains ?? [];
    return {
      loudness: gains[1 + deckIndex * 2]!,
      fade: gains[2 + deckIndex * 2]!,
    };
  };
  return {
    engine,
    environment,
    events,
    decks,
    contexts,
    created,
    runTimers,
    deckGains,
  };
}

/** Tells the engine a deck now plays on an AirPlay device. */
function connectWireless(element: StubElement) {
  Object.assign(element, { webkitCurrentPlaybackTargetIsWireless: true });
  element.dispatchEvent(
    new Event("webkitcurrentplaybacktargetiswirelesschanged"),
  );
}

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

describe("createWebAudioEngine: one deck at a time", () => {
  it("applies only the latest load's start position", () => {
    const { engine, decks } = setup();
    engine.load("https://stream.example/a", 42, 0);
    engine.load("https://stream.example/b", 0, 0);
    decks[0].dispatchEvent(new Event("loadedmetadata"));
    expect(decks[0].currentTime).toBe(0);
  });

  it("reports a broken source once when play() rejects for it too", async () => {
    const { engine, decks, events } = setup();
    engine.load("https://stream.example/a", 0, 0);
    decks[0].error = { code: 4 } as MediaError;
    decks[0].playResult = Promise.reject(
      new DOMException("Unsupported", "NotSupportedError"),
    );
    decks[0].dispatchEvent(new Event("error"));
    await engine.play();
    expect(events.filter((event) => event.type === "failed")).toHaveLength(1);
  });

  it("reads a refused autoplay as blocked and a replaced play as nothing", async () => {
    const { engine, decks, events } = setup();
    engine.load("https://stream.example/a", 0, 0);
    decks[0].playResult = Promise.reject(
      new DOMException("gesture", "NotAllowedError"),
    );
    await engine.play();
    decks[0].playResult = Promise.reject(
      new DOMException("replaced", "AbortError"),
    );
    await engine.play();
    expect(events).toEqual([{ type: "blocked" }]);
  });

  it("reports a natural end as ended alone, with no paused before it", async () => {
    const { engine, decks, events } = setup();
    engine.load("https://stream.example/a", 0, 0);
    await engine.play();
    events.length = 0;
    decks[0].paused = true;
    decks[0].ended = true;
    decks[0].dispatchEvent(new Event("pause"));
    decks[0].dispatchEvent(new Event("ended"));
    expect(events).toEqual([{ type: "ended" }]);
  });

  it("reports a pause before the end as paused", async () => {
    const { engine, decks, events } = setup();
    engine.load("https://stream.example/a", 0, 0);
    await engine.play();
    events.length = 0;
    decks[0].dispatchEvent(new Event("pause"));
    expect(events).toEqual([{ type: "paused" }]);
  });

  it("stops listening once disposed", () => {
    const { engine, decks, events } = setup();
    engine.dispose?.();
    decks[0].dispatchEvent(new Event("ended"));
    decks[0].dispatchEvent(new Event("timeupdate"));
    expect(events).toEqual([]);
  });
});

describe("createWebAudioEngine: buffered ranges", () => {
  it("emits the loaded spans once on progress and not again while unchanged", () => {
    const { engine, decks, events } = setup();
    engine.load("https://stream.example/a", 0, 0);
    decks[0].buffered = timeRangesOf([[0, 30]]);
    decks[0].dispatchEvent(new Event("progress"));
    decks[0].dispatchEvent(new Event("progress"));
    decks[0].buffered = timeRangesOf([[0, 30.1]]);
    decks[0].dispatchEvent(new Event("progress"));
    expect(events).toEqual([
      { type: "buffered", ranges: [{ startSeconds: 0, endSeconds: 30 }] },
    ]);
  });

  it("emits again after a seek lands in a new span", () => {
    const { engine, decks, events } = setup();
    engine.load("https://stream.example/a", 0, 0);
    decks[0].buffered = timeRangesOf([[0, 30]]);
    decks[0].dispatchEvent(new Event("progress"));
    decks[0].buffered = timeRangesOf([
      [0, 30],
      [120, 150],
    ]);
    decks[0].dispatchEvent(new Event("seeked"));
    expect(events).toHaveLength(2);
    expect(events[1]).toEqual({
      type: "buffered",
      ranges: [
        { startSeconds: 0, endSeconds: 30 },
        { startSeconds: 120, endSeconds: 150 },
      ],
    });
  });

  it("emits nothing from load() and ignores the idle deck", () => {
    const { engine, decks, events } = setup();
    engine.load("https://stream.example/a", 0, 0);
    expect(events).toEqual([]);
    decks[1].buffered = timeRangesOf([[0, 40]]);
    decks[1].dispatchEvent(new Event("progress"));
    expect(events).toEqual([]);
  });

  it("reports the incoming deck's spans before its time on handover", async () => {
    const { engine, decks, events } = setup();
    engine.unlock();
    engine.load("https://stream.example/a", 0, 0);
    await engine.play();
    engine.preload("https://stream.example/b", 0);
    decks[1].buffered = timeRangesOf([[0, 45]]);
    events.length = 0;
    engine.handover("gapless");
    expect(events.map((event) => event.type)).toEqual(["buffered", "time"]);
    expect(events[0]).toEqual({
      type: "buffered",
      ranges: [{ startSeconds: 0, endSeconds: 45 }],
    });
  });
});

describe("createWebAudioEngine: the graph", () => {
  it("sets crossOrigin before any load and builds the graph on the first gesture", () => {
    const { engine, decks, contexts } = setup();
    expect(decks[0].crossOrigin).toBe("anonymous");
    expect(decks[1].crossOrigin).toBe("anonymous");
    expect(contexts).toHaveLength(0);
    engine.unlock();
    engine.unlock();
    expect(contexts).toHaveLength(1);
    expect(contexts[0]!.createMediaElementSource).toHaveBeenCalledTimes(2);
    expect(contexts[0]!.resume).toHaveBeenCalled();
  });

  it("applies the track gain while even loudness is on and ramps it off", () => {
    const { engine, deckGains } = setup();
    engine.unlock();
    engine.load("https://stream.example/a", 0, -6);
    expect(deckGains(0).loudness.gain.value).toBeCloseTo(10 ** (-6 / 20));
    engine.setLoudnessEven(false);
    expect(
      deckGains(0).loudness.gain.linearRampToValueAtTime,
    ).toHaveBeenLastCalledWith(1, 0.2);
  });

  it("sets the master from volume squared and mute", () => {
    const { engine, contexts } = setup();
    engine.unlock();
    const master = contexts[0]!.gains[0]!;
    engine.setVolume(0.5);
    expect(master.gain.value).toBeCloseTo(0.25);
    engine.setMuted(true);
    expect(master.gain.value).toBe(0);
  });

  it("pauses the active deck when the context is interrupted", async () => {
    const { engine, decks, contexts } = setup();
    engine.unlock();
    engine.load("https://stream.example/a", 0, 0);
    await engine.play();
    expect(decks[0].paused).toBe(false);
    contexts[0]!.moveTo("interrupted");
    expect(decks[0].paused).toBe(true);
  });

  it("tries to resume a suspended context and pauses when it stays suspended", async () => {
    const { engine, decks, contexts } = setup();
    engine.unlock();
    await flush();
    engine.load("https://stream.example/a", 0, 0);
    await engine.play();
    expect(decks[0].paused).toBe(false);
    contexts[0]!.stateAfterResume = "suspended";
    contexts[0]!.moveTo("suspended");
    await flush();
    expect(contexts[0]!.resume).toHaveBeenCalledTimes(2);
    expect(decks[0].paused).toBe(true);
  });

  it("pauses and reports blocked when play finds the context suspended", async () => {
    const { engine, decks, contexts, events } = setup();
    engine.unlock();
    // No statechange: the context simply stays suspended (an unlock outside
    // a gesture, a lock screen play after an interruption).
    contexts[0]!.state = "suspended";
    contexts[0]!.stateAfterResume = "suspended";
    engine.load("https://stream.example/a", 0, 0);
    await engine.play();
    expect(decks[0].play).toHaveBeenCalled();
    expect(decks[0].paused).toBe(true);
    expect(events).toEqual([{ type: "blocked" }]);
  });

  it("primes both empty decks inside the gesture and reports nothing", () => {
    const { engine, decks, events } = setup();
    engine.unlock();
    for (const deck of decks) {
      expect(deck.play).toHaveBeenCalledTimes(1);
      expect(deck.paused).toBe(true);
      expect(deck.muted).toBe(false);
    }
    decks[0].dispatchEvent(new Event("playing"));
    decks[0].dispatchEvent(new Event("pause"));
    expect(events).toEqual([]);
  });

  it("routes fresh elements when an earlier engine already routed the decks", async () => {
    const first = setup();
    first.engine.unlock();
    first.engine.dispose?.();
    expect(first.contexts[0]!.close).toHaveBeenCalled();
    const second = createWebAudioEngine(
      [
        first.decks[0] as unknown as HTMLAudioElement,
        first.decks[1] as unknown as HTMLAudioElement,
      ],
      first.environment,
    );
    const events: StudioAudioEvent[] = [];
    second.subscribe((event) => events.push(event));
    second.unlock();
    second.load("https://stream.example/a", 0, 0);
    await second.play();
    const liveContext = first.contexts[1]!;
    const [freshFirst, freshSecond] = first.created;
    expect(liveContext.sources).toEqual([freshFirst, freshSecond]);
    expect(freshFirst!.crossOrigin).toBe("anonymous");
    expect(freshFirst!.src).toBe("https://stream.example/a");
    expect(freshFirst!.paused).toBe(false);
    expect(first.decks[0].src).toBe("");
    expect(second.isPlainMode()).toBe(false);
    expect(events).toEqual([]);
  });

  it("resumes the context on unlock after an interruption", () => {
    const { engine, contexts } = setup();
    engine.unlock();
    contexts[0]!.moveTo("interrupted");
    engine.unlock();
    expect(contexts[0]!.resume).toHaveBeenCalledTimes(2);
  });
});

describe("createWebAudioEngine: preload, handover, crossfade", () => {
  it("swaps gaplessly to the preloaded deck and listens to it alone", async () => {
    const { engine, decks, events } = setup();
    engine.unlock();
    engine.load("https://stream.example/a", 0, 0);
    await engine.play();
    engine.preload("https://stream.example/b", -2);
    expect(decks[1].src).toBe("https://stream.example/b");
    expect(engine.hasPreload()).toBe(true);
    engine.handover("gapless");
    expect(decks[1].paused).toBe(false);
    expect(decks[0].src).toBe("");
    events.length = 0;
    decks[0].dispatchEvent(new Event("ended"));
    decks[1].currentTime = 3;
    decks[1].dispatchEvent(new Event("timeupdate"));
    expect(events).toEqual([{ type: "time", seconds: 3 }]);
  });

  it("crossfades with equal-power curves and clears the outgoing deck after the fade", async () => {
    const { engine, decks, deckGains, runTimers, events } = setup();
    engine.unlock();
    engine.load("https://stream.example/a", 0, 0);
    await engine.play();
    engine.preload("https://stream.example/b", 0);
    engine.handover({ crossfadeSeconds: 6 });
    const incomingParam = deckGains(1).fade.gain;
    const outgoingParam = deckGains(0).fade.gain;
    const incomingCurve = lastCurve(incomingParam);
    const outgoingCurve = lastCurve(outgoingParam);
    expect(incomingParam.setValueCurveAtTime).toHaveBeenLastCalledWith(
      incomingCurve,
      0,
      6,
    );
    expect(outgoingParam.setValueCurveAtTime).toHaveBeenLastCalledWith(
      outgoingCurve,
      0,
      6,
    );
    expect(incomingCurve[0]).toBe(0);
    expect(incomingCurve[incomingCurve.length - 1]).toBe(1);
    expect(outgoingCurve[0]).toBe(1);
    expect(outgoingCurve[outgoingCurve.length - 1]).toBe(0);
    expect(outgoingCurve).toHaveLength(incomingCurve.length);
    incomingCurve.forEach((incomingLevel, index) => {
      const outgoingLevel = outgoingCurve[index] ?? Number.NaN;
      expect(incomingLevel ** 2 + outgoingLevel ** 2).toBeCloseTo(1, 5);
    });
    expect(decks[0].src).toBe("https://stream.example/a");
    events.length = 0;
    decks[0].dispatchEvent(new Event("ended"));
    expect(events).toEqual([]);
    runTimers();
    expect(decks[0].src).toBe("");
  });

  it("a load during a crossfade silences the outgoing deck at once", async () => {
    const { engine, decks, deckGains, runTimers } = setup();
    engine.unlock();
    engine.load("https://stream.example/a", 0, 0);
    await engine.play();
    engine.preload("https://stream.example/b", 0);
    engine.handover({ crossfadeSeconds: 8 });
    engine.load("https://stream.example/c", 0, 0);
    // A 30 ms ramp to silence (no click), then the deck is cleared.
    expect(
      deckGains(0).fade.gain.linearRampToValueAtTime,
    ).toHaveBeenLastCalledWith(0, 0.03);
    expect(decks[1].src).toBe("https://stream.example/c");
    expect(deckGains(1).fade.gain.value).toBe(1);
    runTimers();
    expect(decks[0].src).toBe("");
  });

  it("a seek during a crossfade brings the incoming deck to full level", async () => {
    const { engine, decks, deckGains, runTimers } = setup();
    engine.unlock();
    engine.load("https://stream.example/a", 0, 0);
    await engine.play();
    engine.preload("https://stream.example/b", 0);
    engine.handover({ crossfadeSeconds: 12 });
    engine.seek(30);
    expect(decks[1].currentTime).toBe(30);
    expect(
      deckGains(1).fade.gain.linearRampToValueAtTime,
    ).toHaveBeenLastCalledWith(1, 0.05);
    expect(
      deckGains(0).fade.gain.linearRampToValueAtTime,
    ).toHaveBeenLastCalledWith(0, 0.03);
    expect(decks[0].src).toBe("https://stream.example/a");
    runTimers();
    expect(decks[0].src).toBe("");
  });

  it("falls back to linear ramps when the browser refuses value curves", async () => {
    const { engine, deckGains } = setup();
    engine.unlock();
    engine.load("https://stream.example/a", 0, 0);
    await engine.play();
    engine.preload("https://stream.example/b", 0);
    const incomingParam = deckGains(1).fade.gain;
    const outgoingParam = deckGains(0).fade.gain;
    for (const param of [incomingParam, outgoingParam])
      param.setValueCurveAtTime.mockImplementation(() => {
        throw new DOMException("curves refused", "NotSupportedError");
      });
    engine.handover({ crossfadeSeconds: 6 });
    expect(incomingParam.setValueAtTime).toHaveBeenLastCalledWith(0, 0);
    expect(incomingParam.linearRampToValueAtTime).toHaveBeenLastCalledWith(
      1,
      6,
    );
    expect(outgoingParam.setValueAtTime).toHaveBeenLastCalledWith(1, 0);
    expect(outgoingParam.linearRampToValueAtTime).toHaveBeenLastCalledWith(
      0,
      6,
    );
  });

  it("clamps the track gain to the spec bounds", () => {
    const { engine, deckGains } = setup();
    engine.unlock();
    engine.load("https://stream.example/a", 0, 40);
    expect(deckGains(0).loudness.gain.value).toBeCloseTo(10 ** (6 / 20));
    engine.preload("https://stream.example/b", -40);
    expect(deckGains(1).loudness.gain.value).toBeCloseTo(10 ** (-12 / 20));
  });

  it("drops a preload whose source fails and says so", () => {
    const { engine, decks, events } = setup();
    engine.preload("https://stream.example/b", 0);
    decks[1].dispatchEvent(new Event("error"));
    expect(engine.hasPreload()).toBe(false);
    expect(events).toEqual([{ type: "preloadFailed" }]);
  });
});

describe("createWebAudioEngine: plain mode", () => {
  it("retries on fresh elements that never reach the graph, and keeps plain once one plays", async () => {
    const { engine, contexts, created, events } = setup();
    engine.unlock();
    expect(engine.enterPlainMode()).toBe(true);
    expect(created).toHaveLength(2);
    expect(created[0]!.crossOrigin).toBeNull();
    engine.load("https://stream.example/a", 0, 0);
    await engine.play();
    created[0]!.dispatchEvent(new Event("playing"));
    expect(events).toEqual([{ type: "plainMode" }, { type: "playing" }]);
    expect(engine.isPlainMode()).toBe(true);
    expect(contexts[0]!.createMediaElementSource).toHaveBeenCalledTimes(2);
    expect(engine.enterPlainMode()).toBe(false);
  });

  it("leaves a plain deck playing when the context is interrupted", async () => {
    const { engine, contexts, created } = setup();
    engine.unlock();
    engine.enterPlainMode();
    engine.load("https://stream.example/a", 0, 0);
    await engine.play();
    created[0]!.dispatchEvent(new Event("playing"));
    expect(contexts[0]!.close).toHaveBeenCalled();
    contexts[0]!.moveTo("interrupted");
    contexts[0]!.moveTo("suspended");
    await flush();
    expect(created[0]!.paused).toBe(false);
    expect(created[0]!.pause).not.toHaveBeenCalled();
  });

  it("goes back to the graph decks when the plain attempt fails too", () => {
    const { engine, decks, created, events } = setup();
    engine.unlock();
    engine.enterPlainMode();
    engine.load("https://stream.example/a", 0, 0);
    created[0]!.dispatchEvent(new Event("error"));
    expect(events).toEqual([{ type: "failed" }]);
    expect(engine.isPlainMode()).toBe(false);
    engine.load("https://stream.example/b", 0, 0);
    expect(decks[0].src).toBe("https://stream.example/b");
  });

  it("plays plain from the start without Web Audio and only attenuates", () => {
    const { engine, decks, events } = setup({ hasWebAudio: false });
    expect(decks[0].crossOrigin).toBeNull();
    engine.unlock();
    expect(events).toEqual([{ type: "plainMode" }]);
    engine.load("https://stream.example/a", 0, 6);
    expect(decks[0].volume).toBe(1);
    engine.load("https://stream.example/a", 0, -6);
    expect(decks[0].volume).toBeCloseTo(10 ** (-6 / 20));
    engine.setMuted(true);
    expect(decks[0].muted).toBe(true);
  });
});

describe("createWebAudioEngine: remote playback", () => {
  it("drops a preload made before a device connects", async () => {
    const { engine, decks, events } = setup();
    engine.unlock();
    engine.load("https://stream.example/a", 0, 0);
    await engine.play();
    engine.preload("https://stream.example/b", 0);
    connectWireless(decks[0]);
    expect(events.at(-1)).toEqual({
      type: "remote",
      state: { isAvailable: false, isConnected: true },
    });
    expect(engine.hasPreload()).toBe(false);
    expect(decks[1].src).toBe("");
    engine.preload("https://stream.example/b", 0);
    expect(engine.hasPreload()).toBe(false);
  });

  it("ends a crossfade in progress when a device connects", async () => {
    const { engine, decks } = setup();
    engine.unlock();
    engine.load("https://stream.example/a", 0, 0);
    await engine.play();
    engine.preload("https://stream.example/b", 0);
    engine.handover({ crossfadeSeconds: 8 });
    expect(decks[0].src).toBe("https://stream.example/a");
    connectWireless(decks[1]);
    expect(decks[0].src).toBe("");
    expect(decks[1].src).toBe("https://stream.example/b");
  });

  it("starts the new elements' remote state from idle and says so", () => {
    const { engine, decks, events } = setup();
    engine.unlock();
    decks[0].dispatchEvent(
      Object.assign(new Event("webkitplaybacktargetavailabilitychanged"), {
        availability: "available",
      }),
    );
    expect(events.at(-1)).toEqual({
      type: "remote",
      state: { isAvailable: true, isConnected: false },
    });
    engine.enterPlainMode();
    expect(events.at(-1)).toEqual({
      type: "remote",
      state: { isAvailable: false, isConnected: false },
    });
  });
});

describe("createWebAudioEngine: sleep fade", () => {
  it("fades out over the time given and reports completion", async () => {
    const { engine, deckGains, runTimers } = setup();
    engine.unlock();
    engine.load("https://stream.example/a", 0, 0);
    const fade = engine.fadeOut(10);
    expect(
      deckGains(0).fade.gain.linearRampToValueAtTime,
    ).toHaveBeenLastCalledWith(0, 10);
    runTimers();
    await expect(fade).resolves.toBe(true);
  });

  it("restores the level when the fade is cancelled", async () => {
    const { engine, deckGains } = setup();
    engine.unlock();
    engine.load("https://stream.example/a", 0, 0);
    const fade = engine.fadeOut(10);
    engine.cancelFadeOut();
    await expect(fade).resolves.toBe(false);
    expect(
      deckGains(0).fade.gain.linearRampToValueAtTime,
    ).toHaveBeenLastCalledWith(1, 0.2);
  });
});
