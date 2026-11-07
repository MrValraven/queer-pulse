import { describe, expect, it, vi } from "vitest";
import {
  startVjMicInput,
  VJ_MIC_PROCESSOR_NAME,
  vjEnvelopeSamplesOf,
  vjMicFailureOf,
  type VjMicEnvironment,
  type VjMicFailure,
  type VjMicInputHandlers,
} from "./vjMicInput";

class FakeTrack {
  readonly stop = vi.fn();
  private readonly listeners = new Set<() => void>();
  addEventListener(name: string, listener: () => void): void {
    if (name === "ended") this.listeners.add(listener);
  }
  removeEventListener(name: string, listener: () => void): void {
    if (name === "ended") this.listeners.delete(listener);
  }
  end(): void {
    for (const listener of this.listeners) listener();
  }
}

interface Fakes {
  environment: VjMicEnvironment;
  tracks: FakeTrack[];
  source: {
    connect: ReturnType<typeof vi.fn>;
    disconnect: ReturnType<typeof vi.fn>;
  };
  contexts: FakeAudioContextShape[];
  nodes: FakeWorkletNodeShape[];
  getUserMedia: ReturnType<typeof vi.fn>;
  addModule: ReturnType<typeof vi.fn>;
}

interface FakeAudioContextShape {
  state: AudioContextState;
  destination: object;
  close: ReturnType<typeof vi.fn>;
  resume: ReturnType<typeof vi.fn>;
}

interface FakeWorkletNodeShape {
  name: string;
  options: AudioWorkletNodeOptions | undefined;
  port: { onmessage: ((event: { data: unknown }) => void) | null };
  connect: ReturnType<typeof vi.fn>;
  disconnect: ReturnType<typeof vi.fn>;
}

function createFakes(): Fakes {
  const tracks = [new FakeTrack(), new FakeTrack()];
  const stream = { getTracks: () => tracks };
  const source = { connect: vi.fn(), disconnect: vi.fn() };
  const contexts: FakeAudioContextShape[] = [];
  const nodes: FakeWorkletNodeShape[] = [];
  const addModule = vi.fn(() => Promise.resolve());
  const getUserMedia = vi.fn(() => Promise.resolve(stream));

  class FakeAudioContext implements FakeAudioContextShape {
    state: AudioContextState = "running";
    readonly destination = { isSpeakers: true };
    readonly audioWorklet = { addModule };
    readonly close = vi.fn(() => {
      this.state = "closed";
      return Promise.resolve();
    });
    readonly resume = vi.fn(() => Promise.resolve());
    readonly createMediaStreamSource = vi.fn(() => source);
    constructor() {
      contexts.push(this);
    }
  }

  class FakeWorkletNode implements FakeWorkletNodeShape {
    readonly name: string;
    readonly options: AudioWorkletNodeOptions | undefined;
    readonly port: FakeWorkletNodeShape["port"] = { onmessage: null };
    readonly connect = vi.fn();
    readonly disconnect = vi.fn();
    constructor(
      _context: unknown,
      name: string,
      options?: AudioWorkletNodeOptions,
    ) {
      this.name = name;
      this.options = options;
      nodes.push(this);
    }
  }

  const environment: VjMicEnvironment = {
    isSecureContext: true,
    mediaDevices: {
      getUserMedia: getUserMedia as unknown as MediaDevices["getUserMedia"],
    },
    AudioContextConstructor:
      FakeAudioContext as unknown as new () => AudioContext,
    AudioWorkletNodeConstructor:
      FakeWorkletNode as unknown as VjMicEnvironment["AudioWorkletNodeConstructor"],
    workletUrl: "/vj-mic-worklet.js",
    gestureTarget: null,
  };
  return {
    environment,
    tracks,
    source,
    contexts,
    nodes,
    getUserMedia,
    addModule,
  };
}

function handlers(): VjMicInputHandlers & {
  onEnvelope: ReturnType<typeof vi.fn>;
  onInterrupted: ReturnType<typeof vi.fn>;
} {
  return { onEnvelope: vi.fn(), onInterrupted: vi.fn() };
}

