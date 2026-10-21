import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createAudioGraph } from "../studioAudioGraph";
import {
  FLAT_EQUALIZER_GAINS,
  STUDIO_EQUALIZER_KEY,
  writeEqualizerGains,
} from "../studioPlayerPreferences";

class FakeParam {
  value = 1;
  cancelScheduledValues = vi.fn();
  setValueAtTime = vi.fn((level: number) => {
    this.value = level;
  });
  linearRampToValueAtTime = vi.fn((level: number) => {
    this.value = level;
  });
}

function createFakeNode(kind: string) {
  return {
    kind,
    gain: new FakeParam(),
    frequency: new FakeParam(),
    Q: new FakeParam(),
    type: "",
    connect: vi.fn(),
    disconnect: vi.fn(),
  };
}

type FakeNode = ReturnType<typeof createFakeNode>;

function createFakeContext() {
  const gains: FakeNode[] = [];
  const filters: FakeNode[] = [];
  const context = {
    currentTime: 0,
    state: "running",
    destination: { kind: "destination" },
    createGain: vi.fn(() => {
      const node = createFakeNode("gain");
      gains.push(node);
      return node;
    }),
    createBiquadFilter: vi.fn(() => {
      const node = createFakeNode("filter");
      filters.push(node);
      return node;
    }),
    close: vi.fn(() => Promise.resolve()),
    addEventListener: vi.fn(),
  };
  return { context, gains, filters };
}

beforeEach(() => {
  vi.useFakeTimers();
  writeEqualizerGains(FLAT_EQUALIZER_GAINS);
});

afterEach(() => {
  vi.useRealTimers();
  window.localStorage.removeItem(STUDIO_EQUALIZER_KEY);
});

describe("the equaliser stage", () => {
  it("adds no nodes while flat", () => {
    const { context, gains } = createFakeContext();
    const graph = createAudioGraph(context as unknown as AudioContext);
    expect(context.createBiquadFilter).not.toHaveBeenCalled();
    // The master gain only.
    expect(gains).toHaveLength(1);
    expect(gains[0]?.connect).toHaveBeenCalledWith(context.destination);
    graph?.close();
  });

  it("routes the master through five filters for a curve", () => {
    const { context, gains, filters } = createFakeContext();
    const graph = createAudioGraph(context as unknown as AudioContext);
    writeEqualizerGains([5, 2, 0, 0, 0]);
    const [master, preamp] = gains;
    expect(filters).toHaveLength(5);
    expect(master?.disconnect).toHaveBeenCalled();
    expect(master?.connect).toHaveBeenLastCalledWith(preamp);
    expect(filters[4]?.connect).toHaveBeenCalledWith(context.destination);
    expect(filters[0]?.gain.value).toBe(5);
    graph?.close();
  });

  it("takes the filters out once a reset has ramped to flat", () => {
    const { context, gains, filters } = createFakeContext();
    const graph = createAudioGraph(context as unknown as AudioContext);
    writeEqualizerGains([3, 1, 0, -1, -2]);
    writeEqualizerGains(FLAT_EQUALIZER_GAINS);
    const [master] = gains;
    // Still routed while the gains ramp to unity.
    expect(master?.connect).not.toHaveBeenLastCalledWith(context.destination);
    vi.advanceTimersByTime(200);
    expect(master?.connect).toHaveBeenLastCalledWith(context.destination);
    filters.forEach((filter) => expect(filter.disconnect).toHaveBeenCalled());
    graph?.close();
  });
});
