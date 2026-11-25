import { afterEach, describe, expect, it, vi } from "vitest";
import { previewMessageChime, runningChimeCueOutput } from "./messageChime";

/** A Web Audio node stub that records what it connects to. */
interface FakeNode {
  kind: string;
  connections: FakeNode[];
  connect: (target: FakeNode) => void;
  gain: {
    value: number;
    setValueAtTime: () => void;
    exponentialRampToValueAtTime: () => void;
  };
  frequency: { value: number; setValueAtTime: () => void };
  delayTime: { value: number };
  type: string;
  start: () => void;
  stop: () => void;
}

function fakeNode(kind: string): FakeNode {
  const node: FakeNode = {
    kind,
    connections: [],
    connect: (target) => {
      node.connections.push(target);
    },
    gain: {
      value: 1,
      setValueAtTime: () => undefined,
      exponentialRampToValueAtTime: () => undefined,
    },
    frequency: { value: 0, setValueAtTime: () => undefined },
    delayTime: { value: 0 },
    type: "",
    start: () => undefined,
    stop: () => undefined,
  };
  return node;
}

const createdNodes: FakeNode[] = [];
const destination = fakeNode("destination");

class FakeAudioContext {
  state = "running";
  currentTime = 0;
  destination = destination;
  resume = () => Promise.resolve();
  private track(kind: string) {
    const node = fakeNode(kind);
    createdNodes.push(node);
    return node;
  }
  createGain = () => this.track("gain");
  createDynamicsCompressor = () => this.track("compressor");
  createBiquadFilter = () => this.track("lowpass");
  createDelay = () => this.track("delay");
  createOscillator = () => this.track("oscillator");
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("runningChimeCueOutput", () => {
  it("builds a second chain ending in a tail, and leaves the message chime's chain on the speakers", () => {
    vi.stubGlobal("AudioContext", FakeAudioContext);
    previewMessageChime();
    const lowpassesToSpeakers = createdNodes.filter(
      (node) =>
        node.kind === "lowpass" && node.connections.includes(destination),
    );
    // The message chime's own output lowpass still feeds the speakers.
    expect(lowpassesToSpeakers).toHaveLength(1);

    const output = runningChimeCueOutput();
    if (output === null)
      throw new Error("The running context gives a cue output");
    const tail = output.tail as unknown as FakeNode;
    const lowpassesToTail = createdNodes.filter(
      (node) => node.kind === "lowpass" && node.connections.includes(tail),
    );
    expect(lowpassesToTail).toHaveLength(1);
    // The tail waits for the caller's own stage: it reaches the speakers through nothing yet.
    expect(tail.connections).toHaveLength(0);
    // Built once per context.
    expect(runningChimeCueOutput()).toBe(output);
  });
});
