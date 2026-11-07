import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { VjActionDispatch } from "../input/vjRemoteAction";
import { useVjMidi, type UseVjMidiOptions } from "./useVjMidi";
import type { VjMidiMapping } from "./vjMidiMappings";
import type { VjMidiEvent } from "./vjMidiMessage";

type MidiListener = (event: { data: Uint8Array | null }) => void;

/** A stand-in for one MIDI input port that records its listeners. */
function createFakeInput(id: string, name: string | null = "Pad Controller") {
  const listeners = new Set<MidiListener>();
  const input = {
    id,
    name,
    manufacturer: null,
    state: "connected" as "connected" | "disconnected",
    addEventListener: vi.fn((type: string, listener: MidiListener) => {
      if (type === "midimessage") listeners.add(listener);
    }),
    removeEventListener: vi.fn((type: string, listener: MidiListener) => {
      if (type === "midimessage") listeners.delete(listener);
    }),
    send(bytes: number[]) {
      for (const listener of [...listeners]) {
        listener({ data: Uint8Array.from(bytes) });
      }
    },
    listenerCount: () => listeners.size,
  };
  return input;
}

type FakeInput = ReturnType<typeof createFakeInput>;

function createFakeAccess(inputs: FakeInput[]) {
  const stateListeners = new Set<() => void>();
  const inputMap = new Map(inputs.map((input) => [input.id, input]));
  return {
    inputs: inputMap,
    addEventListener: vi.fn((type: string, listener: () => void) => {
      if (type === "statechange") stateListeners.add(listener);
    }),
    removeEventListener: vi.fn((type: string, listener: () => void) => {
      if (type === "statechange") stateListeners.delete(listener);
    }),
    fireStateChange() {
      for (const listener of [...stateListeners]) listener();
    },
  };
}

function installRequestMidiAccess(implementation: () => Promise<unknown>) {
  const requestMIDIAccess = vi.fn(implementation);
  Object.defineProperty(navigator, "requestMIDIAccess", {
    configurable: true,
    writable: true,
    value: requestMIDIAccess,
  });
  return requestMIDIAccess;
}

function removeRequestMidiAccess() {
  Reflect.deleteProperty(navigator, "requestMIDIAccess");
}

const padMapping: VjMidiMapping = {
  controlKey: "note:1:36",
  target: { kind: "pad", padId: "strobe" },
};
const padKnobMapping: VjMidiMapping = {
  controlKey: "cc:1:20",
  target: { kind: "pad", padId: "strobe" },
};

function renderMidi(overrides: Partial<UseVjMidiOptions> = {}) {
  const dispatch = vi.fn<VjActionDispatch>();
  const onLearnEvent = vi.fn<(event: VjMidiEvent) => void>();
  const view = renderHook((props: UseVjMidiOptions) => useVjMidi(props), {
    initialProps: {
      mappings: [padMapping],
      dispatch,
      onLearnEvent,
      isLearning: false,
      ...overrides,
    },
  });
  return { ...view, dispatch, onLearnEvent };
}

async function turnOn(result: { current: ReturnType<typeof useVjMidi> }) {
  await act(async () => {
    result.current.request();
    await Promise.resolve();
  });
}

afterEach(() => {
  removeRequestMidiAccess();
  vi.restoreAllMocks();
});