describe("startVjMicInput", () => {
  it("answers insecure on an insecure origin", async () => {
    const fakes = createFakes();
    const result = await startVjMicInput(handlers(), {
      ...fakes.environment,
      isSecureContext: false,
    });
    expect(result).toEqual({ ok: false, reason: "insecure" });
    expect(fakes.getUserMedia).not.toHaveBeenCalled();
  });

  it("answers notSupported without AudioWorklet", async () => {
    const fakes = createFakes();
    const result = await startVjMicInput(handlers(), {
      ...fakes.environment,
      AudioWorkletNodeConstructor: undefined,
    });
    expect(result).toEqual({ ok: false, reason: "notSupported" });
    expect(fakes.getUserMedia).not.toHaveBeenCalled();
  });

  it("answers notSupported without getUserMedia", async () => {
    const fakes = createFakes();
    const result = await startVjMicInput(handlers(), {
      ...fakes.environment,
      mediaDevices: undefined,
    });
    expect(result).toEqual({ ok: false, reason: "notSupported" });
  });

  it("asks for raw sound with the voice processing off", async () => {
    const fakes = createFakes();
    await startVjMicInput(handlers(), fakes.environment);
    expect(fakes.getUserMedia).toHaveBeenCalledWith({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
      },
    });
  });

  const errorCases: [string, VjMicFailure][] = [
    ["NotAllowedError", "denied"],
    ["SecurityError", "denied"],
    ["NotFoundError", "noDevice"],
    ["OverconstrainedError", "noDevice"],
    ["NotReadableError", "inUse"],
    ["AbortError", "inUse"],
  ];
  it.each(errorCases)("answers %s as %s", async (errorName, failure) => {
    const fakes = createFakes();
    fakes.getUserMedia.mockImplementation(() =>
      Promise.reject(new DOMException("mic", errorName)),
    );
    const result = await startVjMicInput(handlers(), fakes.environment);
    expect(result).toEqual({ ok: false, reason: failure });
    expect(fakes.contexts).toHaveLength(0);
  });

  it("answers workletFailed when addModule rejects", async () => {
    const fakes = createFakes();
    fakes.addModule.mockImplementation(() => Promise.reject(new Error("load")));
    const result = await startVjMicInput(handlers(), fakes.environment);
    expect(result).toEqual({ ok: false, reason: "workletFailed" });
    for (const track of fakes.tracks) expect(track.stop).toHaveBeenCalled();
    expect(fakes.contexts[0]?.close).toHaveBeenCalled();
  });

  it("loads the worklet from the given url and names its processor", async () => {
    const fakes = createFakes();
    await startVjMicInput(handlers(), fakes.environment);
    expect(fakes.addModule).toHaveBeenCalledWith("/vj-mic-worklet.js");
    expect(fakes.nodes[0]?.name).toBe(VJ_MIC_PROCESSOR_NAME);
  });

  it("never connects the graph to the speakers", async () => {
    const fakes = createFakes();
    const result = await startVjMicInput(handlers(), fakes.environment);
    expect(result.ok).toBe(true);
    const node = fakes.nodes[0];
    expect(node?.options?.numberOfOutputs).toBe(0);
    expect(node?.connect).not.toHaveBeenCalled();
    expect(fakes.source.connect).toHaveBeenCalledTimes(1);
    expect(fakes.source.connect).toHaveBeenCalledWith(node);
    expect(fakes.source.connect).not.toHaveBeenCalledWith(
      fakes.contexts[0]?.destination,
    );
  });

  it("hands the worklet batches to onEnvelope", async () => {
    const fakes = createFakes();
    const input = handlers();
    await startVjMicInput(input, fakes.environment);
    const sample = { timeSec: 1.5, rms: 0.2, lowEnergy: 0.01 };
    fakes.nodes[0]?.port.onmessage?.({ data: [sample] });
    expect(input.onEnvelope).toHaveBeenCalledWith([sample]);
  });

  it("calls onInterrupted when the mic track ends on its own", async () => {
    const fakes = createFakes();
    const input = handlers();
    await startVjMicInput(input, fakes.environment);
    fakes.tracks[0]?.end();
    expect(input.onInterrupted).toHaveBeenCalledTimes(1);
  });

  it("stops every track and closes the context on stop", async () => {
    const fakes = createFakes();
    const input = handlers();
    const result = await startVjMicInput(input, fakes.environment);
    if (!result.ok) throw new Error("expected a session");
    result.session.stop();
    result.session.stop();
    for (const track of fakes.tracks) {
      expect(track.stop).toHaveBeenCalledTimes(1);
    }
    expect(fakes.contexts[0]?.close).toHaveBeenCalledTimes(1);
    expect(fakes.nodes[0]?.disconnect).toHaveBeenCalled();
    expect(fakes.nodes[0]?.port.onmessage).toBeNull();
    fakes.tracks[0]?.end();
    expect(input.onInterrupted).not.toHaveBeenCalled();
  });

  it("resumes a suspended context on the next click", async () => {
    const fakes = createFakes();
    const gestureTarget = new EventTarget();
    const result = await startVjMicInput(handlers(), {
      ...fakes.environment,
      gestureTarget,
    });
    if (!result.ok) throw new Error("expected a session");
    const context = fakes.contexts[0];
    if (context === undefined) throw new Error("expected a context");
    context.state = "suspended";
    gestureTarget.dispatchEvent(new Event("pointerdown"));
    expect(context.resume).toHaveBeenCalled();
  });
});

describe("vjMicFailureOf", () => {
  it("reads an unnamed error as notSupported", () => {
    expect(vjMicFailureOf("broken")).toBe("notSupported");
    expect(vjMicFailureOf(new TypeError("constraints"))).toBe("notSupported");
  });
});

describe("vjEnvelopeSamplesOf", () => {
  it("drops malformed entries", () => {
    expect(
      vjEnvelopeSamplesOf([
        { timeSec: 1, rms: 0.1, lowEnergy: 0.01 },
        { timeSec: "1", rms: 0.1, lowEnergy: 0.01 },
        { timeSec: 2, rms: Number.NaN, lowEnergy: 0.01 },
        null,
      ]),
    ).toEqual([{ timeSec: 1, rms: 0.1, lowEnergy: 0.01 }]);
    expect(vjEnvelopeSamplesOf("noise")).toEqual([]);
  });
});