describe("useVjMidi", () => {
  it("reads unsupported where Web MIDI is missing", () => {
    removeRequestMidiAccess();
    const { result } = renderMidi();
    expect(result.current.availability).toBe("unsupported");
    act(() => result.current.request());
    expect(result.current.availability).toBe("unsupported");
  });

  it("turns on and lists inputs", async () => {
    const input = createFakeInput("input-1", "Launch Pad");
    const requestMIDIAccess = installRequestMidiAccess(() =>
      Promise.resolve(createFakeAccess([input])),
    );
    const { result } = renderMidi();
    expect(result.current.availability).toBe("idle");
    expect(requestMIDIAccess).not.toHaveBeenCalled();
    await turnOn(result);
    expect(requestMIDIAccess).toHaveBeenCalledWith({ sysex: false });
    expect(result.current.availability).toBe("ready");
    expect(result.current.inputs).toEqual([
      { id: "input-1", name: "Launch Pad" },
    ]);
    expect(input.listenerCount()).toBe(1);
  });

  it("reads denied on NotAllowedError", async () => {
    installRequestMidiAccess(() =>
      Promise.reject(new DOMException("blocked", "NotAllowedError")),
    );
    const { result } = renderMidi();
    await turnOn(result);
    expect(result.current.availability).toBe("denied");
  });

  it("reads noDevices with no inputs", async () => {
    installRequestMidiAccess(() => Promise.resolve(createFakeAccess([])));
    const { result } = renderMidi();
    await turnOn(result);
    expect(result.current.availability).toBe("noDevices");
    expect(result.current.inputs).toEqual([]);
  });

  it("dispatches a mapped note as a pad press and release", async () => {
    const input = createFakeInput("input-1");
    installRequestMidiAccess(() => Promise.resolve(createFakeAccess([input])));
    const { result, dispatch } = renderMidi();
    await turnOn(result);
    act(() => input.send([0x90, 36, 100]));
    expect(dispatch).toHaveBeenLastCalledWith(
      { kind: "pad", padId: "strobe" },
      "press",
    );
    act(() => input.send([0x80, 36, 0]));
    expect(dispatch).toHaveBeenLastCalledWith(
      { kind: "pad", padId: "strobe" },
      "release",
    );
    expect(dispatch).toHaveBeenCalledTimes(2);
  });

  it("a knob turning above 64 presses the pad once", async () => {
    const input = createFakeInput("input-1");
    installRequestMidiAccess(() => Promise.resolve(createFakeAccess([input])));
    const { result, dispatch } = renderMidi({ mappings: [padKnobMapping] });
    await turnOn(result);
    act(() => {
      input.send([0xb0, 20, 70]);
      input.send([0xb0, 20, 80]);
      input.send([0xb0, 20, 90]);
    });
    expect(dispatch).toHaveBeenCalledTimes(1);
    act(() => input.send([0xb0, 20, 10]));
    expect(dispatch).toHaveBeenLastCalledWith(
      { kind: "pad", padId: "strobe" },
      "release",
    );
    expect(dispatch).toHaveBeenCalledTimes(2);
  });

  it("releases a held pad whose mapping is removed mid-hold", async () => {
    const input = createFakeInput("input-1");
    installRequestMidiAccess(() => Promise.resolve(createFakeAccess([input])));
    const { result, dispatch, rerender, onLearnEvent } = renderMidi();
    await turnOn(result);
    act(() => input.send([0x90, 36, 100]));
    rerender({ mappings: [], dispatch, onLearnEvent, isLearning: false });
    act(() => input.send([0x80, 36, 0]));
    expect(dispatch).toHaveBeenLastCalledWith(
      { kind: "pad", padId: "strobe" },
      "release",
    );
    expect(dispatch).toHaveBeenCalledTimes(2);
  });

  it("releases the held pad when its mapping moves to another pad mid-hold", async () => {
    const input = createFakeInput("input-1");
    installRequestMidiAccess(() => Promise.resolve(createFakeAccess([input])));
    const { result, dispatch, rerender, onLearnEvent } = renderMidi();
    await turnOn(result);
    act(() => input.send([0x90, 36, 100]));
    rerender({
      mappings: [
        { controlKey: "note:1:36", target: { kind: "pad", padId: "invert" } },
      ],
      dispatch,
      onLearnEvent,
      isLearning: false,
    });
    act(() => input.send([0x80, 36, 0]));
    expect(dispatch).toHaveBeenLastCalledWith(
      { kind: "pad", padId: "strobe" },
      "release",
    );
    expect(dispatch).toHaveBeenCalledTimes(2);
  });

  it("releases a knob-held pad when its mapping is removed mid-hold", async () => {
    const input = createFakeInput("input-1");
    installRequestMidiAccess(() => Promise.resolve(createFakeAccess([input])));
    const { result, dispatch, rerender, onLearnEvent } = renderMidi({
      mappings: [padKnobMapping],
    });
    await turnOn(result);
    act(() => input.send([0xb0, 20, 90]));
    rerender({ mappings: [], dispatch, onLearnEvent, isLearning: false });
    // Still above 64: the pad stays held.
    act(() => input.send([0xb0, 20, 80]));
    expect(dispatch).toHaveBeenCalledTimes(1);
    act(() => input.send([0xb0, 20, 10]));
    expect(dispatch).toHaveBeenLastCalledWith(
      { kind: "pad", padId: "strobe" },
      "release",
    );
    expect(dispatch).toHaveBeenCalledTimes(2);
  });

  it("releases a held pad when its device disconnects", async () => {
    const input = createFakeInput("input-1");
    const access = createFakeAccess([input]);
    installRequestMidiAccess(() => Promise.resolve(access));
    const { result, dispatch } = renderMidi();
    await turnOn(result);
    act(() => input.send([0x90, 36, 100]));
    input.state = "disconnected";
    act(() => access.fireStateChange());
    expect(dispatch).toHaveBeenLastCalledWith(
      { kind: "pad", padId: "strobe" },
      "release",
    );
    expect(result.current.availability).toBe("noDevices");
    expect(input.listenerCount()).toBe(0);
  });

  it("releases a held pad when the page hides", async () => {
    const input = createFakeInput("input-1");
    installRequestMidiAccess(() => Promise.resolve(createFakeAccess([input])));
    const { result, dispatch } = renderMidi();
    await turnOn(result);
    act(() => input.send([0x90, 36, 100]));
    const visibility = vi
      .spyOn(document, "visibilityState", "get")
      .mockReturnValue("hidden");
    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
    });
    visibility.mockRestore();
    expect(dispatch).toHaveBeenLastCalledWith(
      { kind: "pad", padId: "strobe" },
      "release",
    );
    // The note off that follows releases nothing a second time.
    act(() => input.send([0x80, 36, 0]));
    expect(dispatch).toHaveBeenCalledTimes(2);
  });

  it("hands messages to learn while learning and dispatches nothing", async () => {
    const input = createFakeInput("input-1");
    installRequestMidiAccess(() => Promise.resolve(createFakeAccess([input])));
    const { result, dispatch, onLearnEvent } = renderMidi({
      isLearning: true,
    });
    await turnOn(result);
    act(() => input.send([0x90, 36, 100]));
    expect(onLearnEvent).toHaveBeenCalledWith({
      kind: "noteOn",
      channel: 1,
      note: 36,
      velocity: 100,
    });
    expect(dispatch).not.toHaveBeenCalled();
  });

  it("drops listeners on unmount", async () => {
    const input = createFakeInput("input-1");
    const access = createFakeAccess([input]);
    installRequestMidiAccess(() => Promise.resolve(access));
    const { result, unmount } = renderMidi();
    await turnOn(result);
    expect(input.listenerCount()).toBe(1);
    unmount();
    expect(input.listenerCount()).toBe(0);
    expect(access.removeEventListener).toHaveBeenCalledWith(
      "statechange",
      expect.any(Function),
    );
  });
});
